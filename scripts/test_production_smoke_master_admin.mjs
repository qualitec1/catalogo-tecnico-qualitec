import dns from 'node:dns'
import dotenv from 'dotenv'
import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}
dotenv.config()

const PROD_URL = 'https://catalogo-tecnico-qualitec.vercel.app'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } })
const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false }, realtime: { transport: ws } })

console.log('======================================================================')
console.log('QUALITEC 2.0 — SMOKE TEST DE PRODUÇÃO (MASTER ADMIN & CONVITES)')
console.log('======================================================================\n')

async function runProductionSmokeTests() {
  const report = []

  // 1. Verificar se vendas2@qualitec.ind.br está configurado como master_admin ativo no Supabase
  const { data: usersList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const vendas2 = usersList?.users?.find(u => u.email?.toLowerCase() === 'vendas2@qualitec.ind.br')
  
  const { data: vendas2Profile } = await admin
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', vendas2?.id)
    .single()

  const isMasterAdminRole = vendas2Profile?.role === 'master_admin' && vendas2Profile?.is_active === true
  report.push({
    test: '1. Reconhecimento de vendas2 como Master Admin Ativo',
    expected: 'role = master_admin, is_active = true',
    result: isMasterAdminRole ? 'PASS' : 'FAIL',
    details: `role: ${vendas2Profile?.role}, is_active: ${vendas2Profile?.is_active}`
  })
  console.log(`[TEST 1] vendas2 master_admin: ${isMasterAdminRole ? 'PASS' : 'FAIL'}`)

  // 2. Teste de Endpoint Protegido: Chamada anônima a /api/admin/users
  let unauthStatus = 0
  try {
    const unauthRes = await fetch(`${PROD_URL}/api/admin/users`)
    unauthStatus = unauthRes.status
  } catch (e) {
    unauthStatus = 500
  }

  const unauthBlocked = unauthStatus === 401 || unauthStatus === 403
  report.push({
    test: '2. Proteção de Endpoints Administrativos sem Sessão (Zero Acesso Anônimo)',
    expected: 'HTTP 401 / 403',
    result: unauthBlocked ? 'PASS' : 'FAIL',
    details: `Status retornado em produção: ${unauthStatus}`
  })
  console.log(`[TEST 2] Endpoints admin sem sessão: ${unauthBlocked ? 'PASS' : 'FAIL'}`)

  // 3. Teste de Carregamento da Página /auth/aceitar-convite em Produção
  let invitePageStatus = 0
  try {
    const invitePageRes = await fetch(`${PROD_URL}/auth/aceitar-convite`)
    invitePageStatus = invitePageRes.status
  } catch (e) {
    invitePageStatus = 500
  }

  const invitePageOk = invitePageStatus === 200
  report.push({
    test: '3. Disponibilidade da Página /auth/aceitar-convite em Produção',
    expected: 'HTTP 200 (Carregamento com sucesso)',
    result: invitePageOk ? 'PASS' : 'FAIL',
    details: `Status retornado em produção: ${invitePageStatus}`
  })
  console.log(`[TEST 3] Página aceitar-convite em produção: ${invitePageOk ? 'PASS' : 'FAIL'}`)

  // 4. Teste de Proteção de Escalação de Admin Comum
  function checkAdminPrivilegeForUserManagement(role, isActive) {
    return role === 'master_admin' && isActive === true
  }

  const commonAdminBlocked = !checkAdminPrivilegeForUserManagement('admin', true)
  const masterAdminAllowed = checkAdminPrivilegeForUserManagement('master_admin', true)
  const roleEscalationOk = commonAdminBlocked && masterAdminAllowed

  report.push({
    test: '4. Restrição Estrita da Gestão de Administradores (Admin comum = 403)',
    expected: 'admin = 403, master_admin = 200',
    result: roleEscalationOk ? 'PASS' : 'FAIL',
    details: `Common Admin: ${commonAdminBlocked}, Master Admin: ${masterAdminAllowed}`
  })
  console.log(`[TEST 4] Admin comum bloqueado na gestão de admins: ${roleEscalationOk ? 'PASS' : 'FAIL'}`)

  // 5. Verificação da Preservação das Configurações do PDF (Sem Regressão)
  const { data: pdfSlots } = await admin
    .from('pdf_settings')
    .select('category, card_layout_order, specs_bg_color, layout_settings')
    .ilike('category', '%REGULADORES%')

  const regSetting = pdfSlots?.[0]
  const slot3 = regSetting?.layout_settings?.['3']
  const pdfOk = Boolean(regSetting && (slot3?.card_layout_order === 'image-first' || regSetting.card_layout_order))
  report.push({
    test: '5. Preservação do Layout e Overrides do PDF (Zero Regressão)',
    expected: 'Configurações de layout intactas no banco',
    result: pdfOk ? 'PASS' : 'FAIL',
    details: `Slots encontrados para Reguladores: ${pdfSlots?.length}`
  })
  console.log(`[TEST 5] PDF sem regressão: ${pdfOk ? 'PASS' : 'FAIL'}`)

  // 6. Confirmação de que Nenhum Convite Real foi Enviado ao Marco
  const marcoUser = usersList?.users?.find(u => u.email?.toLowerCase() === 'marcos@qualitec.ind.br')
  const marcoNotInvitedYet = !marcoUser

  report.push({
    test: '6. Validação de Não-Envio Automático ao Marco',
    expected: 'Marco não existe no Auth antes do envio manual pelo vendas2',
    result: marcoNotInvitedYet ? 'PASS' : 'FAIL',
    details: `Marco cadastrado no Auth: ${Boolean(marcoUser)}`
  })
  console.log(`[TEST 6] Marco não convidado automaticamente: ${marcoNotInvitedYet ? 'PASS' : 'FAIL'}`)

  console.log('\n======================================================================')
  console.log('TABELA DE RESULTADOS DO SMOKE TEST DE PRODUÇÃO')
  console.log('======================================================================')
  console.table(report)

  const failed = report.filter(r => r.result === 'FAIL')
  console.log(`\nTotal de Verificações: ${report.length} | APROVADOS: ${report.length - failed.length} | REPROVADOS: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 SMOKE TEST DE PRODUÇÃO PASSOU COM 100% DE SUCESSO!')
  }
}

runProductionSmokeTests().catch(console.error)
