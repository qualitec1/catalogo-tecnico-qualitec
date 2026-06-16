<template>
  <div class="model-viewer-wrapper bg-gray-100">
    <client-only>
      <div v-if="!modelViewerReady" class="flex items-center justify-center h-full text-gray-600">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl mb-2 animate-spin">progress_activity</span>
          <p class="text-sm">Carregando visualizador 3D...</p>
        </div>
      </div>
      <model-viewer
        v-show="modelViewerReady"
        :src="src"
        :alt="alt"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        loading="eager"
        reveal="auto"
        style="width: 100%; height: 100%; --progress-bar-color: #4f46e5;"
        @load="onModelLoad"
        @error="onModelError"
      >
        <div slot="progress-bar" style="display: none;"></div>
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

const onModelLoad = () => {
  console.log('✅ Modelo 3D carregado com sucesso!')
}

const onModelError = (event: any) => {
  console.error('❌ Erro ao carregar modelo 3D:', event)
}

onMounted(async () => {
  console.log('🔄 Iniciando carregamento do model-viewer...')
  console.log('📁 Arquivo 3D:', props.src)
  
  try {
    await import('@google/model-viewer')
    console.log('✅ Biblioteca model-viewer carregada')
    
    // Aguarda o custom element ser registrado
    await customElements.whenDefined('model-viewer')
    console.log('✅ Custom element model-viewer registrado')
    
    // Delay para garantir que está pronto
    setTimeout(() => {
      modelViewerReady.value = true
      console.log('✅ Visualizador 3D pronto')
    }, 200)
  } catch (error) {
    console.error('❌ Erro ao inicializar model-viewer:', error)
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
