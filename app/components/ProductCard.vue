<template>
  <article class="product-card bg-white border border-gray-300 overflow-hidden flex flex-col h-full shadow-sm text-slate-800">
    <!-- Header com Tag e Checkbox -->
    <div class="px-3.5 py-2.5 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <span 
          class="tracking-wider uppercase" 
          :style="tagStyle"
        >
          {{ product.tag }}
        </span>
        <input 
          v-if="showSelectCheckbox"
          :checked="isSelected" 
          @change="$emit('toggleSelect', product.id)"
          class="w-4 h-4 border-2 border-gray-400 text-blue-600 focus:ring-0 cursor-pointer" 
          type="checkbox"
        >
      </div>
    </div>

    <!-- Imagem do Produto -->
    <div class="bg-white flex items-center justify-center p-4 min-h-[190px]">
      <img 
        :alt="product.title" 
        class="w-full h-full object-contain max-h-[160px] cursor-pointer hover:opacity-90 transition-opacity" 
        :src="getProductImage(product)"
        @error="handleImageError"
        @click="$emit('openImage', product)"
      >
    </div>

    <!-- Cabeçalho Colorido com Modelo e Título -->
    <div class="p-3.5" :style="{ backgroundColor: getBgColor(product.bgClass, product.category) }">
      <!-- Modelo -->
      <div class="flex justify-end mb-1.5">
        <div class="text-right">
          <span class="text-white/80 text-[9px] font-semibold uppercase tracking-wider block">Modelo</span>
          <h4 class="text-white text-2xl font-bold leading-none">{{ product.nameCode }}</h4>
        </div>
      </div>

      <!-- Título -->
      <h3 class="text-white text-base font-bold leading-tight">{{ product.title }}</h3>
      
      <!-- Descrição (se houver) -->
      <p v-if="product.description" class="text-white/90 text-xs mt-1.5 leading-snug">{{ product.description }}</p>
    </div>

    <!-- Tabela de Especificações - Fundo Cinza -->
    <div class="flex-grow p-3.5" :style="{ backgroundColor: ss.card_specs_bg_color }">
      <table class="w-full" :style="{ fontFamily: ss.card_specs_font_family }">
        <tbody>
          <tr v-for="(spec, idx) in product.specs" :key="idx" class="border-b border-gray-300/40 last:border-0">
            <td 
              class="py-1.5 px-0 font-semibold align-top leading-tight" 
              :style="{ color: ss.card_specs_label_color, fontSize: ss.card_specs_label_font_size }"
            >{{ spec.label }}</td>
            <td 
              class="py-1.5 px-0 font-medium text-right align-top leading-tight" 
              :style="{ color: ss.card_specs_value_color, fontSize: ss.card_specs_value_font_size }"
            >{{ sanitizeSpecValue(spec.value, spec.label) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botão de Ação -->
    <div class="p-3 bg-white border-t border-gray-200">
      <a 
        v-if="product.datasheetUrl" 
        :href="product.datasheetUrl" 
        target="_blank"
        class="w-full py-2 flex items-center justify-center gap-1.5 no-underline transition-colors"
        :style="btnDocStyle"
        @mouseenter="btnHover = true"
        @mouseleave="btnHover = false"
      >
        <span class="material-symbols-outlined text-sm">description</span>
        {{ ss.btn_doc_text || 'VER DOCUMENTAÇÃO' }}
      </a>
      <div v-else class="text-[11px] text-gray-400 text-center py-1">
        Nenhuma documentação disponível
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import useCategoryColors from '~/composables/useCategoryColors'
import useSiteSettings from '~/composables/useSiteSettings'
import { sanitizeSpecValue } from '~/utils/pdfDocUtils'

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
  exImageUrl?: string | null;
  ex_image_url?: string | null;
}

const props = withDefaults(defineProps<{
  product: Product;
  isSelected?: boolean;
  showSelectCheckbox?: boolean;
}>(), {
  isSelected: false,
  showSelectCheckbox: false
})

defineEmits<{
  (e: 'toggleSelect', id: number): void;
  (e: 'openImage', product: Product): void;
}>()

const { getCategoryColor } = useCategoryColors()
const { siteSettings } = useSiteSettings()
const ss = siteSettings

const btnHover = ref(false)

const btnDocStyle = computed(() => ({
  backgroundColor: btnHover.value ? ss.value.btn_doc_hover_color : ss.value.btn_doc_bg_color,
  color: ss.value.btn_doc_text_color,
  fontFamily: ss.value.btn_doc_font_family,
  fontSize: ss.value.btn_doc_font_size,
  fontWeight: ss.value.btn_doc_bold ? 'bold' : '600',
  fontStyle: ss.value.btn_doc_italic ? 'italic' : 'normal',
  textTransform: ss.value.btn_doc_uppercase ? 'uppercase' as const : 'none' as const,
  borderRadius: ss.value.btn_doc_border_radius,
  letterSpacing: '0.05em',
}))

const tagStyle = computed(() => ({
  color: getTagColor(props.product.tagColorClass),
  fontFamily: ss.value.card_tag_font_family,
  fontSize: ss.value.card_tag_font_size,
  fontWeight: ss.value.card_tag_bold ? 'bold' : 'normal',
  fontStyle: ss.value.card_tag_italic ? 'italic' : 'normal',
}))

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
  } else if (!img.src.startsWith('data:image/svg+xml')) {
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af">Sem Imagem</text></svg>';
  }
}
</script>
