<template>
  <div class="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span class="material-symbols-outlined text-blue-600">palette</span>
        Personalização Visual do Site & Banner Principal
      </h2>
      <p class="text-xs text-gray-500 mt-1">
        Customize a imagem/vídeo de fundo do banner principal, frase de destaque, posição do card e estilos do catálogo público.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 text-center text-gray-400">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
      <p class="text-xs">Carregando configurações...</p>
    </div>

    <template v-else>
      <!-- ===== SEÇÃO: PÁGINA NOSSA EMPRESA (INSTITUCIONAL) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-[#004A96]">corporate_fare</span>
            Personalização da Página Nossa Empresa (/nossa-empresa)
          </h3>
          <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">Página Institucional</span>
        </div>

        <p class="text-xs text-slate-600">
          Personalize as imagens, títulos, textos, estatísticas e cores exibidas na página institucional "Nossa Empresa".
        </p>

        <!-- Subseção 1: Hero Banner -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">image</span>
            Hero Banner (Topo da Página)
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Imagem ou Vídeo de Fundo Hero -->
            <div class="space-y-2 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">
                URL da Imagem ou Vídeo de Fundo (MP4 / YouTube / Vimeo / Wix)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="settings.about_hero_bg_url"
                  type="text"
                  placeholder="https://... (.jpg, .png, .mp4, ou URL de vídeo)"
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  @click="triggerAboutUpload('about_hero_bg_url')"
                  :disabled="uploadingAbout === 'about_hero_bg_url'"
                  class="bg-[#004A96] hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingAbout === 'about_hero_bg_url' ? 'sync' : 'upload' }}</span>
                  Upload R2
                </button>
                <input ref="aboutHeroFileInput" type="file" accept="image/*,video/*" class="hidden" @change="handleAboutUpload('about_hero_bg_url', $event)" />
              </div>
              <p class="text-[11px] text-slate-500 italic">
                Suporta links diretos de imagem (.jpg, .png) ou vídeos em loop (.mp4, YouTube, Vimeo, Wix Video).
              </p>
            </div>

            <!-- Opacidade do Fundo -->
            <div class="space-y-1 md:col-span-2">
              <div class="flex justify-between items-center">
                <label class="block text-[11px] font-bold text-slate-700 uppercase">Visibilidade / Nitidez do Fundo</label>
                <span class="text-xs font-mono font-bold text-[#004A96]">{{ settings.about_hero_bg_opacity ?? 70 }}%</span>
              </div>
              <input
                v-model.number="settings.about_hero_bg_opacity"
                type="range"
                min="10"
                max="100"
                step="5"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004A96]"
              />
            </div>

            <!-- Badge Texto Superior -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Badge de Destaque Superior</label>
              <input
                v-model="settings.about_hero_badge_text"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Título do Hero -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título Principal do Hero</label>
              <input
                v-model="settings.about_hero_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Subtítulo / Texto do Hero -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Subtítulo / Descrição</label>
              <textarea
                v-model="settings.about_hero_text"
                rows="2"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <!-- Texto Botão 1 -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Texto Botão 1 (Soluções)</label>
              <input
                v-model="settings.about_hero_btn_solutions_text"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Texto Botão 2 -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Texto Botão 2 (Especialista)</label>
              <input
                v-model="settings.about_hero_btn_specialist_text"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Subseção 2: Seção Quem Somos -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">info</span>
            Seção Quem Somos
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Badge -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Rótulo da Seção (Badge)</label>
              <input
                v-model="settings.about_who_badge_text"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Imagem ou Vídeo Card Equipamentos -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">
                Imagem ou Vídeo do Card Equipamento (Direita)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="settings.about_who_img_url"
                  type="text"
                  placeholder="https://... (.jpg, .png, .mp4, YouTube, Vimeo, Wix)"
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  @click="triggerAboutUpload('about_who_img_url')"
                  :disabled="uploadingAbout === 'about_who_img_url'"
                  class="bg-[#004A96] hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingAbout === 'about_who_img_url' ? 'sync' : 'upload' }}</span>
                  Upload R2
                </button>
                <input ref="aboutWhoFileInput" type="file" accept="image/*,video/*" class="hidden" @change="handleAboutUpload('about_who_img_url', $event)" />
              </div>
              <p class="text-[10px] text-slate-500 italic">
                Aceita URLs de imagem (.jpg, .png) ou vídeos em loop (.mp4, YouTube, Vimeo, Wix).
              </p>
            </div>

            <!-- Título Quem Somos -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título Principal</label>
              <input
                v-model="settings.about_who_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Texto Principal -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Texto Institucional Completo</label>
              <textarea
                v-model="settings.about_who_text"
                rows="4"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <!-- Destaque 1 -->
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 1 (Número)</label>
              <input v-model="settings.about_who_stat1_number" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 1 (Descrição)</label>
              <input v-model="settings.about_who_stat1_label" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>

            <!-- Destaque 2 -->
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 2 (Número)</label>
              <input v-model="settings.about_who_stat2_number" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 2 (Descrição)</label>
              <input v-model="settings.about_who_stat2_label" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>

            <!-- Destaque 3 -->
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 3 (Número)</label>
              <input v-model="settings.about_who_stat3_number" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] font-bold text-slate-700 uppercase">Destaque 3 (Descrição)</label>
              <input v-model="settings.about_who_stat3_label" type="text" class="w-full border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800" />
            </div>
            <!-- Cor de Fundo da Seção Quem Somos -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Cor de Fundo da Seção Quem Somos</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.about_who_bg_color"
                  type="color"
                  class="w-9 h-9 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  v-model="settings.about_who_bg_color"
                  type="text"
                  class="w-28 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Subseção 3: Marcas & Parcerias -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">handshake</span>
            Seção Marcas / Parcerias ("Tecnologia global, suporte técnico local")
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título da Seção Marcas</label>
              <input
                v-model="settings.about_brands_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Descrição da Seção Marcas</label>
              <textarea
                v-model="settings.about_brands_text"
                rows="2"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Cor de Fundo da Seção Marcas</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.about_brands_bg_color"
                  type="color"
                  class="w-9 h-9 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  v-model="settings.about_brands_bg_color"
                  type="text"
                  class="w-28 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Subseção 4: Setores Atendidos -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">factory</span>
            Seção Setores Atendidos
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título da Seção Setores Atendidos</label>
              <input
                v-model="settings.about_sectors_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Descrição da Seção Setores Atendidos</label>
              <textarea
                v-model="settings.about_sectors_text"
                rows="2"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Cor de Fundo da Seção Setores Atendidos</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.about_sectors_bg_color"
                  type="color"
                  class="w-9 h-9 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  v-model="settings.about_sectors_bg_color"
                  type="text"
                  class="w-28 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Subseção 5: Por Que Escolher a Qualitec -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">workspace_premium</span>
            Seção "Por que escolher a Qualitec?"
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título da Seção "Por que escolher a Qualitec?"</label>
              <input
                v-model="settings.about_why_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Descrição da Seção "Por que escolher a Qualitec?"</label>
              <textarea
                v-model="settings.about_why_text"
                rows="2"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Cor de Fundo da Seção "Por que escolher a Qualitec?"</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.about_why_bg_color"
                  type="color"
                  class="w-9 h-9 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  v-model="settings.about_why_bg_color"
                  type="text"
                  class="w-28 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Subseção 3: Compromisso Técnico e CTA Final -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-800 uppercase border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-blue-600">verified_user</span>
            Compromisso Técnico &amp; CTA Final
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Título Compromisso -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título do Compromisso Técnico</label>
              <input
                v-model="settings.about_commitment_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Texto Compromisso -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Texto do Compromisso Técnico</label>
              <textarea
                v-model="settings.about_commitment_text"
                rows="3"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>

            <!-- Cor de Fundo do Compromisso -->
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Cor de Fundo da Seção Compromisso</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="settings.about_commitment_bg_color"
                  type="color"
                  class="w-9 h-9 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  v-model="settings.about_commitment_bg_color"
                  type="text"
                  class="w-28 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono"
                />
              </div>
            </div>

            <!-- Título CTA Final -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Título do CTA Final</label>
              <input
                v-model="settings.about_cta_title"
                type="text"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <!-- Texto CTA Final -->
            <div class="space-y-1 md:col-span-2">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Texto / Chamada do CTA Final</label>
              <textarea
                v-model="settings.about_cta_text"
                rows="2"
                class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none resize-y"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: CARDS DOS PRINCIPAIS SEGMENTOS ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">view_carousel</span>
            Imagens dos Cards de Principais Segmentos (Home)
          </h3>
          <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Página Inicial</span>
        </div>

        <p class="text-xs text-slate-600">
          Configure as imagens exibidas nos 3 cards da seção "Principais segmentos" na página inicial.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Card 1: Criogênia & Gases industriais -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800">Criogênia &amp; Gases</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Card 1</span>
            </div>
            
            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">URL da Imagem</label>
              <div class="flex gap-2">
                <input
                  v-model="settings.segment_img_criogenia"
                  type="text"
                  placeholder="https://..."
                  class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  @click="triggerSegmentUpload('criogenia')"
                  :disabled="uploadingSegment === 'criogenia'"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingSegment === 'criogenia' ? 'sync' : 'upload' }}</span>
                  Upload
                </button>
                <input :ref="(el) => { segmentFileInputs['criogenia'] = el as HTMLInputElement }" type="file" accept="image/*" class="hidden" @change="handleSegmentUpload('criogenia', $event)" />
              </div>
            </div>

            <!-- Preview -->
            <div class="w-full h-28 bg-slate-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
              <img v-if="settings.segment_img_criogenia" :src="settings.segment_img_criogenia" class="w-full h-full object-cover" />
              <span v-else class="text-xs text-gray-400">Sem imagem</span>
            </div>
          </div>

          <!-- Card 2: Óleo & Gás -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800">Óleo &amp; Gás</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Card 2</span>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">URL da Imagem</label>
              <div class="flex gap-2">
                <input
                  v-model="settings.segment_img_oleo_gas"
                  type="text"
                  placeholder="https://..."
                  class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  @click="triggerSegmentUpload('oleo_gas')"
                  :disabled="uploadingSegment === 'oleo_gas'"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingSegment === 'oleo_gas' ? 'sync' : 'upload' }}</span>
                  Upload
                </button>
                <input :ref="(el) => { segmentFileInputs['oleo_gas'] = el as HTMLInputElement }" type="file" accept="image/*" class="hidden" @change="handleSegmentUpload('oleo_gas', $event)" />
              </div>
            </div>

            <!-- Preview -->
            <div class="w-full h-28 bg-slate-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
              <img v-if="settings.segment_img_oleo_gas" :src="settings.segment_img_oleo_gas" class="w-full h-full object-cover" />
              <span v-else class="text-xs text-gray-400">Sem imagem</span>
            </div>
          </div>

          <!-- Card 3: Açúcar e Álcool -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800">Açúcar &amp; Álcool</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Card 3</span>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">URL da Imagem</label>
              <div class="flex gap-2">
                <input
                  v-model="settings.segment_img_sucroalcooleiro"
                  type="text"
                  placeholder="https://..."
                  class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  @click="triggerSegmentUpload('sucroalcooleiro')"
                  :disabled="uploadingSegment === 'sucroalcooleiro'"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingSegment === 'sucroalcooleiro' ? 'sync' : 'upload' }}</span>
                  Upload
                </button>
                <input :ref="(el) => { segmentFileInputs['sucroalcooleiro'] = el as HTMLInputElement }" type="file" accept="image/*" class="hidden" @change="handleSegmentUpload('sucroalcooleiro', $event)" />
              </div>
            </div>

            <!-- Preview -->
            <div class="w-full h-28 bg-slate-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
              <img v-if="settings.segment_img_sucroalcooleiro" :src="settings.segment_img_sucroalcooleiro" class="w-full h-full object-cover" />
              <span v-else class="text-xs text-gray-400">Sem imagem</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: ÁREA DE BUSCA & INPUT DE PESQUISA (COMO PODEMOS TE AJUDAR?) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">search_check</span>
            Área de Busca &amp; Input de Pesquisa ("Como podemos te ajudar?")
          </h3>
          <div class="flex items-center gap-2">
            <button @click="resetBlock('busca')" type="button" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">restart_alt</span>
              Restaurar Padrões da Busca
            </button>
            <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Home Principal</span>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Personalize a altura vertical (padding), a cor de fundo da área, as cores dos títulos e todos os detalhes visuais do campo de pesquisa (formato/modelo, borda, cores e sombras).
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Coluna Esquerda: Controles da Área e do Input -->
          <div class="space-y-5">
            <!-- 1. Dimensões & Fundo da Área -->
            <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex justify-between items-center">
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm text-blue-600">aspect_ratio</span> Dimensões &amp; Fundo da Área</span>
                <span class="w-3.5 h-3.5 rounded-full border shadow-xs" :style="{ backgroundColor: settings.sec_busca_bg || '#e9e9e9' }"></span>
              </h4>

              <!-- Cor de Fundo da Faixa -->
              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor de Fundo da Faixa</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.sec_busca_bg" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                  <input v-model="settings.sec_busca_bg" type="text" placeholder="#e9e9e9" class="flex-1 border border-gray-300 px-3 py-1.5 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                </div>
                <!-- Atalhos -->
                <div class="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Atalhos:</span>
                  <button @click="settings.sec_busca_bg = '#e9e9e9'" type="button" class="px-2 py-0.5 bg-[#e9e9e9] text-gray-800 text-[10px] font-bold rounded border border-gray-300 cursor-pointer">Cinza Padrão (#e9e9e9)</button>
                  <button @click="settings.sec_busca_bg = '#ffffff'" type="button" class="px-2 py-0.5 bg-white text-gray-800 text-[10px] font-bold rounded border border-gray-300 cursor-pointer">Branco Puro</button>
                  <button @click="settings.sec_busca_bg = '#f1f5f9'" type="button" class="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded border border-slate-300 cursor-pointer">Gelo / Slate</button>
                  <button @click="settings.sec_busca_bg = '#1e293b'; settings.sec_busca_title_color = '#ffffff'; settings.sec_busca_subtitle_color = '#94a3b8'; settings.sec_busca_quick_title_color = '#94a3b8'; settings.sec_busca_quick_links_color = '#cbd5e1'" type="button" class="px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded border border-slate-700 cursor-pointer">Escuro</button>
                </div>
              </div>

              <!-- Espaçamento Vertical Superior (Padding Top) -->
              <div class="space-y-1">
                <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                  <span>Espaçamento Superior (Padding Top)</span>
                  <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.sec_busca_ptop ?? 48 }}px</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model.number="settings.sec_busca_ptop" type="range" min="0" max="200" step="2" class="flex-1 accent-blue-600 cursor-pointer" />
                  <input v-model.number="settings.sec_busca_ptop" type="number" min="0" max="200" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                </div>
              </div>

              <!-- Espaçamento Vertical Inferior (Padding Bottom) -->
              <div class="space-y-1">
                <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                  <span>Espaçamento Inferior (Padding Bottom)</span>
                  <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.sec_busca_pbot ?? 56 }}px</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model.number="settings.sec_busca_pbot" type="range" min="0" max="200" step="2" class="flex-1 accent-blue-600 cursor-pointer" />
                  <input v-model.number="settings.sec_busca_pbot" type="number" min="0" max="200" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                </div>
              </div>

              <!-- Altura Mínima da Seção -->
              <div class="space-y-1">
                <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                  <span>Altura Mínima da Seção (Min Height)</span>
                  <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.sec_busca_min_height ?? 0 }}px</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model.number="settings.sec_busca_min_height" type="range" min="0" max="600" step="10" class="flex-1 accent-blue-600 cursor-pointer" />
                  <input v-model.number="settings.sec_busca_min_height" type="number" min="0" max="600" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                </div>
              </div>

              <!-- Faixa Divisória Superior (Linha entre Hero e Busca) -->
              <div class="pt-3 border-t border-gray-100 space-y-2">
                <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-blue-600">horizontal_rule</span>
                    Linha Divisória Superior (Entre Hero e Busca)
                  </span>
                  <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.divider_hero_busca_height ?? 12 }}px</span>
                </div>
                <!-- Atalhos -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Espessura:</span>
                  <button @click="settings.divider_hero_busca_height = 0" type="button" class="px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer" :class="(settings.divider_hero_busca_height ?? 12) === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'">0px (Subir / Sem Linha)</button>
                  <button @click="settings.divider_hero_busca_height = 4" type="button" class="px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer" :class="(settings.divider_hero_busca_height ?? 12) === 4 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'">4px (Fina)</button>
                  <button @click="settings.divider_hero_busca_height = 12" type="button" class="px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer" :class="(settings.divider_hero_busca_height ?? 12) === 12 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'">12px (Padrão)</button>
                  <button @click="settings.divider_hero_busca_height = 24" type="button" class="px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer" :class="(settings.divider_hero_busca_height ?? 12) === 24 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'">24px (Média)</button>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model.number="settings.divider_hero_busca_height" type="range" min="0" max="60" step="1" class="flex-1 accent-blue-600 cursor-pointer" />
                  <input v-model.number="settings.divider_hero_busca_height" type="number" min="0" max="60" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                </div>
                <!-- Cor da Linha Divisória Superior -->
                <div class="flex items-center gap-2 pt-1">
                  <label class="text-[10px] text-gray-500 font-bold uppercase shrink-0">Cor da Linha:</label>
                  <input v-model="settings.divider_hero_busca_bg" type="color" class="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                  <input v-model="settings.divider_hero_busca_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-0.5 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                </div>
              </div>

              <!-- Faixa Divisória Inferior (Linha entre Busca e Segmentos) -->
              <div class="pt-3 border-t border-gray-100 space-y-2">
                <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-blue-600">horizontal_rule</span>
                    Linha Divisória Inferior (Entre Busca e Segmentos)
                  </span>
                  <span class="font-mono text-blue-600 font-bold text-xs">{{ settings.divider_busca_segmentos_height ?? 12 }}px</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model.number="settings.divider_busca_segmentos_height" type="range" min="0" max="60" step="1" class="flex-1 accent-blue-600 cursor-pointer" />
                  <input v-model.number="settings.divider_busca_segmentos_height" type="number" min="0" max="60" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <label class="text-[10px] text-gray-500 font-bold uppercase shrink-0">Cor da Linha:</label>
                  <input v-model="settings.divider_busca_segmentos_bg" type="color" class="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                  <input v-model="settings.divider_busca_segmentos_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-0.5 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- 2. Cores dos Textos da Área -->
            <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-blue-600">format_color_text</span> Cores dos Textos &amp; Links
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Título -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Título Principal</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_title_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_title_color" type="text" placeholder="#333333" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>
                <!-- Subtítulo -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Subtítulo</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_subtitle_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_subtitle_color" type="text" placeholder="#666666" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>
                <!-- Título Links -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Título Links ("Buscas mais...")</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_quick_title_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_quick_title_color" type="text" placeholder="#666666" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>
                <!-- Cor dos Links Rápidos -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Links Rápidos</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_quick_links_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_quick_links_color" type="text" placeholder="#444444" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Modelo & Cores do Input de Pesquisa -->
            <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-emerald-600">tune</span>
                  Modelo &amp; Estilo do Input de Pesquisa
                </h4>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Campo de Busca</span>
              </div>

              <!-- Presets Rápidos de Modelo -->
              <div class="space-y-2">
                <label class="block text-[10px] text-gray-700 font-bold uppercase">Modelos de Input (Presets Rápidos):</label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button @click="applySearchInputPreset('pill')" type="button" class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-xs text-blue-600">radio_button_checked</span> Pílula / Pill
                  </button>
                  <button @click="applySearchInputPreset('default')" type="button" class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-xs text-blue-600">crop_square</span> Suave (Padrão)
                  </button>
                  <button @click="applySearchInputPreset('square')" type="button" class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-none text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-xs text-slate-800">check_box_outline_blank</span> Reto / Retangular
                  </button>
                  <button @click="applySearchInputPreset('qualitec')" type="button" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-700 text-blue-900 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-xs text-blue-700">verified</span> Azul Qualitec
                  </button>
                  <button @click="applySearchInputPreset('elevated')" type="button" class="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md">
                    <span class="material-symbols-outlined text-xs text-purple-600">layers</span> Elevado / Sombra
                  </button>
                  <button @click="applySearchInputPreset('dark')" type="button" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-xs text-amber-400">dark_mode</span> Modo Escuro
                  </button>
                </div>
              </div>

              <!-- Controles Detalhados de Cor do Input -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <!-- Cor de Fundo do Input -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor de Fundo do Input</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_input_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_input_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>

                <!-- Cor da Borda do Input -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor da Borda</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_input_border_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_input_border_color" type="text" placeholder="#93c5fd" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>

                <!-- Cor do Texto -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor do Texto Digitado</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_input_text_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_input_text_color" type="text" placeholder="#1f2937" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>

                <!-- Cor do Ícone da Lupa -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor do Ícone da Lupa</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settings.sec_busca_input_icon_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                    <input v-model="settings.sec_busca_input_icon_color" type="text" placeholder="#2563eb" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                  </div>
                </div>
              </div>

              <!-- Controles de Formato (Arredondamento, Borda, Altura) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <!-- Arredondamento (Border Radius) -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                    <span>Arredondamento (Border Radius)</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.sec_busca_input_border_radius ?? 6 }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input v-model.number="settings.sec_busca_input_border_radius" type="range" min="0" max="50" step="1" class="flex-1 accent-emerald-600 cursor-pointer" />
                    <input v-model.number="settings.sec_busca_input_border_radius" type="number" min="0" max="50" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                  </div>
                  <div class="flex justify-between text-[9px] text-gray-400 font-sans">
                    <span>0px (Reto)</span>
                    <span>6px (Suave)</span>
                    <span>50px (Pílula)</span>
                  </div>
                </div>

                <!-- Espessura da Borda (Border Width) -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                    <span>Espessura da Borda</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.sec_busca_input_border_width ?? 1 }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input v-model.number="settings.sec_busca_input_border_width" type="range" min="0" max="5" step="1" class="flex-1 accent-emerald-600 cursor-pointer" />
                    <input v-model.number="settings.sec_busca_input_border_width" type="number" min="0" max="5" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                  </div>
                </div>

                <!-- Altura / Espessura do Input -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] text-gray-700 font-bold uppercase">
                    <span>Altura do Input</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.sec_busca_input_height ?? 42 }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input v-model.number="settings.sec_busca_input_height" type="range" min="32" max="64" step="2" class="flex-1 accent-emerald-600 cursor-pointer" />
                    <input v-model.number="settings.sec_busca_input_height" type="number" min="32" max="64" class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" />
                  </div>
                </div>

                <!-- Sombra Suave (Shadow) -->
                <div class="space-y-1 flex flex-col justify-center">
                  <label class="block text-[10px] text-gray-700 font-bold uppercase">Sombra Suave</label>
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
                    <input type="checkbox" v-model="settings.sec_busca_input_shadow" class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                    <span>Aplicar sombra suave ao input</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna Direita: Live Preview em Tempo Real -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b pb-2 mb-3">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-blue-600 text-sm">preview</span>
                  Pré-Visualização em Tempo Real da Área &amp; Input
                </span>
                <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">Ao Vivo</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-3">
                Veja abaixo como a faixa e o campo de pesquisa aparecerão na página inicial para os visitantes:
              </p>

              <!-- Simulação da Seção Home com Linhas Divisórias -->
              <div class="border border-gray-300 rounded-lg overflow-hidden shadow-inner">
                <!-- Hero Placeholder (topo) -->
                <div class="bg-slate-700 h-6 px-3 flex items-center justify-between text-[9px] text-slate-300 font-mono">
                  <span>[ Banner Principal Hero ]</span>
                  <span class="text-[8px] opacity-75">Fim do Banner</span>
                </div>

                <!-- Linha Divisória Superior Preview -->
                <div 
                  v-if="(settings.divider_hero_busca_height ?? 12) > 0"
                  class="w-full transition-all border-b border-gray-200/50 flex items-center justify-center"
                  :style="{
                    height: `${Math.max(2, Math.round((settings.divider_hero_busca_height ?? 12) * 0.7))}px`,
                    backgroundColor: settings.divider_hero_busca_bg || '#ffffff'
                  }"
                  :title="`Linha divisória superior: ${settings.divider_hero_busca_height}px`"
                ></div>

                <!-- Conteúdo da Seção de Busca Preview -->
                <div 
                  class="w-full transition-all"
                  :style="{
                    backgroundColor: settings.sec_busca_bg || '#e9e9e9',
                    paddingTop: `${Math.round((settings.sec_busca_ptop ?? 48) * 0.45)}px`,
                    paddingBottom: `${Math.round((settings.sec_busca_pbot ?? 56) * 0.45)}px`
                  }"
                >
                  <div class="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <!-- Lado Esquerdo Preview -->
                    <div class="space-y-1.5">
                      <h3 
                        class="text-base font-semibold leading-tight transition-colors"
                        :style="{ color: settings.sec_busca_title_color || '#333333' }"
                      >
                        Como podemos te ajudar?
                      </h3>
                      <p 
                        class="text-[11px] leading-tight transition-colors"
                        :style="{ color: settings.sec_busca_subtitle_color || '#666666' }"
                      >
                        Utilize a busca rápida e encontre sua necessidade
                      </p>

                      <!-- Input Preview -->
                      <div class="relative w-full pt-1">
                        <span 
                          class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors"
                          :style="{ color: settings.sec_busca_input_icon_color || '#2563eb' }"
                        >
                          search
                        </span>
                        <input 
                          type="text" 
                          readonly
                          placeholder="BUSCAR EQUIPAMENTO..." 
                          class="w-full pl-8 pr-3 text-xs outline-none transition-all cursor-default"
                          :class="settings.sec_busca_input_shadow !== false ? 'shadow-xs' : ''"
                          :style="{
                            backgroundColor: settings.sec_busca_input_bg || '#ffffff',
                            color: settings.sec_busca_input_text_color || '#1f2937',
                            borderWidth: `${settings.sec_busca_input_border_width ?? 1}px`,
                            borderColor: settings.sec_busca_input_border_color || '#93c5fd',
                            borderStyle: (settings.sec_busca_input_border_width ?? 1) > 0 ? 'solid' : 'none',
                            borderRadius: `${settings.sec_busca_input_border_radius ?? 6}px`,
                            height: `${Math.max(30, Math.round((settings.sec_busca_input_height ?? 42) * 0.85))}px`
                          }"
                        />
                      </div>
                    </div>

                    <!-- Lado Direito Preview -->
                    <div class="space-y-1 pl-2 border-l border-gray-300/60 hidden sm:block">
                      <span 
                        class="text-[10px] font-bold block"
                        :style="{ color: settings.sec_busca_quick_title_color || '#666666' }"
                      >
                        Buscas mais utilizadas
                      </span>
                      <div 
                        class="text-[10px] space-y-0.5 leading-snug"
                        :style="{ color: settings.sec_busca_quick_links_color || '#444444' }"
                      >
                        <div>• Contato de vendas / suporte</div>
                        <div>• Válvulas de Segurança</div>
                        <div>• Reparos HEROSE</div>
                        <div>• Transmissores de Pressão</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Linha Divisória Inferior Preview -->
                <div 
                  v-if="(settings.divider_busca_segmentos_height ?? 12) > 0"
                  class="w-full transition-all border-t border-gray-200/50"
                  :style="{
                    height: `${Math.max(2, Math.round((settings.divider_busca_segmentos_height ?? 12) * 0.7))}px`,
                    backgroundColor: settings.divider_busca_segmentos_bg || '#ffffff'
                  }"
                  :title="`Linha divisória inferior: ${settings.divider_busca_segmentos_height}px`"
                ></div>
              </div>
            </div>

            <div class="text-[10px] text-gray-400 font-mono text-center pt-2 border-t border-gray-100">
              Linha Superior: {{ settings.divider_hero_busca_height ?? 12 }}px | Linha Inferior: {{ settings.divider_busca_segmentos_height ?? 12 }}px | Input Radius: {{ settings.sec_busca_input_border_radius }}px
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO 1: CORES E DIMENSÕES DAS SEÇÕES DA HOME ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">view_day</span>
            Cores e Dimensões das Seções da Home
          </h3>
          <div class="flex items-center gap-2">
            <button @click="resetBlock('sections')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">restart_alt</span>
              Restaurar Padrões das Faixas
            </button>
            <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Faixas Horizontais</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 1. Principais segmentos -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex justify-between items-center">
              <span>1. Principais Segmentos</span>
              <span class="w-3 h-3 rounded-full border shadow-xs" :style="{ backgroundColor: settings.sec_segmentos_bg || '#ffffff' }"></span>
            </h4>

            <!-- Cor de Fundo -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor de Fundo</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.sec_segmentos_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.sec_segmentos_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Padding Superior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Superior (Padding Top)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_segmentos_ptop ?? 20 }}px</span>
              </div>
              <input v-model.number="settings.sec_segmentos_ptop" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Padding Inferior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Inferior (Padding Bottom)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_segmentos_pbot ?? 24 }}px</span>
              </div>
              <input v-model.number="settings.sec_segmentos_pbot" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura Mínima -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura Mínima (Min Height)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_segmentos_min_height ?? 0 }}px</span>
              </div>
              <input v-model.number="settings.sec_segmentos_min_height" type="range" min="0" max="800" step="10" class="w-full accent-blue-600 cursor-pointer" />
            </div>
          </div>

          <!-- 2. Novidades -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex justify-between items-center">
              <span>2. Novidades</span>
              <span class="w-3 h-3 rounded-full border shadow-xs" :style="{ backgroundColor: settings.sec_novidades_bg || '#f0f0f0' }"></span>
            </h4>

            <!-- Cor de Fundo -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor de Fundo</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.sec_novidades_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.sec_novidades_bg" type="text" placeholder="#f0f0f0" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Padding Superior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Superior (Padding Top)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_novidades_ptop ?? 36 }}px</span>
              </div>
              <input v-model.number="settings.sec_novidades_ptop" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Padding Inferior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Inferior (Padding Bottom)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_novidades_pbot ?? 44 }}px</span>
              </div>
              <input v-model.number="settings.sec_novidades_pbot" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura Mínima -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura Mínima (Min Height)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_novidades_min_height ?? 0 }}px</span>
              </div>
              <input v-model.number="settings.sec_novidades_min_height" type="range" min="0" max="800" step="10" class="w-full accent-blue-600 cursor-pointer" />
            </div>
          </div>

          <!-- 3. Newsletter -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 class="text-xs font-bold text-slate-800 uppercase border-b pb-2 flex justify-between items-center">
              <span>3. Newsletter</span>
              <span class="w-3 h-3 rounded-full border shadow-xs" :style="{ backgroundColor: settings.sec_newsletter_bg || '#ffffff' }"></span>
            </h4>

            <!-- Cor de Fundo -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor de Fundo</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.sec_newsletter_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.sec_newsletter_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Padding Superior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Superior (Padding Top)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_newsletter_ptop ?? 30 }}px</span>
              </div>
              <input v-model.number="settings.sec_newsletter_ptop" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Padding Inferior -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Inferior (Padding Bottom)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_newsletter_pbot ?? 40 }}px</span>
              </div>
              <input v-model.number="settings.sec_newsletter_pbot" type="range" min="0" max="300" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura Mínima -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura Mínima (Min Height)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.sec_newsletter_min_height ?? 0 }}px</span>
              </div>
              <input v-model.number="settings.sec_newsletter_min_height" type="range" min="0" max="800" step="10" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- E-mails Cadastrados na Newsletter (Gravados no Supabase) -->
            <div class="pt-3 border-t border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-blue-600">mark_email_read</span>
                  Inscritos na Newsletter ({{ subscribers.length }})
                </span>
                <button 
                  type="button" 
                  @click="exportSubscribersCSV" 
                  :disabled="!subscribers.length"
                  class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors border-0 cursor-pointer shadow-2xs"
                  title="Exportar lista de inscritos em formato CSV"
                >
                  <span class="material-symbols-outlined text-xs">download</span>
                  Exportar CSV
                </button>
              </div>

              <!-- Lista de Emails -->
              <div v-if="subscribers.length" class="max-h-36 overflow-y-auto border border-slate-200 rounded bg-slate-50 divide-y divide-slate-200 text-xs">
                <div v-for="(sub, idx) in subscribers" :key="idx" class="px-2.5 py-1.5 flex justify-between items-center hover:bg-slate-100">
                  <span class="font-medium text-slate-800 font-mono text-[11px] truncate max-w-[180px]">{{ sub.email }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      {{ (sub.lang || 'pt').toUpperCase() }}
                    </span>
                    <span class="text-[10px] text-slate-500 font-mono">
                      {{ sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('pt-BR') : '' }}
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-[11px] text-slate-500 italic text-center py-2 bg-slate-50 rounded border border-slate-200 margin-0">
                Nenhum e-mail inscrito ainda. Os e-mails cadastrados pelos visitantes na home aparecerão aqui automaticamente.
              </p>
            </div>
          </div>
        </div>

        <!-- Live Preview das Faixas -->
        <div class="bg-white p-3.5 rounded border border-gray-200 space-y-2">
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pré-Visualização ao Vivo (Sequência das 3 Faixas na Home)</span>
          <div class="border rounded overflow-hidden shadow-2xs font-mono text-[10px]">
            <!-- Segmentos preview -->
            <div
              class="p-2 border-b flex justify-between items-center transition-colors"
              :style="{ backgroundColor: settings.sec_segmentos_bg || '#ffffff', paddingTop: `${(settings.sec_segmentos_ptop ?? 20)/4}px`, paddingBottom: `${(settings.sec_segmentos_pbot ?? 24)/4}px` }"
            >
              <span class="font-sans font-medium text-gray-700">Principais segmentos</span>
              <span class="text-gray-400">Top: {{ settings.sec_segmentos_ptop }}px | Bot: {{ settings.sec_segmentos_pbot }}px</span>
            </div>
            <!-- Novidades preview -->
            <div
              class="p-2 border-b flex justify-between items-center transition-colors"
              :style="{ backgroundColor: settings.sec_novidades_bg || '#f0f0f0', paddingTop: `${(settings.sec_novidades_ptop ?? 36)/4}px`, paddingBottom: `${(settings.sec_novidades_pbot ?? 44)/4}px` }"
            >
              <span class="font-sans font-medium text-gray-700">Novidades</span>
              <span class="text-gray-400">Top: {{ settings.sec_novidades_ptop }}px | Bot: {{ settings.sec_novidades_pbot }}px</span>
            </div>
            <!-- Newsletter preview -->
            <div
              class="p-2 flex justify-between items-center transition-colors"
              :style="{ backgroundColor: settings.sec_newsletter_bg || '#ffffff', paddingTop: `${(settings.sec_newsletter_ptop ?? 30)/4}px`, paddingBottom: `${(settings.sec_newsletter_pbot ?? 40)/4}px` }"
            >
              <span class="font-sans font-medium text-gray-700">Newsletter</span>
              <span class="text-gray-400">Top: {{ settings.sec_newsletter_ptop }}px | Bot: {{ settings.sec_newsletter_pbot }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO 2: CARDS DE PRINCIPAIS SEGMENTOS ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">style</span>
            Cards de Principais Segmentos
          </h3>
          <div class="flex items-center gap-2">
            <button @click="resetBlock('segmentCards')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">restart_alt</span>
              Restaurar Padrões destes Cards
            </button>
            <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Estilo Visual</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Controles -->
          <div class="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
            <!-- Altura da Imagem -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura da Área da Imagem</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.seg_card_img_height ?? 110 }}px</span>
              </div>
              <input v-model.number="settings.seg_card_img_height" type="range" min="60" max="450" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura da Legenda -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura da Faixa da Legenda</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.seg_caption_height ?? 55 }}px</span>
              </div>
              <input v-model.number="settings.seg_caption_height" type="range" min="30" max="150" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Cor de Fundo da Legenda -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor de Fundo da Legenda</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.seg_caption_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.seg_caption_bg" type="text" placeholder="#e8e3e2" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Opacidade da Legenda -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Opacidade da Legenda</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.seg_caption_opacity ?? 100 }}%</span>
              </div>
              <input v-model.number="settings.seg_caption_opacity" type="range" min="0" max="100" step="1" class="w-full accent-blue-600 cursor-pointer" />
              <div class="text-[9px] text-gray-400 font-mono">
                Resultado: <span class="text-blue-600 font-bold">{{ hexToRgba(settings.seg_caption_bg, settings.seg_caption_opacity) }}</span>
              </div>
            </div>

            <!-- Cor do Texto -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor do Texto da Legenda</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.seg_caption_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.seg_caption_color" type="text" placeholder="#444444" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3 flex flex-col justify-between">
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pré-Visualização do Card de Segmento (Com Faixa Sobreposta)</span>
            
            <div class="w-56 mx-auto border rounded overflow-hidden relative shadow-xs bg-slate-200" :style="{ height: `${Math.min(180, (settings.seg_card_img_height ?? 165))}px`, maxWidth: '100%' }">
              <div class="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                [ Imagem do Segmento ]
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 flex items-center justify-center p-2 text-center transition-colors backdrop-blur-xs"
                :style="{
                  height: `${settings.seg_caption_height ?? 48}px`,
                  backgroundColor: hexToRgba(settings.seg_caption_bg || '#ffffff', settings.seg_caption_opacity ?? 82),
                  color: settings.seg_caption_color || '#333333'
                }"
              >
                <span class="text-xs font-normal">Criogênia &amp; Gases</span>
              </div>
            </div>

            <div class="text-[10px] text-gray-400 font-mono text-center">
              Card: {{ settings.seg_card_img_height }}px | Faixa Transparente: {{ settings.seg_caption_height }}px @ {{ settings.seg_caption_opacity ?? 82 }}%
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO 3: CARDS DE NOVIDADES ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">newspaper</span>
            Cards de Novidades
          </h3>
          <div class="flex items-center gap-2">
            <button @click="resetBlock('newsCards')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">restart_alt</span>
              Restaurar Padrões destes Cards
            </button>
            <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Overlay Semitransparente</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Controles -->
          <div class="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
            <!-- Altura Total do Card -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura Total do Card</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.news_card_height ?? 165 }}px</span>
              </div>
              <input v-model.number="settings.news_card_height" type="range" min="100" max="500" step="5" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura da Imagem -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura da Área da Imagem</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.news_img_height ?? 165 }}px</span>
              </div>
              <input v-model.number="settings.news_img_height" type="range" min="60" max="450" step="5" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Altura da Faixa -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Altura da Faixa Transparente</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.news_caption_height ?? 48 }}px</span>
              </div>
              <input v-model.number="settings.news_caption_height" type="range" min="30" max="150" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Opacidade da Faixa -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Opacidade da Faixa</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.news_caption_opacity ?? 82 }}%</span>
              </div>
              <input v-model.number="settings.news_caption_opacity" type="range" min="0" max="100" step="1" class="w-full accent-blue-600 cursor-pointer" />
              <div class="text-[9px] text-gray-400 font-mono">
                Resultado aplicado: <span class="text-blue-600">{{ hexToRgba(settings.news_caption_bg, settings.news_caption_opacity) }}</span>
              </div>
            </div>

            <!-- Cor de Fundo da Faixa -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor Base da Faixa Transparente</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.news_caption_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.news_caption_bg" type="text" placeholder="#ffffff" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Cor do Texto -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor do Texto da Legenda</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.news_caption_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.news_caption_color" type="text" placeholder="#333333" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3 flex flex-col justify-between">
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pré-Visualização do Card de Novidades (Com Faixa Sobreposta)</span>
            
            <div
              class="w-56 mx-auto border rounded overflow-hidden relative shadow-xs bg-slate-200 flex flex-col justify-between"
              :style="{ height: `${Math.min(220, (settings.news_card_height ?? 165))}px`, maxWidth: '100%' }"
            >
              <div
                class="w-full flex items-center justify-center text-[10px] text-slate-400 font-mono transition-all"
                :style="{ height: `${Math.min(180, (settings.news_img_height ?? 165))}px` }"
              >
                [ Imagem do Card ]
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 flex items-center justify-center p-2 text-center transition-colors backdrop-blur-xs"
                :style="{
                  height: `${settings.news_caption_height ?? 48}px`,
                  backgroundColor: hexToRgba(settings.news_caption_bg, settings.news_caption_opacity),
                  color: settings.news_caption_color || '#333333'
                }"
              >
                <span class="text-xs font-normal">Novo Catálogo</span>
              </div>
            </div>

            <div class="text-[10px] text-gray-400 font-mono text-center">
              Card: {{ settings.news_card_height }}px | Overlaid Strip: {{ settings.news_caption_height }}px @ {{ settings.news_caption_opacity }}%
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: BARRA DO MEGA MENU (HEADER DO CATÁLOGO) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">menu</span>
            Barra do Mega Menu (Cor de Fundo &amp; Espessura / Altura)
          </h3>
          <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">Catálogo Público</span>
        </div>

        <p class="text-xs text-slate-600">
          Personalize a cor de fundo da barra do Mega Menu de categorias e ajuste a sua espessura (altura em pixels).
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg border border-gray-200">
          <!-- Cor de Fundo -->
          <div class="space-y-2">
            <label class="block text-xs text-gray-700 font-bold uppercase">Cor de Fundo da Barra</label>
            <div class="flex items-center gap-3">
              <input 
                v-model="settings.mega_menu_bg_color" 
                type="color" 
                class="w-12 h-10 rounded border border-gray-300 cursor-pointer p-0.5" 
              />
              <input 
                v-model="settings.mega_menu_bg_color" 
                type="text" 
                class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none" 
                placeholder="#1d1d1f"
              />
            </div>
            <!-- Atalhos de cor -->
            <div class="flex items-center gap-2 pt-1 flex-wrap">
              <span class="text-[10px] text-gray-500 font-bold uppercase">Atalhos:</span>
              <button @click="settings.mega_menu_bg_color = '#1d1d1f'" type="button" class="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded border border-slate-800 cursor-pointer">Preto Apple (#1d1d1f)</button>
              <button @click="settings.mega_menu_bg_color = '#005db7'" type="button" class="px-2 py-1 bg-[#005db7] text-white text-[10px] font-bold rounded border border-blue-600 cursor-pointer">Azul Qualitec (#005db7)</button>
              <button @click="settings.mega_menu_bg_color = '#101828'" type="button" class="px-2 py-1 bg-[#101828] text-white text-[10px] font-bold rounded border border-slate-700 cursor-pointer">Escuro (#101828)</button>
            </div>
          </div>

          <!-- Altura / Espessura -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs text-gray-700 font-bold">
              <span>Espessura / Altura da Barra</span>
              <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.mega_menu_height ?? 44 }}px</span>
            </div>
            <input 
              v-model.number="settings.mega_menu_height" 
              type="range" 
              min="30" 
              max="80" 
              step="2" 
              class="w-full accent-blue-600 cursor-pointer mt-2" 
            />
            <p class="text-[10px] text-gray-500 font-sans">
              Ajuste a espessura vertical da barra de categorias. O padrão original é <span class="font-mono font-bold">44px</span>.
            </p>
          </div>
        </div>

        <!-- Preview da Barra -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pré-Visualização em Tempo Real da Barra</span>
          <div 
            class="w-full rounded flex items-center justify-center transition-all px-4 overflow-hidden border border-gray-300 shadow-xs"
            :style="{ backgroundColor: settings.mega_menu_bg_color || '#1d1d1f', height: `${settings.mega_menu_height || 44}px` }"
          >
            <div class="flex items-center gap-6 text-xs text-white/90 font-medium uppercase tracking-wider">
              <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> VÁLVULAS DE SEGURANÇA</span>
              <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> VÁLVULAS 3 VIAS</span>
              <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> TRANSMISSORES DE PRESSÃO</span>
            </div>
          </div>
        </div>

        <!-- Controles de Ofuscação do Fundo (Backdrop Blur & Escurecimento) -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span class="material-symbols-outlined text-blue-600 text-base">blur_on</span>
              Nível de Ofuscação do Menu Aberto (Desfoque de Fundo / Backdrop Blur)
            </span>
            <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">Efeito Apple</span>
          </div>

          <p class="text-xs text-slate-600">
            Controle a intensidade do desfoque (blur) e do escurecimento aplicado sobre a página quando o menu de categorias for aberto.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Nível de Desfoque (Blur) -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-gray-700 font-bold">
                <span>Intensidade do Desfoque (Blur)</span>
                <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.mega_menu_blur ?? 20 }}px</span>
              </div>
              <input 
                v-model.number="settings.mega_menu_blur" 
                type="range" 
                min="0" 
                max="50" 
                step="1" 
                class="w-full accent-blue-600 cursor-pointer mt-2" 
              />
              <div class="flex justify-between text-[10px] text-gray-400 font-sans">
                <span>0px (Sem Blur)</span>
                <span>20px (Padrão Apple)</span>
                <span>50px (Máximo)</span>
              </div>
            </div>

            <!-- Opacidade do Escurecimento -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-gray-700 font-bold">
                <span>Escurecimento / Opacidade</span>
                <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.mega_menu_overlay_opacity ?? 48 }}%</span>
              </div>
              <input 
                v-model.number="settings.mega_menu_overlay_opacity" 
                type="range" 
                min="0" 
                max="100" 
                step="2" 
                class="w-full accent-blue-600 cursor-pointer mt-2" 
              />
              <div class="flex justify-between text-[10px] text-gray-400 font-sans">
                <span>0% (Transparente)</span>
                <span>48% (Padrão)</span>
                <span>100% (Opaco)</span>
              </div>
            </div>

            <!-- Cor da Ofuscação -->
            <div class="space-y-2">
              <label class="block text-xs text-gray-700 font-bold uppercase">Cor do Filtro / Overlay</label>
              <div class="flex items-center gap-3">
                <input 
                  v-model="settings.mega_menu_overlay_color" 
                  type="color" 
                  class="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" 
                />
                <input 
                  v-model="settings.mega_menu_overlay_color" 
                  type="text" 
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none" 
                  placeholder="#000000"
                />
              </div>
              <!-- Atalhos -->
              <div class="flex items-center gap-1.5 pt-1 flex-wrap">
                <span class="text-[10px] text-gray-500 font-bold uppercase">Atalhos:</span>
                <button @click="settings.mega_menu_overlay_color = '#000000'; settings.mega_menu_blur = 20; settings.mega_menu_overlay_opacity = 48" type="button" class="px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded border border-slate-700 cursor-pointer">Padrão Apple</button>
                <button @click="settings.mega_menu_overlay_color = '#000000'; settings.mega_menu_blur = 35; settings.mega_menu_overlay_opacity = 70" type="button" class="px-2 py-0.5 bg-black text-white text-[10px] rounded border border-slate-700 cursor-pointer">Forte</button>
                <button @click="settings.mega_menu_overlay_color = '#000000'; settings.mega_menu_blur = 8; settings.mega_menu_overlay_opacity = 25" type="button" class="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] rounded border border-slate-300 cursor-pointer">Suave</button>
                <button @click="settings.mega_menu_blur = 0; settings.mega_menu_overlay_opacity = 0" type="button" class="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] rounded border border-red-200 cursor-pointer">Desativar</button>
              </div>
            </div>
          </div>

          <!-- Preview da Ofuscação -->
          <div class="pt-2">
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Simulação Visual da Ofuscação em Tempo Real</span>
            <div class="relative w-full h-28 rounded-lg overflow-hidden border border-gray-300 shadow-inner flex items-center justify-center">
              <!-- Fundo simulando a página com imagem e texto -->
              <img 
                src="https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png" 
                alt="Simulação da Página" 
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-900/30">
                <span class="text-white font-bold text-sm drop-shadow">Conteúdo da Página Qualitec (Atrás do Menu)</span>
                <span class="text-white/80 text-xs drop-shadow">Válvulas, Reguladores e Instrumentação Industrial</span>
              </div>
              <!-- Camada de Ofuscação Dinâmica -->
              <div 
                class="absolute inset-0 flex items-center justify-center transition-all duration-150"
                :style="{
                  backdropFilter: `blur(${settings.mega_menu_blur ?? 20}px) saturate(180%)`,
                  WebkitBackdropFilter: `blur(${settings.mega_menu_blur ?? 20}px) saturate(180%)`,
                  backgroundColor: hexToRgba(settings.mega_menu_overlay_color || '#000000', settings.mega_menu_overlay_opacity ?? 48)
                }"
              >
                <div class="bg-white/90 text-slate-800 px-3 py-1 rounded text-xs font-mono font-bold shadow-md">
                  Blur: {{ settings.mega_menu_blur ?? 20 }}px | Escurecimento: {{ settings.mega_menu_overlay_opacity ?? 48 }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tipografia dos Botões de Categoria & Famílias & Subcategorias -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <!-- Card: Tipografia dos Botões de Categoria (Abas) -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-blue-600 text-base">tab</span>
                Botões de Categoria (Abas Header)
              </span>
            </div>

            <!-- Fonte & Tamanho -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Fonte</label>
                <select v-model="settings.mega_menu_cat_font_family" class="w-full border border-gray-300 rounded p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none">
                  <option value="system-ui">Padrão Sistema (Sans-serif)</option>
                  <option value="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif">Apple SF Pro</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                  <span>Tamanho</span>
                  <span class="font-mono text-blue-600 font-bold">{{ settings.mega_menu_cat_font_size ?? 12 }}px</span>
                </div>
                <input v-model.number="settings.mega_menu_cat_font_size" type="range" min="9" max="22" step="1" class="w-full accent-blue-600 cursor-pointer mt-1" />
              </div>
            </div>

            <!-- Cor & Estilos -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 items-end">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Cor do Texto</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.mega_menu_cat_color" type="color" class="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <input v-model="settings.mega_menu_cat_color" type="text" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded font-mono text-slate-800 bg-white" />
                </div>
              </div>

              <!-- Format Buttons: Bold, Italic, Uppercase -->
              <div class="flex items-center gap-1">
                <button 
                  type="button"
                  @click="settings.mega_menu_cat_bold = !settings.mega_menu_cat_bold"
                  class="flex-1 py-1.5 text-xs font-bold rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_cat_bold ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Negrito"
                >
                  <strong>N</strong>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_cat_italic = !settings.mega_menu_cat_italic"
                  class="flex-1 py-1.5 text-xs italic rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_cat_italic ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Itálico"
                >
                  <i>I</i>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_cat_uppercase = !settings.mega_menu_cat_uppercase"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_cat_uppercase ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Letras Maiúsculas"
                >
                  AA
                </button>
              </div>
            </div>
          </div>

          <!-- Card: Tipografia das Famílias -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-blue-600 text-base">text_fields</span>
                Tipografia das Famílias (ex: Criogenia)
              </span>
            </div>

            <!-- Fonte & Tamanho -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Família da Fonte</label>
                <select v-model="settings.mega_menu_family_font_family" class="w-full border border-gray-300 rounded p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none">
                  <option value="system-ui">Padrão Sistema (Sans-serif)</option>
                  <option value="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif">Apple SF Pro</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                  <span>Tamanho</span>
                  <span class="font-mono text-blue-600 font-bold">{{ settings.mega_menu_family_font_size ?? 12 }}px</span>
                </div>
                <input v-model.number="settings.mega_menu_family_font_size" type="range" min="9" max="22" step="1" class="w-full accent-blue-600 cursor-pointer mt-1" />
              </div>
            </div>

            <!-- Cor & Estilos -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 items-end">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Cor do Texto</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.mega_menu_family_color" type="color" class="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <input v-model="settings.mega_menu_family_color" type="text" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded font-mono text-slate-800 bg-white" />
                </div>
              </div>

              <!-- Format Buttons: Bold, Italic, Uppercase -->
              <div class="flex items-center gap-1">
                <button 
                  type="button"
                  @click="settings.mega_menu_family_bold = !settings.mega_menu_family_bold"
                  class="flex-1 py-1.5 text-xs font-bold rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_family_bold ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Negrito"
                >
                  <strong>N</strong>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_family_italic = !settings.mega_menu_family_italic"
                  class="flex-1 py-1.5 text-xs italic rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_family_italic ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Itálico"
                >
                  <i>I</i>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_family_uppercase = !settings.mega_menu_family_uppercase"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_family_uppercase ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Letras Maiúsculas"
                >
                  AA
                </button>
              </div>
            </div>
          </div>

          <!-- Card: Tipografia das Subcategorias -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span class="material-symbols-outlined text-blue-600 text-base">format_list_bulleted</span>
                Tipografia das Subcategorias (ex: Válvulas 3 vias)
              </span>
            </div>

            <!-- Fonte & Tamanho -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Família da Fonte</label>
                <select v-model="settings.mega_menu_sub_font_family" class="w-full border border-gray-300 rounded p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none">
                  <option value="system-ui">Padrão Sistema (Sans-serif)</option>
                  <option value="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif">Apple SF Pro</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                  <span>Tamanho</span>
                  <span class="font-mono text-blue-600 font-bold">{{ settings.mega_menu_sub_font_size ?? 13 }}px</span>
                </div>
                <input v-model.number="settings.mega_menu_sub_font_size" type="range" min="10" max="24" step="1" class="w-full accent-blue-600 cursor-pointer mt-1" />
              </div>
            </div>

            <!-- Cor & Estilos -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 items-end">
              <div>
                <label class="block text-[10px] text-gray-500 font-bold uppercase mb-1">Cor do Texto</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.mega_menu_sub_color" type="color" class="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <input v-model="settings.mega_menu_sub_color" type="text" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded font-mono text-slate-800 bg-white" />
                </div>
              </div>

              <!-- Format Buttons: Bold, Italic, Uppercase -->
              <div class="flex items-center gap-1">
                <button 
                  type="button"
                  @click="settings.mega_menu_sub_bold = !settings.mega_menu_sub_bold"
                  class="flex-1 py-1.5 text-xs font-bold rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_sub_bold ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Negrito"
                >
                  <strong>N</strong>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_sub_italic = !settings.mega_menu_sub_italic"
                  class="flex-1 py-1.5 text-xs italic rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_sub_italic ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Itálico"
                >
                  <i>I</i>
                </button>
                <button 
                  type="button"
                  @click="settings.mega_menu_sub_uppercase = !settings.mega_menu_sub_uppercase"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase rounded border cursor-pointer transition-colors"
                  :class="settings.mega_menu_sub_uppercase ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
                  title="Letras Maiúsculas"
                >
                  AA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: CARDS DE EQUIPAMENTOS (CATÁLOGO) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">rounded_corner</span>
            Cards de Equipamentos no Catálogo
          </h3>
          <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">Página Catálogo</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Controles -->
          <div class="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-gray-700 font-bold">
                <span>Arredondamento dos Canto dos Cards (Border Radius)</span>
                <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.card_border_radius ?? 0 }}px</span>
              </div>
              <input 
                v-model.number="settings.card_border_radius" 
                type="range" 
                min="0" 
                max="30" 
                step="1" 
                class="w-full accent-blue-600 cursor-pointer" 
              />
              <p class="text-[10px] text-gray-500 font-sans mt-1">
                Defina <span class="font-mono font-bold">0px</span> para cantos 100% retos/quadrados ou deslize para a direita para bordas arredondadas e suavizadas.
              </p>
            </div>

            <!-- Botões Rápidos de Preset -->
            <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-gray-500 font-bold uppercase">Atalhos:</span>
              <button @click="settings.card_border_radius = 0" type="button" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer">0px (Reto)</button>
              <button @click="settings.card_border_radius = 6" type="button" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer">6px (Suave)</button>
              <button @click="settings.card_border_radius = 12" type="button" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer">12px (Médio)</button>
              <button @click="settings.card_border_radius = 20" type="button" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer">20px (Arredondado)</button>
            </div>

            <!-- Espaçamento Horizontal (Entre colunas de Cards / Gap X) -->
            <div class="space-y-1.5 pt-3 border-t border-gray-200">
              <div class="flex justify-between text-xs text-gray-700 font-bold">
                <span>Distância Horizontal Entre Cards (Gap Lateral)</span>
                <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.catalog_grid_gap_x ?? 20 }}px</span>
              </div>
              <input 
                v-model.number="settings.catalog_grid_gap_x" 
                type="range" 
                min="0" 
                max="80" 
                step="2" 
                class="w-full accent-blue-600 cursor-pointer" 
              />
              <p class="text-[10px] text-gray-500 font-sans">
                Aumente ou diminua o espaço lateral entre as colunas de cards.
              </p>
            </div>

            <!-- Espaçamento Vertical (Entre linhas/grupos de Cards / Gap Y) -->
            <div class="space-y-1.5 pt-2">
              <div class="flex justify-between text-xs text-gray-700 font-bold">
                <span>Distância Vertical Entre Grupos/Linhas (Gap Vertical)</span>
                <span class="font-mono text-blue-600 font-bold text-sm">{{ settings.catalog_grid_gap_y ?? 20 }}px</span>
              </div>
              <input 
                v-model.number="settings.catalog_grid_gap_y" 
                type="range" 
                min="0" 
                max="100" 
                step="2" 
                class="w-full accent-blue-600 cursor-pointer" 
              />
              <p class="text-[10px] text-gray-500 font-sans">
                Aumente ou diminua a distância vertical entre uma linha de cards e a linha abaixo.
              </p>
            </div>
          </div>

          <!-- Live Preview do Grid do Catálogo -->
          <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-3 flex flex-col justify-between">
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pré-Visualização em Tempo Real do Grid (2x2)</span>
            
            <!-- Mini Grid 2x2 -->
            <div 
              class="grid grid-cols-2 p-2 bg-slate-100 rounded border border-slate-200 overflow-hidden"
              :style="{ 
                columnGap: `${Math.min(30, (settings.catalog_grid_gap_x ?? 20) / 2)}px`, 
                rowGap: `${Math.min(30, (settings.catalog_grid_gap_y ?? 20) / 2)}px` 
              }"
            >
              <div 
                v-for="i in 4" 
                :key="i"
                class="bg-white border border-gray-300 overflow-hidden shadow-2xs p-2 transition-all flex flex-col justify-between"
                :style="{ borderRadius: `${(settings.card_border_radius ?? 0) / 1.5}px` }"
              >
                <div class="bg-slate-50 h-8 flex items-center justify-center text-[8px] text-slate-400 font-mono">
                  Card {{ i }}
                </div>
                <div class="bg-emerald-600 h-4 rounded-xs mt-1 flex items-center justify-end px-1 text-[7px] text-white font-bold">
                  06510
                </div>
              </div>
            </div>

            <div class="text-[10px] text-gray-400 font-mono text-center">
              Raio: {{ settings.card_border_radius ?? 0 }}px | Gap X: {{ settings.catalog_grid_gap_x ?? 20 }}px | Gap Y: {{ settings.catalog_grid_gap_y ?? 20 }}px
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO 4: CONFIGURAÇÕES GERAIS DA HOME & HERO BANNER ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">view_carousel</span>
            Fundo do Banner Principal (Hero) &amp; Card de Destaque
          </h3>
          <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Hero Principal</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Coluna da Esquerda: Controles -->
          <div class="space-y-5 bg-white p-4 rounded-lg border border-gray-200">
            <!-- Tipo de Fundo -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Tipo de Mídia de Fundo</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="image" class="text-blue-600 focus:ring-blue-500" />
                  <span>Imagem de Fundo</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="video" class="text-blue-600 focus:ring-blue-500" />
                  <span>Vídeo em Loop (YouTube, Vimeo, MP4)</span>
                </label>
              </div>
            </div>

            <!-- URL Imagem -->
            <div v-if="settings.hero_bg_type === 'image'" class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">URL da Imagem de Fundo</label>
              <div class="flex gap-2">
                <input v-model="settings.hero_bg_image_url" type="text" placeholder="https://..." class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono" />
                <button type="button" @click="triggerBgUpload" :disabled="uploadingBg" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold transition-colors shrink-0 border-0 cursor-pointer flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  Upload
                </button>
              </div>
            </div>

            <!-- URL Vídeo -->
            <div v-else class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">URL do Vídeo (MP4, YouTube ou Vimeo)</label>
              <div class="flex gap-2">
                <input v-model="settings.hero_bg_video_url" type="text" placeholder="https://youtube.com/watch?v=... ou https://..." class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono" />
                <button type="button" @click="triggerBgUpload" :disabled="uploadingBg" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold transition-colors shrink-0 border-0 cursor-pointer flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  Upload MP4
                </button>
              </div>
            </div>

            <!-- Frases do Card por Idioma -->
            <div class="space-y-2 border-t border-slate-200 pt-3">
              <div class="flex items-center justify-between">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                  Frase do Card de Destaque (por Idioma)
                </label>
                <!-- Selector de Abas de Idioma -->
                <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button 
                    type="button" 
                    @click="heroTextTab = 'pt'" 
                    :class="heroTextTab === 'pt' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'"
                    class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer border-0"
                  >
                    🇧🇷 PT
                  </button>
                  <button 
                    type="button" 
                    @click="heroTextTab = 'en'" 
                    :class="heroTextTab === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'"
                    class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer border-0"
                  >
                    🇺🇸 EN
                  </button>
                  <button 
                    type="button" 
                    @click="heroTextTab = 'es'" 
                    :class="heroTextTab === 'es' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'"
                    class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer border-0"
                  >
                    🇪🇸 ES
                  </button>
                </div>
              </div>

              <!-- Campo PT -->
              <div v-show="heroTextTab === 'pt'" class="space-y-1">
                <textarea 
                  v-model="settings.hero_card_text_pt" 
                  @input="settings.hero_card_text = settings.hero_card_text_pt"
                  rows="2" 
                  placeholder="“ O seu desafio diário, nós resolvemos todos os dias... ”"
                  class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans"
                ></textarea>
                <span class="text-[10px] text-slate-500">Frase exibida quando o idioma do site for <b>Português</b>.</span>
              </div>

              <!-- Campo EN -->
              <div v-show="heroTextTab === 'en'" class="space-y-1">
                <textarea 
                  v-model="settings.hero_card_text_en" 
                  rows="2" 
                  placeholder="“ Your daily challenge, we solve every day... ”"
                  class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans"
                ></textarea>
                <span class="text-[10px] text-slate-500">Frase exibida quando o idioma do site for <b>English</b>.</span>
              </div>

              <!-- Campo ES -->
              <div v-show="heroTextTab === 'es'" class="space-y-1">
                <textarea 
                  v-model="settings.hero_card_text_es" 
                  rows="2" 
                  placeholder="“ Su desafío diario, lo resolvemos todos los días... ”"
                  class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans"
                ></textarea>
                <span class="text-[10px] text-slate-500">Frase exibida quando o idioma do site for <b>Español</b>.</span>
              </div>
            </div>

            <!-- Slider Posição Vertical APENAS da Descrição (Texto) -->
            <div class="space-y-1.5 bg-blue-50/70 p-3 rounded border border-blue-200">
              <div class="flex justify-between items-center text-[10px] text-blue-900 font-bold uppercase">
                <span>Posição Vertical APENAS da Descrição: {{ settings.hero_card_text_offset_y || 0 }}px</span>
                <span class="text-blue-600 font-normal">Subir (-) / Descer (+)</span>
              </div>
              <div class="flex items-center gap-3">
                <input 
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="1" 
                  v-model.number="settings.hero_card_text_offset_y" 
                  class="flex-1 accent-blue-600 cursor-pointer" 
                />
                <input 
                  type="number" 
                  min="-100" 
                  max="100" 
                  v-model.number="settings.hero_card_text_offset_y" 
                  class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                />
              </div>
              <p class="text-[10px] text-blue-700 font-medium leading-tight">
                💡 Move <b>apenas a frase descritiva</b> dentro do card, sem alterar a posição do card verde sobre o vídeo.
              </p>
            </div>

            <!-- Modo de Posicionamento -->
            <div class="space-y-1.5 border-t border-slate-200 pt-3">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Modo de Posicionamento do Card</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_card_position_mode" value="custom" class="text-blue-600 focus:ring-blue-500" />
                  <span>Arrasto Livre (Sliders X / Y)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_card_position_mode" value="preset" class="text-blue-600 focus:ring-blue-500" />
                  <span>Grade / Alinhamento Fixo</span>
                </label>
              </div>
            </div>

            <!-- Sliders X / Y (Modo Custom) -->
            <div v-if="settings.hero_card_position_mode === 'custom'" class="space-y-3 bg-white p-3.5 rounded border border-gray-200">
              <!-- Slider Horizontal X -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
                  <span>Posição Horizontal (X): {{ settings.hero_card_offset_x }}%</span>
                  <span class="text-gray-400 font-normal">Esquerda -> Direita</span>
                </div>
                <div class="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="75" 
                    step="1" 
                    v-model.number="settings.hero_card_offset_x" 
                    class="flex-1 accent-blue-600 cursor-pointer" 
                  />
                  <input 
                    type="number" 
                    min="0" 
                    max="75" 
                    v-model.number="settings.hero_card_offset_x" 
                    class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                  />
                </div>
              </div>

              <!-- Slider Vertical Y -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
                  <span>Posição Vertical (Y): {{ settings.hero_card_offset_y }}%</span>
                  <span class="text-gray-400 font-normal">Topo -> Base</span>
                </div>
                <div class="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="75" 
                    step="1" 
                    v-model.number="settings.hero_card_offset_y" 
                    class="flex-1 accent-blue-600 cursor-pointer" 
                  />
                  <input 
                    type="number" 
                    min="0" 
                    max="75" 
                    v-model.number="settings.hero_card_offset_y" 
                    class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                  />
                </div>
              </div>
            </div>

            <!-- Grossura & Dimensões do Card Verde -->
            <div class="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-emerald-600 text-base">aspect_ratio</span>
                  Grossura & Dimensões do Card Verde
                </span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">Tamanho & Espessura</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Largura Máxima do Card -->
                <div class="space-y-1 sm:col-span-2">
                  <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                    <span>Largura do Card (Grossura Horizontal)</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.hero_card_width ?? 576 }}px</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="300" 
                      max="1000" 
                      step="10" 
                      v-model.number="settings.hero_card_width" 
                      class="flex-1 accent-emerald-600 cursor-pointer" 
                    />
                    <input 
                      type="number" 
                      min="300" 
                      max="1000" 
                      v-model.number="settings.hero_card_width" 
                      class="w-16 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                    />
                  </div>
                  <div class="flex justify-between text-[9px] text-gray-400 font-sans">
                    <span>300px (Compacto)</span>
                    <span>576px (Padrão)</span>
                    <span>1000px (Largo)</span>
                  </div>
                </div>

                <!-- Grossura Vertical (Padding Y / Altura Interna) -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                    <span>Espessura Vertical (Padding Y)</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.hero_card_padding_y ?? 32 }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="2" 
                      v-model.number="settings.hero_card_padding_y" 
                      class="flex-1 accent-emerald-600 cursor-pointer" 
                    />
                    <input 
                      type="number" 
                      min="10" 
                      max="90" 
                      v-model.number="settings.hero_card_padding_y" 
                      class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                    />
                  </div>
                </div>

                <!-- Grossura Horizontal (Padding X / Margem Interna) -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                    <span>Espaçamento Lateral (Padding X)</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.hero_card_padding_x ?? 40 }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="2" 
                      v-model.number="settings.hero_card_padding_x" 
                      class="flex-1 accent-emerald-600 cursor-pointer" 
                    />
                    <input 
                      type="number" 
                      min="10" 
                      max="90" 
                      v-model.number="settings.hero_card_padding_x" 
                      class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                    />
                  </div>
                </div>

                <!-- Opacidade do Card Verde -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                    <span>Opacidade / Transparência</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.hero_card_opacity ?? 85 }}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    step="5" 
                    v-model.number="settings.hero_card_opacity" 
                    class="w-full accent-emerald-600 cursor-pointer" 
                  />
                </div>

                <!-- Arredondamento das Bordas (Border Radius) -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase">
                    <span>Arredondamento das Bordas</span>
                    <span class="font-mono text-emerald-600 font-bold text-xs">{{ settings.hero_card_border_radius ?? 8 }}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    step="2" 
                    v-model.number="settings.hero_card_border_radius" 
                    class="w-full accent-emerald-600 cursor-pointer" 
                  />
                </div>

                <!-- Cor do Card Verde -->
                <div class="space-y-1 sm:col-span-2">
                  <label class="block text-[10px] text-gray-700 font-bold uppercase">Cor de Fundo do Card</label>
                  <div class="flex items-center gap-3">
                    <input 
                      v-model="settings.hero_card_bg_color" 
                      type="color" 
                      class="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5" 
                    />
                    <input 
                      v-model="settings.hero_card_bg_color" 
                      type="text" 
                      class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 font-mono focus:ring-1 focus:ring-emerald-600 focus:outline-none" 
                      placeholder="#74b934"
                    />
                  </div>
                  <!-- Atalhos -->
                  <div class="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span class="text-[10px] text-gray-500 font-bold uppercase">Presets:</span>
                    <button @click="settings.hero_card_bg_color = '#74b934'; settings.hero_card_width = 576; settings.hero_card_padding_y = 32; settings.hero_card_padding_x = 40" type="button" class="px-2 py-0.5 bg-[#74b934] text-white text-[10px] font-bold rounded border border-emerald-600 cursor-pointer">Verde Padrão</button>
                    <button @click="settings.hero_card_width = 720; settings.hero_card_padding_y = 48; settings.hero_card_padding_x = 56" type="button" class="px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded border border-slate-700 cursor-pointer">Card Encorpado / Grosso</button>
                    <button @click="settings.hero_card_width = 420; settings.hero_card_padding_y = 20; settings.hero_card_padding_x = 24" type="button" class="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] rounded border border-slate-300 cursor-pointer">Card Fino / Compacto</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna da Direita: Preview Interativo -->
          <div class="space-y-3">
            <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-blue-600">touch_app</span> Pré-visualização Interativa (Arraste o Card)</span>
              <div class="flex items-center gap-2">
                <div class="flex gap-0.5 text-[9px]">
                  <button type="button" @click="previewLang = 'pt'" :class="previewLang === 'pt' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700'" class="px-1.5 py-0.5 rounded cursor-pointer border-0">PT</button>
                  <button type="button" @click="previewLang = 'en'" :class="previewLang === 'en' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700'" class="px-1.5 py-0.5 rounded cursor-pointer border-0">EN</button>
                  <button type="button" @click="previewLang = 'es'" :class="previewLang === 'es' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700'" class="px-1.5 py-0.5 rounded cursor-pointer border-0">ES</button>
                </div>
                <span class="text-blue-700 font-bold">X: {{ settings.hero_card_offset_x || 0 }}% | Y: {{ settings.hero_card_offset_y || 0 }}%</span>
              </div>
            </label>

            <div 
              ref="previewContainerRef"
              @mousedown="handleCardDragStart"
              class="w-full bg-slate-800 rounded-lg overflow-hidden relative shadow-inner cursor-crosshair h-56 select-none"
            >
              <!-- Video preview -->
              <video 
                v-if="settings.hero_bg_type === 'video' && settings.hero_bg_video_url" 
                :src="settings.hero_bg_video_url"
                autoplay 
                loop 
                muted 
                playsinline
                class="w-full h-full object-cover pointer-events-none"
              ></video>
              <!-- Image preview -->
              <img 
                v-else
                :src="settings.hero_bg_image_url || 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png'" 
                alt="Hero Fundo"
                class="w-full h-full object-cover pointer-events-none"
              />

              <!-- Card Verde Arrastável na Prévia -->
              <div 
                class="absolute shadow-lg border border-white/20 transition-all duration-75"
                :style="{
                  left: `${settings.hero_card_offset_x || 18}%`,
                  top: `${settings.hero_card_offset_y || 45}%`,
                  bottom: settings.hero_card_extend_bottom ? '0px' : 'auto',
                  ...getCardBgStyle(settings.hero_card_bg_color, settings.hero_card_opacity),
                  color: settings.hero_card_text_color || '#ffffff',
                  borderRadius: `${Math.round((settings.hero_card_border_radius ?? 8) * 0.43)}px`,
                  paddingTop: `${Math.round((settings.hero_card_padding_y ?? 32) * 0.43)}px`,
                  paddingBottom: `${Math.round((settings.hero_card_padding_y ?? 32) * 0.43)}px`,
                  paddingLeft: `${Math.round((settings.hero_card_padding_x ?? 40) * 0.43)}px`,
                  paddingRight: `${Math.round((settings.hero_card_padding_x ?? 40) * 0.43)}px`,
                  maxWidth: `${Math.round((settings.hero_card_width ?? 576) * 0.43)}px`,
                  width: '100%'
                }"
              >
                <p 
                  class="text-[10px] font-semibold leading-snug drop-shadow-sm transition-transform duration-75"
                  :style="{ transform: `translateY(${settings.hero_card_text_offset_y || 0}px)` }"
                >
                  {{ heroPreviewText }}
                </p>
              </div>
            </div>
            
            <p class="text-[10px] text-gray-400 font-mono text-center">
              Clique e arraste sobre o banner para ajustar a posição (X, Y) em tempo real.
            </p>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO 5: PERSONALIZAÇÃO DO RODAPÉ (FOOTER) & 11 FRASES ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">bottom_panel_open</span>
            Personalização Visual do Rodapé (Footer) &amp; 11 Frases
          </h3>
          <div class="flex items-center gap-2">
            <button @click="resetBlock('footer')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">restart_alt</span>
              Restaurar Padrões do Rodapé
            </button>
            <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Rodapé Completo</span>
          </div>
        </div>

        <!-- Controles Gerais do Rodapé -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
            1. Dimensões &amp; Cores Gerais do Container do Rodapé
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Cor de Fundo -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor de Fundo do Rodapé</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.footer_bg" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.footer_bg" type="text" placeholder="#eeebe9" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Cor da Linha/Borda Superior -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-500 font-bold uppercase">Cor da Borda Superior</label>
              <div class="flex items-center gap-2">
                <input v-model="settings.footer_border_top_color" type="color" class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" />
                <input v-model="settings.footer_border_top_color" type="text" placeholder="#c2c6d3" class="flex-1 border border-gray-300 px-2 py-1 text-xs rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>

            <!-- Espaçamento Superior (Padding Top) -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Superior (Padding Top)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.footer_ptop ?? 28 }}px</span>
              </div>
              <input v-model.number="settings.footer_ptop" type="range" min="0" max="150" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>

            <!-- Espaçamento Inferior (Padding Bottom) -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-600 font-semibold">
                <span>Espaçamento Inferior (Padding Bottom)</span>
                <span class="font-mono text-blue-600 font-bold">{{ settings.footer_pbot ?? 28 }}px</span>
              </div>
              <input v-model.number="settings.footer_pbot" type="range" min="0" max="150" step="2" class="w-full accent-blue-600 cursor-pointer" />
            </div>
          </div>
        </div>

        <!-- Personalização Individual das 11 Frases -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Personalização das 11 Frases do Rodapé (Texto, Fonte, Cor, Posição X / Y)
            </h4>
            <span class="text-[10px] text-gray-400 font-mono">11 Frases Mapeadas</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div 
              v-for="i in 11" 
              :key="i" 
              class="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3 shadow-2xs hover:border-blue-300 transition-colors"
            >
              <!-- Cabecalho do Card da Frase -->
              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <span class="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">short_text</span>
                  {{ phraseLabels?.[i] || ('Frase #' + i) }}
                </span>
                <span class="text-[9px] bg-slate-200 text-slate-700 font-bold font-mono px-1.5 py-0.5 rounded">
                  Frase #{{ i }}
                </span>
              </div>

              <!-- Campo Texto -->
              <div class="space-y-1">
                <label class="block text-[10px] text-gray-600 font-bold uppercase">Texto da Frase</label>
                <input 
                  type="text" 
                  v-model="(settings as any)['footer_p' + i + '_text']" 
                  class="w-full border border-gray-300 px-2.5 py-1.5 text-xs rounded bg-white font-sans text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <!-- Fonte, Estilo e Cor -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <!-- Fonte -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Tipo de Fonte</label>
                  <select 
                    v-model="(settings as any)['footer_p' + i + '_font']" 
                    class="w-full border border-gray-300 px-2 py-1.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option v-for="font in fontOptions" :key="font" :value="font">{{ font }}</option>
                  </select>
                </div>

                <!-- Negrito & Itálico Toggles -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Estilo do Texto</label>
                  <div class="flex items-center gap-1 h-[32px]">
                    <button 
                      type="button" 
                      @click="(settings as any)['footer_p' + i + '_bold'] = !(settings as any)['footer_p' + i + '_bold']" 
                      :class="(settings as any)['footer_p' + i + '_bold'] ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border-gray-300'"
                      class="flex-1 h-full rounded text-xs transition-colors border flex items-center justify-center cursor-pointer font-extrabold"
                      title="Ativar / Desativar Negrito (Bold)"
                    >
                      B
                    </button>
                    <button 
                      type="button" 
                      @click="(settings as any)['footer_p' + i + '_italic'] = !(settings as any)['footer_p' + i + '_italic']" 
                      :class="(settings as any)['footer_p' + i + '_italic'] ? 'bg-slate-900 text-white font-bold italic border-slate-900 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border-gray-300'"
                      class="flex-1 h-full rounded text-xs transition-colors border flex items-center justify-center cursor-pointer italic font-serif"
                      title="Ativar / Desativar Itálico (Italic)"
                    >
                      I
                    </button>
                  </div>
                </div>

                <!-- Cor da Fonte -->
                <div class="space-y-1">
                  <label class="block text-[10px] text-gray-600 font-bold uppercase">Cor do Texto</label>
                  <div class="flex items-center gap-1.5">
                    <input 
                      type="color" 
                      v-model="(settings as any)['footer_p' + i + '_color']" 
                      class="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer shrink-0 rounded-full" 
                    />
                    <input 
                      type="text" 
                      v-model="(settings as any)['footer_p' + i + '_color']" 
                      class="w-full border border-gray-300 px-1 py-1.5 text-[11px] rounded bg-white text-center font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              <!-- Tamanho da Fonte (px) -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] text-gray-600 font-semibold">
                  <span>Tamanho da Fonte</span>
                  <span class="font-mono text-blue-600 font-bold">{{ (settings as any)['footer_p' + i + '_size'] }}px</span>
                </div>
                <div class="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="8" 
                    max="40" 
                    step="1" 
                    v-model.number="(settings as any)['footer_p' + i + '_size']" 
                    class="flex-1 accent-blue-600 cursor-pointer" 
                  />
                  <input 
                    type="number" 
                    min="8" 
                    max="40" 
                    v-model.number="(settings as any)['footer_p' + i + '_size']" 
                    class="w-14 border border-gray-300 p-1 text-xs text-center rounded bg-white font-mono" 
                  />
                </div>
              </div>

              <!-- Deslocamento Horizontal X e Vertical Y -->
              <div class="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                <!-- Deslocamento X -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[9px] text-gray-600 font-semibold uppercase">
                    <span>Posição Horiz. (X)</span>
                    <span class="font-mono text-blue-600 font-bold">{{ (settings as any)['footer_p' + i + '_offset_x'] || 0 }}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    step="1" 
                    v-model.number="(settings as any)['footer_p' + i + '_offset_x']" 
                    class="w-full accent-blue-600 cursor-pointer" 
                  />
                </div>

                <!-- Deslocamento Y -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[9px] text-gray-600 font-semibold uppercase">
                    <span>Posição Vert. (Y)</span>
                    <span class="font-mono text-blue-600 font-bold">{{ (settings as any)['footer_p' + i + '_offset_y'] || 0 }}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    step="1" 
                    v-model.number="(settings as any)['footer_p' + i + '_offset_y']" 
                    class="w-full accent-blue-600 cursor-pointer" 
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ===== BOTÃO SALVAR TODAS AS CONFIGURAÇÕES VISUAIS ===== -->
      <div class="pt-4 border-t border-gray-200 flex justify-between items-center">
        <NuxtLink to="/" target="_blank" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-decoration-none">
          <span class="material-symbols-outlined text-sm">open_in_new</span>
          Visualizar na Home Pública
        </NuxtLink>

        <button
          @click="saveSettings"
          :disabled="saving"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-0 cursor-pointer shadow-md"
        >
          <span class="material-symbols-outlined text-base">{{ saving ? 'sync' : 'save' }}</span>
          {{ saving ? 'Salvando...' : 'Salvar Alterações Visuais da Home' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { formatApiErrorMessage } from '../utils/formatError'

const props = defineProps<{
  triggerToast?: (msg: string, type: 'success' | 'error') => void
}>()

const supabase = useSupabaseClient()
const { fetchSiteSettings } = useSiteSettings()

const loading = ref(true)
const saving = ref(false)
const uploadingBg = ref(false)
const bgFileInput = ref<HTMLInputElement | null>(null)
const uploadingLogo = ref(false)
const logoFileInput = ref<HTMLInputElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
const isDraggingCard = ref(false)

const fontOptions = [
  'Inter', 'Roboto', 'Arial', 'Verdana', 'Helvetica', 'Georgia', 'Tahoma',
  'Trebuchet MS', 'Courier New', 'Times New Roman', 'Segoe UI', 'system-ui'
]

const fontSizeOptions = [
  '8px', '9px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px'
]

const phraseLabels: Record<number, string> = {
  1: 'Frase 1: Razão Social / Nome da Empresa',
  2: 'Frase 2: Endereço Linha 1',
  3: 'Frase 3: Endereço Linha 2',
  4: 'Frase 4: Telefone de Contato',
  5: 'Frase 5: E-mail de Vendas',
  6: 'Frase 6: Direitos Reservados / Copyright',
  7: 'Frase 7: Título Coluna Direita (Representantes)',
  8: 'Frase 8: Parceiro / Marca 1 (HEROSE)',
  9: 'Frase 9: Parceiro / Marca 2 (Generant)',
  10: 'Frase 10: Parceiro / Marca 3 (DataOnline)',
  11: 'Frase 11: Texto do Botão de Suporte (Flutuante)'
}

interface SiteSettings {
  // Logotipo do Cabeçalho
  header_logo_url: string
  header_logo_height: number
  header_logo_offset_x: number
  header_logo_offset_y: number
  // Botão "Ver Documentação"
  btn_doc_bg_color: string
  btn_doc_hover_color: string
  btn_doc_text_color: string
  btn_doc_font_family: string
  btn_doc_font_size: string
  btn_doc_bold: boolean
  btn_doc_italic: boolean
  btn_doc_uppercase: boolean
  btn_doc_border_radius: string
  btn_doc_text: string
  // Tag da Categoria
  card_tag_font_size: string
  card_tag_font_family: string
  card_tag_bold: boolean
  card_tag_italic: boolean
  // Tabela de Especificações
  card_specs_bg_color: string
  card_specs_label_color: string
  card_specs_value_color: string
  card_specs_font_family: string
  card_specs_label_font_size: string
  card_specs_value_font_size: string
  // Banner Principal (Hero)
  hero_bg_type: 'image' | 'video'
  hero_bg_image_url: string
  hero_bg_video_url: string
  hero_card_text: string
  hero_card_text_pt: string
  hero_card_text_en: string
  hero_card_text_es: string
  hero_card_text_offset_y: number
  hero_card_bg_color: string
  hero_card_text_color: string
  hero_card_position: 'left' | 'center' | 'right'
  hero_card_vertical_align: 'top' | 'center' | 'bottom'
  hero_card_position_mode: 'custom' | 'preset'
  hero_card_offset_x: number
  hero_card_offset_y: number
  hero_card_opacity: number
  hero_card_extend_bottom: boolean
  hero_card_width: number
  hero_card_padding_y: number
  hero_card_padding_x: number
  hero_card_border_radius: number
  // Segment Cards (Home)
  segment_img_criogenia: string
  segment_img_oleo_gas: string
  segment_img_sucroalcooleiro: string
  // Cores e Dimensões das Seções da Home
  sec_busca_bg: string
  sec_busca_ptop: number
  sec_busca_pbot: number
  sec_busca_min_height: number
  sec_busca_title_color: string
  sec_busca_subtitle_color: string
  sec_busca_quick_title_color: string
  sec_busca_quick_links_color: string
  sec_busca_input_bg: string
  sec_busca_input_text_color: string
  sec_busca_input_border_color: string
  sec_busca_input_icon_color: string
  sec_busca_input_placeholder_color: string
  sec_busca_input_border_radius: number
  sec_busca_input_border_width: number
  sec_busca_input_height: number
  sec_busca_input_shadow: boolean
  // Faixas Divisórias (Linhas brancas entre seções)
  divider_hero_busca_height: number
  divider_hero_busca_bg: string
  divider_busca_segmentos_height: number
  divider_busca_segmentos_bg: string
  sec_segmentos_bg: string
  sec_segmentos_ptop: number
  sec_segmentos_pbot: number
  sec_segmentos_min_height: number
  sec_novidades_bg: string
  sec_novidades_ptop: number
  sec_novidades_pbot: number
  sec_novidades_min_height: number
  sec_newsletter_bg: string
  sec_newsletter_ptop: number
  sec_newsletter_pbot: number
  sec_newsletter_min_height: number
  // Estilos dos Cards de Equipamento (Catálogo)
  card_border_radius: number
  catalog_grid_gap_x: number
  catalog_grid_gap_y: number
  // Barra do Mega Menu (Header)
  mega_menu_bg_color: string
  mega_menu_height: number
  mega_menu_blur: number
  mega_menu_overlay_opacity: number
  mega_menu_overlay_color: string
  // Botões de Categoria (Abas)
  mega_menu_cat_font_family: string
  mega_menu_cat_font_size: number
  mega_menu_cat_color: string
  mega_menu_cat_bold: boolean
  mega_menu_cat_italic: boolean
  mega_menu_cat_uppercase: boolean
  // Família no Mega Menu
  mega_menu_family_font_family: string
  mega_menu_family_font_size: number
  mega_menu_family_color: string
  mega_menu_family_bold: boolean
  mega_menu_family_italic: boolean
  mega_menu_family_uppercase: boolean
  // Subcategoria no Mega Menu
  mega_menu_sub_font_family: string
  mega_menu_sub_font_size: number
  mega_menu_sub_color: string
  mega_menu_sub_bold: boolean
  mega_menu_sub_italic: boolean
  mega_menu_sub_uppercase: boolean
  // Cards de Principais Segmentos
  seg_card_img_height: number
  seg_caption_bg: string
  seg_caption_opacity: number
  seg_caption_height: number
  seg_caption_color: string
  // Cards de Novidades
  news_card_height: number
  news_img_height: number
  news_caption_bg: string
  news_caption_opacity: number
  news_caption_height: number
  news_caption_color: string
  footer_bg: string
  footer_ptop: number
  footer_pbot: number
  footer_border_top_color: string
  footer_p1_text: string
  footer_p1_font: string
  footer_p1_size: number
  footer_p1_color: string
  footer_p1_offset_x: number
  footer_p1_offset_y: number
  footer_p1_bold: boolean
  footer_p1_italic: boolean
  footer_p2_text: string
  footer_p2_font: string
  footer_p2_size: number
  footer_p2_color: string
  footer_p2_offset_x: number
  footer_p2_offset_y: number
  footer_p2_bold: boolean
  footer_p2_italic: boolean
  footer_p3_text: string
  footer_p3_font: string
  footer_p3_size: number
  footer_p3_color: string
  footer_p3_offset_x: number
  footer_p3_offset_y: number
  footer_p3_bold: boolean
  footer_p3_italic: boolean
  footer_p4_text: string
  footer_p4_font: string
  footer_p4_size: number
  footer_p4_color: string
  footer_p4_offset_x: number
  footer_p4_offset_y: number
  footer_p4_bold: boolean
  footer_p4_italic: boolean
  footer_p5_text: string
  footer_p5_font: string
  footer_p5_size: number
  footer_p5_color: string
  footer_p5_offset_x: number
  footer_p5_offset_y: number
  footer_p5_bold: boolean
  footer_p5_italic: boolean
  footer_p6_text: string
  footer_p6_font: string
  footer_p6_size: number
  footer_p6_color: string
  footer_p6_offset_x: number
  footer_p6_offset_y: number
  footer_p6_bold: boolean
  footer_p6_italic: boolean
  footer_p7_text: string
  footer_p7_font: string
  footer_p7_size: number
  footer_p7_color: string
  footer_p7_offset_x: number
  footer_p7_offset_y: number
  footer_p7_bold: boolean
  footer_p7_italic: boolean
  footer_p8_text: string
  footer_p8_font: string
  footer_p8_size: number
  footer_p8_color: string
  footer_p8_offset_x: number
  footer_p8_offset_y: number
  footer_p8_bold: boolean
  footer_p8_italic: boolean
  footer_p9_text: string
  footer_p9_font: string
  footer_p9_size: number
  footer_p9_color: string
  footer_p9_offset_x: number
  footer_p9_offset_y: number
  footer_p9_bold: boolean
  footer_p9_italic: boolean
  footer_p10_text: string
  footer_p10_font: string
  footer_p10_size: number
  footer_p10_color: string
  footer_p10_offset_x: number
  footer_p10_offset_y: number
  footer_p10_bold: boolean
  footer_p10_italic: boolean
  footer_p11_text: string
  footer_p11_font: string
  footer_p11_size: number
  footer_p11_color: string
  footer_p11_offset_x: number
  footer_p11_offset_y: number
  footer_p11_bold: boolean
  footer_p11_italic: boolean
}

const defaultSettings: SiteSettings = {
  header_logo_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/1785536986887_0a3ga6_qualitec_logo.png',
  header_logo_height: 48,
  header_logo_offset_x: 0,
  header_logo_offset_y: 0,
  btn_doc_bg_color: '#376092',
  btn_doc_hover_color: '#2b4c74',
  btn_doc_text_color: '#ffffff',
  btn_doc_font_family: 'system-ui',
  btn_doc_font_size: '12px',
  btn_doc_bold: true,
  btn_doc_italic: false,
  btn_doc_uppercase: true,
  btn_doc_border_radius: '4px',
  btn_doc_text: 'VER DOCUMENTAÇÃO',
  card_tag_font_size: '11px',
  card_tag_font_family: 'system-ui',
  card_tag_bold: true,
  card_tag_italic: false,
  card_specs_bg_color: '#f3f4f6',
  card_specs_label_color: '#374151',
  card_specs_value_color: '#111827',
  card_specs_font_family: 'system-ui',
  card_specs_label_font_size: '11px',
  card_specs_value_font_size: '12px',
  card_border_radius: 0,
  catalog_grid_gap_x: 20,
  catalog_grid_gap_y: 20,
  mega_menu_bg_color: '#ffffff',
  mega_menu_height: 44,
  mega_menu_blur: 12,
  mega_menu_overlay_opacity: 35,
  mega_menu_overlay_color: '#000000',
  mega_menu_cat_font_family: 'system-ui',
  mega_menu_cat_font_size: 12,
  mega_menu_cat_color: '#1e293b',
  mega_menu_cat_bold: true,
  mega_menu_cat_italic: false,
  mega_menu_cat_uppercase: true,
  mega_menu_family_font_family: 'system-ui',
  mega_menu_family_font_size: 11,
  mega_menu_family_color: '#64748b',
  mega_menu_family_bold: true,
  mega_menu_family_italic: false,
  mega_menu_family_uppercase: true,
  mega_menu_sub_font_family: 'system-ui',
  mega_menu_sub_font_size: 13,
  mega_menu_sub_color: '#0f172a',
  mega_menu_sub_bold: false,
  mega_menu_sub_italic: false,
  mega_menu_sub_uppercase: false,
  hero_bg_type: 'video',
  hero_bg_image_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/categories/cover_geral.png',
  hero_bg_video_url: 'https://video.wixstatic.com/video/e6a741_2b669bc80a4a48fd9ada437c1e0827b7/720p/mp4/file.mp4',
  hero_card_text: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_text_pt: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_text_en: '“ Your daily challenge, we solve every day with safety and reliability “',
  hero_card_text_es: '“ Su desafío diario, lo resolvemos todos los días con segurança e confiabilidade “',
  hero_card_text_offset_y: 0,
  hero_card_bg_color: '#74b934',
  hero_card_text_color: '#ffffff',
  hero_card_position: 'left',
  hero_card_vertical_align: 'center',
  hero_card_position_mode: 'custom',
  hero_card_offset_x: 10,
  hero_card_offset_y: 55,
  hero_card_opacity: 85,
  hero_card_extend_bottom: true,
  hero_card_width: 576,
  hero_card_padding_y: 32,
  hero_card_padding_x: 40,
  hero_card_border_radius: 8,
  segment_img_criogenia: 'https://static.wixstatic.com/media/e6a741_331a1ffce9944bb7b63fdd7bcea3096f~mv2.png/v1/fill/w_297,h_182,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Industrial%20gases.png',
  segment_img_oleo_gas: 'https://static.wixstatic.com/media/e6a741_18a0c052d6744b61bc7bc6077b909bde~mv2.jpg/v1/fill/w_297,h_182,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Oleo-e-Gas.jpg',
  segment_img_sucroalcooleiro: 'https://static.wixstatic.com/media/e6a741_52b40cd97aa94e688dc4c1d6b6ffc3fd~mv2.jpg/v1/fill/w_297,h_182,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Acucar-e-Alcool.jpg',
  sec_busca_bg: '#e9e9e9',
  sec_busca_ptop: 48,
  sec_busca_pbot: 56,
  sec_busca_min_height: 0,
  sec_busca_title_color: '#333333',
  sec_busca_subtitle_color: '#666666',
  sec_busca_quick_title_color: '#666666',
  sec_busca_quick_links_color: '#444444',
  sec_busca_input_bg: '#ffffff',
  sec_busca_input_text_color: '#1f2937',
  sec_busca_input_border_color: '#93c5fd',
  sec_busca_input_icon_color: '#2563eb',
  sec_busca_input_placeholder_color: '#9ca3af',
  sec_busca_input_border_radius: 6,
  sec_busca_input_border_width: 1,
  sec_busca_input_height: 42,
  sec_busca_input_shadow: true,
  divider_hero_busca_height: 12,
  divider_hero_busca_bg: '#ffffff',
  divider_busca_segmentos_height: 12,
  divider_busca_segmentos_bg: '#ffffff',
  sec_segmentos_bg: '#ffffff',
  sec_segmentos_ptop: 20,
  sec_segmentos_pbot: 24,
  sec_segmentos_min_height: 0,
  sec_novidades_bg: '#f0f0f0',
  sec_novidades_ptop: 36,
  sec_novidades_pbot: 44,
  sec_novidades_min_height: 0,
  sec_newsletter_bg: '#ffffff',
  sec_newsletter_ptop: 30,
  sec_newsletter_pbot: 40,
  sec_newsletter_min_height: 0,
  seg_card_img_height: 110,
  seg_caption_bg: '#e8e3e2',
  seg_caption_opacity: 100,
  seg_caption_height: 55,
  seg_caption_color: '#444444',
  news_card_height: 165,
  news_img_height: 165,
  news_caption_bg: '#ffffff',
  news_caption_opacity: 82,
  news_caption_height: 48,
  news_caption_color: '#333333',
  footer_bg: '#eeebe9',
  footer_ptop: 28,
  footer_pbot: 28,
  footer_border_top_color: '#c2c6d3',
  footer_p1_text: 'Qualitec C S I M Ltda',
  footer_p1_font: 'system-ui',
  footer_p1_size: 12,
  footer_p1_color: '#1c1b1b',
  footer_p1_offset_x: 0,
  footer_p1_offset_y: 0,
  footer_p1_bold: true,
  footer_p1_italic: false,
  footer_p2_text: 'Rua Fazenda Monte Alegre, 367',
  footer_p2_font: 'system-ui',
  footer_p2_size: 12,
  footer_p2_color: '#424751',
  footer_p2_offset_x: 0,
  footer_p2_offset_y: 0,
  footer_p2_bold: false,
  footer_p2_italic: false,
  footer_p3_text: '05160-060 - São Paulo - SP',
  footer_p3_font: 'system-ui',
  footer_p3_size: 12,
  footer_p3_color: '#424751',
  footer_p3_offset_x: 0,
  footer_p3_offset_y: 0,
  footer_p3_bold: false,
  footer_p3_italic: false,
  footer_p4_text: 'Tel: +55 11 3908 7100',
  footer_p4_font: 'system-ui',
  footer_p4_size: 12,
  footer_p4_color: '#424751',
  footer_p4_offset_x: 0,
  footer_p4_offset_y: 0,
  footer_p4_bold: false,
  footer_p4_italic: false,
  footer_p5_text: 'vendas@qualitecinstrumentos.com.br',
  footer_p5_font: 'system-ui',
  footer_p5_size: 12,
  footer_p5_color: '#004A96',
  footer_p5_offset_x: 0,
  footer_p5_offset_y: 0,
  footer_p5_bold: true,
  footer_p5_italic: false,
  footer_p6_text: 'Todos os direitos reservados - 2024',
  footer_p6_font: 'system-ui',
  footer_p6_size: 11,
  footer_p6_color: '#888888',
  footer_p6_offset_x: 0,
  footer_p6_offset_y: 0,
  footer_p6_bold: false,
  footer_p6_italic: false,
  footer_p7_text: 'Representante Exclusivo',
  footer_p7_font: 'system-ui',
  footer_p7_size: 12,
  footer_p7_color: '#1c1b1b',
  footer_p7_offset_x: 0,
  footer_p7_offset_y: 0,
  footer_p7_bold: true,
  footer_p7_italic: false,
  footer_p8_text: 'HEROSE GmbH',
  footer_p8_font: 'system-ui',
  footer_p8_size: 12,
  footer_p8_color: '#424751',
  footer_p8_offset_x: 0,
  footer_p8_offset_y: 0,
  footer_p8_bold: false,
  footer_p8_italic: false,
  footer_p9_text: 'Generant Inc',
  footer_p9_font: 'system-ui',
  footer_p9_size: 12,
  footer_p9_color: '#424751',
  footer_p9_offset_x: 0,
  footer_p9_offset_y: 0,
  footer_p9_bold: false,
  footer_p9_italic: false,
  footer_p10_text: 'DataOnline LLC',
  footer_p10_font: 'system-ui',
  footer_p10_size: 12,
  footer_p10_color: '#424751',
  footer_p10_offset_x: 0,
  footer_p10_offset_y: 0,
  footer_p10_bold: false,
  footer_p10_italic: false,
  footer_p11_text: 'Como posso lhe ajudar?',
  footer_p11_font: 'system-ui',
  footer_p11_size: 14,
  footer_p11_color: '#ffffff',
  footer_p11_offset_x: 0,
  footer_p11_offset_y: 0,
  footer_p11_bold: true,
  footer_p11_italic: false,
  about_hero_bg_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png',
  about_hero_bg_opacity: 70,
  about_hero_badge_text: 'QUALITEC C S I M LTDA | ENGENHARIA & INSTRUMENTAÇÃO',
  about_hero_title: 'Soluções técnicas para processos industriais críticos',
  about_hero_text: 'A Qualitec fornece instrumentação, válvulas e suporte técnico para aplicações que exigem segurança, precisão e confiabilidade.',
  about_hero_btn_solutions_text: 'Conheça nossas soluções',
  about_hero_btn_specialist_text: 'Fale com um especialista',
  about_who_badge_text: 'SOBRE A QUALITEC',
  about_who_title: 'Tecnologia, conhecimento técnico e atendimento próximo',
  about_who_text: 'A Qualitec C S I M Ltda atua no fornecimento de instrumentação industrial, válvulas e soluções para controle de pressão e processos. Com atendimento técnico-comercial especializado, conectamos indústrias brasileiras a equipamentos de alta confiabilidade para aplicações em criogenia, gases industriais, óleo & gás, energia, alimentos e outros processos críticos.',
  about_who_img_url: 'https://pub-25a6482a064a4590a456d3dd2a76114b.r2.dev/products/image_1_valvula_de_alivio_criogenica.png',
  about_who_stat1_number: '100%',
  about_who_stat1_label: 'Suporte Técnico Especializado',
  about_who_stat2_number: 'CGA E4.1',
  about_who_stat2_label: 'Padrão de Limpeza Oxigênio',
  about_who_stat3_number: 'Global',
  about_who_stat3_label: 'Parceiros Internacionais',
  about_brands_title: 'Tecnologia global, suporte técnico local',
  about_brands_text: 'Trabalhamos com fabricantes reconhecidos internacionalmente, oferecendo produtos, documentação técnica e apoio para a definição da configuração mais adequada a cada processo.',
  about_commitment_title: 'Mais do que fornecer produtos, ajudamos a especificar soluções.',
  about_commitment_text: 'Cada processo possui requisitos próprios. Nossa equipe apoia a avaliação de pressão, temperatura, fluido, materiais, conexões, normas e certificações para que o equipamento selecionado seja adequado à operação.',
  about_commitment_bg_color: '#004A96',
  about_cta_title: 'Precisa de apoio para especificar seu equipamento?',
  about_cta_text: 'Nossa equipe está pronta para entender sua aplicação e indicar a solução mais adequada.',
  about_cta_btn_quote_text: 'Solicitar cotação',
  about_cta_btn_specialist_text: 'Falar com um especialista',
}

const settings = reactive<SiteSettings>({ ...defaultSettings })
const uploadingSegment = ref<string | null>(null)
const segmentFileInputs = ref<{ [key: string]: HTMLInputElement | null }>({})

const triggerSegmentUpload = (key: string) => {
  segmentFileInputs.value[key]?.click()
}

const handleSegmentUpload = async (key: 'criogenia' | 'oleo_gas' | 'sucroalcooleiro', e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingSegment.value = key
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      if (key === 'criogenia') settings.segment_img_criogenia = data.url
      else if (key === 'oleo_gas') settings.segment_img_oleo_gas = data.url
      else if (key === 'sucroalcooleiro') settings.segment_img_sucroalcooleiro = data.url

      props.triggerToast?.('Imagem do segmento enviada com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar imagem')
    }
  } catch (err: any) {
    console.error('Erro no upload de imagem do segmento:', err)
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploadingSegment.value = null
    if (target) target.value = ''
  }
}

const heroTextTab = ref<'pt' | 'en' | 'es'>('pt')
const previewLang = ref<'pt' | 'en' | 'es'>('pt')

const heroPreviewText = computed(() => {
  const lang = previewLang.value
  if (lang === 'en') {
    return settings.hero_card_text_en || settings.hero_card_text_pt || settings.hero_card_text || '“ Your daily challenge, we solve every day with safety and reliability “'
  }
  if (lang === 'es') {
    return settings.hero_card_text_es || settings.hero_card_text_pt || settings.hero_card_text || '“ Su desafío diario, lo resolvemos todos los días con seguridad y confiabilidad “'
  }
  return settings.hero_card_text_pt || settings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “'
})

function hexToRgba(hex: string, opacityPercent: number): string {
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

function applySearchInputPreset(preset: 'default' | 'pill' | 'square' | 'qualitec' | 'elevated' | 'dark' | 'bold') {
  if (preset === 'default') {
    settings.sec_busca_input_border_radius = 6
    settings.sec_busca_input_border_width = 1
    settings.sec_busca_input_border_color = '#93c5fd'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#1f2937'
    settings.sec_busca_input_icon_color = '#2563eb'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 42
  } else if (preset === 'pill') {
    settings.sec_busca_input_border_radius = 50
    settings.sec_busca_input_border_width = 1
    settings.sec_busca_input_border_color = '#93c5fd'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#1f2937'
    settings.sec_busca_input_icon_color = '#2563eb'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 44
  } else if (preset === 'square') {
    settings.sec_busca_input_border_radius = 0
    settings.sec_busca_input_border_width = 1
    settings.sec_busca_input_border_color = '#334155'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#1f2937'
    settings.sec_busca_input_icon_color = '#005db7'
    settings.sec_busca_input_shadow = false
    settings.sec_busca_input_height = 42
  } else if (preset === 'qualitec') {
    settings.sec_busca_input_border_radius = 8
    settings.sec_busca_input_border_width = 2
    settings.sec_busca_input_border_color = '#005db7'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#003366'
    settings.sec_busca_input_icon_color = '#005db7'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 44
  } else if (preset === 'elevated') {
    settings.sec_busca_input_border_radius = 10
    settings.sec_busca_input_border_width = 0
    settings.sec_busca_input_border_color = '#e2e8f0'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#1f2937'
    settings.sec_busca_input_icon_color = '#2563eb'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 46
  } else if (preset === 'dark') {
    settings.sec_busca_input_border_radius = 8
    settings.sec_busca_input_border_width = 1
    settings.sec_busca_input_border_color = '#475569'
    settings.sec_busca_input_bg = '#334155'
    settings.sec_busca_input_text_color = '#ffffff'
    settings.sec_busca_input_icon_color = '#60a5fa'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 42
  } else if (preset === 'bold') {
    settings.sec_busca_input_border_radius = 12
    settings.sec_busca_input_border_width = 3
    settings.sec_busca_input_border_color = '#2563eb'
    settings.sec_busca_input_bg = '#ffffff'
    settings.sec_busca_input_text_color = '#1e3a8a'
    settings.sec_busca_input_icon_color = '#2563eb'
    settings.sec_busca_input_shadow = true
    settings.sec_busca_input_height = 46
  }
  props.triggerToast?.(`Modelo "${preset}" aplicado com sucesso!`, 'success')
}

function resetBlock(block: 'sections' | 'segmentCards' | 'newsCards' | 'footer' | 'busca') {
  if (block === 'busca') {
    settings.sec_busca_bg = defaultSettings.sec_busca_bg
    settings.sec_busca_ptop = defaultSettings.sec_busca_ptop
    settings.sec_busca_pbot = defaultSettings.sec_busca_pbot
    settings.sec_busca_min_height = defaultSettings.sec_busca_min_height
    settings.sec_busca_title_color = defaultSettings.sec_busca_title_color
    settings.sec_busca_subtitle_color = defaultSettings.sec_busca_subtitle_color
    settings.sec_busca_quick_title_color = defaultSettings.sec_busca_quick_title_color
    settings.sec_busca_quick_links_color = defaultSettings.sec_busca_quick_links_color
    settings.sec_busca_input_bg = defaultSettings.sec_busca_input_bg
    settings.sec_busca_input_text_color = defaultSettings.sec_busca_input_text_color
    settings.sec_busca_input_border_color = defaultSettings.sec_busca_input_border_color
    settings.sec_busca_input_icon_color = defaultSettings.sec_busca_input_icon_color
    settings.sec_busca_input_placeholder_color = defaultSettings.sec_busca_input_placeholder_color
    settings.sec_busca_input_border_radius = defaultSettings.sec_busca_input_border_radius
    settings.sec_busca_input_border_width = defaultSettings.sec_busca_input_border_width
    settings.sec_busca_input_height = defaultSettings.sec_busca_input_height
    settings.sec_busca_input_shadow = defaultSettings.sec_busca_input_shadow
    settings.divider_hero_busca_height = defaultSettings.divider_hero_busca_height
    settings.divider_hero_busca_bg = defaultSettings.divider_hero_busca_bg
    settings.divider_busca_segmentos_height = defaultSettings.divider_busca_segmentos_height
    settings.divider_busca_segmentos_bg = defaultSettings.divider_busca_segmentos_bg
    props.triggerToast?.('Valores originais da área de busca restaurados!', 'success')
  } else if (block === 'sections') {
    settings.sec_busca_bg = defaultSettings.sec_busca_bg
    settings.sec_busca_ptop = defaultSettings.sec_busca_ptop
    settings.sec_busca_pbot = defaultSettings.sec_busca_pbot
    settings.sec_busca_min_height = defaultSettings.sec_busca_min_height
    settings.divider_hero_busca_height = defaultSettings.divider_hero_busca_height
    settings.divider_hero_busca_bg = defaultSettings.divider_hero_busca_bg
    settings.divider_busca_segmentos_height = defaultSettings.divider_busca_segmentos_height
    settings.divider_busca_segmentos_bg = defaultSettings.divider_busca_segmentos_bg
    settings.sec_segmentos_bg = defaultSettings.sec_segmentos_bg
    settings.sec_segmentos_ptop = defaultSettings.sec_segmentos_ptop
    settings.sec_segmentos_pbot = defaultSettings.sec_segmentos_pbot
    settings.sec_segmentos_min_height = defaultSettings.sec_segmentos_min_height
    settings.sec_novidades_bg = defaultSettings.sec_novidades_bg
    settings.sec_novidades_ptop = defaultSettings.sec_novidades_ptop
    settings.sec_novidades_pbot = defaultSettings.sec_novidades_pbot
    settings.sec_novidades_min_height = defaultSettings.sec_novidades_min_height
    settings.sec_newsletter_bg = defaultSettings.sec_newsletter_bg
    settings.sec_newsletter_ptop = defaultSettings.sec_newsletter_ptop
    settings.sec_newsletter_pbot = defaultSettings.sec_newsletter_pbot
    settings.sec_newsletter_min_height = defaultSettings.sec_newsletter_min_height
    props.triggerToast?.('Valores originais das faixas da home restaurados!', 'success')
  } else if (block === 'segmentCards') {
    settings.seg_card_img_height = defaultSettings.seg_card_img_height
    settings.seg_caption_bg = defaultSettings.seg_caption_bg
    settings.seg_caption_opacity = defaultSettings.seg_caption_opacity
    settings.seg_caption_height = defaultSettings.seg_caption_height
    settings.seg_caption_color = defaultSettings.seg_caption_color
    props.triggerToast?.('Valores originais dos cards de segmentos restaurados!', 'success')
  } else if (block === 'newsCards') {
    settings.news_card_height = defaultSettings.news_card_height
    settings.news_img_height = defaultSettings.news_img_height
    settings.news_caption_bg = defaultSettings.news_caption_bg
    settings.news_caption_opacity = defaultSettings.news_caption_opacity
    settings.news_caption_height = defaultSettings.news_caption_height
    settings.news_caption_color = defaultSettings.news_caption_color
    props.triggerToast?.('Valores originais dos cards de novidades restaurados!', 'success')
  } else if (block === 'footer') {
    settings.footer_bg = defaultSettings.footer_bg
    settings.footer_ptop = defaultSettings.footer_ptop
    settings.footer_pbot = defaultSettings.footer_pbot
    settings.footer_border_top_color = defaultSettings.footer_border_top_color
    for (let i = 1; i <= 11; i++) {
      const keyT = `footer_p${i}_text` as keyof SiteSettings
      const keyF = `footer_p${i}_font` as keyof SiteSettings
      const keyS = `footer_p${i}_size` as keyof SiteSettings
      const keyC = `footer_p${i}_color` as keyof SiteSettings
      const keyX = `footer_p${i}_offset_x` as keyof SiteSettings
      const keyY = `footer_p${i}_offset_y` as keyof SiteSettings
      const keyB = `footer_p${i}_bold` as keyof SiteSettings
      const keyI = `footer_p${i}_italic` as keyof SiteSettings
      ;(settings as any)[keyT] = (defaultSettings as any)[keyT]
      ;(settings as any)[keyF] = (defaultSettings as any)[keyF]
      ;(settings as any)[keyS] = (defaultSettings as any)[keyS]
      ;(settings as any)[keyC] = (defaultSettings as any)[keyC]
      ;(settings as any)[keyX] = (defaultSettings as any)[keyX]
      ;(settings as any)[keyY] = (defaultSettings as any)[keyY]
      ;(settings as any)[keyB] = (defaultSettings as any)[keyB]
      ;(settings as any)[keyI] = (defaultSettings as any)[keyI]
    }
    props.triggerToast?.('Valores originais do rodapé restaurados!', 'success')
  }
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

const parsedVideo = computed(() => {
  const url = (settings.hero_bg_video_url || '').trim()
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

const previewHorizontalClass = computed(() => {
  const pos = settings.hero_card_position || 'left'
  if (pos === 'center') return 'justify-center'
  if (pos === 'right') return 'justify-end'
  return 'justify-start'
})

const previewVerticalClass = computed(() => {
  const align = settings.hero_card_vertical_align || 'center'
  if (align === 'top') return 'items-start'
  if (align === 'bottom') return 'items-end'
  return 'items-center'
})

const setPresetOffset = (x: number, y: number) => {
  settings.hero_card_position_mode = 'custom'
  settings.hero_card_offset_x = x
  settings.hero_card_offset_y = y
}

// Drag and Drop Logic
const onCardMouseDown = (e: MouseEvent) => {
  if (settings.hero_card_position_mode !== 'custom') return
  isDraggingCard.value = true
  updateCardPositionFromMouse(e)
  window.addEventListener('mousemove', onCardMouseMove)
  window.addEventListener('mouseup', onCardMouseUp)
}

const onCardMouseMove = (e: MouseEvent) => {
  if (!isDraggingCard.value) return
  updateCardPositionFromMouse(e)
}

const onCardMouseUp = () => {
  isDraggingCard.value = false
  window.removeEventListener('mousemove', onCardMouseMove)
  window.removeEventListener('mouseup', onCardMouseUp)
}

const updateCardPositionFromMouse = (e: MouseEvent) => {
  if (!previewContainerRef.value) return
  const rect = previewContainerRef.value.getBoundingClientRect()
  
  let relX = ((e.clientX - rect.left) / rect.width) * 100
  let relY = ((e.clientY - rect.top) / rect.height) * 100

  // Constrain between 0% and 75%
  relX = Math.max(0, Math.min(75, Math.round(relX)))
  relY = Math.max(0, Math.min(75, Math.round(relY)))

  settings.hero_card_offset_x = relX
  settings.hero_card_offset_y = relY
}

const triggerBgUpload = () => {
  bgFileInput.value?.click()
}

const handleBgUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingBg.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      if (file.type.startsWith('video/')) {
        settings.hero_bg_type = 'video'
        settings.hero_bg_video_url = data.url
      } else {
        settings.hero_bg_type = 'image'
        settings.hero_bg_image_url = data.url
      }
      props.triggerToast?.('Arquivo enviado com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar arquivo')
    }
  } catch (err: any) {
    console.error('Erro no upload de mídia:', err)
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploadingBg.value = false
    if (target) target.value = ''
  }
}

const triggerLogoUpload = () => {
  logoFileInput.value?.click()
}

const handleLogoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      settings.header_logo_url = data.url
      props.triggerToast?.('Logotipo enviado com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar logotipo')
    }
  } catch (err: any) {
    console.error('Erro no upload de logotipo:', err)
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploadingLogo.value = false
    if (target) target.value = ''
  }
}

const uploadingAbout = ref<string | null>(null)
const aboutHeroFileInput = ref<HTMLInputElement | null>(null)
const aboutWhoFileInput = ref<HTMLInputElement | null>(null)

const triggerAboutUpload = (field: 'about_hero_bg_url' | 'about_who_img_url') => {
  if (field === 'about_hero_bg_url') aboutHeroFileInput.value?.click()
  else if (field === 'about_who_img_url') aboutWhoFileInput.value?.click()
}

const handleAboutUpload = async (field: 'about_hero_bg_url' | 'about_who_img_url', e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingAbout.value = field
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()

    if (data.url) {
      settings[field] = data.url
      props.triggerToast?.('Imagem enviada com sucesso!', 'success')
    } else {
      throw new Error(data.error || 'Erro ao enviar imagem')
    }
  } catch (err: any) {
    console.error('Erro no upload de imagem:', err)
    props.triggerToast?.(`Erro no upload: ${err.message || err}`, 'error')
  } finally {
    uploadingAbout.value = null
    if (target) target.value = ''
  }
}

const subscribers = ref<Array<{ email: string; lang: string; subscribed_at: string }>>([])

const loadSubscribers = async () => {
  try {
    const res = await fetch('/api/admin/subscribers')
    const data = await res.json()
    if (data?.subscribers) {
      subscribers.value = data.subscribers
    }
  } catch (err) {
    console.error('Erro ao carregar inscritos da newsletter:', err)
  }
}

const exportSubscribersCSV = () => {
  if (!subscribers.value.length) return
  let csvContent = 'data:text/csv;charset=utf-8,Email,Idioma,DataInscricao\n'
  subscribers.value.forEach(item => {
    const dt = item.subscribed_at ? new Date(item.subscribed_at).toLocaleString('pt-BR') : ''
    csvContent += `"${item.email}","${item.lang || 'pt'}","${dt}"\n`
  })
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `inscritos_newsletter_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadSettings = async () => {
  loading.value = true
  try {
    const { data } = await supabase
      .from('pdf_settings')
      .select('layout_settings')
      .eq('category', 'GERAL')
      .single()

    if (data?.layout_settings?.site_settings) {
      const saved = data.layout_settings.site_settings
      Object.keys(defaultSettings).forEach(key => {
        if (saved[key] !== undefined && saved[key] !== null && String(saved[key]).trim() !== '') {
          (settings as any)[key] = saved[key]
        } else if ((defaultSettings as any)[key] !== undefined) {
          (settings as any)[key] = (defaultSettings as any)[key]
        }
      })
    } else {
      Object.assign(settings, defaultSettings)
    }
    await loadSubscribers()
  } catch (err) {
    console.error('[AdminSiteSettings] Error loading settings:', err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const { data: geralData } = await supabase
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    const currentLayout = geralData?.layout_settings || {}
    currentLayout.site_settings = { ...settings }

    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: {
        category: 'GERAL',
        layout_settings: currentLayout
      }
    })

    await fetchSiteSettings(true)

    props.triggerToast?.('Configurações visuais e do Logotipo salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminSiteSettings] Error saving settings:', err)
    props.triggerToast?.(formatApiErrorMessage(err, 'Erro ao salvar configurações'), 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>
