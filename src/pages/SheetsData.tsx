import { GoogleSheetsTable } from '@/components/GoogleSheetsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SheetsData = () => {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1feuzsTzqNnxiZvqHsF6RiYBmxhKjrq8dwP946rySuuI/edit?gid=130052127#gid=130052127';
  const sheetName = 'Tabela_Condominio'; // Nome da aba específica

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tabela de Condomínios</h1>
          <p className="text-muted-foreground">
            Dados em tempo real da planilha de levantamentos e contratos
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Conectado ao Google Sheets
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Planilha</CardTitle>
          <CardDescription>
            Dados sendo carregados diretamente do Google Sheets - Aba: tabela_condominio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">URL:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {sheetUrl}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Aba:</span>
            <Badge variant="outline">{sheetName}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Colunas:</span>
            <Badge variant="outline">Codigo, Data_Prox_Levantamento, Data_Ultimo_Levantamento, Status, Valor_Divida, Status_Debito, Contrato, Ocorrencia, Responsavel</Badge>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <strong>Status:</strong> Planilha acessível! Carregando dados reais de levantamentos e contratos.
            </p>
          </div>
        </CardContent>
      </Card>

      <GoogleSheetsTable 
        sheetUrl={sheetUrl} 
        sheetName={sheetName}
      />
    </div>
  );
};

export default SheetsData;
