import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Maximize2, Phone, MessageCircle, ChevronLeft, CheckCircle, Zap, Droplets, FileText, Calendar } from 'lucide-react'
import { useListingsStore } from '../../store/listingsStore'
import { supabase } from '../../lib/supabase'
import { notifyAdminNewInquiry, ADMIN_WHATSAPP, emailAdminNewInquiry } from '../../lib/notifications'
import { useTranslation } from '../../hooks/useTranslation'
import { formatPrice, formatArea, LAND_TYPES, STATUS_LABELS } from '../../lib/constants'
import MapPicker from '../../components/ui/MapPicker'
import Land3DViewer from '../../components/buyer/Land3DViewer'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function ListingDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { fetchById, currentListing: listing, loading } = useListingsStore()
  const [activeImg, setActiveImg] = useState(0)
  const [inquiry, setInquiry] = useState({ buyer_name:'', buyer_phone:'', buyer_email:'', message:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchById(id) }, [id])

  const handleInquiry = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('inquiries').insert({ listing_id: id, ...inquiry })
      if (error) throw error
      toast.success(t('inquiry_success') || 'Inquiry sent! We will contact you soon.')
      notifyAdminNewInquiry(listing, inquiry)
      await emailAdminNewInquiry(listing, inquiry)
      setInquiry({ buyer_name:'', buyer_phone:'', buyer_email:'', message:'' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const callSeller = () => {
    const phone = listing.contact_phone || ADMIN_WHATSAPP || '918939789343'
    window.open(`tel:${phone}`)
  }
  const whatsappSeller = () => {
    const phone = listing.contact_phone || ADMIN_WHATSAPP || '918939789343'
    const msg = encodeURIComponent(`Hi, I'm interested in your land listing: "${listing.title}" (ID: ${listing.id}) on Varagan.`)
    window.open(`https://wa.me/${phone?.replace(/\D/g,'')}?text=${msg}`, '_blank')
  }

  if (loading) return (
    <div className="page-container py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-80 bg-gray-100 rounded-2xl"/>
        <div className="h-8 bg-gray-100 rounded-lg w-3/4"/>
        <div className="h-4 bg-gray-100 rounded w-1/2"/>
      </div>
    </div>
  )

  if (!listing) return (
    <div className="page-container py-20 text-center">
      <div className="text-5xl mb-4">🏡</div>
      <h2 className="font-display text-2xl text-gray-700">Listing not found</h2>
      <Link to="/listings" className="btn-primary inline-flex mt-6">Browse Listings</Link>
    </div>
  )

  const landType = LAND_TYPES.find(t => t.value === listing.land_type)

  return (
    <div className="page-container py-6 md:py-10">
      {/* Back */}
      <Link to="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-600 mb-6 transition font-body">
        <ChevronLeft size={16}/>{t('back_to_listings')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="card overflow-hidden">
            <div className="relative h-64 md:h-96 bg-gray-100">
              {listing.images?.length > 0 ? (
                <img src={listing.images[activeImg]} alt="" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-forest-50">
                  {landType?.icon || '🏡'}
                </div>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <img key={i} src={img} alt=""
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-20 flex-shrink-0 object-cover rounded-lg cursor-pointer border-2 transition
                                ${i === activeImg ? 'border-forest-500' : 'border-transparent hover:border-gray-300'}`}/>
                ))}
              </div>
            )}
          </div>

          {/* Title & location */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {listing.title}
              </h1>
              <span className="badge border-forest-200 bg-forest-50 text-forest-700 whitespace-nowrap">
                {landType?.icon} {landType ? t(landType.value) : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 mb-4">
              <MapPin size={15} className="text-forest-500"/>
              <span>{[listing.village, listing.taluk, listing.district].filter(Boolean).join(', ')}</span>
            </div>

            {listing.survey_number && (
              <p className="text-sm text-gray-500 mb-4">{t('survey_no')}: <span className="font-mono font-medium text-gray-700">{listing.survey_number}</span></p>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-smoke rounded-xl p-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t('total_area')}</p>
                <p className="font-display font-semibold text-gray-800">{formatArea(listing.area_value, listing.area_unit)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t('total_price')}</p>
                <p className="font-display font-semibold text-forest-700">{formatPrice(listing.price)}</p>
              </div>
              {listing.price_per_unit && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{t('per_unit')} ({listing.area_unit})</p>
                  <p className="font-display font-semibold text-gray-800">{formatPrice(listing.price_per_unit)}</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.road_access && <span className="badge border-forest-200 bg-forest-50 text-forest-700">🛣️ {t('road_access')}</span>}
              {listing.electricity  && <span className="badge border-amber-200 bg-amber-50 text-amber-700"><Zap size={11}/>{t('electricity')}</span>}
              {listing.patta_available && <span className="badge border-blue-200 bg-blue-50 text-blue-700"><FileText size={11}/>{t('patta')}</span>}
              {listing.water_source && <span className="badge border-cyan-200 bg-cyan-50 text-cyan-700"><Droplets size={11}/>{listing.water_source}</span>}
              {listing.price_negotiable && <span className="badge border-earth-200 bg-earth-50 text-earth-700">💬 {t('price_negotiable_desc')}</span>}
            </div>

            {listing.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">{t('description')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-body">{listing.description}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1 font-body">
              <Calendar size={11}/>
              {t('listed_on')} {format(new Date(listing.created_at), 'dd MMM yyyy')}
            </p>
          </div>

          {/* 3D Land Plot Visualizer */}
          <Land3DViewer listing={listing} />

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-forest-600"/>{t('location_on_map')}
              </h3>
              <MapPicker lat={listing.latitude} lng={listing.longitude} readOnly/>
            </div>
          )}
        </div>

        {/* Right: seller + inquiry */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="card p-5 border-2 border-forest-100">
            <p className="font-display text-3xl font-bold text-forest-700 mb-1">{formatPrice(listing.price)}</p>
            {listing.price_negotiable && <p className="text-sm text-earth-600 font-body">{t('price_negotiable_desc')}</p>}
          </div>

          {/* Contact details card */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-3">{t('contact_details')}</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-forest-100 rounded-full flex items-center justify-center">
                <span className="font-display font-bold text-forest-600">
                  {(listing.contact_name || listing.profiles?.full_name)?.[0]?.toUpperCase() || 'V'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{listing.contact_name || listing.profiles?.full_name || 'Varagan Partner'}</p>
                <p className="text-sm text-gray-500 font-body">{t('verified_partner')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={callSeller}
                className="flex items-center justify-center gap-2 py-2.5 bg-forest-600 text-white rounded-xl text-sm font-medium hover:bg-forest-700 transition">
                <Phone size={15}/>{t('call')}
              </button>
              <button onClick={whatsappSeller}
                className="flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition">
                <MessageCircle size={15}/>{t('whatsapp')}
              </button>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="card p-5 font-body">
            <h3 className="font-semibold text-gray-700 mb-4 font-display">{t('send_inquiry')}</h3>
            <form onSubmit={handleInquiry} className="space-y-3">
              <div>
                <label className="label">{t('your_name')} *</label>
                <input required className="input" placeholder={t('your_name')}
                  value={inquiry.buyer_name} onChange={e=>setInquiry(i=>({...i,buyer_name:e.target.value}))}/>
              </div>
              <div>
                <label className="label">{t('phone_number')} *</label>
                <input required type="tel" className="input" placeholder="+91 98765 43210"
                  value={inquiry.buyer_phone} onChange={e=>setInquiry(i=>({...i,buyer_phone:e.target.value}))}/>
              </div>
              <div>
                <label className="label">{t('email')}</label>
                <input type="email" className="input" placeholder={t('optional_placeholder')}
                  value={inquiry.buyer_email} onChange={e=>setInquiry(i=>({...i,buyer_email:e.target.value}))}/>
              </div>
              <div>
                <label className="label">{t('message')}</label>
                <textarea className="input resize-none" rows={3} placeholder={t('inquiry_msg_placeholder')}
                  value={inquiry.message} onChange={e=>setInquiry(i=>({...i,message:e.target.value}))}/>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full font-display">
                {submitting ? t('sending') : t('send_inquiry')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

