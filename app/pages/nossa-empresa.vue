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
            <NuxtLink to="/" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.home }}</NuxtLink>
            <NuxtLink to="/catalogo" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.catalog }}</NuxtLink>
            <NuxtLink to="/nossa-empresa" class="text-sm text-[#004A96] font-bold transition-colors border-b-2 border-[#004A96] pb-0.5">{{ t.about }}</NuxtLink>
            <a href="#contato" class="text-sm font-normal text-gray-600 hover:text-gray-900 transition-colors">{{ t.contact }}</a>

            <!-- Flags Selector -->
            <div class="flex items-center gap-2 border-l border-gray-200 pl-6 ml-2">
              <button 
                @click="setLanguage('pt')" 
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
                @click="setLanguage('en')" 
                class="p-1 rounded-md transition-all border cursor-pointer flex items-center justify-center"
                :class="currentLang === 'en' ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100 bg-transparent'"
                title="English (United Kingdom)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-4 rounded-xs shadow-2xs object-cover" viewBox="0 0 60 30">
                  <clipPath id="uk-clip-about"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                  <clipPath id="uk-diag-about"><path d="M30,15 h30 v15 z M30,15 h-30 v-15 z M30,15 h30 v-15 z M30,15 h-30 v15 z"/></clipPath>
                  <g clip-path="url(#uk-clip-about)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-diag-about)" stroke="#C8102E" stroke-width="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
                  </g>
                </svg>
              </button>

              <button 
                @click="setLanguage('es')" 
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

          <!-- Mobile menu toggle -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-gray-700 p-2 border-0 bg-transparent cursor-pointer">
            <span class="material-symbols-outlined text-2xl">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-slate-900 text-white px-6 py-4 space-y-3 border-b border-slate-800">
        <NuxtLink to="/" class="block text-sm font-medium hover:text-blue-400">{{ t.home }}</NuxtLink>
        <NuxtLink to="/catalogo" class="block text-sm font-medium hover:text-blue-400">{{ t.catalog }}</NuxtLink>
        <NuxtLink to="/nossa-empresa" class="block text-sm font-bold text-blue-400">{{ t.about }}</NuxtLink>
        <a href="#contato" @click="mobileMenuOpen = false" class="block text-sm font-medium hover:text-blue-400">{{ t.contact }}</a>
        <div class="flex items-center gap-3 pt-2 border-t border-slate-800">
          <button @click="setLanguage('pt')" class="text-xs px-2 py-1 bg-slate-800 rounded">PT</button>
          <button @click="setLanguage('en')" class="text-xs px-2 py-1 bg-slate-800 rounded">EN</button>
          <button @click="setLanguage('es')" class="text-xs px-2 py-1 bg-slate-800 rounded">ES</button>
        </div>
      </div>

      <!-- Mega Menu (Categorias do Catálogo) -->
      <MegaMenu
        :menu-tree="megaMenuTree"
        :selected-category="''"
        :selected-family="''"
        :selected-subcategory="''"
        @select="handleMegaMenuSelect"
      />

      <div class="bg-white h-3 w-full border-b border-gray-200"></div>
    </header>

    <!-- Content Sections -->
    <main class="flex-1">
      <!-- 1. HERO INSTITUCIONAL -->
      <section class="relative bg-slate-950 text-white py-24 md:py-32 px-4 md:px-10 overflow-hidden">
        <!-- Overlay de imagem industrial de fundo com padrão blueprint -->
        <div class="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
          <img 
            :src="siteSettings.hero_bg_url || 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png'" 
            alt="Fundo Industrial Qualitec" 
            class="w-full h-full object-cover object-center"
            @error="handleImgFallback"
          />
        </div>
        <!-- Padrão técnico sutil (grade Blueprint) -->
        <div class="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div class="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/70"></div>

        <div class="max-w-[1280px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-8 space-y-6">
            <!-- Badge técnico superior -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              QUALITEC C S I M LTDA | ENGENHARIA & INSTRUMENTAÇÃO
            </div>

            <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-['Hanken_Grotesk',sans-serif]">
              {{ mergedTranslations['about.hero_title'] || 'Soluções técnicas para processos industriais críticos' }}
            </h1>

            <p class="text-base md:text-xl text-slate-300 max-w-3xl leading-relaxed font-light">
              {{ mergedTranslations['about.hero_text'] || 'A Qualitec fornece instrumentação, válvulas e suporte técnico para aplicações que exigem segurança, precisão e confiabilidade.' }}
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <a 
                href="#setores" 
                class="px-7 py-3.5 bg-[#004A96] hover:bg-[#003770] text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-lg hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 text-center no-underline border-0 cursor-pointer"
              >
                <span>{{ mergedTranslations['about.hero_btn_solutions'] || 'Conheça nossas soluções' }}</span>
                <span class="material-symbols-outlined text-lg">arrow_downward</span>
              </a>

              <button 
                @click="openContactModal('Falar com Especialista')" 
                class="px-7 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-white hover:text-blue-300 font-bold text-sm uppercase tracking-wider rounded-md border border-slate-700 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span class="material-symbols-outlined text-lg text-blue-400">headset_mic</span>
                <span>{{ mergedTranslations['about.hero_btn_specialist'] || 'Fale com um especialista' }}</span>
              </button>
            </div>
          </div>

          <!-- Card de destaque rápido (estilo engenharia) -->
          <div class="lg:col-span-4 hidden lg:block">
            <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl relative">
              <div class="absolute -top-3 right-6 bg-[#004A96] text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded shadow-xs">
                Especificação Segura
              </div>
              <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <span class="material-symbols-outlined text-blue-400">verified</span>
                Padrões de Conformidade
              </h4>
              <ul class="space-y-3 text-xs text-slate-300 font-mono">
                <li class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="text-slate-400">Limpeza Oxigênio:</span>
                  <span class="text-emerald-400 font-bold">Conf. CGA E4.1</span>
                </li>
                <li class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="text-slate-400">Diretiva de Equipamentos:</span>
                  <span class="text-white font-bold">PED 2014/68/EU</span>
                </li>
                <li class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="text-slate-400">Faixa Temperatura:</span>
                  <span class="text-blue-300 font-bold">-196°C a +185°C</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-slate-400">Conexões:</span>
                  <span class="text-white font-bold">NPT | BSP | Flange | Weld</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. QUEM SOMOS -->
      <section class="py-16 md:py-24 bg-white border-b border-slate-200 px-4 md:px-10">
        <div class="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Texto à esquerda -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 text-[#004A96] text-xs font-bold font-mono uppercase tracking-widest">
              <span class="w-1.5 h-6 bg-[#004A96]"></span>
              SOBRE A QUALITEC
            </div>

            <h2 class="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {{ mergedTranslations['about.who_title'] || 'Tecnologia, conhecimento técnico e atendimento próximo' }}
            </h2>

            <p class="text-slate-700 text-base md:text-lg leading-relaxed font-normal">
              {{ mergedTranslations['about.who_text'] || 'A Qualitec C S I M Ltda atua no fornecimento de instrumentação industrial, válvulas e soluções para controle de pressão e processos. Com atendimento técnico-comercial especializado, conectamos indústrias brasileiras a equipamentos de alta confiabilidade para aplicações em criogenia, gases industriais, óleo & gás, energia, alimentos e outros processos críticos.' }}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div class="space-y-1">
                <span class="text-2xl md:text-3xl font-bold text-[#004A96] font-['Hanken_Grotesk']">100%</span>
                <p class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Suporte Técnico Especializado</p>
              </div>
              <div class="space-y-1">
                <span class="text-2xl md:text-3xl font-bold text-[#004A96] font-['Hanken_Grotesk']">CGA E4.1</span>
                <p class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Padrão de Limpeza Oxigênio</p>
              </div>
              <div class="space-y-1">
                <span class="text-2xl md:text-3xl font-bold text-[#004A96] font-['Hanken_Grotesk']">Global</span>
                <p class="text-xs text-slate-600 font-semibold uppercase tracking-wider">Parceiros Internacionais</p>
              </div>
            </div>
          </div>

          <!-- Imagem técnica/equipamento à direita -->
          <div class="lg:col-span-5">
            <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
              <img 
                src="https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png" 
                alt="Equipamentos de alta tecnologia Qualitec" 
                class="w-full h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                @error="handleImgFallback"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-lg border border-white/50 shadow-md">
                <p class="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Engenharia de Aplicação</p>
                <p class="text-[11px] text-slate-600 font-medium">Especificação precisa para válvulas criogênicas e transmissores industriais.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. MARCAS / PARCERIAS -->
      <section class="py-16 md:py-20 bg-slate-50 border-b border-slate-200 px-4 md:px-10">
        <div class="max-w-[1280px] mx-auto text-center space-y-10">
          <div class="max-w-3xl mx-auto space-y-3">
            <span class="text-xs font-bold font-mono text-[#004A96] uppercase tracking-widest">PARCEIROS GLOBAIS</span>
            <h2 class="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {{ mergedTranslations['about.brands_title'] || 'Tecnologia global, suporte técnico local' }}
            </h2>
            <p class="text-slate-600 text-sm md:text-base leading-relaxed">
              {{ mergedTranslations['about.brands_text'] || 'Trabalhamos com fabricantes reconhecidos internacionalmente, oferecendo produtos, documentação técnica e apoio para a definição da configuração mais adequada a cada processo.' }}
            </p>
          </div>

          <!-- Cards das Marcas Representadas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <!-- HEROSE -->
            <div class="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="h-12 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span class="text-2xl font-black font-['Hanken_Grotesk'] text-[#004A96] tracking-tighter">HEROSE</span>
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold rounded uppercase">Alemanha</span>
                </div>
                <h3 class="text-base font-bold text-slate-900">HEROSE GmbH</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Líder mundial em válvulas para criogenia, válvulas de alívio e segurança para gases industriais e LNG.
                </p>
              </div>
              <NuxtLink to="/catalogo?q=HEROSE" class="inline-flex items-center text-xs font-bold text-[#004A96] hover:underline gap-1 pt-2">
                <span>Ver produtos HEROSE</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </NuxtLink>
            </div>

            <!-- Generant -->
            <div class="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="h-12 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span class="text-2xl font-black font-['Hanken_Grotesk'] text-slate-800 tracking-tighter">GENERANT</span>
                  <span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded uppercase">EUA</span>
                </div>
                <h3 class="text-base font-bold text-slate-900">Generant Inc</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Fabricante especializado em válvulas de regulação de pressão, válvulas de retenção e componentes criogênicos.
                </p>
              </div>
              <NuxtLink to="/catalogo?q=Generant" class="inline-flex items-center text-xs font-bold text-[#004A96] hover:underline gap-1 pt-2">
                <span>Ver produtos Generant</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </NuxtLink>
            </div>

            <!-- DataOnline -->
            <div class="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="h-12 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span class="text-2xl font-black font-['Hanken_Grotesk'] text-emerald-700 tracking-tighter">DATAONLINE</span>
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded uppercase">EUA</span>
                </div>
                <h3 class="text-base font-bold text-slate-900">DataOnline LLC</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Sistemas avançados de telemetria industrial para monitoramento contínuo de reservatórios de gases e líquidos.
                </p>
              </div>
              <NuxtLink to="/catalogo?q=DataOnline" class="inline-flex items-center text-xs font-bold text-[#004A96] hover:underline gap-1 pt-2">
                <span>Ver produtos DataOnline</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. SETORES ATENDIDOS (Grid de Cards Técnicos) -->
      <section id="setores" class="py-16 md:py-24 bg-white border-b border-slate-200 px-4 md:px-10">
        <div class="max-w-[1280px] mx-auto space-y-12">
          <div class="text-center max-w-2xl mx-auto space-y-3">
            <span class="text-xs font-bold font-mono text-[#004A96] uppercase tracking-widest">APLICAÇÕES INDUSTRIAIS</span>
            <h2 class="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {{ mergedTranslations['about.sectors_title'] || 'Setores Atendidos' }}
            </h2>
            <p class="text-slate-600 text-sm md:text-base">
              Equipamentos e válvulas configurados rigorosamente conforme os requisitos de cada segmento.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Sector 1 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-blue-100 text-[#004A96] flex items-center justify-center group-hover:bg-[#004A96] group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">ac_unit</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector1_title'] || 'Criogenia e gases industriais' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector1_desc'] || 'Soluções para armazenamento, transporte e gaseificação de O2, N2, Ar, CO2 e gases liquefeitos com máxima segurança estanque.' }}
              </p>
            </div>

            <!-- Sector 2 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">local_fire_department</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector2_title'] || 'Hidrogênio e LNG' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector2_desc'] || 'Equipamentos preparados para temperaturas ultrabaixas e estanqueidade total em novas matrizes energéticas limpas.' }}
              </p>
            </div>

            <!-- Sector 3 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">oil_barrel</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector3_title'] || 'Óleo & Gás' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector3_desc'] || 'Válvulas robustas e transmissores de pressão para aplicações onshore, offshore, refinarias e processamento de hidrocarbonetos.' }}
              </p>
            </div>

            <!-- Sector 4 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector4_title'] || 'Energia' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector4_desc'] || 'Sistemas de controle e proteção contra sobrepressão para hidrelétricas, termelétricas e linhas de vapor crítico.' }}
              </p>
            </div>

            <!-- Sector 5 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">vaccines</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector5_title'] || 'Alimentícia e farmacêutica' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector5_desc'] || 'Instrumentos sanitários com elevado padrão de limpeza para oxigênio e gases de alta pureza sem contaminação.' }}
              </p>
            </div>

            <!-- Sector 6 -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 group">
              <div class="w-12 h-12 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center group-hover:bg-lime-700 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h3 class="text-base font-bold text-slate-900">
                {{ mergedTranslations['about.sector6_title'] || 'Açúcar & Álcool' }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mergedTranslations['about.sector6_desc'] || 'Soluções resistentes a fluidos severos em caldeiras, destilarias, cozimento e usinas de etanol sucroalcooleiras.' }}
              </p>
            </div>

            <!-- Sector 7 (Full span on LG) -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all space-y-3 md:col-span-2 lg:col-span-3 group">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-[#004A96] text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-2xl">precision_manufacturing</span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">
                    {{ mergedTranslations['about.sector7_title'] || 'Processos industriais e automação' }}
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed mt-0.5">
                    {{ mergedTranslations['about.sector7_desc'] || 'Painéis reguladores, transmissores e válvulas para linhas de utilidades, regulação e automação fabril contínua.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. POR QUE ESCOLHER A QUALITEC? -->
      <section class="py-16 md:py-24 bg-slate-900 text-white px-4 md:px-10">
        <div class="max-w-[1280px] mx-auto space-y-12">
          <div class="text-center max-w-2xl mx-auto space-y-3">
            <span class="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest">DIFERENCIAIS</span>
            <h2 class="text-2xl md:text-4xl font-bold text-white tracking-tight">
              {{ mergedTranslations['about.why_title'] || 'Por que escolher a Qualitec?' }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Card 1 -->
            <div class="p-6 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 relative hover:border-blue-500 transition-colors">
              <div class="text-blue-400 font-mono font-bold text-sm">01 / ENGENHARIA</div>
              <h3 class="text-base font-bold text-white">
                {{ mergedTranslations['about.why1_title'] || 'Especialização técnica' }}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ mergedTranslations['about.why1_text'] || 'Apoio na seleção e especificação conforme aplicação, fluido, pressão, temperatura e conexão.' }}
              </p>
            </div>

            <!-- Card 2 -->
            <div class="p-6 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 relative hover:border-blue-500 transition-colors">
              <div class="text-blue-400 font-mono font-bold text-sm">02 / QUALIDADE</div>
              <h3 class="text-base font-bold text-white">
                {{ mergedTranslations['about.why2_title'] || 'Marcas reconhecidas' }}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ mergedTranslations['about.why2_text'] || 'Portfólio de fabricantes globais para aplicações industriais exigentes.' }}
              </p>
            </div>

            <!-- Card 3 -->
            <div class="p-6 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 relative hover:border-blue-500 transition-colors">
              <div class="text-blue-400 font-mono font-bold text-sm">03 / CONFORMIDADE</div>
              <h3 class="text-base font-bold text-white">
                {{ mergedTranslations['about.why3_title'] || 'Documentação completa' }}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ mergedTranslations['about.why3_text'] || 'Datasheets, certificados, desenhos e informações técnicas para engenharia, manutenção e compras.' }}
              </p>
            </div>

            <!-- Card 4 -->
            <div class="p-6 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 relative hover:border-blue-500 transition-colors">
              <div class="text-blue-400 font-mono font-bold text-sm">04 / SUPORTE</div>
              <h3 class="text-base font-bold text-white">
                {{ mergedTranslations['about.why4_title'] || 'Atendimento comercial ágil' }}
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ mergedTranslations['about.why4_text'] || 'Solicitações de cotação estruturadas, acompanhamento e suporte próximo ao cliente.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. COMPROMISSO TÉCNICO (Fundo azul escuro industrial) -->
      <section class="py-20 bg-[#004A96] text-white px-4 md:px-10 relative overflow-hidden">
        <!-- Padrão gráfico blueprint sutil -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        
        <div class="max-w-[1000px] mx-auto text-center relative z-10 space-y-6">
          <span class="px-3 py-1 bg-blue-900/80 text-blue-200 text-xs font-mono font-bold uppercase rounded-full border border-blue-400/30">
            COMPROMISSO QUALITEC
          </span>

          <h2 class="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white font-['Hanken_Grotesk']">
            {{ mergedTranslations['about.commitment_title'] || 'Mais do que fornecer produtos, ajudamos a especificar soluções.' }}
          </h2>

          <p class="text-base md:text-xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
            {{ mergedTranslations['about.commitment_text'] || 'Cada processo possui requisitos próprios. Nossa equipe apoia a avaliação de pressão, temperatura, fluido, materiais, conexões, normas e certificações para que o equipamento selecionado seja adequado à operação.' }}
          </p>
        </div>
      </section>

      <!-- 7. CTA FINAL FORTE -->
      <section class="py-16 md:py-24 bg-white px-4 md:px-10 border-t border-slate-200">
        <div class="max-w-[1100px] mx-auto bg-slate-900 rounded-2xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div class="space-y-4 max-w-2xl text-left">
            <h2 class="text-2xl md:text-4xl font-bold text-white tracking-tight">
              {{ mergedTranslations['about.cta_title'] || 'Precisa de apoio para especificar seu equipamento?' }}
            </h2>
            <p class="text-slate-300 text-sm md:text-base leading-relaxed">
              {{ mergedTranslations['about.cta_text'] || 'Nossa equipe está pronta para entender sua aplicação e indicar a solução mais adequada.' }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <button 
              @click="openContactModal('Solicitar Cotação')" 
              class="px-7 py-3.5 bg-[#004A96] hover:bg-blue-600 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-lg transition-all border-0 cursor-pointer text-center"
            >
              {{ mergedTranslations['about.cta_btn_quote'] || 'Solicitar cotação' }}
            </button>

            <button 
              @click="openContactModal('Falar com Especialista')" 
              class="px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider rounded-md border border-slate-700 transition-all cursor-pointer text-center"
            >
              {{ mergedTranslations['about.cta_btn_specialist'] || 'Falar com um especialista' }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal de Contato / Cotação -->
    <ContactModal
      :open="contactModalOpen"
      :product-name="contactProductName"
      @close="contactModalOpen = false"
    />

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import useTranslations, { type LanguageCode } from '~/composables/useTranslations'
import useSiteSettings from '~/composables/useSiteSettings'
import useCatalog from '~/composables/useCatalog'
import MegaMenu from '~/components/MegaMenu.vue'
import AppFooter from '~/components/AppFooter.vue'
import ContactModal from '~/components/ContactModal.vue'

// i18n
const { currentLang, t, mergedTranslations, setLanguage } = useTranslations()

// Configurações Globais do Site
const { siteSettings, fetchSiteSettings } = useSiteSettings()

// Menu Árvore do MegaMenu
const { megaMenuTree } = useCatalog()

// Estado do Modal de Contato
const contactModalOpen = ref(false)
const contactProductName = ref('')

const openContactModal = (title?: string) => {
  contactProductName.value = title || ''
  contactModalOpen.value = true
}

// Mobile Menu
const mobileMenuOpen = ref(false)

const handleMegaMenuSelect = (selection: { category: string; family?: string; subcategory?: string }) => {
  if (selection.category) {
    navigateTo(`/catalogo?cat=${encodeURIComponent(selection.category)}`)
  }
}

const handleImgFallback = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png'
  }
}

onMounted(() => {
  fetchSiteSettings()
})
</script>

<style scoped>
/* Transição suave de botões e cards */
.seg-card:hover .seg-label {
  background-color: rgba(0, 74, 150, 0.92) !important;
}
.seg-card:hover .seg-label span {
  color: #ffffff !important;
  font-weight: 700 !important;
}
</style>
