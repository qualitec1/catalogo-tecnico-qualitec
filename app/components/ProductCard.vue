<template>
  <article class="product-card bg-white border border-gray-300 overflow-hidden flex flex-col h-full shadow-sm">
    <!-- Header com Tag e Checkbox -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-xs font-semibold tracking-wider uppercase" :style="{ color: getTagColor(product.tagColorClass) }">
          {{ product.tag }}
        </span>
        <input 
          :checked="isSelected" 
          @change="$emit('toggleSelect', product.id)"
          class="w-5 h-5 border-2 border-gray-400 text-blue-600 focus:ring-0 cursor-pointer" 
          type="checkbox"
        >
      </div>
    </div>

    <!-- Imagem do Produto -->
    <div class="bg-white flex items-center justify-center p-8 min-h-[260px]">
      <img 
        :alt="product.title" 
        class="w-full h-full object-contain max-h-[220px] cursor-pointer hover:opacity-90 transition-opacity" 
        :src="getProductImage(product)"
        @error="handleImageError"
        @click="$emit('openImage', product)"
      >
    </div>

    <!-- Cabeçalho Colorido com Modelo e Título -->
    <div class="p-5" :style="{ backgroundColor: getBgColor(product.bgClass, product.category) }">
      <!-- Modelo -->
      <div class="flex justify-end mb-3">
        <div class="text-right">
          <span class="text-white/80 text-[10px] font-semibold uppercase tracking-wider block">Modelo</span>
          <h4 class="text-white text-3xl font-bold leading-none">{{ product.nameCode }}</h4>
        </div>
      </div>

      <!-- Título -->
      <h3 class="text-white text-lg font-bold leading-tight">{{ product.title }}</h3>
      
      <!-- Descrição (se houver) -->
      <p v-if="product.description" class="text-white/90 text-sm mt-2 leading-snug">{{ product.description }}</p>
    </div>

    <!-- Tabela de Especificações - Fundo Cinza -->
    <div class="flex-grow bg-gray-100 p-5">
      <table class="w-full">
        <tbody>
          <tr v-for="(spec, idx) in product.specs" :key="idx" class="border-b border-gray-300/50 last:border-0">
            <td class="py-2.5 px-0 text-xs font-semibold text-gray-700 align-top">{{ spec.label }}</td>
            <td class="py-2.5 px-0 text-sm text-gray-900 text-right align-top">{{ spec.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botão de Ação -->
    <div class="p-4 bg-white border-t border-gray-200">
      <a 
        v-if="product.datasheetUrl" 
        :href="product.datasheetUrl" 
        target="_blank"
        class="w-full py-3 bg-[#376092] hover:bg-[#2b4c74] text-white font-semibold text-sm transition-colors rounded uppercase tracking-wide flex items-center justify-center gap-2 no-underline"
      >
        <span class="material-symbols-outlined text-base">description</span>
        VER DOCUMENTAÇÃO
      </a>
      <div v-else class="text-xs text-gray-400 text-center py-2">
        Nenhuma documentação disponível
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import useCategoryColors from '~/composables/useCategoryColors'

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  tag: string;
  tagColorClass: string;
  nameCode: string;
  title: string;
  description: string;
  image: string;
  imageBlob?: string;
  bgClass: string;
  cardLayout: string;
  category: string;
  specs: Spec[];
  datasheetName?: string;
  datasheetUrl?: string;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  layoutSlots?: number;
}

const props = defineProps<{
  product: Product;
  isSelected: boolean;
}>()

defineEmits<{
  (e: 'toggleSelect', id: number): void;
  (e: 'openImage', product: Product): void;
}>()

const { getCategoryColor } = useCategoryColors()

const getBgColor = (bgClass: string, category?: string) => {
  const catColor = getCategoryColor(category)
  if (catColor) return catColor

  if (!bgClass) return '#376092';
  if (bgClass.startsWith('#')) return bgClass;
  const hexMatch = bgClass.match(/bg-\[#([0-9a-fA-F]{6})\]/);
  return hexMatch ? `#${hexMatch[1]}` : '#376092';
}

const getTagColor = (colorClass: string) => {
  if (!colorClass) return '#1d4ed8';
  if (colorClass.startsWith('#')) return colorClass;
  const hexMatch = colorClass.match(/text-\[#([0-9a-fA-F]{6})\]/);
  if (hexMatch) return `#${hexMatch[1]}`;
  const colorMap: Record<string, string> = {
    'text-blue-700': '#1d4ed8',
    'text-green-700': '#15803d',
    'text-green-600': '#16a34a',
    'text-purple-700': '#7e22ce',
    'text-blue-800': '#1e40af'
  };
  return colorMap[colorClass] || colorClass;
}

const getProductImage = (product: any) => {
  if (product.imageBlob) {
    if (product.imageBlob.startsWith('data:')) return product.imageBlob
    return `data:image/png;base64,${product.imageBlob}`
  }
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    return `/api/proxy-image?url=${encodeURIComponent(product.image)}`
  }
  return product.image || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto'
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  const fallbackUrl = `/api/product-image?id=${props.product.id}`;
  if (img.src !== fallbackUrl && !img.src.includes('/api/product-image')) {
    img.src = fallbackUrl;
  } else {
    img.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto';
  }
}
</script>
