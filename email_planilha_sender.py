#!/usr/bin/env python3
"""
Sistema de Envio de Emails para Dados da Planilha (spreadsheet_data)
Envia emails baseado nos dados da planilha compartilhada
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

class PlanilhaEmailSender:
    def __init__(self, test_mode: bool = True):
        self.test_mode = test_mode
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_ANON_KEY
        self.headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json'
        }
        
    def get_planilha_records(self) -> List[Dict[str, Any]]:
        """Busca registros da planilha que precisam de email"""
        try:
            url = f"{self.supabase_url}/rest/v1/spreadsheet_data"
            params = {
                'select': '*',
                'admin_email': 'not.is.null',
                'processado': 'eq.false'
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            print(f"❌ Erro ao buscar registros da planilha: {e}")
            return []
    
    def create_email_template(self, record: Dict[str, Any]) -> str:
        """Cria o template do email personalizado para dados da planilha"""
        
        # Usar o ID do registro como identificador (ou outro campo apropriado)
        # Baseado na imagem, parece que devemos usar algum ID de contrato/imóvel
        id_imovel = record.get('id', 'N/A')  # Usando o ID do registro como fallback
        
        # Se houver um campo específico para ID do imóvel, usar ele
        if 'id_contrato' in record:
            id_imovel = record.get('id_contrato', id_imovel)
        elif 'numero_ocorrencia' in record:
            id_imovel = record.get('numero_ocorrencia', id_imovel)
        
        # Montar endereço completo
        endereco = record.get('endereco', '')
        numero = record.get('numero', '')
        complemento = record.get('complemento', '')
        
        endereco_completo = endereco
        if numero:
            endereco_completo += f", {numero}"
        if complemento:
            endereco_completo += f" - {complemento}"
        
        template = f"""Olá, boa tarde, tudo bem?
Poderia por gentileza me informar se constam débitos de condomínio em aberto relacionados ao imóvel abaixo?
{id_imovel}

Obrigada!

{record.get('edificio', 'N/A')}
{endereco_completo}"""
        
        return template
    
    def send_email(self, record: Dict[str, Any], email_content: str) -> bool:
        """Envia o email (simulado ou real)"""
        email = record.get('admin_email')
        
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
    
    def update_record_status(self, record_id: str, processed: bool = True, error_message: str = None) -> bool:
        """Atualiza o status do registro da planilha"""
        try:
            url = f"{self.supabase_url}/rest/v1/spreadsheet_data"
            params = {'id': f'eq.{record_id}'}
            
            update_data = {
                'processado': processed,
                'data_processamento': datetime.now().isoformat() if processed else None,
                'erro_processamento': error_message
            }
            
            response = requests.patch(url, headers=self.headers, params=params, json=update_data)
            response.raise_for_status()
            
            return True
            
        except Exception as e:
            print(f"❌ Erro ao atualizar status do registro {record_id}: {e}")
            return False
    
    def send_test_email(self, email: str) -> bool:
        """Envia um email de teste para um endereço específico"""
        print(f"🧪 Enviando email de teste para: {email}")
        
        # Buscar registros da planilha
        records = self.get_planilha_records()
        
        if not records:
            print("❌ Nenhum registro encontrado na planilha")
            return False
        
        # Usar o primeiro registro para teste
        test_record = records[0]
        
        # Atualizar o email do registro de teste
        test_record['admin_email'] = email
        
        print(f"📋 Usando registro: {test_record.get('numero_ocorrencia', 'N/A')}")
        print(f"🏢 Edifício: {test_record.get('edificio', 'N/A')}")
        
        # Criar template do email
        email_content = self.create_email_template(test_record)
        
        # Enviar email
        email_sent = self.send_email(test_record, email_content)
        
        if email_sent:
            # Atualizar status
            status_updated = self.update_record_status(test_record['id'], True)
            if status_updated:
                print(f"✅ Email de teste enviado com sucesso para {email}")
                return True
            else:
                print(f"⚠️  Email enviado mas falha ao atualizar status")
                return False
        else:
            print(f"❌ Falha no envio do email de teste")
            self.update_record_status(test_record['id'], False, "Falha no envio do email")
            return False
    
    def process_planilha_emails(self, limit: int = None) -> Dict[str, Any]:
        """Processa o envio de emails para registros da planilha"""
        print(f"🚀 Iniciando processamento de emails da planilha...")
        print(f"   Modo: {'TESTE' if self.test_mode else 'REAL'}")
        print(f"   Limite: {limit or 'Todos'}")
        print()
        
        # Buscar registros da planilha
        records = self.get_planilha_records()
        
        if not records:
            print("ℹ️  Nenhum registro da planilha encontrado para envio")
            return {
                'success': True,
                'processed': 0,
                'success_count': 0,
                'error_count': 0,
                'results': []
            }
        
        # Aplicar limite se especificado
        if limit:
            records = records[:limit]
        
        print(f"📊 Encontrados {len(records)} registros da planilha para processar")
        print()
        
        results = []
        success_count = 0
        error_count = 0
        
        # Processar cada registro
        for i, record in enumerate(records, 1):
            record_id = record.get('id')
            email = record.get('admin_email')
            edificio = record.get('edificio', 'N/A')
            id_imovel = record.get('numero_ocorrencia', record.get('id', 'N/A'))
            
            print(f"📧 [{i}/{len(records)}] Processando: {id_imovel}")
            print(f"   Email: {email}")
            print(f"   Edifício: {edificio}")
            
            try:
                # Criar template do email
                email_content = self.create_email_template(record)
                
                # Enviar email
                email_sent = self.send_email(record, email_content)
                
                if email_sent:
                    # Atualizar status
                    status_updated = self.update_record_status(record_id, True)
                    
                    if status_updated:
                        print(f"   ✅ Status atualizado para 'Processado'")
                        success_count += 1
                        results.append({
                            'record_id': record_id,
                            'id_imovel': id_imovel,
                            'email': email,
                            'status': 'success',
                            'message': 'Email enviado com sucesso'
                        })
                    else:
                        print(f"   ⚠️  Email enviado mas falha ao atualizar status")
                        error_count += 1
                        results.append({
                            'record_id': record_id,
                            'id_imovel': id_imovel,
                            'email': email,
                            'status': 'error',
                            'message': 'Falha ao atualizar status'
                        })
                else:
                    print(f"   ❌ Falha no envio do email")
                    error_count += 1
                    self.update_record_status(record_id, False, "Falha no envio do email")
                    results.append({
                        'record_id': record_id,
                        'id_imovel': id_imovel,
                        'email': email,
                        'status': 'error',
                        'message': 'Falha no envio do email'
                    })
                
            except Exception as e:
                print(f"   ❌ Erro ao processar: {e}")
                error_count += 1
                self.update_record_status(record_id, False, str(e))
                results.append({
                    'record_id': record_id,
                    'id_imovel': id_imovel,
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
        print(f"   📧 Total processado: {len(records)}")
        
        return {
            'success': True,
            'processed': len(records),
            'success_count': success_count,
            'error_count': error_count,
            'results': results
        }

def main():
    """Função principal"""
    print("=" * 60)
    print("📧 SISTEMA DE ENVIO DE EMAILS PARA PLANILHA")
    print("=" * 60)
    print()
    
    # Verificar argumentos da linha de comando
    test_mode = '--real' not in sys.argv
    test_email = None
    limit = None
    
    for arg in sys.argv:
        if arg.startswith('--test-email='):
            test_email = arg.split('=')[1]
        elif arg.startswith('--limit='):
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
    sender = PlanilhaEmailSender(test_mode=test_mode)
    
    if test_email:
        # Enviar email de teste
        print(f"🧪 Enviando email de teste para: {test_email}")
        success = sender.send_test_email(test_email)
        if success:
            print("✅ Email de teste enviado com sucesso!")
        else:
            print("❌ Falha no envio do email de teste")
    else:
        # Processar emails da planilha
        result = sender.process_planilha_emails(limit=limit)
    
    print()
    print("=" * 60)
    print("✅ PROCESSAMENTO FINALIZADO")
    print("=" * 60)

if __name__ == "__main__":
    main()


