#!/usr/bin/env python3
"""
Script Python para processar envio de emails em massa
Sistema de controle e logging para envio de emails de ocorrências
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any

class BulkEmailProcessor:
    def __init__(self, supabase_url: str, supabase_anon_key: str):
        self.supabase_url = supabase_url
        self.supabase_anon_key = supabase_anon_key
        self.headers = {
            'apikey': supabase_anon_key,
            'Authorization': f'Bearer {supabase_anon_key}',
            'Content-Type': 'application/json'
        }
        
    def get_occurrences_stats(self) -> Dict[str, int]:
        """Busca estatísticas das ocorrências por status de email"""
        try:
            # Buscar contagem por status
            response = requests.post(
                f"{self.supabase_url}/rest/v1/rpc/get_email_stats",
                headers=self.headers,
                json={}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                # Fallback: buscar dados diretamente
                return self._get_stats_fallback()
                
        except Exception as e:
            print(f"❌ Erro ao buscar estatísticas: {e}")
            return self._get_stats_fallback()
    
    def _get_stats_fallback(self) -> Dict[str, int]:
        """Método fallback para buscar estatísticas"""
        try:
            # Buscar todas as ocorrências e contar
            response = requests.get(
                f"{self.supabase_url}/rest/v1/occurrences?select=email_status",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                stats = {
                    'nao_enviado': 0,
                    'aguardando_retorno': 0,
                    'enviado': 0,
                    'erro_no_envio': 0,
                    'total': len(data)
                }
                
                for item in data:
                    status = item.get('email_status', 'Não enviado')
                    if status == 'Não enviado':
                        stats['nao_enviado'] += 1
                    elif status == 'Aguardando Retorno':
                        stats['aguardando_retorno'] += 1
                    elif status == 'Enviado':
                        stats['enviado'] += 1
                    elif status == 'Erro no Envio':
                        stats['erro_no_envio'] += 1
                
                return stats
            else:
                return {'error': f'Erro HTTP {response.status_code}'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def process_emails(self, limit: int = 10, test_mode: bool = True) -> Dict[str, Any]:
        """Processa envio de emails em lote"""
        try:
            # Chamar Edge Function
            function_url = f"{self.supabase_url}/functions/v1/send-bulk-emails"
            
            payload = {
                'limit': limit,
                'testMode': test_mode
            }
            
            print(f"🚀 Iniciando processamento de emails...")
            print(f"   📊 Limite: {limit} emails")
            print(f"   🧪 Modo teste: {'Sim' if test_mode else 'Não'}")
            print()
            
            response = requests.post(
                function_url,
                headers=self.headers,
                json=payload,
                timeout=300  # 5 minutos timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f'Erro HTTP {response.status_code}: {response.text}'
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Timeout - Processamento demorou mais que 5 minutos'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def reset_email_status(self, occurrence_ids: List[str] = None) -> Dict[str, Any]:
        """Reset do status de email para 'Não enviado'"""
        try:
            if occurrence_ids:
                # Reset específico por IDs
                for occ_id in occurrence_ids:
                    response = requests.patch(
                        f"{self.supabase_url}/rest/v1/occurrences?id=eq.{occ_id}",
                        headers=self.headers,
                        json={
                            'email_status': 'Não enviado',
                            'email_sent_at': None,
                            'email_error': None
                        }
                    )
                    if response.status_code != 200:
                        print(f"❌ Erro ao resetar ocorrência {occ_id}")
            else:
                # Reset de todas as ocorrências com erro
                response = requests.patch(
                    f"{self.supabase_url}/rest/v1/occurrences?email_status=eq.Erro no Envio",
                    headers=self.headers,
                    json={
                        'email_status': 'Não enviado',
                        'email_sent_at': None,
                        'email_error': None
                    }
                )
                
                if response.status_code == 200:
                    return {'success': True, 'message': 'Status resetado com sucesso'}
                else:
                    return {'success': False, 'error': f'Erro HTTP {response.status_code}'}
                    
        except Exception as e:
            return {'success': False, 'error': str(e)}

def print_banner():
    """Imprime banner do sistema"""
    print("=" * 60)
    print("📧 SISTEMA DE ENVIO DE EMAILS EM MASSA")
    print("   Inteliscribe Engine - Processador de Ocorrências")
    print("=" * 60)
    print()

def print_stats(stats: Dict[str, int]):
    """Imprime estatísticas formatadas"""
    print("📊 ESTATÍSTICAS ATUAIS:")
    print(f"   🔴 Não enviado: {stats.get('nao_enviado', 0)}")
    print(f"   🟡 Aguardando Retorno: {stats.get('aguardando_retorno', 0)}")
    print(f"   🟢 Enviado: {stats.get('enviado', 0)}")
    print(f"   ❌ Erro no Envio: {stats.get('erro_no_envio', 0)}")
    print(f"   📈 Total: {stats.get('total', 0)}")
    print()

def print_results(result: Dict[str, Any]):
    """Imprime resultados do processamento"""
    if result['success']:
        data = result['data']
        print("✅ PROCESSAMENTO CONCLUÍDO!")
        print(f"   📧 Emails processados: {data.get('processed', 0)}")
        print(f"   🧪 Modo teste: {'Sim' if data.get('testMode') else 'Não'}")
        print(f"   💬 Mensagem: {data.get('message', '')}")
        
        if 'results' in data:
            print("\n📋 DETALHES:")
            for res in data['results']:
                status_icon = "✅" if res['status'] == 'success' else "❌"
                print(f"   {status_icon} {res['occurrenceId']} -> {res['email']}")
                if res['status'] == 'error':
                    print(f"      Erro: {res['message']}")
    else:
        print("❌ ERRO NO PROCESSAMENTO:")
        print(f"   {result['error']}")

def main():
    """Função principal"""
    print_banner()
    
    # Configurações do Supabase
    SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
    
    processor = BulkEmailProcessor(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    while True:
        print("🎯 OPÇÕES DISPONÍVEIS:")
        print("   1. Ver estatísticas")
        print("   2. Processar emails (modo teste)")
        print("   3. Processar emails (modo produção)")
        print("   4. Reset status de emails com erro")
        print("   5. Sair")
        print()
        
        try:
            choice = input("Escolha uma opção (1-5): ").strip()
            
            if choice == '1':
                print("📊 Buscando estatísticas...")
                stats = processor.get_occurrences_stats()
                if 'error' not in stats:
                    print_stats(stats)
                else:
                    print(f"❌ Erro: {stats['error']}")
                    
            elif choice == '2':
                limit = int(input("Quantos emails processar? (padrão: 10): ") or "10")
                print(f"🧪 Processando {limit} emails em modo TESTE...")
                result = processor.process_emails(limit=limit, test_mode=True)
                print_results(result)
                
            elif choice == '3':
                confirm = input("⚠️  ATENÇÃO: Modo PRODUÇÃO enviará emails reais! Continuar? (s/N): ")
                if confirm.lower() in ['s', 'sim', 'y', 'yes']:
                    limit = int(input("Quantos emails processar? (padrão: 5): ") or "5")
                    print(f"🚀 Processando {limit} emails em modo PRODUÇÃO...")
                    result = processor.process_emails(limit=limit, test_mode=False)
                    print_results(result)
                else:
                    print("❌ Operação cancelada.")
                    
            elif choice == '4':
                confirm = input("Resetar status de emails com erro? (s/N): ")
                if confirm.lower() in ['s', 'sim', 'y', 'yes']:
                    result = processor.reset_email_status()
                    if result['success']:
                        print("✅ Status resetado com sucesso!")
                    else:
                        print(f"❌ Erro: {result['error']}")
                else:
                    print("❌ Operação cancelada.")
                    
            elif choice == '5':
                print("👋 Saindo do sistema...")
                break
                
            else:
                print("❌ Opção inválida. Tente novamente.")
                
        except KeyboardInterrupt:
            print("\n👋 Saindo do sistema...")
            break
        except ValueError:
            print("❌ Valor inválido. Tente novamente.")
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
        
        print("\n" + "-" * 60 + "\n")

if __name__ == "__main__":
    main()

