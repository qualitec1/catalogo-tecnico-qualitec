-- Adiciona colunas para controle de posicionamento (deslocamento X e Y) do badge em pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_position_x TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_position_y TEXT DEFAULT '0px';

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
