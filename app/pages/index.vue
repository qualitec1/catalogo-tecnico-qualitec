<template>
  <div class="bg-[#fdf8f8] text-[#1c1b1b] font-['Work_Sans',sans-serif] antialiased selection:bg-[#004A96] selection:text-white min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full top-0 sticky z-50 shadow-sm select-none">
      <!-- Linha superior: Logo + Nav -->
      <div class="bg-white border-b border-gray-100">
        <div class="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1280px] mx-auto">
          <!-- Logo -->
          <div class="flex items-center h-full overflow-visible">
            <NuxtLink to="/" class="flex items-center h-full overflow-visible">
              <img
                alt="Qualitec Logo"
                class="w-auto object-contain pointer-events-none transition-transform duration-150 select-none"
                :src="siteSettings.header_logo_url || 'https://lh3.googleusercontent.com/aida/AP1WRLvb_lGcigKW6su6LN_Xd0Bf0AXsewLIulAi0GxcP_qLjBKDQwKkr4TLJgHAmnOXZ_CnTBIs1fPQUk9wsPoaEnw1KIo3G_pm2AD72CQGZpdCmL0me0d5Nw3sO0Jq1oNeH0TPtE84vraycYx20zMTmWG9t98pFKFcZH8ovF5vpsN6YK6J2ZqjcN6pDWW8byB81uqO2z6Crk115D73Mm9qXI78ObCCnUJ9BmIfEJoVkKB3TB8-KPNPPQ8kG9Y'"
                :style="{
                  height: `${siteSettings.header_logo_height || 48}px`,
                  transform: `translate(${siteSettings.header_logo_offset_x || 0}px, ${siteSettings.header_logo_offset_y || 0}px)`
                }"
              />
            </NuxtLink>
          </div>

          <!-- Nav links & Language Flags -->
          <nav class="hidden md:flex items-center space-x-8" style="margin-right: 60px;">
            <NuxtLink to="/" class="text-sm font-normal text-blue-700 font-bold transition-colors">{{ t.home }}</NuxtLink>
            <NuxtLink to="/catalogo" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.catalog }}</NuxtLink>
            <NuxtLink to="/#sobre" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.about }}</NuxtLink>
            <a href="#contato" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.contact }}</a>

            <!-- Flags Selector -->
            <div class="flex items-center gap-2 border-l border-gray-200 pl-6 ml-2">
              <button 
                @click="currentLang = 'pt'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'pt' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="Português (Brasil)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 720 504">
                  <rect width="720" height="504" fill="#009c3b"/>
                  <polygon points="360,42 678,252 360,462 42,252" fill="#ffdf00"/>
                  <circle cx="360" cy="252" r="126" fill="#002776"/>
                  <path d="M 235,260 A 136,136 0 0,1 485,244" fill="none" stroke="#ffffff" stroke-width="12"/>
                </svg>
              </button>

              <button 
                @click="currentLang = 'en'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'en' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="English (United Kingdom)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 60 30">
                  <clipPath id="uk-clip-index"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                  <clipPath id="uk-diag-index"><path d="M30,15 h30 v15 z M30,15 h-30 v-15 z M30,15 h30 v-15 z M30,15 h-30 v15 z"/></clipPath>
                  <g clip-path="url(#uk-clip-index)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-diag-index)" stroke="#C8102E" stroke-width="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
                  </g>
                </svg>
              </button>

              <button 
                @click="currentLang = 'es'" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'es' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="Español (España)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 750 500">
                  <rect width="750" height="500" fill="#c60b1e"/>
                  <rect width="750" height="250" y="125" fill="#ffc400"/>
                </svg>
              </button>
            </div>
          </nav>

          <!-- Mobile toggle -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-gray-700 p-2">
            <span class="material-symbols-outlined text-2xl">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>


      <!-- SETORES: barra removida da home — dados preservados para página dedicada futura -->
      <!-- v-for="seg in translatedSegments" :to="`/catalogo?segment=${seg.key}`" -->

      <!-- Mega Menu (mesmos botoes de categoria do Catalogo) -->
      <MegaMenu
        :menu-tree="megaMenuTree"
        :selected-category="homeMegaCategory"
        :selected-family="''"
        :selected-subcategory="''"
        @select="handleHomeMegaMenuSelect"
      />

      <!-- Barra branca fina -->
      <div class="bg-white h-3 w-full border-b border-gray-200"></div>

      <!-- Mobile drawer -->
      <div v-if="mobileMenuOpen" class="bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
        <NuxtLink to="/" class="text-sm font-bold text-blue-700" @click="mobileMenuOpen = false">{{ t.home }}</NuxtLink>
        <NuxtLink to="/catalogo" class="text-sm font-semibold text-gray-600" @click="mobileMenuOpen = false">{{ t.catalog }}</NuxtLink>
        <NuxtLink to="/#sobre" class="text-sm font-semibold text-gray-600" @click="mobileMenuOpen = false">{{ t.about }}</NuxtLink>
        <a href="#contato" @click="mobileMenuOpen = false" class="text-sm font-semibold text-gray-600">{{ t.contact }}</a>
        <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button @click="currentLang = 'pt'" class="px-2 py-1 text-xs rounded border" :class="currentLang === 'pt' ? 'bg-blue-50 border-blue-500 font-bold' : 'border-gray-200'">🇧🇷 PT</button>
          <button @click="currentLang = 'en'" class="px-2 py-1 text-xs rounded border" :class="currentLang === 'en' ? 'bg-blue-50 border-blue-500 font-bold' : 'border-gray-200'">🇬🇧 EN</button>
          <button @click="currentLang = 'es'" class="px-2 py-1 text-xs rounded border" :class="currentLang === 'es' ? 'bg-blue-50 border-blue-500 font-bold' : 'border-gray-200'">🇪🇸 ES</button>
        </div>
        <hr class="border-gray-200 my-1">
        <NuxtLink
          v-for="seg in translatedSegments"
          :key="seg.key"
          :to="`/catalogo?segmento=${encodeURIComponent(seg.key)}`"
          class="text-sm font-semibold text-gray-500"
          @click="mobileMenuOpen = false"
        >{{ seg.label }}</NuxtLink>
      </div>
    </header>

    <main class="flex-grow">
      <!-- Hero Section -->
      <section class="relative w-full h-[520px] md:h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
        <!-- Fallback Background Image (Always present behind video for instant load) -->
        <img 
          alt="Painel de instrumentos industriais" 
          class="absolute inset-0 w-full h-full object-cover z-0" 
          :src="siteSettings.hero_bg_image_url || 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo'"
        />

        <!-- Video Background Overlay -->
        <template v-if="isVideoActive && parsedVideo.url">
          <!-- YouTube or Vimeo Iframe Embed -->
          <div 
            v-if="parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo'" 
            class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
          >
            <iframe 
              class="w-[160%] h-[160%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-125 border-0"
              :src="parsedVideo.url"
              allow="autoplay; fullscreen; picture-in-picture"
            ></iframe>
          </div>

          <!-- Direct HTML5 MP4 / WebM / Wix Video -->
          <video 
            v-else
            ref="heroVideoRef"
            class="absolute inset-0 w-full h-full object-cover z-10 min-w-full min-h-full pointer-events-none"
            autoplay
            loop
            muted
            :muted="true"
            playsinline
            webkit-playsinline
            preload="auto"
            referrerpolicy="no-referrer"
            @loadedmetadata="playVideo"
            @loadeddata="playVideo"
            @canplay="playVideo"
            @canplaythrough="playVideo"
            :src="parsedVideo.url"
          ></video>
        </template>

        <!-- Preset Mode Container -->
        <div 
          v-if="siteSettings.hero_card_position_mode === 'preset'"
          class="relative z-20 w-full h-full px-4 md:px-10 max-w-[1280px] mx-auto flex transition-all duration-300 pointer-events-none"
          :class="[heroHorizontalClass, heroVerticalClass]"
        >
          <div 
            class="backdrop-blur-xs p-8 md:p-12 max-w-xl rounded shadow-lg transition-all duration-300 pointer-events-auto"
            :style="{ backgroundColor: siteSettings.hero_card_bg_color || '#74b934' }"
          >
            <h1 
              class="font-['Rubik',sans-serif] text-2xl md:text-4xl font-medium leading-tight whitespace-pre-line transition-transform duration-150"
              :style="{ 
                color: siteSettings.hero_card_text_color || '#ffffff',
                transform: `translateY(${siteSettings.hero_card_text_offset_y || 0}px)`
              }"
            >
              {{ activeHeroCardText }}
            </h1>
          </div>
        </div>

        <!-- Custom Free Positioning Container -->
        <div 
          v-else
          class="absolute z-20 max-w-[90vw] md:max-w-xl transition-all duration-150 pointer-events-auto"
          :class="siteSettings.hero_card_extend_bottom ? 'bottom-0 flex flex-col justify-center' : ''"
          :style="{
            left: (siteSettings.hero_card_offset_x ?? 18) + '%',
            top: (siteSettings.hero_card_offset_y ?? 45) + '%',
            bottom: siteSettings.hero_card_extend_bottom ? '0px' : 'auto'
          }"
        >
          <div 
            class="backdrop-blur-sm p-6 md:p-10 shadow-lg transition-all duration-300 flex items-center"
            :class="siteSettings.hero_card_extend_bottom ? 'h-full rounded-t-md rounded-b-none' : 'rounded-md'"
            :style="getCardBgStyle(siteSettings.hero_card_bg_color, siteSettings.hero_card_opacity)"
          >
            <h1 
              class="font-['Rubik',sans-serif] text-xl md:text-3xl font-medium leading-tight whitespace-pre-line transition-transform duration-150"
              :style="{ 
                color: siteSettings.hero_card_text_color || '#ffffff',
                transform: `translateY(${siteSettings.hero_card_text_offset_y || 0}px)`
              }"
            >
              {{ activeHeroCardText }}
            </h1>
          </div>
        </div>
      </section>

      <!-- Faixa fina branca -->
      <div class="bg-white h-3 w-full"></div>

      <!-- Busca Rápida e Links Diretos -->
      <section class="bg-[#e9e9e9] py-12 md:py-16 px-4 md:px-10">
        <div class="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <!-- Left Column: Search -->
          <div class="flex flex-col gap-2">
            <h2 class="text-2xl md:text-3xl text-[#333333] font-normal tracking-tight">{{ mergedTranslations['home.search_title'] || 'Como podemos te ajudar?' }}</h2>
            <p class="text-[#666666] text-sm md:text-base font-normal mb-3">{{ mergedTranslations['home.search_subtitle'] || 'Utilize a busca rápida e encontre sua necessidade' }}</p>
            <form @submit.prevent="handleSearch" class="relative w-full max-w-md">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-lg">search</span>
              <input 
                v-model="searchInput"
                class="w-full pl-10 pr-4 py-2.5 rounded-md border border-blue-400/80 focus:border-blue-600 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none shadow-2xs transition-all" 
                :placeholder="t.searchPlaceholder || 'Search...'" 
                type="text"
              />
            </form>
          </div>

          <!-- Right Column: Quick Links -->
          <div class="flex flex-col gap-2.5">
            <span class="text-xs font-semibold text-[#666666] tracking-tight mb-1">{{ mergedTranslations['home.search_quick_title'] || 'Buscas mais utilizadas' }}</span>
            <div class="flex flex-col gap-2">
              <button type="button" @click="openContactModal()" class="text-[#444444] hover:text-blue-700 font-normal text-base md:text-[17px] transition-colors w-fit border-0 bg-transparent cursor-pointer p-0 text-left">
                {{ mergedTranslations['home.search_quick_1'] || 'Contato de vendas / suporte' }}
              </button>
              <NuxtLink to="/catalogo?cat=V%C3%81LVULAS%20DE%20SEGURAN%C3%87A" class="text-[#444444] hover:text-blue-700 font-normal text-base md:text-[17px] transition-colors w-fit">
                {{ mergedTranslations['home.search_quick_2'] || 'Válvulas de Segurança' }}
              </NuxtLink>
              <NuxtLink to="/catalogo?q=HEROSE" class="text-[#444444] hover:text-blue-700 font-normal text-base md:text-[17px] transition-colors w-fit">
                {{ mergedTranslations['home.search_quick_3'] || 'Reparos HEROSE' }}
              </NuxtLink>
              <NuxtLink to="/catalogo?cat=TRANSMISSORES" class="text-[#444444] hover:text-blue-700 font-normal text-base md:text-[17px] transition-colors w-fit">
                {{ mergedTranslations['home.search_quick_4'] || 'Transmissores de Pressão' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Faixa fina branca -->
      <div class="bg-white h-3 w-full"></div>

      <!-- Principais Segmentos -->
      <section
        id="segmentos"
        :style="{
          backgroundColor: siteSettings.sec_segmentos_bg || '#ffffff',
          paddingTop: `${siteSettings.sec_segmentos_ptop ?? 20}px`,
          paddingBottom: `${siteSettings.sec_segmentos_pbot ?? 24}px`,
          minHeight: siteSettings.sec_segmentos_min_height ? `${siteSettings.sec_segmentos_min_height}px` : undefined
        }"
      >
        <div style="max-width:832px;margin:0 auto;padding:0 16px;">
          <h2 style="font-size:24px;color:#555555;font-weight:400;margin:0 0 10px 0;">Principais segmentos</h2>
          <div style="display:flex;gap:13px;">

            <!-- Criogenia & Gases industriais -->
            <a
              href="/catalogo?segment=CRIOGENIA"
              style="flex:1;min-width:0;position:relative;overflow:hidden;background:#d0d0d0;display:block;text-decoration:none;cursor:pointer;"
              :style="{ height: `${siteSettings.seg_card_img_height ?? 165}px` }"
              class="seg-card"
            >
              <img
                alt="Criogenia & Gases industriais"
                style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"
                :src="formatNewsImageUrl(siteSettings.segment_img_criogenia)"
                @error="handleImgError"
              />
              <div
                class="seg-label"
                style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:0 8px;transition:background-color 0.2s ease;backdrop-filter:blur(1px);"
                :style="{
                  height: `${siteSettings.seg_caption_height ?? 48}px`,
                  backgroundColor: hexToRgba(siteSettings.seg_caption_bg || '#ffffff', siteSettings.seg_caption_opacity ?? 82)
                }"
              >
                <span
                  style="font-size:13px;font-weight:400;text-align:center;transition:color 0.2s ease;"
                  :style="{ color: siteSettings.seg_caption_color || '#333333' }"
                >
                  Criogênia &amp; Gases industriais
                </span>
              </div>
            </a>

            <!-- Óleo & Gás -->
            <a
              href="/catalogo?segment=OLEO_GAS"
              style="flex:1;min-width:0;position:relative;overflow:hidden;background:#d0d0d0;display:block;text-decoration:none;cursor:pointer;"
              :style="{ height: `${siteSettings.seg_card_img_height ?? 165}px` }"
              class="seg-card"
            >
              <img
                alt="Óleo & Gás"
                style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"
                :src="formatNewsImageUrl(siteSettings.segment_img_oleo_gas)"
                @error="handleImgError"
              />
              <div
                class="seg-label"
                style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:0 8px;transition:background-color 0.2s ease;backdrop-filter:blur(1px);"
                :style="{
                  height: `${siteSettings.seg_caption_height ?? 48}px`,
                  backgroundColor: hexToRgba(siteSettings.seg_caption_bg || '#ffffff', siteSettings.seg_caption_opacity ?? 82)
                }"
              >
                <span
                  style="font-size:13px;font-weight:400;text-align:center;transition:color 0.2s ease;"
                  :style="{ color: siteSettings.seg_caption_color || '#333333' }"
                >
                  Óleo &amp; Gás
                </span>
              </div>
            </a>

            <!-- Açúcar e Álcool -->
            <a
              href="/catalogo?segment=SUCROALCOOLEIRO"
              style="flex:1;min-width:0;position:relative;overflow:hidden;background:#d0d0d0;display:block;text-decoration:none;cursor:pointer;"
              :style="{ height: `${siteSettings.seg_card_img_height ?? 165}px` }"
              class="seg-card"
            >
              <img
                alt="Açúcar e Álcool"
                style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"
                :src="formatNewsImageUrl(siteSettings.segment_img_sucroalcooleiro)"
                @error="handleImgError"
              />
              <div
                class="seg-label"
                style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:0 8px;transition:background-color 0.2s ease;backdrop-filter:blur(1px);"
                :style="{
                  height: `${siteSettings.seg_caption_height ?? 48}px`,
                  backgroundColor: hexToRgba(siteSettings.seg_caption_bg || '#ffffff', siteSettings.seg_caption_opacity ?? 82)
                }"
              >
                <span
                  style="font-size:13px;font-weight:400;text-align:center;transition:color 0.2s ease;"
                  :style="{ color: siteSettings.seg_caption_color || '#333333' }"
                >
                  Açúcar e álcool
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      <!-- Novidades / Produtos em Destaque -->
      <section
        id="novidades"
        :style="{
          backgroundColor: siteSettings.sec_novidades_bg || '#f0f0f0',
          paddingTop: `${siteSettings.sec_novidades_ptop ?? 36}px`,
          paddingBottom: `${siteSettings.sec_novidades_pbot ?? 44}px`,
          minHeight: siteSettings.sec_novidades_min_height ? `${siteSettings.sec_novidades_min_height}px` : undefined
        }"
      >
        <div style="max-width:832px;margin:0 auto;padding:0 16px;">
          <h2 style="font-size:24px;color:#555555;font-weight:400;margin:0 0 16px 0;">{{ mergedTranslations['home.news_title'] || 'Novidades' }}</h2>

          <div style="display:flex;gap:13px;">
            <template v-for="card in newsCards" :key="card.id">
              <a
                v-if="card.link_type === 'pdf'"
                :href="getCardHref(card)"
                target="_blank"
                rel="noopener"
                style="flex:1;min-width:0;position:relative;overflow:hidden;background:#d9d9d9;display:block;text-decoration:none;cursor:pointer;"
                :style="{ height: `${siteSettings.news_card_height ?? 165}px` }"
                class="news-card-link novidade-card"
              >
                <img
                  :alt="getCardTitle(card)"
                  style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"
                  :src="formatNewsImageUrl(card.image_url)"
                  @error="handleImgError"
                />
                <div
                  class="news-card-caption novidade-card__legenda"
                  :style="{
                    height: `${siteSettings.news_caption_height ?? 48}px`,
                    backgroundColor: hexToRgba(siteSettings.news_caption_bg || '#ffffff', siteSettings.news_caption_opacity ?? 82)
                  }"
                >
                  <span :style="{ color: siteSettings.news_caption_color || '#333333' }">{{ getCardTitle(card) }}</span>
                </div>
              </a>

              <a
                v-else
                :href="getCardHref(card)"
                style="flex:1;min-width:0;position:relative;overflow:hidden;background:#d9d9d9;display:block;text-decoration:none;cursor:pointer;"
                :style="{ height: `${siteSettings.news_card_height ?? 165}px` }"
                class="news-card-link novidade-card"
              >
                <img
                  :alt="getCardTitle(card)"
                  style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"
                  :src="formatNewsImageUrl(card.image_url)"
                  @error="handleImgError"
                />
                <div
                  class="news-card-caption novidade-card__legenda"
                  :style="{
                    height: `${siteSettings.news_caption_height ?? 48}px`,
                    backgroundColor: hexToRgba(siteSettings.news_caption_bg || '#ffffff', siteSettings.news_caption_opacity ?? 82)
                  }"
                >
                  <span :style="{ color: siteSettings.news_caption_color || '#333333' }">{{ getCardTitle(card) }}</span>
                </div>
              </a>
            </template>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section
        :style="{
          backgroundColor: siteSettings.sec_newsletter_bg || '#ffffff',
          paddingTop: `${siteSettings.sec_newsletter_ptop ?? 30}px`,
          paddingBottom: `${siteSettings.sec_newsletter_pbot ?? 40}px`,
          minHeight: siteSettings.sec_newsletter_min_height ? `${siteSettings.sec_newsletter_min_height}px` : undefined
        }"
      >
        <div style="max-width:832px;margin:0 auto;padding:0 16px;">
          <h2 style="font-size:15px;color:#333;font-weight:400;margin:0 0 4px 0;">
            {{ mergedTranslations['home.newsletter_title'] || 'Cadastre-se para receber nossa newsletter.' }}
          </h2>
          <form @submit.prevent="handleNewsletterSubmit" style="margin-top:10px;">
            <label style="font-size:12px;color:#888;display:block;margin-bottom:5px;">
              {{ mergedTranslations['home.newsletter_label'] || 'Digite seu email aqui *' }}
            </label>
            <div style="display:flex;width:100%;">
              <input
                v-model="newsletterEmail"
                style="flex:1;height:36px;padding:0 10px;border:1px solid #999;border-right:none;background:white;font-size:14px;color:#333;outline:none;box-sizing:border-box;"
                required
                type="email"
                :disabled="sendingNewsletter"
              />
              <button
                style="width:207px;height:36px;background:#0052a5;color:white;font-size:14px;font-weight:400;border:0;cursor:pointer;white-space:nowrap;flex-shrink:0;box-sizing:border-box;"
                type="submit"
                :disabled="sendingNewsletter"
              >
                {{ sendingNewsletter ? 'Enviando...' : (newsletterSubmitted ? 'Cadastrado!' : (mergedTranslations['home.newsletter_button'] || 'Inscrever')) }}
              </button>
            </div>
            <p v-if="newsletterFeedback" :style="{ color: newsletterFeedback.type === 'success' ? '#10b981' : '#ef4444' }" style="font-size:12px;margin:8px 0 0;font-weight:500;">
              {{ newsletterFeedback.message }}
            </p>
          </form>
        </div>
      </section>

      <!-- Sobre a Qualitec (hidden on home, kept as anchor target) -->
      <div id="sobre" style="display:none;"></div>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Modal de Contato / Orçamento por E-mail -->
    <ContactModal 
      :open="showContactModal" 
      :product-name="contactProductName" 
      @close="showContactModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import useTranslations from '../composables/useTranslations'
import { useTranslationsAdmin } from '../composables/useTranslations'

const { siteSettings, fetchSiteSettings } = useSiteSettings()
const { t, currentLang, translatedSegments, mergedTranslations } = useTranslations()
const { fetchTranslationsFromDB } = useTranslationsAdmin()
const heroVideoRef = ref<HTMLVideoElement | null>(null)
const supabase = useSupabaseClient()

// --- Mega Menu (mesmos botoes do Catalogo) ---
const { megaMenuTree, loadProducts, fetchAssets } = useCatalog()
const homeMegaCategory = ref('TODAS')
const handleHomeMegaMenuSelect = (payload: { category: string; family: string; subcategory: string }) => {
  // Navegar para catálogo com filtro da categoria selecionada
  const cat = payload.category && payload.category !== 'TODAS' ? payload.category : ''
  const fam = payload.family || ''
  const sub = payload.subcategory || ''
  const query: Record<string, string> = {}
  if (cat) query.cat = cat
  if (fam) query.family = fam
  if (sub) query.subcategory = sub
  navigateTo({ path: '/catalogo', query })
}

const activeHeroCardText = computed(() => {
  const lang = currentLang.value
  if (lang === 'en') {
    return siteSettings.value.hero_card_text_en || siteSettings.value.hero_card_text_pt || siteSettings.value.hero_card_text || '“ Your daily challenge, we solve every day with safety and reliability “'
  }
  if (lang === 'es') {
    return siteSettings.value.hero_card_text_es || siteSettings.value.hero_card_text_pt || siteSettings.value.hero_card_text || '“ Su desafío diario, lo resolvemos todos los días con seguridad y confiabilidad “'
  }
  return siteSettings.value.hero_card_text_pt || siteSettings.value.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “'
})

interface NewsCard {
  id: number
  title_pt: string
  title_en: string
  title_es: string
  image_url: string
  link_type: string
  link_value: string
  link_label_pt: string
  link_label_en: string
  link_label_es: string
  show_link_button: boolean
}

const defaultImages = [
  'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo',
  'https://lh3.googleusercontent.com/aida/AP1WRLuG8sZS2kOzj2vWiRJKUV2sBhsBQRWjVrjvR4wnSCqsuaozGrwLnu6MrCdeDc6xKeiRnf6slFTLtforvCKE7HTmjBOJeaU_T8oysOKzPgniF9frKcP6lAwR0QKqFO4ZO6opkVFeH45aEY72r6WhAnegRADQXfnRkibd80aizun5t04sqBpqCts1rDtBiRSA3QJDdstMlsoDw3n9s5ZbF_-xMhue9TPDh7AXsaZgogGTYlpRNluclB6ax78',
  'https://lh3.googleusercontent.com/aida/AP1WRLv-GfRr-b2d9wobOGuNB9O-zkRJwTQEiHQAwyyzinqVG7T8NlRQuSfpMp5ZxkXK8OD5YQ4cZqUih3JQb1iSfTVvz2mH5t5WOfwH3Nq0nTyubrNNXy2c2wnpJkkDT59Se2En1-vv580MTcE7qKQcapGD5Mwi4hxg8HM7uxxJS2hgp5rgDJRlQ5Q7-QQb4OsKI3kX9bTKAVQ_PzXV_bfUz5gn_TCDlVhk1qhr5_Xbr2maKQ_X-URbXHbcuQ'
]

const newsCards = ref<NewsCard[]>([
  { id: 1, title_pt: 'Novo Catálogo', title_en: 'New Catalog', title_es: 'Nuevo Catálogo', image_url: defaultImages[0], link_type: 'page', link_value: '/catalogo', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
  { id: 2, title_pt: 'Transmissor de nível flangeado', title_en: 'Flanged level transmitter', title_es: 'Transmisor de nivel bridado', image_url: defaultImages[1], link_type: 'category', link_value: 'Criogenia', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
  { id: 3, title_pt: 'Regulador Pressão CO2', title_en: 'CO2 Pressure Regulator', title_es: 'Regulador de Presión CO2', image_url: defaultImages[2], link_type: 'category', link_value: 'Gases Técnicos', link_label_pt: '', link_label_en: '', link_label_es: '', show_link_button: false },
])

const fetchNewsCards = async () => {
  try {
    const { data } = await (supabase as any).from('home_news_cards').select('*').order('id', { ascending: true })
    if (data && data.length > 0) {
      newsCards.value = newsCards.value.map((card, i) => {
        const dbCard = data.find((d: any) => d.id === card.id)
        if (!dbCard) return card
        return {
          ...card,
          ...dbCard,
          image_url: dbCard.image_url || defaultImages[i] || ''
        }
      })
    }
  } catch {}
}

const getCardTitle = (card: NewsCard) => {
  const lang = currentLang.value
  if (lang === 'en') return card.title_en || card.title_pt
  if (lang === 'es') return card.title_es || card.title_pt
  return card.title_pt
}

const getCardLinkLabel = (card: NewsCard) => {
  const lang = currentLang.value
  if (lang === 'en') return card.link_label_en || card.link_label_pt
  if (lang === 'es') return card.link_label_es || card.link_label_pt
  return card.link_label_pt
}

const formatNewsImageUrl = (url: string) => {
  if (!url) return '/placeholder.png'
  if (url.startsWith('/') || url.startsWith('data:')) return url
  return `/api/proxy-image?url=${encodeURIComponent(url)}`
}

const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (!img.src.endsWith('/placeholder.png')) {
    img.src = '/placeholder.png'
  }
}

const getCardHref = (card: NewsCard) => {
  if (card.link_type === 'category') return `/catalogo?segment=${encodeURIComponent(card.link_value)}`
  if (card.link_type === 'pdf') return card.link_value
  return card.link_value || '/catalogo'
}

const isVideoActive = computed(() => {
  const url = (siteSettings.value.hero_bg_video_url || '').trim()
  if (!url) return false
  return siteSettings.value.hero_bg_type === 'video' && url.length > 0
})

const hexToRgba = (hex: string, opacityPercent: number) => {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${(opacityPercent ?? 82) / 100})`
  let cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  if (cleanHex.length !== 6) return `rgba(255, 255, 255, ${(opacityPercent ?? 82) / 100})`
  const num = parseInt(cleanHex, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const alpha = Math.max(0, Math.min(100, opacityPercent ?? 82)) / 100
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

function getCardBgStyle(hex: string, opacityPercent: number) {
  const alpha = ((opacityPercent ?? 85) / 100)
  let color = hex || '#74b934'
  let c = color.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return { backgroundColor: `rgba(116, 185, 52, ${alpha})` }
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})` }
}

const playVideo = () => {
  const el = heroVideoRef.value
  if (!el) return

  el.muted = true
  el.defaultMuted = true
  el.volume = 0
  el.setAttribute('muted', '')
  el.setAttribute('playsinline', '')

  const p = el.play()
  if (p !== undefined) {
    p.catch(err => {
      console.warn('[HeroVideo] Autoplay blocked, registering gesture listener:', err)
      const handleUserGesture = () => {
        if (heroVideoRef.value) {
          heroVideoRef.value.muted = true
          heroVideoRef.value.play().catch(() => {})
        }
        ['click', 'touchstart', 'scroll', 'pointerdown', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, handleUserGesture)
        })
      }
      ['click', 'touchstart', 'scroll', 'pointerdown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, handleUserGesture, { once: true, passive: true })
      })
    })
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSiteSettings(),
    fetchTranslationsFromDB(),
    fetchAssets(),
    loadProducts(),
  ])
  nextTick(() => {
    playVideo()
  })
})

watch(() => [siteSettings.value.hero_bg_video_url, siteSettings.value.hero_bg_type], () => {
  nextTick(() => {
    if (heroVideoRef.value) {
      heroVideoRef.value.muted = true
      heroVideoRef.value.defaultMuted = true
      heroVideoRef.value.load()
      playVideo()
    }
  })
}, { immediate: true, deep: true })

const parsedVideo = computed(() => {
  const url = (siteSettings.value.hero_bg_video_url || '').trim()
  if (!url) return { type: 'none', url: '' }

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1]
    return {
      type: 'youtube',
      url: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disabledkb=1&modestbranding=1&rel=0&showinfo=0&playsinline=1&enablejsapi=1`
    }
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1]
    return {
      type: 'vimeo',
      url: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1&autopause=0`
    }
  }

  // Wix static or third-party videos with CORS restrictions
  if (url.includes('wixstatic.com')) {
    return {
      type: 'direct',
      url: `/api/proxy-video?url=${encodeURIComponent(url)}`
    }
  }

  return {
    type: 'direct',
    url
  }
})

const heroHorizontalClass = computed(() => {
  const pos = siteSettings.value.hero_card_position || 'left'
  if (pos === 'center') return 'justify-center'
  if (pos === 'right') return 'justify-end'
  return 'justify-start'
})

const heroVerticalClass = computed(() => {
  const align = siteSettings.value.hero_card_vertical_align || 'center'
  if (align === 'top') return 'items-start pt-12'
  if (align === 'bottom') return 'items-end pb-12'
  return 'items-center'
})

useHead({
  title: 'Qualitec Instrumentos Industriais | Início',
  meta: [
    { name: 'description', content: 'Soluções em instrumentação industrial, válvulas de segurança criogênicas HEROSE e reguladores Generant.' }
  ],
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Work+Sans:wght@400;600&display=swap' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1' }
  ]
})

const searchInput = ref('')
const mobileMenuOpen = ref(false)
const newsletterEmail = ref('')
const newsletterSubmitted = ref(false)
const sendingNewsletter = ref(false)
const newsletterFeedback = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showContactModal = ref(false)
const contactProductName = ref('')

const openContactModal = (prodName = '') => {
  contactProductName.value = prodName
  showContactModal.value = true
}

const handleSearch = () => {
  if (searchInput.value.trim()) {
    navigateTo(`/catalogo?q=${encodeURIComponent(searchInput.value.trim())}`)
  } else {
    navigateTo('/catalogo')
  }
}

const handleNewsletterSubmit = async () => {
  const emailVal = newsletterEmail.value.trim()
  if (!emailVal) return

  sendingNewsletter.value = true
  newsletterFeedback.value = null

  try {
    const res = await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        type: 'newsletter',
        email: emailVal,
        lang: currentLang.value || 'pt'
      }
    }) as any

    if (res?.success) {
      newsletterSubmitted.value = true
      newsletterFeedback.value = {
        message: 'Inscrição realizada com sucesso! Verifique sua caixa de entrada.',
        type: 'success'
      }
      newsletterEmail.value = ''
      setTimeout(() => {
        newsletterSubmitted.value = false
        newsletterFeedback.value = null
      }, 5000)
    }
  } catch (err: any) {
    console.error('Erro ao enviar newsletter:', err)
    newsletterFeedback.value = {
      message: err.data?.message || err.message || 'Erro ao realizar inscrição. Tente novamente.',
      type: 'error'
    }
  } finally {
    sendingNewsletter.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSiteSettings(),
    fetchTranslationsFromDB(),
    fetchNewsCards()
  ])
})
</script>

<style scoped>
/* Segment cards hover effect */
.seg-card:hover .seg-label {
  background-color: #004A96;
}
.seg-card:hover .seg-label span {
  color: #ffffff;
}

/* Novidades cards */
.novidade-card {
  position: relative;
  overflow: hidden;
}

.novidade-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.novidade-card__legenda {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(1px);
  text-align: center;
  padding: 0 8px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
}

.novidade-card__legenda span {
  color: #333333;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.news-card-link:hover .novidade-card__legenda span {
  color: #004A96;
}
</style>