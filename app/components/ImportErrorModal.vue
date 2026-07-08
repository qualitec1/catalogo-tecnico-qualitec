<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="show" class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="bg-red-50 px-6 py-4 border-b border-red-100">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <span class="material-symbols-outlined text-red-600 text-3xl">error</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-red-900">Importação Cancelada</h3>
                    <p class="text-sm text-red-700 mt-1">Categorias inválidas encontradas no arquivo CSV</p>
                  </div>
                </div>
                <button @click="closeModal" class="text-red-400 hover:text-red-600 transition-colors">
                  <span class="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-220px)]">
              <!-- Invalid Categories Section -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="material-symbols-outlined text-red-500 mr-2 text-lg">warning</span>
                  Produtos com Categorias Inválidas ({{ invalidCategories.length }})
                </h4>
                <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div class="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                    <div
                      v-for="(item, idx) in invalidCategories.slice(0, 50)"
                      :key="idx"
                      class="flex items-center text-sm py-1 px-2 hover:bg-red-100 rounded transition-colors"
                    >
                      <span class="text-red-600 font-mono mr-3 text-xs">Linha {{ item.line }}</span>
                      <span class="text-red-900 font-medium">"{{ item.category }}"</span>
                    </div>
                    <p v-if="invalidCategories.length > 50" class="text-xs text-red-600 italic mt-3 text-center">
                      ... e mais {{ invalidCategories.length - 50 }} linha(s) com erro
                    </p>
                  </div>
                </div>
              </div>

              <!-- Valid Categories Section -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span class="material-symbols-outlined text-green-500 mr-2 text-lg">check_circle</span>
                  Categorias Válidas ({{ validCategories.length }})
                </h4>
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div class="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-2">
                    <span
                      v-for="cat in validCategories"
                      :key="cat"
                      class="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 transition-colors"
                    >
                      {{ cat }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Help Text -->
              <div class="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-start space-x-3">
                  <span class="material-symbols-outlined text-blue-600 text-xl mt-0.5 flex-shrink-0">info</span>
                  <div class="text-sm text-blue-900 flex-1">
                    <p class="font-semibold mb-2">Como corrigir os erros:</p>
                    <ol class="list-decimal list-inside space-y-1.5 text-xs text-blue-800">
                      <li>Abra seu arquivo CSV em um editor de planilhas</li>
                      <li>Localize a coluna <strong>"category"</strong> nas linhas com erro listadas acima</li>
                      <li>Substitua o nome incorreto por uma das categorias válidas (copie e cole exatamente)</li>
                      <li>Salve o arquivo e tente importar novamente</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div class="flex justify-end">
                <button
                  @click="closeModal"
                  class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  invalidCategories: { line: number; category: string }[]
  validCategories: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const closeModal = () => {
  emit('close')
}

// Close on escape key
watch(() => props.show, (newVal) => {
  if (newVal) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }
})
</script>
