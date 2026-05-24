import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Maximize2, IndianRupee, Droplets, Zap, CheckCircle } from 'lucide-react'
import { use3DTilt } from '../../hooks/use3DTilt'
import { formatPrice, formatArea, LAND_TYPES, STATUS_COLORS, STATUS_LABELS } from '../../lib/constants'

export default function ListingCard({ listing, showStatus = false }) {
  const tiltRef = use3DTilt(6, 900)
  const landType = LAND_TYPES.find(t => t.value === listing.land_type)
  const coverImage = listing.images?.[0]

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <div ref={tiltRef} className="card-hover group">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-forest-50">
              {landType?.icon || '🏡'}
            </div>
          )}
          {/* Land type badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full text-forest-700 shadow-sm">
            {landType?.icon} {landType?.label?.split('/')[0].trim()}
          </span>
          {listing.featured && (
            <span className="absolute top-3 right-3 bg-earth-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          {showStatus && (
            <span className={`absolute bottom-3 right-3 badge ${STATUS_COLORS[listing.status]}`}>
              {STATUS_LABELS[listing.status]}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin size={13} className="text-forest-500 flex-shrink-0"/>
            <span className="truncate">{listing.village ? `${listing.village}, ` : ''}{listing.district}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Maximize2 size={12}/>
              {formatArea(listing.area_value, listing.area_unit)}
            </span>
            {listing.water_source && (
              <span className="flex items-center gap-1">
                <Droplets size={12}/>
                {listing.water_source}
              </span>
            )}
            {listing.electricity && (
              <span className="flex items-center gap-1 text-amber-500">
                <Zap size={12}/>EB
              </span>
            )}
            {listing.patta_available && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={12}/>Patta
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-0.5 text-forest-700 font-bold text-lg font-display">
                <IndianRupee size={16}/>
                {formatPrice(listing.price).replace('₹','')}
              </div>
              {listing.price_per_unit && (
                <p className="text-xs text-gray-400">
                  {formatPrice(listing.price_per_unit)}/{listing.area_unit}
                </p>
              )}
            </div>
            {listing.price_negotiable && (
              <span className="text-xs text-earth-600 bg-earth-50 px-2 py-1 rounded-lg">Negotiable</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
