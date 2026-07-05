-- Adiciona colunas para ícone e texto do badge que fica acima do título do cabeçalho
ALTER TABLE public.category_assets ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT NULL;
ALTER TABLE public.category_assets ADD COLUMN IF NOT EXISTS badge_icon_url TEXT DEFAULT NULL;

-- Atualiza o cache da API
NOTIFY pgrst, 'reload schema';
