import nodemailer from 'nodemailer'

interface AdminInviteMailParams {
  toEmail: string
  toName: string
  role: 'admin' | 'master_admin'
  actionLink: string
}

/**
 * Envia o e-mail de convite para novo administrador utilizando o SMTP Skymail configurado.
 * O destinatário é estritamente dinâmico (toEmail), ignorando SMTP_TO_EMAIL.
 */
export async function sendAdminInvitationEmail(params: AdminInviteMailParams): Promise<{ success: boolean; error?: string }> {
  const { toEmail, toName, role, actionLink } = params

  const host = process.env.SMTP_HOST || 'smtp.skymail.net.br'
  const port = Number(process.env.SMTP_PORT) || 465
  const secure = process.env.SMTP_SECURE === 'true' || port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const fromName = process.env.SMTP_FROM_NAME || 'Qualitec Industrial'

  if (!user || !pass) {
    console.error('[AdminMailer] SMTP credentials missing (SMTP_USER or SMTP_PASS not set).')
    return { success: false, error: 'Configuração de envio de e-mail (SMTP) incompleta no servidor.' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    })

    const roleLabel = role === 'master_admin' ? 'Master Administrador' : 'Administrador'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .card { max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background-color: #0f172a; padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
          .body { padding: 32px 28px; }
          .badge { display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 700; border-radius: 9999px; background-color: ${role === 'master_admin' ? '#faf5ff' : '#eff6ff'}; color: ${role === 'master_admin' ? '#7e22ce' : '#1d4ed8'}; border: 1px solid ${role === 'master_admin' ? '#e9d5ff' : '#bfdbfe'}; margin-top: 4px; }
          .button-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Qualitec Industrial</h1>
          </div>
          <div class="body">
            <p style="font-size: 15px; margin-top: 0;">Olá, <strong>${toName || 'Administrador'}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Você recebeu um convite para acessar o <strong>Painel Administrativo da Qualitec</strong>.
            </p>
            <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Nível de Acesso Atribuído:</span>
              <span class="badge">${roleLabel}</span>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              Clique no botão abaixo para ativar seu acesso e definir sua senha pessoal com segurança:
            </p>
            <div class="button-container">
              <a href="${actionLink}" class="btn" target="_blank">Aceitar Convite & Definir Senha</a>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
              Este link é pessoal, expira após o uso e não deve ser compartilhado com terceiros.
            </p>
          </div>
          <div class="footer">
            Qualitec Industrial — Catálogo Técnico & Painel Administrativo<br>
            Se você não esperava por este convite, nenhuma ação é necessária.
          </div>
        </div>
      </body>
      </html>
    `

    const maskedTo = toEmail.replace(/(?<=.{2}).(?=.*@)/g, '*')

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: toEmail,
      subject: 'Convite para o Painel Administrativo Qualitec',
      html: htmlContent
    })

    console.info('[AdminMailer] Invitation email sent successfully via Skymail SMTP to:', maskedTo)
    return { success: true }
  } catch (err: any) {
    console.error('[AdminMailer] Error sending invitation email:', err.message || err)
    return { success: false, error: err.message || 'Falha no transporte SMTP ao enviar e-mail.' }
  }
}
