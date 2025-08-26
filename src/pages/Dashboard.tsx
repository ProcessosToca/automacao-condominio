import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Phone, Mail, Shield, Settings, CreditCard, Users, Loader2 } from 'lucide-react';
import { EditProfile } from '@/components/EditProfile';
import { ChangePassword } from '@/components/ChangePassword';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut, getAdminStats } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [adminStats, setAdminStats] = useState({
    activeUsers: 0,
    newUsers: 0,
    reports: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Carregar estatísticas do admin
  useEffect(() => {
    const loadAdminStats = async () => {
      if (user?.role === 'admin') {
        setLoadingStats(true);
        try {
          const { data, error } = await getAdminStats();
          if (data) {
            setAdminStats(data);
          }
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    loadAdminStats();
  }, [user, getAdminStats]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Sistema de Gestão</h1>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.full_name}
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                  <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome Completo
                  </label>
                  <p className="text-lg">{user.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.cpf && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      CPF
                    </label>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p>{user.cpf}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Perfil de Acesso
                  </label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status da Conta
                  </label>
                  <Badge variant="default">
                    Ativa
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Usuário cadastrado
                  </label>
                  <p className="text-sm">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* User Actions - Only for non-admin users */}
              {user.role !== 'admin' && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="flex-1"
                    >
                      Editar Perfil
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="flex-1"
                    >
                      Alterar Senha
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Only for Admins */}
          {user.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => navigate('/users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                </Button>
                <Button className="w-full" variant="outline">
                  Relatórios
                </Button>
                <Button className="w-full" variant="outline">
                  Configurações do Sistema
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Section */}
        {user.role === 'admin' && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Painel do Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    {loadingStats ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{adminStats.activeUsers}</h3>
                    )}
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    {loadingStats ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{adminStats.newUsers}</h3>
                    )}
                    <p className="text-sm text-muted-foreground">Novos Usuários (30 dias)</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    {loadingStats ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">{adminStats.reports}</h3>
                    )}
                    <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      <EditProfile 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
      
      <ChangePassword 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;