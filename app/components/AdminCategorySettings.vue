<template>
  <div class="space-y-6">
    <!-- Header with Create Category -->
    <div class="bg-white border border-gray-200 p-6 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] relative overflow-hidden flex justify-between items-center">
      <div class="h-1 bg-blue-600 w-full absolute top-0 left-0"></div>
      <div>
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Categorias de Equipamentos</h3>
        <p class="text-xs text-gray-500 font-medium">Cadastre novas categorias ou configure os aspectos visuais e de PDF.</p>
      </div>
      <div class="flex items-center space-x-3">
        <input v-model="newCategoryName" type="text" placeholder="Nome da Categoria..." class="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 bg-white" />
        <button @click="handleCreateCategory" :disabled="saving || !newCategoryName.trim()" class="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
          <span class="material-symbols-outlined text-sm mr-1.5">add</span>
          Nova Categoria
        </button>
      </div>
    </div>

    <!-- Category list loading state -->
    <div v-if="loading" class="bg-white border border-gray-200 p-12 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-gray-500">
      <span class="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
      <span class="text-xs uppercase tracking-wider">Carregando categorias...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="categories.length === 0" class="bg-white border border-gray-200 p-12 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] text-center text-gray-500 border-dashed">
      <span class="material-symbols-outlined text-3xl mb-2">category</span>
      <p class="text-xs uppercase tracking-wider">Nenhuma categoria cadastrada</p>
    </div>

    <!-- Category list with layout configurations -->
    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="category in categories" :key="category.id" class="bg-white border border-gray-200 rounded shadow-[0_4px_4px_rgba(0,0,0,0.05)] p-6 relative">
        <div class="flex flex-col lg:flex-row gap-6 justify-between">
          <!-- Left side: Category identification, Cover image and color -->
          <div class="w-full lg:w-1/3 space-y-4">
            <div class="flex items-center space-x-3">
              <span class="w-6 h-6 rounded-full border border-gray-300 shadow-sm" :style="{ backgroundColor: category.colorHex }"></span>
              <input v-model="category.category" type="text" @input="category.hasChanges = true" class="font-bold text-lg text-slate-800 focus:outline-none focus:border-b focus:border-blue-600 border-b border-transparent bg-transparent w-full uppercase" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor da Categoria (Código Hex)</label>
              <div class="flex items-center space-x-2">
                <input v-model="category.colorHex" type="color" @change="category.hasChanges = true" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
                <input v-model="category.colorHex" type="text" @input="category.hasChanges = true" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Capa da Categoria (Upload JPG/PNG)</label>
              <div @click="triggerImageUpload(category.id)" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative bg-white">
                <input type="file" :ref="el => fileInputs[category.id] = el as HTMLInputElement" class="hidden" accept="image/*" @change="e => handleImageChange(e, category)" />
                <img v-if="category.coverImageBlob || category.coverImageUrl" :src="getCoverImage(category)" class="max-h-16 object-contain" @error="handleImageError" />
                <span v-else class="material-symbols-outlined text-gray-500 text-2xl mb-1">image</span>
                <span class="text-[10px] text-gray-500 font-semibold uppercase mt-1">Trocar Capa</span>
              </div>
            </div>

            <!-- Actions block -->
            <div class="pt-4 border-t border-gray-200 flex flex-col gap-2">
              <button @click="$emit('save-category', category)" :disabled="saving || !category.hasChanges" class="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded transition-colors disabled:opacity-40">
                SALVAR ALTERAÇÕES
              </button>
              <button @click="openReplicateModal(category)" class="w-full py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded transition-colors">
                REPLICAR LAYOUT PDF
              </button>
              <button @click="confirmDeleteCategory(category)" class="w-full py-2 border border-red-600 text-red-650 hover:bg-red-50 text-xs font-bold rounded transition-colors">
                EXCLUIR CATEGORIA
              </button>
            </div>
          </div>

          <!-- Right side: PDF Layout Configuration (Collapsible) -->
          <div class="w-full lg:w-2/3 border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6 space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-200">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <span class="material-symbols-outlined text-base mr-1.5">picture_as_pdf</span>
                Customização do PDF
              </h4>
            </div>

            <!-- Orientação da Folha (fora do painel, sempre visível) -->
            <div class="flex items-center gap-3 py-2">
              <label class="text-[10px] text-gray-500 font-semibold uppercase whitespace-nowrap">Orientação Padrão:</label>
              <select v-model="category.orientation" @change="category.hasChanges = true" class="border border-gray-300 p-1.5 text-xs rounded bg-white">
                <option value="portrait">↕ Vertical (Retrato)</option>
                <option value="landscape">↔ Horizontal (Paisagem)</option>
              </select>
            </div>

            <!-- Dropdown: Configurar Layout PDF (Vertical ou Paisagem) -->
            <div class="relative inline-block">
              <button
                @click="togglePdfMenuOpen(category.id)"
                class="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-600 transition-all flex items-center gap-1 outline-none"
                type="button"
              >
                <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span>
                  {{ isPdfSettingsOpen(category.id)
                    ? (getPdfMode(category.id) === 'landscape' ? '↔ Editando Paisagem' : '↕ Editando Vertical')
                    : 'Configurar Layout PDF' }}
                </span>
                <span class="material-symbols-outlined text-sm">{{ isPdfMenuOpen(category.id) ? 'expand_less' : 'expand_more' }}</span>
              </button>
              <!-- Dropdown Menu -->
              <div
                v-if="isPdfMenuOpen(category.id)"
                class="absolute right-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[220px] overflow-hidden"
              >
                <button
                  @click="openPdfPanel(category.id, 'portrait')"
                  class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 flex items-center gap-2 transition-colors"
                  :class="isPdfSettingsOpen(category.id) && getPdfMode(category.id) === 'portrait' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
                >
                  <span class="material-symbols-outlined text-sm">&#xe7ef;</span>
                  ↕ Configurar Layout <strong>Vertical</strong>
                </button>
                <div class="border-t border-gray-100"></div>
                <button
                  @click="openPdfPanel(category.id, 'landscape')"
                  class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-indigo-50 flex items-center gap-2 transition-colors"
                  :class="isPdfSettingsOpen(category.id) && getPdfMode(category.id) === 'landscape' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'"
                >
                  <span class="material-symbols-outlined text-sm">&#xe63c;</span>
                  ↔ Configurar Layout <strong>Paisagem</strong>
                </button>
                <div v-if="isPdfSettingsOpen(category.id)" class="border-t border-gray-100"></div>
                <button
                  v-if="isPdfSettingsOpen(category.id)"
                  @click="closePdfPanel(category.id)"
                  class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-500 transition-colors"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                  Ocultar Painel
                </button>
              </div>
            </div>

            <!-- Collapsible Settings Panel -->
            <div v-show="isPdfSettingsOpen(category.id)" class="space-y-4 border-2 p-4 rounded transition-all duration-300"
              :class="getPdfMode(category.id) === 'landscape' ? 'border-indigo-300 bg-indigo-50/40' : 'border-gray-200 bg-gray-50'"
            >
              <!-- Indicador de modo ativo -->
              <div class="flex items-center gap-2 pb-2 border-b" :class="getPdfMode(category.id) === 'landscape' ? 'border-indigo-200' : 'border-gray-200'">
                <span class="material-symbols-outlined text-base" :class="getPdfMode(category.id) === 'landscape' ? 'text-indigo-600' : 'text-blue-600'">{{ getPdfMode(category.id) === 'landscape' ? 'crop_landscape' : 'crop_portrait' }}</span>
                <span class="text-[11px] font-bold uppercase tracking-wider" :class="getPdfMode(category.id) === 'landscape' ? 'text-indigo-600' : 'text-blue-600'">
                  {{ getPdfMode(category.id) === 'landscape' ? '↔ Configurações de Paisagem (Horizontal)' : '↕ Configurações Verticais (Retrato)' }}
                </span>
                <span v-if="getPdfMode(category.id) === 'landscape'" class="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold ml-auto">Independente do Retrato</span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <!-- GRUPO 1: TÍTULO -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Configurações do Título da Categoria</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte do Título
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a família de fonte do título principal da categoria na capa e cabeçalhos do PDF.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).titleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="Inter">Inter</option>
                    <option value="Hanken Grotesk">Hanken Grotesk</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tamanho Fonte Título
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define o tamanho da fonte do título principal no cabeçalho das páginas (Ex: 36px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).titleFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="36px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Título Posição Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajusta o deslocamento vertical do título da página. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).titlePositionY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div class="hidden md:block"></div>

                <!-- GRUPO 2: LOGOTIPO -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Configurações do Logotipo</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Largura da Logo
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura máxima da caixa da logo na capa do PDF (Ex: 240px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).logoWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="240px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Altura da Logo
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altura máxima (grossura) da caixa da logo na capa do PDF (Ex: 75px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).logoHeight" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="75px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Logo Posição X (Right)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Posição horizontal da logo. Valores maiores movem para a ESQUERDA (afasta da borda), menores para a DIREITA (Ex: 60px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).logoPositionX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="60px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Logo Posição Y (Top)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Posição vertical da logo. Valores maiores movem para BAIXO (afasta do topo), menores para CIMA (Ex: 60px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).logoPositionY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="60px" />
                </div>

                <!-- GRUPO 3: LAYOUT E FOTOS -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Disposição Geral & Alinhamento</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Alinhamento Foto
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define se as fotos dos produtos serão exibidas na esquerda, direita ou centro do card.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).imagePosition" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="right">Direita</option>
                    <option value="left">Esquerda</option>
                    <option value="center">Centralizado</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Posição do Cabeçalho Card
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Inverte as posições do Modelo (VS-0080) e Tag/Status (CO2) no cabeçalho do card.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).cardHeaderLayout" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="model-left">Modelo à Esq. / Tag à Dir.</option>
                    <option value="model-right">Tag à Esq. / Modelo à Dir.</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Ordem do Layout
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a ordem no card de 2 produtos: se a ficha técnica (specs) ou a imagem aparece primeiro.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).cardLayoutOrder" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="specs-first">Ficha Técnica Primeiro</option>
                    <option value="image-first">Imagem Primeiro</option>
                  </select>
                </div>
                <!-- (Orientação movida para fora do painel - acima do botão dropdown) -->
                <div class="hidden"></div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Espaçamento Entre Itens
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Espaço vertical de separação entre os produtos em uma página (Ex: 24px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).productSpacing" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="24px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Foto Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical das fotos dos produtos. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).productImageOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Foto Deslocamento X (Padrão)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal padrão das fotos dos produtos. Pode ser sobrescrito individualmente por produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).productImageOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>

                <!-- GRUPO 3.5: DIMENSÕES DA IMAGEM -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Dimensões da Imagem Padrão</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Escala Proporcional
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Escala os 4 cantos da imagem de forma proporcional (Ex: 1.2 para aumentar 20%, 0.8 para reduzir 20%).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).pdfImageScale" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="1.0" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Escala Horizontal
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão horizontal (largura) da imagem.">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).pdfImageScaleX" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="1.0" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Escala Vertical
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão vertical (altura) da imagem.">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).pdfImageScaleY" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="1.0" />
                </div>
                <div class="hidden md:block"></div>

                <!-- GRUPO 4: CUSTOMIZAÇÃO DO CARD -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Ajustes Finos do Card (Modelo/Título)</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Deslocamento X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal de todo o bloco de informações. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical de todo o bloco de informações. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Título Desloc. X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do título do produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardTitleOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Título Desloc. Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do título do produto. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardTitleOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte do Título Card
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no título do produto nos cards do PDF.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).cardTitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="Inter">Inter</option>
                    <option value="Hanken Grotesk">Hanken Grotesk</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte do Modelo Card
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no código do modelo (SKU) nos cards do PDF.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).cardModelFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="Inter">Inter</option>
                    <option value="Hanken Grotesk">Hanken Grotesk</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tamanho Fonte Modelo
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do texto do código do modelo (SKU) no card (Ex: 24px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardModelFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="24px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Modelo Desloc. X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do código do modelo (SKU) no card. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardModelOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Modelo Desloc. Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do código do modelo (SKU) no card. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).cardModelOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte da Tag/Status
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada na Tag/Status (ex: CO2) no canto do card.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).tagFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="Inter">Inter</option>
                    <option value="Hanken Grotesk">Hanken Grotesk</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tamanho Fonte Tag/Status
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do texto da Tag/Status no card (Ex: 10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).tagFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="10px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tag Deslocamento X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal da Tag/Status. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).tagOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tag Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical da Tag/Status. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).tagOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="0px" />
                </div>
                <div class="col-span-3"></div>

                <!-- GRUPO 5: ESPECIFICAÇÕES -->
                <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2">
                  <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Customização das Especificações (Specs)</span>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte das Specs
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada nos rótulos e valores das especificações técnicas.">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).specsFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="Inter">Inter</option>
                    <option value="Hanken Grotesk">Hanken Grotesk</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Calibri">Calibri</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tamanho Fonte Specs
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho de texto das especificações técnicas no card (Ex: 10px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).fontSizeSpecs" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="10px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Largura Rótulo Specs (%)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura reservada para os nomes/rótulos das especificações em relação ao card total (Ex: 45%).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).specsLabelWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="45%" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Largura Valor Specs (%)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura reservada para os valores das especificações em relação ao card total (Ex: 55%).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).specsValueWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="55%" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Espaçamento Specs Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Espaçamento interno vertical (padding) de cada linha de especificação técnica (Ex: 4px).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).specsPaddingY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" placeholder="4px" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Estilo Linha Specs
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Estilo da linha divisória entre cada especificação (Tracejado, Contínuo, Pontilhado ou Nenhum).">!</span>
                  </label>
                  <select v-model="getPdfTarget(category).specsLineStyle" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option value="dashed">Tracejado (dashed)</option>
                    <option value="solid">Contínuo (solid)</option>
                    <option value="dotted">Pontilhado (dotted)</option>
                    <option value="none">Nenhum</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Cor da Linha Specs
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor em formato hexadecimal da linha divisória das especificações (Ex: #cbd5e1).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).specsLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white font-mono" placeholder="#cbd5e1" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Cor da Linha Divisória
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor da linha horizontal que separa os produtos nos layouts de múltiplos itens por página (Ex: #cbd5e1).">!</span>
                  </label>
                  <input v-model="getPdfTarget(category).dividerLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white font-mono" placeholder="#cbd5e1" />
                </div>
              </div>

              <!-- ESTILOS E DECORAÇÕES DO TEXTO -->
              <div class="pt-4 border-t border-gray-200 mt-4">
                <span class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Estilos e Decorações do Texto</span>
                <div class="grid grid-cols-4 gap-4 text-xs">
                  <!-- Título Categoria -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Categoria</span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).titleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).titleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).titleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>

                  <!-- Título Produto -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Produto</span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardTitleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardTitleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardTitleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>

                  <!-- Modelo Produto -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Modelo Produto</span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardModelBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardModelItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).cardModelUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>

                  <!-- Specs Rótulo (Esquerda) -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center">
                      Specs Rótulo (Esq.)
                      <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aplica formatação apenas à coluna da esquerda (nomes dos parâmetros, ex: Diâmetro, Rosca).">!</span>
                    </span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>

                  <!-- Specs Valor (Direita) -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center">
                      Specs Valor (Dir.)
                      <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aplica formatação apenas à coluna da direita (valores e detalhes técnicos, ex: 1/2, NPT).">!</span>
                    </span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsValBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsValItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).specsValUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>

                  <!-- Tag / Status -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tag / Status</span>
                    <div class="space-y-1">
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).tagBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Negrito</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).tagItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Itálico</span>
                      </label>
                      <label class="flex items-center space-x-1.5 cursor-pointer">
                        <input type="checkbox" v-model="getPdfTarget(category).tagUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span class="text-gray-650 font-medium">Sublinhado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- REPLICATE SETTINGS MODAL -->
    <div v-if="replicateModalOpen" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 rounded shadow-xl w-full max-w-md p-6 relative">
        <button @click="closeReplicateModal" class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
          <span class="material-symbols-outlined">close</span>
        </button>
        <h3 class="text-base font-bold text-slate-800 mb-4 uppercase tracking-wider">Replicar Layout PDF</h3>
        <p class="text-xs text-gray-500 mb-4 leading-relaxed">
          Selecione as categorias que herdarão todas as configurações de layout do PDF da categoria <strong>{{ sourceCategory?.category }}</strong>:
        </p>

        <div class="space-y-2.5 max-h-48 overflow-y-auto border border-gray-200 p-3 rounded mb-5 bg-white">
          <div v-for="cat in otherCategories" :key="cat.id" class="flex items-center space-x-2.5 text-xs">
            <input type="checkbox" :id="`rep-${cat.id}`" v-model="selectedTargets" :value="cat.id" class="w-4 h-4 text-blue-600" />
            <label :for="`rep-${cat.id}`" class="uppercase font-medium cursor-pointer">{{ cat.category }}</label>
          </div>
        </div>

        <div class="flex space-x-3">
          <button @click="closeReplicateModal" class="w-1/2 border border-gray-300 text-gray-700 py-2 text-xs font-bold rounded hover:bg-gray-50 transition-colors">
            CANCELAR
          </button>
          <button @click="handleReplicate" :disabled="selectedTargets.length === 0" class="w-1/2 bg-blue-600 text-white py-2 text-xs font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-40">
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Category {
  id: string
  category: string
  originalCategory: string
  coverImageUrl: string
  coverImageBlob?: string | null
  colorHex: string
  
  pdfSettingsId?: string
  titleFontSize: string
  titlePositionY: string
  imagePosition: string
  cardLayoutOrder: string
  fontSizeSpecs: string
  dividerLineColor: string
  productSpacing: string
  productImageOffsetY: string
  productImageOffsetX?: string
  cardOffsetX: string
  cardOffsetY: string
  cardTitleOffsetX: string
  cardTitleOffsetY: string
  cardModelFontSize: string
  cardModelOffsetX: string
  cardModelOffsetY: string
  titleFontFamily: string
  cardTitleFontFamily: string
  cardModelFontFamily: string
  specsFontFamily: string
  logoWidth: string
  logoHeight: string
  logoPositionX: string
  logoPositionY: string
  specsLabelWidth: string
  specsValueWidth: string
  specsPaddingY: string
  specsLineStyle: string
  specsLineColor: string
  titleBold: boolean
  titleItalic: boolean
  titleUnderline: boolean
  cardTitleBold: boolean
  cardTitleItalic: boolean
  cardTitleUnderline: boolean
  cardModelBold: boolean
  cardModelItalic: boolean
  cardModelUnderline: boolean
  specsBold: boolean
  specsItalic: boolean
  specsUnderline: boolean
  specsValBold: boolean
  specsValItalic: boolean
  specsValUnderline: boolean
  cardHeaderLayout: string
  tagFontFamily: string
  tagFontSize: string
  tagBold: boolean
  tagItalic: boolean
  tagUnderline: boolean
  tagOffsetX: string
  tagOffsetY: string
  pdfImageScale?: any
  pdfImageScaleX?: any
  pdfImageScaleY?: any

  uploading: boolean
  hasChanges: boolean
}

const props = defineProps<{
  categories: Category[]
  loading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  (e: 'create-category', name: string): void
  (e: 'save-category', category: Category): void
  (e: 'delete-category', id: string): void
  (e: 'replicate-settings', payload: { source: Category, targetIds: string[] }): void
}>()

const newCategoryName = ref('')
const replicateModalOpen = ref(false)
const sourceCategory = ref<Category | null>(null)
const selectedTargets = ref<string[]>([])
const fileInputs = ref<Record<string, HTMLInputElement | null>>({})
const openCategorySettings = ref<Record<string, boolean>>({})

const confirmDeleteCategory = (category: Category) => {
  if (confirm(`Deseja realmente excluir a categoria "${category.category}"? Isso removerá a categoria e todas as suas configurações visuais de PDF.`)) {
    emit('delete-category', category.id)
  }
}

const isPdfSettingsOpen = (id: string) => {
  return !!openCategorySettings.value[id]
}

const togglePdfSettings = (id: string) => {
  openCategorySettings.value[id] = !openCategorySettings.value[id]
}

// ── Dropdown dual: Vertical / Paisagem ──────────────────────────────────
// Rastreia qual modo (portrait|landscape) está sendo editado por categoria
const pdfEditMode = ref<Record<string, 'portrait' | 'landscape'>>({})
// Rastreia se o menu dropdown do botão está aberto
const pdfMenuOpen = ref<Record<string, boolean>>({})

const isPdfMenuOpen = (id: string) => !!pdfMenuOpen.value[id]
const getPdfMode = (id: string) => pdfEditMode.value[id] || 'portrait'

const togglePdfMenuOpen = (id: string) => {
  pdfMenuOpen.value[id] = !pdfMenuOpen.value[id]
}

const openPdfPanel = (id: string, mode: 'portrait' | 'landscape') => {
  pdfEditMode.value[id] = mode
  openCategorySettings.value[id] = true
  pdfMenuOpen.value[id] = false
}

const closePdfPanel = (id: string) => {
  openCategorySettings.value[id] = false
  pdfMenuOpen.value[id] = false
}

/**
 * Retorna o objeto de configurações-alvo para os v-models do painel.
 * - Modo portrait → retorna a própria categoria (dados diretos)
 * - Modo landscape → retorna landscapeSettings (sub-objeto JSON independente)
 *   Garante que landscapeSettings existe e é reativo inicializando se necessário.
 */
const getPdfTarget = (category: any) => {
  const mode = getPdfMode(category.id)
  if (mode === 'landscape') {
    if (!category.landscapeSettings) {
      category.landscapeSettings = {}
    }
    return category.landscapeSettings
  }
  return category
}


const otherCategories = computed(() => {
  if (!sourceCategory.value) return []
  return props.categories.filter(c => c.id !== sourceCategory.value?.id)
})

const handleCreateCategory = () => {
  if (newCategoryName.value.trim()) {
    emit('create-category', newCategoryName.value.trim())
    newCategoryName.value = ''
  }
}

const triggerImageUpload = (id: string) => {
  const input = fileInputs.value[id]
  if (input) {
    input.click()
  }
}

const handleImageChange = (event: Event, category: Category) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    const uint8 = new Uint8Array(arrayBuffer)
    let hex = ''
    for (let i = 0; i < uint8.length; i++) {
      const h = uint8[i].toString(16)
      hex += h.length === 1 ? '0' + h : h
    }
    category.coverImageUrl = file.name
    category.coverImageBlob = '\\x' + hex
    category.hasChanges = true
  }
  reader.readAsArrayBuffer(file)
}

const getCoverImage = (category: Category) => {
  if (category.coverImageBlob) {
    if (category.coverImageBlob.startsWith('data:')) return category.coverImageBlob
    return `data:image/png;base64,${category.coverImageBlob}`
  }
  return category.coverImageUrl || '/placeholder.png'
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/placeholder.png'
}

const openReplicateModal = (category: Category) => {
  sourceCategory.value = category
  selectedTargets.value = []
  replicateModalOpen.value = true
}

const closeReplicateModal = () => {
  sourceCategory.value = null
  selectedTargets.value = []
  replicateModalOpen.value = false
}

const handleReplicate = () => {
  if (sourceCategory.value && selectedTargets.value.length > 0) {
    emit('replicate-settings', {
      source: sourceCategory.value,
      targetIds: selectedTargets.value
    })
    closeReplicateModal()
  }
}
</script>