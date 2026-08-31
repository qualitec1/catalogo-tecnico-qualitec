<template>
  <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
      <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
        <span class="material-symbols-outlined text-blue-600">branding_watermark</span>
        Logotipo do Cabeçalho (Header do Site)
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="resetLogoDefaults"
          type="button"
          class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-xs">restart_alt</span>
          Restaurar Padrão da Logo
        </button>
        <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Todas as Páginas</span>
      </div>
    </div>

    <p class="text-xs text-slate-600">
      Ajuste o tamanho vertical e horizontal do logotipo e mova-o livremente para qualquer direção. A altura da barra de navegação permanece 100% fixa e estável (64px), sem distorcer o menu.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Coluna da Esquerda: Controles -->
      <div class="lg:col-span-6 space-y-4">
        <!-- 1. Imagem e Upload -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
          <label class="block text-[11px] font-bold text-slate-700 uppercase">
            URL ou Upload do Logotipo
          </label>
          <div class="flex gap-2">
            <input
              v-model="settings.header_logo_url"
              type="text"
              placeholder="https://... (.png, .svg, .jpg)"
              class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              @click="triggerLogoUpload"
              :disabled="uploading"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
            >
              <span class="material-symbols-outlined text-sm">{{ uploading ? 'sync' : 'upload' }}</span>
              Upload
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />
          </div>
        </div>

        <!-- 2. Dimensões: Altura e Largura -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">fit_screen</span>
            Dimensões do Logotipo (Vertical &amp; Horizontal)
          </h4>

          <!-- Altura (Vertical) -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
              <span>Altura (Vertical)</span>
              <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.header_logo_height || 48 }}px</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="settings.header_logo_height"
                type="range"
                min="20"
                max="200"
                step="1"
                class="flex-1 accent-blue-600 cursor-pointer"
              />
              <input
                v-model.number="settings.header_logo_height"
                type="number"
                min="20"
                max="200"
                class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono"
              />
            </div>
          </div>

          <!-- Largura (Horizontal) -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
              <span>Largura (Horizontal)</span>
              <span class="font-mono text-blue-600 font-bold text-xs">
                {{ !settings.header_logo_width || settings.header_logo_width === 0 ? 'Automática (Proporcional)' : `${settings.header_logo_width}px` }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="settings.header_logo_width"
                type="range"
                min="0"
                max="500"
                step="2"
                class="flex-1 accent-blue-600 cursor-pointer"
              />
              <input
                v-model.number="settings.header_logo_width"
                type="number"
                min="0"
                max="500"
                placeholder="Auto"
                class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono"
              />
            </div>
            <div class="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                @click="settings.header_logo_width = 0"
                class="px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer"
                :class="(!settings.header_logo_width || settings.header_logo_width === 0) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'"
              >
                Proporcional (Auto)
              </button>
              <button
                type="button"
                @click="settings.header_logo_width = 140"
                class="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                140px
              </button>
              <button
                type="button"
                @click="settings.header_logo_width = 200"
                class="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                200px
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Posicionamento Livre (Eixos X e Y) -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">open_with</span>
            Posição Livre (Deslocamento X e Y)
          </h4>

          <!-- Eixo X (Horizontal) -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
              <span>Posição Horizontal (Eixo X)</span>
              <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.header_logo_offset_x || 0 }}px</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="settings.header_logo_offset_x"
                type="range"
                min="-300"
                max="300"
                step="1"
                class="flex-1 accent-blue-600 cursor-pointer"
              />
              <input
                v-model.number="settings.header_logo_offset_x"
                type="number"
                min="-300"
                max="300"
                class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono"
              />
            </div>
          </div>

          <!-- Eixo Y (Vertical) -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
              <span>Posição Vertical (Eixo Y)</span>
              <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.header_logo_offset_y || 0 }}px</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="settings.header_logo_offset_y"
                type="range"
                min="-150"
                max="150"
                step="1"
                class="flex-1 accent-blue-600 cursor-pointer"
              />
              <input
                v-model.number="settings.header_logo_offset_y"
                type="number"
                min="-150"
                max="150"
                class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono"
              />
            </div>
          </div>

          <!-- Botões de Atalho e Microajuste (D-Pad) -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="settings.header_logo_offset_x = 0; settings.header_logo_offset_y = 0"
                class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[10px] font-bold rounded cursor-pointer transition-colors"
              >
                Centralizar (0, 0)
              </button>
            </div>

            <!-- Setas de ajuste fino (+-5px) -->
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-slate-500 font-semibold mr-1">Ajuste Fino:</span>
              <button type="button" @click="settings.header_logo_offset_x = (settings.header_logo_offset_x || 0) - 5" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold cursor-pointer" title="5px Esquerda">←</button>
              <button type="button" @click="settings.header_logo_offset_x = (settings.header_logo_offset_x || 0) + 5" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold cursor-pointer" title="5px Direita">→</button>
              <button type="button" @click="settings.header_logo_offset_y = (settings.header_logo_offset_y || 0) - 5" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold cursor-pointer" title="5px Cima">↑</button>
              <button type="button" @click="settings.header_logo_offset_y = (settings.header_logo_offset_y || 0) + 5" class="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold cursor-pointer" title="5px Baixo">↓</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna da Direita: Pré-Visualização Interativa do Header -->
      <div class="lg:col-span-6 space-y-3 flex flex-col">
        <div class="flex items-center justify-between">
          <label class="text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-blue-600">preview</span>
            Simulador do Header (Arraste a Logo)
          </label>
          <span class="text-blue-700 font-mono text-[11px] font-bold">
            X: {{ settings.header_logo_offset_x || 0 }}px | Y: {{ settings.header_logo_offset_y || 0 }}px
          </span>
        </div>

        <div
          ref="previewContainerRef"
          @mousedown="startDrag"
          class="w-full bg-slate-900/10 p-4 rounded-xl border border-slate-300 shadow-inner relative flex-1 min-h-[220px] flex flex-col justify-center select-none overflow-hidden"
        >
          <div class="text-[9px] text-slate-500 font-mono mb-2 uppercase text-center">
            Barra Superior Fixa (Altura: 64px) — A logo pode transbordar livremente
          </div>

          <!-- Barra Simulada do Header -->
          <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm h-16 px-4 flex items-center justify-between relative overflow-visible">
            <!-- Container Estável da Logo com Posicionamento e Arraste -->
            <div class="flex items-center h-full relative overflow-visible cursor-grab active:cursor-grabbing">
              <div
                class="transition-transform duration-75 relative select-none"
                :style="{
                  transform: `translate(${settings.header_logo_offset_x || 0}px, ${settings.header_logo_offset_y || 0}px)`
                }"
              >
                <img
                  :src="settings.header_logo_url || defaultLogo"
                  alt="Qualitec Logo"
                  class="object-contain pointer-events-none select-none max-w-none drop-shadow-xs"
                  :style="{
                    height: `${settings.header_logo_height || 48}px`,
                    width: settings.header_logo_width && settings.header_logo_width > 0 ? `${settings.header_logo_width}px` : 'auto'
                  }"
                />
              </div>
            </div>

            <!-- Links Simulados de Navegação -->
            <div class="hidden sm:flex items-center space-x-4 pointer-events-none opacity-80">
              <span class="text-xs font-bold text-blue-700">Home</span>
              <span class="text-xs text-gray-600">Catálogo</span>
              <span class="text-xs text-gray-600">Nossa Empresa</span>
              <span class="text-xs text-gray-600">Contato</span>
              <div class="flex items-center gap-1 ml-2">
                <span class="text-xs">🇧🇷</span>
                <span class="text-xs">🇺🇸</span>
                <span class="text-xs">🇪🇸</span>
              </div>
            </div>
          </div>

          <p class="text-[10px] text-slate-500 font-sans text-center mt-3">
            💡 Dica: Clique na logo no simulador e arraste para posicionar visualmente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  settings: any
  triggerToast?: (msg: string, type: 'success' | 'error') => void
}>()

const defaultLogo = 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/1785536986887_0a3ga6_qualitec_logo.png'
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const initialOffsetX = ref(0)
const initialOffsetY = ref(0)

const triggerLogoUpload = () => {
  fileInput.value?.click()
}

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      props.settings.header_logo_url = data.url
      props.triggerToast?.('Logotipo enviado com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar logotipo')
    }
  } catch (err: any) {
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploading.value = false
    if (target) target.value = ''
  }
}

const resetLogoDefaults = () => {
  props.settings.header_logo_url = defaultLogo
  props.settings.header_logo_height = 48
  props.settings.header_logo_width = 0
  props.settings.header_logo_offset_x = 0
  props.settings.header_logo_offset_y = 0
  props.triggerToast?.('Padrões do logotipo restaurados.', 'success')
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  initialOffsetX.value = props.settings.header_logo_offset_x || 0
  initialOffsetY.value = props.settings.header_logo_offset_y || 0

  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', stopDrag)
}

const onDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value

  const newX = Math.round(initialOffsetX.value + dx)
  const newY = Math.round(initialOffsetY.value + dy)

  props.settings.header_logo_offset_x = Math.max(-300, Math.min(300, newX))
  props.settings.header_logo_offset_y = Math.max(-150, Math.min(150, newY))
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', stopDrag)
}
</script>
