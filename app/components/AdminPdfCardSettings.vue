<template>
  <div class="contents">
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-2 flex justify-between items-center">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Ajustes Finos do Card (Modelo/Título)</span>
      <button 
        type="button" 
        @click="$emit('replicate-section', ['cardOffsetX', 'cardOffsetY', 'cardTitleOffsetX', 'cardTitleOffsetY', 'cardTitleFontFamily', 'cardTitleColor', 'cardTitleBold', 'cardTitleItalic', 'cardTitleUnderline', 'cardModelFontSize', 'cardModelOffsetX', 'cardModelOffsetY', 'cardModelFontFamily', 'cardModelColor', 'cardModelBold', 'cardModelItalic', 'cardModelUnderline', 'cardModelLabelText', 'cardModelLabelFontSize', 'cardModelLabelOffsetX', 'cardModelLabelOffsetY', 'cardModelLabelFontFamily', 'cardModelLabelColor', 'cardModelLabelBold', 'cardModelLabelItalic', 'cardModelLabelUnderline', 'headerOffsetX', 'headerOffsetY', 'headerWidth', 'headerHeight', 'specsOffsetX', 'specsOffsetY', 'specsWidth', 'specsHeight', 'blockGap'])" 
        class="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center gap-1 uppercase"
      >
        <span class="material-symbols-outlined text-xs">content_copy</span>
        Replicar
      </button>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Deslocamento X (Geral)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="ATENÇÃO: Este ajuste move AMBOS os blocos juntos (o azul e o cinza) para a esquerda ou direita ao mesmo tempo. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.cardOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetX', getGlobalValue(category, 'cardOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Deslocamento Y (Geral)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="ATENÇÃO: Este ajuste move AMBOS os blocos juntos (o azul e o cinza) para cima ou para baixo ao mesmo tempo. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.cardOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardOffsetY', getGlobalValue(category, 'cardOffsetY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Título Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do título do produto. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardTitleOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0px" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Título Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do título do produto. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardTitleOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0px" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Título Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no título do produto nos cards do PDF.">!</span>
      </label>
      <select v-model="target.cardTitleFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardTitleFontFamily', getGlobalValue(category, 'cardTitleFontFamily')) }}</option>
        <option value="Arial">Arial</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Calibri">Calibri</option>
        <option value="Century Gothic">Century Gothic</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Hanken Grotesk">Hanken Grotesk</option>
        <option value="Impact">Impact</option>
        <option value="Inter">Inter</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Montserrat Extra Bold">Montserrat Extra Bold</option>
        <option value="Outfit">Outfit</option>
        <option value="Roboto">Roboto</option>
        <option value="Segoe UI">Segoe UI</option>
        <option value="Source Sans Pro">Source Sans Pro</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor do Título Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do título do produto nos cards.">!</span>
      </label>
      <div class="flex items-center gap-1.5">
        <input :value="target.cardTitleColor || getGlobalValue(category, 'cardTitleColor') || '#ffffff'" type="color" @input="(e: any) => { target.cardTitleColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.cardTitleColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardTitleColor', getGlobalValue(category, 'cardTitleColor')) : '#ffffff'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Modelo Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada no código do modelo (SKU) nos cards do PDF.">!</span>
      </label>
      <select v-model="target.cardModelFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardModelFontFamily', getGlobalValue(category, 'cardModelFontFamily')) }}</option>
        <option value="Arial">Arial</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Calibri">Calibri</option>
        <option value="Century Gothic">Century Gothic</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Hanken Grotesk">Hanken Grotesk</option>
        <option value="Impact">Impact</option>
        <option value="Inter">Inter</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Montserrat Extra Bold">Montserrat Extra Bold</option>
        <option value="Outfit">Outfit</option>
        <option value="Roboto">Roboto</option>
        <option value="Segoe UI">Segoe UI</option>
        <option value="Source Sans Pro">Source Sans Pro</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor do Modelo Card
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor do código do modelo (SKU) nos cards.">!</span>
      </label>
      <div class="flex items-center gap-1.5">
        <input :value="target.cardModelColor || getGlobalValue(category, 'cardModelColor') || '#ffffff'" type="color" @input="(e: any) => { target.cardModelColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.cardModelColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelColor', getGlobalValue(category, 'cardModelColor')) : '#ffffff'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Tamanho Fonte Modelo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do texto do código do modelo (SKU) no card (Ex: 24px).">!</span>
      </label>
      <input v-model="target.cardModelFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelFontSize', getGlobalValue(category, 'cardModelFontSize')) : '24px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Modelo Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal apenas do código do modelo (SKU) no card. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetX', getGlobalValue(category, 'cardModelOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Card Modelo Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical apenas do código do modelo (SKU) no card. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelOffsetY', getGlobalValue(category, 'cardModelOffsetY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Texto do Rótulo Modelo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altera a palavra 'Modelo' que fica acima do SKU (ex: 'Código', 'SKU', 'Modelo', etc).">!</span>
      </label>
      <input v-model="target.cardModelLabelText" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelLabelText', getGlobalValue(category, 'cardModelLabelText')) : 'Modelo'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Rótulo Modelo Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento horizontal da palavra 'MODELO' no card. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelLabelOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelLabelOffsetX', getGlobalValue(category, 'cardModelLabelOffsetX')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Rótulo Modelo Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Deslocamento vertical da palavra 'MODELO' no card. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.cardModelLabelOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelLabelOffsetY', getGlobalValue(category, 'cardModelLabelOffsetY')) : '0px'" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Fonte do Rótulo Modelo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Família de fonte usada na palavra 'MODELO' no card.">!</span>
      </label>
      <select v-model="target.cardModelLabelFontFamily" @change="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs">
        <option v-if="density !== 'geral'" value="">(Herdado) {{ translateValue('cardModelLabelFontFamily', getGlobalValue(category, 'cardModelLabelFontFamily')) }}</option>
        <option value="Arial">Arial</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Calibri">Calibri</option>
        <option value="Century Gothic">Century Gothic</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Hanken Grotesk">Hanken Grotesk</option>
        <option value="Impact">Impact</option>
        <option value="Inter">Inter</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Montserrat Extra Bold">Montserrat Extra Bold</option>
        <option value="Outfit">Outfit</option>
        <option value="Roboto">Roboto</option>
        <option value="Segoe UI">Segoe UI</option>
        <option value="Source Sans Pro">Source Sans Pro</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Cor do Rótulo Modelo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Cor da palavra 'MODELO' nos cards.">!</span>
      </label>
      <div class="flex items-center gap-1.5">
        <input :value="target.cardModelLabelColor || getGlobalValue(category, 'cardModelLabelColor') || '#ffffff'" type="color" @input="(e: any) => { target.cardModelLabelColor = e.target.value; category.hasChanges = true; }" class="w-8 h-8 p-0 border border-gray-300 bg-transparent cursor-pointer rounded shrink-0" />
        <input v-model="target.cardModelLabelColor" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs font-mono" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelLabelColor', getGlobalValue(category, 'cardModelLabelColor')) : '#ffffff'" />
      </div>
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Tamanho Fonte Rótulo
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-650 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Tamanho do texto da palavra 'MODELO' no card.">!</span>
      </label>
      <input v-model="target.cardModelLabelFontSize" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" :placeholder="density !== 'geral' ? 'Herdado: ' + translateValue('cardModelLabelFontSize', getGlobalValue(category, 'cardModelLabelFontSize')) : '8px'" />
    </div>
    <div class="col-span-2 md:col-span-4 border-b border-gray-200 pb-1 mt-4">
      <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Ajustes Posicionamento de Blocos (Independente)</span>
      <p class="text-[9px] text-gray-500 mt-0.5 leading-snug">
        ⚠️ Valores em <strong>mm</strong> ou <strong>px</strong> (ex: <code>5</code> = 5mm, <code>15px</code> ≈ 4mm). Deixar em branco = automático.
      </p>
    </div>

    <!-- Espaço entre Blocos (Gap) -->
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Espaço entre Blocos (Gap)
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Define o espaço de separação vertical (lacuna branca) entre o Bloco Azul e o Bloco Cinza. Deixe em branco para usar o padrão (1.5mm).">!</span>
      </label>
      <input v-model="target.blockGap" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="(padrão) ex: 1.5 ou 2" />
    </div>
    <div class="hidden md:block"></div>
    <div class="hidden md:block"></div>
    <div class="hidden md:block"></div>

    <!-- Bloco Azul (Header) -->
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Bloco Azul Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajuste horizontal INDEPENDENTE apenas para o bloco azul (cabeçalho de título/modelo). Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.headerOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0 (sem deslocamento)" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Bloco Azul Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajuste vertical INDEPENDENTE apenas para o bloco azul. Permite distanciar ou aproximar o bloco azul do bloco cinza de especificações. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.headerOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0 (sem deslocamento)" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Largura Bloco Azul
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura do bloco azul de cabeçalho. Permite alargar ou estreitar apenas o bloco azul. (Ex: 110px, 120px).">!</span>
      </label>
      <input v-model="target.headerWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="(automático) ex: 110" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Altura Bloco Azul
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altura do bloco azul de cabeçalho. Útil se o nome/modelo do produto precisar de mais ou menos espaço vertical. (Ex: 22px, 18px, 12px).">!</span>
      </label>
      <input v-model="target.headerHeight" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="(automático) ex: 22" />
    </div>

    <!-- Bloco Cinza (Specs) -->
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Bloco Cinza Desloc. X
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajuste horizontal INDEPENDENTE apenas para o bloco cinza de especificações. Valores positivos movem para a DIREITA, negativos para a ESQUERDA (Ex: 5px, -5px).">!</span>
      </label>
      <input v-model="target.specsOffsetX" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0 (sem deslocamento)" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Bloco Cinza Desloc. Y
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Ajuste vertical INDEPENDENTE apenas para o bloco cinza. Permite mover a tabela de especificações para cima ou para baixo. Valores positivos movem para BAIXO, negativos para CIMA (Ex: 10px, -10px).">!</span>
      </label>
      <input v-model="target.specsOffsetY" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="0 (sem deslocamento)" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Largura Bloco Cinza
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Largura do bloco cinza de especificações. Útil para deixar a tabela de especificações mais larga ou estreita no layout. (Ex: 110px, 120px).">!</span>
      </label>
      <input v-model="target.specsWidth" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="(automático) ex: 110" />
    </div>
    <div>
      <label class="flex items-center text-[10px] text-gray-500 font-semibold mb-1 uppercase">
        Altura Bloco Cinza
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-3.5 h-3.5 text-[9px] font-bold cursor-help ml-1 shrink-0" title="Altura do bloco cinza de especificações. Permite esticar ou encurtar a caixa cinza verticalmente. (Ex: 150px, 200px).">!</span>
      </label>
      <input v-model="target.specsHeight" type="text" @input="category.hasChanges = true" class="w-full border border-gray-300 p-2 rounded bg-white text-xs" placeholder="(automático) ex: 80" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  target: any
  category: any
  density: string
  getGlobalValue: (category: any, fieldName: string) => any
  translateValue: (fieldName: string, value: any) => string
}>()

defineEmits(['replicate-section'])
</script>
