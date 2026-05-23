import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useListingsStore } from '../../store/listingsStore'
import { TN_DISTRICTS, LAND_TYPES, AREA_UNITS, WATER_SOURCES } from '../../lib/constants'
import MapPicker from '../../components/ui/MapPicker'
import ImageUpload from '../../components/ui/ImageUpload'
import toast from 'react-hot-toast'
import { Save, ChevronLeft, CheckCircle } from 'lucide-react'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchById, updateListing, loading } = useListingsStore()
  const [form, setForm] = useState(null)
  const [newImages, setNewImages] = useState([])

  useEffect(() => {
    fetchById(id).then(l => {
      if (l && l.seller_id === user?.id) setForm(l)
      else { toast.error('Access denied'); navigate('/seller/listings') }
    })
  }, [id, user])

  if (!form) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }))

  const handleSave = async () => {
    try {
      const updates = { ...form, status: 'pending' } // re-submit for review on edit
      await updateListing(id, updates)
      toast.success('Listing updated and resubmitted for review!')
      navigate('/seller/listings')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const CheckBox = ({ label, field }) => (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div onClick={() => toggle(field)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition
                    ${form[field] ? 'bg-forest-600 border-forest-600' : 'border-gray-300'}`}>
        {form[field] && <CheckCircle size={13} className="text-white"/>}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft size={20}/>
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-xs text-amber-600 mt-0.5">Editing will resubmit for admin review</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-700">Basic Info</h2>
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={e=>set('title',e.target.value)}/>
        </div>
        <div>
          <label className="label">Land Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {LAND_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => set('land_type', t.value)}
                className={`p-2.5 rounded-xl border-2 text-sm transition text-center
                            ${form.land_type === t.value ? 'border-forest-500 bg-forest-50' : 'border-gray-100'}`}>
                <span className="text-lg block">{t.icon}</span>
                <span className="text-xs font-medium">{t.label.split('/')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={4} value={form.description||''}
            onChange={e=>set('description',e.target.value)}/>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">District *</label>
            <select className="input" value={form.district} onChange={e=>set('district',e.target.value)}>
              {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Taluk</label>
            <input className="input" value={form.taluk||''} onChange={e=>set('taluk',e.target.value)}/>
          </div>
          <div>
            <label className="label">Village</label>
            <input className="input" value={form.village||''} onChange={e=>set('village',e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Survey Number</label>
            <input className="input font-mono" value={form.survey_number||''} onChange={e=>set('survey_number',e.target.value)}/>
          </div>
        </div>
        <MapPicker lat={form.latitude} lng={form.longitude}
          onChange={(lat,lng) => setForm(f=>({...f,latitude:lat,longitude:lng}))}/>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Area & Price</h2>
        <div>
          <label className="label">Area *</label>
          <div className="flex gap-2">
            <input type="number" className="input flex-1" value={form.area_value} onChange={e=>set('area_value',e.target.value)}/>
            <select className="input w-32" value={form.area_unit} onChange={e=>set('area_unit',e.target.value)}>
              {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Total Price (₹) *</label>
            <input type="number" className="input" value={form.price} onChange={e=>set('price',e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Per {form.area_unit} (₹)</label>
            <input type="number" className="input" value={form.price_per_unit||''} onChange={e=>set('price_per_unit',e.target.value)}/>
          </div>
        </div>
        <CheckBox label="Price is negotiable" field="price_negotiable"/>
        <div className="grid grid-cols-2 gap-3">
          <CheckBox label="🛣️ Road Access" field="road_access"/>
          <CheckBox label="⚡ Electricity" field="electricity"/>
          <CheckBox label="📄 Patta Available" field="patta_available"/>
        </div>
        <div>
          <label className="label">Water Source</label>
          <select className="input" value={form.water_source||''} onChange={e=>set('water_source',e.target.value)}>
            <option value="">None</option>
            {WATER_SOURCES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Photos</h2>
        <ImageUpload onFilesChange={setNewImages} maxFiles={8} existingImages={form.images||[]}/>
      </div>

      <button onClick={handleSave} disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
        {loading
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>
          : <><Save size={18}/>Save & Resubmit</>
        }
      </button>
    </div>
  )
}
