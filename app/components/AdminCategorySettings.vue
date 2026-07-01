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
        <select v-model="newCategorySegmentType" class="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded bg-white text-slate-700">
          <option value="especifica">Categoria Específica</option>
          <option value="geral" :disabled="hasGeralCategory">Capa Geral (GERAL)</option>
        </select>
        <input 
          v-model="newCategoryName" 
          type="text" 
          placeholder="Nome da Categoria..." 
          :disabled="newCategorySegmentType === 'geral'"
          class="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 bg-white disabled:bg-gray-155 disabled:text-gray-400" 
        />
        <button @click="handleCreateCategory" :disabled="saving || (newCategorySegmentType === 'especifica' && !newCategoryName.trim())" class="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
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
              <input 
                v-model="category.category" 
                type="text" 
                :disabled="category.originalCategory.toUpperCase().trim() === 'GERAL'"
                @input="category.hasChanges = true" 
                class="font-bold text-lg text-slate-800 focus:outline-none focus:border-b focus:border-blue-600 border-b border-transparent bg-transparent w-full uppercase disabled:opacity-75" 
              />
              <span v-if="category.originalCategory.toUpperCase().trim() === 'GERAL'" class="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                Capa Geral
              </span>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cor da Categoria (Código Hex)</label>
              <div class="flex items-center space-x-2">
                <input v-model="category.colorHex" type="color" @change="category.hasChanges = true" class="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-full" />
                <input v-model="category.colorHex" type="text" @input="category.hasChanges = true" class="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-28 text-center bg-white font-mono" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Capa da Categoria</label>
              
              <!-- Upload Box -->
              <div @click="triggerImageUpload(category.id)" class="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded h-28 relative bg-white" title="Clique para fazer upload de arquivo">
                <input type="file" :ref="el => fileInputs[category.id] = el as HTMLInputElement" class="hidden" accept="image/*" @change="e => handleImageChange(e, category)" :disabled="uploadingCategories[category.id]" />
                <div v-if="uploadingCategories[category.id]" class="flex flex-col items-center">
                  <span class="material-symbols-outlined animate-spin text-blue-600 mb-2">sync</span>
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Enviando...</span>
                </div>
                <template v-else>
                  <img v-if="category.coverImageBlob || category.coverImageUrl" :src="getCoverImage(category)" class="max-h-16 object-contain" @error="handleImageError" />
                  <span v-else class="material-symbols-outlined text-gray-500 text-2xl mb-1">image</span>
                  <span class="text-[10px] text-gray-500 font-semibold uppercase mt-1">Fazer Upload (JPG/PNG)</span>
                </template>
              </div>

              <!-- Link Input -->
              <div class="space-y-1">
                <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou insira o link da imagem (URL)</label>
                <input 
                  v-model="category.coverImageUrl" 
                  type="text" 
                  @input="category.coverImageBlob = null; category.hasChanges = true" 
                  placeholder="https://exemplo.com/imagem.jpg" 
                  class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800" 
                />
              </div>
            </div>

            <!-- Static PDF Settings -->
            <div class="space-y-2 pt-2 border-t border-gray-200">
              <label class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Catálogo PDF Pronto (Download Direto)</label>
              
              <!-- PDF Upload button -->
              <div class="flex items-center space-x-2">
                <button 
                  type="button"
                  @click="triggerPdfUpload(category.id)"
                  :disabled="uploadingPdfs[category.id]"
                  class="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-sm mr-1">upload_file</span>
                  {{ uploadingPdfs[category.id] ? 'Enviando...' : (category.pdfUrl ? 'Substituir PDF' : 'Upload PDF') }}
                </button>
                <input 
                  type="file" 
                  :ref="el => pdfFileInputs[category.id] = el as HTMLInputElement" 
                  class="hidden" 
                  accept="application/pdf" 
                  @change="e => handlePdfChange(e, category)" 
                />
                
                <button 
                  v-if="category.pdfUrl"
                  type="button"
                  @click="removePdfUrl(category)"
                  class="text-red-650 hover:text-red-750 text-xs font-semibold"
                  title="Remover PDF estático"
                >
                  Remover
                </button>
              </div>

              <!-- PDF Link text box -->
              <div class="space-y-1">
                <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ou Link Direto do PDF (URL)</label>
                <input 
                  v-model="category.pdfUrl" 
                  type="text" 
                  @input="category.hasChanges = true" 
                  placeholder="https://exemplo.com/catalogo.pdf" 
                  class="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white text-slate-800 font-mono" 
                />
              </div>
            </div>

            <!-- Actions block -->
            <div class="pt-4 border-t border-gray-200 flex flex-col gap-2">
              <button @click="$emit('save-category', category)" :disabled="saving || !category.hasChanges" class="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded transition-colors disabled:opacity-40">
                SALVAR ALTERAÇÕES
              </button>
              <button 
                @click="$emit('publish-catalog', category)" 
                :disabled="saving"
                class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5"
                title="Gera o PDF com o layout atual e o publica como arquivo estático oficial"
              >
                <span class="material-symbols-outlined text-sm">publish</span>
                ATUALIZAR PDF OFICIAL
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

              <!-- SELETOR DE ABAS POR DENSIDADE DE PRODUTOS -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-b pb-2 pt-1" :class="getPdfMode(category.id) === 'landscape' ? 'border-indigo-200' : 'border-gray-200'">
                <div class="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    @click="setEditDensity(category.id, 'geral')"
                    class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1"
                    :class="getEditDensity(category.id) === 'geral'
                      ? (getPdfMode(category.id) === 'landscape' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white')
                      : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
                  >
                    Configurações Gerais
                  </button>
                  <button
                    type="button"
                    @click="setEditDensity(category.id, '6')"
                    class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1"
                    :class="getEditDensity(category.id) === '6'
                      ? (getPdfMode(category.id) === 'landscape' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white')
                      : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
                  >
                    1 por Página (Grande)
                  </button>
                  <button
                    type="button"
                    @click="setEditDensity(category.id, '3')"
                    class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1"
                    :class="getEditDensity(category.id) === '3'
                      ? (getPdfMode(category.id) === 'landscape' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white')
                      : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
                  >
                    2 por Página (Médio)
                  </button>
                  <button
                    type="button"
                    @click="setEditDensity(category.id, '1')"
                    class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1"
                    :class="getEditDensity(category.id) === '1'
                      ? (getPdfMode(category.id) === 'landscape' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white')
                      : 'bg-white text-slate-700 border border-gray-300 hover:bg-gray-50'"
                  >
                    6 por Página (Pequeno)
                  </button>
                </div>
                
                <!-- Botão para Tornar Padrão Global (exibido apenas se densidade for específica) -->
                <button
                  v-if="getEditDensity(category.id) !== 'geral'"
                  type="button"
                  @click="applyDensityToGlobal(category)"
                  class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 hover:text-emerald-800 transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span class="material-symbols-outlined text-xs">public</span>
                  Tornar Padrão Global
                </button>
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
                  <select v-model="getDensityTarget(category).titleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('titleFontFamily', getGlobalValue(category, 'titleFontFamily')) }}</option>
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
                  <input v-model="getDensityTarget(category).titleFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('titleFontSize', getGlobalValue(category, 'titleFontSize')) : '36px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Título Posição Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajusta o deslocamento vertical do título da página. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -5px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).titlePositionY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('titlePositionY', getGlobalValue(category, 'titlePositionY')) : '0px'" />
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
                  <input v-model="getDensityTarget(category).logoWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('logoWidth', getGlobalValue(category, 'logoWidth')) : '240px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Altura da Logo
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altura máxima (grossura) da caixa da logo na capa do PDF (Ex: 75px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).logoHeight" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('logoHeight', getGlobalValue(category, 'logoHeight')) : '75px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Logo Posição X (Right)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Posição horizontal da logo. Valores maiores movem para a ESQUERDA (afasta da borda), menores para a DIREITA (Ex: 60px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).logoPositionX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('logoPositionX', getGlobalValue(category, 'logoPositionX')) : '60px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Logo Posição Y (Top)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Posição vertical da logo. Valores maiores movem para BAIXO (afasta do topo), menores para CIMA (Ex: 60px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).logoPositionY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('logoPositionY', getGlobalValue(category, 'logoPositionY')) : '60px'" />
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
                  <select v-model="getDensityTarget(category).imagePosition" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('imagePosition', getGlobalValue(category, 'imagePosition')) }}</option>
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
                  <select v-model="getDensityTarget(category).cardHeaderLayout" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('cardHeaderLayout', getGlobalValue(category, 'cardHeaderLayout')) }}</option>
                    <option value="model-left">Modelo à Esq. / Tag à Dir.</option>
                    <option value="model-right">Tag à Esq. / Modelo à Dir.</option>
                  </select>
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Ordem do Layout
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a ordem no card de 2 produtos: se a ficha técnica (specs) ou a imagem aparece primeiro.">!</span>
                  </label>
                  <select v-model="getDensityTarget(category).cardLayoutOrder" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('cardLayoutOrder', getGlobalValue(category, 'cardLayoutOrder')) }}</option>
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
                  <input v-model="getDensityTarget(category).productSpacing" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('productSpacing', getGlobalValue(category, 'productSpacing')) : '24px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Foto Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical das fotos dos produtos. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).productImageOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('productImageOffsetY', getGlobalValue(category, 'productImageOffsetY')) : '0px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Foto Deslocamento X (Padrão)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal padrão das fotos dos produtos. Pode ser sobrescrito individualmente por produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).productImageOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('productImageOffsetX', getGlobalValue(category, 'productImageOffsetX')) : '0px'" />
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
                  <input v-model="getDensityTarget(category).pdfImageScale" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScale', getGlobalValue(category, 'pdfImageScale')) : '1.0'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Escala Horizontal
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão horizontal (largura) da imagem.">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).pdfImageScaleX" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScaleX', getGlobalValue(category, 'pdfImageScaleX')) : '1.0'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Escala Vertical
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aumenta ou diminui a dimensão vertical (altura) da imagem.">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).pdfImageScaleY" type="number" step="0.1" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('pdfImageScaleY', getGlobalValue(category, 'pdfImageScaleY')) : '1.0'" />
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
                  <input v-model="getDensityTarget(category).cardOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetX', getGlobalValue(category, 'cardOffsetX')) : '0px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical de todo o bloco de informações. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).cardOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetY', getGlobalValue(category, 'cardOffsetY')) : '0px'" />
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
                  <select v-model="getDensityTarget(category).cardTitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('cardTitleFontFamily', getGlobalValue(category, 'cardTitleFontFamily')) }}</option>
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
                  <select v-model="getDensityTarget(category).cardModelFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('cardModelFontFamily', getGlobalValue(category, 'cardModelFontFamily')) }}</option>
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
                  <input v-model="getDensityTarget(category).cardModelFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('cardModelFontSize', getGlobalValue(category, 'cardModelFontSize')) : '24px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Modelo Desloc. X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do código do modelo (SKU) no card. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).cardModelOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetX', getGlobalValue(category, 'cardModelOffsetX')) : '0px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Card Modelo Desloc. Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do código do modelo (SKU) no card. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).cardModelOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetY', getGlobalValue(category, 'cardModelOffsetY')) : '0px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Fonte da Tag/Status
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada na Tag/Status (ex: CO2) no canto do card.">!</span>
                  </label>
                  <select v-model="getDensityTarget(category).tagFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('tagFontFamily', getGlobalValue(category, 'tagFontFamily')) }}</option>
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
                  <input v-model="getDensityTarget(category).tagFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('tagFontSize', getGlobalValue(category, 'tagFontSize')) : '10px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tag Deslocamento X
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal da Tag/Status. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).tagOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('tagOffsetX', getGlobalValue(category, 'tagOffsetX')) : '0px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Tag Deslocamento Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical da Tag/Status. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).tagOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('tagOffsetY', getGlobalValue(category, 'tagOffsetY')) : '0px'" />
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
                  <select v-model="getDensityTarget(category).specsFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('specsFontFamily', getGlobalValue(category, 'specsFontFamily')) }}</option>
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
                  <input v-model="getDensityTarget(category).fontSizeSpecs" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('fontSizeSpecs', getGlobalValue(category, 'fontSizeSpecs')) : '10px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Largura Rótulo Specs (%)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura reservada para os nomes/rótulos das especificações em relação ao card total (Ex: 45%).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).specsLabelWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('specsLabelWidth', getGlobalValue(category, 'specsLabelWidth')) : '45%'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Largura Valor Specs (%)
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura reservada para os valores das especificações em relação ao card total (Ex: 55%).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).specsValueWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('specsValueWidth', getGlobalValue(category, 'specsValueWidth')) : '55%'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Espaçamento Specs Y
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Espaçamento interno vertical (padding) de cada linha de especificação técnica (Ex: 4px).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).specsPaddingY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('specsPaddingY', getGlobalValue(category, 'specsPaddingY')) : '4px'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Estilo Linha Specs
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Estilo da linha divisória entre cada especificação (Tracejado, Contínuo, Pontilhado ou Nenhum).">!</span>
                  </label>
                  <select v-model="getDensityTarget(category).specsLineStyle" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white">
                    <option v-if="getEditDensity(category.id) !== 'geral'" value="">(Herdado) {{ translateValue('specsLineStyle', getGlobalValue(category, 'specsLineStyle')) }}</option>
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
                  <input v-model="getDensityTarget(category).specsLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white font-mono" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('specsLineColor', getGlobalValue(category, 'specsLineColor')) : '#cbd5e1'" />
                </div>
                <div>
                  <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                    Cor da Linha Divisória
                    <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor da linha horizontal que separa os produtos nos layouts de múltiplos itens por página (Ex: #cbd5e1).">!</span>
                  </label>
                  <input v-model="getDensityTarget(category).dividerLineColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white font-mono" :placeholder="getEditDensity(category.id) !== 'geral' ? 'Herdado: ' + translateValue('dividerLineColor', getGlobalValue(category, 'dividerLineColor')) : '#cbd5e1'" />
                </div>
              </div>

              <!-- ESTILOS E DECORAÇÕES DO TEXTO -->
              <div class="pt-4 border-t border-gray-200 mt-4">
                <span class="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Estilos e Decorações do Texto</span>
                <div class="grid grid-cols-4 gap-4 text-xs">
                  <!-- Título Categoria -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Categoria</span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).titleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).titleBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'titleBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).titleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).titleItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'titleItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).titleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).titleUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'titleUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Título Produto -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Título Produto</span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardTitleBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).cardTitleBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardTitleItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).cardTitleItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardTitleUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).cardTitleUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardTitleUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Modelo Produto -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Modelo Produto</span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardModelBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).cardModelBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardModelBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardModelItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).cardModelItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardModelItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).cardModelUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).cardModelUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'cardModelUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Specs Rótulo (Esquerda) -->
                  <div class="space-y-2">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center">
                      Specs Rótulo (Esq.)
                      <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aplica formatação apenas à coluna da esquerda (nomes dos parâmetros, ex: Diâmetro, Rosca).">!</span>
                    </span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).specsBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).specsItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).specsUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Specs Valor (Direita) -->
                  <div class="space-y-2 mt-4">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center">
                      Specs Valor (Dir.)
                      <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Aplica formatação apenas à coluna da direita (valores e detalhes técnicos, ex: 1/2, NPT).">!</span>
                    </span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsValBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).specsValBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsValBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsValItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).specsValItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsValItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).specsValUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).specsValUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'specsValUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Tag / Status -->
                  <div class="space-y-2 mt-4">
                    <span class="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tag / Status</span>
                    <div class="space-y-1.5">
                      <!-- Bold -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).tagBold" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Negrito</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Negrito</span>
                        <select v-model="getDensityTarget(category).tagBold" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'tagBold') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Italic -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).tagItalic" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Itálico</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Itálico</span>
                        <select v-model="getDensityTarget(category).tagItalic" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'tagItalic') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>

                      <!-- Underline -->
                      <div v-if="getEditDensity(category.id) === 'geral'">
                        <label class="flex items-center space-x-1.5 cursor-pointer">
                          <input type="checkbox" v-model="getDensityTarget(category).tagUnderline" @change="category.hasChanges = true" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span class="text-gray-650 font-medium">Sublinhado</span>
                        </label>
                      </div>
                      <div v-else class="flex flex-col space-y-0.5">
                        <span class="text-gray-500 font-semibold text-[9px] uppercase">Sublinhado</span>
                        <select v-model="getDensityTarget(category).tagUnderline" @change="category.hasChanges = true" class="border border-gray-300 p-0.5 rounded bg-white text-[10px] w-full">
                          <option value="">Herdado ({{ getGlobalValue(category, 'tagUnderline') ? 'Sim' : 'Não' }})</option>
                          <option :value="true">Sim</option>
                          <option :value="false">Não</option>
                        </select>
                      </div>
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
import { ref, computed, watch } from 'vue'
import { hexToBase64 } from '../utils/image'

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
  (e: 'publish-catalog', category: Category): void
}>()

const newCategoryName = ref('')
const newCategorySegmentType = ref<'especifica' | 'geral'>('especifica')
const hasGeralCategory = computed(() => {
  return props.categories.some(c => c.category.toUpperCase().trim() === 'GERAL')
})
watch(newCategorySegmentType, (val) => {
  if (val === 'geral') {
    newCategoryName.value = 'GERAL'
  } else {
    newCategoryName.value = ''
  }
})
const replicateModalOpen = ref(false)
const sourceCategory = ref<Category | null>(null)
const selectedTargets = ref<string[]>([])
const fileInputs = ref<Record<string, HTMLInputElement | null>>({})
const pdfFileInputs = ref<Record<string, HTMLInputElement | null>>({})
const openCategorySettings = ref<Record<string, boolean>>({})
const uploadingCategories = ref<Record<string, boolean>>({})
const uploadingPdfs = ref<Record<string, boolean>>({})

const triggerPdfUpload = (id: string) => {
  const input = pdfFileInputs.value[id]
  if (input) {
    input.click()
  }
}

const handlePdfChange = async (event: Event, category: Category) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingPdfs.value[category.id] = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload do PDF')
    }

    const data = await response.json()
    category.pdfUrl = data.url
    category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading category PDF to R2:', error)
    alert(`Erro no upload do PDF: ${error.message || error}`)
  } finally {
    uploadingPdfs.value[category.id] = false
    target.value = '' // Reset input
  }
}

const removePdfUrl = (category: Category) => {
  category.pdfUrl = null
  category.hasChanges = true
}

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

// ── Controle de Densidade (Quantidade de produtos por página) ───────────
// Rastreia se estamos editando 'geral', '1' (6 prod/pag), '3' (2 prod/pag) ou '6' (1 prod/pag)
const pdfEditDensity = ref<Record<string, 'geral' | '1' | '3' | '6'>>({})

const getEditDensity = (id: string) => pdfEditDensity.value[id] || 'geral'

const setEditDensity = (id: string, density: 'geral' | '1' | '3' | '6') => {
  pdfEditDensity.value[id] = density
}

/**
 * Retorna o valor padrão/global do campo na orientação ativa (portrait ou landscape).
 * Usado para placeholders e dropdowns de herança.
 */
const getGlobalValue = (category: any, fieldName: string) => {
  const mode = getPdfMode(category.id)
  if (mode === 'landscape') {
    // Se for paisagem, herda do valor geral de paisagem, ou se este for nulo/undefined, do portrait
    if (category.landscapeSettings && category.landscapeSettings[fieldName] !== undefined && category.landscapeSettings[fieldName] !== '') {
      return category.landscapeSettings[fieldName]
    }
    return category[fieldName]
  }
  return category[fieldName]
}

/**
 * Retorna o destino de gravação (v-model) apropriado para o campo.
 * Se a densidade for 'geral':
 *   - portrait: o próprio objeto category
 *   - landscape: o sub-objeto category.landscapeSettings
 * Se a densidade for específica ('1', '3', '6'):
 *   - portrait: category.layout_settings[density]
 *   - landscape: category.landscapeSettings.layout_settings[density]
 */
const getDensityTarget = (category: any) => {
  const mode = getPdfMode(category.id)
  const density = getEditDensity(category.id)

  if (density === 'geral') {
    if (mode === 'landscape') {
      if (!category.landscapeSettings) {
        category.landscapeSettings = {}
      }
      return category.landscapeSettings
    }
    return category
  }

  // Densidade específica
  let root: any = category
  if (mode === 'landscape') {
    if (!category.landscapeSettings) {
      category.landscapeSettings = {}
    }
    root = category.landscapeSettings
  }

  if (!root.layout_settings) {
    root.layout_settings = {}
  }
  if (!root.layout_settings[density]) {
    root.layout_settings[density] = {}
  }
  return root.layout_settings[density]
}

/**
 * Traduz valores de configuração para português legível (para o dropdown de herança).
 */
const translateValue = (fieldName: string, value: any) => {
  if (value === undefined || value === null || value === '') return 'Não configurado'

  if (fieldName === 'imagePosition') {
    if (value === 'right') return 'Direita'
    if (value === 'left') return 'Esquerda'
    if (value === 'center') return 'Centralizado'
  }
  if (fieldName === 'cardHeaderLayout') {
    if (value === 'model-left') return 'Modelo à Esq. / Tag à Dir.'
    if (value === 'model-right') return 'Tag à Esq. / Modelo à Dir.'
  }
  if (fieldName === 'cardLayoutOrder') {
    if (value === 'specs-first') return 'Ficha Técnica Primeiro'
    if (value === 'image-first') return 'Imagem Primeiro'
  }
  if (fieldName === 'specsLineStyle') {
    if (value === 'dashed') return 'Tracejado (dashed)'
    if (value === 'solid') return 'Contínuo (solid)'
    if (value === 'dotted') return 'Pontilhado (dotted)'
    if (value === 'none') return 'Nenhum'
  }
  if (typeof value === 'boolean') {
    return value ? 'Ativado' : 'Desativado'
  }
  return String(value)
}

/**
 * Copia todas as configurações da densidade atualmente ativa para as configurações globais/padrão
 * da categoria na orientação correspondente, limpando depois os overrides daquela densidade.
 */
const applyDensityToGlobal = (category: any) => {
  const density = getEditDensity(category.id)
  if (density === 'geral') return

  const densityLabel = density === '6' ? '1 Produto por Página' : density === '3' ? '2 Produtos por Página' : '6 Produtos por Página'
  if (!confirm(`Deseja realmente aplicar as configurações de "${densityLabel}" como o padrão global para esta categoria?`)) {
    return
  }

  const mode = getPdfMode(category.id)
  let root: any = category
  if (mode === 'landscape') {
    if (!category.landscapeSettings) {
      category.landscapeSettings = {}
    }
    root = category.landscapeSettings
  }

  if (root.layout_settings && root.layout_settings[density]) {
    const overrides = root.layout_settings[density]
    // Copiar todas as chaves definidas nos overrides para o padrão global (root)
    for (const key of Object.keys(overrides)) {
      const val = overrides[key]
      if (val !== undefined && val !== null && val !== '') {
        root[key] = val
      }
    }
    // Limpar os overrides dessa densidade para que passe a herdar o novo padrão
    delete root.layout_settings[density]
  }

  category.hasChanges = true
  // Retorna à aba geral após a cópia
  setEditDensity(category.id, 'geral')
}

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
  let name = ''
  if (newCategorySegmentType.value === 'geral') {
    name = 'GERAL'
  } else {
    name = newCategoryName.value.trim()
  }
  
  if (name) {
    emit('create-category', name)
    newCategoryName.value = ''
    newCategorySegmentType.value = 'especifica'
  }
}

const triggerImageUpload = (id: string) => {
  const input = fileInputs.value[id]
  if (input) {
    input.click()
  }
}

const handleImageChange = async (event: Event, category: Category) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingCategories.value[category.id] = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Erro ao fazer upload da capa')
    }

    const data = await response.json()
    category.coverImageUrl = data.url
    category.coverImageBlob = null // clear legacy hex blob
    category.hasChanges = true
  } catch (error: any) {
    console.error('Error uploading category cover to R2:', error)
    alert(`Erro no upload da capa: ${error.message || error}`)
  } finally {
    uploadingCategories.value[category.id] = false
    target.value = '' // Reset input
  }
}

const getCoverImage = (category: Category) => {
  if (category.coverImageBlob) {
    if (category.coverImageBlob.startsWith('data:')) return category.coverImageBlob
    if (category.coverImageBlob.startsWith('\\x')) {
      try {
        return `data:image/png;base64,${hexToBase64(category.coverImageBlob)}`
      } catch (e) {
        return '/placeholder.png'
      }
    }
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