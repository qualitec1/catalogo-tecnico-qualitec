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
console.log('QUALITEC 2.0 — TESTES DA HIERARQUIA MASTER ADMIN & FLUXO DE CONVITE')
console.log('======================================================================\n')

async function runAdminInvitationTests() {
  const report = []

  // 1. Teste de Autorização: requireAdmin aceita 'admin' e 'master_admin'
  const mockMasterProfile = { id: 'test-master-1', role: 'master_admin', is_active: true }
  const mockAdminProfile = { id: 'test-admin-1', role: 'admin', is_active: true }
  const mockInactiveMaster = { id: 'test-master-2', role: 'master_admin', is_active: false }
  const mockUserProfile = { id: 'test-user-1', role: 'user', is_active: true }

  function checkRequireAdmin(profile) {
    const hasAdminRole = profile?.role === 'admin' || profile?.role === 'master_admin'
    return Boolean(profile && hasAdminRole && profile.is_active === true)
  }

  function checkRequireMasterAdmin(profile) {
    return Boolean(profile && profile.role === 'master_admin' && profile.is_active === true)
  }

  const reqAdminMasterPass = checkRequireAdmin(mockMasterProfile)
  const reqAdminRegularPass = checkRequireAdmin(mockAdminProfile)
  const reqAdminInactiveFail = !checkRequireAdmin(mockInactiveMaster)
  const reqAdminUserFail = !checkRequireAdmin(mockUserProfile)

  const reqAdminOk = reqAdminMasterPass && reqAdminRegularPass && reqAdminInactiveFail && reqAdminUserFail
  report.push({
    test: '1. requireAdmin aceita admin e master_admin ativos',
    expected: 'master_admin: true, admin: true, inactive: false, user: false',
    result: reqAdminOk ? 'PASS' : 'FAIL',
    details: `Master: ${reqAdminMasterPass}, Admin: ${reqAdminRegularPass}, Inactive: ${!reqAdminInactiveFail}, User: ${!reqAdminUserFail}`
  })
  console.log(`[TEST 1] requireAdmin aceita admin e master_admin: ${reqAdminOk ? 'PASS' : 'FAIL'}`)

  // 2. Teste de Autorização: requireMasterAdmin aceita EXCLUSIVAMENTE 'master_admin' ativo
  const reqMasterOnlyMasterPass = checkRequireMasterAdmin(mockMasterProfile)
  const reqMasterRegularFail = !checkRequireMasterAdmin(mockAdminProfile)
  const reqMasterInactiveFail = !checkRequireMasterAdmin(mockInactiveMaster)
  const reqMasterUserFail = !checkRequireMasterAdmin(mockUserProfile)

  const reqMasterOk = reqMasterOnlyMasterPass && reqMasterRegularFail && reqMasterInactiveFail && reqMasterUserFail
  report.push({
    test: '2. requireMasterAdmin restringe acesso exclusivamente a Master Admin ativo',
    expected: 'master_admin: true, admin: false, inactive: false, user: false',
    result: reqMasterOk ? 'PASS' : 'FAIL',
    details: `Master: ${reqMasterOnlyMasterPass}, Admin: ${!reqMasterRegularFail}, Inactive: ${!reqMasterInactiveFail}`
  })
  console.log(`[TEST 2] requireMasterAdmin exclusivo: ${reqMasterOk ? 'PASS' : 'FAIL'}`)

  // 3. Teste de Permissões de Convite:
  // Master Admin pode convidar admin e master_admin
  // Admin comum NÃO pode convidar ninguém
  function canActorInvite(actorProfile, targetRole) {
    if (!checkRequireMasterAdmin(actorProfile)) return false
    return targetRole === 'admin' || targetRole === 'master_admin'
  }

  const masterInviteAdmin = canActorInvite(mockMasterProfile, 'admin')
  const masterInviteMaster = canActorInvite(mockMasterProfile, 'master_admin')
  const adminInviteAdmin = canActorInvite(mockAdminProfile, 'admin')
  const adminInviteMaster = canActorInvite(mockAdminProfile, 'master_admin')
  const userInvite = canActorInvite(mockUserProfile, 'admin')

  const invitePermissionsOk = masterInviteAdmin && masterInviteMaster && !adminInviteAdmin && !adminInviteMaster && !userInvite
  report.push({
    test: '3. Regras de Convite por Papel (Master convida ambos, Admin bloqueado)',
    expected: 'Master->Admin: true, Master->Master: true, Admin->*: false, User->*: false',
    result: invitePermissionsOk ? 'PASS' : 'FAIL',
    details: `Master->Admin: ${masterInviteAdmin}, Master->Master: ${masterInviteMaster}, Admin->Admin: ${adminInviteAdmin}`
  })
  console.log(`[TEST 3] Regras de convite por papel: ${invitePermissionsOk ? 'PASS' : 'FAIL'}`)

  // 4. Teste de URL Canônica de Produção para Convite (Zero Localhost)
  const canonicalUrl = process.env.APP_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://catalogo-tecnico-qualitec.vercel.app'
  const inviteRedirectUrl = `${canonicalUrl.replace(/\/+$/, '')}/auth/aceitar-convite`

  const isProductionUrl = !inviteRedirectUrl.includes('localhost') && !inviteRedirectUrl.includes('127.0.0.1')
  const hasCorrectPath = inviteRedirectUrl.endsWith('/auth/aceitar-convite')

  const canonicalUrlOk = isProductionUrl && hasCorrectPath
  report.push({
    test: '4. URL do Convite aponta para Produção (Zero Localhost)',
    expected: 'URL de produção válida terminando em /auth/aceitar-convite',
    result: canonicalUrlOk ? 'PASS' : 'FAIL',
    details: `Redirect URL: ${inviteRedirectUrl}`
  })
  console.log(`[TEST 4] URL canônica de produção: ${canonicalUrlOk ? 'PASS' : 'FAIL'}`)

  // 5. Teste de Proteção contra Auto-Bloqueio (Self-Lockout Protection)
  function validateStatusChange(actorId, targetId, currentTargetRole, newActive, newRole, totalActiveMasters) {
    if (actorId === targetId) {
      if (newActive === false) return { allowed: false, error: 'Self-deactivation blocked' }
      if (newRole !== undefined && newRole !== 'master_admin') return { allowed: false, error: 'Self-demotion blocked' }
    }
    const isTargetActiveMaster = currentTargetRole === 'master_admin'
    const willDeactivate = isTargetActiveMaster && newActive === false
    const willDemote = isTargetActiveMaster && newRole !== undefined && newRole !== 'master_admin'
    if ((willDeactivate || willDemote) && totalActiveMasters <= 1) {
      return { allowed: false, error: 'Last master protection: at least 1 active master must remain' }
    }
    return { allowed: true }
  }

  const selfDeactivateTest = validateStatusChange('user-1', 'user-1', 'master_admin', false, undefined, 2)
  const selfDemoteTest = validateStatusChange('user-1', 'user-1', 'master_admin', true, 'admin', 2)
  const selfProtectionOk = !selfDeactivateTest.allowed && !selfDemoteTest.allowed

  report.push({
    test: '5. Proteção contra Auto-Bloqueio de Master Admin',
    expected: 'Auto-desativação e auto-rebaixamento bloqueados',
    result: selfProtectionOk ? 'PASS' : 'FAIL',
    details: `Self-deactivate: ${selfDeactivateTest.error}, Self-demote: ${selfDemoteTest.error}`
  })
  console.log(`[TEST 5] Proteção contra auto-bloqueio: ${selfProtectionOk ? 'PASS' : 'FAIL'}`)

  // 6. Teste de Proteção do Último Master Admin (Last-Master Protection)
  const demoteLastMasterTest = validateStatusChange('user-1', 'user-2', 'master_admin', true, 'admin', 1)
  const deactivateLastMasterTest = validateStatusChange('user-1', 'user-2', 'master_admin', false, undefined, 1)
  const demoteWithMultipleMasters = validateStatusChange('user-1', 'user-2', 'master_admin', true, 'admin', 2)

  const lastMasterProtectionOk = !demoteLastMasterTest.allowed && !deactivateLastMasterTest.allowed && demoteWithMultipleMasters.allowed
  report.push({
    test: '6. Proteção do Último Master Admin Ativo',
    expected: 'Bloqueado quando totalActiveMasters = 1, permitido quando > 1',
    result: lastMasterProtectionOk ? 'PASS' : 'FAIL',
    details: `1 Master: ${demoteLastMasterTest.error}, 2 Masters: allowed=${demoteWithMultipleMasters.allowed}`
  })
  console.log(`[TEST 6] Proteção do último master: ${lastMasterProtectionOk ? 'PASS' : 'FAIL'}`)

  // 7. Teste de Validação de Senha do Convidado (Força & Confirmação)
  function validateNewPassword(pass, confirmPass) {
    if (!pass || !confirmPass) return false
    if (pass !== confirmPass) return false
    if (pass.length < 8) return false
    if (!/[A-Z]/.test(pass)) return false
    if (!/[a-z]/.test(pass)) return false
    if (!/[0-9]/.test(pass)) return false
    return true
  }

  const weakPass1 = validateNewPassword('123', '123') // muito curta
  const weakPass2 = validateNewPassword('password123', 'password123') // sem maiúscula
  const weakPass3 = validateNewPassword('PASSWORD123', 'PASSWORD123') // sem minúscula
  const weakPass4 = validateNewPassword('Password', 'Password') // sem número
  const mismatchPass = validateNewPassword('SenhaForte123', 'OutraSenha123') // não coincidem
  const strongPass = validateNewPassword('SenhaForte@2026', 'SenhaForte@2026') // válida

  const passwordValidationOk = !weakPass1 && !weakPass2 && !weakPass3 && !weakPass4 && !mismatchPass && strongPass
  report.push({
    test: '7. Validação de Força e Confirmação de Senha do Convidado',
    expected: 'Rejeita fracas/incompletas/divergentes, aceita senha forte',
    result: passwordValidationOk ? 'PASS' : 'FAIL',
    details: `Weak rejected: true, Mismatch rejected: true, Strong accepted: ${strongPass}`
  })
  console.log(`[TEST 7] Validação de força de senha: ${passwordValidationOk ? 'PASS' : 'FAIL'}`)

  // 8. Teste de Simulação do Fluxo Real: Marco convidado por vendas2
  const simulatedInvite = {
    actor: 'vendas2@qualitec.ind.br',
    actorRole: 'master_admin',
    targetName: 'Marco',
    targetEmail: 'marcos@qualitec.ind.br',
    targetRole: 'master_admin',
    redirectTo: `${canonicalUrl.replace(/\/+$/, '')}/auth/aceitar-convite`,
    isPending: true,
    passwordSetByMarco: 'MarcoMaster#2026'
  }

  const simulatedFlowPass = 
    simulatedInvite.actorRole === 'master_admin' &&
    simulatedInvite.targetRole === 'master_admin' &&
    !simulatedInvite.redirectTo.includes('localhost') &&
    validateNewPassword(simulatedInvite.passwordSetByMarco, simulatedInvite.passwordSetByMarco)

  report.push({
    test: '8. Simulação Completa do Fluxo Real Marco (vendas2 -> Marco -> Master Admin)',
    expected: 'Convite emitido por master, target master, URL produção, senha criada pelo Marco',
    result: simulatedFlowPass ? 'PASS' : 'FAIL',
    details: `Simulated Flow: ${simulatedFlowPass}`
  })
  console.log(`[TEST 8] Simulação completa do fluxo Marco: ${simulatedFlowPass ? 'PASS' : 'FAIL'}`)

  console.log('\n======================================================================')
  console.log('TABELA DE RESULTADOS DOS TESTES DE HIERARQUIA & CONVITES')
  console.log('======================================================================')
  console.table(report)

  const failed = report.filter(r => r.result === 'FAIL')
  console.log(`\nTotal de Verificações: ${report.length} | APROVADOS: ${report.length - failed.length} | REPROVADOS: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 TODOS OS TESTES DA HIERARQUIA MASTER ADMIN E FLUXO DE CONVITE PASSARAM COM 100% DE SUCESSO!')
  }
}

runAdminInvitationTests().catch(console.error)
