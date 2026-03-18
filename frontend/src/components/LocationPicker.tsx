import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export type LatLng = {
  lat: number
  lng: number
}

type Props = {
  value: LatLng | null
  onChange: (next: LatLng) => void
  onLabelChange?: (label: string) => void
}

function ClickToSet({ onPick }: { onPick: (v: LatLng) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function RecenterOnPick({ center }: { center: LatLng }) {
  const map = useMap()

  useEffect(() => {
    const nextZoom = Math.max(map.getZoom(), 16)
    map.flyTo([center.lat, center.lng], nextZoom, { animate: false })
  }, [center.lat, center.lng, map])

  return null
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) return null
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? null
  } catch {
    return null
  }
}

export function LocationPicker({ value, onChange, onLabelChange }: Props) {
  const [center, setCenter] = useState<LatLng>(() => ({ lat: 13.0827, lng: 80.2707 }))
  const [busy, setBusy] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const picked = value ?? null

  const pretty = useMemo(() => {
    if (!picked) return null
    const lat = picked.lat.toFixed(6)
    const lng = picked.lng.toFixed(6)
    return `${lat}, ${lng}`
  }, [picked])

  useEffect(() => {
    if (picked) setCenter(picked)
  }, [picked])

  const setFromDevice = async () => {
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError('Your browser does not support location services.')
      return
    }

    // Geolocation requires a secure context (HTTPS) except for localhost.
    if (!window.isSecureContext) {
      setGeoError('Location works only on HTTPS (or http://localhost).')
      return
    }

    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        await setPicked(next)
        setCenter(next)

        setBusy(false)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Permission denied. Allow location access in the browser for this site.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError('Location unavailable. Check GPS/Wi‑Fi and try again.')
        } else if (err.code === err.TIMEOUT) {
          setGeoError('Location request timed out. Try again.')
        } else {
          setGeoError('Could not get your current location.')
        }
        setBusy(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30_000 },
    )
  }

  const setPicked = async (next: LatLng) => {
    onChange(next)
    if (onLabelChange) {
      const label = await reverseGeocode(next.lat, next.lng)
      if (label) onLabelChange(label)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <div className="text-sm font-semibold">Pin the location</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Click on the map to drop a pin, or use your current location.
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={setFromDevice} disabled={busy}>
          Use my location
        </Button>
      </div>

      {geoError ? (
        <div className="px-4 pb-3 text-xs text-rose-600 dark:text-rose-300">{geoError}</div>
      ) : null}

      <div className="h-64 w-full">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <RecenterOnPick center={center} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToSet onPick={setPicked} />
          {picked ? <CircleMarker center={[picked.lat, picked.lng]} radius={10} /> : null}
        </MapContainer>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {pretty ? `Selected: ${pretty}` : 'No pin selected yet.'}
        </div>
      </div>
    </Card>
  )
}
