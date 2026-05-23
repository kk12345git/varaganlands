import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useListingsStore } from '../../store/listingsStore'
import { TN_DISTRICTS, LAND_TYPES } from '../../lib/constants'
import ListingCard from '../../components/buyer/ListingCard'

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const { listings, fetchApproved, loading } = useListingsStore()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    district:  searchParams.get('district')  || '',
    land_type: searchParams.get('land_type') || '',
    min_price: '',
    max_price: '',
  })

  useEffect(() => { fetchApproved(filters) }, [filters])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const clearFilters = () => setFilters({ district:'', land_type:'', min_price:'', max_price:'' })
  const activeCount = Object.values(filters).filter(Boolean).length

  const FilterBar = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className="label">District</label>
        <select className="input" value={filters.district} onChange={e=>setFilter('district', e.target.value)}>
          <option value="">All Districts</option>
          {TN_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Land Type</label>
        <select className="input" value={filters.land_type} onChange={e=>setFilter('land_type', e.target.value)}>
          <option value="">All Types</option>
          {LAND_TYPES.map(t=><option key={t.value} value={t.value}>{t.icon} {t.label.split('/')[0].trim()}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Min Price (₹)</label>
        <input type="number" className="input" placeholder="0" value={filters.min_price}
          onChange={e=>setFilter('min_price', e.target.value)}/>
      </div>
      <div>
        <label className="label">Max Price (₹)</label>
        <input type="number" className="input" placeholder="Any" value={filters.max_price}
          onChange={e=>setFilter('max_price', e.target.value)}/>
      </div>
    </div>
  )

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-heading">Land Listings</h1>
          <p className="text-gray-500 text-sm mt-1 font-body">{listings.length} properties found</p>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <X size={14}/>Clear ({activeCount})
            </button>
          )}
          <button onClick={()=>setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm">
            <SlidersHorizontal size={15}/>Filters
            {activeCount > 0 && <span className="bg-forest-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Desktop filters always shown; mobile toggleable */}
      <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-6 card p-4`}>
        <FilterBar/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i)=><div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse"/>)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-display text-xl text-gray-700">No listings found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          <button onClick={clearFilters} className="btn-secondary mt-4 text-sm py-2 px-4">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </div>
  )
}
