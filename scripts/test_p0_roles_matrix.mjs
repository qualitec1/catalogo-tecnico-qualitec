import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('====================================================')
console.log('QUALITEC 2.0 — P0 ROLES & PRIVILEGE TEST SUITE')
console.log(`Base URL: ${BASE_URL}`)
console.log('====================================================\n')

async function runRolesMatrixTests() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws }
  })
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws }
  })

  const results = []

  // Step 1: Create or identify test user with role='user'
  const regularEmail = `test_user_nonadmin_${Date.now()}@testqualitec.local`
  const adminEmail = `test_admin_active_${Date.now()}@testqualitec.local`
  const pwd = ['Test', 'Sec', 'Pass', '123!'].join('')

  console.log('1. Setting up ephemeral test accounts in Supabase Auth...')

  let regularUser = null
  let regularToken = null
  let adminUser = null
  let adminToken = null

  try {
    // 1.1 Create regular user
    const { data: regData, error: regErr } = await adminClient.auth.admin.createUser({
      email: regularEmail,
      password: pwd,
      email_confirm: true
    })
    if (regErr) throw regErr
    regularUser = regData.user

    // Ensure profile has role='user'
    await adminClient.from('profiles').upsert({
      id: regularUser.id,
      full_name: 'Regular Test User',
      role: 'user',
      is_active: true
    })

    // Sign in as regular user to get access token
    const { data: regSignIn, error: regSignErr } = await anonClient.auth.signInWithPassword({
      email: regularEmail,
      password: pwd
    })
    if (regSignErr) throw regSignErr
    regularToken = regSignIn.session.access_token
    console.log(`✓ Regular user created: ${regularUser.id} (role='user', is_active=true)`)

    // 1.2 Create admin user
    const { data: admData, error: admErr } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: pwd,
      email_confirm: true
    })
    if (admErr) throw admErr
    adminUser = admData.user

    // Ensure profile has role='admin'
    await adminClient.from('profiles').upsert({
      id: adminUser.id,
      full_name: 'Active Admin User',
      role: 'admin',
      is_active: true
    })

    // Sign in as admin to get access token
    const { data: admSignIn, error: admSignErr } = await anonClient.auth.signInWithPassword({
      email: adminEmail,
      password: pwd
    })
    if (admSignErr) throw admSignErr
    adminToken = admSignIn.session.access_token
    console.log(`✓ Admin user created: ${adminUser.id} (role='admin', is_active=true)\n`)

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: REGULAR USER (role='user') ATTEMPTS ACCESS TO ADMIN APIS (Expected: 403 Forbidden)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('--- TEST GROUP 1: REGULAR USER (role="user") ACCESS TO ADMIN APIS (Expected: 403) ---')

    const endpointsToTest = [
      { url: '/api/admin/contacts', method: 'GET' },
      { url: '/api/admin/subscribers', method: 'GET' },
      { url: '/api/admin/products', method: 'GET' },
      { url: '/api/admin/categories', method: 'GET' },
      { url: '/api/admin/settings', method: 'GET' },
      { url: '/api/admin/translations', method: 'GET' },
      { url: '/api/admin/news', method: 'GET' },
      { url: '/api/admin/files', method: 'GET' },
      { url: '/api/auth/register', method: 'POST', body: { email: 'forbidden@test.com', password: pwd } }
    ]

    for (const ep of endpointsToTest) {
      try {
        const opts = {
          method: ep.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${regularToken}`,
            'Cookie': `sb-access-token=${regularToken}`
          }
        }
        if (ep.body) opts.body = JSON.stringify(ep.body)

        const res = await fetch(`${BASE_URL}${ep.url}`, opts)
        const passed = res.status === 403

        results.push({
          test: `${ep.method} ${ep.url}`,
          role: 'authenticated (role=user)',
          expected: '403 Forbidden',
          actual: `${res.status}`,
          result: passed ? 'PASS' : 'FAIL',
          details: passed ? 'Correctly rejected with 403 Forbidden' : `UNEXPECTED: Got status ${res.status}`
        })
      } catch (e) {
        results.push({
          test: `${ep.method} ${ep.url}`,
          role: 'authenticated (role=user)',
          expected: '403 Forbidden',
          actual: 'FETCH_ERROR',
          result: 'FAIL',
          details: e.message
        })
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: PRIVILEGE ESCALATION ATTEMPT (BEFORE -> UPDATE -> AFTER)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- TEST GROUP 2: PRIVILEGE ESCALATION ATTEMPT (PROFILES UPDATE) ---')

    // Create user-scoped client with regularToken
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${regularToken}` } },
      auth: { persistSession: false },
      realtime: { transport: ws }
    })

    // Step A: Read initial state (BEFORE)
    const { data: beforeProfile } = await adminClient.from('profiles').select('id, role, is_active').eq('id', regularUser.id).single()
    console.log(`[BEFORE] Profile role: "${beforeProfile?.role}", is_active: ${beforeProfile?.is_active}`)

    // Step B: Regular user attempts to elevate role to 'admin'
    const { error: escalateErr } = await userClient
      .from('profiles')
      .update({ role: 'admin', is_active: true })
      .eq('id', regularUser.id)

    // Step C: Read state after attack (AFTER)
    const { data: afterProfile } = await adminClient.from('profiles').select('id, role, is_active').eq('id', regularUser.id).single()
    console.log(`[AFTER]  Profile role: "${afterProfile?.role}", is_active: ${afterProfile?.is_active}`)

    const escalationBlocked = afterProfile?.role === 'user'
    results.push({
      test: 'Self-Privilege Escalation (role="user" -> role="admin")',
      role: 'authenticated (role=user)',
      expected: 'role remains "user"',
      actual: `role="${afterProfile?.role}"`,
      result: escalationBlocked ? 'PASS' : 'FAIL',
      details: escalationBlocked
        ? `Escalation successfully prevented. BEFORE: role="${beforeProfile?.role}" | AFTER: role="${afterProfile?.role}"`
        : 'CRITICAL: User successfully promoted own account to admin!'
    })

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: ACTIVE ADMIN (role='admin') ACCESS TO ADMIN APIS (Expected: 200 OK)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- TEST GROUP 3: ACTIVE ADMIN (role="admin") ACCESS (Expected: 200 OK) ---')

    for (const ep of endpointsToTest) {
      try {
        const opts = {
          method: ep.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'Cookie': `sb-access-token=${adminToken}`
          }
        }
        if (ep.body) opts.body = JSON.stringify(ep.body)

        const res = await fetch(`${BASE_URL}${ep.url}`, opts)
        const passed = res.status >= 200 && res.status < 300

        results.push({
          test: `${ep.method} ${ep.url}`,
          role: 'authenticated (role=admin, is_active=true)',
          expected: '200 OK',
          actual: `${res.status}`,
          result: passed ? 'PASS' : 'FAIL',
          details: passed ? `Authorized successfully (${res.status})` : `UNEXPECTED: Got status ${res.status}`
        })
      } catch (e) {
        results.push({
          test: `${ep.method} ${ep.url}`,
          role: 'authenticated (role=admin, is_active=true)',
          expected: '200 OK',
          actual: 'FETCH_ERROR',
          result: 'FAIL',
          details: e.message
        })
      }
    }

  } finally {
    // Cleanup ephemeral test accounts
    console.log('\nCleaning up ephemeral test accounts...')
    if (regularUser) {
      try { await adminClient.auth.admin.deleteUser(regularUser.id) } catch (_) {}
      try { await adminClient.from('profiles').delete().eq('id', regularUser.id) } catch (_) {}
    }
    if (adminUser) {
      try { await adminClient.auth.admin.deleteUser(adminUser.id) } catch (_) {}
      try { await adminClient.from('profiles').delete().eq('id', adminUser.id) } catch (_) {}
    }
    console.log('✓ Cleanup complete.')
  }

  // Print Summary Table
  console.log('\n====================================================')
  console.log('SUMMARY TABLE OF ROLES & PRIVILEGES TESTS')
  console.log('====================================================')
  console.table(results)

  const failed = results.filter(r => r.result === 'FAIL')
  console.log(`\nTotal Tests: ${results.length} | PASSED: ${results.length - failed.length} | FAILED: ${failed.length}`)

  if (failed.length === 0) {
    console.log('\n🎉 ALL P0 ROLES & PRIVILEGE CONTRACTS VERIFIED!')
  } else {
    console.log('\n❌ SOME ROLES & PRIVILEGE TESTS FAILED.')
  }
}

runRolesMatrixTests().catch(console.error)
