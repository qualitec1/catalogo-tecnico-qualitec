-- Add card_title_font_size to pdf_settings
ALTER TABLE public.pdf_settings 
ADD COLUMN IF NOT EXISTS card_title_font_size TEXT DEFAULT '14px';
