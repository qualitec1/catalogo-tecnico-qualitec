-- Tabela para armazenar histórico de arquivos enviados para R2
CREATE TABLE IF NOT EXISTS uploaded_files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT,
  description TEXT
);

-- Índice para busca rápida por nome
CREATE INDEX IF NOT EXISTS idx_uploaded_files_filename ON uploaded_files(filename);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at DESC);

-- RLS policies
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Policy para permitir leitura pública
CREATE POLICY "Allow public read uploaded_files" ON uploaded_files
  FOR SELECT USING (true);

-- Policy para permitir inserção pública
CREATE POLICY "Allow public insert uploaded_files" ON uploaded_files
  FOR INSERT WITH CHECK (true);

-- Policy para permitir atualização pública
CREATE POLICY "Allow public update uploaded_files" ON uploaded_files
  FOR UPDATE USING (true);

-- Policy para permitir deleção pública
CREATE POLICY "Allow public delete uploaded_files" ON uploaded_files
  FOR DELETE USING (true);
