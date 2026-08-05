import { ref, computed } from 'vue'
import { useState } from '#app'

export type LanguageCode = 'pt' | 'en' | 'es'

export interface SegmentItem {
  key: string
  pt: string
  en: string
  es: string
}

export const segmentList: SegmentItem[] = [
  { key: 'Criôgenia', pt: 'Criôgenia', en: 'Cryogenics', es: 'Criogenia' },
  { key: 'Óleo & Gás', pt: 'Óleo & Gás', en: 'Oil & Gas', es: 'Petróleo & Gas' },
  { key: 'Gases Técnicos', pt: 'Gases Técnicos', en: 'Technical Gases', es: 'Gases Técnicos' },
  { key: 'Energia', pt: 'Energia', en: 'Energy', es: 'Energía' },
  { key: 'Açúcar & Álcool', pt: 'Açúcar & Álcool', en: 'Sugar & Ethanol', es: 'Azúcar & Alcohol' },
  { key: 'Alimentícia', pt: 'Alimentícia', en: 'Food Industry', es: 'Alimentaria' },
]

export const categoryDict: Record<string, { en: string; es: string }> = {
  'GERAL': { en: 'GENERAL', es: 'GENERAL' },
  'CATÁLOGO': { en: 'CATALOG', es: 'CATÁLOGO' },
  'VÁLVULAS': { en: 'VALVES', es: 'VÁLVULAS' },
  'TRANSMISSORES': { en: 'TRANSMITTERS', es: 'TRANSMISORES' },
  'MEDIDORES': { en: 'METERS', es: 'MEDIDORES' },
  'SISTEMAS': { en: 'SYSTEMS', es: 'SISTEMAS' },
  'EQUIPAMENTOS': { en: 'EQUIPMENT', es: 'EQUIPOS' },
  'VÁLVULAS 3 VIAS': { en: 'DIVERTER VALVES', es: 'VÁLVULAS 3 VÍAS' },
  '3-WAY VALVES': { en: 'DIVERTER VALVES', es: 'VÁLVULAS 3 VÍAS' },
  'VÁLVULAS GLOBO': { en: 'GLOBE VALVES', es: 'VÁLVULAS GLOBO' },
  'GLOBE VALVES': { en: 'GLOBE VALVES', es: 'VÁLVULAS GLOBO' },
  'VÁLVULAS DE SEGURANÇA': { en: 'SAFETY VALVES', es: 'VÁLVULAS DE SEGURIDAD' },
  'SAFETY VALVES': { en: 'SAFETY VALVES', es: 'VÁLVULAS DE SEGURIDAD' },
  'VÁLVULAS CRIOGÊNICAS': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'VÁLVULAS CRIOGENICAS': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'CRIOGENIA': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'CRYOGENIC VALVES': { en: 'CRYOGENIC VALVES', es: 'VÁLVULAS CRIOGÉNICAS' },
  'TRANSMISSORES DE PRESSÃO': { en: 'PRESSURE TRANSMITTERS', es: 'TRANSMISORES DE PRESIÓN' },
  'PRESSURE TRANSMITTERS': { en: 'PRESSURE TRANSMITTERS', es: 'TRANSMISORES DE PRESIÓN' }
}

export function translateCategoryName(catName: string, lang: string): string {
  if (!catName) return ''
  if (lang === 'pt') return catName
  
  const norm = catName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()

  for (const [key, trans] of Object.entries(categoryDict)) {
    const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()
    if (norm === normKey) {
      return trans[lang as 'en' | 'es'] || catName
    }
  }

  if (norm.includes('CRIOG')) return lang === 'en' ? 'CRYOGENIC VALVES' : 'VÁLVULAS CRIOGÉNICAS'
  if (norm.includes('3 VIAS') || norm.includes('3-WAY') || norm.includes('DIVERTER')) return lang === 'en' ? 'DIVERTER VALVES' : 'VÁLVULAS 3 VÍAS'
  if (norm.includes('GLOBO')) return lang === 'en' ? 'GLOBE VALVES' : 'VÁLVULAS GLOBO'
  if (norm.includes('SEGURANCA')) return lang === 'en' ? 'SAFETY VALVES' : 'VÁLVULAS DE SEGURIDAD'
  if (norm.includes('PRESSAO')) return lang === 'en' ? 'PRESSURE TRANSMITTERS' : 'TRANSMISORES DE PRESIÓN'
  if (norm === 'GERAL') return lang === 'en' ? 'GENERAL' : 'GENERAL'

  return catName
}

// ─── Default translations (fallback) ────────────────────────────────────────
export type TranslationKey =
  | 'nav.home' | 'nav.about' | 'nav.catalog' | 'nav.contact'
  | 'seg.criogenia' | 'seg.oleo_gas' | 'seg.gases_tecnicos' | 'seg.energia' | 'seg.acucar_alcool' | 'seg.alimenticia'
  | 'catalog.search_placeholder' | 'catalog.view_docs' | 'catalog.no_docs' | 'catalog.model' | 'catalog.no_products' | 'catalog.all_categories'
  | 'footer.rights' | 'footer.contact_btn' | 'footer.exclusive_rep' | 'footer.view_catalog'
  | 'home.hero_text' | 'home.hero_cta'
  | 'home.search_title' | 'home.search_subtitle' | 'home.search_quick_title'
  | 'home.search_quick_1' | 'home.search_quick_2' | 'home.search_quick_3' | 'home.search_quick_4'
  | 'home.news_title' | 'home.news_item1_title' | 'home.news_item2_title' | 'home.news_item3_title'
  | 'home.newsletter_title' | 'home.newsletter_label' | 'home.newsletter_button'
  | 'about.hero_title' | 'about.hero_text' | 'about.hero_btn_solutions' | 'about.hero_btn_specialist'
  | 'about.who_title' | 'about.who_text'
  | 'about.brands_title' | 'about.brands_text'
  | 'about.sectors_title' | 'about.sector1_title' | 'about.sector1_desc' | 'about.sector2_title' | 'about.sector2_desc' | 'about.sector3_title' | 'about.sector3_desc' | 'about.sector4_title' | 'about.sector4_desc' | 'about.sector5_title' | 'about.sector5_desc' | 'about.sector6_title' | 'about.sector6_desc' | 'about.sector7_title' | 'about.sector7_desc'
  | 'about.why_title' | 'about.why1_title' | 'about.why1_text' | 'about.why2_title' | 'about.why2_text' | 'about.why3_title' | 'about.why3_text' | 'about.why4_title' | 'about.why4_text'
  | 'about.commitment_title' | 'about.commitment_text'
  | 'about.cta_title' | 'about.cta_text' | 'about.cta_btn_quote' | 'about.cta_btn_specialist'

export type TranslationsMap = Record<TranslationKey, string>

export const defaultTranslations: Record<LanguageCode, TranslationsMap> = {
  pt: {
    'nav.home': 'Home',
    'nav.about': 'Nossa Empresa',
    'nav.catalog': 'Catálogo',
    'nav.contact': 'Contato',
    'seg.criogenia': 'Criôgenia',
    'seg.oleo_gas': 'Óleo & Gás',
    'seg.gases_tecnicos': 'Gases Técnicos',
    'seg.energia': 'Energia',
    'seg.acucar_alcool': 'Açúcar & Álcool',
    'seg.alimenticia': 'Alimentícia',
    'catalog.search_placeholder': 'BUSCAR EQUIPAMENTO...',
    'catalog.view_docs': 'Ficha de Especificação',
    'catalog.no_docs': 'Nenhuma documentação disponível',
    'catalog.model': 'Modelo',
    'catalog.no_products': 'Nenhum equipamento encontrado',
    'catalog.all_categories': 'TODAS',
    'footer.rights': 'Todos os direitos reservados',
    'footer.contact_btn': 'Como posso lhe ajudar?',
    'footer.exclusive_rep': 'Representante Exclusivo',
    'footer.view_catalog': 'Ver Catálogo',
    'home.hero_text': 'Soluções em instrumentação industrial',
    'home.hero_cta': 'Ver Catálogo Completo',
    'home.search_title': 'Como podemos te ajudar?',
    'home.search_subtitle': 'Utilize a busca rápida e encontre sua necessidade',
    'home.search_quick_title': 'Buscas mais utilizadas',
    'home.search_quick_1': 'Contato de vendas / suporte',
    'home.search_quick_2': 'Válvulas de Segurança',
    'home.search_quick_3': 'Reparos HEROSE',
    'home.search_quick_4': 'Transmissores de Pressão',
    'home.news_title': 'Novidades',
    'home.news_item1_title': 'Novo Catálogo',
    'home.news_item2_title': 'Transmissor de nível flangeado',
    'home.news_item3_title': 'Regulador Pressão CO2',
    'home.newsletter_title': 'Cadastre-se para receber nossa newsletter.',
    'home.newsletter_label': 'Digite seu email aqui *',
    'home.newsletter_button': 'Inscrever',
    'about.hero_title': 'Soluções técnicas para processos industriais críticos',
    'about.hero_text': 'A Qualitec fornece instrumentação, válvulas e suporte técnico para aplicações que exigem segurança, precisão e confiabilidade.',
    'about.hero_btn_solutions': 'Conheça nossas soluções',
    'about.hero_btn_specialist': 'Fale com um especialista',
    'about.who_title': 'Tecnologia, conhecimento técnico e atendimento próximo',
    'about.who_text': 'A Qualitec C S I M Ltda atua no fornecimento de instrumentação industrial, válvulas e soluções para controle de pressão e processos. Com atendimento técnico-comercial especializado, conectamos indústrias brasileiras a equipamentos de alta confiabilidade para aplicações em criogenia, gases industriais, óleo & gás, energia, alimentos e outros processos críticos.',
    'about.brands_title': 'Tecnologia global, suporte técnico local',
    'about.brands_text': 'Trabalhamos com fabricantes reconhecidos internacionalmente, oferecendo produtos, documentação técnica e apoio para a definição da configuração mais adequada a cada processo.',
    'about.sectors_title': 'Setores Atendidos',
    'about.sector1_title': 'Criogenia e gases industriais',
    'about.sector1_desc': 'Soluções para armazenamento, transporte e gaseificação de O2, N2, Ar, CO2 e gases liquefeitos com máxima segurança estanque.',
    'about.sector2_title': 'Hidrogênio e LNG',
    'about.sector2_desc': 'Equipamentos preparados para temperaturas ultrabaixas e estanqueidade total em novas matrizes energéticas limpas.',
    'about.sector3_title': 'Óleo & Gás',
    'about.sector3_desc': 'Válvulas robustas e transmissores de pressão para aplicações onshore, offshore, refinarias e processamento de hidrocarbonetos.',
    'about.sector4_title': 'Energia',
    'about.sector4_desc': 'Sistemas de controle e proteção contra sobrepressão para hidrelétricas, termelétricas e linhas de vapor crítico.',
    'about.sector5_title': 'Alimentícia e farmacêutica',
    'about.sector5_desc': 'Instrumentos sanitários com elevado padrão de limpeza para oxigênio e gases de alta pureza sem contaminação.',
    'about.sector6_title': 'Açúcar & Álcool',
    'about.sector6_desc': 'Soluções resistentes a fluidos severos em caldeiras, destilarias, cozimento e usinas de etanol sucroalcooleiras.',
    'about.sector7_title': 'Processos industriais e automação',
    'about.sector7_desc': 'Painéis reguladores, transmissores e válvulas para linhas de utilidades, regulação e automação fabril contínua.',
    'about.why_title': 'Por que escolher a Qualitec?',
    'about.why1_title': 'Especialização técnica',
    'about.why1_text': 'Apoio na seleção e especificação conforme aplicação, fluido, pressão, temperatura e conexão.',
    'about.why2_title': 'Marcas reconhecidas',
    'about.why2_text': 'Portfólio de fabricantes globais para aplicações industriais exigentes.',
    'about.why3_title': 'Documentação completa',
    'about.why3_text': 'Datasheets, certificados, desenhos e informações técnicas para engenharia, manutenção e compras.',
    'about.why4_title': 'Atendimento comercial ágil',
    'about.why4_text': 'Solicitações de cotação estruturadas, acompanhamento e suporte próximo ao cliente.',
    'about.commitment_title': 'Mais do que fornecer produtos, ajudamos a especificar soluções.',
    'about.commitment_text': 'Cada processo possui requisitos próprios. Nossa equipe apoia a avaliação de pressão, temperatura, fluido, materiais, conexões, normas e certificações para que o equipamento selecionado seja adequado à operação.',
    'about.cta_title': 'Precisa de apoio para especificar seu equipamento?',
    'about.cta_text': 'Nossa equipe está pronta para entender sua aplicação e indicar a solução mais adequada.',
    'about.cta_btn_quote': 'Solicitar cotação',
    'about.cta_btn_specialist': 'Falar com um especialista',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'Our Company',
    'nav.catalog': 'Catalog',
    'nav.contact': 'Contact',
    'seg.criogenia': 'Cryogenics',
    'seg.oleo_gas': 'Oil & Gas',
    'seg.gases_tecnicos': 'Technical Gases',
    'seg.energia': 'Energy',
    'seg.acucar_alcool': 'Sugar & Ethanol',
    'seg.alimenticia': 'Food Industry',
    'catalog.search_placeholder': 'SEARCH EQUIPMENT...',
    'catalog.view_docs': 'Specification Sheet',
    'catalog.no_docs': 'No documentation available',
    'catalog.model': 'Model',
    'catalog.no_products': 'No equipment found',
    'catalog.all_categories': 'ALL',
    'footer.rights': 'All rights reserved',
    'footer.contact_btn': 'How can I help you?',
    'footer.exclusive_rep': 'Exclusive Representative',
    'footer.view_catalog': 'View Catalog',
    'home.hero_text': 'Industrial instrumentation solutions',
    'home.hero_cta': 'Browse Full Catalog',
    'home.search_title': 'How can we help you?',
    'home.search_subtitle': 'Use quick search to find what you need',
    'home.search_quick_title': 'Most popular searches',
    'home.search_quick_1': 'Sales & support contact',
    'home.search_quick_2': 'Safety Valves',
    'home.search_quick_3': 'HEROSE Spare Parts',
    'home.search_quick_4': 'Pressure Transmitters',
    'home.news_title': "What's New",
    'home.news_item1_title': 'New Catalog',
    'home.news_item2_title': 'Flanged level transmitter',
    'home.news_item3_title': 'CO2 Pressure Regulator',
    'home.newsletter_title': 'Subscribe to receive our newsletter.',
    'home.newsletter_label': 'Enter your email here *',
    'home.newsletter_button': 'Subscribe',
    'about.hero_title': 'Technical solutions for critical industrial processes',
    'about.hero_text': 'Qualitec supplies instrumentation, valves, and technical support for applications requiring safety, precision, and reliability.',
    'about.hero_btn_solutions': 'Explore our solutions',
    'about.hero_btn_specialist': 'Talk to a specialist',
    'about.who_title': 'Technology, technical expertise, and close support',
    'about.who_text': 'Qualitec C S I M Ltda provides industrial instrumentation, valves, and pressure/process control solutions. With specialized technical-commercial support, we connect Brazilian industries with high-reliability equipment for cryogenics, industrial gases, oil & gas, energy, food, and other critical processes.',
    'about.brands_title': 'Global technology, local technical support',
    'about.brands_text': 'We work with internationally recognized manufacturers, offering products, technical documentation, and guidance for defining the optimal configuration for each process.',
    'about.sectors_title': 'Sectors Served',
    'about.sector1_title': 'Cryogenics and industrial gases',
    'about.sector1_desc': 'Certified solutions for storage, transport, and gasification of O2, N2, Ar, CO2, and liquefied gases with maximum tightness.',
    'about.sector2_title': 'Hydrogen and LNG',
    'about.sector2_desc': 'Equipment engineered for ultra-low temperatures and zero leakage in clean energy transition matrices.',
    'about.sector3_title': 'Oil & Gas',
    'about.sector3_desc': 'Heavy-duty valves and pressure transmitters for onshore, offshore, refinery, and hydrocarbon processing applications.',
    'about.sector4_title': 'Energy',
    'about.sector4_desc': 'Control and overpressure protection systems for hydroelectric, thermoelectric, and critical steam lines.',
    'about.sector5_title': 'Food & Pharmaceutical',
    'about.sector5_desc': 'Sanitary instruments with strict hygiene and high-purity oxygen/gas cleaning standards without contamination.',
    'about.sector6_title': 'Sugar & Ethanol',
    'about.sector6_desc': 'Resistant solutions for severe fluids in boilers, distilleries, cooking, and sucroalcohol ethanol plants.',
    'about.sector7_title': 'Industrial processes & automation',
    'about.sector7_desc': 'Regulator panels, transmitters, and valves for utility lines, pressure regulation, and continuous plant automation.',
    'about.why_title': 'Why choose Qualitec?',
    'about.why1_title': 'Technical expertise',
    'about.why1_text': 'Support in selection and specification according to application, fluid, pressure, temperature, and connection.',
    'about.why2_title': 'Recognized brands',
    'about.why2_text': 'Portfolio of global manufacturers for demanding industrial applications.',
    'about.why3_title': 'Complete documentation',
    'about.why3_text': 'Datasheets, certificates, drawings, and technical data for engineering, maintenance, and procurement.',
    'about.why4_title': 'Agile commercial support',
    'about.why4_text': 'Structured quote requests, dedicated tracking, and close customer support.',
    'about.commitment_title': 'More than supplying products, we help specify solutions.',
    'about.commitment_text': 'Every process has unique requirements. Our team assists in evaluating pressure, temperature, fluid, materials, connections, standards, and certifications to ensure the selected equipment fits your operation.',
    'about.cta_title': 'Need support to specify your equipment?',
    'about.cta_text': 'Our team is ready to understand your application and point out the optimal solution.',
    'about.cta_btn_quote': 'Request a quote',
    'about.cta_btn_specialist': 'Talk to a specialist',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Nuestra Empresa',
    'nav.catalog': 'Catálogo',
    'nav.contact': 'Contacto',
    'seg.criogenia': 'Criogenia',
    'seg.oleo_gas': 'Petróleo & Gas',
    'seg.gases_tecnicos': 'Gases Técnicos',
    'seg.energia': 'Energía',
    'seg.acucar_alcool': 'Azúcar & Alcohol',
    'seg.alimenticia': 'Alimentaria',
    'catalog.search_placeholder': 'BUSCAR EQUIPO...',
    'catalog.view_docs': 'Ficha Técnica',
    'catalog.no_docs': 'Sin documentación disponible',
    'catalog.model': 'Modelo',
    'catalog.no_products': 'No se encontraron equipos',
    'catalog.all_categories': 'TODAS',
    'footer.rights': 'Todos los derechos reservados',
    'footer.contact_btn': '¿Cómo puedo ayudarle?',
    'footer.exclusive_rep': 'Representante Exclusivo',
    'footer.view_catalog': 'Ver Catálogo',
    'home.hero_text': 'Soluciones en instrumentación industrial',
    'home.hero_cta': 'Ver Catálogo Completo',
    'home.search_title': '¿Cómo podemos ayudarle?',
    'home.search_subtitle': 'Utilice la búsqueda rápida para encontrar su necesidad',
    'home.search_quick_title': 'Búsquedas más frecuentes',
    'home.search_quick_1': 'Contacto de ventas / soporte',
    'home.search_quick_2': 'Válvulas de Seguridad',
    'home.search_quick_3': 'Repuestos HEROSE',
    'home.search_quick_4': 'Transmisores de Presión',
    'home.news_title': 'Novedades',
    'home.news_item1_title': 'Nuevo Catálogo',
    'home.news_item2_title': 'Transmisor de nivel bridado',
    'home.news_item3_title': 'Regulador de Presión CO2',
    'home.newsletter_title': 'Regístrese para recibir nuestro boletín.',
    'home.newsletter_label': 'Ingrese su correo electrónico aquí *',
    'home.newsletter_button': 'Suscribirse',
    'about.hero_title': 'Soluciones técnicas para procesos industriales críticos',
    'about.hero_text': 'Qualitec proporciona instrumentación, válvulas y soporte técnico para aplicaciones que exigen seguridad, precisión y confiabilidad.',
    'about.hero_btn_solutions': 'Conozca nuestras soluciones',
    'about.hero_btn_specialist': 'Hable con un especialista',
    'about.who_title': 'Tecnología, conocimiento técnico y atención cercana',
    'about.who_text': 'Qualitec C S I M Ltda actúa en el suministro de instrumentación industrial, válvulas y soluciones para control de presión y procesos. Con atención técnico-comercial especializada, conectamos a las industrias brasileñas con equipos de alta confiabilidad para aplicaciones en criogenia, gases industriales, petróleo y gas, energía, alimentos y otros procesos críticos.',
    'about.brands_title': 'Tecnología global, soporte técnico local',
    'about.brands_text': 'Trabajamos con fabricantes reconocidos internacionalmente, ofreciendo productos, documentación técnica y apoyo para definir la configuración más adecuada para cada proceso.',
    'about.sectors_title': 'Sectores Atendidos',
    'about.sector1_title': 'Criogenia y gases industriales',
    'about.sector1_desc': 'Soluciones certificadas para almacenamiento, transporte y gasificación de O2, N2, Ar, CO2 y gases licuados con máxima estanqueidad.',
    'about.sector2_title': 'Hidrógeno y LNG',
    'about.sector2_desc': 'Equipos preparados para temperaturas ultrabajas y estanqueidad total en nuevas matrices energéticas limpias.',
    'about.sector3_title': 'Petróleo & Gas',
    'about.sector3_desc': 'Válvulas robustas y transmisores de presión para aplicaciones onshore, offshore, refinerías y procesamiento de hidrocarburos.',
    'about.sector4_title': 'Energía',
    'about.sector4_desc': 'Sistemas de control y protección contra sobrepresión para hidroeléctricas, termoeléctricas y líneas de vapor crítico.',
    'about.sector5_title': 'Alimentaria y farmacéutica',
    'about.sector5_desc': 'Instrumentos sanitarios con alto estándar de higiene y limpieza para oxígeno/gases de alta pureza sin contaminación.',
    'about.sector6_title': 'Azúcar & Alcohol',
    'about.sector6_desc': 'Soluciones resistentes a fluidos severos en calderas, destilerías, cocción y plantas sucroalcoholeras de etanol.',
    'about.sector7_title': 'Procesos industriales y automatización',
    'about.sector7_desc': 'Paneles reguladores, transmisores y válvulas para líneas de servicios, regulación y automatización fabril continua.',
    'about.why_title': '¿Por qué elegir Qualitec?',
    'about.why1_title': 'Especialización técnica',
    'about.why1_text': 'Apoyo en la selección y especificación según aplicación, fluido, presión, temperatura y conexión.',
    'about.why2_title': 'Marcas reconocidas',
    'about.why2_text': 'Portafolio de fabricantes globales para aplicaciones industriales exigentes.',
    'about.why3_title': 'Documentación completa',
    'about.why3_text': 'Datasheets, certificados, planos e información técnica para ingeniería, mantenimiento y compras.',
    'about.why4_title': 'Atención comercial ágil',
    'about.why4_text': 'Solicitudes de cotización estructuradas, seguimiento y soporte cercano al cliente.',
    'about.commitment_title': 'Más que suministrar productos, ayudamos a especificar soluciones.',
    'about.commitment_text': 'Cada proceso posee requisitos propios. Nuestro equipo apoya la evaluación de presión, temperatura, fluido, materiales, conexiones, normas y certificaciones para que el equipo seleccionado sea adecuado a la operación.',
    'about.cta_title': '¿Necesita ayuda para especificar su equipo?',
    'about.cta_text': 'Nuestro equipo está listo para entender su aplicación e indicar la solución más adecuada.',
    'about.cta_btn_quote': 'Solicitar cotización',
    'about.cta_btn_specialist': 'Hable con un especialista',
  },
}

// ─── Legacy shape (kept for backward compat) ─────────────────────────────────
export const translations = {
  pt: {
    home: defaultTranslations.pt['nav.home'],
    about: defaultTranslations.pt['nav.about'],
    contact: defaultTranslations.pt['nav.contact'],
    searchPlaceholder: defaultTranslations.pt['catalog.search_placeholder'],
    viewDocs: defaultTranslations.pt['catalog.view_docs'],
    noDocs: defaultTranslations.pt['catalog.no_docs'],
    model: defaultTranslations.pt['catalog.model'],
    noProducts: defaultTranslations.pt['catalog.no_products'],
    allCategories: defaultTranslations.pt['catalog.all_categories'],
  },
  en: {
    home: defaultTranslations.en['nav.home'],
    about: defaultTranslations.en['nav.about'],
    contact: defaultTranslations.en['nav.contact'],
    searchPlaceholder: defaultTranslations.en['catalog.search_placeholder'],
    viewDocs: defaultTranslations.en['catalog.view_docs'],
    noDocs: defaultTranslations.en['catalog.no_docs'],
    model: defaultTranslations.en['catalog.model'],
    noProducts: defaultTranslations.en['catalog.no_products'],
    allCategories: defaultTranslations.en['catalog.all_categories'],
  },
  es: {
    home: defaultTranslations.es['nav.home'],
    about: defaultTranslations.es['nav.about'],
    contact: defaultTranslations.es['nav.contact'],
    searchPlaceholder: defaultTranslations.es['catalog.search_placeholder'],
    viewDocs: defaultTranslations.es['catalog.view_docs'],
    noDocs: defaultTranslations.es['catalog.no_docs'],
    model: defaultTranslations.es['catalog.model'],
    noProducts: defaultTranslations.es['catalog.no_products'],
    allCategories: defaultTranslations.es['catalog.all_categories'],
  },
}

// ─── DB-backed overrides (global state shared across composable instances) ───
const dbOverrides = ref<Record<LanguageCode, Partial<TranslationsMap>>>({
  pt: {}, en: {}, es: {},
})
const overridesLoaded = ref(false)

export function useTranslationsAdmin() {
  const supabase = useSupabaseClient()

  /** Load all rows from site_translations into dbOverrides */
  async function fetchTranslationsFromDB() {
    try {
      const { data, error } = await supabase
        .from('site_translations')
        .select('lang_code, key, value')
      if (error) throw error
      if (data) {
        const newOverrides: Record<LanguageCode, Partial<TranslationsMap>> = { pt: {}, en: {}, es: {} }
        for (const row of data) {
          const lang = row.lang_code as LanguageCode
          if (newOverrides[lang]) {
            newOverrides[lang][row.key as TranslationKey] = row.value
          }
        }
        dbOverrides.value = newOverrides
      }
    } catch (e) {
      // Table might not exist yet — silently fall back to defaults
      console.warn('[useTranslations] site_translations table not available, using defaults.')
    } finally {
      overridesLoaded.value = true
    }
  }

  /** Upsert a batch of key/value pairs for a given language */
  async function saveTranslationsToDb(lang: LanguageCode, entries: { key: string; value: string; section: string }[]) {
    const rows = entries.map(e => ({
      lang_code: lang,
      key: e.key,
      value: e.value,
      section: e.section,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('site_translations')
      .upsert(rows, { onConflict: 'lang_code,key' })
    if (error) throw error
    // Update local cache
    entries.forEach(e => {
      dbOverrides.value[lang][e.key as TranslationKey] = e.value
    })
  }

  return { fetchTranslationsFromDB, saveTranslationsToDb, dbOverrides }
}

// ─── Main composable ─────────────────────────────────────────────────────────
export default function useTranslations() {
  const currentLang = useState<LanguageCode>('catalog-current-lang', () => 'pt')

  /** Merged: defaults + DB overrides */
  const mergedTranslations = computed(() => {
    const lang = currentLang.value
    return { ...defaultTranslations[lang], ...dbOverrides.value[lang] } as TranslationsMap
  })

  /** Legacy-compatible shape (used by pages that destructure { t }) */
  const t = computed(() => {
    const m = mergedTranslations.value
    const lang = currentLang.value
    return {
      home: m['nav.home'] || translations[lang]?.home,
      catalog: m['nav.catalog'] || (lang === 'en' ? 'Catalog' : 'Catálogo'),
      about: m['nav.about'] || translations[lang]?.about,
      contact: m['nav.contact'] || translations[lang]?.contact,
      searchPlaceholder: m['catalog.search_placeholder'] || translations[lang]?.searchPlaceholder,
      viewDocs: m['catalog.view_docs'] || translations[lang]?.viewDocs,
      noDocs: m['catalog.no_docs'] || translations[lang]?.noDocs,
      model: m['catalog.model'] || translations[lang]?.model,
      noProducts: m['catalog.no_products'] || translations[lang]?.noProducts,
      allCategories: m['catalog.all_categories'] || translations[lang]?.allCategories,
    }
  })

  /** Segment list merged with DB overrides */
  const translatedSegments = computed(() => {
    const lang = currentLang.value
    const ov = dbOverrides.value[lang]
    return segmentList.map(seg => {
      const segKey = {
        'Criôgenia': 'seg.criogenia',
        'Óleo & Gás': 'seg.oleo_gas',
        'Gases Técnicos': 'seg.gases_tecnicos',
        'Energia': 'seg.energia',
        'Açúcar & Álcool': 'seg.acucar_alcool',
        'Alimentícia': 'seg.alimenticia',
      }[seg.key] as TranslationKey | undefined

      const overriddenLabel = segKey ? ov[segKey] : undefined
      return {
        key: seg.key,
        label: overriddenLabel || seg[lang] || seg.pt,
      }
    })
  })

  const translateCategory = (catName: string): string => {
    if (!catName) return ''
    const catUpper = catName.toUpperCase().trim()
    const { pdfSettings } = usePdfSettings()
    const settings = pdfSettings.value ? pdfSettings.value[catUpper] : null
    if (settings) {
      const lang = currentLang.value
      const layout = settings.layout_settings || {}
      let custom: any = null
      if (lang === 'en') {
        custom = layout.cover_title_en || settings.cover_title_en || settings.coverTitleEn
      } else if (lang === 'es') {
        custom = layout.cover_title_es || layout.cover_title_de || settings.cover_title_es || settings.coverTitleEs
      } else {
        custom = layout.cover_title_pt || settings.cover_title_pt || settings.coverTitlePt
      }
      if (custom && String(custom).trim()) {
        return String(custom).trim().toUpperCase()
      }
    }
    return translateCategoryName(catName, currentLang.value)
  }

  const setLanguage = (lang: LanguageCode) => {
    currentLang.value = lang
  }

  return {
    currentLang,
    t,
    mergedTranslations,
    translatedSegments,
    translateCategory,
    setLanguage,
  }
}
