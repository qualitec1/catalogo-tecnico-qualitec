-- Change default product image offsets from centered (0px) to Y=16px, X=-10px
-- This makes new categories automatically use the correct photo positioning

-- Update column defaults for new rows
ALTER TABLE public.pdf_settings ALTER COLUMN product_image_offset_y SET DEFAULT '16px';
ALTER TABLE public.pdf_settings ALTER COLUMN product_image_offset_x SET DEFAULT '-10px';

-- Update existing rows that still have the old default (0px) to the new default
UPDATE public.pdf_settings 
SET product_image_offset_y = '16px' 
WHERE product_image_offset_y IS NULL OR product_image_offset_y = '0px';

UPDATE public.pdf_settings 
SET product_image_offset_x = '-10px' 
WHERE product_image_offset_x IS NULL OR product_image_offset_x = '0px';
