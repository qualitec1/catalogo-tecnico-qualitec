-- Adiciona colunas para cores personalizadas dos textos
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS card_title_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS card_model_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS tag_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_color TEXT DEFAULT '#374151';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS specs_val_color TEXT DEFAULT '#000000';

-- Atualiza o cache da API
NOTIFY pgrst, 'reload schema';
