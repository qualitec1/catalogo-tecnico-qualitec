-- Adiciona colunas para estilização do badge na tabela pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_icon_size TEXT DEFAULT '4.5mm';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_font_family TEXT DEFAULT 'Inter';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_font_size TEXT DEFAULT '8pt';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '#334155';

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
