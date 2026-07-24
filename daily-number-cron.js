import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from the script's directory
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.SUPABASE_URL && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.join(__dirname, '.env'));
  } catch (e) {
    // ignore
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: SUPABASE_URL e chave do Supabase não encontradas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function runDailyCron() {
  try {
    console.log(`[${new Date().toISOString()}] Executando rotina diária no Supabase...`);
    const { data, error } = await supabase
      .from('daily_runs')
      .insert([{ numeral: 1 }])
      .select();

    if (error) {
      console.error('Erro ao inserir registro na tabela daily_runs:', error);
      process.exit(1);
    }

    console.log('Registro inserido com sucesso em daily_runs:', data);
    process.exit(0);
  } catch (err) {
    console.error('Erro de execução inesperado:', err);
    process.exit(1);
  }
}

runDailyCron();
