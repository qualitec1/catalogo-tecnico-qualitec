-- Atualizar fonte padrão de todas as categorias para Verdana
ALTER TABLE public.pdf_settings ALTER COLUMN card_title_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN card_model_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN card_model_label_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN specs_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN title_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN tag_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN badge_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN cover_title_font_family SET DEFAULT 'Verdana';
ALTER TABLE public.pdf_settings ALTER COLUMN cover_subtitle_font_family SET DEFAULT 'Verdana';

UPDATE public.pdf_settings 
SET 
    card_title_font_family = 'Verdana',
    card_model_font_family = 'Verdana',
    card_model_label_font_family = 'Verdana',
    specs_font_family = 'Verdana',
    title_font_family = 'Verdana',
    tag_font_family = 'Verdana',
    badge_font_family = 'Verdana',
    cover_title_font_family = 'Verdana',
    cover_subtitle_font_family = 'Verdana';

UPDATE public.pdf_settings
SET layout_settings = (
    SELECT jsonb_object_agg(
        key,
        value || jsonb_build_object(
            'cardTitleFontFamily', 'Verdana',
            'cardModelFontFamily', 'Verdana',
            'cardModelLabelFontFamily', 'Verdana',
            'specsFontFamily', 'Verdana',
            'titleFontFamily', 'Verdana',
            'tagFontFamily', 'Verdana',
            'coverTitleFontFamily', 'Verdana',
            'coverSubtitleFontFamily', 'Verdana'
        )
    )
    FROM jsonb_each(layout_settings)
)
WHERE layout_settings IS NOT NULL AND layout_settings != '{}'::jsonb;
