import { ref, computed } from 'vue'
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
  'VÁLVULAS 3 VIAS': { en: 'DIVERTER VALVES', es: 'VÁLVULAS 3 VÍAS' },
  '3-WAY VALVES': { en: 'DIVERTER VALVES', es: 'VÁLVULAS 3 VÍAS' },
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

  if (norm.includes('CRIOG')) return lang === 'en' ? 'CRYOGENIC VALVES' : 'VÁLVULAS CRIOGÉNICAS'
  if (norm.includes('3 VIAS') || norm.includes('3-WAY') || norm.includes('DIVERTER')) return lang === 'en' ? 'DIVERTER VALVES' : 'VÁLVULAS 3 VÍAS'
  if (norm.includes('GLOBO')) return lang === 'en' ? 'GLOBE VALVES' : 'VÁLVULAS GLOBO'
  if (norm.includes('SEGURANCA')) return lang === 'en' ? 'SAFETY VALVES' : 'VÁLVULAS DE SEGURIDAD'
  if (norm.includes('PRESSAO')) return lang === 'en' ? 'PRESSURE TRANSMITTERS' : 'TRANSMISORES DE PRESIÓN'
  if (norm === 'GERAL') return lang === 'en' ? 'GENERAL' : 'GENERAL'

  return catName
}

// ─── Default translations (fallback) ────────────────────────────────────────
export type TranslationKey =
  | 'nav.home' | 'nav.about' | 'nav.catalog' | 'nav.contact'
  | 'seg.criogenia' | 'seg.oleo_gas' | 'seg.gases_tecnicos' | 'seg.energia' | 'seg.acucar_alcool' | 'seg.alimenticia'
  | 'catalog.search_placeholder' | 'catalog.view_docs' | 'catalog.no_docs' | 'catalog.model' | 'catalog.no_products' | 'catalog.all_categories'
  | 'footer.rights' | 'footer.contact_btn' | 'footer.exclusive_rep' | 'footer.view_catalog'
  | 'home.hero_text' | 'home.hero_cta'
  | 'home.search_title' | 'home.search_subtitle' | 'home.search_quick_title'
  | 'home.search_quick_1' | 'home.search_quick_2' | 'home.search_quick_3' | 'home.search_quick_4'
  | 'home.news_title' | 'home.news_item1_title' | 'home.news_item2_title' | 'home.news_item3_title'
  | 'home.newsletter_title' | 'home.newsletter_label' | 'home.newsletter_button'

export type TranslationsMap = Record<TranslationKey, string>

export const defaultTranslations: Record<LanguageCode, TranslationsMap> = {
  pt: {
    'nav.home': 'Home',
    'nav.about': 'Nossa Empresa',
    'nav.catalog': 'Catálogo',
    'nav.contact': 'Contato',
    'seg.criogenia': 'Criôgenia',
    'seg.oleo_gas': 'Óleo & Gás',
    'seg.gases_tecnicos': 'Gases Técnicos',
    'seg.energia': 'Energia',
    'seg.acucar_alcool': 'Açúcar & Álcool',
    'seg.alimenticia': 'Alimentícia',
    'catalog.search_placeholder': 'BUSCAR EQUIPAMENTO...',
    'catalog.view_docs': 'Ficha de Especificação',
    'catalog.no_docs': 'Nenhuma documentação disponível',
    'catalog.model': 'Modelo',
    'catalog.no_products': 'Nenhum equipamento encontrado',
    'catalog.all_categories': 'TODAS',
    'footer.rights': 'Todos os direitos reservados',
    'footer.contact_btn': 'Como posso lhe ajudar?',
    'footer.exclusive_rep': 'Representante Exclusivo',
    'footer.view_catalog': 'Ver Catálogo',
    'home.hero_text': 'Soluções em instrumentação industrial',
    'home.hero_cta': 'Ver Catálogo Completo',
    'home.search_title': 'Como podemos te ajudar?',
    'home.search_subtitle': 'Utilize a busca rápida e encontre sua necessidade',
    'home.search_quick_title': 'Buscas mais utilizadas',
    'home.search_quick_1': 'Contato de vendas / suporte',
    'home.search_quick_2': 'Válvulas de Segurança',
    'home.search_quick_3': 'Reparos HEROSE',
    'home.search_quick_4': 'Transmissores de Pressão',
    'home.news_title': 'Novidades',
    'home.news_item1_title': 'Novo Catálogo',
    'home.news_item2_title': 'Transmissor de nível flangeado',
    'home.news_item3_title': 'Regulador Pressão CO2',
    'home.newsletter_title': 'Cadastre-se para receber nossa newsletter.',
    'home.newsletter_label': 'Digite seu email aqui *',
    'home.newsletter_button': 'Inscrever',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'Our Company',
    'nav.catalog': 'Catalog',
    'nav.contact': 'Contact',
    'seg.criogenia': 'Cryogenics',
    'seg.oleo_gas': 'Oil & Gas',
    'seg.gases_tecnicos': 'Technical Gases',
    'seg.energia': 'Energy',
    'seg.acucar_alcool': 'Sugar & Ethanol',
    'seg.alimenticia': 'Food Industry',
    'catalog.search_placeholder': 'SEARCH EQUIPMENT...',
    'catalog.view_docs': 'Specification Sheet',
    'catalog.no_docs': 'No documentation available',
    'catalog.model': 'Model',
    'catalog.no_products': 'No equipment found',
    'catalog.all_categories': 'ALL',
    'footer.rights': 'All rights reserved',
    'footer.contact_btn': 'How can I help you?',
    'footer.exclusive_rep': 'Exclusive Representative',
    'footer.view_catalog': 'View Catalog',
    'home.hero_text': 'Industrial instrumentation solutions',
    'home.hero_cta': 'Browse Full Catalog',
    'home.search_title': 'How can we help you?',
    'home.search_subtitle': 'Use quick search to find what you need',
    'home.search_quick_title': 'Most popular searches',
    'home.search_quick_1': 'Sales & support contact',
    'home.search_quick_2': 'Safety Valves',
    'home.search_quick_3': 'HEROSE Spare Parts',
    'home.search_quick_4': 'Pressure Transmitters',
    'home.news_title': "What's New",
    'home.news_item1_title': 'New Catalog',
    'home.news_item2_title': 'Flanged level transmitter',
    'home.news_item3_title': 'CO2 Pressure Regulator',
    'home.newsletter_title': 'Subscribe to receive our newsletter.',
    'home.newsletter_label': 'Enter your email here *',
    'home.newsletter_button': 'Subscribe',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Nuestra Empresa',
    'nav.catalog': 'Catálogo',
    'nav.contact': 'Contacto',
    'seg.criogenia': 'Criogenia',
    'seg.oleo_gas': 'Petróleo & Gas',
    'seg.gases_tecnicos': 'Gases Técnicos',
    'seg.energia': 'Energía',
    'seg.acucar_alcool': 'Azúcar & Alcohol',
    'seg.alimenticia': 'Alimentaria',
    'catalog.search_placeholder': 'BUSCAR EQUIPO...',
    'catalog.view_docs': 'Ficha Técnica',
    'catalog.no_docs': 'Sin documentación disponible',
    'catalog.model': 'Modelo',
    'catalog.no_products': 'No se encontraron equipos',
    'catalog.all_categories': 'TODAS',
    'footer.rights': 'Todos los derechos reservados',
    'footer.contact_btn': '¿Cómo puedo ayudarle?',
    'footer.exclusive_rep': 'Representante Exclusivo',
    'footer.view_catalog': 'Ver Catálogo',
    'home.hero_text': 'Soluciones en instrumentación industrial',
    'home.hero_cta': 'Ver Catálogo Completo',
    'home.search_title': '¿Cómo podemos ayudarle?',
    'home.search_subtitle': 'Utilice la búsqueda rápida para encontrar su necesidad',
    'home.search_quick_title': 'Búsquedas más frecuentes',
    'home.search_quick_1': 'Contacto de ventas / soporte',
    'home.search_quick_2': 'Válvulas de Seguridad',
    'home.search_quick_3': 'Repuestos HEROSE',
    'home.search_quick_4': 'Transmisores de Presión',
    'home.news_title': 'Novedades',
    'home.news_item1_title': 'Nuevo Catálogo',
    'home.news_item2_title': 'Transmisor de nivel bridado',
    'home.news_item3_title': 'Regulador de Presión CO2',
    'home.newsletter_title': 'Regístrese para recibir nuestro boletín.',
    'home.newsletter_label': 'Ingrese su correo electrónico aquí *',
    'home.newsletter_button': 'Suscribirse',
  },
}

// ─── Legacy shape (kept for backward compat) ─────────────────────────────────
export const translations = {
  pt: {
    home: defaultTranslations.pt['nav.home'],
    about: defaultTranslations.pt['nav.about'],
    contact: defaultTranslations.pt['nav.contact'],
    searchPlaceholder: defaultTranslations.pt['catalog.search_placeholder'],
    viewDocs: defaultTranslations.pt['catalog.view_docs'],
    noDocs: defaultTranslations.pt['catalog.no_docs'],
    model: defaultTranslations.pt['catalog.model'],
    noProducts: defaultTranslations.pt['catalog.no_products'],
    allCategories: defaultTranslations.pt['catalog.all_categories'],
  },
  en: {
    home: defaultTranslations.en['nav.home'],
    about: defaultTranslations.en['nav.about'],
    contact: defaultTranslations.en['nav.contact'],
    searchPlaceholder: defaultTranslations.en['catalog.search_placeholder'],
    viewDocs: defaultTranslations.en['catalog.view_docs'],
    noDocs: defaultTranslations.en['catalog.no_docs'],
    model: defaultTranslations.en['catalog.model'],
    noProducts: defaultTranslations.en['catalog.no_products'],
    allCategories: defaultTranslations.en['catalog.all_categories'],
  },
  es: {
    home: defaultTranslations.es['nav.home'],
    about: defaultTranslations.es['nav.about'],
    contact: defaultTranslations.es['nav.contact'],
    searchPlaceholder: defaultTranslations.es['catalog.search_placeholder'],
    viewDocs: defaultTranslations.es['catalog.view_docs'],
    noDocs: defaultTranslations.es['catalog.no_docs'],
    model: defaultTranslations.es['catalog.model'],
    noProducts: defaultTranslations.es['catalog.no_products'],
    allCategories: defaultTranslations.es['catalog.all_categories'],
  },
}

// ─── DB-backed overrides (global state shared across composable instances) ───
const dbOverrides = ref<Record<LanguageCode, Partial<TranslationsMap>>>({
  pt: {}, en: {}, es: {},
})
const overridesLoaded = ref(false)

export function useTranslationsAdmin() {
  const supabase = useSupabaseClient()

  /** Load all rows from site_translations into dbOverrides */
  async function fetchTranslationsFromDB() {
    try {
      const { data, error } = await supabase
        .from('site_translations')
        .select('lang_code, key, value')
      if (error) throw error
      if (data) {
        const newOverrides: Record<LanguageCode, Partial<TranslationsMap>> = { pt: {}, en: {}, es: {} }
        for (const row of data) {
          const lang = row.lang_code as LanguageCode
          if (newOverrides[lang]) {
            newOverrides[lang][row.key as TranslationKey] = row.value
          }
        }
        dbOverrides.value = newOverrides
      }
    } catch (e) {
      // Table might not exist yet — silently fall back to defaults
      console.warn('[useTranslations] site_translations table not available, using defaults.')
    } finally {
      overridesLoaded.value = true
    }
  }

  /** Upsert a batch of key/value pairs for a given language */
  async function saveTranslationsToDb(lang: LanguageCode, entries: { key: string; value: string; section: string }[]) {
    const rows = entries.map(e => ({
      lang_code: lang,
      key: e.key,
      value: e.value,
      section: e.section,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('site_translations')
      .upsert(rows, { onConflict: 'lang_code,key' })
    if (error) throw error
    // Update local cache
    entries.forEach(e => {
      dbOverrides.value[lang][e.key as TranslationKey] = e.value
    })
  }

  return { fetchTranslationsFromDB, saveTranslationsToDb, dbOverrides }
}

// ─── Main composable ─────────────────────────────────────────────────────────
export default function useTranslations() {
  const currentLang = useState<LanguageCode>('catalog-current-lang', () => 'pt')

  /** Merged: defaults + DB overrides */
  const mergedTranslations = computed(() => {
    const lang = currentLang.value
    return { ...defaultTranslations[lang], ...dbOverrides.value[lang] } as TranslationsMap
  })

  /** Legacy-compatible shape (used by pages that destructure { t }) */
  const t = computed(() => {
    const m = mergedTranslations.value
    const lang = currentLang.value
    return {
      home: m['nav.home'] || translations[lang]?.home,
      about: m['nav.about'] || translations[lang]?.about,
      contact: m['nav.contact'] || translations[lang]?.contact,
      searchPlaceholder: m['catalog.search_placeholder'] || translations[lang]?.searchPlaceholder,
      viewDocs: m['catalog.view_docs'] || translations[lang]?.viewDocs,
      noDocs: m['catalog.no_docs'] || translations[lang]?.noDocs,
      model: m['catalog.model'] || translations[lang]?.model,
      noProducts: m['catalog.no_products'] || translations[lang]?.noProducts,
      allCategories: m['catalog.all_categories'] || translations[lang]?.allCategories,
    }
  })

  /** Segment list merged with DB overrides */
  const translatedSegments = computed(() => {
    const lang = currentLang.value
    const ov = dbOverrides.value[lang]
    return segmentList.map(seg => {
      const segKey = {
        'Criôgenia': 'seg.criogenia',
        'Óleo & Gás': 'seg.oleo_gas',
        'Gases Técnicos': 'seg.gases_tecnicos',
        'Energia': 'seg.energia',
        'Açúcar & Álcool': 'seg.acucar_alcool',
        'Alimentícia': 'seg.alimenticia',
      }[seg.key] as TranslationKey | undefined

      const overriddenLabel = segKey ? ov[segKey] : undefined
      return {
        key: seg.key,
        label: overriddenLabel || seg[lang] || seg.pt,
      }
    })
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
    mergedTranslations,
    translatedSegments,
    translateCategory,
    setLanguage,
  }
}
