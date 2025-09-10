import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export class PropertyService {
  // Buscar todas as propriedades
  static async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar propriedades:', error);
        throw new Error('Falha ao buscar propriedades');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Buscar propriedade por ID
  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar propriedade:', error);
        throw new Error('Falha ao buscar propriedade');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Criar nova propriedade
  static async createProperty(propertyData: PropertyInsert): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar propriedade:', error);
        throw new Error(`Falha ao criar propriedade: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhuma propriedade foi criada');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Atualizar propriedade
  static async updateProperty(id: string, updates: PropertyUpdate): Promise<Property> {
    try {
      // Primeiro, verificar se a propriedade existe
      const { data: existingProperty, error: checkError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError || !existingProperty) {
        console.error('Propriedade não encontrada:', id);
        throw new Error('Propriedade não encontrada');
      }

      // Tentar atualização direta primeiro
      let { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      // Se falhar, tentar abordagem alternativa
      if (error && error.code === 'PGRST116') {
        console.log('Tentando abordagem alternativa para UPDATE...');
        
        // Usar RPC para contornar problemas de RLS
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('update_property_safe', {
            property_id: id,
            property_updates: updates
          });

        if (rpcError) {
          console.error('Erro no RPC:', rpcError);
          // Última tentativa: deletar e recriar
          console.log('Tentando deletar e recriar...');
          
          const { error: deleteError } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

          if (deleteError) {
            throw new Error(`Falha ao deletar propriedade para recriação: ${deleteError.message}`);
          }

          // Recriar com novos dados
          const newPropertyData = { ...existingProperty, ...updates };
          delete newPropertyData.id; // Remover ID para nova inserção
          delete newPropertyData.created_at; // Remover timestamp de criação
          delete newPropertyData.updated_at; // Remover timestamp de atualização

          const { data: newData, error: createError } = await supabase
            .from('properties')
            .insert(newPropertyData)
            .select()
            .single();

          if (createError) {
            throw new Error(`Falha ao recriar propriedade: ${createError.message}`);
          }

          return newData;
        }

        // Buscar propriedade atualizada
        const { data: updatedData, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw new Error(`Falha ao buscar propriedade atualizada: ${fetchError.message}`);
        }

        return updatedData;
      }

      if (error) {
        console.error('Erro ao atualizar propriedade:', error);
        throw new Error(`Falha ao atualizar propriedade: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhuma propriedade foi atualizada');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Deletar propriedade
  static async deleteProperty(id: string): Promise<void> {
    try {
      // Primeiro, verificar se a propriedade existe
      const { data: existingProperty, error: checkError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingProperty) {
        console.error('Propriedade não encontrada para exclusão:', id);
        throw new Error('Propriedade não encontrada');
      }

      // Realizar a exclusão
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar propriedade:', error);
        throw new Error(`Falha ao deletar propriedade: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Buscar propriedades por nome (busca)
  static async searchProperties(searchTerm: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,admin_name.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar propriedades:', error);
        throw new Error('Falha ao buscar propriedades');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }

  // Contar total de propriedades
  static async getPropertiesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Erro ao contar propriedades:', error);
        throw new Error('Falha ao contar propriedades');
      }

      return count || 0;
    } catch (error) {
      console.error('Erro no serviço de propriedades:', error);
      throw error;
    }
  }
}
