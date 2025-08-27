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
  Bot
} from 'lucide-react';

interface Occurrence {
  id: string;
  property_id: string;
  property_name: string;
  admin_name: string;
  admin_phone: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  responsible_collector: string;
  ai_summary?: string;
}

interface OccurrenceManagementProps {
  propertyId?: string;
  onOccurrenceCreated?: (occurrence: Occurrence) => void;
}

const OccurrenceManagement = ({ propertyId, onOccurrenceCreated }: OccurrenceManagementProps) => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    admin_name: '',
    admin_phone: '',
    priority: 'medium' as const
  });

  // Mock data - substituir por chamadas reais da API
  useEffect(() => {
    const mockOccurrences: Occurrence[] = [
      {
        id: '1',
        property_id: '1',
        property_name: 'Residencial Solar',
        admin_name: 'Maria Silva',
        admin_phone: '(11) 99999-9999',
        title: 'Problema com Elevador',
        description: 'Elevador do bloco A está com defeito há 3 dias. Moradores reclamando.',
        status: 'in_progress',
        priority: 'high',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:20:00Z',
        responsible_collector: 'João Costa',
        ai_summary: 'Ocorrência relacionada a manutenção de elevador. Prioridade alta devido ao impacto nos moradores.'
      },
      {
        id: '2',
        property_id: '1',
        property_name: 'Residencial Solar',
        admin_name: 'Maria Silva',
        admin_phone: '(11) 99999-9999',
        title: 'Vazamento no Térreo',
        description: 'Vazamento de água no hall de entrada. Piso molhado.',
        status: 'resolved',
        priority: 'medium',
        created_at: '2024-01-10T08:15:00Z',
        updated_at: '2024-01-12T16:45:00Z',
        responsible_collector: 'Ana Paula'
      }
    ];
    setOccurrences(mockOccurrences);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOccurrence: Occurrence = {
      id: Date.now().toString(),
      property_id: propertyId || '1',
      property_name: 'Residencial Solar',
      admin_name: formData.admin_name,
      admin_phone: formData.admin_phone,
      title: formData.title,
      description: formData.description,
      status: 'open',
      priority: formData.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responsible_collector: 'Usuário Atual'
    };

    setOccurrences([newOccurrence, ...occurrences]);
    setFormData({
      title: '',
      description: '',
      admin_name: '',
      admin_phone: '',
      priority: 'medium'
    });
    setIsFormOpen(false);
    
    if (onOccurrenceCreated) {
      onOccurrenceCreated(newOccurrence);
    }
  };

  const updateStatus = (occurrenceId: string, newStatus: Occurrence['status']) => {
    setOccurrences(occurrences.map(occ => 
      occ.id === occurrenceId 
        ? { ...occ, status: newStatus, updated_at: new Date().toISOString() }
        : occ
    ));
  };

  const generateAISummary = async (occurrenceId: string) => {
    const occurrence = occurrences.find(o => o.id === occurrenceId);
    if (occurrence) {
      const aiSummary = `Análise da ocorrência: ${occurrence.title}. Prioridade ${occurrence.priority}. Status atual: ${occurrence.status}.`;
      
      setOccurrences(occurrences.map(o => 
        o.id === occurrenceId ? { ...o, ai_summary: aiSummary } : o
      ));
    }
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
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Nova Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Ocorrência
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Occurrences List */}
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
                      <span>{occurrence.property_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{occurrence.admin_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Responsável: {occurrence.responsible_collector}</span>
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
                  {!occurrence.ai_summary && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateAISummary(occurrence.id)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Resumo IA
                    </Button>
                  )}
                  
                  {occurrence.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'in_progress')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Em Andamento
                    </Button>
                  )}
                  
                  {occurrence.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  )}
                  
                  {occurrence.status === 'resolved' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(occurrence.id, 'closed')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Fechar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};

export default OccurrenceManagement;
