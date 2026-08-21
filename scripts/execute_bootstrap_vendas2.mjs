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

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } })

async function executeVendas2Bootstrap() {
  console.log('--- EXECUTANDO BOOTSTRAP DO VENDAS2 PARA MASTER_ADMIN ---')

  // 1. Localizar vendas2 no Auth
  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr || !usersList) {
    console.error('Falha ao listar auth users:', listErr?.message)
    process.exit(1)
  }

  const vendas2User = usersList.users.find(u => u.email?.toLowerCase() === 'vendas2@qualitec.ind.br')
  if (!vendas2User) {
    console.error('Usuário vendas2@qualitec.ind.br não encontrado no Supabase Auth.')
    process.exit(1)
  }

  console.log('Usuário Auth localizado:', {
    id: vendas2User.id,
    email: vendas2User.email,
    email_confirmed_at: vendas2User.email_confirmed_at
  })

  // 2. Atualizar/Inserir no profiles com role = 'master_admin' e is_active = true
  const { data: updatedProfile, error: profileErr } = await admin
    .from('profiles')
    .upsert({
      id: vendas2User.id,
      full_name: vendas2User.user_metadata?.full_name || 'Vendas 2 - Qualitec',
      role: 'master_admin',
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
    .select()
    .single()

  if (profileErr) {
    console.error('Falha ao atualizar profiles:', profileErr.message)
    process.exit(1)
  }

  console.log('Perfil atualizado com sucesso:', updatedProfile)
  console.log('✅ BOOTSTRAP DO VENDAS2 CONCLUÍDO COM SUCESSO: role = master_admin, is_active = true')
}

executeVendas2Bootstrap().catch(console.error)
