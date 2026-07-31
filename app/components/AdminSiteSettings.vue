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
      <!-- ===== SEÇÃO: BANNER PRINCIPAL (HERO SECTION) ===== -->
      <div class="space-y-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">featured_video</span>
            Banner Principal da Home (Hero)
          </h3>
          <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">Edição de Imagem, Vídeo e Posição Livre</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Coluna da Esquerda: Formulário de Configuração -->
          <div class="space-y-5">
            <!-- Tipo de Fundo -->
            <div class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Tipo de Fundo</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="image" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">image</span> Foto / Imagem</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_bg_type" value="video" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">movie</span> Vídeo (MP4/WebM)</span>
                </label>
              </div>
            </div>

            <!-- URL de Imagem / Upload -->
            <div v-if="settings.hero_bg_type === 'image'" class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Imagem de Fundo (URL ou Upload)</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="settings.hero_bg_image_url" 
                  type="text" 
                  placeholder="https://exemplo.com/imagem-fundo.jpg" 
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button 
                  @click="triggerBgUpload" 
                  :disabled="uploadingBg"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  {{ uploadingBg ? 'Enviando...' : 'Upload' }}
                </button>
              </div>
              <input ref="bgFileInput" type="file" accept="image/*,video/*" class="hidden" @change="handleBgUpload" />
            </div>

            <!-- URL de Vídeo / Upload -->
            <div v-else class="space-y-2">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Vídeo de Fundo (URL MP4 ou Upload)</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="settings.hero_bg_video_url" 
                  type="text" 
                  placeholder="https://exemplo.com/video-fundo.mp4" 
                  class="flex-1 border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                <button 
                  @click="triggerBgUpload" 
                  :disabled="uploadingBg"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 border-0 cursor-pointer shrink-0"
                >
                  <span class="material-symbols-outlined text-sm">{{ uploadingBg ? 'sync' : 'upload' }}</span>
                  {{ uploadingBg ? 'Enviando...' : 'Upload' }}
                </button>
              </div>
              <input ref="bgFileInput" type="file" accept="video/*,image/*" class="hidden" @change="handleBgUpload" />
            </div>

            <!-- Frase do Card Verde -->
            <div class="space-y-1.5">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Frase / Texto do Card Destaque</label>
              <textarea 
                v-model="settings.hero_card_text" 
                rows="3"
                placeholder="“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “"
                class="w-full border border-gray-300 p-2.5 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <!-- Modo de Posicionamento -->
            <div class="space-y-2 border-t border-slate-200 pt-3">
              <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Modo de Posicionamento do Card</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_card_position_mode" value="custom" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">open_with</span> Livre (Arrastar ou Ajustar X / Y)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input type="radio" v-model="settings.hero_card_position_mode" value="preset" class="text-blue-600 focus:ring-blue-500" />
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">grid_view</span> Posições Fixas</span>
                </label>
              </div>
            </div>

            <!-- Posição Livre (Sliders & Controles de X e Y) -->
            <div v-if="settings.hero_card_position_mode === 'custom'" class="space-y-4 bg-white p-3.5 rounded border border-gray-200">
              <p class="text-[11px] text-blue-800 font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-blue-600">pan_tool</span>
                Arraste o card verde na caixa de preview ao lado ou ajuste as barras abaixo:
              </p>

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

              <!-- Atalhos Rápidos de Posição -->
              <div class="pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                <button @click="setPresetOffset(5, 55)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors">Canto Inferior Esquerdo</button>
                <button @click="setPresetOffset(30, 30)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors">Centro</button>
                <button @click="setPresetOffset(5, 5)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors">Topo Esquerdo</button>
                <button @click="setPresetOffset(50, 55)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer transition-colors">Canto Inferior Direito</button>
              </div>
            </div>

            <!-- Posição Fixa (Preset Selects) -->
            <div v-else class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Alinhamento Horizontal</label>
                <select v-model="settings.hero_card_position" class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer">
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Alinhamento Vertical</label>
                <select v-model="settings.hero_card_vertical_align" class="w-full border border-gray-300 px-3 py-2 text-xs rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none cursor-pointer">
                  <option value="top">Topo</option>
                  <option value="center">Centro</option>
                  <option value="bottom">Base (Abaixo)</option>
                </select>
              </div>
            </div>

            <!-- Opacidade do Card e Extensão Vertical -->
            <div class="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
                  <span>Transparência (Opacidade): {{ settings.hero_card_opacity }}%</span>
                </div>
                <div class="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5" 
                    v-model.number="settings.hero_card_opacity" 
                    class="flex-1 accent-blue-600 cursor-pointer" 
                  />
                  <span class="text-xs font-mono font-bold text-slate-700 w-8 text-right">{{ settings.hero_card_opacity }}%</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Altura do Card</label>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 mt-1">
                  <input type="checkbox" v-model="settings.hero_card_extend_bottom" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span>Estender até a base do Banner</span>
                </label>
              </div>
            </div>

            <!-- Cores do Card -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Cor de Fundo do Card</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.hero_card_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
                  <input v-model="settings.hero_card_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-full text-center bg-white font-mono rounded" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider">Cor do Texto</label>
                <div class="flex items-center gap-2">
                  <input v-model="settings.hero_card_text_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
                  <input v-model="settings.hero_card_text_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-full text-center bg-white font-mono rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna da Direita: Preview Interativo com Drag & Drop -->
          <div class="space-y-2">
            <label class="block text-[10px] text-gray-600 font-bold uppercase tracking-wider flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-blue-600">touch_app</span> Preview Interativo (Clique e Arraste)</span>
              <span class="text-emerald-600 font-bold">X: {{ settings.hero_card_offset_x }}% | Y: {{ settings.hero_card_offset_y }}%</span>
            </label>
            
            <div 
              ref="previewContainerRef"
              @mousedown="onCardMouseDown"
              class="relative w-full h-80 rounded-lg overflow-hidden border border-gray-300 bg-slate-900 shadow-inner select-none cursor-crosshair flex"
            >
              <!-- Background Image Layer (Always behind video for instant load) -->
              <img 
                class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" 
                :src="settings.hero_bg_image_url || 'https://lh3.googleusercontent.com/aida/AP1WRLuQGJlvhXgSbL5PCfgd-rVegzYgpPNJgtHn0Ea6Nm0tVayzLhjzQkKmbYMugrdMebtxFro3tlHv1N8ozueW3IWAmerLpn5BMh0-V4suiSBYyv-_1zhWqzLrg3b4d-rpkTVAeU22eoHKYZCmNp_AZySP90gelzHtlnS-8x3nRmtLSJEw4C0yhBjOP0LTv8cqJJere8bX1erK4A1HpU_AQV5WthPlinuCGSknmAf4oBmhbRpEqOyxTA2YAMo'"
              />

              <!-- Background Video Layer -->
              <template v-if="settings.hero_bg_type === 'video' && settings.hero_bg_video_url">
                <iframe 
                  v-if="parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo'"
                  class="w-[160%] h-[160%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-125 border-0 z-10"
                  :src="parsedVideo.url"
                  allow="autoplay; fullscreen"
                ></iframe>
                <video 
                  v-else
                  ref="adminPreviewVideoRef"
                  class="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  autoplay
                  loop
                  muted
                  :muted="true"
                  playsinline
                  webkit-playsinline
                  :src="parsedVideo.url"
                ></video>
              </template>

              <!-- Preview Card (Mode: Custom vs Preset) -->
              <div 
                v-if="settings.hero_card_position_mode === 'custom'"
                class="absolute z-20 p-3 max-w-[220px] shadow-xl transition-all duration-75 cursor-grab active:cursor-grabbing backdrop-blur-sm ring-2 ring-blue-500/50 hover:ring-blue-500 flex flex-col justify-between"
                :class="settings.hero_card_extend_bottom ? 'bottom-0 rounded-t-md rounded-b-none' : 'rounded-md'"
                :style="{
                  left: settings.hero_card_offset_x + '%',
                  top: settings.hero_card_offset_y + '%',
                  bottom: settings.hero_card_extend_bottom ? '0px' : 'auto',
                  ...getCardBgStyle(settings.hero_card_bg_color, settings.hero_card_opacity)
                }"
              >
                <div class="text-[9px] text-white/80 font-mono mb-1 flex items-center justify-between pointer-events-none">
                  <span>⋮⋮ ARRASTE</span>
                  <span>{{ settings.hero_card_offset_x }}%, {{ settings.hero_card_offset_y }}%</span>
                </div>
                <p 
                  class="font-medium text-[11px] leading-snug whitespace-pre-line pointer-events-none"
                  :style="{ color: settings.hero_card_text_color || '#ffffff' }"
                >
                  {{ settings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
                </p>
              </div>

              <!-- Preset Mode Preview -->
              <div 
                v-else
                class="relative z-10 w-full h-full p-4 flex transition-all duration-300 pointer-events-none"
                :class="[previewHorizontalClass, previewVerticalClass]"
              >
                <div 
                  class="p-4 max-w-xs rounded shadow-md transition-all duration-300 backdrop-blur-xs"
                  :style="{ backgroundColor: settings.hero_card_bg_color || '#74b934' }"
                >
                  <p 
                    class="font-medium text-xs leading-snug whitespace-pre-line"
                    :style="{ color: settings.hero_card_text_color || '#ffffff' }"
                  >
                    {{ settings.hero_card_text || '“ O seu desafio diário, nós resolvemos todos os dias com segurança e confiabilidade “' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: BOTÃO "VER DOCUMENTAÇÃO" ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">smart_button</span>
          Botão "Ver Documentação" (Ficha Técnica)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cor de Fundo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor de Fundo Hover -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo (Hover)</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_hover_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_hover_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Texto -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Texto</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.btn_doc_text_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.btn_doc_text_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Fonte</label>
            <select v-model="settings.btn_doc_font_family" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="font in fontOptions" :key="font" :value="font" :style="{ fontFamily: font }">{{ font }}</option>
            </select>
          </div>

          <!-- Tamanho da Fonte -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tamanho da Fonte</label>
            <select v-model="settings.btn_doc_font_size" class="border border-gray-300 px-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white rounded cursor-pointer">
              <option v-for="size in fontSizeOptions" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Estilo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estilo da Fonte</label>
            <div class="flex items-center gap-2">
              <button 
                @click="settings.btn_doc_bold = !settings.btn_doc_bold"
                :class="settings.btn_doc_bold ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer font-bold text-sm transition-colors flex items-center justify-center"
                title="Negrito"
              >B</button>
              <button 
                @click="settings.btn_doc_italic = !settings.btn_doc_italic"
                :class="settings.btn_doc_italic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer italic text-sm transition-colors flex items-center justify-center"
                title="Itálico"
              >I</button>
              <button 
                @click="settings.btn_doc_uppercase = !settings.btn_doc_uppercase"
                :class="settings.btn_doc_uppercase ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="w-8 h-8 rounded border-0 cursor-pointer text-[10px] font-bold transition-colors flex items-center justify-center"
                title="Maiúsculas"
              >AA</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== SEÇÃO: ESPECIFICAÇÕES DOS CARDS ===== -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 border-b border-gray-100 pb-2">
          <span class="material-symbols-outlined text-gray-500">table_rows</span>
          Tabela de Especificações dos Cards
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cor de Fundo da Tabela -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor de Fundo das Linhas Par</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_bg_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_bg_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Rótulo -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Rótulo (Campo)</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_label_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_label_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>

          <!-- Cor do Valor -->
          <div class="space-y-1.5">
            <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor do Valor</label>
            <div class="flex items-center gap-2">
              <input v-model="settings.card_specs_value_color" type="color" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded" />
              <input v-model="settings.card_specs_value_color" type="text" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Botão Salvar ===== -->
      <div class="flex justify-end pt-4 border-t border-gray-200">
        <button 
          @click="saveSettings" 
          :disabled="saving"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border-0 cursor-pointer shadow-sm"
        >
          <span class="material-symbols-outlined text-base">{{ saving ? 'sync' : 'save' }}</span>
          {{ saving ? 'Salvando...' : 'Salvar Configurações do Site' }}
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

const loading = ref(true)
const saving = ref(false)
const uploadingBg = ref(false)
const bgFileInput = ref<HTMLInputElement | null>(null)
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
}

const defaultSettings: SiteSettings = {
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
}

const settings = reactive<SiteSettings>({ ...defaultSettings })

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

    props.triggerToast?.('Configurações visuais e do Banner principal salvas com sucesso!', 'success')
  } catch (err: any) {
    console.error('[AdminSiteSettings] Error saving settings:', err)
    props.triggerToast?.(`Erro ao salvar configurações: ${err.message || err}`, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>
