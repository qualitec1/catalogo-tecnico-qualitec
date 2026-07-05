-- Add card_model_label_text to pdf_settings
ALTER TABLE public.pdf_settings 
ADD COLUMN IF NOT EXISTS card_model_label_text TEXT DEFAULT 'Modelo';
