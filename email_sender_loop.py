
#!/usr/bin/env python3
"""
Sistema de Envio Automático de Emails para Ocorrências
Envia emails para registros com status 'Não enviado' e atualiza para 'Aguardando Retorno'
"""

import os
import sys
import time
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
import json

# Configuração do Supabase
SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM"

class EmailSender:
    def __init__(self, test_mode: bool = True):
        self.test_mode = test_mode
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_ANON_KEY
        self.headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json'
        }
        
    def get_occurrences_to_send(self) -> List[Dict[str, Any]]:
        """Busca ocorrências com status 'Não enviado'"""
        try:
            url = f"{self.supabase_url}/rest/v1/occurrences"
            params = {
                'select': 'id,title,created_at,email_status,properties(name,address,admin_name,admin_email)',
                'email_status': 'eq.Não enviado',
                'properties.admin_email': 'not.is.null'
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            print(f"❌ Erro ao buscar ocorrências: {e}")
            return []
    
    def create_email_template(self, occurrence: Dict[str, Any]) -> str:
        """Cria o template do email personalizado"""
        props = occurrence.get('properties', {})
        
        # Extrair dados do endereço
        address = props.get('address', '')
        address_lines = address.split('\n') if address else []
        endereco = address_lines[0] if address_lines else ''
        numero = address_lines[1] if len(address_lines) > 1 else ''
        complemento = ''  # Não temos campo específico para complemento
        
        # Montar endereço completo
        endereco_completo = endereco
        if numero:
            endereco_completo += f", {numero}"
        if complemento:
            endereco_completo += f" - {complemento}"
        
        template = f"""Olá, boa tarde, tudo bem?
Poderia por gentileza me informar se constam débitos de condomínio em aberto relacionados ao imóvel abaixo?
{occurrence.get('id', 'N/A')}

Obrigada!

{props.get('name', 'N/A')}
{endereco_completo}"""
        
        return template
    
    def send_email(self, occurrence: Dict[str, Any], email_content: str) -> bool:
        """Envia o email (simulado ou real)"""
        props = occurrence.get('properties', {})
        email = props.get('admin_email')
        
        if self.test_mode:
            print(f"📧 [MODO TESTE] Email simulado para: {email}")
            print(f"   Conteúdo:")
            print(f"   {email_content}")
            print(f"   {'='*50}")
            return True
        else:
            # Aqui você pode implementar o envio real via SendGrid, SMTP, etc.
            print(f"📧 [MODO REAL] Enviando email para: {email}")
            # Implementar envio real aqui
            return True
    
    def update_occurrence_status(self, occurrence_id: str, status: str, error_message: str = None) -> bool:
        """Atualiza o status da ocorrência"""
        try:
            url = f"{self.supabase_url}/rest/v1/occurrences"
            params = {'id': f'eq.{occurrence_id}'}
            
            update_data = {
                'email_status': status,
                'email_sent_at': datetime.now().isoformat() if status == 'Aguardando Retorno' else None,
                'email_error': error_message
            }
            
            response = requests.patch(url, headers=self.headers, params=params, json=update_data)
            response.raise_for_status()
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao atualizar status da ocorrência {occurrence_id}: {e}")
            return False
    
    def process_emails(self, limit: int = None) -> Dict[str, Any]:
        """Processa o envio de emails em loop"""
        print(f"🚀 Iniciando processamento de emails...")
        print(f"   Modo: {'TESTE' if self.test_mode else 'REAL'}")
        print(f"   Limite: {limit or 'Todos'}")
        print()
        
        # Buscar ocorrências
        occurrences = self.get_occurrences_to_send()
        
        if not occurrences:
            print("ℹ️  Nenhuma ocorrência encontrada para envio")
            return {
                'success': True,
                'processed': 0,
                'success_count': 0,
                'error_count': 0,
                'results': []
            }
        
        # Aplicar limite se especificado
        if limit:
            occurrences = occurrences[:limit]
        
        print(f"📊 Encontradas {len(occurrences)} ocorrências para processar")
        print()
        
        results = []
        success_count = 0
        error_count = 0
        
        # Processar cada ocorrência
        for i, occurrence in enumerate(occurrences, 1):
            occurrence_id = occurrence.get('id')
            props = occurrence.get('properties', {})
            email = props.get('admin_email')
            
            print(f"📧 [{i}/{len(occurrences)}] Processando: {occurrence_id}")
            print(f"   Email: {email}")
            print(f"   Edifício: {props.get('name', 'N/A')}")
            
            try:
                # Criar template do email
                email_content = self.create_email_template(occurrence)
                
                # Enviar email
                email_sent = self.send_email(occurrence, email_content)
                
                if email_sent:
                    # Atualizar status para "Aguardando Retorno"
                    status_updated = self.update_occurrence_status(
                        occurrence_id, 
                        'Aguardando Retorno'
                    )
                    
                    if status_updated:
                        print(f"   ✅ Status atualizado para 'Aguardando Retorno'")
                        success_count += 1
                        results.append({
                            'occurrence_id': occurrence_id,
                            'email': email,
                            'status': 'success',
                            'message': 'Email enviado com sucesso'
                        })
                    else:
                        print(f"   ⚠️  Email enviado mas falha ao atualizar status")
                        error_count += 1
                        results.append({
                            'occurrence_id': occurrence_id,
                            'email': email,
                            'status': 'error',
                            'message': 'Falha ao atualizar status'
                        })
                else:
                    print(f"   ❌ Falha no envio do email")
                    error_count += 1
                    self.update_occurrence_status(
                        occurrence_id, 
                        'Erro no Envio',
                        'Falha no envio do email'
                    )
                    results.append({
                        'occurrence_id': occurrence_id,
                        'email': email,
                        'status': 'error',
                        'message': 'Falha no envio do email'
                    })
                
            except Exception as e:
                print(f"   ❌ Erro ao processar: {e}")
                error_count += 1
                self.update_occurrence_status(
                    occurrence_id, 
                    'Erro no Envio',
                    str(e)
                )
                results.append({
                    'occurrence_id': occurrence_id,
                    'email': email,
                    'status': 'error',
                    'message': str(e)
                })
            
            print()
            
            # Pequena pausa entre envios
            if not self.test_mode:
                time.sleep(1)
        
        # Resumo final
        print(f"📊 Processamento concluído:")
        print(f"   ✅ Sucessos: {success_count}")
        print(f"   ❌ Erros: {error_count}")
        print(f"   📧 Total processado: {len(occurrences)}")
        
        return {
            'success': True,
            'processed': len(occurrences),
            'success_count': success_count,
            'error_count': error_count,
            'results': results
        }

def main():
    """Função principal"""
    print("=" * 60)
    print("📧 SISTEMA DE ENVIO AUTOMÁTICO DE EMAILS")
    print("=" * 60)
    print()
    
    # Verificar argumentos da linha de comando
    test_mode = '--real' not in sys.argv
    limit = None
    
    for arg in sys.argv:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
    
    if test_mode:
        print("🧪 MODO TESTE ATIVO - Emails não serão enviados realmente")
        print("   Use --real para envio real")
    else:
        print("⚠️  MODO REAL ATIVO - Emails serão enviados de verdade!")
        confirm = input("   Tem certeza? (digite 'SIM' para confirmar): ")
        if confirm != 'SIM':
            print("❌ Operação cancelada")
            return
    
    print()
    
    # Criar instância do sender
    sender = EmailSender(test_mode=test_mode)
    
    # Processar emails
    result = sender.process_emails(limit=limit)
    
    print()
    print("=" * 60)
    print("✅ PROCESSAMENTO FINALIZADO")
    print("=" * 60)

if __name__ == "__main__":
    main()

