<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative px-6 py-3 font-semibold rounded-lg transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variant === 'primary'
        ? 'bg-emerald-600 text-white shadow-md hover:shadow-lg hover:bg-emerald-700 active:translate-y-0.5'
        : variant === 'secondary'
          ? 'bg-slate-100 text-slate-900 border-2 border-slate-300 hover:bg-slate-200 hover:border-slate-400 active:bg-slate-150'
          : variant === 'accent'
            ? 'bg-teal-600 text-white shadow-lg hover:shadow-xl hover:bg-teal-700 hover:-translate-y-0.5 active:translate-y-0'
            : ''
    ]"
  >
    <!-- Content -->
    <span class="relative flex items-center justify-center gap-2">
      <span v-if="loading" class="animate-spin">⏳</span>
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'accent'

interface Props {
  label: string
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false
})
</script>

<style scoped>
button {
  position: relative;
}

button:not(:disabled):hover {
  letter-spacing: 0.5px;
}
</style>
