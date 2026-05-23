import { create } from 'zustand'
import { supabase, getUserProfile } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await getUserProfile(session.user.id).catch(() => null)
      set({ user: session.user, profile, loading: false })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id).catch(() => null)
        set({ user: session.user, profile })
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  signUp: async ({ email, password, fullName, phone, role = 'seller' }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone, role } }
    })
    if (error) throw error
    return data
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
    if (error) throw error
    set({ profile: data })
    return data
  },

  isAdmin:  () => get().profile?.role === 'admin',
  isSeller: () => get().profile?.role === 'seller',
}))
