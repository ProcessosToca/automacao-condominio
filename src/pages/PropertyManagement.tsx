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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailCapture from '@/components/EmailCapture';
import OccurrenceManagement from '@/components/OccurrenceManagement';
import PropertyManagementCRUD from '@/components/PropertyManagement';



const PropertyManagement = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');



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
            <PropertyManagementCRUD />
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
