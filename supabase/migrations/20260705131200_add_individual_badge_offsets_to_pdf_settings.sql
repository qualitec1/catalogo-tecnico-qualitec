-- Adiciona colunas para controle individual de posicionamento (deslocamento X e Y) do ícone e do texto do badge
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_icon_offset_x TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_icon_offset_y TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_text_offset_x TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_text_offset_y TEXT DEFAULT '0px';

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
