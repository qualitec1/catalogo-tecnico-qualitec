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

            <!-- Texto do Card Verde -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Frase do Card de Destaque</label>
              <textarea v-model="settings.hero_card_text" rows="2" class="w-full border border-gray-300 p-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans"></textarea>
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
          </div>

          <!-- Coluna da Direita: Preview Interativo -->
          <div class="space-y-3">
            <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-blue-600">touch_app</span> Pré-visualização Interativa (Arraste o Card)</span>
              <span class="text-blue-700 font-bold">X: {{ settings.hero_card_offset_x || 0 }}% | Y: {{ settings.hero_card_offset_y || 0 }}%</span>
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
                :src="settings.hero_bg_image_url || 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo'" 
                alt="Hero Fundo"
                class="w-full h-full object-cover pointer-events-none"
              />

              <!-- Card Verde Arrastável na Prévia -->
              <div 
                class="absolute p-3 rounded-lg shadow-lg border border-white/20 transition-all duration-75 max-w-[65%]"
                :style="{
                  left: `${settings.hero_card_offset_x || 18}%`,
                  top: `${settings.hero_card_offset_y || 45}%`,
                  bottom: settings.hero_card_extend_bottom ? '0px' : 'auto',
                  backgroundColor: getCardBgStyle(settings.hero_card_bg_color, settings.hero_card_opacity),
                  color: settings.hero_card_text_color || '#ffffff'
                }"
              >
                <p class="text-[10px] font-semibold leading-snug drop-shadow-sm">
                  {{ settings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
                </p>
              </div>
            </div>
            
            <p class="text-[10px] text-gray-400 font-mono text-center">
              Clique e arraste sobre o banner para ajustar a posição (X, Y) em tempo real.
            </p>
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
  hero_card_bg_color: string
  hero_card_text_color: string
  hero_card_position: 'left' | 'center' | 'right'
  hero_card_vertical_align: 'top' | 'center' | 'bottom'
  hero_card_position_mode: 'custom' | 'preset'
  hero_card_offset_x: number
  hero_card_offset_y: number
  hero_card_opacity: number
  hero_card_extend_bottom: boolean
  // Segment Cards (Home)
  segment_img_criogenia: string
  segment_img_oleo_gas: string
  segment_img_sucroalcooleiro: string
  // Cores e Dimensões das Seções da Home
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
}

const defaultSettings: SiteSettings = {
  header_logo_url: 'https://lh3.googleusercontent.com/aida/AP1WRLvb_lGcigKW6su6LN_Xd0Bf0AXsewLIulAi0GxcP_qLjBKDQwKkr4TLJgHAmnOXZ_CnTBIs1fPQUk9wsPoaEnw1KIo3G_pm2AD72CQGZpdCmL0me0d5Nw3sO0Jq1oNeH0TPtE84vraycYx20zMTmWG9t98pFKFcZH8ovF5vpsN6YK6J2ZqjcN6pDWW8byB81uqO2z6Crk115D73Mm9qXI78ObCCnUJ9BmIfEJoVkKB3TB8-KPNPPQ8kG9Y',
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
  hero_bg_type: 'image',
  hero_bg_image_url: 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo',
  hero_bg_video_url: '',
  hero_card_text: '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “',
  hero_card_bg_color: '#74b934',
  hero_card_text_color: '#ffffff',
  hero_card_position: 'left',
  hero_card_vertical_align: 'center',
  hero_card_position_mode: 'custom',
  hero_card_offset_x: 10,
  hero_card_offset_y: 55,
  hero_card_opacity: 85,
  hero_card_extend_bottom: true,
  segment_img_criogenia: 'https://lh3.googleusercontent.com/aida/AP1WRLsDWV00WRL33tuhAG3BPA8GTPcBz-pfzYJ5QGz2_CFnkvCSprf16WTZORxqYJd3VFMaSLF81Wdm-S9-UEVYwRS6IZjDh4VV8WwGm6i7fTQgU4oSmP9IGxRBZnXvSg-lgNzx7dHLh96NV6al1sI8sdEOoVx6IZCUOcKyTMikgpuW736a8c-W4OfY41ayLpgc1yRxJm4ux29KF3X6Vl4DjzUrBJhQVrk6zwaVUJrs9k2kRxWzoaJlEeyRARs',
  segment_img_oleo_gas: 'https://lh3.googleusercontent.com/aida/AP1WRLtMAi3za4oatqWzMuvla-WvZQlt9FguAx22h8nx9U6lR8p142s5QcL4EPPE0ligkQbqZ0q-ZYW-hqDRV2uJVGv0NMmhiEuyzJbKk7sUfZpHHA4_sz8P-TyC7QparCuJFeAeovwFTiSEpumRpFGJg-y1rdhCKN1ensV_n46sSPNrBJMqn7MqzXsxs1FqEOTTk7iB0mQ42_IaiLxVLi8QHfDnmf1qJl39Y9bqn9spftMGhs_woAvKg85Vgk0',
  segment_img_sucroalcooleiro: 'https://lh3.googleusercontent.com/aida/AP1WRLtx-24uZLAzxnTShKPl8Wv12JS85bEMJBe8sqHO25f6hSfCDYWD7dOd3t0TS1qSXQfoEmpRejEnBgmszPULohKQhnktzaTJxNZlqCZtWMl_i2qHHdWBFpI5OD1WyuR3zn6bDrno3XOkEm5_52rNlHCVRUzbbVXx-6T9Fq-atHYsA-bfuEzXbOwh0ibv0HAdlvONto1p0-R41aQY_ZMMGGD6KANY4mawEiSd7OT1CHuJeCgTozkzRuxGGg',
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

function resetBlock(block: 'sections' | 'segmentCards' | 'newsCards') {
  if (block === 'sections') {
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
        if (saved[key] !== undefined) {
          (settings as any)[key] = saved[key]
        }
      })
    }
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
      .single()

    const currentLayout = geralData?.layout_settings || {}
    currentLayout.site_settings = { ...settings }

    if (geralData?.id) {
      await supabase
        .from('pdf_settings')
        .update({ layout_settings: currentLayout })
        .eq('id', geralData.id)
    } else {
      await supabase
        .from('pdf_settings')
        .insert([{ category: 'GERAL', layout_settings: currentLayout }])
    }

    await fetchSiteSettings(true)

    props.triggerToast?.('Configurações visuais e do Logotipo salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminSiteSettings] Error saving settings:', err)
    props.triggerToast?.(`Erro ao salvar configurações: ${err.message || err}`, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>
