# Migrations - Catálogo Técnico Qualitec

## Como aplicar migrations

### Opção 1: Via Supabase Dashboard (Recomendado)
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo de migration desejado
5. Copie e cole o conteúdo no editor
6. Clique em **Run**

### Opção 2: Via Supabase CLI
```bash
supabase db push
```

## Migrations Disponíveis

### `create_uploaded_files_table.sql`
Cria a tabela `uploaded_files` para armazenar histórico de arquivos enviados ao R2.

**Quando aplicar:** Antes de usar a funcionalidade de Upload de Arquivos no painel admin.

**O que faz:**
- Cria tabela `uploaded_files` com campos:
  - id (BIGSERIAL PRIMARY KEY)
  - filename (nome do arquivo no R2)
  - original_filename (nome original do arquivo)
  - file_url (URL pública do R2)
  - file_type (MIME type)
  - file_size (tamanho em bytes)
  - uploaded_at (data/hora do upload)
  - uploaded_by (usuário que fez o upload)
  - description (descrição opcional)
- Cria índices para otimizar buscas
- Configura Row Level Security (RLS) policies

## Verificar se migration foi aplicada

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'uploaded_files';
```

Se retornar uma linha, a migration foi aplicada com sucesso.
