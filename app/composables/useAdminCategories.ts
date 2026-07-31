import { ref } from 'vue'
import { hexToBase64 } from '../utils/image'

export const cleanupDuplicateCategories = async (supabase: any) => {
  try {
    const canonicals = [
      'GERAL',
      'VÁLVULAS CRIOGÊNICAS',
      'TRANSMISSORES DE PRESSÃO',
      'VÁLVULAS 3 VIAS',
      'VÁLVULAS DE SEGURANÇA',
      'VÁLVULAS GLOBO'
    ]

    const { data: assets } = await supabase.from('category_assets').select('id, category')
    const { data: pdfSettings } = await supabase.from('pdf_settings').select('id, category')

    if (!assets || assets.length === 0) return

    const normalizeCat = (text: string) => {
      return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const aliasMap: Record<string, string> = {
      '3 WAY VALVE': 'VÁLVULAS 3 VIAS',
      '3 WAY VALVES': 'VÁLVULAS 3 VIAS',
      '3-WAY VALVE': 'VÁLVULAS 3 VIAS',
      '3-WAY VALVES': 'VÁLVULAS 3 VIAS',
      '3 WEGE VENTIL': 'VÁLVULAS 3 VIAS',
      '3 WEGE VENTILE': 'VÁLVULAS 3 VIAS',
      '3-WEGE VENTIL': 'VÁLVULAS 3 VIAS',
      '3-WEGE-VENTIL': 'VÁLVULAS 3 VIAS',
      '3-WEGE-VENTILE': 'VÁLVULAS 3 VIAS',
      'VALVULAS 3 VIAS': 'VÁLVULAS 3 VIAS',

      'CRYOGENIC VALVE': 'VÁLVULAS CRIOGÊNICAS',
      'CRYOGENIC VALVES': 'VÁLVULAS CRIOGÊNICAS',
      'KRYO VENTIL': 'VÁLVULAS CRIOGÊNICAS',
      'KRYO VENTILE': 'VÁLVULAS CRIOGÊNICAS',
      'KRYO-VENTIL': 'VÁLVULAS CRIOGÊNICAS',
      'KRYO-VENTILE': 'VÁLVULAS CRIOGÊNICAS',
      'KRYOVENTIL': 'VÁLVULAS CRIOGÊNICAS',
      'KRYOVENTILE': 'VÁLVULAS CRIOGÊNICAS',
      'VALVULAS CRIOGENICAS': 'VÁLVULAS CRIOGÊNICAS',

      'SAFETY VALVE': 'VÁLVULAS DE SEGURANÇA',
      'SAFETY VALVES': 'VÁLVULAS DE SEGURANÇA',
      'SICHERHEITSVENTIL': 'VÁLVULAS DE SEGURANÇA',
      'SICHERHEITSVENTILE': 'VÁLVULAS DE SEGURANÇA',
      'VALVULAS DE SEGURANCA': 'VÁLVULAS DE SEGURANÇA',

      'GLOBE VALVE': 'VÁLVULAS GLOBO',
      'GLOBE VALVES': 'VÁLVULAS GLOBO',
      'VENTIL': 'VÁLVULAS GLOBO',
      'VENTILE': 'VÁLVULAS GLOBO',
      'VALVULAS GLOBO': 'VÁLVULAS GLOBO',

      'PRESSURE TRANSMITTER': 'TRANSMISSORES DE PRESSÃO',
      'PRESSURE TRANSMITTERS': 'TRANSMISSORES DE PRESSÃO',
      'DRUCKMESSUMFORMER': 'TRANSMISSORES DE PRESSÃO',
      'DRUCKUMFORMER': 'TRANSMISSORES DE PRESSÃO',
      'TRANSMISSORES DE PRESSAO': 'TRANSMISSORES DE PRESSÃO',

      'GERAL': 'GERAL',
      'GENERAL': 'GERAL',
      'ALLGEMEIN': 'GERAL'
    }

    const normAliasMap: Record<string, string> = {}
    for (const [k, v] of Object.entries(aliasMap)) {
      normAliasMap[normalizeCat(k)] = v
    }

    const deleteAssetIds: string[] = []
    let cleanedAny = false

    for (const asset of assets) {
      const cat = asset.category
      if (canonicals.includes(cat)) continue

      const norm = normalizeCat(cat)
      let canonicalTarget = normAliasMap[norm] || null

      if (!canonicalTarget) {
        for (const can of canonicals) {
          if (normalizeCat(can) === norm) {
            canonicalTarget = can
            break
          }
        }
      }

      if (canonicalTarget && canonicalTarget !== cat) {
        await supabase.from('products').update({ category: canonicalTarget }).eq('category', cat)
        deleteAssetIds.push(asset.id)
        cleanedAny = true
      }
    }

    if (deleteAssetIds.length > 0) {
      await supabase.from('category_assets').delete().in('id', deleteAssetIds)
    }

    if (pdfSettings) {
      const deleteSettingsIds: string[] = []
      for (const setting of pdfSettings) {
        const cat = setting.category
        if (canonicals.includes(cat)) continue

        const norm = normalizeCat(cat)
        let canonicalTarget = normAliasMap[norm] || null
        if (!canonicalTarget) {
          for (const can of canonicals) {
            if (normalizeCat(can) === norm) {
              canonicalTarget = can
              break
            }
          }
        }

        if (canonicalTarget && canonicalTarget !== cat) {
          deleteSettingsIds.push(setting.id)
          cleanedAny = true
        }
      }
      if (deleteSettingsIds.length > 0) {
        await supabase.from('pdf_settings').delete().in('id', deleteSettingsIds)
      }
    }

    if (cleanedAny) {
      console.log('[Cleanup] Duplicate categories cleaned successfully!')
    }
  } catch (err) {
    console.error('[Cleanup Error]', err)
  }
}

export function useAdminCategories(triggerToast: (msg: string, type?: 'success' | 'error') => void) {
  const supabase = useSupabaseClient()
  const categoryAssetsList = ref<any[]>([])
  const loadingCategories = ref(false)
  const saving = ref(false)

  const fetchCategoryAssetsAdmin = async () => {
    loadingCategories.value = true
    try {
      await cleanupDuplicateCategories(supabase)
      const { data: assets } = await supabase.from('category_assets').select('*').order('category')
      const { data: pdfSettingsData } = await supabase.from('pdf_settings').select('*')
      
      if (assets) {
        categoryAssetsList.value = assets.map((item: any) => {
          const settings = pdfSettingsData?.find((s: any) => s.category.toUpperCase().trim() === item.category.toUpperCase().trim()) || {}
          return {
            id: item.id,
            category: item.category,
            originalCategory: item.category,
            coverImageUrl: item.cover_image_url,
            coverImageBlob: item.cover_image_blob ? hexToBase64(item.cover_image_blob) : null,
            colorHex: item.color_hex || '#376092',
            pdfUrl: item.pdf_url,
            iconUrl: item.icon_url || null,
            badgeText: item.badge_text || null,
            badgeIconUrl: item.badge_icon_url || null,
            
            pdfSettingsId: settings.id,
            titleFontSize: settings.title_font_size || '36px',
            titlePositionY: settings.title_position_y || '0px',
            titleColor: settings.title_color || '',
            badgeIconSize: settings.badge_icon_size || '4.5mm',
            badgeFontFamily: settings.badge_font_family || 'Inter',
            badgeFontSize: settings.badge_font_size || '8pt',
            badgeColor: settings.badge_color || '#334155',
            badgePositionX: settings.badge_position_x || '0px',
            badgePositionY: settings.badge_position_y || '0px',
            badgeIconOffsetX: settings.badge_icon_offset_x || '0px',
            badgeIconOffsetY: settings.badge_icon_offset_y || '0px',
            badgeTextOffsetX: settings.badge_text_offset_x || '0px',
            badgeTextOffsetY: settings.badge_text_offset_y || '0px',
            imagePosition: settings.image_position || 'right',
            cardLayoutOrder: settings.card_layout_order || 'specs-first',
            fontSizeSpecs: settings.font_size_specs || '10px',
            dividerLineColor: settings.divider_line_color || '#cbd5e1',
            productSpacing: settings.product_spacing || '24px',
            productImageOffsetY: settings.product_image_offset_y || '16px',
            productImageOffsetX: settings.product_image_offset_x || '-10px',
            cardOffsetX: settings.card_offset_x || '0px',
            cardOffsetY: settings.card_offset_y || '0px',
            cardTitleOffsetX: settings.card_title_offset_x || '0px',
            cardTitleOffsetY: settings.card_title_offset_y || '0px',
            cardModelFontSize: settings.card_model_font_size || '24px',
            cardModelOffsetX: settings.card_model_offset_x || '0px',
            cardModelOffsetY: settings.card_model_offset_y || '0px',
            cardModelLabelFontSize: settings.card_model_label_font_size || '8px',
            cardModelLabelOffsetX: settings.card_model_label_offset_x || '0px',
            cardModelLabelOffsetY: settings.card_model_label_offset_y || '0px',
            titleFontFamily: settings.title_font_family || 'Verdana',
            cardTitleFontFamily: settings.card_title_font_family || 'Verdana',
            cardModelFontFamily: settings.card_model_font_family || 'Verdana',
            specsFontFamily: settings.specs_font_family || 'Verdana',
            logoWidth: settings.logo_width || '240px',
            logoHeight: settings.logo_height || '75px',
            logoPositionX: settings.logo_position_x || '60px',
            logoPositionY: settings.logo_position_y || '60px',
            specsLabelWidth: settings.specs_label_width || '45%',
            specsValueWidth: settings.specs_value_width || '55%',
            specsPaddingY: settings.specs_padding_y || '4px',
            specsLineStyle: settings.specs_line_style || 'dashed',
            specsLineColor: settings.specs_line_color || '#cbd5e1',
            specsBgColor: settings.specs_bg_color || '#f3f4f6',
            layout_settings: settings.layout_settings || {},
            titleBold: !!settings.title_bold,
            titleItalic: !!settings.title_italic,
            titleUnderline: !!settings.title_underline,
            cardTitleBold: !!settings.card_title_bold,
            cardTitleItalic: !!settings.card_title_italic,
            cardTitleUnderline: !!settings.card_title_underline,
            cardModelBold: !!settings.card_model_bold,
            cardModelItalic: !!settings.card_model_italic,
            cardModelUnderline: !!settings.card_model_underline,
            cardModelLabelFontFamily: settings.card_model_label_font_family || 'Verdana',
            cardModelLabelBold: !!settings.card_model_label_bold,
            cardModelLabelItalic: !!settings.card_model_label_italic,
            cardModelLabelUnderline: !!settings.card_model_label_underline,
            specsBold: !!settings.specs_bold,
            specsItalic: !!settings.specs_italic,
            specsUnderline: !!settings.specs_underline,
            specsValBold: !!settings.specs_val_bold,
            specsValItalic: !!settings.specs_val_italic,
            specsValUnderline: !!settings.specs_val_underline,
            cardHeaderLayout: settings.card_header_layout || 'model-left',
            tagFontFamily: settings.tag_font_family || 'Verdana',
            tagFontSize: settings.tag_font_size || '10px',
            tagBold: settings.tag_bold !== null ? !!settings.tag_bold : true,
            tagItalic: !!settings.tag_italic,
            tagUnderline: !!settings.tag_underline,
            tagOffsetX: settings.tag_offset_x || '0px',
            tagOffsetY: settings.tag_offset_y || '0px',
            orientation: settings.orientation || 'portrait',
            pdfImageScale: settings.pdf_image_scale !== undefined && settings.pdf_image_scale !== null ? Number(settings.pdf_image_scale) : 1.0,
            pdfImageScaleX: settings.pdf_image_scale_x !== undefined && settings.pdf_image_scale_x !== null ? Number(settings.pdf_image_scale_x) : 1.0,
            pdfImageScaleY: settings.pdf_image_scale_y !== undefined && settings.pdf_image_scale_y !== null ? Number(settings.pdf_image_scale_y) : 1.0,
            bookletPdfImageScale: settings.booklet_pdf_image_scale !== undefined && settings.booklet_pdf_image_scale !== null ? Number(settings.booklet_pdf_image_scale) : 1.0,
            bookletPdfImageScaleX: settings.booklet_pdf_image_scale_x !== undefined && settings.booklet_pdf_image_scale_x !== null ? Number(settings.booklet_pdf_image_scale_x) : 1.0,
            bookletPdfImageScaleY: settings.booklet_pdf_image_scale_y !== undefined && settings.booklet_pdf_image_scale_y !== null ? Number(settings.booklet_pdf_image_scale_y) : 1.0,
            bookletProductImageOffsetX: settings.booklet_product_image_offset_x || '0px',
            bookletProductImageOffsetY: settings.booklet_product_image_offset_y || '0px',
            cardTitleColor: settings.card_title_color || '#ffffff',
            cardTitleFontSize: settings.card_title_font_size || '14px',
            cardModelColor: settings.card_model_color || '#ffffff',
            cardModelLabelColor: settings.card_model_label_color || '#ffffff',
            cardModelLabelText: settings.card_model_label_text || 'Modelo',
            tagColor: settings.tag_color || '#ffffff',
            specsColor: settings.specs_color || '#374151',
            specsValColor: settings.specs_val_color || '#000000',
            coverTitleFontFamily: settings.cover_title_font_family || 'Helvetica',
            coverTitleFontSize: settings.cover_title_font_size || '20px',
            coverTitleBold: settings.cover_title_bold !== null ? !!settings.cover_title_bold : true,
            coverTitleItalic: !!settings.cover_title_italic,
            coverTitleUnderline: !!settings.cover_title_underline,
            coverTitleColor: settings.cover_title_color || '#ffffff',
            coverTitleOffsetX: settings.cover_title_offset_x || '0px',
            coverTitleOffsetY: settings.cover_title_offset_y || '0px',
            coverTitlePt: (settings.layout_settings && settings.layout_settings.cover_title_pt) || settings.cover_title_pt || '',
            coverTitleEn: (settings.layout_settings && settings.layout_settings.cover_title_en) || settings.cover_title_en || '',
            coverTitleDe: (settings.layout_settings && settings.layout_settings.cover_title_de) || settings.cover_title_de || '',
            coverSubtitleText: settings.cover_subtitle_text || 'CATÁLOGO DE PRODUTOS',
            coverSubtitleFontFamily: settings.cover_subtitle_font_family || 'Helvetica',
            coverSubtitleFontSize: settings.cover_subtitle_font_size || '8px',
            coverSubtitleBold: settings.cover_subtitle_bold !== null ? !!settings.cover_subtitle_bold : false,
            coverSubtitleItalic: !!settings.cover_subtitle_italic,
            coverSubtitleUnderline: !!settings.cover_subtitle_underline,
            coverSubtitleColor: settings.cover_subtitle_color || '#ffffff',
            coverSubtitleOffsetX: settings.cover_subtitle_offset_x || '0px',
            coverSubtitleOffsetY: settings.cover_subtitle_offset_y || '0px',
            
            uploading: false,
            hasChanges: false
          }
        })
      }
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao carregar categorias: ${err.message}`, 'error')
    } finally {
      loadingCategories.value = false
    }
  }

  const saveCategoryAsset = async (catAsset: any) => {
    saving.value = true
    try {
      const originalCat = catAsset.originalCategory.toUpperCase().trim()
      const newCat = catAsset.category.toUpperCase().trim()
      const hasNameChanged = originalCat !== newCat

      if (hasNameChanged && !newCat) {
        throw new Error('O nome da categoria não pode estar em branco.')
      }

      let dbBlob = catAsset.coverImageBlob
      if (dbBlob && !dbBlob.startsWith('\\x')) {
        const binary = atob(dbBlob)
        let hex = ''
        for (let i = 0; i < binary.length; i++) {
          const h = binary.charCodeAt(i).toString(16)
          hex += h.length === 1 ? '0' + h : h
        }
        dbBlob = '\\x' + hex
      }

      const assetPayload = {
        category: newCat,
        cover_image_url: catAsset.coverImageUrl,
        cover_image_blob: dbBlob,
        color_hex: catAsset.colorHex,
        pdf_url: catAsset.pdfUrl,
        icon_url: catAsset.iconUrl || null,
        badge_text: catAsset.badgeText || null,
        badge_icon_url: catAsset.badgeIconUrl || null
      }
      const { error: assetError } = await supabase
        .from('category_assets')
        .update(assetPayload)
        .eq('id', catAsset.id)
        
      if (assetError) throw assetError

      if (hasNameChanged) {
        const { error: productsUpdateError } = await supabase
          .from('products')
          .update({ category: newCat })
          .eq('category', originalCat)
        
        if (productsUpdateError) throw productsUpdateError
      }

      // Update/sync font families in layout_settings so density overrides don't block root font settings
      if (catAsset.layout_settings && typeof catAsset.layout_settings === 'object') {
        const fontKeys = [
          'titleFontFamily', 'title_font_family',
          'cardTitleFontFamily', 'card_title_font_family',
          'cardModelFontFamily', 'card_model_font_family',
          'cardModelLabelFontFamily', 'card_model_label_font_family',
          'specsFontFamily', 'specs_font_family',
          'tagFontFamily', 'tag_font_family',
          'coverTitleFontFamily', 'cover_title_font_family',
          'coverSubtitleFontFamily', 'cover_subtitle_font_family'
        ]
        for (const densityKey of Object.keys(catAsset.layout_settings)) {
          const densityObj = catAsset.layout_settings[densityKey]
          if (densityObj && typeof densityObj === 'object') {
            for (const fk of fontKeys) {
              delete densityObj[fk]
            }
          }
        }
      }

      const settingsPayload = {
        category: newCat,
        title_font_size: catAsset.titleFontSize,
        title_position_y: catAsset.titlePositionY,
        title_color: catAsset.titleColor || null,
        badge_icon_size: catAsset.badgeIconSize || '4.5mm',
        badge_font_family: catAsset.badgeFontFamily || 'Inter',
        badge_font_size: catAsset.badgeFontSize || '8pt',
        badge_color: catAsset.badgeColor || '#334155',
        badge_position_x: catAsset.badgePositionX || '0px',
        badge_position_y: catAsset.badgePositionY || '0px',
        badge_icon_offset_x: catAsset.badgeIconOffsetX || '0px',
        badge_icon_offset_y: catAsset.badgeIconOffsetY || '0px',
        badge_text_offset_x: catAsset.badgeTextOffsetX || '0px',
        badge_text_offset_y: catAsset.badgeTextOffsetY || '0px',
        image_position: catAsset.imagePosition,
        card_layout_order: catAsset.cardLayoutOrder,
        font_size_specs: catAsset.fontSizeSpecs,
        divider_line_color: catAsset.dividerLineColor,
        product_spacing: catAsset.productSpacing,
        product_image_offset_y: catAsset.productImageOffsetY,
        product_image_offset_x: catAsset.productImageOffsetX,
        card_offset_x: catAsset.cardOffsetX,
        card_offset_y: catAsset.cardOffsetY,
        card_title_offset_x: catAsset.cardTitleOffsetX,
        card_title_offset_y: catAsset.cardTitleOffsetY,
        card_model_font_size: catAsset.cardModelFontSize,
        card_model_offset_x: catAsset.cardModelOffsetX,
        card_model_offset_y: catAsset.cardModelOffsetY,
        card_model_label_font_size: catAsset.cardModelLabelFontSize,
        card_model_label_offset_x: catAsset.cardModelLabelOffsetX,
        card_model_label_offset_y: catAsset.cardModelLabelOffsetY,
        title_font_family: catAsset.titleFontFamily,
        card_title_font_family: catAsset.cardTitleFontFamily,
        card_model_font_family: catAsset.cardModelFontFamily,
        card_model_label_font_family: catAsset.cardModelLabelFontFamily,
        card_model_label_text: catAsset.cardModelLabelText,
        specs_font_family: catAsset.specsFontFamily,
        logo_width: catAsset.logoWidth,
        logo_height: catAsset.logoHeight,
        logo_position_x: catAsset.logoPositionX,
        logo_position_y: catAsset.logoPositionY,
        specs_label_width: catAsset.specsLabelWidth,
        specs_value_width: catAsset.specsValueWidth,
        specs_padding_y: catAsset.specsPaddingY,
        specs_line_style: catAsset.specsLineStyle,
        specs_line_color: catAsset.specsLineColor,
        specs_bg_color: catAsset.specsBgColor,
        layout_settings: {
          ...(catAsset.layout_settings || {}),
          cover_title_pt: catAsset.coverTitlePt || null,
          cover_title_en: catAsset.coverTitleEn || null,
          cover_title_de: catAsset.coverTitleDe || null,
        },
        title_bold: catAsset.titleBold,
        title_italic: catAsset.titleItalic,
        title_underline: catAsset.titleUnderline,
        card_title_bold: catAsset.cardTitleBold,
        card_title_italic: catAsset.cardTitleItalic,
        card_title_underline: catAsset.cardTitleUnderline,
        card_model_bold: catAsset.cardModelBold,
        card_model_italic: catAsset.cardModelItalic,
        card_model_underline: catAsset.cardModelUnderline,
        card_model_label_bold: catAsset.cardModelLabelBold,
        card_model_label_italic: catAsset.cardModelLabelItalic,
        card_model_label_underline: catAsset.cardModelLabelUnderline,
        specs_bold: catAsset.specsBold,
        specs_italic: catAsset.specsItalic,
        specs_underline: catAsset.specsUnderline,
        specs_val_bold: catAsset.specsValBold,
        specs_val_italic: catAsset.specsValItalic,
        specs_val_underline: catAsset.specsValUnderline,
        card_header_layout: catAsset.cardHeaderLayout,
        tag_font_family: catAsset.tagFontFamily,
        tag_font_size: catAsset.tagFontSize,
        tag_bold: catAsset.tagBold,
        tag_italic: catAsset.tagItalic,
        tag_underline: catAsset.tagUnderline,
        tag_offset_x: catAsset.tagOffsetX,
        tag_offset_y: catAsset.tagOffsetY,
        card_title_color: catAsset.cardTitleColor,
        card_title_font_size: catAsset.cardTitleFontSize,
        card_model_color: catAsset.cardModelColor,
        card_model_label_color: catAsset.cardModelLabelColor,
        tag_color: catAsset.tagColor,
        specs_color: catAsset.specsColor,
        specs_val_color: catAsset.specsValColor,
        cover_title_font_family: catAsset.coverTitleFontFamily,
        cover_title_font_size: catAsset.coverTitleFontSize,
        cover_title_bold: catAsset.coverTitleBold,
        cover_title_italic: catAsset.coverTitleItalic,
        cover_title_underline: catAsset.coverTitleUnderline,
        cover_title_color: catAsset.coverTitleColor,
        cover_title_offset_x: catAsset.coverTitleOffsetX,
        cover_title_offset_y: catAsset.coverTitleOffsetY,
        cover_subtitle_text: catAsset.coverSubtitleText,
        cover_subtitle_font_family: catAsset.coverSubtitleFontFamily,
        cover_subtitle_font_size: catAsset.coverSubtitleFontSize,
        cover_subtitle_bold: catAsset.coverSubtitleBold,
        cover_subtitle_italic: catAsset.coverSubtitleItalic,
        cover_subtitle_underline: catAsset.coverSubtitleUnderline,
        cover_subtitle_color: catAsset.coverSubtitleColor,
        cover_subtitle_offset_x: catAsset.coverSubtitleOffsetX,
        cover_subtitle_offset_y: catAsset.coverSubtitleOffsetY,
        orientation: catAsset.orientation || 'portrait',
        pdf_image_scale: catAsset.pdfImageScale !== undefined && catAsset.pdfImageScale !== null ? Number(catAsset.pdfImageScale) : 1.0,
        pdf_image_scale_x: catAsset.pdfImageScaleX !== undefined && catAsset.pdfImageScaleX !== null ? Number(catAsset.pdfImageScaleX) : 1.0,
        pdf_image_scale_y: catAsset.pdfImageScaleY !== undefined && catAsset.pdfImageScaleY !== null ? Number(catAsset.pdfImageScaleY) : 1.0,
        booklet_pdf_image_scale: catAsset.bookletPdfImageScale !== undefined && catAsset.bookletPdfImageScale !== null ? Number(catAsset.bookletPdfImageScale) : 1.0,
        booklet_pdf_image_scale_x: catAsset.bookletPdfImageScaleX !== undefined && catAsset.bookletPdfImageScaleX !== null ? Number(catAsset.bookletPdfImageScaleX) : 1.0,
        booklet_pdf_image_scale_y: catAsset.bookletPdfImageScaleY !== undefined && catAsset.bookletPdfImageScaleY !== null ? Number(catAsset.bookletPdfImageScaleY) : 1.0,
        booklet_product_image_offset_x: catAsset.bookletProductImageOffsetX || '0px',
        booklet_product_image_offset_y: catAsset.bookletProductImageOffsetY || '0px'
      }
      
      if (catAsset.pdfSettingsId) {
        const { error: settingsError } = await supabase
          .from('pdf_settings')
          .update(settingsPayload)
          .eq('id', catAsset.pdfSettingsId)
        if (settingsError) throw settingsError
      } else {
        const { error: settingsError } = await supabase
          .from('pdf_settings')
          .insert([settingsPayload])
        if (settingsError) throw settingsError
      }
        
      triggerToast(`Configurações da categoria ${newCat} atualizadas com sucesso!`, 'success')
      catAsset.hasChanges = false
      catAsset.originalCategory = newCat
      
      const { fetchAssets } = useCategoryColors()
      const { fetchPdfSettings } = usePdfSettings()
      await Promise.all([
        fetchAssets(),
        fetchPdfSettings(),
        fetchCategoryAssetsAdmin()
      ])
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao atualizar categoria: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const saveNewCategoryAsset = async (name: string) => {
    saving.value = true
    try {
      const catName = name.toUpperCase().trim()
      const payload = {
        category: catName,
        cover_image_url: '/placeholder.png',
        color_hex: '#376092'
      }
      const { error } = await supabase.from('category_assets').insert([payload])
      if (error) throw error

      // Configurações padrão herdadas da categoria VÁLVULAS DE SEGURANÇA
      const { data: templateSettings } = await supabase
        .from('pdf_settings')
        .select('*')
        .or('category.ilike.%VÁLVULAS DE SEGURANÇA%,category.ilike.%GERAL%')
        .order('id', { ascending: true })
        .limit(1)

      let settingsPayload: Record<string, any> = {}
      if (templateSettings && templateSettings.length > 0) {
        const source = templateSettings[0]
        const { id, created_at, ...copiedSettings } = source
        settingsPayload = {
          ...copiedSettings,
          category: catName,
          layout_settings: JSON.parse(JSON.stringify(source.layout_settings || {}))
        }
      } else {
        settingsPayload = {
          category: catName,
          title_font_family: 'Calibri',
          card_title_font_family: 'Calibri',
          card_model_font_family: 'Calibri',
          specs_font_family: 'Calibri',
          tag_font_family: 'Calibri'
        }
      }

      await supabase.from('pdf_settings').insert([settingsPayload])

      triggerToast('Nova categoria criada com sucesso!', 'success')
      const { fetchAssets } = useCategoryColors()
      const { fetchPdfSettings } = usePdfSettings()
      await Promise.all([
        fetchCategoryAssetsAdmin(),
        fetchAssets(),
        fetchPdfSettings()
      ])
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao criar categoria: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteCategoryAsset = async (id: string) => {
    saving.value = true
    try {
      const catAsset = categoryAssetsList.value.find(c => c.id === id)
      if (!catAsset) return
      const catName = catAsset.category.toUpperCase().trim()

      const { error: assetError } = await supabase.from('category_assets').delete().eq('id', id)
      if (assetError) throw assetError

      const { error: settingsError } = await supabase.from('pdf_settings').delete().eq('category', catName)
      if (settingsError) throw settingsError

      triggerToast(`Categoria "${catName}" excluída com sucesso!`, 'success')
      
      const { fetchAssets } = useCategoryColors()
      const { fetchPdfSettings } = usePdfSettings()
      await Promise.all([
        fetchAssets(),
        fetchPdfSettings(),
        fetchCategoryAssetsAdmin()
      ])
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao excluir categoria: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteMultipleCategoryAssets = async (ids: string[]) => {
    if (!ids || ids.length === 0) return
    if (!confirm(`Tem certeza que deseja excluir as ${ids.length} categorias selecionadas? Esta ação é irreversível.`)) return

    saving.value = true
    try {
      const targetCategories = categoryAssetsList.value.filter(c => ids.includes(c.id))
      const catNames = targetCategories.map(c => c.category)

      const { error: assetsErr } = await supabase.from('category_assets').delete().in('id', ids)
      if (assetsErr) throw assetsErr

      if (catNames.length > 0) {
        const { error: settingsErr } = await supabase.from('pdf_settings').delete().in('category', catNames)
        if (settingsErr) console.warn('pdf_settings delete warning:', settingsErr)
      }

      triggerToast(`${ids.length} categorias excluídas com sucesso!`, 'success')
      
      const { fetchAssets } = useCategoryColors()
      const { fetchPdfSettings } = usePdfSettings()
      await Promise.all([
        fetchAssets(),
        fetchPdfSettings(),
        fetchCategoryAssetsAdmin()
      ])
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao excluir categorias selecionadas: ${err.message || err}`, 'error')
    } finally {
      saving.value = false
    }
  }

  const replicateCategorySettings = async ({ source, targetIds, fields, density }: { source: any, targetIds: string[], fields?: string[] | null, density?: string }) => {
    console.log('🔥🔥🔥 [REPLICATE] Function called!', { source: source?.category, targetIds, fields, density })
    saving.value = true
    try {
      console.log('[replicateCategorySettings] Starting replication', { 
        sourceCategory: source.category, 
        targetCount: targetIds.length, 
        fields: fields?.length || 'ALL',
        density: density || 'geral'
      })
      
      const actualDensity = density || 'geral'
      console.log('[replicateCategorySettings] Replication mode:', {
        density: actualDensity,
        willCopyFrom: actualDensity === 'geral' ? 'root level' : `layout_settings["${actualDensity}"]`
      })
      
      const fieldToDbCol: Record<string, string> = {
        titleFontSize: 'title_font_size',
        titlePositionY: 'title_position_y',
        titleColor: 'title_color',
        imagePosition: 'image_position',
        cardLayoutOrder: 'card_layout_order',
        fontSizeSpecs: 'font_size_specs',
        dividerLineColor: 'divider_line_color',
        productSpacing: 'product_spacing',
        productImageOffsetY: 'product_image_offset_y',
        productImageOffsetX: 'product_image_offset_x',
        cardOffsetX: 'card_offset_x',
        cardOffsetY: 'card_offset_y',
        cardTitleOffsetX: 'card_title_offset_x',
        cardTitleOffsetY: 'card_title_offset_y',
        cardTitleFontSize: 'card_title_font_size',
        cardTitleColor: 'card_title_color',
        cardModelFontSize: 'card_model_font_size',
        cardModelOffsetX: 'card_model_offset_x',
        cardModelOffsetY: 'card_model_offset_y',
        cardModelColor: 'card_model_color',
        cardModelLabelFontSize: 'card_model_label_font_size',
        cardModelLabelOffsetX: 'card_model_label_offset_x',
        cardModelLabelOffsetY: 'card_model_label_offset_y',
        cardModelLabelFontFamily: 'card_model_label_font_family',
        cardModelLabelBold: 'card_model_label_bold',
        cardModelLabelItalic: 'card_model_label_italic',
        cardModelLabelUnderline: 'card_model_label_underline',
        cardModelLabelColor: 'card_model_label_color',
        cardModelLabelText: 'card_model_label_text',
        titleFontFamily: 'title_font_family',
        cardTitleFontFamily: 'card_title_font_family',
        cardModelFontFamily: 'card_model_font_family',
        specsFontFamily: 'specs_font_family',
        logoWidth: 'logo_width',
        logoHeight: 'logo_height',
        logoPositionX: 'logo_position_x',
        logoPositionY: 'logo_position_y',
        specsLabelWidth: 'specs_label_width',
        specsValueWidth: 'specs_value_width',
        specsPaddingY: 'specs_padding_y',
        specsLineStyle: 'specs_line_style',
        specsLineColor: 'specs_line_color',
        specsBgColor: 'specs_bg_color',
        specsColor: 'specs_color',
        specsValColor: 'specs_val_color',
        titleBold: 'title_bold',
        titleItalic: 'title_italic',
        titleUnderline: 'title_underline',
        cardTitleBold: 'card_title_bold',
        cardTitleItalic: 'card_title_italic',
        cardTitleUnderline: 'card_title_underline',
        cardModelBold: 'card_model_bold',
        cardModelItalic: 'card_model_italic',
        cardModelUnderline: 'card_model_underline',
        specsBold: 'specs_bold',
        specsItalic: 'specs_italic',
        specsUnderline: 'specs_underline',
        specsValBold: 'specs_val_bold',
        specsValItalic: 'specs_val_italic',
        specsValUnderline: 'specs_val_underline',
        cardHeaderLayout: 'card_header_layout',
        tagFontFamily: 'tag_font_family',
        tagFontSize: 'tag_font_size',
        tagBold: 'tag_bold',
        tagItalic: 'tag_italic',
        tagUnderline: 'tag_underline',
        tagOffsetX: 'tag_offset_x',
        tagOffsetY: 'tag_offset_y',
        tagColor: 'tag_color',
        orientation: 'orientation',
        pdfImageScale: 'pdf_image_scale',
        pdfImageScaleX: 'pdf_image_scale_x',
        pdfImageScaleY: 'pdf_image_scale_y',
        bookletPdfImageScale: 'booklet_pdf_image_scale',
        bookletPdfImageScaleX: 'booklet_pdf_image_scale_x',
        bookletPdfImageScaleY: 'booklet_pdf_image_scale_y',
        bookletProductImageOffsetX: 'booklet_product_image_offset_x',
        bookletProductImageOffsetY: 'booklet_product_image_offset_y',
        layoutSettings: 'layout_settings',
        badgeIconSize: 'badge_icon_size',
        badgeFontFamily: 'badge_font_family',
        badgeFontSize: 'badge_font_size',
        badgeColor: 'badge_color',
        badgePositionX: 'badge_position_x',
        badgePositionY: 'badge_position_y',
        badgeIconOffsetX: 'badge_icon_offset_x',
        badgeIconOffsetY: 'badge_icon_offset_y',
        badgeTextOffsetX: 'badge_text_offset_x',
        badgeTextOffsetY: 'badge_text_offset_y',
        coverTitleFontFamily: 'cover_title_font_family',
        coverTitleFontSize: 'cover_title_font_size',
        coverTitleBold: 'cover_title_bold',
        coverTitleItalic: 'cover_title_italic',
        coverTitleUnderline: 'cover_title_underline',
        coverTitleColor: 'cover_title_color',
        coverTitleOffsetX: 'cover_title_offset_x',
        coverTitleOffsetY: 'cover_title_offset_y',
        coverSubtitleText: 'cover_subtitle_text',
        coverSubtitleFontFamily: 'cover_subtitle_font_family',
        coverSubtitleFontSize: 'cover_subtitle_font_size',
        coverSubtitleBold: 'cover_subtitle_bold',
        coverSubtitleItalic: 'cover_subtitle_italic',
        coverSubtitleUnderline: 'cover_subtitle_underline',
        coverSubtitleColor: 'cover_subtitle_color',
        coverSubtitleOffsetX: 'cover_subtitle_offset_x',
        coverSubtitleOffsetY: 'cover_subtitle_offset_y',
        headerOffsetX: 'header_offset_x',
        headerOffsetY: 'header_offset_y',
        headerWidth: 'header_width',
        headerHeight: 'header_height',
        specsOffsetX: 'specs_offset_x',
        specsOffsetY: 'specs_offset_y',
        specsWidth: 'specs_width',
        specsHeight: 'specs_height',
        blockGap: 'block_gap'
      }

      const fieldsToCopy = fields && Array.isArray(fields) ? fields : [...Object.keys(fieldToDbCol), 'badgeText', 'badgeIconUrl']

      // Get source data based on density
      let sourceData: Record<string, any> = {}
      
      if (actualDensity === 'geral') {
        // Copy from root level
        for (const field of fieldsToCopy) {
          const dbCol = fieldToDbCol[field]
          if (dbCol) {
            let value = source[field]
            if (value === undefined || value === null) {
              value = source[dbCol]
            }
            if (value !== undefined && value !== null) {
              sourceData[field] = value
            }
          }
        }
      } else {
        // Copy from layout_settings[density] with fallback to root level
        const layoutSettings = source.layout_settings || source.layoutSettings || {}
        const densitySettings = layoutSettings[actualDensity] || {}
        
        for (const field of fieldsToCopy) {
          let value = densitySettings[field]
          if (value === undefined || value === null) {
            const dbCol = fieldToDbCol[field]
            if (dbCol) {
              value = densitySettings[dbCol]
            }
          }
          // Fallback to root level if not explicitly defined in density override
          if (value === undefined || value === null) {
            value = source[field]
            if (value === undefined || value === null) {
              const dbCol = fieldToDbCol[field]
              if (dbCol) {
                value = source[dbCol]
              }
            }
          }
          if (value !== undefined && value !== null) {
            sourceData[field] = value
          }
        }
      }

      for (const targetId of targetIds) {
        const targetCat = categoryAssetsList.value.find(c => c.id === targetId)
        if (!targetCat) continue

        // 1. Copy category_assets fields
        const catAssetPayload: Record<string, any> = {}
        let hasCatAssetChanges = false

        if (fieldsToCopy.includes('badgeText') && sourceData['badgeText'] !== undefined) {
          catAssetPayload['badge_text'] = sourceData['badgeText']
          hasCatAssetChanges = true
        }
        if (fieldsToCopy.includes('badgeIconUrl') && sourceData['badgeIconUrl'] !== undefined) {
          catAssetPayload['badge_icon_url'] = sourceData['badgeIconUrl']
          hasCatAssetChanges = true
        }

        if (hasCatAssetChanges) {
          const { error: assetError } = await supabase
            .from('category_assets')
            .update(catAssetPayload)
            .eq('id', targetCat.id)
          if (assetError) throw assetError
        }

        // 2. Prepare pdf_settings update
        if (actualDensity === 'geral') {
          // Direct update to root fields
          const payload: Record<string, any> = {
            category: targetCat.category
          }

          for (const field of Object.keys(sourceData)) {
            const dbCol = fieldToDbCol[field]
            if (!dbCol) continue

            if (field === 'layoutSettings') {
              payload[dbCol] = sourceData[field] || {}
            } else if (field === 'pdfImageScale' || field === 'pdfImageScaleX' || field === 'pdfImageScaleY' || field === 'bookletPdfImageScale' || field === 'bookletPdfImageScaleX' || field === 'bookletPdfImageScaleY') {
              payload[dbCol] = sourceData[field] !== undefined && sourceData[field] !== null ? Number(sourceData[field]) : 1.0
            } else {
              payload[dbCol] = sourceData[field]
            }
          }

          // Copy layout_settings from source category to target category so density layouts match perfectly
          const sourceLayoutSettings = source.layout_settings || source.layoutSettings || {}
          const targetLayoutSettings = JSON.parse(JSON.stringify(targetCat.layout_settings || {}))

          if (!fields || !Array.isArray(fields)) {
            // Replicating ALL settings: copy source's layout_settings completely
            payload['layout_settings'] = JSON.parse(JSON.stringify(sourceLayoutSettings))
          } else {
            // Replicating specific fields: copy density overrides for those fields from source
            for (const d of ['1', '3', '6']) {
              if (!targetLayoutSettings[d]) targetLayoutSettings[d] = {}
              const sourceD = sourceLayoutSettings[d] || {}
              for (const field of fieldsToCopy) {
                const dbCol = fieldToDbCol[field]
                const val = sourceD[field] !== undefined ? sourceD[field] : (dbCol ? sourceD[dbCol] : undefined)
                if (val !== undefined && val !== null) {
                  targetLayoutSettings[d][field] = val
                  if (dbCol) targetLayoutSettings[d][dbCol] = val
                } else {
                  delete targetLayoutSettings[d][field]
                  if (dbCol) delete targetLayoutSettings[d][dbCol]
                }
              }
            }
            payload['layout_settings'] = targetLayoutSettings
          }

          if (targetCat.pdfSettingsId) {
            const { error: settingsError } = await supabase
              .from('pdf_settings')
              .update(payload)
              .eq('id', targetCat.pdfSettingsId)
            if (settingsError) throw settingsError
          } else {
            const { error: settingsError } = await supabase
              .from('pdf_settings')
              .insert([payload])
            if (settingsError) throw settingsError
          }
        } else {
          // Update layout_settings[density] specifically
          const { data: currentSettings, error: fetchError } = await supabase
            .from('pdf_settings')
            .select('layout_settings')
            .eq('id', targetCat.pdfSettingsId)
            .single()
          
          if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
          
          const currentLayoutSettings = currentSettings?.layout_settings || targetCat.layout_settings || {}
          const densityOverrides: Record<string, any> = currentLayoutSettings[actualDensity] || {}
          
          // Merge source data into density overrides
          for (const field of Object.keys(sourceData)) {
            densityOverrides[field] = sourceData[field]
          }
          
          currentLayoutSettings[actualDensity] = densityOverrides
          
          const { error: updateError } = await supabase
            .from('pdf_settings')
            .update({ layout_settings: currentLayoutSettings })
            .eq('id', targetCat.pdfSettingsId)
          
          if (updateError) throw updateError
        }
      }

      triggerToast('Configurações de layout replicadas com sucesso!', 'success')
      const { fetchPdfSettings } = usePdfSettings()
      await fetchPdfSettings()
      await fetchCategoryAssetsAdmin()
    } catch (err: any) {
      console.error(err)
      triggerToast(`Erro ao replicar configurações: ${err.message}`, 'error')
    } finally {
      saving.value = false
    }
  }

  return {
    categoryAssetsList,
    loadingCategories,
    saving,
    fetchCategoryAssetsAdmin,
    saveCategoryAsset,
    saveNewCategoryAsset,
    deleteCategoryAsset,
    deleteMultipleCategoryAssets,
    replicateCategorySettings
  }
}
