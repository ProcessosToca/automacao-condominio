import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  cpf?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  resetPasswordWithEmail: (email: string) => Promise<{ success: boolean; newPassword?: string; message?: string }>;
  updateProfile: (fullName: string, email: string, phone?: string, cpf?: string) => Promise<{ error?: any }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: any }>;
  getAllUsers: () => Promise<{ data?: User[]; error?: any }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ error?: any }>;
  isAdmin: () => boolean;
  getAdminStats: () => Promise<{ data?: { activeUsers: number; newUsers: number; reports: number }; error?: any }>;
  deleteUser: (userId: string) => Promise<{ error?: any }>;
  deactivateUser: (userId: string) => Promise<{ error?: any }>;
  activateUser: (userId: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('app_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: authError };
      }

      const authUser = authData.user;
      if (!authUser) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      // Buscar perfil no profiles usando id (que é a chave primária)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && (profileError as any).code !== 'PGRST116') {
        // Erro real ao consultar perfil
        return { error: profileError };
      }

      let ensuredProfile = profile as any;

      // Se não existir perfil, cria padrão
      if (!ensuredProfile) {
        const defaultProfile = {
          id: authUser.id, // id é a chave primária e deve ser igual ao auth.users.id
          email: authUser.email,
          full_name: (authUser.user_metadata && (authUser.user_metadata.full_name as string)) || 'Usuário',
          phone: (authUser.user_metadata && (authUser.user_metadata.phone as string)) || null,
          role: 'user',
          is_active: true,
        } as any;

        const { data: upserted, error: upsertError } = await supabase
          .from('profiles')
          .upsert(defaultProfile)
          .select('*')
          .single();

        if (upsertError) {
          return { error: upsertError };
        }
        ensuredProfile = upserted as any;
      }

      // Bloquear login se usuário estiver inativo
      if (ensuredProfile && ensuredProfile.is_active === false) {
        await supabase.auth.signOut();
        return { error: { message: 'Usuário desativado. Contate o administrador.' } };
      }

      const userData: User = {
        id: ensuredProfile.id || authUser.id,
        email: ensuredProfile.email || authUser.email || '',
        full_name: ensuredProfile.full_name || 'Usuário',
        phone: ensuredProfile.phone || undefined,
        cpf: ensuredProfile.cpf || undefined,
        role: (ensuredProfile.role as 'admin' | 'user') || 'user',
      };

      setUser(userData);
      localStorage.setItem('app_user', JSON.stringify(userData));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    phone?: string
  ) => {
    try {
      // Primeiro, verificar se o usuário já existe
      try {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single();

        if (existingUser) {
          return { error: { message: 'Usuário já existe com este email' } };
        }
      } catch (error) {
        // Se não encontrar, continuar com o signup
        console.log('Usuário não encontrado, continuando com signup...');
      }

      // Fazer signup no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
          },
        },
      });

      if (error) {
        return { error };
      }

      const newUser = data.user;

      if (newUser) {
        // Aguardar um pouco para o trigger processar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o profile foi criado pelo trigger
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newUser.id)
          .single();

        if (profileError || !profile) {
          // Se o trigger falhou, criar manualmente
          const upsertProfile = {
            id: newUser.id, // id deve ser igual ao auth.users.id
            email: newUser.email,
            full_name: fullName,
            phone: phone || null,
            role: 'user',
            is_active: true,
          } as any;

          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(upsertProfile);

          if (upsertError) {
            console.error('Erro ao criar profile manualmente:', upsertError);
            // Não retornar erro aqui, pois o usuário foi criado no auth
          }
        }
      }

      // Não efetua login automático; usuário poderá fazer login após cadastro
      return { error: null };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('app_user');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Simplified version - just return success for now
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPasswordWithEmail = async (email: string): Promise<{ success: boolean; newPassword?: string; message?: string }> => {
    try {
      setLoading(true);
      
      // Gerar nova senha diretamente via RPC
      const { data: resetData, error: resetError } = await supabase.rpc('generate_and_update_password', {
        p_email: email
      });

      if (resetError) {
        console.error('Erro ao gerar nova senha:', resetError);
        throw new Error('Erro ao gerar nova senha');
      }

      const resetResponse = resetData as any;
      if (resetResponse?.error) {
        throw new Error(resetResponse.error);
      }

      const newPassword = resetResponse?.new_password;
      
      if (!newPassword) {
        throw new Error('Nova senha não foi gerada');
      }

      // Enviar email via Supabase Auth (usando o template configurado)
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Mesmo que o email falhe, a senha foi gerada
        return {
          success: true,
          newPassword,
          message: 'Nova senha gerada! Use esta senha para fazer login.'
        };
      }

      // Email enviado com sucesso
      return {
        success: true,
        newPassword,
        message: 'Nova senha enviada para seu email!'
      };

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName: string, email: string, phone?: string, cpf?: string) => {
    try {
      if (!user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_full_name: fullName,
        p_email: email,
        p_phone: phone || null,
        p_cpf: cpf || null
      });

      if (error) throw error;

      const response = data as any;
      if (response.success && response.user) {
        const updatedUser = response.user;
        setUser(updatedUser);
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao atualizar perfil' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      // First verify current password
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_credentials', {
        p_email: user.email,
        p_password: currentPassword
      });

      if (verifyError) throw verifyError;

      const verifyResponse = verifyData as any;
      if (!verifyResponse.success) {
        return { error: { message: 'Senha atual incorreta' } };
      }

      // Update password
      const { data, error } = await supabase.rpc('update_user_password_by_id', {
        p_user_id: user.id,
        p_new_password: newPassword
      });

      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao atualizar senha' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const getAllUsers = async () => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' } };
      }
      // Tenta buscar todos os usuários (ativos e inativos). Se a função nova não existir, faz fallback.
      let response: any;
      try {
        const { data, error } = await (supabase as any).rpc('get_all_users_full');
        if (error) throw error;
        response = data;
      } catch (_) {
        const { data, error } = await (supabase as any).rpc('get_all_users');
        if (error) throw error;
        response = data;
      }

      if (response.success && (response.users || response.all_users)) {
        const users = (response.users || response.all_users) as User[];
        return { data: users };
      }
      return { error: { message: response?.error || 'Erro ao buscar usuários' } };
    } catch (error) {
      return { error };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem editar usuários.' } };
      }

      // Prevent admin from editing other admins
      const { data: targetUserData, error: targetUserError } = await (supabase as any).rpc('get_user_by_id', { p_user_id: userId });
      if (targetUserError) throw targetUserError;
      
      const targetUserResponse = targetUserData as any;
      if (targetUserResponse.success && targetUserResponse.user?.role === 'admin') {
        return { error: { message: 'Não é possível editar outros administradores.' } };
      }

      const { data, error } = await (supabase as any).rpc('update_user_by_admin', {
        p_user_id: userId,
        p_full_name: updates.full_name,
        p_email: updates.email,
        p_phone: updates.phone || null,
        p_cpf: updates.cpf || null
      });

      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao atualizar usuário' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const getAdminStats = async () => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' } };
      }

      const { data, error } = await (supabase as any).rpc('get_admin_stats');
      
      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { 
          data: {
            activeUsers: response.stats.active_users || 0,
            newUsers: response.stats.new_users || 0,
            reports: response.stats.reports || 0
          }
        };
      } else {
        return { error: { message: response.error || 'Erro ao buscar estatísticas' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem excluir usuários.' } };
      }

      // Impedir exclusão de administradores
      const { data: targetUserData, error: targetUserError } = await (supabase as any).rpc('get_user_by_id', { p_user_id: userId });
      if (targetUserError) throw targetUserError;

      const targetUserResponse = targetUserData as any;
      if (targetUserResponse.success && targetUserResponse.user?.role === 'admin') {
        return { error: { message: 'Não é possível excluir administradores.' } };
      }

      const { data, error } = await (supabase as any).rpc('delete_user_by_admin', { p_user_id: userId });
      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao excluir usuário' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem desativar usuários.' } };
      }

      const { data: targetUserData, error: targetUserError } = await (supabase as any).rpc('get_user_by_id', { p_user_id: userId });
      if (targetUserError) throw targetUserError;

      const targetUserResponse = targetUserData as any;
      if (targetUserResponse.success && targetUserResponse.user?.role === 'admin') {
        return { error: { message: 'Não é possível desativar administradores.' } };
      }

      const { data, error } = await (supabase as any).rpc('deactivate_user_by_admin', { p_user_id: userId });
      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao desativar usuário' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const activateUser = async (userId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { error: { message: 'Acesso negado. Apenas administradores podem ativar usuários.' } };
      }

      const { data: targetUserData, error: targetUserError } = await (supabase as any).rpc('get_user_by_id', { p_user_id: userId });
      if (targetUserError) throw targetUserError;

      const targetUserResponse = targetUserData as any;
      if (targetUserResponse.success && targetUserResponse.user?.role === 'admin') {
        // Admin já é ativo por definição; manter regra consistente
        return { error: { message: 'Ação inválida para administradores.' } };
      }

      const { data, error } = await (supabase as any).rpc('activate_user_by_admin', { p_user_id: userId });
      if (error) throw error;

      const response = data as any;
      if (response.success) {
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao ativar usuário' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resetPasswordWithEmail,
    updateProfile,
    updatePassword,
    getAllUsers,
    updateUser,
    isAdmin,
    getAdminStats,
    deleteUser,
    deactivateUser,
    activateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};