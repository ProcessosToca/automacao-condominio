import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationCodeProps {
  email: string;
  type: 'email_confirmation' | 'password_reset';
  onVerified: () => void;
  onBack: () => void;
}

export const VerificationCode: React.FC<VerificationCodeProps> = ({
  email,
  type,
  onVerified,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast({
        title: "Erro",
        description: "O código deve ter 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_code', {
        p_email: email,
        p_code: code,
        p_type: type
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Sucesso",
          description: "Código verificado com sucesso!",
        });
        onVerified();
      } else {
        toast({
          title: "Erro",
          description: "Código inválido ou expirado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);

    try {
      const response = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          type
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Código reenviado",
        description: "Um novo código foi enviado para seu email",
      });

      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setCode('');
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const title = type === 'email_confirmation' ? 
    'Confirme sua conta' : 
    'Redefinir senha';
  
  const description = type === 'email_confirmation' ? 
    'Digite o código de 6 dígitos enviado para seu email para confirmar sua conta.' :
    'Digite o código de 6 dígitos enviado para seu email para redefinir sua senha.';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <p className="text-sm text-muted-foreground">
          Enviado para: <strong>{email}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              disabled={loading}
            />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {timeLeft > 0 ? (
              <p>Código expira em: <strong>{formatTime(timeLeft)}</strong></p>
            ) : (
              <p className="text-destructive">Código expirado</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </Button>
        </form>

        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={resendLoading || !canResend}
            className="w-full"
          >
            {resendLoading ? "Reenviando..." : "Reenviar código"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};