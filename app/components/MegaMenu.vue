<template>
  <!-- Mega Menu Container: nav + dropdown are a single hover zone -->
  <div 
    ref="megaMenuContainer"
    class="mega-menu-root"
    @mouseenter="handleContainerEnter"
    @mouseleave="handleContainerLeave"
  >
    <!-- Category Navigation Bar -->
    <nav class="mega-menu-nav" :style="{ backgroundColor: siteSettings.mega_menu_bg_color || '#1d1d1f' }">
      <div class="mega-menu-nav-inner" :style="{ height: `${siteSettings.mega_menu_height || 44}px` }">
        <button
          v-for="item in menuTree"
          :key="item.category"
          class="mega-menu-tab"
          :style="{ height: `${siteSettings.mega_menu_height || 44}px` }"
          :class="{
            'mega-menu-tab--active': selectedCategory === item.category,
            'mega-menu-tab--hover': hoveredCategory === item.category
          }"
          @mouseenter="handleCategoryHover(item.category)"
          @click="handleCategoryClick(item.category)"
        >
          <span 
            class="mega-menu-tab-dot"
            :style="{ backgroundColor: item.color }"
          ></span>
          {{ translateCategory(item.category) }}
        </button>
      </div>
    </nav>

    <!-- Dropdown Panel (slides down) -->
    <Transition name="mega-dropdown">
      <div 
        v-show="isOpen && activeDropdownCategory"
        class="mega-menu-dropdown"
      >
        <div class="mega-menu-dropdown-inner">
          <!-- Cross-fade content for each category -->
          <TransitionGroup name="mega-crossfade" tag="div" class="mega-menu-content-wrapper">
            <div 
              v-for="item in menuTree"
              v-show="activeDropdownCategory === item.category"
              :key="item.category"
              class="mega-menu-content"
            >
              <!-- If category has families with subcategories -->
              <template v-if="item.families.length > 0">
                <div
                  v-for="(fam, famIdx) in item.families"
                  :key="fam.name"
                  class="mega-menu-family-col"
                >
                  <h4 
                    class="mega-menu-family-title"
                    :style="{
                      fontFamily: siteSettings.mega_menu_family_font_family || 'inherit',
                      fontSize: `${siteSettings.mega_menu_family_font_size || 12}px`,
                      color: siteSettings.mega_menu_family_color || '#6e6e73',
                      fontWeight: siteSettings.mega_menu_family_bold ? '700' : '400',
                      fontStyle: siteSettings.mega_menu_family_italic ? 'italic' : 'normal',
                      textTransform: siteSettings.mega_menu_family_uppercase ? 'uppercase' : 'none'
                    }"
                    @click="handleFamilyClick(item.category, fam.name)"
                  >
                    {{ fam.name }}
                  </h4>
                  <ul class="mega-menu-subcategory-list" v-if="fam.subcategories.length > 0">
                    <li 
                      v-for="(sub, subIdx) in fam.subcategories" 
                      :key="sub"
                      class="mega-menu-subcategory-item"
                      :style="{
                        fontFamily: siteSettings.mega_menu_sub_font_family || 'inherit',
                        fontSize: (subIdx === 0 && famIdx === 0) ? `${(siteSettings.mega_menu_sub_font_size || 13) + 7}px` : `${siteSettings.mega_menu_sub_font_size || 13}px`,
                        color: siteSettings.mega_menu_sub_color || '#1d1d1f',
                        fontWeight: siteSettings.mega_menu_sub_bold ? '600' : '400',
                        fontStyle: siteSettings.mega_menu_sub_italic ? 'italic' : 'normal',
                        textTransform: siteSettings.mega_menu_sub_uppercase ? 'uppercase' : 'none'
                      }"
                      @click="handleSubcategoryClick(item.category, fam.name, sub)"
                    >
                      {{ sub }}
                    </li>
                  </ul>
                </div>
              </template>

              <!-- If category has no families, show a simple "View All" -->
              <div v-else class="mega-menu-no-families">
                <p class="mega-menu-no-families-text" @click="handleCategoryClick(item.category)">
                  Ver todos os equipamentos de <strong>{{ translateCategory(item.category) }}</strong> &rarr;
                </p>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Overlay (separate from container so mouse events don't trigger) -->
  <Transition name="mega-overlay">
    <div 
      v-show="isOpen"
      class="mega-menu-overlay"
      @click="closeMenu"
    ></div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import useTranslations from '~/composables/useTranslations'

export interface MegaMenuItem {
  category: string
  color: string
  families: {
    name: string
    subcategories: string[]
  }[]
}

const props = defineProps<{
  menuTree: MegaMenuItem[]
  selectedCategory: string
  selectedFamily: string
  selectedSubcategory: string
}>()

const emit = defineEmits<{
  (e: 'select', payload: { category: string; family: string; subcategory: string }): void
}>()

const { translateCategory } = useTranslations()
const { siteSettings } = useSiteSettings()

const isOpen = ref(false)
const hoveredCategory = ref('')
const activeDropdownCategory = ref('')
const megaMenuContainer = ref<HTMLElement | null>(null)

let closeTimer: ReturnType<typeof setTimeout> | null = null
let openTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  if (openTimer) { clearTimeout(openTimer); openTimer = null }
}

const handleContainerEnter = () => {
  clearTimers()
}

const handleContainerLeave = () => {
  clearTimers()
  closeTimer = setTimeout(() => {
    isOpen.value = false
    hoveredCategory.value = ''
    activeDropdownCategory.value = ''
  }, 180)
}

const handleCategoryHover = (category: string) => {
  clearTimers()
  hoveredCategory.value = category
  
  openTimer = setTimeout(() => {
    activeDropdownCategory.value = category
    isOpen.value = true
  }, isOpen.value ? 0 : 120)
}

const closeMenu = () => {
  clearTimers()
  isOpen.value = false
  hoveredCategory.value = ''
  activeDropdownCategory.value = ''
}

const handleCategoryClick = (category: string) => {
  closeMenu()
  if (props.selectedCategory === category) {
    emit('select', { category: 'TODAS', family: '', subcategory: '' })
  } else {
    emit('select', { category, family: '', subcategory: '' })
  }
}

const handleFamilyClick = (category: string, family: string) => {
  closeMenu()
  emit('select', { category, family, subcategory: '' })
}

const handleSubcategoryClick = (category: string, family: string, subcategory: string) => {
  closeMenu()
  emit('select', { category, family, subcategory })
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu()
}

watch(isOpen, (val) => {
  if (val) {
    window.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* ===== NAV BAR ===== */
.mega-menu-root {
  position: relative;
  z-index: 100;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.mega-menu-nav {
  background: #1d1d1f;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.mega-menu-nav-inner {
  max-width: 2560px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  padding: 0 2rem;
  height: 44px;
}

.mega-menu-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 44px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: rgba(255,255,255,0.8);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
  white-space: nowrap;
  text-transform: uppercase;
}

.mega-menu-tab:hover,
.mega-menu-tab--hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.mega-menu-tab--active {
  color: #fff;
  background: rgba(255,255,255,0.12);
}

.mega-menu-tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ===== DROPDOWN ===== */
.mega-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 101;
  background: #ffffff;
  border-bottom: none;
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 78%, rgba(0, 0, 0, 0.7) 90%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 78%, rgba(0, 0, 0, 0.7) 90%, transparent 100%);
}

.mega-menu-dropdown-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 40px 44px;
  min-height: 140px;
}

.mega-menu-content-wrapper {
  position: relative;
}

.mega-menu-content {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}

/* ===== FAMILY COLUMNS ===== */
.mega-menu-family-col {
  min-width: 180px;
  max-width: 280px;
  flex: 1 1 180px;
}

.mega-menu-family-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6e6e73;
  letter-spacing: -0.01em;
  margin: 0 0 10px 0;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.mega-menu-family-title:hover {
  color: #1d1d1f;
}

.mega-menu-subcategory-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mega-menu-subcategory-item {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
  padding: 4px 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.mega-menu-subcategory-item--large {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.015em;
  margin-bottom: 6px;
  line-height: 1.2;
}

.mega-menu-subcategory-item:hover {
  opacity: 0.65;
}

/* ===== NO FAMILIES STATE ===== */
.mega-menu-no-families {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 60px;
}

.mega-menu-no-families-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.mega-menu-no-families-text:hover {
  opacity: 0.7;
}

/* ===== OVERLAY (FUNDO FOSCO BLUR ESTILO APPLE) ===== */
.mega-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

/* ===== ANIMATIONS ===== */

/* Dropdown slide down */
.mega-dropdown-enter-active {
  transition: opacity 0.22s ease-out, transform 0.22s ease-out;
}
.mega-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.mega-dropdown-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.mega-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Overlay fade */
.mega-overlay-enter-active {
  transition: opacity 0.22s ease-out;
}
.mega-overlay-enter-from {
  opacity: 0;
}
.mega-overlay-leave-active {
  transition: opacity 0.15s ease-in;
}
.mega-overlay-leave-to {
  opacity: 0;
}

/* Cross-fade between category contents */
.mega-crossfade-enter-active {
  transition: opacity 0.18s ease-out;
}
.mega-crossfade-enter-from {
  opacity: 0;
}
.mega-crossfade-leave-active {
  transition: opacity 0.1s ease-in;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.mega-crossfade-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .mega-menu-nav-inner {
    overflow-x: auto;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
    padding: 0 12px;
  }

  .mega-menu-nav-inner::-webkit-scrollbar {
    display: none;
  }

  .mega-menu-tab {
    padding: 0 14px;
    font-size: 11px;
  }

  .mega-menu-dropdown-inner {
    padding: 24px 20px 32px;
  }

  .mega-menu-content {
    flex-direction: column;
    gap: 24px;
  }

  .mega-menu-family-col {
    max-width: 100%;
    min-width: auto;
  }
}
</style>
