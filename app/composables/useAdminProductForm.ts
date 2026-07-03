import { ref, watch, onMounted } from 'vue'

export interface Spec {
  label: string
  value: string
}

export interface ProductPayload {
  id?: number
  title: string
  nameCode: string
  category: string
  tag: string
  layoutSlots: number
  image?: string | null
  imageName: string
  imageBlob: string | null
  datasheetName: string
  datasheetBlob: string | null
  datasheetUrl: string
  specs: Spec[]
  bgClass?: string
  imageScale?: number
  imageOffsetX?: number
  imageOffsetY?: number
  exImageUrl?: string | null
  tagColorClass?: string
}

export function useAdminProductForm(props: { product?: ProductPayload, isEdit?: boolean }, emit: any) {
  const getInitialProduct = (): ProductPayload => ({
    title: '',
    nameCode: '',
    category: '',
    tag: 'NOVO',
    layoutSlots: 3,
    image: '',
    imageName: '',
    imageBlob: null,
    datasheetName: '',
    datasheetBlob: null,
    datasheetUrl: '',
    imageScale: 1.0,
    imageOffsetX: 0,
    imageOffsetY: 0,
    exImageUrl: '',
    specs: [
      { label: 'Diâmetro Nominal', value: '1.1/2" ou 2.1/2"' },
      { label: 'Pressão de Trabalho', value: '14 bar (200 psi)' }
    ]
  })

  const localProduct = ref<ProductPayload>(props.product ? JSON.parse(JSON.stringify(props.product)) : getInitialProduct())
  const uploadingImage = ref(false)
  const uploadingPdf = ref(false)

  const getProductImagePreview = (product: any) => {
    if (product.imageBlob) {
      if (product.imageBlob.startsWith('data:')) return product.imageBlob
      return `data:image/png;base64,${product.imageBlob}`
    }
    return product.image || ''
  }

  watch(() => props.product, (newVal) => {
    if (newVal) {
      localProduct.value = JSON.parse(JSON.stringify(newVal))
    } else {
      localProduct.value = getInitialProduct()
    }
  }, { deep: true })

  const imgInput = ref<HTMLInputElement | null>(null)
  const pdfInput = ref<HTMLInputElement | null>(null)

  const triggerFileInput = (refName: 'imgInput' | 'pdfInput') => {
    if (refName === 'imgInput' && imgInput.value) {
      imgInput.value.click()
    } else if (refName === 'pdfInput' && pdfInput.value) {
      pdfInput.value.click()
    }
  }

  const handleImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploadingImage.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-r2', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      localProduct.value.image = data.url
      localProduct.value.imageName = file.name
      localProduct.value.imageBlob = null
    } catch (error: any) {
      console.error('Error uploading image to R2:', error)
      alert(`Erro no upload da imagem: ${error.message || error}`)
    } finally {
      uploadingImage.value = false
      target.value = ''
    }
  }

  const handleDatasheetUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploadingPdf.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-r2', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Erro ao fazer upload do datasheet')
      }

      const data = await response.json()
      localProduct.value.datasheetUrl = data.url
      localProduct.value.datasheetName = file.name
      localProduct.value.datasheetBlob = null
    } catch (error: any) {
      console.error('Error uploading PDF to R2:', error)
      alert(`Erro no upload do PDF: ${error.message || error}`)
    } finally {
      uploadingPdf.value = false
      target.value = ''
    }
  }

  const handleSubmit = () => {
    emit('submit', {
      product: {
        ...localProduct.value,
        bgClass: localProduct.value.bgClass || 'bg-secondary',
        tagColorClass: localProduct.value.tagColorClass || 'text-[#005db7]'
      },
      colorIndex: 0
    })
    if (!props.isEdit) {
      localProduct.value = getInitialProduct()
    }
  }

  return {
    localProduct,
    uploadingImage,
    uploadingPdf,
    imgInput,
    pdfInput,
    getProductImagePreview,
    triggerFileInput,
    handleImageUpload,
    handleDatasheetUpload,
    handleSubmit
  }
}
