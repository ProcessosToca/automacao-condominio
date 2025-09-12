#!/usr/bin/env python3
"""
Script para enviar email real para pedrorainville11@gmail.com
"""

import requests
import json
from datetime import datetime

# Configuração do Supabase
SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM"

def send_real_email():
    print("=" * 60)
    print("📧 ENVIANDO EMAIL REAL PARA PLANILHA")
    print("=" * 60)
    print()
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    # 1. Criar ocorrência de teste com dados da planilha
    print("1. Criando ocorrência de teste com dados da planilha...")
    try:
        # Primeiro, atualizar a propriedade com os dados da planilha
        property_url = f"{SUPABASE_URL}/rest/v1/properties"
        property_params = {'id': 'eq.245d6ca0-0f71-4ad3-b2a1-19de8d75e349'}
        property_update = {
            'admin_email': 'pedrorainville11@gmail.com',
            'name': 'Edifício Teste - Pedro Rainville',
            'address': 'Rua Teste, 123\nApto 45'
        }
        
        property_response = requests.patch(property_url, headers=headers, params=property_params, json=property_update)
        if property_response.status_code == 200:
            print("✅ Propriedade atualizada com dados da planilha")
        else:
            print(f"⚠️  Aviso ao atualizar propriedade: {property_response.status_code}")
        
        # Criar ocorrência de teste
        occurrence_url = f"{SUPABASE_URL}/rest/v1/occurrences"
        occurrence_data = {
            "title": "Teste de Email - Dados da Planilha",
            "description": "Registro criado para teste com dados da planilha",
            "status": "open",
            "priority": "medium",
            "admin_name": "Pedro Rainville",
            "admin_phone": "(11) 99999-9999",
            "responsible_collector": "Sistema de Teste",
            "property_id": "245d6ca0-0f71-4ad3-b2a1-19de8d75e349",
            "email_status": "Não enviado"
        }
        
        occurrence_response = requests.post(occurrence_url, headers=headers, json=occurrence_data)
        if occurrence_response.status_code == 201:
            occurrence_result = occurrence_response.json()
            occurrence_id = occurrence_result[0]['id'] if isinstance(occurrence_result, list) else occurrence_result['id']
            print(f"✅ Ocorrência de teste criada com ID: {occurrence_id}")
        else:
            print(f"❌ Erro ao criar ocorrência: {occurrence_response.status_code}")
            return
            
    except Exception as e:
        print(f"❌ Erro ao criar dados de teste: {e}")
        return
    
    # 2. Enviar email via Edge Function
    print("2. Enviando email via Edge Function...")
    try:
        function_url = f"{SUPABASE_URL}/functions/v1/send-bulk-emails"
        function_headers = {
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Usar dados da planilha
        function_data = {
            "limit": 1,
            "testMode": False  # Modo real
        }
        
        function_response = requests.post(function_url, headers=function_headers, json=function_data)
        
        if function_response.status_code == 200:
            result = function_response.json()
            print("✅ Email enviado com sucesso!")
            print(f"   Resultado: {result.get('message', 'N/A')}")
            print(f"   Processados: {result.get('processed', 0)}")
            
            if result.get('results'):
                for res in result['results']:
                    print(f"   Email: {res.get('email')}")
                    print(f"   Status: {res.get('status')}")
                    print(f"   Mensagem: {res.get('message')}")
        else:
            print(f"❌ Erro ao enviar email: {function_response.status_code}")
            print(f"   Resposta: {function_response.text}")
    
    except Exception as e:
        print(f"❌ Erro geral: {e}")
    
    print()
    print("=" * 60)
    print("✅ PROCESSAMENTO FINALIZADO")
    print("=" * 60)

if __name__ == "__main__":
    send_real_email()
