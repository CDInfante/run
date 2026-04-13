// run-cdinfante/src/components/ui/map/MapControls.tsx
/** @author Harry Vasanth (harryvasanth.com) */
import type L from 'leaflet'
import { useEffect, useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { useTranslation } from '../../../hooks/useTranslation'
import { userLocationIcon } from './MapIcons'

export const MapBounds = () => {
  const map = useMap()
  useEffect(() => {
    const bounds: L.LatLngBoundsExpression = [
      [32.3, -17.4],
      [33.2, -16.1],
    ]
    map.setMaxBounds(bounds)
    map.setMinZoom(9)
  }, [map])
  return null
}

export const LocationMarker = ({
  setUserLocation,
}: {
  setUserLocation: (pos: L.LatLng) => void
}) => {
  const map = useMap()
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 })

    const onLocationFound = (e: L.LocationEvent) => {
      setPosition(e.latlng)
      setUserLocation(e.latlng)
      map.flyTo(e.latlng, 14)
    }

    const onLocationError = () => {
      console.warn('Location access denied.')
    }

    map.on('locationfound', onLocationFound)
    map.on('locationerror', onLocationError)

    return () => {
      map.off('locationfound', onLocationFound)
      map.off('locationerror', onLocationError)
    }
  }, [map, setUserLocation])

  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon} zIndexOffset={1000}>
      <Popup>
        <div className="p-4 text-center font-bold text-xs uppercase tracking-widest">
          {t('map.user_location')}
        </div>
      </Popup>
    </Marker>
  )
}
