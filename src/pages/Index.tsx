// Update this page (the content is just a fallback if you fail to update the page)

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Sistema!</h1>
          <p className="text-xl text-muted-foreground mb-6">Você está logado com sucesso.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sistema de Gestão</CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              Acesso restrito para usuários autenticados
            </p>
          </div>
          
          <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
