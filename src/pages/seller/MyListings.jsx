import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useListingsStore } from '../../store/listingsStore'
import { formatPrice, formatArea, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MyListings() {
  const { user } = useAuthStore()
  const { myListings, fetchMyListings, deleteListing, loading } = useListingsStore()
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { if (user) fetchMyListings(user.id) }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteListing(id)
      toast.success('Listing deleted')
    } catch (err) {
      toast.error(err.message)
    } finally { setDeleting(null) }
  }

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>)}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{myListings.length} total listings</p>
        </div>
        <Link to="/seller/listings/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16}/>Add New
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🏡</div>
          <h3 className="font-display text-xl font-semibold text-gray-700">No listings yet</h3>
          <p className="text-gray-400 text-sm mt-2">Start by adding your first land listing</p>
          <Link to="/seller/listings/new" className="btn-primary inline-flex items-center gap-2 mt-6">
            <Plus size={16}/>Add First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map(l => (
            <div key={l.id} className="card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start gap-4 p-4 md:p-5">
                {/* Thumbnail */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-forest-50 rounded-xl overflow-hidden flex-shrink-0">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏡</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-gray-900 truncate">{l.title}</h3>
                    <span className={`badge ${STATUS_COLORS[l.status]} flex-shrink-0`}>
                      {STATUS_LABELS[l.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {l.district} · {formatArea(l.area_value, l.area_unit)} · {formatPrice(l.price)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added {format(new Date(l.created_at), 'dd MMM yyyy')}
                  </p>

                  {/* Rejection reason */}
                  {l.status === 'rejected' && l.rejection_reason && (
                    <div className="flex items-start gap-1.5 mt-2 bg-red-50 rounded-lg p-2.5">
                      <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5"/>
                      <p className="text-xs text-red-600">{l.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a href={`/listings/${l.id}`} target="_blank" rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition"
                    title="Preview">
                    <Eye size={16}/>
                  </a>
                  <Link to={`/seller/listings/${l.id}/edit`}
                    className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition"
                    title="Edit">
                    <Edit2 size={16}/>
                  </Link>
                  <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
