import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Save, User } from 'lucide-react'

export default function SellerProfile() {
  const { profile, updateProfile } = useAuthStore()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone:     profile?.phone     || '',
    whatsapp:  profile?.whatsapp  || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center">
            <span className="font-display font-bold text-forest-600 text-2xl">
              {profile?.full_name?.[0]?.toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h2 className="font-display font-semibold text-gray-900">{profile?.full_name}</h2>
            <span className="badge border-forest-200 bg-forest-50 text-forest-700 mt-1">Seller</span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.full_name}
              onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input type="tel" className="input" value={form.phone}
              onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
            <p className="text-xs text-gray-400 mt-1">Buyers will call this number</p>
          </div>
          <div>
            <label className="label">WhatsApp Number</label>
            <input type="tel" className="input" placeholder="If different from phone"
              value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}/>
            <p className="text-xs text-gray-400 mt-1">Include country code e.g. 919876543210</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={16}/>{saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
