import { useState } from '#app'

export interface CategoryAsset {
  id?: string
  category: string
  cover_image_url: string
  cover_image_blob?: string | null
  color_hex?: string | null
  pdfUrl?: string | null
  icon_url?: string | null
  badge_text?: string | null
  badge_icon_url?: string | null
}

export default function useCategoryColors() {
  const categoryAssets = useState<Record<string, CategoryAsset>>('category-assets', () => ({}))
  const supabase = useSupabaseClient()

  const fetchAssets = async () => {
    try {
      const { data } = await supabase.from('category_assets').select('*')
      if (data) {
        const mapping: Record<string, CategoryAsset> = {}
        for (const item of data) {
          if (item.category) {
            mapping[item.category.toUpperCase().trim()] = {
              id: item.id,
              category: item.category,
              cover_image_url: item.cover_image_url,
              cover_image_blob: item.cover_image_blob,
              color_hex: item.color_hex,
              pdfUrl: item.pdf_url,
              icon_url: item.icon_url,
              badge_text: item.badge_text || null,
              badge_icon_url: item.badge_icon_url || null
            }
          }
        }
        categoryAssets.value = mapping
      }
    } catch (e) {
      console.error('Failed to fetch category assets:', e)
    }
  }

  const getCategoryColor = (category?: string) => {
    if (!category) return null
    const catUpper = category.toUpperCase().trim()
    return categoryAssets.value[catUpper]?.color_hex || null
  }

  const getCategoryCover = (category?: string) => {
    if (!category) return null
    const catUpper = category.toUpperCase().trim()
    return categoryAssets.value[catUpper] || null
  }

  return {
    categoryAssets,
    fetchAssets,
    getCategoryColor,
    getCategoryCover
  }
}