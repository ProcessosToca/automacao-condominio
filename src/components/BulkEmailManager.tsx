import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailStats {
  nao_enviado: number;
  aguardando_retorno: number;
  enviado: number;
  erro_no_envio: number;
  total: number;
}

interface ProcessResult {
  occurrenceId: string;
  email: string;
  status: 'success' | 'error';
  message: string;
}

interface BulkProcessResult {
  success: boolean;
  message: string;
  processed: number;
  results: ProcessResult[];
  testMode: boolean;
}

const BulkEmailManager = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<BulkProcessResult | null>(null);
  const [testMode, setTestMode] = useState(true);
  const [emailLimit, setEmailLimit] = useState(10);

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Buscar estatísticas das ocorrências
      const { data: occurrences, error } = await supabase
        .from('occurrences')
        .select('email_status');

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        toast.error('Erro ao carregar estatísticas');
        return;
      }

      const stats: EmailStats = {
        nao_enviado: 0,
        aguardando_retorno: 0,
        enviado: 0,
        erro_no_envio: 0,
        total: occurrences?.length || 0
      };

      occurrences?.forEach(occurrence => {
        const status = occurrence.email_status || 'Não enviado';
        switch (status) {
          case 'Não enviado':
            stats.nao_enviado++;
            break;
          case 'Aguardando Retorno':
            stats.aguardando_retorno++;
            break;
          case 'Enviado':
            stats.enviado++;
            break;
          case 'Erro no Envio':
            stats.erro_no_envio++;
            break;
        }
      });

      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      setLastResult(null);

      toast.info(`Iniciando processamento de ${emailLimit} emails...`);

      const { data, error } = await supabase.functions.invoke('send-bulk-emails', {
        body: {
          limit: emailLimit,
          testMode: testMode
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        toast.error('Erro ao processar emails');
        return;
      }

      setLastResult(data);
      
      if (data.success) {
        toast.success(`Processamento concluído: ${data.processed} emails processados`);
        // Recarregar estatísticas após processamento
        await loadStats();
      } else {
        toast.error('Erro no processamento de emails');
      }

    } catch (error) {
      console.error('Erro ao processar emails:', error);
      toast.error('Erro ao processar emails');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetErrorStatus = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('occurrences')
        .update({
          email_status: 'Não enviado',
          email_sent_at: null,
          email_error: null
        })
        .eq('email_status', 'Erro no Envio');

      if (error) {
        console.error('Erro ao resetar status:', error);
        toast.error('Erro ao resetar status');
        return;
      }

      toast.success('Status de emails com erro resetado com sucesso');
      await loadStats();
    } catch (error) {
      console.error('Erro ao resetar status:', error);
      toast.error('Erro ao resetar status');
    } finally {
      setIsLoading(false);
    }
  };

  const runPythonScript = async () => {
    try {
      setIsProcessing(true);
      setLastResult(null);

      toast.info('Executando script Python...');

      // Simular execução do script Python
      // Em um ambiente real, você chamaria uma API ou Edge Function
      const { data, error } = await supabase.functions.invoke('send-bulk-emails', {
        body: {
          limit: emailLimit,
          testMode: testMode,
          usePythonTemplate: true
        }
      });

      if (error) {
        console.error('Erro na execução do script:', error);
        toast.error('Erro ao executar script Python');
        return;
      }

      setLastResult(data);
      
      if (data.success) {
        toast.success(`Script Python executado: ${data.processed} emails processados`);
        await loadStats();
      } else {
        toast.error('Erro na execução do script Python');
      }

    } catch (error) {
      console.error('Erro ao executar script Python:', error);
      toast.error('Erro ao executar script Python');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Não enviado':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Aguardando Retorno':
        return <Mail className="h-4 w-4 text-yellow-500" />;
      case 'Enviado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Erro no Envio':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Não enviado':
        return <Badge variant="secondary">Não enviado</Badge>;
      case 'Aguardando Retorno':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Aguardando Retorno</Badge>;
      case 'Enviado':
        return <Badge variant="default" className="bg-green-600">Enviado</Badge>;
      case 'Erro no Envio':
        return <Badge variant="destructive">Erro no Envio</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando estatísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciador de Emails em Massa</h2>
          <p className="text-muted-foreground">
            Controle o envio automático de emails para ocorrências
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Enviado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.nao_enviado || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Retorno</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aguardando_retorno || 0}</div>
            <p className="text-xs text-muted-foreground">
              Email enviado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.enviado || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erro no Envio</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.erro_no_envio || 0}</div>
            <p className="text-xs text-muted-foreground">
              Falha no envio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Controles de Processamento
          </CardTitle>
          <CardDescription>
            Configure e execute o envio de emails em massa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testMode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="testMode" className="text-sm font-medium">
                Modo Teste (não envia emails reais)
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="emailLimit" className="text-sm font-medium">
              Limite de emails:
            </label>
            <input
              id="emailLimit"
              type="number"
              min="1"
              max="50"
              value={emailLimit}
              onChange={(e) => setEmailLimit(parseInt(e.target.value) || 10)}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>

          <div className="flex space-x-2 flex-wrap gap-2">
            <Button
              onClick={processEmails}
              disabled={isProcessing || (stats?.nao_enviado || 0) === 0}
              className="flex items-center"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Processando...' : 'Iniciar Processamento'}
            </Button>

            <Button
              onClick={runPythonScript}
              disabled={isProcessing || (stats?.nao_enviado || 0) === 0}
              variant="secondary"
              className="flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Executar Script Python
            </Button>

            {(stats?.erro_no_envio || 0) > 0 && (
              <Button
                onClick={resetErrorStatus}
                variant="outline"
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Erros
              </Button>
            )}
          </div>

          {testMode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo Teste Ativo:</strong> Os emails não serão enviados realmente. 
                Apenas o status será atualizado para simular o envio.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados do último processamento */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Último Processamento</CardTitle>
            <CardDescription>
              {lastResult.message} - {lastResult.processed} emails processados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastResult.results && lastResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detalhes:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {lastResult.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-mono">{result.occurrenceId}</span>
                        <span className="text-sm text-muted-foreground">→</span>
                        <span className="text-sm">{result.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkEmailManager;

