<template>
  <div class="model-viewer-wrapper bg-gray-100">
    <client-only>
      <div v-if="error" class="flex items-center justify-center h-full text-gray-600 p-8">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl mb-2 text-red-500">error</span>
          <p class="text-sm font-semibold mb-2">Erro ao carregar modelo 3D</p>
          <p class="text-xs text-gray-500">{{ error }}</p>
        </div>
      </div>
      <div v-else-if="!modelViewerReady" class="flex items-center justify-center h-full text-gray-600">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl mb-2 animate-spin">progress_activity</span>
          <p class="text-sm">Carregando visualizador 3D...</p>
        </div>
      </div>
      <model-viewer
        v-show="modelViewerReady && !error"
        :src="src"
        :alt="alt"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        loading="eager"
        reveal="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style="width: 100%; height: 100%; --progress-bar-color: #4f46e5;"
        @load="onModelLoad"
        @error="onModelError"
      >
        <div slot="progress-bar">
          <div class="flex items-center justify-center h-full">
            <div class="text-center text-gray-600">
              <span class="material-symbols-outlined text-4xl mb-2 animate-spin">progress_activity</span>
              <p class="text-xs">Carregando modelo (65MB)...</p>
            </div>
          </div>
        </div>
      </model-viewer>
      <template #fallback>
        <div class="flex items-center justify-center h-full text-gray-400">
          Inicializando...
        </div>
      </template>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
}>(), {
  alt: 'Modelo 3D'
})

const modelViewerReady = ref(false)
const error = ref<string | null>(null)

const onModelLoad = () => {
  console.log('✅ Modelo 3D carregado com sucesso!')
  error.value = null
}

const onModelError = (event: any) => {
  console.error('❌ Erro ao carregar modelo 3D:', event)
  console.error('❌ Detalhes do erro:', {
    detail: event.detail,
    sourceError: event.detail?.sourceError,
    type: event.detail?.type,
    message: event.detail?.sourceError?.message,
    stack: event.detail?.sourceError?.stack
  })
  
  const errorMsg = event.detail?.sourceError?.message || event.detail?.type || 'Erro desconhecido'
  error.value = `Falha ao carregar: ${errorMsg}`
}

onMounted(async () => {
  console.log('🔄 Iniciando carregamento do model-viewer...')
  console.log('📁 Arquivo 3D:', props.src)
  
  try {
    // Importa a biblioteca
    await import('@google/model-viewer')
    console.log('✅ Biblioteca model-viewer carregada')
    
    // Verifica se customElements está disponível
    if (typeof customElements === 'undefined') {
      throw new Error('customElements não disponível')
    }
    
    // Aguarda o custom element ser registrado
    await customElements.whenDefined('model-viewer')
    console.log('✅ Custom element model-viewer registrado')
    
    // Delay para garantir que está pronto
    setTimeout(() => {
      modelViewerReady.value = true
      console.log('✅ Visualizador 3D pronto')
    }, 200)
  } catch (err: any) {
    console.error('❌ Erro ao inicializar model-viewer:', err)
    error.value = `Erro de inicialização: ${err.message || 'Desconhecido'}`
  }
})
</script>

<style scoped>
.model-viewer-wrapper {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
