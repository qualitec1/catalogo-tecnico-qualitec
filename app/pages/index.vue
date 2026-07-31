<template>
  <div class="bg-[#fdf8f8] text-[#1c1b1b] font-['Work_Sans',sans-serif] antialiased selection:bg-[#004A96] selection:text-white min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-[#c2c6d3] sticky top-0 z-50 transition-all duration-300 shadow-xs">
      <div class="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-10 max-w-[1280px] mx-auto py-4 gap-4">
        <!-- Brand Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <img 
            alt="Qualitec Logo" 
            class="h-12 object-contain" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLvb_lGcigKW6su6LN_Xd0Bf0AXsewLIulAi0GxcP_qLjBKDQwKkr4TLJgHAmnOXZ_CnTBIs1fPQUk9wsPoaEnw1KIo3G_pm2AD72CQGZpdCmL0me0d5Nw3sO0Jq1oNeH0TPtE84vraycYx20zMTmWG9t98pFKFcZH8ovF5vpsN6YK6J2ZqjcN6pDWW8byB81uqO2z6Crk115D73Mm9qXI78ObCCnUJ9BmIfEJoVkKB3TB8-KPNPPQ8kG9Y"
          />
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-8 items-center font-['Work_Sans',sans-serif]">
          <NuxtLink 
            to="/" 
            class="text-sm font-semibold text-[#004A96] border-b-2 border-[#004A96] pb-1 hover:bg-[#f7f3f2] transition-colors duration-200"
          >
            Início
          </NuxtLink>
          <NuxtLink 
            to="/catalogo" 
            class="text-sm font-semibold text-[#424751] hover:text-[#004A96] hover:bg-[#f7f3f2] px-2 py-1 rounded transition-colors duration-200"
          >
            Catálogo / Produtos
          </NuxtLink>
          <a 
            href="#segmentos" 
            class="text-sm font-semibold text-[#424751] hover:text-[#004A96] hover:bg-[#f7f3f2] px-2 py-1 rounded transition-colors duration-200"
          >
            Segmentos
          </a>
          <a 
            href="#novidades" 
            class="text-sm font-semibold text-[#424751] hover:text-[#004A96] hover:bg-[#f7f3f2] px-2 py-1 rounded transition-colors duration-200"
          >
            Novidades
          </a>
          <a 
            href="#sobre" 
            class="text-sm font-semibold text-[#424751] hover:text-[#004A96] hover:bg-[#f7f3f2] px-2 py-1 rounded transition-colors duration-200"
          >
            Sobre
          </a>
          <a 
            href="#contato" 
            class="text-sm font-semibold text-[#424751] hover:text-[#004A96] hover:bg-[#f7f3f2] px-2 py-1 rounded transition-colors duration-200"
          >
            Contato
          </a>
        </nav>

        <!-- Mobile Menu Toggle Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-[#004A96] p-2">
          <span class="material-symbols-outlined text-2xl">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3 font-['Work_Sans',sans-serif]">
        <NuxtLink to="/" class="text-sm font-bold text-[#004A96]">Início</NuxtLink>
        <NuxtLink to="/catalogo" class="text-sm font-semibold text-[#424751]">Catálogo / Produtos</NuxtLink>
        <a href="#segmentos" @click="mobileMenuOpen = false" class="text-sm font-semibold text-[#424751]">Segmentos</a>
        <a href="#novidades" @click="mobileMenuOpen = false" class="text-sm font-semibold text-[#424751]">Novidades</a>
        <a href="#sobre" @click="mobileMenuOpen = false" class="text-sm font-semibold text-[#424751]">Sobre</a>
        <a href="#contato" @click="mobileMenuOpen = false" class="text-sm font-semibold text-[#424751]">Contato</a>
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
              class="font-['Rubik',sans-serif] text-2xl md:text-4xl font-medium leading-tight whitespace-pre-line"
              :style="{ color: siteSettings.hero_card_text_color || '#ffffff' }"
            >
              {{ siteSettings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
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
              class="font-['Rubik',sans-serif] text-xl md:text-3xl font-medium leading-tight whitespace-pre-line"
              :style="{ color: siteSettings.hero_card_text_color || '#ffffff' }"
            >
              {{ siteSettings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
            </h1>
          </div>
        </div>
      </section>

      <!-- Busca Rápida e Links Diretos -->
      <section class="bg-[#e5e5e5] py-12 px-4 md:px-10 border-b border-gray-300/40">
        <div class="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <!-- Left Column: Search -->
          <div class="flex flex-col gap-4">
            <h2 class="font-['Rubik',sans-serif] text-2xl md:text-3xl text-[#424751] font-medium">Como podemos te ajudar?</h2>
            <p class="text-[#424751] text-base">Utilize a busca rápida e encontre sua necessidade</p>
            <form @submit.prevent="handleSearch" class="relative max-w-md">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
              <input 
                v-model="searchInput"
                class="w-full pl-10 pr-12 py-3 rounded border border-[#c2c6d3] focus:ring-2 focus:ring-[#004A96] focus:border-transparent bg-white text-base text-[#1c1b1b] outline-none" 
                placeholder="Buscar equipamentos, válvulas, manômetros..." 
                type="text"
              />
              <button 
                type="submit" 
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004A96] text-white p-1.5 rounded hover:bg-[#00346c] transition-colors"
                title="Buscar"
              >
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>

          <!-- Right Column: Quick Links -->
          <div class="flex flex-col gap-3">
            <span class="text-xs font-bold text-[#424751] uppercase tracking-wider">Buscas mais utilizadas</span>
            <div class="flex flex-col gap-2.5">
              <NuxtLink to="/catalogo?cat=V%C3%81LVULAS%20DE%20SEGURAN%C3%87A" class="text-[#004A96] hover:text-[#00346c] font-semibold text-base transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
                Válvulas de Segurança
              </NuxtLink>
              <NuxtLink to="/catalogo?q=HEROSE" class="text-[#004A96] hover:text-[#00346c] font-semibold text-base transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
                Reparos HEROSE
              </NuxtLink>
              <NuxtLink to="/catalogo?cat=TRANSMISSORES" class="text-[#004A96] hover:text-[#00346c] font-semibold text-base transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
                Transmissores de Pressão
              </NuxtLink>
              <a href="https://wa.me/551139087100" target="_blank" class="text-[#004A96] hover:text-[#00346c] font-semibold text-base transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
                Contato de vendas / suporte
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Principais Segmentos -->
      <section id="segmentos" class="py-16 md:py-20 px-4 md:px-10 max-w-[1280px] mx-auto bg-white">
        <div class="text-center mb-12">
          <h2 class="font-['Rubik',sans-serif] text-2xl md:text-3xl text-[#424751] font-medium mb-3">Principais segmentos</h2>
          <p class="text-gray-500 text-sm max-w-xl mx-auto">Atendemos setores industriais exigentes com soluções certificadas de altíssima confiabilidade.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <!-- Criogenia & Gases industriais -->
          <NuxtLink to="/catalogo?segment=CRIOGENIA" class="group flex flex-col border border-gray-100 rounded overflow-hidden shadow-xs hover:shadow-md transition-all">
            <div class="h-48 overflow-hidden bg-gray-100">
              <img 
                alt="Criogenia & Gases industriais" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLsDWV00WRL33tuhAG3BPA8GTPcBz-pfzYJ5QGz2_CFnkvCSprf16WTZORxqYJd3VFMaSLF81Wdm-S9-UEVYwRS6IZjDh4VV8WwGm6i7fTQgU4oSmP9IGxRBZnXvSg-lgNzx7dHLh96NV6al1sI8sdEOoVx6IZCUOcKyTMikgpuW736a8c-W4OfY41ayLpgc1yRxJm4ux29KF3X6Vl4DjzUrBJhQVrk6zwaVUJrs9k2kRxWzoaJlEeyRARs"
              />
            </div>
            <div class="bg-[#f1edec] p-4 text-center group-hover:bg-[#004A96] group-hover:text-white transition-colors">
              <h3 class="font-semibold text-[#424751] group-hover:text-white">Criogênia & Gases industriais</h3>
            </div>
          </NuxtLink>

          <!-- Óleo & Gás -->
          <NuxtLink to="/catalogo?segment=OLEO_GAS" class="group flex flex-col border border-gray-100 rounded overflow-hidden shadow-xs hover:shadow-md transition-all">
            <div class="h-48 overflow-hidden bg-gray-100">
              <img 
                alt="Óleo & Gás" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLtMAi3za4oatqWzMuvla-WvZQlt9FguAx22h8nx9U6lR8p142s5QcL4EPPE0ligkQbqZ0q-ZYW-hqDRV2uJVGv0NMmhiEuyzJbKk7sUfZpHHA4_sz8P-TyC7QparCuJFeAeovwFTiSEpumRpFGJg-y1rdhCKN1ensV_n46sSPNrBJMqn7MqzXsxs1FqEOTTk7iB0mQ42_IaiLxVLi8QHfDnmf1qJl39Y9bqn9spftMGhs_woAvKg85Vgk0"
              />
            </div>
            <div class="bg-[#f1edec] p-4 text-center group-hover:bg-[#004A96] group-hover:text-white transition-colors">
              <h3 class="font-semibold text-[#424751] group-hover:text-white">Óleo & Gás</h3>
            </div>
          </NuxtLink>

          <!-- Açúcar e Álcool -->
          <NuxtLink to="/catalogo?segment=SUCROALCOOLEIRO" class="group flex flex-col border border-gray-100 rounded overflow-hidden shadow-xs hover:shadow-md transition-all">
            <div class="h-48 overflow-hidden bg-gray-100">
              <img 
                alt="Açúcar e Álcool" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLtx-24uZLAzxnTShKPl8Wv12JS85bEMJBe8sqHO25f6hSfCDYWD7dOd3t0TS1qSXQfoEmpRejEnBgmszPULohKQhnktzaTJxNZlqCZtWMl_i2qHHdWBFpI5OD1WyuR3zn6bDrno3XOkEm5_52rNlHCVRUzbbVXx-6T9Fq-atHYsA-bfuEzXbOwh0ibv0HAdlvONto1p0-R41aQY_ZMMGGD6KANY4mawEiSd7OT1CHuJeCgTozkzRuxGGg"
              />
            </div>
            <div class="bg-[#f1edec] p-4 text-center group-hover:bg-[#004A96] group-hover:text-white transition-colors">
              <h3 class="font-semibold text-[#424751] group-hover:text-white">Açúcar e álcool</h3>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Novidades / Produtos em Destaque -->
      <section id="novidades" class="py-16 md:py-20 px-4 md:px-10 max-w-[1280px] mx-auto bg-[#f7f3f2] border-y border-[#c2c6d3]/30">
        <div class="flex justify-between items-center mb-12">
          <h2 class="font-['Rubik',sans-serif] text-2xl md:text-3xl text-[#424751] font-medium">Novidades</h2>
          <NuxtLink to="/catalogo" class="text-sm font-bold text-[#004A96] hover:underline flex items-center gap-1">
            Ver catálogo completo
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <!-- Produto 1 -->
          <NuxtLink to="/catalogo" class="flex flex-col group bg-white rounded overflow-hidden border border-gray-200/60 p-4 hover:shadow-md transition-all">
            <div class="w-full bg-[#e5e5e5] h-48 flex items-center justify-center p-4 rounded">
              <img 
                alt="Novo Catálogo Técnico" 
                class="object-contain max-h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-200" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo"
              />
            </div>
            <h3 class="font-medium text-[#2F2E2E] mt-4 text-center group-hover:text-[#004A96] transition-colors">Novo Catálogo Técnico 2025</h3>
          </NuxtLink>

          <!-- Produto 2 -->
          <NuxtLink to="/catalogo" class="flex flex-col group bg-white rounded overflow-hidden border border-gray-200/60 p-4 hover:shadow-md transition-all">
            <div class="w-full bg-[#e5e5e5] h-48 flex items-center justify-center p-4 rounded">
              <img 
                alt="Transmissor de nível flangeado" 
                class="object-contain max-h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-200" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLuG8sZS2kOzj2vWiRJKUV2sBhsBQRWjVrjvR4wnSCqsuaozGrwLnu6MrCdeDc6xKeiRnf6slFTLtforvCKE7HTmjBOJeaU_T8oysOKzPgniF9frKcP6lAwR0QKqFO4ZO6opkVFeH45aEY72r6WhAnegRADQXfnRkibd80aizun5t04sqBpqCts1rDtBiRSA3QJDdstMlsoDw3n9s5ZbF_-xMhue9TPDh7AXsaZgogGTYlpRNluclB6ax78"
              />
            </div>
            <h3 class="font-medium text-[#2F2E2E] mt-4 text-center group-hover:text-[#004A96] transition-colors">Transmissor de nível flangeado</h3>
          </NuxtLink>

          <!-- Produto 3 -->
          <NuxtLink to="/catalogo" class="flex flex-col group bg-white rounded overflow-hidden border border-gray-200/60 p-4 hover:shadow-md transition-all">
            <div class="w-full bg-[#e5e5e5] h-48 flex items-center justify-center p-4 rounded">
              <img 
                alt="Regulador Pressão CO2" 
                class="object-contain max-h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-200" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLv-GfRr-b2d9wobOGuNB9O-zkRJwTQEiHQAwyyzinqVG7T8NlRQuSfpMp5ZxkXK8OD5YQ4cZqUih3JQb1iSfTVvz2mH5t5WOfwH3Nq0nTyubrNNXy2c2wnpJkkDT59Se2En1-vv580MTcE7qKQcapGD5Mwi4hxg8HM7uxxJS2hgp5rgDJRlQ5Q7-QQb4OsKI3kX9bTKAVQ_PzXV_bfUz5gn_TCDlVhk1qhr5_Xbr2maKQ_X-URbXHbcuQ"
              />
            </div>
            <h3 class="font-medium text-[#2F2E2E] mt-4 text-center group-hover:text-[#004A96] transition-colors">Regulador Pressão CO2</h3>
          </NuxtLink>
        </div>
      </section>

      <!-- Sobre e Newsletter -->
      <section id="sobre" class="py-16 md:py-20 bg-white px-4 md:px-10">
        <div class="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 class="font-['Rubik',sans-serif] text-2xl md:text-3xl text-[#424751] font-medium mb-4">Sobre a Qualitec</h2>
            <p class="text-[#424751] text-base leading-relaxed mb-4">
              Há anos no mercado de instrumentação e controle industrial, a Qualitec oferece soluções completas e homologadas para os setores mais exigentes do mercado.
            </p>
            <p class="text-[#424751] text-base leading-relaxed">
              Somos representantes exclusivos no Brasil das renomadas marcas globais <strong>HEROSE GmbH</strong>, <strong>Generant Inc</strong> e <strong>DataOnline LLC</strong>.
            </p>
          </div>
          <div class="bg-[#f7f3f2] p-8 rounded border border-gray-200 flex flex-col gap-4">
            <h3 class="font-['Rubik',sans-serif] text-xl text-[#004A96] font-medium">Excelência e Representação Exclusiva</h3>
            <ul class="space-y-2 text-[#424751] text-sm">
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#65AC1E]">check_circle</span>
                Válvulas criogênicas e de segurança HEROSE
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#65AC1E]">check_circle</span>
                Reguladores e válvulas industriais Generant
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#65AC1E]">check_circle</span>
                Sistemas de telemetria e monitoramento DataOnline
              </li>
            </ul>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="max-w-[1280px] mx-auto pt-10 border-t border-gray-200">
          <h2 class="font-['Rubik',sans-serif] text-xl md:text-2xl text-[#424751] font-medium mb-6">Cadastre-se para receber nossa newsletter.</h2>
          <form @submit.prevent="handleNewsletterSubmit" class="flex flex-col md:flex-row max-w-4xl gap-4">
            <div class="flex-1 flex flex-col">
              <label class="text-xs font-semibold text-[#424751] mb-1">Digite seu email aqui *</label>
              <input 
                v-model="newsletterEmail"
                class="w-full border border-[#c2c6d3] p-3 focus:ring-2 focus:ring-[#004A96] focus:outline-none rounded bg-white text-base" 
                required 
                placeholder="seuemail@empresa.com.br"
                type="email"
              />
            </div>
            <button 
              class="bg-[#004A96] text-white px-10 py-3 font-medium rounded hover:bg-[#00346c] transition-colors mt-auto cursor-pointer" 
              type="submit"
            >
              {{ newsletterSubmitted ? 'Cadastrado!' : 'Inscrever' }}
            </button>
          </form>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer id="contato" class="bg-[#f7f3f2] py-16 px-4 md:px-10 relative border-t border-[#c2c6d3]">
      <div class="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        <!-- Left Column -->
        <div class="flex flex-col gap-2 text-[#424751]">
          <p class="font-bold text-[#1c1b1b]">Qualitec C S I M Ltda</p>
          <p>Rua Fazenda Monte Alegre, 367</p>
          <p>05160-060 - São Paulo - SP</p>
          <p>Tel: +55 11 3908 7100</p>
          <p class="font-semibold text-[#004A96]">vendas@qualitecinstrumentos.com.br</p>
          <p class="mt-4 text-xs text-gray-500">Todos os direitos reservados - 2024</p>
        </div>

        <!-- Right Column -->
        <div class="flex flex-col gap-2 text-[#424751] md:text-right">
          <p class="font-bold text-[#1c1b1b]">Representante Exclusivo</p>
          <p>HEROSE GmbH</p>
          <p>Generant Inc</p>
          <p>DataOnline LLC</p>
        </div>
      </div>

      <!-- Floating Support Button -->
      <div class="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/551139087100" 
          target="_blank"
          class="bg-[#004A96] hover:bg-[#00346c] text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-xl transition-all hover:scale-105 cursor-pointer no-underline"
        >
          <span class="material-symbols-outlined text-2xl">chat_bubble</span>
          <span class="font-medium text-sm">Como posso lhe ajudar?</span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const { siteSettings, fetchSiteSettings } = useSiteSettings()
const heroVideoRef = ref<HTMLVideoElement | null>(null)

const isVideoActive = computed(() => {
  const url = (siteSettings.value.hero_bg_video_url || '').trim()
  if (!url) return false
  return siteSettings.value.hero_bg_type === 'video' && url.length > 0
})

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
  await fetchSiteSettings()
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

const handleSearch = () => {
  if (searchInput.value.trim()) {
    navigateTo(`/catalogo?q=${encodeURIComponent(searchInput.value.trim())}`)
  } else {
    navigateTo('/catalogo')
  }
}

const handleNewsletterSubmit = () => {
  if (newsletterEmail.value.trim()) {
    newsletterSubmitted.value = true
    setTimeout(() => {
      newsletterEmail.value = ''
      newsletterSubmitted.value = false
    }, 3000)
  }
}
</script>