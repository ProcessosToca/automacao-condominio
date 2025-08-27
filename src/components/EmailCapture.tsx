import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Bot, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download
} from 'lucide-react';

interface EmailData {
  id: string;
  property_id: string;
  property_name: string;
  admin_email: string;
  admin_name: string;
  subject: string;
  content: string;
  sent_date: string;
  status: 'sent' | 'pending' | 'failed';
  response?: string;
  ai_summary?: string;
  debt_amount?: number;
  next_email_date?: string;
}

interface EmailCaptureProps {
  propertyId?: string;
  onEmailSent?: (emailData: EmailData) => void;
}

const EmailCapture = ({ propertyId, onEmailSent }: EmailCaptureProps) => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [currentEmail, setCurrentEmail] = useState({
    subject: '',
    content: '',
    admin_email: '',
    admin_name: '',
    debt_amount: 0
  });
  const [isSending, setIsSending] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mock data - substituir por chamadas reais da API
  useEffect(() => {
    const mockEmails: EmailData[] = [
      {
        id: '1',
        property_id: '1',
        property_name: 'Residencial Solar',
        admin_email: 'maria@residencialsolar.com',
        admin_name: 'Maria Silva',
        subject: 'Cobrança de Condomínio - Janeiro 2024',
        content: 'Prezada Maria, segue cobrança do condomínio referente ao mês de janeiro...',
        sent_date: '2024-01-15T10:30:00Z',
        status: 'sent',
        response: 'Obrigada pelo envio. Vou verificar e retorno em breve.',
        ai_summary: 'Cliente respondeu positivamente, prometendo verificar e retornar. Tom de resposta cordial e cooperativo.',
        debt_amount: 2500.00,
        next_email_date: '2024-02-15'
      }
    ];
    setEmails(mockEmails);
  }, []);

  const handleSendEmail = async () => {
    setIsSending(true);
    
    // Simular envio de email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newEmail: EmailData = {
      id: Date.now().toString(),
      property_id: propertyId || '1',
      property_name: 'Residencial Solar',
      admin_email: currentEmail.admin_email,
      admin_name: currentEmail.admin_name,
      subject: currentEmail.subject,
      content: currentEmail.content,
      sent_date: new Date().toISOString(),
      status: 'sent',
      debt_amount: currentEmail.debt_amount
    };

    setEmails([newEmail, ...emails]);
    setCurrentEmail({
      subject: '',
      content: '',
      admin_email: '',
      admin_name: '',
      debt_amount: 0
    });
    setIsSending(false);
    
    if (onEmailSent) {
      onEmailSent(newEmail);
    }
  };

  const captureEmailResponses = async () => {
    setIsCapturing(true);
    
    // Simular captura de respostas
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular processamento com IA
    const updatedEmails = emails.map(email => ({
      ...email,
      response: email.id === '1' ? 'Obrigada pelo envio. Vou verificar e retorno em breve.' : undefined,
      ai_summary: email.id === '1' ? 'Cliente respondeu positivamente, prometendo verificar e retornar. Tom de resposta cordial e cooperativo.' : undefined
    }));
    
    setEmails(updatedEmails);
    setIsCapturing(false);
  };

  const generateAISummary = async (emailId: string) => {
    // Simular geração de resumo com IA
    const email = emails.find(e => e.id === emailId);
    if (email && email.response) {
      const aiSummary = 'Análise da resposta: Cliente demonstrou interesse em resolver a situação. Tom de resposta profissional e cooperativo.';
      
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, ai_summary: aiSummary } : e
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Composição de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin_email">Email da Administradora</Label>
              <Input
                id="admin_email"
                value={currentEmail.admin_email}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, admin_email: e.target.value }))}
                placeholder="admin@condominio.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin_name">Nome da Administradora</Label>
              <Input
                id="admin_name"
                value={currentEmail.admin_name}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, admin_name: e.target.value }))}
                placeholder="Nome da administradora"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={currentEmail.subject}
              onChange={(e) => setCurrentEmail(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Assunto do email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={currentEmail.content}
              onChange={(e) => setCurrentEmail(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Conteúdo do email..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt_amount">Valor em Débito (R$)</Label>
            <Input
              id="debt_amount"
              type="number"
              value={currentEmail.debt_amount}
              onChange={(e) => setCurrentEmail(prev => ({ ...prev, debt_amount: parseFloat(e.target.value) || 0 }))}
              placeholder="0,00"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              onClick={captureEmailResponses}
              disabled={isCapturing}
              variant="outline"
            >
              {isCapturing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {isCapturing ? 'Capturando...' : 'Capturar Respostas'}
            </Button>
            
            <Button 
              onClick={handleSendEmail}
              disabled={isSending || !currentEmail.subject || !currentEmail.content}
            >
              {isSending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSending ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Histórico de Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emails.map((email) => (
              <div key={email.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{email.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      Para: {email.admin_name} ({email.admin_email})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {email.status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {email.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {email.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                    <Badge variant={email.status === 'sent' ? 'default' : 'secondary'}>
                      {email.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Conteúdo:</Label>
                  <p className="text-sm mt-1">{email.content}</p>
                </div>

                {email.debt_amount && (
                  <div>
                    <Label className="text-sm font-medium">Valor em Débito:</Label>
                    <p className="text-sm font-bold text-destructive">
                      R$ {email.debt_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Enviado em: {new Date(email.sent_date).toLocaleString('pt-BR')}
                </div>

                {email.response && (
                  <div className="border-t pt-3">
                    <Label className="text-sm font-medium">Resposta:</Label>
                    <p className="text-sm mt-1">{email.response}</p>
                    
                    {!email.ai_summary && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => generateAISummary(email.id)}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Gerar Resumo IA
                      </Button>
                    )}
                  </div>
                )}

                {email.ai_summary && (
                  <div className="border-t pt-3">
                    <Label className="text-sm font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      Resumo IA:
                    </Label>
                    <p className="text-sm mt-1 text-muted-foreground">{email.ai_summary}</p>
                  </div>
                )}

                {email.next_email_date && (
                  <div className="border-t pt-3">
                    <Label className="text-sm font-medium">Próximo Email:</Label>
                    <p className="text-sm">
                      {new Date(email.next_email_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCapture;
