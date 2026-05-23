import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useListingsStore } from '../../store/listingsStore'
import { formatPrice, STATUS_COLORS, STATUS_LABELS, LAND_TYPES, TN_DISTRICTS } from '../../lib/constants'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

const STATUSES = ['all','pending','approved','rejected','sold']

export default function AdminListings() {
  const [searchParams] = useSearchParams()
  const { listings, fetchAll, loading } = useListingsStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  useEffect(() => { fetchAll() }, [])

  const filtered = listings.filter(l => {
    const matchStatus = status === 'all' || l.status === status
    const matchSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.district?.toLowerCase().includes(search.toLowerCase()) ||
      l.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Listings Management</h1>
        <p className="text-gray-500 text-sm mt-1">{listings.length} total · {listings.filter(l=>l.status==='pending').length} pending</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9" placeholder="Search by title, district, seller..."
            value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition
                          ${status===s ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? `All (${listings.length})` : `${s} (${listings.filter(l=>l.status===s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_,i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-gray-600">No listings found</p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Listing</div>
              <div className="col-span-2">Seller</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Action</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map(l => (
                <div key={l.id} className="flex md:grid md:grid-cols-12 md:gap-4 items-center px-4 md:px-5 py-3.5 hover:bg-gray-50 transition gap-3">
                  {/* Listing */}
                  <div className="flex items-center gap-3 flex-1 md:col-span-5 min-w-0">
                    <div className="w-10 h-10 bg-forest-50 rounded-lg overflow-hidden flex-shrink-0">
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center">🏡</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                      <p className="text-xs text-gray-400 truncate">{l.district} · {format(new Date(l.created_at),'dd MMM yy')}</p>
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="hidden md:block md:col-span-2">
                    <p className="text-sm text-gray-700 truncate">{l.profiles?.full_name}</p>
                    <p className="text-xs text-gray-400">{l.profiles?.phone}</p>
                  </div>

                  {/* Price */}
                  <div className="hidden md:block md:col-span-2">
                    <p className="text-sm font-medium text-forest-700">{formatPrice(l.price)}</p>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1">
                    <span className={`badge ${STATUS_COLORS[l.status]} text-xs`}>{l.status}</span>
                  </div>

                  {/* Action */}
                  <div className="md:col-span-2 flex-shrink-0">
                    <Link to={`/admin/listings/${l.id}`}
                      className="btn-primary py-1.5 px-3 text-xs">
                      {l.status === 'pending' ? 'Review' : 'View'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
