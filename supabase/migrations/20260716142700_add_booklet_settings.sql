-- Add booklet settings to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS booklet_image_scale numeric DEFAULT 1.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS booklet_image_offset_x integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS booklet_image_offset_y integer DEFAULT 0;

-- Add booklet settings to pdf_settings table
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS booklet_pdf_image_scale numeric DEFAULT 1.0;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS booklet_pdf_image_scale_x numeric DEFAULT 1.0;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS booklet_pdf_image_scale_y numeric DEFAULT 1.0;
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS booklet_product_image_offset_x text DEFAULT '0px';
ALTER TABLE public.pdf_settings ADD COLUMN IF NOT EXISTS booklet_product_image_offset_y text DEFAULT '0px';
