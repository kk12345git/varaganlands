import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Clock, CheckCircle, XCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useListingsStore } from '../../store/listingsStore'
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'
import { format } from 'date-fns'

export default function SellerDashboard() {
  const { user, profile } = useAuthStore()
  const { myListings, fetchMyListings, loading } = useListingsStore()

  useEffect(() => { if (user) fetchMyListings(user.id) }, [user])

  const stats = {
    total:    myListings.length,
    pending:  myListings.filter(l => l.status === 'pending').length,
    approved: myListings.filter(l => l.status === 'approved').length,
    rejected: myListings.filter(l => l.status === 'rejected').length,
  }

  const recent = [...myListings].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            வணக்கம், {profile?.full_name?.split(' ')[0] || 'Seller'} 👋
          </h1>
          <p className="text-gray-500 mt-1 font-body">Manage your land listings from here</p>
        </div>
        <Link to="/seller/listings/new" className="btn-primary flex items-center gap-2">
          <Plus size={18}/>Add New Land
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: stats.total,    icon: FileText,    color: 'text-gray-600',   bg: 'bg-gray-50'    },
          { label: 'Pending Review', value: stats.pending,  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50'   },
          { label: 'Approved',       value: stats.approved, icon: CheckCircle, color: 'text-forest-600', bg: 'bg-forest-50'  },
          { label: 'Rejected',       value: stats.rejected, icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50'     },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status tips */}
      {stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {stats.pending} listing{stats.pending>1?'s':''} pending admin review
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Admin will review within 24 hours. You'll be notified once approved.
            </p>
          </div>
        </div>
      )}
      {stats.rejected > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-medium text-red-700">
              {stats.rejected} listing{stats.rejected>1?'s':''} rejected
            </p>
            <p className="text-xs text-red-500 mt-0.5">Check the rejection reason and edit to resubmit.</p>
          </div>
          <Link to="/seller/listings" className="ml-auto text-xs text-red-600 font-medium hover:underline whitespace-nowrap">
            View →
          </Link>
        </div>
      )}

      {/* Recent listings */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">Recent Listings</h2>
          <Link to="/seller/listings" className="flex items-center gap-1 text-sm text-forest-600 hover:text-forest-700 font-medium">
            View all <ArrowRight size={14}/>
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_,i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse"/>)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🏡</div>
            <p className="font-medium text-gray-600">No listings yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first land listing to get started</p>
            <Link to="/seller/listings/new" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2">
              <Plus size={15}/>Add First Listing
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(l => (
              <div key={l.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition">
                <div className="w-12 h-12 bg-forest-50 rounded-xl overflow-hidden flex-shrink-0">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-xl">🏡</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{l.title}</p>
                  <p className="text-sm text-gray-400 truncate">{l.district} · {formatPrice(l.price)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`badge ${STATUS_COLORS[l.status]} hidden sm:inline-flex`}>
                    {STATUS_LABELS[l.status]}
                  </span>
                  <Link to={`/seller/listings/${l.id}/edit`}
                    className="text-xs text-forest-600 hover:text-forest-700 font-medium">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'How to list?', desc: 'Fill in land details, upload photos, pin location. Takes 5 mins.', emoji: '📋' },
          { title: 'Review process', desc: 'Admin reviews within 24h. Approved listings go live instantly.', emoji: '✅' },
          { title: 'Get inquiries', desc: 'Buyers contact you directly via WhatsApp or phone. No middlemen!', emoji: '📞' },
        ].map(t => (
          <div key={t.title} className="card p-5">
            <div className="text-2xl mb-2">{t.emoji}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{t.title}</h3>
            <p className="text-sm text-gray-500 font-body">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
