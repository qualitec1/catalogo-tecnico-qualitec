-- Adiciona colunas para estilização e posicionamento do título e subtítulo da capa do PDF
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_font_family TEXT DEFAULT 'Helvetica';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_font_size TEXT DEFAULT '20px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_bold BOOLEAN DEFAULT true;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_italic BOOLEAN DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_underline BOOLEAN DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_offset_x TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_title_offset_y TEXT DEFAULT '0px';

ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_text TEXT DEFAULT 'CATÁLOGO DE PRODUTOS';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_font_family TEXT DEFAULT 'Helvetica';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_font_size TEXT DEFAULT '8px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_bold BOOLEAN DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_italic BOOLEAN DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_underline BOOLEAN DEFAULT false;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_offset_x TEXT DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS cover_subtitle_offset_y TEXT DEFAULT '0px';

-- Atualiza o cache da API
NOTIFY pgrst, 'reload schema';
