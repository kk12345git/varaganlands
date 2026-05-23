import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, TrendingUp, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react'
import { useListingsStore } from '../../store/listingsStore'
import { TN_DISTRICTS, LAND_TYPES } from '../../lib/constants'
import ListingCard from '../../components/buyer/ListingCard'

export default function HomePage() {
  const { listings, fetchApproved, loading } = useListingsStore()
  const [district, setDistrict] = useState('')
  const [landType, setLandType] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchApproved() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (district) params.set('district', district)
    if (landType) params.set('land_type', landType)
    navigate(`/listings?${params}`)
  }

  const featured = listings.filter(l => l.featured).slice(0, 3)
  const recent   = listings.slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}/>

        <div className="page-container py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-sm px-4 py-2 rounded-full mb-6">
              <span className="text-earth-300">🌾</span>
              <span className="text-forest-100">Tamil Nadu's Trusted Land Marketplace</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              உங்கள் கனவு நிலம்<br/>
              <span className="text-earth-300">இங்கே கிடைக்கும்</span>
            </h1>
            <p className="text-forest-200 text-lg mb-8 font-body">
              Buy and sell land directly — no middlemen, no commission.
              Verified listings across all Tamil Nadu districts.
            </p>

            {/* Search card */}
            <form onSubmit={handleSearch}
              className="bg-white rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row gap-3">
              <select value={district} onChange={e=>setDistrict(e.target.value)}
                className="flex-1 input text-gray-700">
                <option value="">All Districts</option>
                {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={landType} onChange={e=>setLandType(e.target.value)}
                className="flex-1 input text-gray-700">
                <option value="">All Land Types</option>
                {LAND_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label.split('/')[0].trim()}</option>)}
              </select>
              <button type="submit" className="btn-primary flex items-center gap-2 sm:px-6 whitespace-nowrap">
                <Search size={16}/>Search
              </button>
            </form>

            <p className="text-forest-300 text-sm mt-4">
              {listings.length}+ verified listings available
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { num: `${listings.length}+`, label: 'Active Listings' },
            { num: '38',                  label: 'Districts Covered' },
            { num: '0%',                  label: 'Commission' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-display text-2xl md:text-3xl font-bold text-forest-700">{s.num}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Land types */}
      <section className="page-container py-14">
        <h2 className="section-heading text-center mb-2">Browse by Type</h2>
        <p className="text-gray-500 text-center mb-8 font-body">Find the perfect land category</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {LAND_TYPES.map(t => (
            <Link key={t.value}
              to={`/listings?land_type=${t.value}`}
              className="card p-4 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="text-sm font-medium text-gray-700">{t.label.split('/')[0].trim()}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.label.split('/')[1]?.trim()}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="bg-forest-50 py-14">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-heading">Featured Listings</h2>
                <p className="text-gray-500 font-body mt-1">Handpicked premium properties</p>
              </div>
              <Link to="/listings?featured=true" className="flex items-center gap-1 text-sm text-forest-600 hover:text-forest-700 font-medium">
                View all <ArrowRight size={15}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map(l => <ListingCard key={l.id} listing={l}/>)}
            </div>
          </div>
        </section>
      )}

      {/* Recent listings */}
      <section className="page-container py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">Recent Listings</h2>
            <p className="text-gray-500 font-body mt-1">Newly added properties</p>
          </div>
          <Link to="/listings" className="flex items-center gap-1 text-sm text-forest-600 hover:text-forest-700 font-medium">
            All listings <ArrowRight size={15}/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100"/>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏡</div>
            <p className="font-display text-xl">No listings yet</p>
            <p className="text-sm mt-2">Be the first to list your land!</p>
            <Link to="/register" className="btn-primary inline-flex mt-6">List Your Land</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(l => <ListingCard key={l.id} listing={l}/>)}
          </div>
        )}
      </section>

      {/* Why Varagan */}
      <section className="bg-clay py-14">
        <div className="page-container">
          <h2 className="section-heading text-center mb-10">Why Varagan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck className="text-forest-600" size={28}/>, title: 'Verified Listings', desc: 'Every listing is reviewed by our admin team before going live.' },
              { icon: <TrendingUp className="text-earth-500" size={28}/>, title: 'Best Prices', desc: 'Direct seller to buyer. No agent commission. Fair market prices.' },
              { icon: <Smartphone className="text-forest-600" size={28}/>, title: 'Install as App', desc: 'Works offline. Install on any phone or laptop from your browser.' },
            ].map(item => (
              <div key={item.title} className="card p-6 text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16 text-center">
        <h2 className="section-heading mb-4">Ready to sell your land?</h2>
        <p className="text-gray-500 mb-8 font-body max-w-md mx-auto">
          List in minutes. Reach buyers across Tamil Nadu. Free to post.
        </p>
        <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
          Get Started Free <ArrowRight size={18}/>
        </Link>
      </section>
    </div>
  )
}

