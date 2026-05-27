import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useListingsStore } from '../../store/listingsStore'
import { notifyAdminNewListing, emailAdminNewListing } from '../../lib/notifications'
import { TN_DISTRICTS, LAND_TYPES, AREA_UNITS, WATER_SOURCES } from '../../lib/constants'
import ImageUpload from '../../components/ui/ImageUpload'
import MapPicker from '../../components/ui/MapPicker'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const STEPS = ['Basic Info', 'Location', 'Details & Price', 'Photos']

export default function NewListing() {
  const [step, setStep]         = useState(0)
  const [images, setImages]     = useState([])
  const [documents, setDocuments] = useState([])
  const [form, setForm]         = useState({
    title: '', description: '', land_type: 'agricultural',
    district: '', taluk: '', village: '', address: '', survey_number: '',
    latitude: null, longitude: null,
    area_value: '', area_unit: 'cent',
    price: '', price_per_unit: '', price_negotiable: false,
    road_access: false, water_source: '', electricity: false, patta_available: false,
  })

  const { user, profile } = useAuthStore()
  const { createListing, loading } = useListingsStore()
  const navigate = useNavigate()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }))

  const validate = () => {
    if (step === 0 && (!form.title || !form.land_type)) { toast.error('Fill all required fields'); return false }
    if (step === 1 && !form.district) { toast.error('Select a district'); return false }
    if (step === 2 && (!form.area_value || !form.price)) { toast.error('Enter area and price'); return false }
    return true
  }

  const handleSubmit = async () => {
    try {
      const listing = await createListing(form, images, documents, user.id)
      toast.success('Listing submitted for review! 🎉')
      // Notify admin
      notifyAdminNewListing(listing, profile?.full_name, profile?.phone)
      emailAdminNewListing(listing, profile?.full_name)
      navigate('/seller/listings')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const CheckBox = ({ label, field }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div onClick={() => toggle(field)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0
                    ${form[field] ? 'bg-forest-600 border-forest-600' : 'border-gray-300 group-hover:border-forest-400'}`}>
        {form[field] && <CheckCircle size={13} className="text-white"/>}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Add New Land Listing</h1>
        <p className="text-gray-500 text-sm mt-1">நிலம் பற்றிய விவரங்களை பதிவு செய்யுங்கள்</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-forest-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                              ${i < step ? 'bg-forest-600 text-white' : i === step ? 'bg-forest-600 text-white ring-4 ring-forest-100' : 'bg-gray-100 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-forest-700' : ''}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-forest-400' : 'bg-gray-100'}`}/>}
          </React.Fragment>
        ))}
      </div>

      <div className="card p-6 md:p-8">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div>
              <label className="label">Listing Title *</label>
              <input className="input" placeholder="e.g., 5 Acre Agricultural Land in Thanjavur"
                value={form.title} onChange={e=>set('title',e.target.value)}/>
              <p className="text-xs text-gray-400 mt-1">Make it clear and descriptive</p>
            </div>
            <div>
              <label className="label">Land Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LAND_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => set('land_type', t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition text-sm
                                ${form.land_type === t.value ? 'border-forest-500 bg-forest-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-xl block mb-1">{t.icon}</span>
                    <span className="font-medium text-gray-700">{t.label.split('/')[0].trim()}</span>
                    <span className="text-xs text-gray-400 block">{t.label.split('/')[1]?.trim()}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={4}
                placeholder="Describe the land - soil type, nearby landmarks, road access, water availability..."
                value={form.description} onChange={e=>set('description',e.target.value)}/>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Location Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">District *</label>
                <select className="input" value={form.district} onChange={e=>set('district',e.target.value)}>
                  <option value="">Select District</option>
                  {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Taluk</label>
                <input className="input" placeholder="Taluk name" value={form.taluk} onChange={e=>set('taluk',e.target.value)}/>
              </div>
              <div>
                <label className="label">Village / Town</label>
                <input className="input" placeholder="Village name" value={form.village} onChange={e=>set('village',e.target.value)}/>
              </div>
              <div className="col-span-2">
                <label className="label">Survey Number</label>
                <input className="input font-mono" placeholder="e.g., 123/2A" value={form.survey_number} onChange={e=>set('survey_number',e.target.value)}/>
              </div>
              <div className="col-span-2">
                <label className="label">Full Address</label>
                <textarea className="input resize-none" rows={2} placeholder="Full address for reference"
                  value={form.address} onChange={e=>set('address',e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="label">Pin Location on Map</label>
              <MapPicker
                lat={form.latitude} lng={form.longitude}
                onChange={(lat,lng) => setForm(f=>({...f,latitude:lat,longitude:lng}))}
              />
            </div>
          </div>
        )}

        {/* Step 2: Details & Price */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Land Details & Pricing</h2>

            {/* Area */}
            <div>
              <label className="label">Land Area *</label>
              <div className="flex gap-2">
                <input type="number" className="input flex-1" placeholder="0.00" min="0" step="0.01"
                  value={form.area_value} onChange={e=>set('area_value',e.target.value)}/>
                <select className="input w-32" value={form.area_unit} onChange={e=>set('area_unit',e.target.value)}>
                  {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Total Price (₹) *</label>
                <input type="number" className="input" placeholder="e.g., 2500000" min="0"
                  value={form.price} onChange={e=>set('price',e.target.value)}/>
              </div>
              <div className="col-span-2">
                <label className="label">Price per {form.area_unit} (₹)</label>
                <input type="number" className="input" placeholder="Auto or enter manually" min="0"
                  value={form.price_per_unit}
                  onChange={e=>set('price_per_unit',e.target.value)}/>
              </div>
            </div>

            <CheckBox label="Price is negotiable" field="price_negotiable"/>

            {/* Land features */}
            <div>
              <label className="label mb-3">Land Features</label>
              <div className="grid grid-cols-2 gap-3">
                <CheckBox label="🛣️ Road Access" field="road_access"/>
                <CheckBox label="⚡ Electricity (EB)" field="electricity"/>
                <CheckBox label="📄 Patta Available" field="patta_available"/>
              </div>
            </div>

            <div>
              <label className="label">Water Source</label>
              <select className="input" value={form.water_source} onChange={e=>set('water_source',e.target.value)}>
                <option value="">None / Unknown</option>
                {WATER_SOURCES.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Verification Documents */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Photos */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-base font-semibold text-gray-800">1. Land Photos / நிலப் புகைப்படங்கள் (Buyers will see this)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Good photos = more inquiries. First photo will be the cover image.</p>
              </div>
              <ImageUpload onFilesChange={setImages} maxFiles={8}/>
            </div>

            <hr className="border-gray-100" />

            {/* Documents */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-base font-semibold text-amber-700">2. Patta & Documents / நிலப் பத்திரங்கள் & பட்டா (Admin Only)</h2>
                <p className="text-xs text-amber-600/80 mt-0.5">⚠️ Intha documents/patta buyers-ku show aagadhu, admin verification-kaga mattum thaan.</p>
              </div>
              <ImageUpload onFilesChange={setDocuments} maxFiles={4}/>
            </div>

            <div className="bg-forest-50 rounded-xl p-4 text-sm text-forest-700">
              <p className="font-medium mb-1">📸 Photo & Doc tips:</p>
              <ul className="text-forest-600 space-y-0.5 text-xs">
                <li>• Take photos in daylight for best results.</li>
                <li>• Upload clear images/PDFs of your Patta, Chitta or FMB sketch.</li>
                <li>• Documents uploaded here are kept strictly confidential from buyers.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => setStep(s=>s-1)} disabled={step===0}
            className="flex items-center gap-1.5 btn-secondary py-2.5 px-5 text-sm disabled:opacity-30">
            <ChevronLeft size={16}/>Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => { if(validate()) setStep(s=>s+1) }}
              className="flex items-center gap-1.5 btn-primary">
              Next <ChevronRight size={16}/>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-primary flex items-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting...</>
              ) : (
                <><CheckCircle size={16}/>Submit Listing</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
