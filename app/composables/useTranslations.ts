import { computed } from 'vue'
import { useState } from '#app'

export type LanguageCode = 'pt' | 'en' | 'de'

export interface SegmentItem {
  key: string
  pt: string
  en: string
  de: string
}

export const segmentList: SegmentItem[] = [
  { key: 'Criôgenia', pt: 'Criôgenia', en: 'Cryogenics', de: 'Kryotechnik' },
  { key: 'Óleo & Gás', pt: 'Óleo & Gás', en: 'Oil & Gas', de: 'Öl & Gas' },
  { key: 'Gases Técnicos', pt: 'Gases Técnicos', en: 'Technical Gases', de: 'Technische Gase' },
  { key: 'Energia', pt: 'Energia', en: 'Energy', de: 'Energie' },
  { key: 'Açúcar & Álcool', pt: 'Açúcar & Álcool', en: 'Sugar & Ethanol', de: 'Zucker & Alkohol' },
  { key: 'Alimentícia', pt: 'Alimentícia', en: 'Food Industry', de: 'Lebensmittel' },
]

export const categoryDict: Record<string, { en: string; de: string }> = {
  'VÁLVULAS': { en: 'VALVES', de: 'VENTILE' },
  'TRANSMISSORES': { en: 'TRANSMITTERS', de: 'SENDER' },
  'MEDIDORES': { en: 'METERS', de: 'MESSGERÄTE' },
  'SISTEMAS': { en: 'SYSTEMS', de: 'SYSTEME' },
  'EQUIPAMENTOS': { en: 'EQUIPMENT', de: 'GERÄTE' },
  'VÁLVULAS 3 VIAS': { en: '3-WAY VALVES', de: '3-WEGE-VENTILE' },
  'VÁLVULAS GLOBO': { en: 'GLOBE VALVES', de: 'GLOBE-VENTILE' },
  'VÁLVULAS DE SEGURANÇA': { en: 'SAFETY VALVES', de: 'SICHERHEITSVENTILE' },
  'VÁLVULAS CRIOGÊNICAS': { en: 'CRYOGENIC VALVES', de: 'KRYO-VENTILE' },
  'TRANSMISSORES DE PRESSÃO': { en: 'PRESSURE TRANSMITTERS', de: 'DRUCKMESSUMFORMER' }
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
  de: {
    home: 'Home',
    about: 'Unser Unternehmen',
    contact: 'Kontakt',
    searchPlaceholder: 'GERÄTE SUCHEN...',
    viewDocs: 'DATENBLATT',
    noDocs: 'Keine Dokumentation verfügbar',
    model: 'Modell',
    noProducts: 'Keine Geräte gefunden',
    allCategories: 'ALLE',
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
    if (!catName) return ''
    if (currentLang.value === 'pt') return catName
    const upper = catName.toUpperCase().trim()
    const found = categoryDict[upper]
    if (found && found[currentLang.value]) {
      return found[currentLang.value]
    }
    return catName
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
