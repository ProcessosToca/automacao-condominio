import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Occurrence = Database['public']['Tables']['occurrences']['Row'];
type OccurrenceInsert = Database['public']['Tables']['occurrences']['Insert'];
type OccurrenceUpdate = Database['public']['Tables']['occurrences']['Update'];
type Property = Database['public']['Tables']['properties']['Row'];

export class OccurrenceService {
  // Buscar todas as ocorrências
  static async getAllOccurrences(): Promise<Occurrence[]> {
    try {
      const { data, error } = await supabase
        .from('occurrences')
        .select(`
          *,
          properties (
            id,
            name,
            address,
            admin_name,
            admin_phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw new Error('Falha ao buscar ocorrências');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Buscar ocorrências por propriedade
  static async getOccurrencesByProperty(propertyId: string): Promise<Occurrence[]> {
    try {
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ocorrências da propriedade:', error);
        throw new Error('Falha ao buscar ocorrências da propriedade');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Criar nova ocorrência
  static async createOccurrence(occurrenceData: OccurrenceInsert): Promise<Occurrence> {
    try {
      const { data, error } = await supabase
        .from('occurrences')
        .insert(occurrenceData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ocorrência:', error);
        throw new Error('Falha ao criar ocorrência');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Atualizar ocorrência
  static async updateOccurrence(id: string, updates: OccurrenceUpdate): Promise<Occurrence> {
    try {
      const { data, error } = await supabase
        .from('occurrences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ocorrência:', error);
        throw new Error('Falha ao atualizar ocorrência');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Atualizar status da ocorrência
  static async updateOccurrenceStatus(id: string, status: Database['public']['Enums']['occurrence_status']): Promise<Occurrence> {
    try {
      const { data, error } = await supabase
        .from('occurrences')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status da ocorrência:', error);
        throw new Error('Falha ao atualizar status da ocorrência');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Deletar ocorrência
  static async deleteOccurrence(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('occurrences')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ocorrência:', error);
        throw new Error('Falha ao deletar ocorrência');
      }
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

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
}
