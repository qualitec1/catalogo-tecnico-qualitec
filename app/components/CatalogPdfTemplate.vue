<template>
  <div v-if="rendering" class="fixed top-0 left-0 w-full h-full bg-white z-[9999] overflow-auto flex flex-col items-center py-10">
    <div class="text-xl font-bold mb-4 text-blue-600 animate-pulse">Gerando Catálogo, aguarde...</div>
    
    <!-- PDF Content Container -->
    <div id="pdf-content" class="bg-white shadow-xl">
      <!-- Capa do Catálogo (Estilo Modelo Catalogo) -->
      <div class="pdf-page bg-white relative break-after-page overflow-hidden block" 
           :class="isLandscape ? 'w-[1122px]' : 'w-[794px]'"
           :style="{ 
             fontFamily: '\'Inter\', sans-serif',
             width: isLandscape ? '297mm' : '210mm',
             height: isLandscape ? '209.5mm' : '296.5mm',
             maxHeight: isLandscape ? '210mm' : '297mm'
           }">
        <!-- Logo no Canto Superior Direito -->
        <div class="absolute flex items-center justify-end bg-white"
             :style="{ 
               top: formatDimension(getPageSettings([]).logo_position_y, '60px'), 
               right: formatDimension(getPageSettings([]).logo_position_x, '60px')
             }">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJOpxk8IRBgRW2bvQlS_z4LoXARfSvqvz2saPXY9SVEh_22Bcd1VS5ijTW9c3L5WiWT0idDIuscN94pofAxJzmGnXWNILAeSKTQdpe0NSl8pmXlo5Mo2KzPIESuDMk-6ap5WOs_icm6enTpaiHanmAbwntVxfvVTPLdAKIwMg7L88cyvuALuJQqv2-2ntPUxn3BgVkSCLfjyupjGSuOW5zhpBXbfo-ac3ZkUg-WHHUrhMMhz1XIsk_yPD5jMMWbkCwWOJV1BBvHWM" 
               alt="Qualitec Logo" 
               :style="{
                 width: 'auto',
                 height: 'auto',
                 maxWidth: formatDimension(getPageSettings([]).logo_width, '240px'),
                 maxHeight: formatDimension(getPageSettings([]).logo_height, '75px')
               }"
               class="object-contain"
               crossorigin="anonymous" />
        </div>

        <!-- Faixa Cinza Clara (Fundo da metade do bloco até acima do link) -->
        <div class="absolute left-0 w-full bg-[#f0f2f5] z-0"
             :class="isLandscape ? 'top-[370px] bottom-[60px]' : 'top-[540px] bottom-[80px]'"></div>

        <!-- Bloco de Categoria (Esquerda) -->
        <div class="absolute left-0 w-[550px] text-white py-10 px-12 flex flex-col justify-center shadow-sm z-10"
             :style="{ 
               backgroundColor: getBgColor(catalogBgClass, catalogCategory),
               top: isLandscape
                 ? `calc(280px + ${formatDimension(getPageSettings([]).title_position_y, '0px')})`
                 : `calc(440px + ${formatDimension(getPageSettings([]).title_position_y, '0px')})`,
               fontFamily: getPageSettings([]).title_font_family || 'Inter'
             }">
          <span class="text-[14px] uppercase tracking-[0.15em] font-medium opacity-90 mb-3 block">CATÁLOGO DE PRODUTOS</span>
          <h1 class="text-white uppercase leading-snug tracking-wide"
              :style="{ 
                fontSize: formatDimension(getPageSettings([]).title_font_size, '34px'),
                fontWeight: getPageSettings([]).title_bold ? 'bold' : 'normal',
                fontStyle: getPageSettings([]).title_italic ? 'italic' : 'normal',
                textDecoration: getPageSettings([]).title_underline ? 'underline' : 'none'
              }">
            {{ catalogCategory === 'VÁLVULAS' ? 'VÁLVULAS DE SEGURANÇA E ALÍVIO' : catalogCategory }}
          </h1>
        </div>

        <!-- Desenho/Esboço no Canto Inferior Direito -->
        <div class="absolute flex items-center justify-center"
             :class="isLandscape ? 'bottom-[70px] right-[40px] w-[480px] h-[300px]' : 'bottom-[90px] right-[40px] w-[460px] h-[340px]'">
          <img v-if="coverImageBlob || coverImageUrl" 
               :src="getCoverImageSrc(coverImageUrl, coverImageBlob)" 
               class="max-w-full max-h-full object-contain mix-blend-multiply opacity-90" 
               crossorigin="anonymous" />
        </div>

        <!-- Rodapé do Site Alinhado à Esquerda (Link clicável) -->
        <a href="https://www.qualitec.ind.br" 
           target="_blank" 
           class="absolute left-[60px] text-[11px] text-gray-400 font-medium tracking-[0.3em] hover:text-[#2b5c90] no-underline transition-colors"
           :class="isLandscape ? 'bottom-[35px]' : 'bottom-[50px]'">
          w w w . q u a l i t e c . i n d . b r
        </a>
      </div>

      <!-- Páginas de Produtos -->
      <div v-for="(page, pageIdx) in pages" :key="pageIdx" 
           class="pdf-page flex flex-col bg-white relative break-after-page"
           :class="isLandscape ? 'w-[1122px] pt-4 px-12 pb-4' : 'w-[794px] pt-6 px-12 pb-6'"
           :style="{
             width: isLandscape ? '297mm' : '210mm',
             height: isLandscape ? '209.5mm' : '296.5mm',
             maxHeight: isLandscape ? '210mm' : '297mm'
           }">
        <!-- Header da Página -->
        <div class="mb-4" :style="{ position: 'relative', top: formatDimension(getPageSettings(page).title_position_y, '0px') }">
          <h1 class="uppercase tracking-wide" :style="{ color: getBgColor(page[0]?.bgClass || catalogBgClass, page[0]?.category || catalogCategory), fontSize: formatDimension(getPageSettings(page).title_font_size, '36px'), fontFamily: getPageSettings(page).title_font_family || 'Inter', fontWeight: getPageSettings(page).title_bold ? 'bold' : 'normal', fontStyle: getPageSettings(page).title_italic ? 'italic' : 'normal', textDecoration: getPageSettings(page).title_underline ? 'underline' : 'none' }">
            {{ page[0]?.category || catalogCategory }}
          </h1>
        </div>

        <!-- Grid de Produtos: 3 colunas x 2 linhas = 6 slots -->
        <!-- layout_slots: 6 (col-span-3 row-span-2), 3 (col-span-3 row-span-1), 1 (col-span-1 row-span-1) -->
        <div class="flex-grow grid grid-cols-3 grid-rows-2 gap-x-6 mt-4 content-start relative" :style="{ rowGap: formatDimension(getPageSettings(page).product_spacing, '24px') }">
          <!-- Separador horizontal -->
          <div v-if="page.length > 3 && getSlots(page[0]) === 1" class="absolute top-1/2 left-0 w-full h-[1px] bg-gray-400 -translate-y-1/2"></div>

          <div v-for="(product, productIdx) in page" :key="product.id" 
               :class="{
                 'col-span-3 row-span-2': getSlots(product) === 6,
                 'col-span-3 row-span-1': getSlots(product) === 3,
                 'col-span-1 row-span-1': getSlots(product) === 1
               }" 
               class="flex flex-col relative">
            
            <div class="flex flex-col h-full">
              
              <!-- LAYOUT GRUPO 6 (6 por página - slots: 1) - Estilo Novo / Fiel -->
              <div v-if="getSlots(product) === 1" class="flex flex-col h-full w-full justify-between">
                <!-- Imagem com altura fixa e alinhamento pela base para que todas comecem na mesma linha -->
                <div class="flex items-end justify-center relative z-10" 
                     :class="isLandscape ? 'h-24' : 'h-32'">
                  <img v-if="product.imageBlob || product.image" :src="getProductImageSrc(product)" class="object-contain" :style="{ maxHeight: `${(isLandscape ? 80 : 112) * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_y || 1.0)}px`, maxWidth: `${90 * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_x || 1.0)}%`, position: 'relative', top: getProductImageOffsetY(product, page), left: getProductImageOffsetX(product, page) }" crossorigin="anonymous" @error="(e) => handleImageError(e, product)" />
                </div>
                
                <!-- Bloco Colorido + Especificações Wrapper -->
                <div class="flex flex-col flex-grow relative mt-2" :style="{ position: 'relative', top: formatDimension(getPageSettings(page).card_offset_y, '0px'), left: formatDimension(getPageSettings(page).card_offset_x, '0px') }">
                  <!-- Bloco Colorido -->
                  <div class="text-white px-4 flex justify-between items-center z-0" :class="isLandscape ? 'py-1.5' : 'py-3'" :style="{ backgroundColor: getBgColor(product.bgClass, product.category) }">
                    <div class="flex flex-col justify-center" :style="{ position: 'relative', left: formatDimension(getPageSettings(page).card_title_offset_x, '0px'), top: formatDimension(getPageSettings(page).card_title_offset_y, '0px') }">
                      <span class="text-[10px] font-bold uppercase tracking-wider">{{ product.category }}</span>
                      <span class="text-[11px] mt-0.5 text-white/90 leading-tight" :style="{ fontFamily: getPageSettings(page).card_title_font_family || 'Inter', fontWeight: getPageSettings(page).card_title_bold ? 'bold' : 'normal', fontStyle: getPageSettings(page).card_title_italic ? 'italic' : 'normal', textDecoration: getPageSettings(page).card_title_underline ? 'underline' : 'none' }">{{ product.title }}</span>
                    </div>
                    <div class="flex flex-col items-end justify-center" :style="{ position: 'relative', left: formatDimension(getPageSettings(page).card_model_offset_x, '0px'), top: formatDimension(getPageSettings(page).card_model_offset_y, '0px') }">
                      <span class="text-[8px] uppercase tracking-wider font-semibold text-white/90">Modelo</span>
                      <span class="text-3xl leading-none mt-1" :style="{ fontFamily: getPageSettings(page).card_model_font_family || 'Inter', fontSize: formatDimension(getPageSettings(page).card_model_font_size, '24px'), fontWeight: getPageSettings(page).card_model_bold ? 'bold' : 'normal', fontStyle: getPageSettings(page).card_model_italic ? 'italic' : 'normal', textDecoration: getPageSettings(page).card_model_underline ? 'underline' : 'none' }">{{ product.nameCode }}</span>
                    </div>
                  </div>
                  
                  <!-- Especificações -->
                  <div class="bg-white border-x border-b border-gray-200 flex-grow px-4 flex flex-col justify-between" :class="isLandscape ? 'py-2' : 'py-3'" :style="{ fontFamily: getPageSettings(page).specs_font_family || 'Inter' }">
                    <div v-if="product.specs && product.specs.length > 0" class="text-[9px] text-gray-800">
                      <div v-for="(spec, idx) in product.specs" :key="idx" 
                           class="flex justify-between last:border-b-0"
                           :style="{
                             paddingTop: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '2px' : '4px'),
                             paddingBottom: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '2px' : '4px'),
                             borderBottomWidth: (getPageSettings(page).specs_line_style || 'dashed') === 'none' ? '0px' : '1px',
                             borderBottomStyle: getPageSettings(page).specs_line_style || 'dashed',
                             borderBottomColor: getPageSettings(page).specs_line_color || '#cbd5e1'
                           }">
                        <span class="pr-2 text-left" 
                              :style="{ 
                                width: formatDimension(getPageSettings(page).specs_label_width, '45%'),
                                fontWeight: getPageSettings(page).specs_bold ? 'bold' : 'normal', 
                                fontStyle: getPageSettings(page).specs_italic ? 'italic' : 'normal', 
                                textDecoration: getPageSettings(page).specs_underline ? 'underline' : 'none'
                              }">{{ spec.label }}</span>
                        <span class="text-right text-gray-850" 
                              :style="{ 
                                width: formatDimension(getPageSettings(page).specs_value_width, '55%'),
                                fontWeight: getPageSettings(page).specs_val_bold ? 'bold' : 'normal', 
                                fontStyle: getPageSettings(page).specs_val_italic ? 'italic' : 'normal', 
                                textDecoration: getPageSettings(page).specs_val_underline ? 'underline' : 'none',
                                whiteSpace: 'pre-line'
                              }">{{ spec.value }}</span>
                      </div>
                    </div>
                    
                    <!-- Link do Datasheet (se houver) -->
                    <div v-if="product.datasheetName || product.datasheetUrl" class="mt-2 text-right">
                      <a :href="getDatasheetLink(product)" 
                         target="_blank" 
                         class="text-[8px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider underline flex items-center justify-end gap-1">
                        <span class="material-symbols-outlined text-[10px]">picture_as_pdf</span> Ficha Técnica
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- LAYOUT GRUPO 1 (1 por página - slots: 6) -->
              <div v-else-if="getSlots(product) === 6" class="flex flex-col h-full justify-between mt-2" :style="{ position: 'relative', top: formatDimension(getPageSettings(page).card_offset_y, '0px'), left: formatDimension(getPageSettings(page).card_offset_x, '0px') }">
                
                <!-- Centro: Imagem Gigante Centrada -->
                <div class="flex-grow flex items-center justify-center bg-white rounded-lg relative p-4 my-2"
                     :class="isLandscape ? 'max-h-[220px]' : 'max-h-[380px]'">
                  <img v-if="product.imageBlob || product.image" :src="getProductImageSrc(product)" class="object-contain mix-blend-multiply" :style="{ maxHeight: `${(isLandscape ? 200 : 350) * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_y || 1.0)}px`, maxWidth: `${100 * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_x || 1.0)}%`, position: 'relative', top: getProductImageOffsetY(product, page), left: getProductImageOffsetX(product, page) }" crossorigin="anonymous" @error="(e) => handleImageError(e, product)" />
                  <div v-else class="text-gray-300 text-sm text-center">Sem imagem</div>
                </div>
                
                <!-- Base: Tabela de Especificações Igual à Foto -->
                <div class="border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                  <!-- Cabeçalho Colorido com Modelo e Título -->
                  <div class="text-white flex flex-col gap-1" :class="isLandscape ? 'p-3' : 'p-5'" :style="{ backgroundColor: getBgColor(product.bgClass, product.category) }">
                    <div class="flex justify-between items-start" :style="{ flexDirection: getPageSettings(page).card_header_layout === 'model-right' ? 'row-reverse' : 'row' }">
                      <div :style="{ 
                        position: 'relative', 
                        left: formatDimension(getPageSettings(page).card_model_offset_x, '0px'), 
                        top: formatDimension(getPageSettings(page).card_model_offset_y, '0px'),
                        textAlign: getPageSettings(page).card_header_layout === 'model-right' ? 'right' : 'left'
                      }">
                        <span class="text-white/80 text-[10px] font-semibold uppercase tracking-wider block">Modelo</span>
                        <h4 class="text-white text-3xl leading-none" :style="{ fontFamily: getPageSettings(page).card_model_font_family || 'Inter', fontSize: formatDimension(getPageSettings(page).card_model_font_size, '24px'), fontWeight: getPageSettings(page).card_model_bold ? 'bold' : 'normal', fontStyle: getPageSettings(page).card_model_italic ? 'italic' : 'normal', textDecoration: getPageSettings(page).card_model_underline ? 'underline' : 'none' }">{{ product.nameCode }}</h4>
                      </div>
                      <span class="text-white uppercase tracking-wider mt-1"
                            :style="{ 
                              fontFamily: getPageSettings(page).tag_font_family || 'Inter',
                              fontSize: formatDimension(getPageSettings(page).tag_font_size, '10px'),
                              fontWeight: getPageSettings(page).tag_bold ? 'bold' : 'normal',
                              fontStyle: getPageSettings(page).tag_italic ? 'italic' : 'normal',
                              textDecoration: getPageSettings(page).tag_underline ? 'underline' : 'none',
                              position: 'relative',
                              left: formatDimension(getPageSettings(page).tag_offset_x, '0px'),
                              top: formatDimension(getPageSettings(page).tag_offset_y, '0px')
                            }">
                        {{ product.tag }}
                      </span>
                    </div>
                    <h3 class="text-white text-lg leading-tight mt-3" :style="{ 
                      position: 'relative', 
                      left: formatDimension(getPageSettings(page).card_title_offset_x, '0px'), 
                      top: formatDimension(getPageSettings(page).card_title_offset_y, '0px'), 
                      fontFamily: getPageSettings(page).card_title_font_family || 'Inter', 
                      fontWeight: getPageSettings(page).card_title_bold ? 'bold' : 'normal', 
                      fontStyle: getPageSettings(page).card_title_italic ? 'italic' : 'normal', 
                      textDecoration: getPageSettings(page).card_title_underline ? 'underline' : 'none',
                      textAlign: getPageSettings(page).card_header_layout === 'model-right' ? 'right' : 'left'
                    }">{{ product.title }}</h3>
                  </div>
                  
                  <!-- Tabela de Especificações com Fundo Cinza -->
                  <div v-if="product.specs && product.specs.length > 0" class="bg-[#f3f4f6]" :class="isLandscape ? 'p-3' : 'p-5'" :style="{ fontFamily: getPageSettings(page).specs_font_family || 'Inter' }">
                    <table class="w-full text-xs text-gray-750">
                      <tbody>
                        <tr v-for="(spec, idx) in product.specs" :key="idx" 
                            class="last:border-b-0"
                            :style="{
                              borderBottomWidth: (getPageSettings(page).specs_line_style || 'dashed') === 'none' ? '0px' : '1px',
                              borderBottomStyle: getPageSettings(page).specs_line_style || 'solid',
                              borderBottomColor: getPageSettings(page).specs_line_color || '#e5e7eb'
                            }">
                          <td class="px-0 text-gray-600 align-top text-left"
                              :style="{ 
                                width: formatDimension(getPageSettings(page).specs_label_width, '45%'),
                                paddingTop: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '4px' : '10px'),
                                paddingBottom: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '4px' : '10px'),
                                fontWeight: getPageSettings(page).specs_bold ? 'bold' : 'normal', 
                                fontStyle: getPageSettings(page).specs_italic ? 'italic' : 'normal', 
                                textDecoration: getPageSettings(page).specs_underline ? 'underline' : 'none'
                              }">
                            {{ spec.label }}
                          </td>
                          <td class="px-0 text-gray-900 text-right align-top"
                              :style="{ 
                                width: formatDimension(getPageSettings(page).specs_value_width, '55%'),
                                paddingTop: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '4px' : '10px'),
                                paddingBottom: formatDimension(getPageSettings(page).specs_padding_y, isLandscape ? '4px' : '10px'),
                                fontWeight: getPageSettings(page).specs_val_bold ? 'bold' : 'normal', 
                                fontStyle: getPageSettings(page).specs_val_italic ? 'italic' : 'normal', 
                                textDecoration: getPageSettings(page).specs_val_underline ? 'underline' : 'none',
                                whiteSpace: 'pre-line'
                              }">
                            {{ spec.value }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- LAYOUT GRUPO 2 (2 por página - slots: 3) -->
              <div v-else-if="getSlots(product) === 3" 
                   :style="{ flexDirection: getPageSettings(page).card_layout_order === 'image-first' ? 'row-reverse' : 'row' }"
                   class="flex h-full gap-8 py-2 relative items-stretch">
                <!-- Tabela de Especificações (Esquerda) -->
                <div class="w-[450px] border border-gray-200 rounded overflow-hidden flex flex-col shadow-sm justify-between bg-[#f3f4f6]" :style="{ position: 'relative', top: formatDimension(getPageSettings(page).card_offset_y, '0px'), left: formatDimension(getPageSettings(page).card_offset_x, '0px') }">
                   <div>
                     <!-- Cabeçalho Colorido com Modelo e Título -->
                     <div class="py-2 px-3 text-white flex flex-col gap-0.5" :style="{ backgroundColor: getBgColor(product.bgClass, product.category) }">
                       <div class="flex justify-between items-start" :style="{ flexDirection: getPageSettings(page).card_header_layout === 'model-right' ? 'row-reverse' : 'row' }">
                         <div :style="{ 
                            position: 'relative', 
                            left: formatDimension(getPageSettings(page).card_model_offset_x, '0px'), 
                            top: formatDimension(getPageSettings(page).card_model_offset_y, '0px'),
                            textAlign: getPageSettings(page).card_header_layout === 'model-right' ? 'right' : 'left'
                          }">
                           <span class="text-white/80 text-[8px] font-semibold uppercase tracking-wider block">Modelo</span>
                           <h4 class="text-white text-2xl leading-none" :style="{ fontFamily: getPageSettings(page).card_model_font_family || 'Inter', fontSize: formatDimension(getPageSettings(page).card_model_font_size, '24px'), fontWeight: getPageSettings(page).card_model_bold ? 'bold' : 'normal', fontStyle: getPageSettings(page).card_model_italic ? 'italic' : 'normal', textDecoration: getPageSettings(page).card_model_underline ? 'underline' : 'none' }">{{ product.nameCode }}</h4>
                         </div>
                         <span class="text-white uppercase tracking-wider mt-0.5"
                                :style="{ 
                                  fontFamily: getPageSettings(page).tag_font_family || 'Inter',
                                  fontSize: formatDimension(getPageSettings(page).tag_font_size, '9px'),
                                  fontWeight: getPageSettings(page).tag_bold ? 'bold' : 'normal',
                                  fontStyle: getPageSettings(page).tag_italic ? 'italic' : 'normal',
                                  textDecoration: getPageSettings(page).tag_underline ? 'underline' : 'none',
                                  position: 'relative',
                                  left: formatDimension(getPageSettings(page).tag_offset_x, '0px'),
                                  top: formatDimension(getPageSettings(page).tag_offset_y, '0px')
                                }">
                           {{ product.tag }}
                         </span>
                       </div>
                       <h3 class="text-white text-sm leading-tight mt-1.5" :style="{ 
                          position: 'relative', 
                          left: formatDimension(getPageSettings(page).card_title_offset_x, '0px'), 
                          top: formatDimension(getPageSettings(page).card_title_offset_y, '0px'), 
                          fontFamily: getPageSettings(page).card_title_font_family || 'Inter', 
                          fontWeight: getPageSettings(page).card_title_bold ? 'bold' : 'normal', 
                          fontStyle: getPageSettings(page).card_title_italic ? 'italic' : 'normal', 
                          textDecoration: getPageSettings(page).card_title_underline ? 'underline' : 'none',
                          textAlign: getPageSettings(page).card_header_layout === 'model-right' ? 'right' : 'left'
                        }">{{ product.title }}</h3>
                     </div>
                    
                     <!-- Tabela com Fundo Cinza e Bordas Tracejadas -->
                     <div class="bg-[#f3f4f6] py-2 px-3" :style="{ fontFamily: getPageSettings(page).specs_font_family || 'Inter' }">
                       <div v-if="product.specs && product.specs.length > 0" class="text-gray-850" :style="{ fontSize: formatDimension(getPageSettings(page).font_size_specs, '10px') }">
                         <div v-for="(spec, idx) in product.specs" :key="idx" 
                              class="flex justify-between last:border-b-0"
                              :style="{
                                paddingTop: formatDimension(getPageSettings(page).specs_padding_y, '0.5px'),
                                paddingBottom: formatDimension(getPageSettings(page).specs_padding_y, '0.5px'),
                                borderBottomWidth: (getPageSettings(page).specs_line_style || 'dashed') === 'none' ? '0px' : '1px',
                                borderBottomStyle: getPageSettings(page).specs_line_style || 'dashed',
                                borderBottomColor: getPageSettings(page).specs_line_color || '#cbd5e1'
                              }">
                           <span class="pr-2 text-left text-gray-600" 
                                 :style="{ 
                                   width: formatDimension(getPageSettings(page).specs_label_width, '45%'),
                                   fontWeight: getPageSettings(page).specs_bold ? 'bold' : 'normal', 
                                   fontStyle: getPageSettings(page).specs_italic ? 'italic' : 'normal', 
                                   textDecoration: getPageSettings(page).specs_underline ? 'underline' : 'none'
                                 }">{{ spec.label }}</span>
                           <span class="text-right text-gray-900" 
                                 :style="{ 
                                   width: formatDimension(getPageSettings(page).specs_value_width, '55%'),
                                   fontWeight: getPageSettings(page).specs_val_bold ? 'bold' : 'normal', 
                                   fontStyle: getPageSettings(page).specs_val_italic ? 'italic' : 'normal', 
                                   textDecoration: getPageSettings(page).specs_val_underline ? 'underline' : 'none',
                                   whiteSpace: 'pre-line'
                                 }">{{ spec.value }}</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   <!-- Download do Datasheet PDF no rodapé do card cinza -->
                   <div v-if="product.datasheetName || product.datasheetUrl" class="bg-[#f3f4f6] px-3 pb-2 text-right">
                     <a :href="getDatasheetLink(product)" 
                        target="_blank" 
                        class="text-[8px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider underline flex items-center justify-end gap-1">
                       <span class="material-symbols-outlined text-[10px]">picture_as_pdf</span> Baixar Ficha Técnica
                     </a>
                   </div>
                </div>

                <!-- Imagem do Produto (Direita) - Altura fixa para alinhar corretamente -->
                <div :class="[
                  getPageSettings(page).image_position === 'left' ? 'justify-start' : 
                  getPageSettings(page).image_position === 'right' ? 'justify-end' : 'justify-center',
                  isLandscape ? 'max-h-[180px]' : 'max-h-[220px]'
                ]" class="flex-grow flex items-center bg-white p-2">
                  <img v-if="product.imageBlob || product.image" :src="getProductImageSrc(product)" class="object-contain mix-blend-multiply" :style="{ maxHeight: `${(isLandscape ? 150 : 180) * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_y || 1.0)}px`, maxWidth: `${(isLandscape ? 300 : 240) * (product.image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale || 1.0) * Number(getPageSettings(page).pdf_image_scale_x || 1.0)}px`, position: 'relative', top: getProductImageOffsetY(product, page), left: getProductImageOffsetX(product, page) }" crossorigin="anonymous" @error="(e) => handleImageError(e, product)" />
                  <div v-else class="text-gray-300 text-xs text-center">Sem imagem</div>
                </div>

                <!-- Separador Horizontal para Layout de 2 produtos (slots: 3) -->
                <div v-if="productIdx === 0 && page.length > 1" class="absolute -bottom-[13px] left-0 w-full h-[1px]" :style="{ backgroundColor: getPageSettings(page).divider_line_color }"></div>
              </div>

            </div>
          </div>
        </div>
        
        <!-- Footer da Página -->
        <div class="text-center text-xs text-gray-400 border-t border-gray-100"
             :class="isLandscape ? 'mt-4 pt-2' : 'mt-8 pt-4'">
          Página {{ pageIdx + 1 }} de {{ pages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Product } from '~/components/ProductCard.vue'
import { hexToBase64 } from '../utils/image'

const formatDimension = (value: string | number | undefined, fallback: string) => {
  if (value === undefined || value === null || value === '') return fallback
  const str = String(value).trim()
  
  // Se for um número puro, adiciona 'px'
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return str + 'px'
  }
  
  // Tenta casar número e unidade
  const match = str.match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z%]*)$/)
  if (match) {
    const num = match[1]
    const unit = match[2].toLowerCase()
    const validUnits = ['px', '%', 'em', 'rem', 'vh', 'vw', 'in', 'cm', 'mm', 'pt', 'pc']
    if (validUnits.includes(unit)) {
      return num + unit
    }
    return num + 'px' // se for unidade inválida (ex: 140x), força 'px'
  }
  
  // Tenta extrair o primeiro número do texto
  const numMatch = str.match(/^([+-]?\d+(?:\.\d+)?)/)
  if (numMatch) {
    return numMatch[1] + 'px'
  }
  
  return fallback
}

const getProductImageOffsetY = (product: any, page: Product[]) => {
  if (product.image_offset_y !== undefined && product.image_offset_y !== null && product.image_offset_y !== 0 && String(product.image_offset_y) !== '0' && String(product.image_offset_y) !== '') {
    return `${product.image_offset_y}px`
  }
  const defaultOffset = getPageSettings(page).product_image_offset_y
  if (!defaultOffset) return '0px'
  return String(defaultOffset).endsWith('px') ? defaultOffset : `${defaultOffset}px`
}

const getProductImageOffsetX = (product: any, page: Product[]) => {
  if (product.image_offset_x !== undefined && product.image_offset_x !== null && product.image_offset_x !== 0 && String(product.image_offset_x) !== '0' && String(product.image_offset_x) !== '') {
    return `${product.image_offset_x}px`
  }
  const defaultOffset = getPageSettings(page).product_image_offset_x
  if (!defaultOffset) return '0px'
  return String(defaultOffset).endsWith('px') ? defaultOffset : `${defaultOffset}px`
}

// html2pdf can only be imported on client side
let html2pdf: any;
if (process.client) {
  import('html2pdf.js').then(module => {
    html2pdf = module.default;
  });
}

const props = defineProps<{
  products: Product[],
  isGenerating: boolean,
  forceLandscape?: boolean
}>()

const emit = defineEmits(['complete'])

const supabase = useSupabaseClient()
const rendering = ref(false)
const coverImageUrl = ref<string | null>(null)
const coverImageBlob = ref<string | null>(null)

// Extrair layout_slots de forma segura, com fallback para 3 (meia página)
const getSlots = (product: any) => {
  if (product.layout_slots === 6 || product.layout_slots === 3 || product.layout_slots === 1) {
    return product.layout_slots;
  }
  return 3; // Default to half page if undefined or invalid
}

// Lógica de Bin-packing com separação estrita por categoria e ordenação
const pages = computed(() => {
  // 1. Agrupar por categoria
  const groups: Record<string, Product[]> = {}
  for (const product of props.products) {
    const cat = product.category || 'Geral'
    if (!groups[cat]) {
      groups[cat] = []
    }
    groups[cat].push(product)
  }

  // 2. Ordenar categorias: VÁLVULAS -> INCÊNDIO -> outras
  const sortedCategories = Object.keys(groups).sort((a, b) => {
    const aNorm = a.toUpperCase().trim()
    const bNorm = b.toUpperCase().trim()
    
    if (aNorm === 'VÁLVULAS' || aNorm === 'VALVULAS') return -1;
    if (bNorm === 'VÁLVULAS' || bNorm === 'VALVULAS') return 1;
    if (aNorm === 'INCÊNDIO' || aNorm === 'INCENDIO') return -1;
    if (bNorm === 'INCÊNDIO' || bNorm === 'INCENDIO') return 1;
    
    return a.localeCompare(b);
  })

  // 3. Empacotamento (Bin-pack) separado por categoria
  const result: Product[][] = []
  
  for (const cat of sortedCategories) {
    const catProducts = groups[cat]
    const catPages: { products: Product[], usedSlots: number }[] = []
    
    for (const product of catProducts) {
      const slots = getSlots(product)
      let foundPage = false
      
      for (const page of catPages) {
        if (page.usedSlots + slots <= 6) {
          page.products.push(product)
          page.usedSlots += slots
          foundPage = true
          break
        }
      }
      
      if (!foundPage) {
        catPages.push({
          products: [product],
          usedSlots: slots
        })
      }
    }
    
    for (const page of catPages) {
      result.push(page.products)
    }
  }
  
  return result
})

// Determinar a categoria predominante (ou "Geral")
const catalogCategory = computed(() => {
  if (!props.products || props.products.length === 0) return 'Catálogo'
  const categories = new Set(props.products.map(p => p.category))
  if (categories.size === 1) {
    return props.products[0].category
  }
  return 'Geral'
})

// Composable de Cores e Assets de Categoria
const { getCategoryColor, getCategoryCover, fetchAssets } = useCategoryColors()
const { getPdfSettings, getLandscapePdfSettings, fetchPdfSettings } = usePdfSettings()

const isLandscape = computed(() => {
  if (props.forceLandscape) return true
  const cat = catalogCategory.value
  const settings = getPdfSettings(cat)
  return settings.orientation === 'landscape'
})

const getPageSettings = (page: Product[]) => {
  const cat = page && page.length > 0 ? page[0].category : catalogCategory.value
  // Usa as configurações de paisagem quando em modo landscape, com fallback para portrait
  const settings = isLandscape.value
    ? getLandscapePdfSettings(cat)
    : getPdfSettings(cat)
  const slots = page && page.length > 0 ? getSlots(page[0]) : 3
  
  let baseSettings = settings || {}
  if (settings && settings.layout_settings && settings.layout_settings[slots]) {
    baseSettings = { ...settings, ...settings.layout_settings[slots] }
  }
  
  return new Proxy(baseSettings, {
    get(target, prop) {
      if (typeof prop === 'string') {
        if (prop in target) return target[prop]
        const camelProp = prop.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        if (camelProp in target) return target[camelProp]
        const snakeProp = prop.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
        if (snakeProp in target) return target[snakeProp]
      }
      return target[prop as any]
    }
  })
}

// Determinar a cor de background predominante
const catalogBgClass = computed(() => {
  const dynamicColor = getCategoryColor(catalogCategory.value)
  if (dynamicColor) return dynamicColor
  
  if (catalogCategory.value === 'INCÊNDIO') return '#C0504D'
  if (catalogCategory.value === 'GERAL' || catalogCategory.value === 'VÁLVULAS') return '#376092'
  if (!props.products || props.products.length === 0) return 'bg-blue-600'
  return props.products[0].bgClass || 'bg-blue-600'
})

const getBgColor = (bgClass: string | null | undefined, category?: string) => {
  const dynamicColor = getCategoryColor(category)
  if (dynamicColor) return dynamicColor

  if (category) {
    const catUpper = category.toUpperCase().trim();
    if (catUpper === 'VÁLVULAS' || catUpper === 'VALVULAS' || catUpper === 'GERAL') {
      return '#376092';
    }
    if (catUpper === 'INCÊNDIO' || catUpper === 'INCENDIO') {
      return '#C0504D';
    }
  }
  
  if (!bgClass) return '#376092';
  if (bgClass.startsWith('#')) return bgClass;
  const hexMatch = bgClass.match(/bg-\[#([0-9a-fA-F]{6})\]/);
  if (hexMatch) return `#${hexMatch[1]}`;
  
  const colorMap: Record<string, string> = {
    'bg-secondary': '#005db7',
    'bg-tertiary-container': '#003d0b',
    'bg-error': '#ba1a1a',
    'bg-primary-container': '#003366',
    'bg-blue-600': '#2563eb',
    'bg-blue-900': '#1e3a8a',
    'bg-[#a4bd61]': '#a4bd61',
    'bg-[#4a6fa5]': '#4a6fa5',
    'bg-[#8b7ba8]': '#8b7ba8'
  };
  return colorMap[bgClass] || '#376092';
}

const getTagColor = (colorClass: string | null | undefined) => {
  if (!colorClass) return '#1d4ed8';
  if (colorClass.startsWith('#')) return colorClass;
  const hexMatch = colorClass.match(/text-\[#([0-9a-fA-F]{6})\]/);
  if (hexMatch) return `#${hexMatch[1]}`;
  const colorMap: Record<string, string> = {
    'text-blue-700': '#1d4ed8',
    'text-green-700': '#15803d',
    'text-green-600': '#16a34a',
    'text-purple-700': '#7e22ce',
    'text-blue-800': '#1e40af'
  };
  return colorMap[colorClass] || '#1d4ed8';
}

const getTagBgColor = (colorClass: string | null | undefined) => {
  const color = getTagColor(colorClass);
  return color.startsWith('#') ? `${color}1a` : 'rgba(29, 78, 216, 0.1)';
}

const getCoverImageSrc = (url: string | null | undefined, blob: string | null | undefined) => {
  if (blob) {
    const isJpg = url && (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg'));
    const mime = isJpg ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${hexToBase64(blob)}`;
  }
  return url || '';
}

const getProductImageSrc = (product: any) => {
  if (product.imageBlob) {
    if (product.imageBlob.startsWith('data:')) return product.imageBlob;
    const isJpg = product.image && (product.image.toLowerCase().endsWith('.jpg') || product.image.toLowerCase().endsWith('.jpeg'));
    const mime = isJpg ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${product.imageBlob}`;
  }
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    return `/api/product-image?id=${product.id}`
  }
  return product.image || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Produto';
}

const handleImageError = (e: Event, product: any) => {
  const img = e.target as HTMLImageElement;
  const fallbackUrl = process.client 
    ? `${window.location.origin}/api/product-image?id=${product.id}` 
    : `/api/product-image?id=${product.id}`;
  if (img.src !== fallbackUrl && !img.src.includes('/api/product-image')) {
    img.src = fallbackUrl;
  }
}

// Buscar a imagem da capa quando gerar
const fetchCoverImage = async (category: string) => {
  const asset = getCategoryCover(category) || getCategoryCover('Geral')
  if (asset) {
    coverImageUrl.value = asset.cover_image_url
    coverImageBlob.value = asset.cover_image_blob
  } else {
    try {
      const { data, error } = await supabase
        .from('category_assets')
        .select('cover_image_url, cover_image_blob')
        .eq('category', category)
        .single()
        
      if (data) {
        coverImageUrl.value = data.cover_image_url
        coverImageBlob.value = data.cover_image_blob
      } else {
        const fallback = await supabase.from('category_assets').select('cover_image_url, cover_image_blob').eq('category', 'Geral').single()
        if (fallback.data) {
          coverImageUrl.value = fallback.data.cover_image_url
          coverImageBlob.value = fallback.data.cover_image_blob
        }
      }
    } catch (e) {
      console.error('Error fetching cover image:', e)
    }
  }
}

// Gerar PDF
watch(() => props.isGenerating, async (newVal) => {
  if (newVal && process.client) {
    rendering.value = true
    
    await fetchAssets()
    await fetchPdfSettings()
    await fetchCoverImage(catalogCategory.value)
    
    // Aguardar o DOM renderizar completamente e carregar imagens
    await nextTick()
    setTimeout(async () => {
      const element = document.getElementById('pdf-content')
      if (element && html2pdf) {
        const docFilename = props.forceLandscape || isLandscape.value
          ? `Catalogo_Qualitec_${catalogCategory.value.replace(/[^a-z0-9]/gi, '_')}_Slides.pdf`
          : `Catalogo_Qualitec_${catalogCategory.value.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        const opt = {
          margin:       0,
          filename:     docFilename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 4, useCORS: true, letterRendering: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: isLandscape.value ? 'landscape' : 'portrait' },
          pagebreak:    { mode: ['css', 'legacy'] }
        };
        
        await html2pdf().from(element).set(opt).save()
      }
      rendering.value = false
      emit('complete')
    }, 1500) // Delay to ensure images load
  }
})
const getDatasheetLink = (product: any) => {
  if (!product) return '#'
  
  // Se houver um link direto configurado, retorna ele primeiro
  if (product.datasheetUrl) {
    return product.datasheetUrl
  }
  
  if (!product.id) return '#'
  
  // Em vez de usar base64 gigante no HTML do PDF, usamos a rota de API local
  // que serve o PDF de forma limpa e segura, compatível com o Adobe Acrobat
  if (process.client) {
    return `${window.location.origin}/api/datasheet?id=${product.id}`
  }
  return `/api/datasheet?id=${product.id}`
}
</script>

<style scoped>
.pdf-container {
  font-family: 'Inter', sans-serif;
}
.break-after-page {
  page-break-after: always;
}
.pdf-page {
  width: 210mm;
  height: 296.5mm;
  max-height: 297mm;
  box-sizing: border-box;
  margin: 0 auto;
  overflow: hidden;
}
</style>
