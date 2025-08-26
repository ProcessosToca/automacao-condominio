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
  resetPasswordWithEmail: (email: string) => Promise<{ error?: any; newPassword?: string }>;
  updateProfile: (fullName: string, email: string, phone?: string, cpf?: string) => Promise<{ error?: any }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: any }>;
  getAllUsers: () => Promise<{ data?: User[]; error?: any }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ error?: any }>;
  isAdmin: () => boolean;
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
      const { data, error } = await supabase.rpc('verify_user_credentials', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      const response = data as any;
      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('app_user', JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: { message: response.error || 'Credenciais inválidas' } };
      }
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
      const { data, error } = await supabase.rpc('create_direct_user', {
        p_email: email,
        p_password: password,
        p_full_name: fullName,
        p_phone: phone || '',
        p_role: 'user'
      });

      if (error) throw error;

      const response = data as any;
      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        localStorage.setItem('app_user', JSON.stringify(userData));
        return { error: null };
      } else {
        return { error: { message: response.error || 'Erro ao criar usuário' } };
      }
    } catch (error) {
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

      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;

      const response = data as any;
      if (response.success && response.users) {
        return { data: response.users as User[] };
      } else {
        return { error: { message: response.error || 'Erro ao buscar usuários' } };
      }
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
      const { data: targetUserData, error: targetUserError } = await supabase.rpc('get_user_by_id', { p_user_id: userId });
      if (targetUserError) throw targetUserError;
      
      const targetUserResponse = targetUserData as any;
      if (targetUserResponse.success && targetUserResponse.user?.role === 'admin') {
        return { error: { message: 'Não é possível editar outros administradores.' } };
      }

      const { data, error } = await supabase.rpc('update_user_by_admin', {
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