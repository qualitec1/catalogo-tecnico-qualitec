<template>
  <span
    ref="containerRef"
    class="wm-lottie-icon inline-flex items-center justify-center shrink-0 pointer-events-none select-none"
    :style="{ width: `${sizePx}px`, height: `${sizePx}px` }"
    :aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import type { AnimationItem } from 'lottie-web'

interface Props {
  path?: string
  size?: number | string
  loop?: boolean
  autoplay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  path: '/animation/siren.json',
  size: 24,
  loop: true,
  autoplay: true
})

const containerRef = ref<HTMLElement | null>(null)
let animInstance: AnimationItem | null = null

const sizePx = computed(() => {
  const num = typeof props.size === 'string' ? parseInt(props.size, 10) : props.size
  return isNaN(num) || num <= 0 ? 24 : num
})

onMounted(async () => {
  if (!containerRef.value) return
  try {
    const lottieModule = await import('lottie-web')
    const lottie = lottieModule.default || lottieModule
    if (!containerRef.value) return

    animInstance = lottie.loadAnimation({
      container: containerRef.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: props.autoplay,
      path: props.path
    })
  } catch (err) {
    console.error('Falha ao carregar animação Lottie:', err)
  }
})

onBeforeUnmount(() => {
  if (animInstance) {
    animInstance.destroy()
    animInstance = null
  }
})
</script>

<style scoped>
.wm-lottie-icon :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
