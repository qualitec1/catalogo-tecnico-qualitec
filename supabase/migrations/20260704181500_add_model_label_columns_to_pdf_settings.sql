-- Add model label styling and positioning columns to pdf_settings
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_font_size TEXT DEFAULT '8px';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_offset_x TEXT DEFAULT '0px';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_offset_y TEXT DEFAULT '0px';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_font_family TEXT DEFAULT 'Inter';
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_bold BOOLEAN DEFAULT false;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_italic BOOLEAN DEFAULT false;
ALTER TABLE pdf_settings ADD COLUMN IF NOT EXISTS card_model_label_underline BOOLEAN DEFAULT false;
