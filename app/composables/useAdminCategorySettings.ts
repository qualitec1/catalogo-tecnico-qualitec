import { ref } from 'vue'
import { hexToBase64 } from '../utils/image'

export function useAdminCategorySettings() {
  const pdfEditMode = ref<Record<string, 'portrait' | 'landscape'>>({})
  const pdfMenuOpen = ref<Record<string, boolean>>({})
  const pdfEditDensity = ref<Record<string, 'geral' | '1' | '3' | '6'>>({})
  const openCategorySettings = ref<Record<string, boolean>>({})

  const isPdfSettingsOpen = (id: string) => !!openCategorySettings.value[id]
  const togglePdfSettings = (id: string) => {
    openCategorySettings.value[id] = !openCategorySettings.value[id]
  }

  const isPdfMenuOpen = (id: string) => !!pdfMenuOpen.value[id]
  const getPdfMode = (id: string) => pdfEditMode.value[id] || 'portrait'

  const togglePdfMenuOpen = (id: string) => {
    pdfMenuOpen.value[id] = !pdfMenuOpen.value[id]
  }

  const openPdfPanel = (id: string, mode: 'portrait' | 'landscape') => {
    pdfEditMode.value[id] = mode
    openCategorySettings.value[id] = true
    pdfMenuOpen.value[id] = false
  }

  const closePdfPanel = (id: string) => {
    openCategorySettings.value[id] = false
    pdfMenuOpen.value[id] = false
  }

  const getEditDensity = (id: string) => pdfEditDensity.value[id] || 'geral'
  const setEditDensity = (id: string, density: 'geral' | '1' | '3' | '6') => {
    pdfEditDensity.value[id] = density
  }

  const getGlobalValue = (category: any, fieldName: string) => {
    const mode = getPdfMode(category.id)
    if (mode === 'landscape') {
      if (category.landscapeSettings && category.landscapeSettings[fieldName] !== undefined && category.landscapeSettings[fieldName] !== '') {
        return category.landscapeSettings[fieldName]
      }
      return category[fieldName]
    }
    return category[fieldName]
  }

  const getDensityTarget = (category: any) => {
    const mode = getPdfMode(category.id)
    const density = getEditDensity(category.id)

    if (density === 'geral') {
      if (mode === 'landscape') {
        if (!category.landscapeSettings) {
          category.landscapeSettings = {}
        }
        return category.landscapeSettings
      }
      return category
    }

    let root: any = category
    if (mode === 'landscape') {
      if (!category.landscapeSettings) {
        category.landscapeSettings = {}
      }
      root = category.landscapeSettings
    }

    if (!root.layout_settings) {
      root.layout_settings = {}
    }
    if (!root.layout_settings[density]) {
      root.layout_settings[density] = {}
    }
    return root.layout_settings[density]
  }

  const translateValue = (fieldName: string, value: any) => {
    if (value === undefined || value === null || value === '') return 'Não configurado'

    if (fieldName === 'imagePosition') {
      if (value === 'right') return 'Direita'
      if (value === 'left') return 'Esquerda'
      if (value === 'center') return 'Centralizado'
    }
    if (fieldName === 'cardHeaderLayout') {
      if (value === 'model-left') return 'Modelo à Esq. / Tag à Dir.'
      if (value === 'model-right') return 'Tag à Esq. / Modelo à Dir.'
    }
    if (fieldName === 'cardLayoutOrder') {
      if (value === 'specs-first') return 'Ficha Técnica Primeiro'
      if (value === 'image-first') return 'Imagem Primeiro'
    }
    if (fieldName === 'specsLineStyle') {
      if (value === 'dashed') return 'Tracejado (dashed)'
      if (value === 'solid') return 'Contínuo (solid)'
      if (value === 'dotted') return 'Pontilhado (dotted)'
      if (value === 'none') return 'Nenhum'
    }
    if (typeof value === 'boolean') {
      return value ? 'Ativado' : 'Desativado'
    }
    return String(value)
  }

  const applyDensityToGlobal = (category: any) => {
    const density = getEditDensity(category.id)
    if (density === 'geral') return

    const densityLabel = density === '6' ? '1 Produto por Página' : density === '3' ? '2 Produtos por Página' : '6 Produtos por Página'
    if (!confirm(`Deseja realmente aplicar as configurações de "${densityLabel}" como o padrão global para esta categoria?`)) {
      return
    }

    const mode = getPdfMode(category.id)
    let root: any = category
    if (mode === 'landscape') {
      if (!category.landscapeSettings) {
        category.landscapeSettings = {}
      }
      root = category.landscapeSettings
    }

    if (root.layout_settings && root.layout_settings[density]) {
      const overrides = root.layout_settings[density]
      for (const key of Object.keys(overrides)) {
        const val = overrides[key]
        if (val !== undefined && val !== null && val !== '') {
          root[key] = val
        }
      }
      delete root.layout_settings[density]
    }

    category.hasChanges = true
    setEditDensity(category.id, 'geral')
  }

  const getPdfTarget = (category: any) => {
    const mode = getPdfMode(category.id)
    if (mode === 'landscape') {
      if (!category.landscapeSettings) {
        category.landscapeSettings = {}
      }
      return category.landscapeSettings
    }
    return category
  }

  const getCoverImage = (category: any) => {
    if (category.coverImageBlob) {
      if (category.coverImageBlob.startsWith('data:')) return category.coverImageBlob
      if (category.coverImageBlob.startsWith('\\x')) {
        try {
          return `data:image/png;base64,${hexToBase64(category.coverImageBlob)}`
        } catch (e) {
          return '/placeholder.png'
        }
      }
      return `data:image/png;base64,${category.coverImageBlob}`
    }
    return category.coverImageUrl || '/placeholder.png'
  }

  const handleImageError = (e: Event) => {
    const img = e.target as HTMLImageElement
    if (!img.src.startsWith('data:image/svg+xml')) {
      img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af">Sem Imagem</text></svg>'
    }
  }

  return {
    pdfEditMode,
    pdfMenuOpen,
    pdfEditDensity,
    openCategorySettings,
    isPdfSettingsOpen,
    togglePdfSettings,
    isPdfMenuOpen,
    getPdfMode,
    togglePdfMenuOpen,
    openPdfPanel,
    closePdfPanel,
    getEditDensity,
    setEditDensity,
    getGlobalValue,
    getDensityTarget,
    translateValue,
    applyDensityToGlobal,
    getPdfTarget,
    getCoverImage,
    handleImageError
  }
}
export type UseAdminCategorySettings = ReturnType<typeof useAdminCategorySettings>
