import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Edit, ArrowLeft, Trash2, Ban } from 'lucide-react';

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  cpf?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

const UserManagement = () => {
  const { user, getAllUsers, updateUser, isAdmin, deleteUser, deactivateUser, activateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeactivatingId, setIsDeactivatingId] = useState<string | null>(null);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);
  const [isActivatingId, setIsActivatingId] = useState<string | null>(null);
  const [confirmActivateId, setConfirmActivateId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isAdmin()) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem acessar esta página.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    loadUsers();
  }, [user, navigate, isAdmin, toast]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllUsers();
      
      if (error) {
        toast({
          title: "Erro ao carregar usuários",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers((data as ManagedUser[]) || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (u: ManagedUser) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      cpf: u.cpf || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setIsEditing(true);
      const { error } = await updateUser(editingUser.id, editForm);
      
      if (error) {
        toast({
          title: "Erro ao atualizar usuário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuário atualizado",
        description: "Dados do usuário foram atualizados com sucesso.",
      });

      setEditingUser(null);
      loadUsers(); // Recarregar lista
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      setIsDeletingId(confirmDeleteId);
      const { error } = await deleteUser(confirmDeleteId);
      if (error) {
        toast({
          title: 'Erro ao excluir usuário',
          description: error.message || 'Ocorreu um erro inesperado.',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Usuário excluído', description: 'Usuário desativado com sucesso.' });
      setConfirmDeleteId(null);
      loadUsers();
    } catch (error) {
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivateId) return;
    try {
      setIsDeactivatingId(confirmDeactivateId);
      const { error } = await deactivateUser(confirmDeactivateId);
      if (error) {
        toast({ title: 'Erro ao desativar usuário', description: error.message || 'Ocorreu um erro.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Usuário desativado', description: 'Usuário desativado com sucesso.' });
      setConfirmDeactivateId(null);
      loadUsers();
    } catch (error) {
      toast({ title: 'Erro ao desativar usuário', description: 'Ocorreu um erro inesperado.', variant: 'destructive' });
    } finally {
      setIsDeactivatingId(null);
    }
  };

  const handleActivate = async () => {
    if (!confirmActivateId) return;
    try {
      setIsActivatingId(confirmActivateId);
      const { error } = await activateUser(confirmActivateId);
      if (error) {
        toast({ title: 'Erro ao ativar usuário', description: error.message || 'Ocorreu um erro.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Usuário ativado', description: 'Usuário reativado com sucesso.' });
      setConfirmActivateId(null);
      loadUsers();
    } catch (error) {
      toast({ title: 'Erro ao ativar usuário', description: 'Ocorreu um erro inesperado.', variant: 'destructive' });
    } finally {
      setIsActivatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            {users.length} usuário{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.is_active ? 'Ativo' : 'Desativado'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botão Editar - sempre disponível para não-admin */}
                        {u.role !== 'admin' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(u)}
                                className="inline-flex items-center space-x-1"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Editar</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Usuário</DialogTitle>
                                <DialogDescription>
                                  Altere os dados do usuário {u.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-full-name">Nome Completo</Label>
                                  <Input
                                    id="edit-full-name"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-phone">Telefone</Label>
                                  <Input
                                    id="edit-phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-cpf">CPF</Label>
                                  <Input
                                    id="edit-cpf"
                                    value={editForm.cpf}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, cpf: e.target.value }))}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleSaveEdit}
                                    disabled={isEditing}
                                  >
                                    {isEditing ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                      </>
                                    ) : (
                                      'Salvar'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Botão Desativar - apenas para usuários ativos */}
                        {u.role !== 'admin' && u.is_active && (
                          <Dialog open={confirmDeactivateId === u.id} onOpenChange={(open) => !open && setConfirmDeactivateId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="inline-flex items-center space-x-1"
                                onClick={() => setConfirmDeactivateId(u.id)}
                                disabled={isDeactivatingId !== null}
                              >
                                {isDeactivatingId === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Ban className="h-3 w-3" />
                                )}
                                <span>Desativar</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar desativação</DialogTitle>
                                <DialogDescription>
                                  Esta ação desativará o usuário. Ele deixará de ter acesso ao sistema.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setConfirmDeactivateId(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleDeactivate} disabled={isDeactivatingId !== null}>
                                  {isDeactivatingId !== null ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Desativando...
                                    </>
                                  ) : (
                                    'Confirmar'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Botão Ativar - apenas para usuários desativados */}
                        {u.role !== 'admin' && !u.is_active && (
                          <Dialog open={confirmActivateId === u.id} onOpenChange={(open) => !open && setConfirmActivateId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="inline-flex items-center space-x-1"
                                onClick={() => setConfirmActivateId(u.id)}
                                disabled={isActivatingId !== null}
                              >
                                {isActivatingId === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <span className="font-medium">Ativar</span>
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar ativação</DialogTitle>
                                <DialogDescription>
                                  O usuário será reativado e poderá acessar o sistema novamente.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setConfirmActivateId(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleActivate} disabled={isActivatingId !== null}>
                                  {isActivatingId !== null ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Ativando...
                                    </>
                                  ) : (
                                    'Confirmar'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Botão Excluir - sempre disponível para não-admin */}
                        {u.role !== 'admin' && (
                          <Dialog open={confirmDeleteId === u.id} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="inline-flex items-center space-x-1"
                                onClick={() => setConfirmDeleteId(u.id)}
                                disabled={isDeletingId !== null}
                              >
                                {isDeletingId === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                <span>Excluir</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                  Esta ação irá desativar o usuário. Você pode reativá-lo alterando o campo de status no banco.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                                  Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={isDeletingId !== null}>
                                  {isDeletingId !== null ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Excluindo...
                                    </>
                                  ) : (
                                    'Confirmar'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Para administradores */}
                        {u.role === 'admin' && (
                          <span className="text-sm text-muted-foreground">
                            Não editável
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
