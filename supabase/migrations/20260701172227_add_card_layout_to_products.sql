-- Add card_layout column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS card_layout text;
