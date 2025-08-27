import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  Home, 
  Mail, 
  AlertTriangle, 
  Users, 
  Building, 
  Search,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailCapture from '@/components/EmailCapture';
import OccurrenceManagement from '@/components/OccurrenceManagement';

interface Property {
  id: string;
  name: string;
  address: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  last_email_sent: string | null;
  next_email_date: string | null;
  has_debt: boolean;
  debt_amount: number | null;
  email_status: 'sent' | 'pending' | 'failed';
  ai_summary: string | null;
  responsible_collector: string;
  created_at: string;
}

const PropertyManagement = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  // Mock data - substituir por chamadas reais da API
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        name: 'Residencial Solar',
        address: 'Rua das Flores, 123 - Centro',
        admin_name: 'Maria Silva',
        admin_email: 'maria@residencialsolar.com',
        admin_phone: '(11) 99999-9999',
        last_email_sent: '2024-01-15',
        next_email_date: '2024-02-15',
        has_debt: true,
        debt_amount: 2500.00,
        email_status: 'sent',
        ai_summary: 'Cliente com histórico de pagamento irregular. Última cobrança enviada com sucesso.',
        responsible_collector: 'João Costa',
        created_at: '2024-01-01'
      },
      {
        id: '2',
        name: 'Edifício Comercial Plaza',
        address: 'Av. Paulista, 1000 - Bela Vista',
        admin_name: 'Carlos Santos',
        admin_email: 'carlos@plaza.com',
        admin_phone: '(11) 88888-8888',
        last_email_sent: '2024-01-10',
        next_email_date: '2024-02-10',
        has_debt: false,
        debt_amount: null,
        email_status: 'sent',
        ai_summary: 'Cliente em dia com pagamentos. Resposta positiva à última cobrança.',
        responsible_collector: 'Ana Paula',
        created_at: '2024-01-01'
      }
    ];

    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
    setLoading(false);
  }, []);

  // Filtrar propriedades
  useEffect(() => {
    const filtered = properties.filter(property =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

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
            <h1 className="text-2xl font-bold">Gestão de Condomínios</h1>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Imóveis
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="occurrences" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ocorrências
            </TabsTrigger>
          </TabsList>

          {/* Tab: Imóveis */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar imóvel, administradora..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
              <Button onClick={() => navigate('/property/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        {property.name}
                      </CardTitle>
                      <Badge variant={property.has_debt ? 'destructive' : 'default'}>
                        {property.has_debt ? 'Em Débito' : 'Em Dia'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Endereço
                      </Label>
                      <p className="text-sm">{property.address}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Administradora
                      </Label>
                      <p className="text-sm font-medium">{property.admin_name}</p>
                      <p className="text-xs text-muted-foreground">{property.admin_email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Último Email
                        </Label>
                        <p className="text-xs">
                          {property.last_email_sent ? 
                            new Date(property.last_email_sent).toLocaleDateString('pt-BR') : 
                            'Nunca enviado'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Próximo Email
                        </Label>
                        <p className="text-xs">
                          {property.next_email_date ? 
                            new Date(property.next_email_date).toLocaleDateString('pt-BR') : 
                            'Não agendado'
                          }
                        </p>
                      </div>
                    </div>

                    {property.has_debt && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Valor em Débito
                        </Label>
                        <p className="text-lg font-bold text-destructive">
                          R$ {property.debt_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {property.email_status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {property.email_status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {property.email_status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-xs capitalize">{property.email_status}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}/emails`)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}/occurrences`)}>
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Emails */}
          <TabsContent value="emails" className="space-y-6">
            <EmailCapture />
          </TabsContent>

          {/* Tab: Ocorrências */}
          <TabsContent value="occurrences" className="space-y-6">
            <OccurrenceManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PropertyManagement;
