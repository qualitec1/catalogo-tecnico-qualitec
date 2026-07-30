<template>
  <div class="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-blue-600">palette</span>
        Personalização Visual do Site
      </h2>
      <p class="text-xs text-gray-500 mt-1">
        Customize cores, fontes e estilos dos elementos exibidos no catálogo público.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 text-center text-gray-400">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
      <p class="text-xs">Carregando configurações...</p>
    </div>

    <template v-else>
      <!-- ===== SEÇÃO: Botão "VER DOCUMENTAÇÃO" ===== -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">smart_button</span>
          Botão "Ver Documentação"
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

          <!-- Borda Arredondada -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Borda Arredondada</label>
            <select v-model="settings.btn_doc_border_radius" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option value="0px">Sem arredondamento</option>
              <option value="4px">Sutil (4px)</option>
              <option value="8px">Médio (8px)</option>
              <option value="12px">Grande (12px)</option>
              <option value="9999px">Pílula</option>
            </select>
          </div>

          <!-- Texto do Botão -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Texto do Botão</label>
            <input v-model="settings.btn_doc_text" type="text" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded" />
          </div>
        </div>

        <!-- Preview do Botão -->
        <div class="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Pré-visualização</p>
          <div class="flex items-center gap-4">
            <a
              href="#"
              @click.prevent
              class="px-4 py-2 flex items-center justify-center gap-1.5 no-underline transition-colors"
              :style="btnDocPreviewStyle"
              @mouseenter="btnDocHover = true"
              @mouseleave="btnDocHover = false"
            >
              <span class="material-symbols-outlined text-sm">description</span>
              {{ settings.btn_doc_text || 'VER DOCUMENTAÇÃO' }}
            </a>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: Tag da Categoria ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-100">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">label</span>
          Tag da Categoria (no Card)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Tamanho da Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tamanho da Fonte</label>
            <select v-model="settings.card_tag_font_size" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="size in fontSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fonte</label>
            <select v-model="settings.card_tag_font_family" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="font in fontOptions" :key="font" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
            </select>
          </div>

          <!-- Estilo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estilo</label>
            <div class="flex items-center gap-2">
              <button 
                @click="settings.card_tag_bold = !settings.card_tag_bold"
                :class="settings.card_tag_bold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer font-bold text-sm transition-colors flex items-center justify-center"
              >B</button>
              <button 
                @click="settings.card_tag_italic = !settings.card_tag_italic"
                :class="settings.card_tag_italic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer italic text-sm transition-colors flex items-center justify-center"
              >I</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: Tabela de Especificações ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-100">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">table_rows</span>
          Tabela de Especificações (no Card)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cor de Fundo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo da Tabela</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Label -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Rótulo</label>
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

          <!-- Fonte da Tabela -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fonte da Tabela</label>
            <select v-model="settings.card_specs_font_family" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="font in fontOptions" :key="font" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
            </select>
          </div>

          <!-- Tamanho fonte Label -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tamanho Fonte Rótulo</label>
            <select v-model="settings.card_specs_label_font_size" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="size in fontSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Tamanho fonte Valor -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tamanho Fonte Valor</label>
            <select v-model="settings.card_specs_value_font_size" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="size in fontSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
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
const btnDocHover = ref(false)

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
}

const settings = reactive<SiteSettings>({ ...defaultSettings })

const btnDocPreviewStyle = computed(() => ({
  backgroundColor: btnDocHover.value ? settings.btn_doc_hover_color : settings.btn_doc_bg_color,
  color: settings.btn_doc_text_color,
  fontFamily: settings.btn_doc_font_family,
  fontSize: settings.btn_doc_font_size,
  fontWeight: settings.btn_doc_bold ? 'bold' : 'normal',
  fontStyle: settings.btn_doc_italic ? 'italic' : 'normal',
  textTransform: settings.btn_doc_uppercase ? 'uppercase' as const : 'none' as const,
  borderRadius: settings.btn_doc_border_radius,
  letterSpacing: '0.05em',
}))

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

    props.triggerToast?.('Configurações visuais do site salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminSiteSettings] Error saving settings:', err)
    props.triggerToast?.(`Erro ao salvar configurações: ${err.message || err}`, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>
