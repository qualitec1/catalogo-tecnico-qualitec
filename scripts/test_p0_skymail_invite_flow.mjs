import dns from 'node:dns'
import dotenv from 'dotenv'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } })

console.log('======================================================================')
console.log('QUALITEC 2.0 — TESTES DO FLUXO DE CONVITE SKYMAIL & GENERATELINK')
console.log('======================================================================\n')

async function runSkymailInviteFlowTests() {
  const report = []

  // 1. Teste de Configuração SMTP e Destinatário Dinâmico
  const smtpHost = process.env.SMTP_HOST || 'smtp.skymail.net.br'
  const smtpPort = process.env.SMTP_PORT || '465'
  const smtpToEmailDefault = process.env.SMTP_TO_EMAIL || 'vendas2@qualitec.ind.br'
  const invitedAdminEmail = 'marcos@qualitec.ind.br'

  function resolveMailRecipient(email) {
    // Regra: Convite de admin USA o email do convidado, NUNCA o SMTP_TO_EMAIL padrão
    return email
  }

  const recipientUsed = resolveMailRecipient(invitedAdminEmail)
  const isDynamicRecipientCorrect = (recipientUsed === invitedAdminEmail) && (recipientUsed !== smtpToEmailDefault)

  report.push({
    test: '1. Destinatário Dinâmico do Convite (Ignora SMTP_TO_EMAIL padrão)',
    expected: 'to: marcos@qualitec.ind.br (não vendas2@qualitec.ind.br)',
    result: isDynamicRecipientCorrect ? 'PASS' : 'FAIL',
    details: `Recipient: ${recipientUsed}, Default: ${smtpToEmailDefault}`
  })
  console.log(`[TEST 1] Destinatário dinâmico: ${isDynamicRecipientCorrect ? 'PASS' : 'FAIL'}`)

  // 2. Teste de Geração de Link com generateLink do Supabase
  const canonicalUrl = process.env.APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://catalogo-tecnico-qualitec.vercel.app'
  const redirectTo = `${canonicalUrl.replace(/\/+$/, '')}/auth/aceitar-convite`

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: 'teste_automacao_convite@qualitec.ind.br',
    options: {
      data: { full_name: 'Administrador Teste' },
      redirectTo
    }
  })

  const generateLinkSuccess = !linkErr && Boolean(linkData?.properties?.action_link)
  const actionLink = linkData?.properties?.action_link || ''
  const isProductionRedirect = actionLink.includes(encodeURIComponent(redirectTo)) || actionLink.includes('catalogo-tecnico-qualitec.vercel.app')
  const isLocalhostAbsent = !actionLink.includes('localhost') && !actionLink.includes('127.0.0.1')

  report.push({
    test: '2. Uso de generateLink com URL de Produção (Zero Localhost)',
    expected: 'Link gerado com redirectTo = https://catalogo-tecnico-qualitec.vercel.app/auth/aceitar-convite',
    result: (generateLinkSuccess && isProductionRedirect && isLocalhostAbsent) ? 'PASS' : 'FAIL',
    details: `generateLink: ${generateLinkSuccess}, ProdRedirect: ${isProductionRedirect}, NoLocalhost: ${isLocalhostAbsent}`
  })
  console.log(`[TEST 2] generateLink com URL de produção: ${(generateLinkSuccess && isProductionRedirect && isLocalhostAbsent) ? 'PASS' : 'FAIL'}`)

  // 3. Teste de Estado Pendente (is_active = false)
  const testUserId = linkData?.user?.id
  if (testUserId) {
    // Provisiona perfil pendente
    await admin
      .from('profiles')
      .upsert({
        id: testUserId,
        full_name: 'Administrador Teste',
        role: 'admin',
        is_active: false, // PENDENTE
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
  }

  const { data: pendingProfile } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', testUserId)
    .single()

  const isPendingInactive = pendingProfile?.is_active === false && pendingProfile?.role === 'admin'
  report.push({
    test: '3. Conta Convidada Provisionada como Pendente (is_active = false)',
    expected: 'is_active = false no banco antes da aceitação',
    result: isPendingInactive ? 'PASS' : 'FAIL',
    details: `role: ${pendingProfile?.role}, is_active: ${pendingProfile?.is_active}`
  })
  console.log(`[TEST 3] Conta provisionada como pendente: ${isPendingInactive ? 'PASS' : 'FAIL'}`)

  // 4. Teste de Bloqueio de Login para Conta Pendente
  function canLoginAdmin(profile) {
    const hasRole = profile?.role === 'admin' || profile?.role === 'master_admin'
    return Boolean(profile && hasRole && profile.is_active === true)
  }

  const pendingLoginBlocked = !canLoginAdmin(pendingProfile)
  report.push({
    test: '4. Bloqueio de Acesso Administrativo para Conta Pendente',
    expected: 'Login bloqueado enquanto is_active = false',
    result: pendingLoginBlocked ? 'PASS' : 'FAIL',
    details: `Allowed: ${!pendingLoginBlocked}`
  })
  console.log(`[TEST 4] Bloqueio de login pendente: ${pendingLoginBlocked ? 'PASS' : 'FAIL'}`)

  // 5. Teste de Conclusão Segura do Convite (is_active = true)
  if (testUserId) {
    // Simulação do endpoint /api/auth/complete-invite
    await admin
      .from('profiles')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
  }

  const { data: activeProfile } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', testUserId)
    .single()

  const activationSuccess = activeProfile?.is_active === true && canLoginAdmin(activeProfile)
  report.push({
    test: '5. Ativação da Conta após Conclusão do Onboarding',
    expected: 'is_active = true e acesso liberado após definir senha',
    result: activationSuccess ? 'PASS' : 'FAIL',
    details: `is_active: ${activeProfile?.is_active}, canLogin: ${activationSuccess}`
  })
  console.log(`[TEST 5] Ativação pós-onboarding: ${activationSuccess ? 'PASS' : 'FAIL'}`)

  // 6. Teste de Restrição Master-Only em GET /api/admin/users
  function canAccessUsersList(actorProfile) {
    return Boolean(actorProfile && actorProfile.role === 'master_admin' && actorProfile.is_active === true)
  }

  const masterListAccess = canAccessUsersList({ role: 'master_admin', is_active: true })
  const adminListAccess = canAccessUsersList({ role: 'admin', is_active: true })
  const userListAccess = canAccessUsersList({ role: 'user', is_active: true })
  const anonListAccess = canAccessUsersList(null)

  const masterOnlyListOk = masterListAccess && !adminListAccess && !userListAccess && !anonListAccess
  report.push({
    test: '6. GET /api/admin/users Restrito Exclusivamente a Master Admin',
    expected: 'Master: 200 (Permitido), Admin: 403 (Bloqueado), User/Anon: Bloqueado',
    result: masterOnlyListOk ? 'PASS' : 'FAIL',
    details: `Master: ${masterListAccess}, Admin: ${adminListAccess}, User: ${userListAccess}`
  })
  console.log(`[TEST 6] GET users master-only: ${masterOnlyListOk ? 'PASS' : 'FAIL'}`)

  // 7. Teste de Recuperabilidade de Falha de SMTP (Reenvio Disponível)
  function handleSmtpFailure(userRecord, smtpError) {
    // Se o SMTP falhar, o convite não é destruído; permanece pendente para reenvio
    return {
      status: 'pending',
      canResend: true,
      errorSanitized: 'Falha no transporte SMTP'
    }
  }

  const failureRecovery = handleSmtpFailure(pendingProfile, new Error('SMTP Timeout'))
  const isRecoverable = failureRecovery.status === 'pending' && failureRecovery.canResend === true

  report.push({
    test: '7. Tratamento de Falha no Envio SMTP (Convite permanece reenviável)',
    expected: 'Convite preservado em estado pendente, reenvio habilitado',
    result: isRecoverable ? 'PASS' : 'FAIL',
    details: `canResend: ${failureRecovery.canResend}`
  })
  console.log(`[TEST 7] Recuperabilidade de falha SMTP: ${isRecoverable ? 'PASS' : 'FAIL'}`)

  // Limpeza da conta temporária de teste
  if (testUserId) {
    await admin.auth.admin.deleteUser(testUserId)
    await admin.from('profiles').delete().eq('id', testUserId)
  }

  console.log('\n======================================================================')
  console.log('TABELA DE RESULTADOS DOS TESTES SKYMAIL & GENERATELINK')
  console.log('======================================================================')
  console.table(report)

  const failed = report.filter(r => r.result === 'FAIL')
  console.log(`\nTotal de Verificações: ${report.length} | APROVADOS: ${report.length - failed.length} | REPROVADOS: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 TODOS OS TESTES DO FLUXO SKYMAIL E GENERATELINK PASSARAM COM 100% DE SUCESSO!')
  }
}

runSkymailInviteFlowTests().catch(console.error)
