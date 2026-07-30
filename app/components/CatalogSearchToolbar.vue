<template>
  <div class="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
    <div class="flex flex-col gap-5">
      <!-- Filters Row / Search Input -->
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <div class="relative group flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            class="pl-10 pr-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full outline-none transition-all bg-white" 
            :placeholder="t.searchPlaceholder" 
            type="text"
          >
        </div>
      </div>

      <!-- Category Group Buttons -->
      <div v-if="showCategoryButtons && categoryButtonGroups.length > 0" class="pt-3 border-t border-gray-100">
        <!-- Group Buttons Row -->
        <div class="flex flex-wrap items-center gap-2">
          <button 
            v-for="group in categoryButtonGroups" 
            :key="group.name"
            @click="toggleGroup(group.name)"
            class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all border cursor-pointer flex items-center gap-1.5"
            :class="openGroup === group.name 
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
              : selectedCategory !== 'TODAS' && group.categories.includes(selectedCategory)
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100 hover:border-gray-300'"
          >
            <span class="material-symbols-outlined text-sm">{{ openGroup === group.name ? 'expand_less' : 'expand_more' }}</span>
            {{ translateCategory(group.name) }}
          </button>
        </div>

        <!-- Expanded Subcategories -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1 max-h-0"
          enter-to-class="opacity-100 translate-y-0 max-h-40"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 max-h-40"
          leave-to-class="opacity-0 -translate-y-1 max-h-0"
        >
          <div v-if="openGroup" class="mt-2 flex flex-wrap items-center gap-2 overflow-hidden">
            <button 
              v-for="cat in getGroupCategories(openGroup)" 
              :key="cat"
              @click="handleCategoryClick(cat)"
              class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded transition-all border cursor-pointer flex items-center gap-1.5"
              :class="selectedCategory === cat 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white text-slate-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'"
            >
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getCategoryColor(cat) || '#3b82f6' }"></span>
              {{ translateCategory(cat) }}
              <span class="text-[10px] opacity-75 px-1 rounded bg-black/10">
                {{ getCategoryProductCount(cat) }}
              </span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useCategoryColors from '~/composables/useCategoryColors'
import useTranslations from '~/composables/useTranslations'

export interface ButtonGroup {
  name: string
  categories: string[]
}

const props = withDefaults(defineProps<{
  searchQuery: string
  selectedCategory: string
  products?: any[]
  categoryButtonGroups?: ButtonGroup[]
  showCategoryButtons?: boolean
}>(), {
  products: () => [],
  categoryButtonGroups: () => [],
  showCategoryButtons: true
})

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:selectedCategory', val: string): void
}>()

const { getCategoryColor } = useCategoryColors()
const { t, translateCategory } = useTranslations()

const openGroup = ref<string | null>(null)

const toggleGroup = (groupName: string) => {
  if (openGroup.value === groupName) {
    openGroup.value = null
  } else {
    openGroup.value = groupName
  }
}

const getGroupCategories = (groupName: string): string[] => {
  const group = props.categoryButtonGroups.find(g => g.name === groupName)
  return group?.categories || []
}

const getCategoryProductCount = (categoryName: string) => {
  if (!categoryName) return 0
  const catUpper = categoryName.toUpperCase().trim()
  return props.products.filter(p => p.category && p.category.toUpperCase().trim() === catUpper).length
}

const handleCategoryClick = (cat: string) => {
  const nextVal = props.selectedCategory === cat ? 'TODAS' : cat
  emit('update:selectedCategory', nextVal)
}
</script>
