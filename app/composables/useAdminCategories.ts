import { ref } from 'vue'
import { hexToBase64 } from '../utils/image'

export function useAdminCategories(triggerToast: (msg: string, type?: 'success' | 'error') => void) {
  const supabase = useSupabaseClient()
  const categoryAssetsList = ref<any[]>([])
  const loadingCategories = ref(false)
  const saving = ref(false)

  const fetchCategoryAssetsAdmin = async () => {
    loadingCategories.value = true
    try {
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
            
            pdfSettingsId: settings.id,
            titleFontSize: settings.title_font_size || '36px',
            titlePositionY: settings.title_position_y || '0px',
            titleColor: settings.title_color || '',
            imagePosition: settings.image_position || 'right',
            cardLayoutOrder: settings.card_layout_order || 'specs-first',
            fontSizeSpecs: settings.font_size_specs || '10px',
            dividerLineColor: settings.divider_line_color || '#cbd5e1',
            productSpacing: settings.product_spacing || '24px',
            productImageOffsetY: settings.product_image_offset_y || '0px',
            productImageOffsetX: settings.product_image_offset_x || '0px',
            cardOffsetX: settings.card_offset_x || '0px',
            cardOffsetY: settings.card_offset_y || '0px',
            cardTitleOffsetX: settings.card_title_offset_x || '0px',
            cardTitleOffsetY: settings.card_title_offset_y || '0px',
            cardModelFontSize: settings.card_model_font_size || '24px',
            cardModelOffsetX: settings.card_model_offset_x || '0px',
            cardModelOffsetY: settings.card_model_offset_y || '0px',
            titleFontFamily: settings.title_font_family || 'Inter',
            cardTitleFontFamily: settings.card_title_font_family || 'Inter',
            cardModelFontFamily: settings.card_model_font_family || 'Inter',
            specsFontFamily: settings.specs_font_family || 'Inter',
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
            specsBold: !!settings.specs_bold,
            specsItalic: !!settings.specs_italic,
            specsUnderline: !!settings.specs_underline,
            specsValBold: !!settings.specs_val_bold,
            specsValItalic: !!settings.specs_val_italic,
            specsValUnderline: !!settings.specs_val_underline,
            cardHeaderLayout: settings.card_header_layout || 'model-left',
            tagFontFamily: settings.tag_font_family || 'Inter',
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
            landscapeSettings: (() => {
              let ls = settings.landscape_settings
              if (typeof ls === 'string') { try { ls = JSON.parse(ls) } catch { ls = null } }
              return ls || {}
            })(),
            
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
        pdf_url: catAsset.pdfUrl
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

      const settingsPayload = {
        category: newCat,
        title_font_size: catAsset.titleFontSize,
        title_position_y: catAsset.titlePositionY,
        title_color: catAsset.titleColor || null,
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
        title_font_family: catAsset.titleFontFamily,
        card_title_font_family: catAsset.cardTitleFontFamily,
        card_model_font_family: catAsset.cardModelFontFamily,
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
        layout_settings: catAsset.layout_settings || {},
        title_bold: catAsset.titleBold,
        title_italic: catAsset.titleItalic,
        title_underline: catAsset.titleUnderline,
        card_title_bold: catAsset.cardTitleBold,
        card_title_italic: catAsset.cardTitleItalic,
        card_title_underline: catAsset.cardTitleUnderline,
        card_model_bold: catAsset.cardModelBold,
        card_model_italic: catAsset.cardModelItalic,
        card_model_underline: catAsset.cardModelUnderline,
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
        orientation: catAsset.orientation || 'portrait',
        pdf_image_scale: catAsset.pdfImageScale !== undefined && catAsset.pdfImageScale !== null ? Number(catAsset.pdfImageScale) : 1.0,
        pdf_image_scale_x: catAsset.pdfImageScaleX !== undefined && catAsset.pdfImageScaleX !== null ? Number(catAsset.pdfImageScaleX) : 1.0,
        pdf_image_scale_y: catAsset.pdfImageScaleY !== undefined && catAsset.pdfImageScaleY !== null ? Number(catAsset.pdfImageScaleY) : 1.0,
        landscape_settings: catAsset.landscapeSettings && Object.keys(catAsset.landscapeSettings).length > 0
          ? catAsset.landscapeSettings
          : null
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
      
      await supabase.from('pdf_settings').insert([{
        category: catName,
        title_font_size: '36px',
        title_position_y: '0px',
        title_color: null,
        image_position: 'right',
        card_layout_order: 'specs-first',
        font_size_specs: '10px',
        divider_line_color: '#cbd5e1',
        product_spacing: '24px',
        product_image_offset_y: '0px',
        product_image_offset_x: '0px',
        card_offset_x: '0px',
        card_offset_y: '0px',
        card_title_offset_x: '0px',
        card_title_offset_y: '0px',
        card_model_font_size: '24px',
        card_model_offset_x: '0px',
        card_model_offset_y: '0px',
        title_bold: false,
        title_italic: false,
        title_underline: false,
        card_title_bold: false,
        card_title_italic: false,
        card_title_underline: false,
        card_model_bold: false,
        card_model_italic: false,
        card_model_underline: false,
        specs_bold: false,
        specs_italic: false,
        specs_underline: false,
        specs_val_bold: false,
        specs_val_italic: false,
        specs_val_underline: false,
        card_header_layout: 'model-left',
        tag_font_family: 'Inter',
        tag_font_size: '10px',
        tag_bold: true,
        tag_italic: false,
        tag_underline: false,
        tag_offset_x: '0px',
        tag_offset_y: '0px',
        orientation: 'portrait',
        pdf_image_scale: 1.0,
        pdf_image_scale_x: 1.0,
        pdf_image_scale_y: 1.0,
        specs_bg_color: '#f3f4f6',
        landscape_settings: null
      }])
      
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

  const replicateCategorySettings = async ({ source, targetIds, fields }: { source: any, targetIds: string[], fields?: string[] | null }) => {
    saving.value = true
    try {
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
        cardModelFontSize: 'card_model_font_size',
        cardModelOffsetX: 'card_model_offset_x',
        cardModelOffsetY: 'card_model_offset_y',
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
        orientation: 'orientation',
        pdfImageScale: 'pdf_image_scale',
        pdfImageScaleX: 'pdf_image_scale_x',
        pdfImageScaleY: 'pdf_image_scale_y',
        landscapeSettings: 'landscape_settings',
        layoutSettings: 'layout_settings'
      }

      const fieldsToCopy = fields && Array.isArray(fields) ? fields : Object.keys(fieldToDbCol)

      for (const targetId of targetIds) {
        const targetCat = categoryAssetsList.value.find(c => c.id === targetId)
        if (!targetCat) continue

        const payload: Record<string, any> = {
          category: targetCat.category
        }

        for (const field of fieldsToCopy) {
          const dbCol = fieldToDbCol[field]
          if (!dbCol) continue

          if (field === 'landscapeSettings') {
            payload[dbCol] = source.landscapeSettings && Object.keys(source.landscapeSettings).length > 0
              ? source.landscapeSettings
              : null
          } else if (field === 'pdfImageScale' || field === 'pdfImageScaleX' || field === 'pdfImageScaleY') {
            payload[dbCol] = source[field] !== undefined && source[field] !== null ? Number(source[field]) : 1.0
          } else {
            payload[dbCol] = source[field]
          }
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
    replicateCategorySettings
  }
}
