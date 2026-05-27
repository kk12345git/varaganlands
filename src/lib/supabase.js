import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase env vars. Copy .env.example to .env and fill in values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ─── Storage helpers ──────────────────────────────────────────────────────────

export async function uploadListingImage(file, listingId) {
  const ext = file.name.split('.').pop()
  const path = `listings/${listingId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from('listing-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
  return publicUrl
}

export async function uploadListingDocument(file, listingId) {
  const ext = file.name.split('.').pop()
  const path = `listings/${listingId}/docs_${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from('listing-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
  return publicUrl
}

export async function deleteListingImage(path) {
  const { error } = await supabase.storage.from('listing-images').remove([path])
  if (error) throw error
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}
