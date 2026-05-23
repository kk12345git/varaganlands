import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle, XCircle, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useListingsStore } from '../../store/listingsStore'
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const { listings, fetchAll, loading } = useListingsStore()
  const [stats, setStats] = useState({ pending:0, approved:0, rejected:0, inquiries:0 })

  useEffect(() => {
    fetchAll()
    loadStats()
  }, [])

  const loadStats = async () => {
    const [{ count: pending }, { count: approved }, { count: rejected }, { count: inquiries }] = await Promise.all([
      supabase.from('listings').select('id', { count:'exact', head:true }).eq('status','pending'),
      supabase.from('listings').select('id', { count:'exact', head:true }).eq('status','approved'),
      supabase.from('listings').select('id', { count:'exact', head:true }).eq('status','rejected'),
      supabase.from('inquiries').select('id', { count:'exact', head:true }),
    ])
    setStats({ pending, approved, rejected, inquiries })
  }

  const recent = [...listings].slice(0,8)
  const pending = listings.filter(l=>l.status==='pending')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Varagan Real Estate Control Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Pending Review', value:stats.pending,   icon:Clock,         color:'text-amber-600',  bg:'bg-amber-50',   link:'/admin/listings?status=pending'  },
          { label:'Approved',       value:stats.approved,  icon:CheckCircle,   color:'text-forest-600', bg:'bg-forest-50',  link:'/admin/listings?status=approved' },
          { label:'Rejected',       value:stats.rejected,  icon:XCircle,       color:'text-red-500',    bg:'bg-red-50',     link:'/admin/listings?status=rejected' },
          { label:'Inquiries',      value:stats.inquiries, icon:MessageSquare, color:'text-blue-600',   bg:'bg-blue-50',    link:'/admin/inquiries'                },
        ].map(s => (
          <Link key={s.label} to={s.link} className="card p-5 hover:shadow-card-hover transition-all">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Urgent: pending listings */}
      {pending.length > 0 && (
        <div className="card border-l-4 border-amber-400">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-500"/>
              <h2 className="font-display font-semibold text-gray-900">
                {pending.length} Listing{pending.length>1?'s':''} Awaiting Review
              </h2>
            </div>
            <Link to="/admin/listings" className="flex items-center gap-1 text-sm text-forest-600 font-medium">
              Review all <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.slice(0,4).map(l => (
              <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-amber-50 transition">
                <div className="w-12 h-12 bg-forest-50 rounded-xl overflow-hidden flex-shrink-0">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center">🏡</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{l.title}</p>
                  <p className="text-xs text-gray-400">{l.profiles?.full_name} · {l.district} · {formatPrice(l.price)}</p>
                  <p className="text-xs text-gray-300">{format(new Date(l.created_at),'dd MMM yyyy, h:mm a')}</p>
                </div>
                <Link to={`/admin/listings/${l.id}`}
                  className="btn-primary py-1.5 px-4 text-xs flex-shrink-0">
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All recent listings */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">All Listings</h2>
          <Link to="/admin/listings" className="flex items-center gap-1 text-sm text-forest-600 font-medium">
            Manage <ArrowRight size={14}/>
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_,i)=><div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                  <p className="text-xs text-gray-400">{l.district} · {l.profiles?.full_name}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[l.status]} hidden sm:inline-flex`}>
                  {STATUS_LABELS[l.status]}
                </span>
                <Link to={`/admin/listings/${l.id}`} className="text-xs text-forest-600 hover:underline font-medium">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

