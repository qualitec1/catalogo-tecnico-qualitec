<template>
  <div class="relative">
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:shadow-md focus:shadow-emerald-200/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <p v-if="error" class="absolute top-full mt-1 text-xs text-red-500 font-medium">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: string
  type?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  error: '',
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
</script>

<style scoped>
input::placeholder {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

input:focus::placeholder {
  opacity: 0.3;
}
</style>
