-- Migration to add missing card_header_layout column to pdf_settings
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS card_header_layout text DEFAULT 'model-left';
