import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'
import L from 'leaflet'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapClickHandler({ onSelect }) {
  useMapEvents({ click: (e) => onSelect(e.latlng) })
  return null
}

export default function MapPicker({ lat, lng, onChange, readOnly = false }) {
  const [position, setPosition] = useState(
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
  )
  const center = position || { lat: 11.1271, lng: 78.6569 } // Tamil Nadu center

  const handleSelect = (latlng) => {
    if (readOnly) return
    setPosition(latlng)
    onChange?.(latlng.lat, latlng.lng)
  }

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(latlng)
        onChange?.(latlng.lat, latlng.lng)
      },
      () => alert('Location access denied. Please allow location in browser settings.')
    )
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={useMyLocation}
            className="flex items-center gap-2 text-sm text-forest-600 border border-forest-200 bg-forest-50 px-3 py-1.5 rounded-lg hover:bg-forest-100 transition">
            <Navigation size={14}/>Use My Location
          </button>
          <span className="text-xs text-gray-400">or click on map to pin location</span>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '300px' }}>
        <MapContainer center={[center.lat, center.lng]} zoom={readOnly && position ? 14 : 8}
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {!readOnly && <MapClickHandler onSelect={handleSelect}/>}
          {position && <Marker position={[position.lat, position.lng]}/>}
        </MapContainer>
      </div>

      {position && (
        <p className="text-xs text-gray-400 font-mono">
          📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
