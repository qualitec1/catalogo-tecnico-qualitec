import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })

export async function runVerification() {
  const report = {}

  // 1. Check profiles table and columns
  const { data: profileCheck, error: profileErr } = await admin.from('profiles').select('id, role, is_active, full_name').limit(5)
  report.profilesTable = !profileErr
  report.roleColumn = !profileErr

  // 2. Check user bootstrap
  const adminUser = profileCheck?.find(p => p.role === 'admin' && p.is_active === true)
  report.adminBootstrapped = !!adminUser
  report.adminCount = profileCheck?.filter(p => p.role === 'admin' && p.is_active === true).length || 0

  // 3. Check anon access to profiles (Should be empty or error)
  const { data: anonProfiles, error: anonProfErr } = await anon.from('profiles').select('id')
  report.anonProfilesBlocked = (anonProfErr !== null) || (anonProfiles && anonProfiles.length === 0)

  // 4. Check PII tables (contact_submissions and newsletter_subscribers)
  const { error: anonContactsErr } = await anon.from('contact_submissions').select('id').limit(1)
  const { error: anonNewsErr } = await anon.from('newsletter_subscribers').select('id').limit(1)
  report.contactSubmissionsBlocked = !!anonContactsErr
  report.newsletterSubscribersBlocked = !!anonNewsErr

  // 5. Check catalog public read
  const { data: prodData, error: prodErr } = await anon.from('products').select('id').limit(1)
  const { data: pdfData, error: pdfErr } = await anon.from('pdf_settings').select('id').limit(1)
  report.catalogReadable = !prodErr && !pdfErr

  return report
}

runVerification().then(console.log).catch(console.error)
