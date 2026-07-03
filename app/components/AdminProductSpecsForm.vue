<template>
  <div class="border-t border-gray-200 pt-4">
    <label class="block text-xs font-bold text-gray-500 uppercase mb-3">Especificações Técnicas</label>
    <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
      <div v-for="(spec, index) in specs" :key="index" class="flex gap-2 items-center">
        <input v-model="spec.label" class="w-1/2 border border-gray-300 rounded p-2 text-xs bg-white text-slate-800" placeholder="Ex: Diâmetro" type="text" required />
        <input v-model="spec.value" class="w-1/2 border border-gray-300 rounded p-2 text-xs bg-white text-slate-800" placeholder="Ex: 2.1/2" type="text" required />
        <button type="button" @click="removeSpecItem(index)" class="p-1 text-red-650 hover:bg-red-50 rounded transition-colors border-0 bg-transparent cursor-pointer">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
    <button type="button" @click="addSpecItem" class="mt-2 flex items-center text-xs text-blue-650 hover:text-blue-700 transition-colors font-medium border-0 bg-transparent cursor-pointer">
      <span class="material-symbols-outlined text-sm mr-1">add</span> Adicionar Item
    </button>
  </div>
</template>

<script setup lang="ts">
interface Spec {
  label: string
  value: string
}

const props = defineProps<{
  specs: Spec[]
}>()

const addSpecItem = () => {
  props.specs.push({ label: '', value: '' })
}

const removeSpecItem = (index: number) => {
  props.specs.splice(index, 1)
}
</script>
