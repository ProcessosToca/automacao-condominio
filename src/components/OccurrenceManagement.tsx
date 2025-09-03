import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Building,
  Calendar,
  Bot,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { OccurrenceService } from '@/services/occurrenceService';
import type { Database } from '@/integrations/supabase/types';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface Occurrence {
  id: string;
  property_id: string;
  title: string;
  description: string;
  status: Database['public']['Enums']['occurrence_status'];
  priority: Database['public']['Enums']['occurrence_priority'];
  admin_name: string | null;
  admin_phone: string | null;
  responsible_collector: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
  properties?: {
    id: string;
    name: string;
    address: string | null;
    admin_name: string | null;
    admin_phone: string | null;
  };
}

interface OccurrenceManagementProps {
  propertyId?: string;
  onOccurrenceCreated?: (occurrence: Occurrence) => void;
}

const OccurrenceManagement = ({ propertyId, onOccurrenceCreated }: OccurrenceManagementProps) => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<Occurrence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<Occurrence | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    admin_name: '',
    admin_phone: '',
    priority: 'medium' as Database['public']['Enums']['occurrence_priority'],
    property_id: ''
  });

  // Carregar dados do banco
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [occurrencesData, propertiesData] = await Promise.all([
        OccurrenceService.getAllOccurrences(),
        OccurrenceService.getAllProperties()
      ]);
      
      setOccurrences(occurrencesData);
      setProperties(propertiesData);
      
      // Selecionar primeira propriedade por padrão
      if (propertiesData.length > 0 && !formData.property_id) {
        setFormData(prev => ({ ...prev, property_id: propertiesData[0].id }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (isEditing && editingOccurrence) {
        // Atualizar ocorrência existente
        await OccurrenceService.updateOccurrence(editingOccurrence.id, {
          property_id: formData.property_id || propertyId || properties[0]?.id,
          title: formData.title,
          description: formData.description,
          admin_name: formData.admin_name,
          admin_phone: formData.admin_phone,
          priority: formData.priority
        });
      } else {
        // Criar nova ocorrência
        const newOccurrence = await OccurrenceService.createOccurrence({
          property_id: formData.property_id || propertyId || properties[0]?.id,
          title: formData.title,
          description: formData.description,
          admin_name: formData.admin_name,
          admin_phone: formData.admin_phone,
          priority: formData.priority,
          status: 'open',
          responsible_collector: 'Usuário Atual'
        });
        
        if (onOccurrenceCreated) {
          onOccurrenceCreated(newOccurrence);
        }
      }
      
      await loadData(); // Recarregar dados
      resetForm(); // Limpar formulário
      
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error);
      alert('Erro ao salvar ocorrência. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (occurrenceId: string, newStatus: Occurrence['status']) => {
    try {
      setIsLoading(true);
      await OccurrenceService.updateOccurrenceStatus(occurrenceId, newStatus);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISummary = async (occurrenceId: string) => {
    try {
      setIsLoading(true);
      const occurrence = occurrences.find(o => o.id === occurrenceId);
      if (occurrence) {
        const aiSummary = `Análise da ocorrência: ${occurrence.title}. Prioridade ${occurrence.priority}. Status atual: ${occurrence.status}.`;
        
        await OccurrenceService.updateOccurrence(occurrenceId, { ai_summary: aiSummary });
        await loadData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao gerar resumo IA:', error);
      alert('Erro ao gerar resumo IA. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (occurrence: Occurrence) => {
    setEditingOccurrence(occurrence);
    setFormData({
      title: occurrence.title,
      description: occurrence.description,
      admin_name: occurrence.admin_name || '',
      admin_phone: occurrence.admin_phone || '',
      priority: occurrence.priority,
      property_id: occurrence.property_id
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = (occurrence: Occurrence) => {
    console.log('Iniciando exclusão da ocorrência:', occurrence.title);
    setOccurrenceToDelete(occurrence);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!occurrenceToDelete) return;

    try {
      setIsLoading(true);
      console.log('Deletando ocorrência:', occurrenceToDelete.id);
      
      await OccurrenceService.deleteOccurrence(occurrenceToDelete.id);
      console.log('Ocorrência deletada com sucesso');
      
      // Fechar o diálogo
      setShowDeleteDialog(false);
      setOccurrenceToDelete(null);
      
      // Recarregar dados
      await loadData();
      
      // Mensagem de sucesso removida - sem alerta
      
    } catch (error) {
      console.error('Erro ao deletar ocorrência:', error);
      alert(`Erro ao deletar ocorrência: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      admin_name: '',
      admin_phone: '',
      priority: 'medium' as Database['public']['Enums']['occurrence_priority'],
      property_id: formData.property_id
    });
    setIsEditing(false);
    setEditingOccurrence(null);
    setIsFormOpen(false);
  };

  const getStatusColor = (status: Occurrence['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Occurrence['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Ocorrências</h2>
          <p className="text-muted-foreground">
            Registre e acompanhe ocorrências dos condomínios
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancelar Edição' : 'Nova Ocorrência'}
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {isEditing ? 'Editar Ocorrência' : 'Nova Ocorrência'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="property_id">Propriedade *</Label>
                  <select
                    id="property_id"
                    value={formData.property_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, property_id: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione uma propriedade</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Database['public']['Enums']['occurrence_priority'] }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="admin_name">Nome da Administradora *</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_name: e.target.value }))}
                    placeholder="Nome da administradora"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_phone">Telefone da Administradora</Label>
                  <Input
                    id="admin_phone"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título da Ocorrência *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da ocorrência"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente a ocorrência..."
                  rows={4}
                  required
                />
              </div>



              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Ocorrência')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Occurrences List */}
      {isLoading && occurrences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Carregando ocorrências...</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {occurrences.map((occurrence) => (
          <Card key={occurrence.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{occurrence.title}</h3>
                    <Badge className={getStatusColor(occurrence.status)}>
                      {occurrence.status === 'open' && 'Aberta'}
                      {occurrence.status === 'in_progress' && 'Em Andamento'}
                      {occurrence.status === 'resolved' && 'Resolvida'}
                      {occurrence.status === 'closed' && 'Fechada'}
                    </Badge>
                    <Badge className={getPriorityColor(occurrence.priority)}>
                      {occurrence.priority === 'low' && 'Baixa'}
                      {occurrence.priority === 'medium' && 'Média'}
                      {occurrence.priority === 'high' && 'Alta'}
                      {occurrence.priority === 'urgent' && 'Urgente'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{occurrence.properties?.name || 'Propriedade não encontrada'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{occurrence.admin_name || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Responsável: {occurrence.responsible_collector || 'Não atribuído'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Criada: {new Date(occurrence.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium">Descrição:</Label>
                <p className="text-sm mt-1">{occurrence.description}</p>
              </div>

              {occurrence.ai_summary && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    Resumo IA:
                  </Label>
                  <p className="text-sm mt-1 text-muted-foreground">{occurrence.ai_summary}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Última atualização: {new Date(occurrence.updated_at).toLocaleString('pt-BR')}
                </div>
                
                <div className="flex space-x-2">
                  {/* Botões de Ação */}
                  {!occurrence.ai_summary && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateAISummary(occurrence.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2" />
                      )}
                      Resumo IA
                    </Button>
                  )}
                  
                  {occurrence.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'in_progress')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Em Andamento
                    </Button>
                  )}
                  
                  {occurrence.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'resolved')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Resolver
                    </Button>
                  )}
                  
                  {occurrence.status === 'resolved' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'closed')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Fechar
                    </Button>
                  )}

                  {/* Botões de Editar e Excluir */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(occurrence)}
                    disabled={isLoading}
                    className="hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                                     <Button 
                     size="sm" 
                     variant="outline"
                     onClick={() => {
                       console.log('Botão excluir clicado para:', occurrence.title);
                       handleDelete(occurrence);
                     }}
                     disabled={isLoading}
                     className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                   >
                     <Trash2 className="h-4 w-4 mr-2" />
                     Excluir
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {occurrences.length === 0 && !isFormOpen && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma ocorrência registrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece registrando a primeira ocorrência
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeira Ocorrência
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          console.log('Fechando diálogo de exclusão');
          setShowDeleteDialog(false);
          setOccurrenceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a ocorrência "${occurrenceToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default OccurrenceManagement;
