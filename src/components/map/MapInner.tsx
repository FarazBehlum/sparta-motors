'use client'

import React from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { formatPhone } from '@/lib/format'

export type MapInnerProps = {
  lat: number
  lng: number
  addressLines: string[]
  phone?: string | null
  showPopup?: boolean
  showControls?: boolean
}

// Inline SVG orange pin as a Leaflet divIcon (no extra HTTP request).
const markerIcon = L.divIcon({
  className: 'sparta-marker',
  html: `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 39C16 39 30 24.5 30 15A14 14 0 1 0 2 15C2 24.5 16 39 16 39Z"
        fill="#F26B0F" stroke="#1A1A1A" stroke-width="2"/>
      <path d="M16 9l6 6-6 6-6-6z" fill="#1A1A1A"/>
    </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 39],
  popupAnchor: [0, -34],
})

export default function MapInner({
  lat,
  lng,
  addressLines,
  phone,
  showPopup = true,
  showControls = true,
}: MapInnerProps) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={showControls}
      zoomControl={showControls}
      dragging={showControls}
      doubleClickZoom={showControls}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <Marker position={[lat, lng]} icon={markerIcon}>
        {showPopup && (
          <Popup className="sparta-popup">
            <div className="sparta-popup-head">SPARTA MOTORS</div>
            <div className="sparta-popup-body">
              <address>
                {addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </address>
              {phone && (
                <a className="sparta-popup-phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                  {formatPhone(phone)}
                </a>
              )}
              <a
                className="sparta-popup-directions"
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
              >
                View directions →
              </a>
            </div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  )
}
