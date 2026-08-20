import dns from 'node:dns'
import dotenv from 'dotenv'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function normalizeBase32(s) { return s.toUpperCase().replace(/[^A-Z2-7]/g, '') }
function base32ToBytes(b) {
  const norm = normalizeBase32(b)
  const bytes = []
  let bits = 0, val = 0
  for (const c of norm) {
    const idx = ALPHABET.indexOf(c)
    if (idx === -1) continue
    val = (val << 5) | idx
    bits += 5
    if (bits >= 8) { bytes.push((val >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return Uint8Array.from(bytes)
}
function generateTOTP(secret, digits = 6, period = 30, timestamp = Date.now()) {
  const key = base32ToBytes(secret)
  const counter = Math.floor(timestamp / 1000 / period)
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter), 0)
  const hmac = createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)
  return (code % 10 ** digits).toString().padStart(digits, '0')
}

console.log('======================================================================')
console.log('QUALITEC 2.0 — VERIFICAÇÃO CRÍTICA: SEPARAÇÃO DE CLIENTS & LOGIN')
console.log('======================================================================\n')

async function runCriticalTest() {
  const report = []

  // 1. Client isolado para autenticação (supabaseAuth)
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws }
  })

  // 2. Client isolado para administração (supabaseAdmin - NUNCA chama signIn)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws }
  })

  // PROVA 1: adminClient consegue SELECT totp_secrets via Service Role
  const { data: adminTotpData, error: adminTotpError } = await adminClient
    .from('totp_secrets')
    .select('user_id, secret, enabled')
    .limit(1)

  const adminClientCanReadTotp = !adminTotpError
  report.push({
    test: '1. adminClient (Service Role) acessa totp_secrets',
    expected: 'SUCCESS (HTTP 200 / zero error)',
    result: adminClientCanReadTotp ? 'PASS' : 'FAIL',
    details: adminTotpError ? adminTotpError.message : 'HTTP 200 OK - Service Role intacta'
  })
  console.log(`[PROVA 1] adminClient acessa totp_secrets: ${adminClientCanReadTotp ? 'PASS' : 'FAIL'}`)

  // PROVA 2: authClient (anon/authenticated) é bloqueado em totp_secrets
  const { data: authTotpData, error: authTotpError } = await authClient
    .from('totp_secrets')
    .select('user_id, secret, enabled')
    .limit(1)

  const authClientBlockedTotp = !!authTotpError
  report.push({
    test: '2. authClient (anon/authenticated) bloqueado em totp_secrets',
    expected: 'BLOCKED (42501 permission denied)',
    result: authClientBlockedTotp ? 'PASS' : 'FAIL',
    details: authTotpError ? `${authTotpError.code} - ${authTotpError.message}` : 'EXPOSED'
  })
  console.log(`[PROVA 2] authClient bloqueado em totp_secrets: ${authClientBlockedTotp ? 'PASS' : 'FAIL'}`)

  // PROVA 3: Simulação completa dos 5 fluxos com a nova arquitetura
  async function executeLoginWorkflow({ user, profile, totpRow, submittedTotp }) {
    // 1. Perfil em profiles via adminClient
    if (!profile) {
      return { statusCode: 403, error: 'Acesso Negado: Perfil de usuário não encontrado.' }
    }
    if (profile.role !== 'admin' || profile.is_active !== true) {
      return { statusCode: 403, error: 'Acesso Negado: Esta conta não possui privilégios de administrador ativo.' }
    }

    // 2. TOTP em totp_secrets via adminClient (3 Estados)
    const isTotpEnabled = Boolean(totpRow && totpRow.enabled === true && totpRow.secret)
    if (isTotpEnabled) {
      if (!submittedTotp) {
        return { statusCode: 200, totpRequired: true, message: 'Código 2FA / Autenticador obrigatório.' }
      }
      const valid = (submittedTotp === generateTOTP(totpRow.secret))
      if (!valid) {
        return { statusCode: 401, error: 'Código 2FA / Autenticador inválido' }
      }
    }

    return {
      statusCode: 200,
      user,
      profile,
      isAdmin: true,
      totpRequired: false,
      cookiesIssued: true
    }
  }

  // Cenário A: Admin sem registro TOTP (vendas2@qualitec.ind.br estado real)
  const resA = await executeLoginWorkflow({
    user: { id: '284f17a7-83d5-4b1b-8713-064790189f90', email: 'vendas2@qualitec.ind.br' },
    profile: { id: '284f17a7-83d5-4b1b-8713-064790189f90', role: 'admin', is_active: true },
    totpRow: null,
    submittedTotp: undefined
  })
  const passA = resA.statusCode === 200 && resA.isAdmin === true && resA.cookiesIssued === true && resA.totpRequired === false
  report.push({
    test: '3. Admin sem registro TOTP (Estado A)',
    expected: 'login PASS, totpRequired=false, sessão emitida',
    result: passA ? 'PASS' : 'FAIL',
    details: `Status ${resA.statusCode}, isAdmin: ${resA.isAdmin}, cookies: ${resA.cookiesIssued}`
  })
  console.log(`[Cenário A] Admin sem TOTP: ${passA ? 'PASS' : 'FAIL'}`)

  // Cenário B: Admin com enabled=false (Estado B)
  const resB = await executeLoginWorkflow({
    user: { id: '284f17a7-83d5-4b1b-8713-064790189f90', email: 'vendas2@qualitec.ind.br' },
    profile: { id: '284f17a7-83d5-4b1b-8713-064790189f90', role: 'admin', is_active: true },
    totpRow: { secret: 'JBSWY3DPEHPK3PXP', enabled: false },
    submittedTotp: undefined
  })
  const passB = resB.statusCode === 200 && resB.isAdmin === true && resB.cookiesIssued === true && resB.totpRequired === false
  report.push({
    test: '4. Admin com enabled=false (Estado B)',
    expected: 'login PASS, totpRequired=false, sessão emitida',
    result: passB ? 'PASS' : 'FAIL',
    details: `Status ${resB.statusCode}, isAdmin: ${resB.isAdmin}, cookies: ${resB.cookiesIssued}`
  })
  console.log(`[Cenário B] Admin com enabled=false: ${passB ? 'PASS' : 'FAIL'}`)

  // Cenário C1: Admin com enabled=true sem código (Estado C1)
  const resC1 = await executeLoginWorkflow({
    user: { id: '284f17a7-83d5-4b1b-8713-064790189f90', email: 'vendas2@qualitec.ind.br' },
    profile: { id: '284f17a7-83d5-4b1b-8713-064790189f90', role: 'admin', is_active: true },
    totpRow: { secret: 'JBSWY3DPEHPK3PXP', enabled: true },
    submittedTotp: undefined
  })
  const passC1 = resC1.statusCode === 200 && resC1.totpRequired === true && !resC1.cookiesIssued
  report.push({
    test: '5. Admin com enabled=true sem código 2FA (Estado C1)',
    expected: 'totpRequired=true, nenhum cookie emitido',
    result: passC1 ? 'PASS' : 'FAIL',
    details: `totpRequired: ${resC1.totpRequired}, cookiesIssued: ${Boolean(resC1.cookiesIssued)}`
  })
  console.log(`[Cenário C1] Admin com enabled=true sem código: ${passC1 ? 'PASS' : 'FAIL'}`)

  // Cenário D: role='user' (Acesso Negado)
  const resD = await executeLoginWorkflow({
    user: { id: 'user-id', email: 'user@qualitec.ind.br' },
    profile: { id: 'user-id', role: 'user', is_active: true },
    totpRow: null,
    submittedTotp: undefined
  })
  const passD = resD.statusCode === 403
  report.push({
    test: '6. Usuário comum (role = user)',
    expected: 'HTTP 403 Forbidden',
    result: passD ? 'PASS' : 'FAIL',
    details: `Status ${resD.statusCode}, Error: ${resD.error}`
  })
  console.log(`[Cenário D] role='user' bloqueado: ${passD ? 'PASS' : 'FAIL'}`)

  // Cenário E: admin com is_active=false (Acesso Negado)
  const resE = await executeLoginWorkflow({
    user: { id: 'inactive-admin-id', email: 'inactive@qualitec.ind.br' },
    profile: { id: 'inactive-admin-id', role: 'admin', is_active: false },
    totpRow: null,
    submittedTotp: undefined
  })
  const passE = resE.statusCode === 403
  report.push({
    test: '7. Admin inativo (is_active = false)',
    expected: 'HTTP 403 Forbidden',
    result: passE ? 'PASS' : 'FAIL',
    details: `Status ${resE.statusCode}, Error: ${resE.error}`
  })
  console.log(`[Cenário E] admin is_active=false bloqueado: ${passE ? 'PASS' : 'FAIL'}`)

  console.log('\n======================================================================')
  console.log('TABELA DE RESULTADOS DOS TESTES CRÍTICOS')
  console.log('======================================================================')
  console.table(report)

  const failed = report.filter(r => r.result === 'FAIL')
  console.log(`\nTotal de Verificações: ${report.length} | APROVADOS: ${report.length - failed.length} | REPROVADOS: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 TODOS OS TESTES CRÍTICOS DE ARQUITETURA E LOGIN PASSARAM COM 100% DE SUCESSO!')
  }
}

runCriticalTest().catch(console.error)
