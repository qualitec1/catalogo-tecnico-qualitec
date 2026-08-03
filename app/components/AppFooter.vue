<template>
  <footer
    id="contato"
    :style="{
      backgroundColor: siteSettings.footer_bg || '#eeebe9',
      borderTop: `1px solid ${siteSettings.footer_border_top_color || '#c2c6d3'}`,
      paddingTop: `${siteSettings.footer_ptop ?? 28}px`,
      paddingBottom: `${siteSettings.footer_pbot ?? 28}px`
    }"
  >
    <div style="max-width:832px;margin:0 auto;padding:0 16px;display:flex;justify-content:space-between;align-items:flex-start;">
      <!-- Left Column -->
      <div style="display:flex;flex-direction:column;gap:3px;color:#424751;font-size:12px;line-height:1.5;">
        <!-- Phrase 1: empresa -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p1_font || 'system-ui',
            fontSize: `${siteSettings.footer_p1_size ?? 12}px`,
            color: siteSettings.footer_p1_color || '#1c1b1b',
            fontWeight: siteSettings.footer_p1_bold ?? true ? '700' : '400',
            fontStyle: siteSettings.footer_p1_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p1_offset_x || 0}px, ${siteSettings.footer_p1_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p1_text || 'Qualitec C S I M Ltda' }}
        </p>

        <!-- Phrase 2: endereço 1 -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p2_font || 'system-ui',
            fontSize: `${siteSettings.footer_p2_size ?? 12}px`,
            color: siteSettings.footer_p2_color || '#424751',
            fontWeight: siteSettings.footer_p2_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p2_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p2_offset_x || 0}px, ${siteSettings.footer_p2_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p2_text || 'Rua Fazenda Monte Alegre, 367' }}
        </p>

        <!-- Phrase 3: endereço 2 -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p3_font || 'system-ui',
            fontSize: `${siteSettings.footer_p3_size ?? 12}px`,
            color: siteSettings.footer_p3_color || '#424751',
            fontWeight: siteSettings.footer_p3_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p3_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p3_offset_x || 0}px, ${siteSettings.footer_p3_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p3_text || '05160-060 - São Paulo - SP' }}
        </p>

        <!-- Phrase 4: telefone -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p4_font || 'system-ui',
            fontSize: `${siteSettings.footer_p4_size ?? 12}px`,
            color: siteSettings.footer_p4_color || '#424751',
            fontWeight: siteSettings.footer_p4_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p4_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p4_offset_x || 0}px, ${siteSettings.footer_p4_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p4_text || 'Tel: +55 11 3908 7100' }}
        </p>

        <!-- Phrase 5: email -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p5_font || 'system-ui',
            fontSize: `${siteSettings.footer_p5_size ?? 12}px`,
            color: siteSettings.footer_p5_color || '#004A96',
            fontWeight: siteSettings.footer_p5_bold ?? true ? '700' : '400',
            fontStyle: siteSettings.footer_p5_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p5_offset_x || 0}px, ${siteSettings.footer_p5_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p5_text || 'vendas@qualitecinstrumentos.com.br' }}
        </p>

        <!-- Phrase 6: copyright -->
        <p
          style="margin:16px 0 0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p6_font || 'system-ui',
            fontSize: `${siteSettings.footer_p6_size ?? 11}px`,
            color: siteSettings.footer_p6_color || '#888888',
            fontWeight: siteSettings.footer_p6_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p6_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p6_offset_x || 0}px, ${siteSettings.footer_p6_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p6_text || 'Todos os direitos reservados - 2024' }}
        </p>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:3px;color:#424751;font-size:12px;line-height:1.5;text-align:right;">
        <!-- Phrase 7: representante exclusivo -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p7_font || 'system-ui',
            fontSize: `${siteSettings.footer_p7_size ?? 12}px`,
            color: siteSettings.footer_p7_color || '#1c1b1b',
            fontWeight: siteSettings.footer_p7_bold ?? true ? '700' : '400',
            fontStyle: siteSettings.footer_p7_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p7_offset_x || 0}px, ${siteSettings.footer_p7_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p7_text || 'Representante Exclusivo' }}
        </p>

        <!-- Phrase 8: HEROSE -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p8_font || 'system-ui',
            fontSize: `${siteSettings.footer_p8_size ?? 12}px`,
            color: siteSettings.footer_p8_color || '#424751',
            fontWeight: siteSettings.footer_p8_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p8_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p8_offset_x || 0}px, ${siteSettings.footer_p8_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p8_text || 'HEROSE GmbH' }}
        </p>

        <!-- Phrase 9: Generant -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p9_font || 'system-ui',
            fontSize: `${siteSettings.footer_p9_size ?? 12}px`,
            color: siteSettings.footer_p9_color || '#424751',
            fontWeight: siteSettings.footer_p9_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p9_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p9_offset_x || 0}px, ${siteSettings.footer_p9_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p9_text || 'Generant Inc' }}
        </p>

        <!-- Phrase 10: DataOnline -->
        <p
          style="margin:0;transition:all 0.15s ease;"
          :style="{
            fontFamily: siteSettings.footer_p10_font || 'system-ui',
            fontSize: `${siteSettings.footer_p10_size ?? 12}px`,
            color: siteSettings.footer_p10_color || '#424751',
            fontWeight: siteSettings.footer_p10_bold ? '700' : '400',
            fontStyle: siteSettings.footer_p10_italic ? 'italic' : 'normal',
            transform: `translate(${siteSettings.footer_p10_offset_x || 0}px, ${siteSettings.footer_p10_offset_y || 0}px)`
          }"
        >
          {{ siteSettings.footer_p10_text || 'DataOnline LLC' }}
        </p>
      </div>
    </div>

    <!-- Floating Support Button (Phrase 11) -->
    <div
      class="fixed bottom-6 right-6 z-50 transition-all duration-150"
      :style="{
        transform: `translate(${siteSettings.footer_p11_offset_x || 0}px, ${siteSettings.footer_p11_offset_y || 0}px)`
      }"
    >
      <a
        href="https://wa.me/551139087100"
        target="_blank"
        class="bg-[#004A96] hover:bg-[#00346c] text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-xl transition-all hover:scale-105 cursor-pointer no-underline"
      >
        <span class="material-symbols-outlined text-2xl">chat_bubble</span>
        <span
          :style="{
            fontFamily: siteSettings.footer_p11_font || 'system-ui',
            fontSize: `${siteSettings.footer_p11_size ?? 14}px`,
            color: siteSettings.footer_p11_color || '#ffffff',
            fontWeight: siteSettings.footer_p11_bold ?? true ? '700' : '400',
            fontStyle: siteSettings.footer_p11_italic ? 'italic' : 'normal'
          }"
        >
          {{ siteSettings.footer_p11_text || 'Como posso lhe ajudar?' }}
        </span>
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { siteSettings, fetchSiteSettings } = useSiteSettings()

onMounted(() => {
  fetchSiteSettings()
})
</script>
