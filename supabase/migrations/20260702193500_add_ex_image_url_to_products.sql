-- Migration to add ex_image_url column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ex_image_url text DEFAULT NULL;
