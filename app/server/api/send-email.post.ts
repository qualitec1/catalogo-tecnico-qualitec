import { resolve } from 'node:path'
import nodemailer from 'nodemailer'
import { readBody, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

async function saveNewsletterSubscriber(email: string, lang: string) {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = (config.public as any)?.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = (config.public as any)?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient(supabaseUrl, supabaseKey)
    const normalizedEmail = email.toLowerCase().trim()

    const { data } = await supabase
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (data) {
      const currentLayout = data.layout_settings || {}
      const existingList: Array<{ email: string; lang: string; subscribed_at: string }> = currentLayout.newsletter_subscribers || []

      const exists = existingList.some(item => item.email.toLowerCase() === normalizedEmail)
      if (!exists) {
        existingList.unshift({
          email: normalizedEmail,
          lang: (lang || 'pt').toLowerCase(),
          subscribed_at: new Date().toISOString()
        })

        const updatedLayout = {
          ...currentLayout,
          newsletter_subscribers: existingList
        }

        await supabase
          .from('pdf_settings')
          .update({ layout_settings: updatedLayout })
          .eq('category', 'GERAL')
      }
    }
  } catch (err) {
    console.warn('[Supabase Save Subscriber Warning]', err)
  }
}

async function saveContactSubmission(contactData: {
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  productName?: string
  type?: string
}) {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = (config.public as any)?.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = (config.public as any)?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from('pdf_settings')
      .select('id, layout_settings')
      .eq('category', 'GERAL')
      .maybeSingle()

    if (data) {
      const currentLayout = data.layout_settings || {}
      const existingList: Array<any> = currentLayout.contact_submissions || []

      existingList.unshift({
        id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: contactData.name || '',
        email: (contactData.email || '').toLowerCase().trim(),
        phone: contactData.phone || '',
        company: contactData.company || '',
        subject: contactData.subject || '',
        message: contactData.message || '',
        productName: contactData.productName || '',
        type: contactData.type || 'contact',
        created_at: new Date().toISOString()
      })

      const updatedLayout = {
        ...currentLayout,
        contact_submissions: existingList
      }

      await supabase
        .from('pdf_settings')
        .update({ layout_settings: updatedLayout })
        .eq('category', 'GERAL')
    }
  } catch (err) {
    console.warn('[Supabase Save Contact Warning]', err)
  }
}

function getNewsletterTemplate(email: string, langRaw = 'pt') {
  const lang = String(langRaw || 'pt').toLowerCase()

  const translations = {
    pt: {
      subject: 'Inscrição confirmada!',
      hero: 'Segurança e confiabilidade em cada medição.',
      heading: 'Inscrição confirmada!',
      greeting: 'Olá,',
      text1:
        'Agradecemos o seu interesse em se manter atualizado com as novidades da Qualitec Instrumentos Industriais!',
      text2Before: 'Sua inscrição para o e-mail',
      text2After:
        'foi realizada com sucesso. Você passará a receber periodicamente informações técnicas, novos catálogos e atualizações de produtos.',
      subtitle: 'INSTRUMENTAÇÃO INDUSTRIAL',
      representative:
        'Representante Exclusivo: HEROSE GmbH | Generant Inc | DataOnline LLC'
    },

    en: {
      subject: 'Subscription confirmed!',
      hero: 'Safety and reliability in every measurement.',
      heading: 'Subscription confirmed!',
      greeting: 'Hello,',
      text1:
        'Thank you for your interest in staying up to date with the latest news from Qualitec Industrial Instruments!',
      text2Before: 'Your subscription for the email',
      text2After:
        'has been successfully completed. You will periodically receive technical information, new catalogs and product updates.',
      subtitle: 'INDUSTRIAL INSTRUMENTATION',
      representative:
        'Exclusive Representative: HEROSE GmbH | Generant Inc | DataOnline LLC'
    },

    es: {
      subject: '¡Suscripción confirmada!',
      hero: 'Seguridad y confiabilidad en cada medición.',
      heading: '¡Suscripción confirmada!',
      greeting: 'Hola,',
      text1:
        '¡Agradecemos su interés en mantenerse al día con las novedades de Qualitec Instrumentos Industriales!',
      text2Before: 'Su suscripción para el correo electrónico',
      text2After:
        'se ha realizado correctamente. Recibirá periódicamente información técnica, nuevos catálogos y actualizaciones de productos.',
      subtitle: 'INSTRUMENTACIÓN INDUSTRIAL',
      representative:
        'Representante exclusivo: HEROSE GmbH | Generant Inc | DataOnline LLC'
    }
  } as const

  const selectedLanguage =
    lang === 'en' || lang === 'es' ? lang : 'pt'

  const t = translations[selectedLanguage]

  const html = `<!doctype html>
<html lang="${selectedLanguage}">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>${t.subject}</title>
</head>

<body
  style="
    margin:0;
    padding:24px 10px;
    background:#f1f2f4;
    font-family:Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
    "
  >
    ${t.subject}
  </div>

  <table
    role="presentation"
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="800"
          border="0"
          cellpadding="0"
          cellspacing="0"
          style="
            width:100%;
            max-width:800px;
            background:#ffffff;
            border-collapse:collapse;
            border-bottom:6px solid #064d9b;
            box-shadow:0 3px 16px rgba(0,0,0,.10);
          "
        >

          <!-- CABEÇALHO -->
          <tr>
            <td
              align="center"
              style="
                padding:36px 20px;
                background:#ffffff;
              "
            >
              <img
                src="cid:qualitec-logo"
                width="230"
                alt="Qualitec"
                style="
                  display:block;
                  width:230px;
                  max-width:70%;
                  height:auto;
                  border:0;
                "
              >
            </td>
          </tr>

          <!-- LINHA AZUL -->
          <tr>
            <td
              height="8"
              style="
                height:8px;
                background:#064d9b;
                line-height:8px;
                font-size:0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- BANNER -->
          <tr>
            <td
              background="cid:newsletter-hero"
              bgcolor="#07549c"
              valign="middle"
              style="
                height:500px;
                background-color:#07549c;
                background-image:url('cid:newsletter-hero');
                background-position:center;
                background-size:cover;
                background-repeat:no-repeat;
              "
            >
              <!--[if gte mso 9]>
              <v:rect
                xmlns:v="urn:schemas-microsoft-com:vml"
                fill="true"
                stroke="false"
                style="width:800px;height:500px;"
              >
                <v:fill
                  type="frame"
                  src="cid:newsletter-hero"
                  color="#07549c"
                />
                <v:textbox inset="0,0,0,0">
              <![endif]-->

              <table
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
              >
                <tr>
                  <td
                    valign="middle"
                    style="
                      height:500px;
                      padding:0;
                    "
                  >
                    <table
                      role="presentation"
                      width="290"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        width:290px;
                        max-width:72%;
                        background:#63a93c;
                        background:rgba(99,169,60,.92);
                        border-radius:0 8px 8px 0;
                      "
                    >
                      <tr>
                        <td
                          style="
                            padding:34px 38px;
                            color:#ffffff;
                          "
                        >
                          <p
                            style="
                              margin:0;
                              color:#ffffff;
                              font-size:25px;
                              line-height:1.35;
                              font-weight:700;
                            "
                          >
                            ${t.hero}
                          </p>

                          <div
                            style="
                              width:48px;
                              height:4px;
                              margin-top:20px;
                              background:#ffffff;
                            "
                          >
                            &nbsp;
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- CONTEÚDO -->
          <tr>
            <td
              style="
                padding:65px 55px 34px;
                background:#ffffff;
              "
            >
              <!-- ÍCONE -->
              <table
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
              >
                <tr>
                  <td
                    width="66"
                    height="66"
                    align="center"
                    valign="middle"
                    style="
                      width:66px;
                      height:66px;
                      border:4px solid #58a536;
                      border-radius:50%;
                      color:#58a536;
                      font-size:40px;
                      line-height:66px;
                      font-weight:400;
                    "
                  >
                    ✓
                  </td>
                </tr>
              </table>

              <h1
                style="
                  margin:25px 0 42px;
                  color:#064d9b;
                  font-size:40px;
                  line-height:1.2;
                  font-weight:700;
                "
              >
                ${t.heading}
              </h1>

              <p
                style="
                  margin:0 0 28px;
                  color:#253040;
                  font-size:20px;
                  line-height:1.65;
                "
              >
                ${t.greeting}
              </p>

              <p
                style="
                  margin:0 0 34px;
                  color:#253040;
                  font-size:20px;
                  line-height:1.65;
                "
              >
                ${t.text1}
              </p>

              <p
                style="
                  margin:0 0 55px;
                  color:#253040;
                  font-size:20px;
                  line-height:1.65;
                "
              >
                ${t.text2Before}
                <strong style="color:#064d9b;">
                  ${email}
                </strong>
                ${t.text2After}
              </p>

              <!-- RODAPÉ -->
              <table
                role="presentation"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                style="
                  width:100%;
                  background:#f6f7f8;
                  border-top:1px solid #d4d8dd;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding:40px 28px 35px;
                    "
                  >
                    <p
                      style="
                        margin:0 0 12px;
                        color:#064d9b;
                        font-size:15px;
                        line-height:1.3;
                        font-weight:700;
                        letter-spacing:3px;
                      "
                    >
                      ${t.subtitle}
                    </p>

                    <p
                      style="
                        margin:0 0 18px;
                        color:#064d9b;
                        font-size:26px;
                        line-height:1.25;
                        font-weight:700;
                      "
                    >
                      Qualitec C S I M Ltda
                    </p>

                    <p
                      style="
                        margin:0 0 8px;
                        color:#303844;
                        font-size:17px;
                        line-height:1.5;
                      "
                    >
                      Rua Fazenda Monte Alegre, 367 - São Paulo / SP
                    </p>

                    <p
                      style="
                        margin:0 0 26px;
                        color:#303844;
                        font-size:17px;
                        line-height:1.5;
                      "
                    >
                      Tel: +55 11 3908 7100 |
                      <a
                        href="mailto:vendas@qualitecinstrumentos.com.br"
                        style="
                          color:#064d9b;
                          text-decoration:none;
                        "
                      >
                        vendas@qualitecinstrumentos.com.br
                      </a>
                    </p>

                    <table
                      role="presentation"
                      width="90%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                    >
                      <tr>
                        <td
                          height="1"
                          style="
                            height:1px;
                            background:#cbd0d6;
                            font-size:0;
                            line-height:1px;
                          "
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin:25px 0 0;
                        color:#424b57;
                        font-size:15px;
                        line-height:1.55;
                      "
                    >
                      ${t.representative}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const attachments = [
    {
      filename: 'qualitec-logo.png',
      path: resolve(
        process.cwd(),
        'public/images/email/qualitec-logo.png'
      ),
      cid: 'qualitec-logo'
    },
    {
      filename: 'newsletter-hero.jpg',
      path: resolve(
        process.cwd(),
        'public/images/email/newsletter-hero.jpg'
      ),
      cid: 'newsletter-hero'
    }
  ]

  return {
    subject: t.subject,
    html,
    attachments
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { type, email, name, phone, company, subject, message, productName, lang } = body || {}

    if (!type) {
      throw createError({
        statusCode: 400,
        message: 'Tipo de formulário não especificado.'
      })
    }

    if (!email || !String(email).trim() || !String(email).includes('@')) {
      throw createError({
        statusCode: 400,
        message: 'Um endereço de e-mail válido é obrigatório.'
      })
    }

    const host = process.env.SMTP_HOST || 'smtp.skymail.net.br'
    const port = Number(process.env.SMTP_PORT) || 465
    const secure = process.env.SMTP_SECURE !== 'false'
    const user = process.env.SMTP_USER || 'catalogo@qualitec.ind.br'
    const pass = process.env.SMTP_PASS || 'Instrumentos@2026'
    const recipientList = (process.env.SMTP_TO_EMAIL || 'vendas@qualitecinstrumentos.com.br,catalogo@qualitec.ind.br')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    })

    const currentDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    if (type === 'newsletter') {
      const activeLang = (lang || 'pt').toLowerCase()

      // 0. Gravar e-mail cadastrado no Supabase
      await saveNewsletterSubscriber(email, activeLang)

      // 1. Notificar equipe interna
      const internalMailOptions = {
        from: `"Qualitec Website" <${user}>`,
        to: recipientList.join(', '),
        subject: `[QUALITEC SITE] Nova Inscrição na Newsletter - ${email} (${activeLang.toUpperCase()})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #004A96; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Qualitec Instrumentos - Nova Inscrição Newsletter</h2>
            </div>
            <div style="padding: 20px; background-color: #ffffff; color: #333333; font-size: 14px; line-height: 1.6;">
              <p>Olá Equipe Qualitec,</p>
              <p>Um novo visitante solicitou a inscrição para receber a <strong>Newsletter</strong> do site:</p>
              
              <div style="background-color: #f5f7fa; padding: 12px 16px; border-left: 4px solid #004A96; margin: 15px 0;">
                <p style="margin: 0; font-size: 15px;"><strong>E-mail Cadastrado:</strong> <a href="mailto:${email}" style="color: #004A96;">${email}</a></p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #666666;">Idioma Selecionado: <strong>${activeLang.toUpperCase()}</strong></p>
                <p style="margin: 3px 0 0; font-size: 12px; color: #666666;">Data/Hora: ${currentDate}</p>
              </div>

              <p style="font-size: 12px; color: #777777; margin-top: 25px;">
                Este e-mail foi gerado automaticamente pelo formulário de Newsletter do site Qualitec.
              </p>
            </div>
          </div>
        `
      }

      // 2. Enviar e-mail de confirmação visualmente idêntico ao modelo via CID para o cliente no idioma selecionado
      const {
        subject: clientSubject,
        html: clientHtml,
        attachments: clientAttachments
      } = getNewsletterTemplate(email, activeLang)

      const clientMailOptions = {
        from: `"Qualitec Instrumentos" <${user}>`,
        to: email,
        subject: clientSubject,
        html: clientHtml,
        attachments: clientAttachments
      }

      await transporter.sendMail(internalMailOptions)
      try {
        await transporter.sendMail(clientMailOptions)
      } catch (clientErr) {
        console.warn('[SMTP Client Email Warning]', clientErr)
      }

      return { success: true, message: 'Inscrição enviada e confirmada com sucesso!' }
    }

    if (type === 'contact' || type === 'quote') {
      const isQuote = type === 'quote'
      const titleSubject = isQuote ? 'Solicitação de Orçamento' : 'Formulário de Contato'

      // Save contact to database
      await saveContactSubmission({
        name,
        email,
        phone,
        company,
        subject,
        message,
        productName,
        type
      })

      // Notificar equipe
      const internalMailOptions = {
        from: `"Qualitec Website" <${user}>`,
        to: recipientList.join(', '),
        subject: `[QUALITEC SITE] ${titleSubject} - ${name || email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #004A96; padding: 18px; text-align: center; border-radius: 6px 6px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Qualitec - Nova ${titleSubject}</h2>
            </div>
            <div style="padding: 20px; background-color: #ffffff; color: #333333; font-size: 14px; line-height: 1.6;">
              <p>Recebemos uma nova mensagem enviada pelo formulário do site:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Nome:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${name || 'Não informado'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">E-mail:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #004A96;">${email}</a></td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Telefone:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${phone || 'Não informado'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Empresa:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${company || 'Não informada'}</td>
                </tr>
                ${productName ? `
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Equipamento / Produto:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; color: #004A96; font-weight: bold;">${productName}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Assunto:</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${subject || titleSubject}</td>
                </tr>
              </table>

              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #004A96; margin-top: 15px;">
                <p style="margin: 0 0 5px; font-weight: bold; color: #1e293b;">Mensagem do Cliente:</p>
                <p style="margin: 0; white-space: pre-wrap; color: #334155;">${message || 'Sem mensagem adicional.'}</p>
              </div>

              <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">
                Data/Hora de Envio: ${currentDate}
              </p>
            </div>
          </div>
        `
      }

      // E-mail de resposta ao cliente
      const clientMailOptions = {
        from: `"Qualitec Instrumentos" <${user}>`,
        to: email,
        subject: `Qualitec - Confirmação de Recebimento (${titleSubject})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="background-color: #004A96; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Qualitec C S I M Ltda</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; color: #333333; font-size: 14px; line-height: 1.6;">
              <p>Olá, <strong>${name || 'Cliente'}</strong>,</p>
              <p>Recebemos sua mensagem com sucesso! Nossa equipe técnica/comercial analisará suas informações e retornará o seu contato o mais breve possível.</p>
              
              <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 13px;">
                <p style="margin: 0;"><strong>Assunto:</strong> ${subject || titleSubject}</p>
                ${productName ? `<p style="margin: 5px 0 0;"><strong>Produto:</strong> ${productName}</p>` : ''}
              </div>

              <p style="margin-top: 20px;">Atenciosamente,</p>
              <p style="font-size: 12px; color: #666666; margin: 0;">
                <strong>Qualitec C S I M Ltda</strong><br />
                Rua Fazenda Monte Alegre, 367 - São Paulo / SP<br />
                Tel: +55 11 3908 7100 | <a href="mailto:vendas@qualitecinstrumentos.com.br" style="color: #004A96;">vendas@qualitecinstrumentos.com.br</a>
              </p>
            </div>
          </div>
        `
      }

      await transporter.sendMail(internalMailOptions)
      try {
        await transporter.sendMail(clientMailOptions)
      } catch (clientErr) {
        console.warn('[SMTP Client Confirmation Warning]', clientErr)
      }

      return { success: true, message: 'Mensagem enviada com sucesso! Em breve entraremos em contato.' }
    }

    throw createError({
      statusCode: 400,
      message: 'Tipo de requisição de e-mail inválido.'
    })
  } catch (err: any) {
    console.error('[SMTP Send Error]', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Erro ao enviar e-mail via servidor SMTP.'
    })
  }
})
