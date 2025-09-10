import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleSheetsData {
  headers: string[];
  rows: string[][];
}

interface GoogleSheetsTableProps {
  sheetUrl: string;
  sheetName?: string;
}

export const GoogleSheetsTable = ({ sheetUrl, sheetName = 'Sheet1' }: GoogleSheetsTableProps) => {
  const [data, setData] = useState<GoogleSheetsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Extrair ID da planilha da URL
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Função para fazer parse correto do CSV
  const parseCSV = (csvText: string): { headers: string[], rows: string[][] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Planilha vazia');
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    return { headers, rows };
  };


  // Buscar dados do Google Sheets
  const fetchSheetData = async () => {
    setLoading(true);
    setError(null);

    try {
      const sheetId = extractSheetId(sheetUrl);
      if (!sheetId) {
        throw new Error('URL da planilha inválida');
      }

      // Tentar diferentes URLs para acessar a planilha
      const urls = [
        // URL com GID específico da aba Tabela_Condominio (mais confiável)
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=130052127`,
        // URL com nome da aba
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`,
        // URL alternativa
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
      ];
      
      let csvText = '';
      let successUrl = '';

      for (const url of urls) {
        try {
          console.log('Tentando URL:', url);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/csv',
            },
          });

          if (response.ok) {
            csvText = await response.text();
            successUrl = url;
            console.log('Dados carregados com sucesso via:', url);
            break;
          } else {
            console.log(`Falha na URL ${url}: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.log('Erro com URL:', url, err);
        }
      }

      if (csvText) {
        const { headers, rows } = parseCSV(csvText);
        setData({ headers, rows });
        setIsUsingMockData(false);
        toast.success(`Dados reais carregados com sucesso! (${rows.length} linhas)`);
        return;
      }

      // Se não conseguiu carregar, mostrar erro
      throw new Error('Não foi possível acessar a planilha. Verifique se ela está pública.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [sheetUrl, sheetName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando dados da planilha...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar dados</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">❌ Erro ao Carregar Dados Reais</h4>
            <p className="text-sm text-red-700 mb-3">
              Não foi possível acessar os dados da sua planilha. A planilha precisa estar pública para funcionar.
            </p>
            <h5 className="font-semibold text-red-800 mb-2">Para carregar seus dados reais:</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
              <li>Abra sua planilha no Google Sheets</li>
              <li>Clique em <strong>"Compartilhar"</strong> (canto superior direito)</li>
              <li>Altere as permissões para <strong>"Qualquer pessoa com o link pode visualizar"</strong></li>
              <li>Clique em <strong>"Concluído"</strong></li>
              <li>Volte aqui e clique em "Tentar Novamente"</li>
            </ol>
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">
                <strong>Teste rápido:</strong> Tente abrir este link em uma aba anônima:
              </p>
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                https://docs.google.com/spreadsheets/d/1feuzsTzqNnxiZvqHsF6RiYBmxhKjrq8dwP946rySuuI/export?format=csv&gid=130052127
              </code>
            </div>
          </div>
          <Button onClick={fetchSheetData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum dado encontrado</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Dados da Planilha
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Dados Reais
              </span>
            </CardTitle>
            <CardDescription>
              {data.rows.length} linhas de dados reais carregadas
            </CardDescription>
          </div>
          <Button 
            onClick={fetchSheetData} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow>
                  {data.headers.map((header, index) => (
                    <TableHead 
                      key={index} 
                      className="font-semibold px-3 py-3 text-sm whitespace-nowrap bg-gray-50"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <TableCell 
                        key={cellIndex} 
                        className="px-3 py-2 text-sm whitespace-nowrap border-b"
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
