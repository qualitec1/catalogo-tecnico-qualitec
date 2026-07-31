import { computed } from 'vue'
import { useState } from '#app'

export type LanguageCode = 'pt' | 'en' | 'es'

export interface SegmentItem {
  key: string
  pt: string
  en: string
  es: string
}

export const segmentList: SegmentItem[] = [
  { key: 'Criôgenia', pt: 'Criôgenia', en: 'Cryogenics', es: 'Criogenia' },
  { key: 'Óleo & Gás', pt: 'Óleo & Gás', en: 'Oil & Gas', es: 'Petróleo & Gas' },
  { key: 'Gases Técnicos', pt: 'Gases Técnicos', en: 'Technical Gases', es: 'Gases Técnicos' },
  { key: 'Energia', pt: 'Energia', en: 'Energy', es: 'Energía' },
  { key: 'Açúcar & Álcool', pt: 'Açúcar & Álcool', en: 'Sugar & Ethanol', es: 'Azúcar & Alcohol' },
  { key: 'Alimentícia', pt: 'Alimentícia', en: 'Food Industry', es: 'Alimentaria' },
]

export const categoryDict: Record<string, { en: string; es: string }> = {
  'GERAL': { en: 'GENERAL', es: 'GENERAL' },
  'CATÁLOGO': { en: 'CATALOG', es: 'CATÁLOGO' },
  'VÁLVULAS': { en: 'VALVES', es: 'VÁLVULAS' },
  'TRANSMISSORES': { en: 'TRANSMITTERS', es: 'TRANSMISORES' },
  'MEDIDORES': { en: 'METERS', es: 'MEDIDORES' },
  'SISTEMAS': { en: 'SYSTEMS', es: 'SISTEMAS' },
  'EQUIPAMENTOS': { en: 'EQUIPMENT', es: 'EQUIPOS' },
  'VÁLVULAS 3 VIAS': { en: '3-WAY VALVES', es: 'VÁLVULAS 3 VÍAS' },
  '3-WAY VALVES': { en: '3-WAY VALVES', es: 'VÁLVULAS 3 VÍAS' },
  'VÁLVULAS GLOBO': { en: 'GLOBE VALVES', es: 'VÁLVULAS GLOBO' },
  'GLOBE VALVES': { en: 'GLOBE VALVES', es: 'VÁLVULAS GLOBO' },
  'VÁLVULAS DE SEGURANÇA': { en: 'SAFETY VALVES', es: 'VÁLVULAS DE SEGURIDAD' },
  'SAFETY VALVES': { en: 'SAFETY VALVES', es: 'VÁLVULAS DE SEGURIDAD' },
  'VÁLVULAS CRIOGÊNICAS': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'VÁLVULAS CRIOGENICAS': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'CRIOGENIA': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'CRYOGENIC VALVES': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'TRANSMISSORES DE PRESSÃO': { en: 'PRESSURE TRANSMITTERS', es: 'TRANSMISORES DE PRESIÓN' },
  'PRESSURE TRANSMITTERS': { en: 'PRESSURE TRANSMITTERS', es: 'TRANSMISORES DE PRESIÓN' }
}

export function translateCategoryName(catName: string, lang: string): string {
  if (!catName) return ''
  if (lang === 'pt') return catName
  
  const norm = catName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()

  for (const [key, trans] of Object.entries(categoryDict)) {
    const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()
    if (norm === normKey) {
      return trans[lang as 'en' | 'es'] || catName
    }
  }

  // Keyword fallbacks
  if (norm.includes('CRIOG')) return lang === 'en' ? 'CRYOGENIC VALVES' : 'VÁLVULAS CRIOGÉNICAS'
  if (norm.includes('3 VIAS') || norm.includes('3-WAY')) return lang === 'en' ? '3-WAY VALVES' : 'VÁLVULAS 3 VÍAS'
  if (norm.includes('GLOBO')) return lang === 'en' ? 'GLOBE VALVES' : 'VÁLVULAS GLOBO'
  if (norm.includes('SEGURANCA')) return lang === 'en' ? 'SAFETY VALVES' : 'VÁLVULAS DE SEGURIDAD'
  if (norm.includes('PRESSAO')) return lang === 'en' ? 'PRESSURE TRANSMITTERS' : 'TRANSMISORES DE PRESIÓN'
  if (norm === 'GERAL') return lang === 'en' ? 'GENERAL' : 'GENERAL'

  return catName
}

export const translations = {
  pt: {
    home: 'Home',
    about: 'Nossa Empresa',
    contact: 'Contato',
    searchPlaceholder: 'BUSCAR EQUIPAMENTO...',
    viewDocs: 'Ficha de Especificação',
    noDocs: 'Nenhuma documentação disponível',
    model: 'Modelo',
    noProducts: 'Nenhum equipamento encontrado',
    allCategories: 'TODAS',
  },
  en: {
    home: 'Home',
    about: 'Our Company',
    contact: 'Contact',
    searchPlaceholder: 'SEARCH EQUIPMENT...',
    viewDocs: 'SPECIFICATION SHEET',
    noDocs: 'No documentation available',
    model: 'Model',
    noProducts: 'No equipment found',
    allCategories: 'ALL',
  },
  es: {
    home: 'Inicio',
    about: 'Nuestra Empresa',
    contact: 'Contacto',
    searchPlaceholder: 'BUSCAR EQUIPO...',
    viewDocs: 'FICHA TÉCNICA',
    noDocs: 'Sin documentación disponible',
    model: 'Modelo',
    noProducts: 'No se encontraron equipos',
    allCategories: 'TODAS',
  }
}

export default function useTranslations() {
  const currentLang = useState<LanguageCode>('catalog-current-lang', () => 'pt')

  const t = computed(() => {
    return translations[currentLang.value] || translations.pt
  })

  const translatedSegments = computed(() => {
    return segmentList.map(seg => ({
      key: seg.key,
      label: seg[currentLang.value] || seg.pt
    }))
  })

  const translateCategory = (catName: string): string => {
    return translateCategoryName(catName, currentLang.value)
  }

  const setLanguage = (lang: LanguageCode) => {
    currentLang.value = lang
  }

  return {
    currentLang,
    t,
    translatedSegments,
    translateCategory,
    setLanguage,
  }
}
