import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CloudConfig } from '../types';

const STORAGE_CLOUD_KEY = 'laser_sigeo_cloud_config_v1';

export function getSavedCloudConfig(): CloudConfig {
  const saved = localStorage.getItem(STORAGE_CLOUD_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    isConnected: false,
    autoSync: false
  };
}

export function saveCloudConfig(config: CloudConfig) {
  localStorage.setItem(STORAGE_CLOUD_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: CloudConfig): SupabaseClient | null {
  const activeConfig = config || getSavedCloudConfig();

  if (!activeConfig.supabaseUrl || !activeConfig.supabaseAnonKey) {
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(activeConfig.supabaseUrl, activeConfig.supabaseAnonKey);
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Erro ao inicializar Supabase Client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL e Anon Key do Supabase são obrigatórias.' };
  }

  try {
    const testClient = createClient(url, key);
    const { data, error } = await testClient.from('laboratorios').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }

    return { success: true, message: 'Conexão com o banco Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err?.message || err}` };
  }
}
