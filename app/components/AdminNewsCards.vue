<template>
  <div class="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-emerald-600">newspaper</span>
        Cards de Novidades (Home)
      </h2>
      <p class="text-xs text-gray-500 mt-1">
        Configure as imagens, títulos e links dos 3 cards na seção "Novidades" da página inicial.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 text-center text-gray-400">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
      <p class="text-xs">Carregando cards...</p>
    </div>

    <template v-else>
      <!-- Card Tabs -->
      <div class="flex gap-2 border-b border-gray-200 pb-2">
        <button
          v-for="n in 3"
          :key="n"
          @click="activeCard = n"
          :class="activeCard === n
            ? 'bg-emerald-600 text-white font-bold shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'"
          class="px-5 py-2 text-xs uppercase tracking-wider rounded transition-colors border-0 cursor-pointer flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-sm">crop_square</span>
          Card {{ n }}
        </button>
      </div>

      <!-- Card Editor -->
      <div v-for="n in 3" :key="n" v-show="activeCard === n" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Left: Image & Title -->
          <div class="space-y-5">
            <!-- Image URL + Preview -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">image</span>
                Imagem do Card
              </h3>
              <div class="flex gap-2">
                <input
                  v-model="cards[n-1].image_url"
                  type="text"
                  placeholder="https://... ou upload abaixo"
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  @click="triggerImageUpload(n)"
                  :disabled="uploadingImage === n"
                  class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingImage === n ? 'sync' : 'upload' }}</span>
                  {{ uploadingImage === n ? '...' : 'Upload' }}
                </button>
                <input :ref="(el) => { imageFileInputs[n-1] = el as HTMLInputElement }" type="file" accept="image/*" class="hidden" @change="handleImageUpload($event, n)" />
              </div>

              <!-- Preview -->
              <div v-if="cards[n-1].image_url" class="w-full h-36 bg-[#e0e0e0] flex items-center justify-center overflow-hidden rounded border border-gray-200">
                <img
                  :src="cards[n-1].image_url"
                  :alt="`Card ${n}`"
                  class="max-h-full max-w-full object-contain"
                  @error="handleImgError($event)"
                />
              </div>
              <div v-else class="w-full h-24 bg-slate-100 flex items-center justify-center rounded border border-dashed border-slate-300">
                <p class="text-xs text-slate-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-base">broken_image</span>
                  Sem imagem configurada
                </p>
              </div>
            </div>

            <!-- Titles PT / EN / ES -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">title</span>
                Título do Card
              </h3>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-base shrink-0">🇧🇷</span>
                  <input v-model="cards[n-1].title_pt" type="text" placeholder="Título em Português" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-base shrink-0">🇬🇧</span>
                  <input v-model="cards[n-1].title_en" type="text" placeholder="Title in English" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-base shrink-0">🇪🇸</span>
                  <input v-model="cards[n-1].title_es" type="text" placeholder="Título en Español" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Link Configuration -->
          <div class="space-y-5">
            <!-- Link Type -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">link</span>
                Destino ao Clicar no Card
              </h3>

              <div class="space-y-1">
                <label class="text-[10px] text-gray-500 font-bold uppercase">Tipo de link</label>
                <select
                  v-model="cards[n-1].link_type"
                  class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="category">📂 Categoria de Produto</option>
                  <option value="pdf">📄 PDF / Arquivo</option>
                  <option value="page">🔗 Página Interna</option>
                  <option value="url">🌐 URL Personalizada</option>
                </select>
              </div>

              <!-- Category selector -->
              <div v-if="cards[n-1].link_type === 'category'" class="space-y-1">
                <label class="text-[10px] text-gray-500 font-bold uppercase">Categoria</label>
                <select
                  v-model="cards[n-1].link_value"
                  class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Selecione uma categoria --</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <p class="text-[10px] text-gray-400 mt-1">→ Leva para <code class="bg-gray-100 px-1">/catalogo?segment={{ cards[n-1].link_value || '...' }}</code></p>
              </div>

              <!-- PDF URL -->
              <div v-else-if="cards[n-1].link_type === 'pdf'" class="space-y-1">
                <label class="text-[10px] text-gray-500 font-bold uppercase">URL do PDF</label>
                <div class="flex gap-2">
                  <input
                    v-model="cards[n-1].link_value"
                    type="text"
                    placeholder="https://... URL do PDF"
                    class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    @click="triggerPdfUpload(n)"
                    :disabled="uploadingPdf === n"
                    class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                  >
                    <span class="material-symbols-outlined text-sm">{{ uploadingPdf === n ? 'sync' : 'upload' }}</span>
                    {{ uploadingPdf === n ? '...' : 'PDF' }}
                  </button>
                  <input :ref="(el) => { pdfFileInputs[n-1] = el as HTMLInputElement }" type="file" accept="application/pdf" class="hidden" @change="handlePdfUpload($event, n)" />
                </div>
                <p class="text-[10px] text-gray-400 mt-1">→ Abre o PDF em nova aba ao clicar no card.</p>
              </div>

              <!-- Internal Page -->
              <div v-else-if="cards[n-1].link_type === 'page'" class="space-y-1">
                <label class="text-[10px] text-gray-500 font-bold uppercase">Página</label>
                <select
                  v-model="cards[n-1].link_value"
                  class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="/">Home (Início)</option>
                  <option value="/catalogo">Catálogo de Produtos</option>
                  <option value="/nossa-empresa">Nossa Empresa</option>
                  <option value="/contato">Contato</option>
                </select>
                <p class="text-[10px] text-gray-400 mt-1">→ Navega para <code class="bg-gray-100 px-1">{{ cards[n-1].link_value }}</code></p>
              </div>

              <!-- Custom URL -->
              <div v-else-if="cards[n-1].link_type === 'url'" class="space-y-1">
                <label class="text-[10px] text-gray-500 font-bold uppercase">URL Personalizada</label>
                <input
                  v-model="cards[n-1].link_value"
                  type="text"
                  placeholder="https://..."
                  class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- Link Button (optional) -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">smart_button</span>
                  Botão / Label extra no Card
                </h3>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <span class="text-[10px] text-gray-500 font-semibold">Exibir</span>
                  <div class="relative">
                    <input type="checkbox" v-model="cards[n-1].show_link_button" class="sr-only" />
                    <div class="w-9 h-5 rounded-full transition-colors" :class="cards[n-1].show_link_button ? 'bg-emerald-500' : 'bg-gray-300'"></div>
                    <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" :class="cards[n-1].show_link_button ? 'translate-x-4' : 'translate-x-0'"></div>
                  </div>
                </label>
              </div>
              <p class="text-[10px] text-gray-400">Ex: "Veja nossos produtos →" aparece abaixo do título do card.</p>

              <template v-if="cards[n-1].show_link_button">
                <div class="space-y-2 pt-1">
                  <div class="flex items-center gap-2">
                    <span class="text-base shrink-0">🇧🇷</span>
                    <input v-model="cards[n-1].link_label_pt" type="text" placeholder="Veja nossos produtos" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-base shrink-0">🇬🇧</span>
                    <input v-model="cards[n-1].link_label_en" type="text" placeholder="See our products" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-base shrink-0">🇪🇸</span>
                    <input v-model="cards[n-1].link_label_es" type="text" placeholder="Ver nuestros productos" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>

                <!-- Preview -->
                <div class="border border-dashed border-emerald-300 rounded p-3 bg-white mt-2">
                  <p class="text-[10px] text-gray-400 mb-2 uppercase font-bold">Prévia</p>
                  <div class="flex items-center justify-center">
                    <span class="text-sm text-[#665c48] border-b border-[#665c48] pb-0.5 cursor-pointer">
                      {{ cards[n-1].link_label_pt || 'Veja nossos produtos' }} →
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2 border-t border-gray-100">
          <button
            @click="saveCard(n)"
            :disabled="saving"
            class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-0 cursor-pointer shadow-sm"
          >
            <span class="material-symbols-outlined text-base">{{ saving ? 'sync' : 'save' }}</span>
            {{ saving ? 'Salvando...' : `Salvar Card ${n}` }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  triggerToast: (msg: string, type?: 'success' | 'error') => void
}>()

const supabase = useSupabaseClient()

const loading = ref(true)
const saving = ref(false)
const activeCard = ref(1)
const uploadingImage = ref<number | null>(null)
const uploadingPdf = ref<number | null>(null)

interface NewsCard {
  id: number
  title_pt: string
  title_en: string
  title_es: string
  image_url: string
  link_type: string
  link_value: string
  link_label_pt: string
  link_label_en: string
  link_label_es: string
  show_link_button: boolean
}

const cards = ref<NewsCard[]>([
  { id: 1, title_pt: 'Novo Catálogo', title_en: 'New Catalog', title_es: 'Nuevo Catálogo', image_url: '', link_type: 'page', link_value: '/catalogo', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
  { id: 2, title_pt: 'Transmissor de nível flangeado', title_en: 'Flanged level transmitter', title_es: 'Transmisor de nivel bridado', image_url: '', link_type: 'category', link_value: 'Criogenia', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
  { id: 3, title_pt: 'Regulador Pressão CO2', title_en: 'CO2 Pressure Regulator', title_es: 'Regulador de Presión CO2', image_url: '', link_type: 'category', link_value: 'Gases Técnicos', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
])

const availableCategories = ref<string[]>([
  'Criogenia', 'Óleo & Gás', 'Gases Técnicos', 'Energia', 'Açúcar & Álcool', 'Alimentícia'
])

const imageFileInputs = ref<(HTMLInputElement | null)[]>([null, null, null])
const pdfFileInputs = ref<(HTMLInputElement | null)[]>([null, null, null])

const fetchCategories = async () => {
  try {
    const { data } = await (supabase as any).from('category_assets').select('category').order('category', { ascending: true })
    if (data && data.length > 0) {
      availableCategories.value = data.map((c: any) => c.category)
    }
  } catch {}
}

const fetchCards = async () => {
  loading.value = true
  try {
    const { data, error } = await (supabase as any).from('home_news_cards').select('*').order('id', { ascending: true })
    if (error) throw error
    if (data && data.length > 0) {
      cards.value = cards.value.map((card) => {
        const dbCard = data.find((d: any) => d.id === card.id)
        return dbCard ? { ...card, ...dbCard } : card
      })
    }
  } catch (err) {
    console.warn('[AdminNewsCards] Could not load from DB:', err)
  } finally {
    loading.value = false
  }
}

const saveCard = async (n: number) => {
  saving.value = true
  try {
    const card = cards.value[n - 1]
    const { error } = await (supabase as any)
      .from('home_news_cards')
      .upsert({
        id: card.id,
        title_pt: card.title_pt,
        title_en: card.title_en,
        title_es: card.title_es,
        image_url: card.image_url,
        link_type: card.link_type,
        link_value: card.link_value,
        link_label_pt: card.link_label_pt,
        link_label_en: card.link_label_en,
        link_label_es: card.link_label_es,
        show_link_button: card.show_link_button,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) throw error
    props.triggerToast(`✅ Card ${n} salvo com sucesso!`, 'success')
  } catch (err: any) {
    props.triggerToast(`Erro ao salvar Card ${n}: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

const triggerImageUpload = (n: number) => imageFileInputs.value[n - 1]?.click()

const handleImageUpload = async (event: Event, n: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingImage.value = n
  try {
    const ext = file.name.split('.').pop()
    const filename = `news-card-${n}-${Date.now()}.${ext}`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)
    formData.append('folder', 'home-cards')
    const res = await $fetch<{ url: string }>('/api/upload-r2', { method: 'POST', body: formData })
    if (res?.url) {
      cards.value[n - 1].image_url = res.url
      props.triggerToast('Imagem enviada com sucesso!', 'success')
    }
  } catch (err: any) {
    props.triggerToast(`Erro no upload: ${err.message}`, 'error')
  } finally {
    uploadingImage.value = null
  }
}

const triggerPdfUpload = (n: number) => pdfFileInputs.value[n - 1]?.click()

const handlePdfUpload = async (event: Event, n: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingPdf.value = n
  try {
    const filename = `news-pdf-${n}-${Date.now()}.pdf`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)
    formData.append('folder', 'home-cards')
    const res = await $fetch<{ url: string }>('/api/upload-r2', { method: 'POST', body: formData })
    if (res?.url) {
      cards.value[n - 1].link_value = res.url
      props.triggerToast('PDF enviado com sucesso!', 'success')
    }
  } catch (err: any) {
    props.triggerToast(`Erro no upload do PDF: ${err.message}`, 'error')
  } finally {
    uploadingPdf.value = null
  }
}

const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.opacity = '0.3'
}

onMounted(async () => {
  await Promise.all([fetchCards(), fetchCategories()])
})
</script>
