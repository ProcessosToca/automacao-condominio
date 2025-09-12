-- Adicionar coluna email_status na tabela occurrences
ALTER TABLE public.occurrences 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'Não enviado' 
CHECK (email_status IN ('Não enviado', 'Aguardando Retorno', 'Enviado', 'Erro no Envio'));

-- Adicionar coluna email_sent_at para rastrear quando foi enviado
ALTER TABLE public.occurrences 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna email_error para registrar erros de envio
ALTER TABLE public.occurrences 
ADD COLUMN IF NOT EXISTS email_error TEXT;

-- Criar índice para melhor performance nas consultas de email
CREATE INDEX IF NOT EXISTS idx_occurrences_email_status ON public.occurrences(email_status);

-- Atualizar ocorrências existentes para ter o status padrão
UPDATE public.occurrences 
SET email_status = 'Não enviado' 
WHERE email_status IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.occurrences.email_status IS 'Status do envio de email: Não enviado, Aguardando Retorno, Enviado, Erro no Envio';
COMMENT ON COLUMN public.occurrences.email_sent_at IS 'Data e hora do envio do email';
COMMENT ON COLUMN public.occurrences.email_error IS 'Mensagem de erro caso o envio falhe';






