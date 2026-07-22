-- Change card font families from Inter to Calibri
ALTER TABLE public.pdf_settings ALTER COLUMN card_title_font_family SET DEFAULT 'Calibri';
ALTER TABLE public.pdf_settings ALTER COLUMN card_model_font_family SET DEFAULT 'Calibri';
ALTER TABLE public.pdf_settings ALTER COLUMN card_model_label_font_family SET DEFAULT 'Calibri';

UPDATE public.pdf_settings SET card_title_font_family = 'Calibri' WHERE card_title_font_family = 'Inter' OR card_title_font_family IS NULL;
UPDATE public.pdf_settings SET card_model_font_family = 'Calibri' WHERE card_model_font_family = 'Inter' OR card_model_font_family IS NULL;
UPDATE public.pdf_settings SET card_model_label_font_family = 'Calibri' WHERE card_model_label_font_family = 'Inter' OR card_model_label_font_family IS NULL;
