import nodemailer from 'nodemailer'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { type, email, name, phone, company, subject, message, productName } = body || {}

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
      // 1. Notificar equipe interna
      const internalMailOptions = {
        from: `"Qualitec Website" <${user}>`,
        to: recipientList.join(', '),
        subject: `[QUALITEC SITE] Nova Inscrição na Newsletter - ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 8px;">
            <div style="background-color: #004A96; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Qualitec Instrumentos - Nova Inscrição Newsletter</h2>
            </div>
            <div style="padding: 20px; background-color: #ffffff; color: #333333; font-size: 14px; line-height: 1.6;">
              <p>Olá Equipe Qualitec,</p>
              <p>Um novo visitante solicitou a inscrição para receber a <strong>Newsletter</strong> do site:</p>
              
              <div style="background-color: #f5f7fa; padding: 12px 16px; border-left: 4px solid #004A96; margin: 15px 0;">
                <p style="margin: 0; font-size: 15px;"><strong>E-mail Cadastrado:</strong> <a href="mailto:${email}" style="color: #004A96;">${email}</a></p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #666666;">Data/Hora: ${currentDate}</p>
              </div>

              <p style="font-size: 12px; color: #777777; margin-top: 25px;">
                Este e-mail foi gerado automaticamente pelo formulário de Newsletter do site Qualitec 2.0.
              </p>
            </div>
          </div>
        `
      }

      // 2. Enviar e-mail de confirmação ao cliente
      const clientMailOptions = {
        from: `"Qualitec Instrumentos" <${user}>`,
        to: email,
        subject: `Qualitec Instrumentos - Inscrição na Newsletter Confirmada!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 8px;">
            <div style="background-color: #004A96; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Qualitec C S I M Ltda</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; color: #333333; font-size: 14px; line-height: 1.6;">
              <p>Olá,</p>
              <p>Agradecemos o seu interesse em se manter atualizado com as novidades da <strong>Qualitec Instrumentos Industriais</strong>!</p>
              <p>Sua inscrição para o e-mail <strong>${email}</strong> foi realizada com sucesso. Você passará a receber periodicamente informações técnicas, novos catálogos e atualizações de produtos.</p>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              
              <p style="font-size: 12px; color: #666666; margin: 0;">
                <strong>Qualitec C S I M Ltda</strong><br />
                Rua Fazenda Monte Alegre, 367 - São Paulo / SP<br />
                Tel: +55 11 3908 7100 | <a href="mailto:vendas@qualitecinstrumentos.com.br" style="color: #004A96;">vendas@qualitecinstrumentos.com.br</a><br />
                Representante Exclusivo: HEROSE GmbH | Generant Inc | DataOnline LLC
              </p>
            </div>
          </div>
        `
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-lg: 8px;">
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
