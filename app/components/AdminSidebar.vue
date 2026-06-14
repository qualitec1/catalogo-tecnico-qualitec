<template>
  <aside class="h-screen w-64 fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col py-8 z-50">
    <div class="px-6 mb-10">
      <h1 class="text-xl font-bold text-slate-800">Admin Qualitec</h1>
      <p class="text-xs text-slate-500 mt-1">Gestão Técnica</p>
    </div>
    <nav class="flex-1 space-y-1">
      <a 
        @click.prevent="$emit('update:modelValue', 'produtos')" 
        :class="modelValue === 'produtos' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        class="flex items-center px-6 py-3 text-sm transition-all duration-150 cursor-pointer" 
        href="#"
      >
        <span class="material-symbols-outlined mr-3">inventory_2</span>
        <span>Produtos</span>
      </a>
      <a 
        @click.prevent="$emit('update:modelValue', 'categorias')" 
        :class="modelValue === 'categorias' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        class="flex items-center px-6 py-3 text-sm transition-all duration-150 cursor-pointer" 
        href="#"
      >
        <span class="material-symbols-outlined mr-3">category</span>
        <span>Categorias & Capas</span>
      </a>
      <a 
        class="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 text-sm cursor-pointer" 
        href="#" 
        @click.prevent="$emit('csv-click')"
      >
        <span class="material-symbols-outlined mr-3">upload_file</span>
        <span>Importar CSV</span>
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'csv-click'): void
}>()
</script>