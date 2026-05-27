import { create } from 'zustand'
import { supabase, uploadListingImage, uploadListingDocument } from '../lib/supabase'

export const useListingsStore = create((set, get) => ({
  listings:        [],
  myListings:      [],
  pendingListings: [],
  currentListing:  null,
  loading:         false,
  error:           null,
  filters: {
    district:  '',
    land_type: '',
    min_price: '',
    max_price: '',
    min_area:  '',
    max_area:  '',
  },

  // ── Public: approved listings ──────────────────────────────────────────────
  fetchApproved: async (filters = {}) => {
    set({ loading: true, error: null })
    let q = supabase
      .from('listings')
      .select('*, profiles:profiles!listings_seller_id_fkey(full_name, phone, whatsapp)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (filters.district)  q = q.eq('district', filters.district)
    if (filters.land_type) q = q.eq('land_type', filters.land_type)
    if (filters.min_price) q = q.gte('price', Number(filters.min_price))
    if (filters.max_price) q = q.lte('price', Number(filters.max_price))

    const { data, error } = await q
    if (error) { set({ error: error.message, loading: false }); return }
    set({ listings: data || [], loading: false })
  },

  fetchById: async (id) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles:profiles!listings_seller_id_fkey(full_name, phone, whatsapp, avatar_url)')
      .eq('id', id)
      .single()
    if (error) { set({ error: error.message, loading: false }); return }
    set({ currentListing: data, loading: false })
    return data
  },

  // ── Seller: own listings ───────────────────────────────────────────────────
  fetchMyListings: async (sellerId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    if (error) { set({ error: error.message, loading: false }); return }
    set({ myListings: data || [], loading: false })
  },

  createListing: async (formData, imageFiles, documentFiles, sellerId) => {
    set({ loading: true })
    
    // Fetch seller profile to set default display contact details
    let profile = null
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', sellerId)
        .single()
      profile = data
    } catch (err) {
      console.warn('Failed to fetch seller profile for listing creation:', err.message)
    }

    const listingData = {
      ...formData,
      price: Number(formData.price),
      price_per_unit: formData.price_per_unit ? Number(formData.price_per_unit) : null,
      area_value: Number(formData.area_value),
      seller_id: sellerId,
      status: 'pending',
      original_title: formData.title,
      original_description: formData.description,
      original_price: Number(formData.price),
      original_price_per_unit: formData.price_per_unit ? Number(formData.price_per_unit) : null,
      contact_name: profile?.full_name || '',
      contact_phone: profile?.phone || '',
    }

    // Insert listing first to get ID
    const { data: listing, error } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single()
    if (error) { set({ loading: false }); throw error }

    // Upload images
    const imageUrls = []
    for (const file of imageFiles) {
      const url = await uploadListingImage(file, listing.id)
      imageUrls.push(url)
    }

    // Upload documents
    const docUrls = []
    for (const file of documentFiles) {
      const url = await uploadListingDocument(file, listing.id)
      docUrls.push(url)
    }

    // Update with image and document URLs
    const updates = {}
    if (imageUrls.length > 0) updates.images = imageUrls
    if (docUrls.length > 0) updates.documents = docUrls

    if (Object.keys(updates).length > 0) {
      await supabase.from('listings').update(updates).eq('id', listing.id)
      if (imageUrls.length > 0) listing.images = imageUrls
      if (docUrls.length > 0) listing.documents = docUrls
    }

    set((s) => ({ myListings: [listing, ...s.myListings], loading: false }))
    return listing
  },

  updateListing: async (id, updates) => {
    const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select().single()
    if (error) throw error
    set((s) => ({
      myListings: s.myListings.map(l => l.id === id ? data : l),
      listings:   s.listings.map(l => l.id === id ? data : l),
    }))
    return data
  },

  deleteListing: async (id) => {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) throw error
    set((s) => ({
      myListings: s.myListings.filter(l => l.id !== id),
      listings:   s.listings.filter(l => l.id !== id),
    }))
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  fetchPending: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles:profiles!listings_seller_id_fkey(full_name, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) { set({ error: error.message, loading: false }); return }
    set({ pendingListings: data || [], loading: false })
  },

  fetchAll: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles:profiles!listings_seller_id_fkey(full_name, phone)')
      .order('created_at', { ascending: false })
    if (error) { set({ error: error.message, loading: false }); return }
    set({ listings: data || [], loading: false })
  },

  approveListing: async (id, adminId) => {
    return await get().updateListing(id, {
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
  },

  rejectListing: async (id, adminId, reason) => {
    return await get().updateListing(id, {
      status: 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
}))
