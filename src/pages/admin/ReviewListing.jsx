import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, ChevronLeft, MapPin, Maximize2, Phone, MessageCircle, Edit2, Star, StarOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useListingsStore } from '../../store/listingsStore'
import { notifySellerWhatsApp, createNotification } from '../../lib/notifications'
import { formatPrice, formatArea, LAND_TYPES, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'
import MapPicker from '../../components/ui/MapPicker'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminReviewListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchById, currentListing: listing, approveListing, rejectListing, updateListing, loading } = useListingsStore()
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [processing, setProcessing] = useState(false)

  useEffect(() => { fetchById(id) }, [id])

  const handleApprove = async () => {
    setProcessing(true)
    try {
      await approveListing(id, user.id)
      // Notify seller
      if (listing.profiles?.phone) {
        notifySellerWhatsApp(listing.profiles.phone, 'approved', listing.title)
      }
      await createNotification(listing.seller_id, 'listing_approved', '✅ Listing Approved!',
        `Your listing "${listing.title}" is now live on Varagam.`)
      toast.success('Listing approved and seller notified!')
      navigate('/admin/listings')
    } catch (err) {
      toast.error(err.message)
    } finally { setProcessing(false) }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please enter a rejection reason'); return }
    setProcessing(true)
    try {
      await rejectListing(id, user.id, rejectionReason)
      if (listing.profiles?.phone) {
        notifySellerWhatsApp(listing.profiles.phone, 'rejected', listing.title, rejectionReason)
      }
      await createNotification(listing.seller_id, 'listing_rejected', '❌ Listing Rejected',
        `Your listing "${listing.title}" was rejected. Reason: ${rejectionReason}`)
      toast.success('Listing rejected and seller notified via WhatsApp')
      navigate('/admin/listings')
    } catch (err) {
      toast.error(err.message)
    } finally { setProcessing(false) }
  }

  const toggleFeatured = async () => {
    await updateListing(id, { featured: !listing.featured })
    toast.success(listing.featured ? 'Removed from featured' : 'Marked as featured!')
  }

  if (!listing) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const landType = LAND_TYPES.find(t => t.value === listing.land_type)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft size={20}/>
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">Review Listing</h1>
            <span className={`badge ${STATUS_COLORS[listing.status]} mt-1`}>{STATUS_LABELS[listing.status]}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={toggleFeatured}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition
                        ${listing.featured ? 'border-earth-300 bg-earth-50 text-earth-700' : 'border-gray-200 text-gray-600 hover:border-earth-300'}`}>
            {listing.featured ? <Star size={14} fill="currentColor"/> : <StarOff size={14}/>}
            {listing.featured ? 'Featured' : 'Mark Featured'}
          </button>

          {listing.status === 'pending' && (
            <>
              <button onClick={() => { setShowRejectForm(true); setProcessing(false) }}
                className="flex items-center gap-1.5 btn-danger py-2 px-4 text-sm">
                <XCircle size={15}/>Reject
              </button>
              <button onClick={handleApprove} disabled={processing}
                className="flex items-center gap-1.5 btn-primary py-2 px-4 text-sm bg-green-600 hover:bg-green-700">
                <CheckCircle size={15}/>{processing ? 'Approving...' : 'Approve'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reject form */}
      {showRejectForm && (
        <div className="card p-5 border-2 border-red-200 bg-red-50 animate-fade-in">
          <h3 className="font-semibold text-red-700 mb-3">Rejection Reason</h3>
          <textarea className="input resize-none mb-3" rows={3}
            placeholder="Explain why this listing is rejected (seller will see this via WhatsApp)..."
            value={rejectionReason} onChange={e=>setRejectionReason(e.target.value)}/>
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={processing}
              className="btn-danger flex items-center gap-1.5 text-sm py-2">
              <XCircle size={14}/>{processing ? 'Rejecting...' : 'Confirm Reject & Notify Seller'}
            </button>
            <button onClick={() => setShowRejectForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Images */}
          <div className="card overflow-hidden">
            <div className="h-72 bg-gray-100">
              {listing.images?.length > 0
                ? <img src={listing.images[activeImg]} alt="" className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-6xl">{landType?.icon||'🏡'}</div>
              }
            </div>
            {listing.images?.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {listing.images.map((img,i) => (
                  <img key={i} src={img} alt="" onClick={()=>setActiveImg(i)}
                    className={`h-14 w-18 flex-shrink-0 object-cover rounded-lg cursor-pointer border-2 transition
                                ${i===activeImg?'border-forest-500':'border-transparent'}`}/>
                ))}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="card p-5 space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{listing.title}</h2>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <MapPin size={13} className="text-forest-500"/>
                {[listing.village, listing.taluk, listing.district].filter(Boolean).join(', ')}
              </div>
              {listing.survey_number && (
                <p className="text-sm text-gray-500 mt-1">Survey No: <span className="font-mono font-medium">{listing.survey_number}</span></p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 bg-smoke rounded-xl p-3">
              <div><p className="text-xs text-gray-400">Type</p><p className="font-medium text-sm">{landType?.icon} {landType?.label?.split('/')[0].trim()}</p></div>
              <div><p className="text-xs text-gray-400">Area</p><p className="font-medium text-sm">{formatArea(listing.area_value, listing.area_unit)}</p></div>
              <div><p className="text-xs text-gray-400">Price</p><p className="font-medium text-sm text-forest-700">{formatPrice(listing.price)}</p></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {listing.road_access     && <span className="badge border-forest-200 bg-forest-50 text-forest-700">🛣️ Road Access</span>}
              {listing.electricity     && <span className="badge border-amber-200 bg-amber-50 text-amber-700">⚡ Electricity</span>}
              {listing.patta_available && <span className="badge border-blue-200 bg-blue-50 text-blue-700">📄 Patta</span>}
              {listing.water_source    && <span className="badge border-cyan-200 bg-cyan-50 text-cyan-700">💧 {listing.water_source}</span>}
              {listing.price_negotiable&& <span className="badge border-earth-200 bg-earth-50 text-earth-700">💬 Negotiable</span>}
            </div>

            {listing.description && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            <p className="text-xs text-gray-400">
              Submitted: {format(new Date(listing.created_at), 'dd MMM yyyy, h:mm a')}
            </p>
          </div>

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Location</h3>
              <MapPicker lat={listing.latitude} lng={listing.longitude} readOnly/>
            </div>
          )}
        </div>

        {/* Seller panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Seller Information</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-forest-600">{listing.profiles?.full_name?.[0]?.toUpperCase()||'S'}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{listing.profiles?.full_name}</p>
                <p className="text-sm text-gray-500">{listing.profiles?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${listing.profiles?.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-forest-600 text-white rounded-xl text-xs font-medium hover:bg-forest-700 transition">
                <Phone size={13}/>Call
              </a>
              <a href={`https://wa.me/${listing.profiles?.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${listing.profiles?.full_name}, regarding your Varagam listing: "${listing.title}"`)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-medium hover:bg-green-600 transition">
                <MessageCircle size={13}/>WhatsApp
              </a>
            </div>
          </div>

          {listing.admin_notes !== undefined && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-2">Admin Notes</h3>
              <textarea className="input resize-none text-sm" rows={4} placeholder="Internal notes..."
                defaultValue={listing.admin_notes||''}
                onBlur={async(e) => {
                  await updateListing(id, {admin_notes: e.target.value})
                  toast.success('Notes saved')
                }}/>
              <p className="text-xs text-gray-400 mt-1">Auto-saved on blur</p>
            </div>
          )}

          {listing.status === 'rejected' && listing.rejection_reason && (
            <div className="card p-5 border border-red-200">
              <h3 className="font-semibold text-red-600 mb-2">Rejection Reason</h3>
              <p className="text-sm text-gray-700">{listing.rejection_reason}</p>
            </div>
          )}

          <Link to={`/listings/${id}`} target="_blank"
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5">
            Preview Public View ↗
          </Link>
        </div>
      </div>
    </div>
  )
}
