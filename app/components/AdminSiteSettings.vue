<template>
  <div class="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-blue-600">palette</span>
        Personalização Visual do Site & Banner Principal
      </h2>
      <p class="text-xs text-gray-500 mt-1">
        Customize a imagem/vídeo de fundo do banner principal, frase de destaque, posição do card e estilos do catálogo público.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 text-center text-gray-400">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
      <p class="text-xs">Carregando configurações...</p>
    </div>

    <template v-else>
      <!-- ===== SEÇÃO: BANNER PRINCIPAL (HERO SECTION) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">featured_video</span>
            Banner Principal da Home (Hero)
          </h3>
          <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Edição de Imagem, Vídeo e Card</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Coluna da Esquerda: Formulário de Configuração -->
          <div class="space-y-5">
            <!-- Tipo de Fundo -->
            <div class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Tipo de Fundo</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="image" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">image</span> Foto / Imagem</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="video" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">movie</span> Vídeo (MP4/WebM)</span>
                </label>
              </div>
            </div>

            <!-- URL de Imagem / Upload -->
            <div v-if="settings.hero_bg_type === 'image'" class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Imagem de Fundo (URL ou Upload)</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="settings.hero_bg_image_url" 
                  type="text" 
                  placeholder="https://exemplo.com/imagem-fundo.jpg" 
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button 
                  @click="triggerBgUpload" 
                  :disabled="uploadingBg"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  {{ uploadingBg ? 'Enviando...' : 'Upload' }}
                </button>
              </div>
              <input ref="bgFileInput" type="file" accept="image/*,video/*" class="hidden" @change="handleBgUpload" />
            </div>

            <!-- URL de Vídeo / Upload -->
            <div v-else class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Vídeo de Fundo (URL MP4 ou Upload)</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="settings.hero_bg_video_url" 
                  type="text" 
                  placeholder="https://exemplo.com/video-fundo.mp4" 
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button 
                  @click="triggerBgUpload" 
                  :disabled="uploadingBg"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  {{ uploadingBg ? 'Enviando...' : 'Upload' }}
                </button>
              </div>
              <input ref="bgFileInput" type="file" accept="video/*,image/*" class="hidden" @change="handleBgUpload" />
            </div>

            <!-- Frase do Card Verde -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Frase / Texto do Card Destaque</label>
              <textarea 
                v-model="settings.hero_card_text" 
                rows="3"
                placeholder="“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “"
                class="w-full border border-gray-300 p-2.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <!-- Posição Horizontal e Vertical do Card -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Alinhamento Horizontal</label>
                <select v-model="settings.hero_card_position" class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer">
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Alinhamento Vertical</label>
                <select v-model="settings.hero_card_vertical_align" class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer">
                  <option value="top">Topo</option>
                  <option value="center">Centro</option>
                  <option value="bottom">Base (Abaixo)</option>
                </select>
              </div>
            </div>

            <!-- Cores do Card -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Cor de Fundo do Card</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.hero_card_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
                  <input v-model="settings.hero_card_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-full text-center bg-white font-mono rounded" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Cor do Texto</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.hero_card_text_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
                  <input v-model="settings.hero_card_text_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-full text-center bg-white font-mono rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna da Direita: Preview ao Vivo do Banner -->
          <div class="space-y-2">
            <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Preview em Tempo Real</span>
              <span class="text-gray-400 font-normal">Ao vivo</span>
            </label>
            <div class="relative w-full h-72 rounded-lg overflow-hidden border border-gray-300 bg-slate-900 shadow-inner flex">
              <!-- Background Video -->
              <video 
                v-if="settings.hero_bg_type === 'video' && settings.hero_bg_video_url"
                class="absolute inset-0 w-full h-full object-cover z-0"
                autoplay
                loop
                muted
                playsinline
                :src="settings.hero_bg_video_url"
              ></video>
              <!-- Background Image -->
              <img 
                v-else
                class="absolute inset-0 w-full h-full object-cover z-0" 
                :src="settings.hero_bg_image_url || 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo'"
              />

              <!-- Container position preview -->
              <div 
                class="relative z-10 w-full h-full p-4 flex transition-all duration-300"
                :class="[previewHorizontalClass, previewVerticalClass]"
              >
                <div 
                  class="p-4 max-w-xs rounded shadow-md transition-all duration-300 backdrop-blur-xs"
                  :style="{ backgroundColor: settings.hero_card_bg_color || '#74b934' }"
                >
                  <p 
                    class="font-medium text-xs leading-snug whitespace-pre-line"
                    :style="{ color: settings.hero_card_text_color || '#ffffff' }"
                  >
                    {{ settings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: BOTÃO "VER DOCUMENTAÇÃO" ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">smart_button</span>
          Botão "Ver Documentação" (Ficha Técnica)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cor de Fundo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor de Fundo Hover -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo (Hover)</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_hover_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_hover_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Texto -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Texto</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_text_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_text_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fonte</label>
            <select v-model="settings.btn_doc_font_family" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="font in fontOptions" :key="font" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
            </select>
          </div>

          <!-- Tamanho da Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tamanho da Fonte</label>
            <select v-model="settings.btn_doc_font_size" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="size in fontSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Estilo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estilo da Fonte</label>
            <div class="flex items-center gap-2">
              <button 
                @click="settings.btn_doc_bold = !settings.btn_doc_bold"
                :class="settings.btn_doc_bold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer font-bold text-sm transition-colors flex items-center justify-center"
                title="Negrito"
              >B</button>
              <button 
                @click="settings.btn_doc_italic = !settings.btn_doc_italic"
                :class="settings.btn_doc_italic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer italic text-sm transition-colors flex items-center justify-center"
                title="Itálico"
              >I</button>
              <button 
                @click="settings.btn_doc_uppercase = !settings.btn_doc_uppercase"
                :class="settings.btn_doc_uppercase ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer text-[10px] font-bold transition-colors flex items-center justify-center"
                title="Maiúsculas"
              >AA</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: ESPECIFICAÇÕES DOS CARDS ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">table_rows</span>
          Tabela de Especificações dos Cards
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cor de Fundo da Tabela -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo das Linhas Par</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Rótulo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Rótulo (Campo)</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_label_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_label_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Valor -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Valor</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_value_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_value_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Botão Salvar ===== -->
      <div class="flex justify-end pt-4 border-t border-gray-200">
        <button 
          @click="saveSettings" 
          :disabled="saving"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border-0 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-base">{{ saving ? 'sync' : 'save' }}</span>
          {{ saving ? 'Salvando...' : 'Salvar Configurações do Site' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

const props = defineProps<{
  triggerToast?: (msg: string, type: 'success' | 'error') => void
}>()

const supabase = useSupabaseClient()

const loading = ref(true)
const saving = ref(false)
const uploadingBg = ref(false)
const bgFileInput = ref<HTMLInputElement | null>(null)

const fontOptions = [
  'Inter', 'Roboto', 'Arial', 'Verdana', 'Helvetica', 'Georgia', 'Tahoma',
  'Trebuchet MS', 'Courier New', 'Times New Roman', 'Segoe UI', 'system-ui'
]

const fontSizeOptions = [
  '8px', '9px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px'
]

interface SiteSettings {
  // Botão "Ver Documentação"
  btn_doc_bg_color: string
  btn_doc_hover_color: string
  btn_doc_text_color: string
  btn_doc_font_family: string
  btn_doc_font_size: string
  btn_doc_bold: boolean
  btn_doc_italic: boolean
  btn_doc_uppercase: boolean
  btn_doc_border_radius: string
  btn_doc_text: string
  // Tag da Categoria
  card_tag_font_size: string
  card_tag_font_family: string
  card_tag_bold: boolean
  card_tag_italic: boolean
  // Tabela de Especificações
  card_specs_bg_color: string
  card_specs_label_color: string
  card_specs_value_color: string
  card_specs_font_family: string
  card_specs_label_font_size: string
  card_specs_value_font_size: string
  // Banner Principal (Hero)
  hero_bg_type: 'image' | 'video'
  hero_bg_image_url: string
  hero_bg_video_url: string
  hero_card_text: string
  hero_card_bg_color: string
  hero_card_text_color: string
  hero_card_position: 'left' | 'center' | 'right'
  hero_card_vertical_align: 'top' | 'center' | 'bottom'
}

const defaultSettings: SiteSettings = {
  btn_doc_bg_color: '#376092',
  btn_doc_hover_color: '#2b4c74',
  btn_doc_text_color: '#ffffff',
  btn_doc_font_family: 'system-ui',
  btn_doc_font_size: '12px',
  btn_doc_bold: true,
  btn_doc_italic: false,
  btn_doc_uppercase: true,
  btn_doc_border_radius: '4px',
  btn_doc_text: 'VER DOCUMENTAÇÃO',
  card_tag_font_size: '11px',
  card_tag_font_family: 'system-ui',
  card_tag_bold: true,
  card_tag_italic: false,
  card_specs_bg_color: '#f3f4f6',
  card_specs_label_color: '#374151',
  card_specs_value_color: '#111827',
  card_specs_font_family: 'system-ui',
  card_specs_label_font_size: '11px',
  card_specs_value_font_size: '12px',
  hero_bg_type: 'image',
  hero_bg_image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo',
  hero_bg_video_url: '',
  hero_card_text: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_bg_color: '#74b934',
  hero_card_text_color: '#ffffff',
  hero_card_position: 'left',
  hero_card_vertical_align: 'center',
}

const settings = reactive<SiteSettings>({ ...defaultSettings })

const previewHorizontalClass = computed(() => {
  const pos = settings.hero_card_position || 'left'
  if (pos === 'center') return 'justify-center'
  if (pos === 'right') return 'justify-end'
  return 'justify-start'
})

const previewVerticalClass = computed(() => {
  const align = settings.hero_card_vertical_align || 'center'
  if (align === 'top') return 'items-start'
  if (align === 'bottom') return 'items-end'
  return 'items-center'
})

const triggerBgUpload = () => {
  bgFileInput.value?.click()
}

const handleBgUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingBg.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      if (file.type.startsWith('video/')) {
        settings.hero_bg_type = 'video'
        settings.hero_bg_video_url = data.url
      } else {
        settings.hero_bg_type = 'image'
        settings.hero_bg_image_url = data.url
      }
      props.triggerToast?.('Arquivo enviado com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar arquivo')
    }
  } catch (err: any) {
    console.error('Erro no upload de mídia:', err)
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploadingBg.value = false
    if (target) target.value = ''
  }
}

const loadSettings = async () => {
  loading.value = true
  try {
    const { data } = await supabase
      .from('pdf_settings')
      .select('layout_settings')
      .eq('category', 'GERAL')
      .single()

    if (data?.layout_settings?.site_settings) {
      const saved = data.layout_settings.site_settings
      Object.keys(defaultSettings).forEach(key => {
        if (saved[key] !== undefined) {
          (settings as any)[key] = saved[key]
        }
      })
    }
  } catch (err) {
    console.error('[AdminSiteSettings] Error loading settings:', err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const { data: geralData } = await supabase
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .single()

    const currentLayout = geralData?.layout_settings || {}
    currentLayout.site_settings = { ...settings }

    if (geralData?.id) {
      await supabase
        .from('pdf_settings')
        .update({ layout_settings: currentLayout })
        .eq('id', geralData.id)
    } else {
      await supabase
        .from('pdf_settings')
        .insert([{ category: 'GERAL', layout_settings: currentLayout }])
    }

    props.triggerToast?.('Configurações visuais e do Banner principal salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminSiteSettings] Error saving settings:', err)
    props.triggerToast?.(`Erro ao salvar configurações: ${err.message || err}`, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>
