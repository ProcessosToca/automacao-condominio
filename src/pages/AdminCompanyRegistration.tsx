import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Save,
  ArrowLeft,
  Plus,
  Trash
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  cnpj: string;
  notes: string;
  created_at: string;
}

const AdminCompanyRegistration = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [adminCompanies, setAdminCompanies] = useState<AdminCompany[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    cnpj: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        contact_person: formData.contact_person.trim(),
        cnpj: formData.cnpj.trim(),
        notes: formData.notes.trim(),
      } as any;

      if (editingId) {
        const { data, error } = await (supabase as any)
          .from('admin_companies')
          .update(payload)
          .eq('id', editingId)
          .select('*')
          .single();
        if (error) throw error;
        setAdminCompanies(prev => prev.map(c => c.id === editingId ? (data as AdminCompany) : c));
      } else {
        const { data, error } = await (supabase as any)
          .from('admin_companies')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw error;
        setAdminCompanies(prev => [data as AdminCompany, ...prev]);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        cnpj: '',
        notes: ''
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar administradora');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const { data, error } = await (supabase as any)
        .from('admin_companies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdminCompanies((data || []) as AdminCompany[]);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao carregar administradoras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDelete = async (companyId: string) => {
    setErrorMessage('');
    setDeletingId(companyId);
    try {
      const { error } = await (supabase as any)
        .from('admin_companies')
        .delete()
        .eq('id', companyId);
      if (error) throw error;
      setAdminCompanies(prev => prev.filter(c => c.id !== companyId));
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao excluir administradora');
    } finally {
      setDeletingId(null);
    }
  };

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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Cadastro de Administradoras</h1>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Administradoras de Condomínio</h2>
              <p className="text-muted-foreground">
                Cadastre as administradoras responsáveis pelos condomínios
              </p>
            </div>
            <Button onClick={() => { setIsFormOpen(true); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Administradora
            </Button>
          </div>

          {/* Form Modal */}
          {isFormOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Nova Administradora
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errorMessage && (
                  <div className="text-sm text-red-600 mb-2">{errorMessage}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Administradora *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contato@empresa.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Responsável *</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => handleInputChange('contact_person', e.target.value)}
                        placeholder="Nome do responsável"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Endereço completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Informações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* List of Admin Companies */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.contact_person}</span>
                    </div>
                    
                    {company.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                    )}
                  </div>

                  {company.cnpj && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        CNPJ
                      </Label>
                      <p className="text-sm">{company.cnpj}</p>
                    </div>
                  )}

                  {company.notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Observações
                      </Label>
                      <p className="text-sm text-muted-foreground">{company.notes}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Cadastrada em: {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            name: company.name || '',
                            email: company.email || '',
                            phone: company.phone || '',
                            address: company.address || '',
                            contact_person: company.contact_person || '',
                            cnpj: company.cnpj || '',
                            notes: company.notes || ''
                          });
                          setEditingId(company.id);
                          setIsFormOpen(true);
                        }}
                      >
                        Editar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={deletingId === company.id}>
                            <Trash className="h-4 w-4 mr-2" />
                            {deletingId === company.id ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir administradora?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso removerá permanentemente a administradora e seus dados relacionados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(company.id)}>
                              Confirmar exclusão
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {adminCompanies.length === 0 && !isFormOpen && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma administradora cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando a primeira administradora de condomínio
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Administradora
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCompanyRegistration;
