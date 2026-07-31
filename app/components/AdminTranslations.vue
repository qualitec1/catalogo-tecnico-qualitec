<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">translate</span>
            Gerenciador de Traduções
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            Edite todos os textos e frases do site para cada idioma. As alterações são aplicadas imediatamente após salvar.
          </p>
        </div>

        <!-- Language Selector -->
        <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <button
            v-for="lang in langs"
            :key="lang.code"
            @click="activeLang = lang.code"
            class="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all border-0 cursor-pointer"
            :class="activeLang === lang.code
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white bg-transparent'"
          >
            <span v-html="lang.flag" class="text-base leading-none"></span>
            {{ lang.label }}
          </button>
        </div>
      </div>

      <!-- Save bar -->
      <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p class="text-xs text-slate-500">
          <span v-if="dirtyCount > 0" class="text-amber-600 font-semibold">
            ⚠ {{ dirtyCount }} campo(s) modificado(s) não salvo(s)
          </span>
          <span v-else class="text-emerald-600 font-semibold">✓ Tudo salvo</span>
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="resetDirty"
            :disabled="dirtyCount === 0 || saving"
            class="px-4 py-2 text-xs font-semibold rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer border-solid"
          >
            Descartar alterações
          </button>
          <button
            @click="saveAll"
            :disabled="dirtyCount === 0 || saving"
            class="px-5 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 disabled:opacity-40 cursor-pointer border-0"
          >
            <span v-if="saving" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-base">save</span>
            Salvar Tudo ({{ activeLang.toUpperCase() }})
          </button>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div v-for="section in sections" :key="section.key" class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <!-- Section Header -->
      <button
        @click="toggleSection(section.key)"
        class="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors border-0 cursor-pointer text-left"
      >
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-blue-600 text-xl">{{ section.icon }}</span>
          <div>
            <h3 class="text-sm font-bold text-slate-800">{{ section.label }}</h3>
            <p class="text-xs text-slate-400">{{ section.description }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="sectionDirtyCount(section.key) > 0" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {{ sectionDirtyCount(section.key) }} alterado(s)
          </span>
          <span class="material-symbols-outlined text-slate-400 text-lg transition-transform" :class="openSections.has(section.key) ? 'rotate-180' : ''">
            expand_more
          </span>
        </div>
      </button>

      <!-- Fields -->
      <div v-show="openSections.has(section.key)" class="divide-y divide-slate-100">
        <div
          v-for="field in section.fields"
          :key="field.key"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4 items-start transition-colors"
          :class="isDirty(field.key) ? 'bg-amber-50' : 'hover:bg-slate-50'"
        >
          <!-- Label / Description -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-slate-700">{{ field.label }}</span>
            <code class="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">{{ field.key }}</code>
            <p v-if="field.hint" class="text-[11px] text-slate-500 leading-tight">{{ field.hint }}</p>
            <p class="text-[11px] text-slate-400">
              Padrão: <em>{{ defaultTranslations[activeLang]?.[field.key] || '—' }}</em>
            </p>
          </div>

          <!-- Input -->
          <div class="relative">
            <textarea
              v-if="field.multiline"
              v-model="edits[field.key]"
              rows="3"
              class="w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-colors"
              :class="isDirty(field.key) ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'"
              :placeholder="defaultTranslations[activeLang]?.[field.key] || field.label"
            ></textarea>
            <input
              v-else
              v-model="edits[field.key]"
              type="text"
              class="w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              :class="isDirty(field.key) ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'"
              :placeholder="defaultTranslations[activeLang]?.[field.key] || field.label"
            />
            <button
              v-if="isDirty(field.key)"
              @click="resetField(field.key)"
              class="absolute top-2 right-2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-0.5"
              title="Restaurar padrão"
            >
              <span class="material-symbols-outlined text-base">restart_alt</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info card -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
      <p class="font-semibold flex items-center gap-1.5 mb-1">
        <span class="material-symbols-outlined text-base">info</span>
        Como funciona
      </p>
      <ul class="list-disc list-inside space-y-1 text-blue-600">
        <li>Selecione o idioma (PT/EN/ES) e edite os campos desejados.</li>
        <li>Campos em branco usam automaticamente o texto padrão do sistema.</li>
        <li>Clique em <strong>Salvar Tudo</strong> para persistir as alterações no banco de dados.</li>
        <li>As alterações refletem imediatamente nas páginas públicas após recarregar.</li>
        <li>Use o botão <strong>↺</strong> ao lado do campo para restaurar o valor padrão.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { defaultTranslations, useTranslationsAdmin, type LanguageCode, type TranslationKey } from '../composables/useTranslations'

const props = defineProps<{
  triggerToast: (msg: string, type: 'success' | 'error') => void
}>()

const { fetchTranslationsFromDB, saveTranslationsToDb, dbOverrides } = useTranslationsAdmin()

// ─── Language tabs ────────────────────────────────────────────────────────────
const activeLang = ref<LanguageCode>('pt')
const langs = [
  { code: 'pt' as LanguageCode, label: 'Português', flag: '🇧🇷' },
  { code: 'en' as LanguageCode, label: 'English',   flag: '🇬🇧' },
  { code: 'es' as LanguageCode, label: 'Español',   flag: '🇪🇸' },
]

// ─── Section definitions ──────────────────────────────────────────────────────
interface FieldDef { key: TranslationKey; label: string; hint?: string; multiline?: boolean }
interface SectionDef { key: string; label: string; icon: string; description: string; fields: FieldDef[] }

const sections: SectionDef[] = [
  {
    key: 'nav',
    label: 'Navegação',
    icon: 'menu',
    description: 'Links do menu principal (Home, Nossa Empresa, Catálogo, Contato)',
    fields: [
      { key: 'nav.home',    label: 'Home / Início' },
      { key: 'nav.about',   label: 'Nossa Empresa / About' },
      { key: 'nav.catalog', label: 'Catálogo / Catalog' },
      { key: 'nav.contact', label: 'Contato / Contact' },
    ]
  },
  {
    key: 'segments',
    label: 'Segmentos de Mercado',
    icon: 'factory',
    description: 'Nomes dos 6 segmentos exibidos no header e filtros do catálogo',
    fields: [
      { key: 'seg.criogenia',      label: 'Criôgenia' },
      { key: 'seg.oleo_gas',       label: 'Óleo & Gás' },
      { key: 'seg.gases_tecnicos', label: 'Gases Técnicos' },
      { key: 'seg.energia',        label: 'Energia' },
      { key: 'seg.acucar_alcool',  label: 'Açúcar & Álcool' },
      { key: 'seg.alimenticia',    label: 'Alimentícia' },
    ]
  },
  {
    key: 'catalog',
    label: 'Página do Catálogo',
    icon: 'auto_stories',
    description: 'Textos de busca, botões e mensagens da página de produtos',
    fields: [
      { key: 'catalog.search_placeholder', label: 'Placeholder de busca',        hint: 'Texto exibido no campo de pesquisa de equipamentos' },
      { key: 'catalog.all_categories',     label: 'Botão "Todas" categorias',    hint: 'Label do botão que exibe todos os produtos' },
      { key: 'catalog.view_docs',          label: 'Botão "Ver Documentação"',    hint: 'Botão no card do produto para abrir PDF/datasheet' },
      { key: 'catalog.no_docs',            label: 'Sem documentação disponível', hint: 'Texto quando o produto não tem datasheet' },
      { key: 'catalog.model',              label: 'Rótulo "Modelo"',             hint: 'Label do campo de modelo no card' },
      { key: 'catalog.no_products',        label: 'Nenhum produto encontrado',   hint: 'Mensagem quando a busca não retorna resultados' },
    ]
  },
  {
    key: 'footer',
    label: 'Rodapé & Botões Flutuantes',
    icon: 'bottom_navigation',
    description: 'Textos do rodapé e do botão flutuante de contato',
    fields: [
      { key: 'footer.rights',       label: 'Direitos reservados',        hint: 'Ex: "Todos os direitos reservados - 2024"' },
      { key: 'footer.contact_btn',  label: 'Botão flutuante de contato', hint: 'Texto do botão azul no canto inferior direito' },
      { key: 'footer.exclusive_rep', label: 'Representante Exclusivo',   hint: 'Título da coluna de parceiros no rodapé' },
      { key: 'footer.view_catalog',  label: 'Link "Ver Catálogo"',       hint: 'Link do header admin / rodapé' },
    ]
  },
  {
    key: 'home',
    label: 'Página Home (Hero)',
    icon: 'home',
    description: 'Textos da seção principal da página inicial',
    fields: [
      { key: 'home.hero_text', label: 'Frase destaque do Hero', multiline: true, hint: 'Texto principal exibido sobre o banner de fundo' },
      { key: 'home.hero_cta',  label: 'Botão de call-to-action do Hero', hint: 'Ex: "Ver Catálogo Completo"' },
    ]
  },
]

// ─── Edit state ───────────────────────────────────────────────────────────────
const edits = ref<Record<string, string>>({})
const savedSnapshot = ref<Record<string, string>>({})
const saving = ref(false)
const openSections = ref<Set<string>>(new Set(['nav', 'segments']))

/** Load DB overrides into edits when lang changes */
function loadEditsForLang(lang: LanguageCode) {
  const ov = dbOverrides.value[lang] || {}
  const e: Record<string, string> = {}
  sections.forEach(s => s.fields.forEach(f => {
    e[f.key] = ov[f.key as TranslationKey] ?? ''
  }))
  edits.value = e
  savedSnapshot.value = { ...e }
}

watch(activeLang, (lang) => loadEditsForLang(lang))
watch(dbOverrides, () => loadEditsForLang(activeLang.value), { deep: true })

// ─── Dirty tracking ───────────────────────────────────────────────────────────
function isDirty(key: string) {
  return edits.value[key] !== savedSnapshot.value[key]
}

const dirtyCount = computed(() =>
  Object.keys(edits.value).filter(k => isDirty(k)).length
)

function sectionDirtyCount(sectionKey: string) {
  const sec = sections.find(s => s.key === sectionKey)
  if (!sec) return 0
  return sec.fields.filter(f => isDirty(f.key)).length
}

function resetField(key: string) {
  edits.value[key] = savedSnapshot.value[key] ?? ''
}

function resetDirty() {
  edits.value = { ...savedSnapshot.value }
}

// ─── Save ─────────────────────────────────────────────────────────────────────
async function saveAll() {
  saving.value = true
  try {
    const entries: { key: string; value: string; section: string }[] = []
    sections.forEach(sec => {
      sec.fields.forEach(f => {
        // Only save non-empty values (empty = use default)
        if (edits.value[f.key] !== undefined && edits.value[f.key] !== '') {
          entries.push({ key: f.key, value: edits.value[f.key], section: sec.key })
        }
      })
    })
    await saveTranslationsToDb(activeLang.value, entries)
    savedSnapshot.value = { ...edits.value }
    props.triggerToast(`✅ Traduções (${activeLang.value.toUpperCase()}) salvas com sucesso!`, 'success')
  } catch (err: any) {
    console.error(err)
    props.triggerToast(`Erro ao salvar: ${err.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// ─── Sections toggle ─────────────────────────────────────────────────────────
function toggleSection(key: string) {
  if (openSections.value.has(key)) {
    openSections.value.delete(key)
  } else {
    openSections.value.add(key)
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchTranslationsFromDB()
  loadEditsForLang(activeLang.value)
})
</script>
