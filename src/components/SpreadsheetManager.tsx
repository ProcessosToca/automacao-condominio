import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface SpreadsheetStats {
  total: number;
  processados: number;
  nao_processados: number;
  com_erro: number;
}

interface SpreadsheetData {
  id: string;
  numero_ocorrencia: string;
  titulo: string;
  edificio: string;
  admin_email: string;
  processado: boolean;
  data_cadastro: string;
  erro_processamento?: string;
}

const SpreadsheetManager = () => {
  const [stats, setStats] = useState<SpreadsheetStats | null>(null);
  const [data, setData] = useState<SpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar estatísticas
      const { data: allData, error } = await supabase
        .from('spreadsheet_data')
        .select('*');

      if (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Se a tabela não existe, mostrar instruções
        if (error.code === 'PGRST205') {
          setStats({
            total: 0,
            processados: 0,
            nao_processados: 0,
            com_erro: 0
          });
          setData([]);
          return;
        }
        
        toast.error('Erro ao carregar dados da planilha');
        return;
      }

      const stats: SpreadsheetStats = {
        total: allData.length,
        processados: allData.filter(item => item.processado).length,
        nao_processados: allData.filter(item => !item.processado && !item.erro_processamento).length,
        com_erro: allData.filter(item => item.erro_processamento).length
      };

      setStats(stats);
      setData(allData.slice(0, 10)); // Mostrar apenas os primeiros 10

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da planilha');
    } finally {
      setIsLoading(false);
    }
  };

  const importFromSpreadsheet = async () => {
    try {
      setIsImporting(true);
      setImportProgress(0);

      toast.info('Iniciando importação da planilha...');

      // Simular progresso
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Chamar função de importação
      const { data: result, error } = await supabase.functions.invoke('import-spreadsheet', {
        body: {
          clearExisting: true
        }
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (error) {
        console.error('Erro na importação:', error);
        toast.error('Erro ao importar dados da planilha');
        return;
      }

      if (result.success) {
        toast.success(`Importação concluída: ${result.imported} registros importados`);
        await loadData(); // Recarregar dados
      } else {
        toast.error('Erro na importação: ' + result.error);
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar dados da planilha');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados da planilha? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('spreadsheet_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Erro ao limpar dados:', error);
        toast.error('Erro ao limpar dados');
        return;
      }

      toast.success('Dados da planilha limpos com sucesso');
      await loadData();

    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error('Erro ao limpar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const processToOccurrences = async () => {
    try {
      setIsLoading(true);

      toast.info('Processando dados para ocorrências...');

      const { data: result, error } = await supabase.functions.invoke('process-spreadsheet-to-occurrences', {
        body: {
          limit: 50
        }
      });

      if (error) {
        console.error('Erro no processamento:', error);
        toast.error('Erro ao processar dados para ocorrências');
        return;
      }

      if (result.success) {
        toast.success(`Processamento concluído: ${result.processed} ocorrências criadas`);
        await loadData();
      } else {
        toast.error('Erro no processamento: ' + result.error);
      }

    } catch (error) {
      console.error('Erro no processamento:', error);
      toast.error('Erro ao processar dados para ocorrências');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando dados da planilha...</span>
      </div>
    );
  }

  // Se a tabela não existe, mostrar instruções
  const tableExists = stats !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciador de Planilha</h2>
          <p className="text-muted-foreground">
            Importe e gerencie dados da planilha de ocorrências
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alerta se a tabela não existe */}
      {!tableExists && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <p className="font-semibold text-lg">⚠️ Configuração Necessária</p>
              <p>A tabela <code>spreadsheet_data</code> não existe no banco de dados.</p>
              
              <div className="bg-white p-4 rounded border">
                <p className="font-semibold mb-3">🚀 Solução Rápida:</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.open('https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg', '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Abrir Supabase Dashboard
                  </Button>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>1.</strong> Clique no botão acima</p>
                    <p><strong>2.</strong> Vá em <strong>SQL Editor</strong></p>
                    <p><strong>3.</strong> Cole o SQL abaixo e execute:</p>
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <pre>{`CREATE TABLE public.spreadsheet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ocorrencia TEXT,
  titulo TEXT,
  descricao TEXT,
  status TEXT,
  prioridade TEXT,
  edificio TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  admin_nome TEXT,
  admin_email TEXT,
  admin_telefone TEXT,
  coletor_responsavel TEXT,
  coletor_telefone TEXT,
  valor_debito DECIMAL(10,2),
  data_vencimento DATE,
  situacao_pagamento TEXT,
  data_ocorrencia DATE,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacoes TEXT,
  processado BOOLEAN DEFAULT false,
  data_processamento TIMESTAMP WITH TIME ZONE,
  erro_processamento TEXT,
  occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.spreadsheet_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view spreadsheet data" ON public.spreadsheet_data FOR SELECT USING (true);
CREATE POLICY "Users can insert spreadsheet data" ON public.spreadsheet_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update spreadsheet data" ON public.spreadsheet_data FOR UPDATE USING (true);
CREATE POLICY "Users can delete spreadsheet data" ON public.spreadsheet_data FOR DELETE USING (true);`}</pre>
                  </div>
                  
                  <p className="text-sm"><strong>4.</strong> Recarregue esta página</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dados da planilha
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.processados || 0}</div>
            <p className="text-xs text-muted-foreground">
              Convertidos para ocorrências
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.nao_processados || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.com_erro || 0}</div>
            <p className="text-xs text-muted-foreground">
              Falha no processamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Controles de Importação
          </CardTitle>
          <CardDescription>
            Importe dados da planilha e processe para ocorrências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={importFromSpreadsheet}
              disabled={isImporting || !tableExists}
              className="flex items-center"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isImporting ? 'Importando...' : 'Importar da Planilha'}
            </Button>

            <Button
              onClick={processToOccurrences}
              disabled={isLoading || !tableExists || (stats?.nao_processados || 0) === 0}
              variant="outline"
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Processar para Ocorrências
            </Button>

            <Button
              onClick={clearAllData}
              disabled={isLoading || !tableExists}
              variant="destructive"
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Dados
            </Button>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando dados da planilha...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importação:</strong> Os dados serão importados da planilha do Google Sheets e armazenados na tabela spreadsheet_data.
              <br />
              <strong>Processamento:</strong> Os dados não processados serão convertidos em ocorrências na tabela occurrences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Dados importados */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Importados (Últimos 10)</CardTitle>
            <CardDescription>
              Visualização dos dados importados da planilha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{item.numero_ocorrencia} - {item.titulo}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.edificio} • {item.admin_email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.processado ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processado
                      </Badge>
                    ) : item.erro_processamento ? (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpreadsheetManager;
