import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  User,
  Phone,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';
import { PropertyService } from '@/services/propertyService';
import type { Database } from '@/integrations/supabase/types';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import PropertyStats from '@/components/PropertyStats';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyFormData {
  name: string;
  address: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    admin_name: '',
    admin_email: '',
    admin_phone: ''
  });

  // Carregar dados
  useEffect(() => {
    loadProperties();
  }, []);

  // Filtrar propriedades baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await PropertyService.getAllProperties();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (isEditing && editingProperty) {
        // Atualizar propriedade existente
        await PropertyService.updateProperty(editingProperty.id, formData);
      } else {
        // Criar nova propriedade
        await PropertyService.createProperty(formData);
      }

      // Recarregar dados
      await loadProperties();
      
      // Limpar formulário
      resetForm();
      
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar propriedade';
      alert(`Erro ao salvar propriedade: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      address: property.address || '',
      admin_name: property.admin_name || '',
      admin_email: property.admin_email || '',
      admin_phone: property.admin_phone || ''
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setIsLoading(true);
      await PropertyService.deleteProperty(propertyToDelete.id);
      await loadProperties();
    } catch (error) {
      console.error('Erro ao deletar propriedade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao deletar propriedade';
      alert(`Erro ao deletar propriedade: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      admin_name: '',
      admin_email: '',
      admin_phone: ''
    });
    setIsEditing(false);
    setEditingProperty(null);
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Condomínios</h2>
          <p className="text-muted-foreground">
            Gerencie os condomínios e propriedades do sistema
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Condomínio
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar condomínios por nome, endereço, administrador ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Estatísticas */}
      <PropertyStats properties={properties} />

      {/* Formulário */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              {isEditing ? 'Editar Condomínio' : 'Novo Condomínio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Condomínio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do condomínio"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_name">Nome do Administrador</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_name: e.target.value }))}
                    placeholder="Nome do administrador"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Email do Administrador *</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                    placeholder="admin@condominio.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Telefone do Administrador</Label>
                  <Input
                    id="admin_phone"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo do condomínio"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Telefone do Administrador</Label>
                  <Input
                    id="admin_phone"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Condomínios */}
      {isLoading && properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Carregando condomínios...</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Condomínio
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      {property.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{property.address}</span>
                        </div>
                      )}
                      
                      {property.admin_name && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Admin: {property.admin_name}</span>
                        </div>
                      )}
                      
                      {property.admin_email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{property.admin_email}</span>
                        </div>
                      )}
                      
                      {property.admin_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{property.admin_phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Criado: {new Date(property.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(property)}
                      disabled={isLoading}
                      className="hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(property)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-gray-100">
                  Última atualização: {new Date(property.updated_at).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {filteredProperties.length === 0 && !isFormOpen && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum condomínio registrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Nenhum resultado encontrado para sua busca.' : 'Comece registrando o primeiro condomínio'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Condomínio
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {properties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total de condomínios: {properties.length}</span>
              <span>Exibindo: {filteredProperties.length}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o condomínio "${propertyToDelete?.name}"? Esta ação não pode ser desfeita e também excluirá todas as ocorrências relacionadas.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default PropertyManagement;
