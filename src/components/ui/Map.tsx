/** @author Harry Vasanth (harryvasanth.com) */
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2, Navigation } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useTranslation } from '../../hooks/useTranslation'
import { fetchAmenities } from '../../services/amenities'
import {
  IPMA_REGIONS,
  REGION_URLS,
  fetchWeatherWarnings,
} from '../../services/ipma'
import { fetchShipStatus } from '../../services/ships'
import { fetchTrails } from '../../services/trails'
import type { WeatherWarning } from '../../types'

const mapStyles = `
  .user-location-icon {
    background: none !important;
    border: none !important;
  }

  .custom-leaflet-icon {
    background: none !important;
    border: none !important;
  }
  
  .custom-marker-cluster {
    background: none !important;
    border: none !important;
  }
  
  .leaflet-popup {
    transform: scale(0.85);
    transform-origin: bottom center;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 2rem !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: var(--card-bg) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border: 1.5px solid var(--card-border) !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    width: auto !important;
  }
  
  .leaflet-popup-close-button {
    top: 12px !important;
    right: 12px !important;
    padding: 0 !important;
    width: 24px !important;
    height: 24px !important;
    background: rgba(0, 0, 0, 0.05) !important;
    border-radius: 50% !important;
    color: #001e40 !important;
    text-shadow: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    z-index: 1000 !important;
  }
  .leaflet-popup-close-button:hover {
    background: #b6171e !important;
    color: white !important;
  }
  .dark .leaflet-popup-close-button {
    color: white !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }
  .dark .leaflet-popup-close-button:hover {
    background: #b6171e !important;
  }

  .leaflet-container {
    font-family: inherit;
    border-radius: 2rem;
  }
  .leaflet-control-zoom {
    border: none !important;
    margin: 24px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    z-index: 1000 !important;
  }
  .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(12px) !important;
    color: #001e40 !important;
    border: 1px solid rgba(0, 30, 64, 0.1) !important;
    border-radius: 16px !important;
    width: 44px !important;
    height: 44px !important;
    line-height: 44px !important;
    font-size: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important;
  }
  .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
    background: white !important;
    transform: scale(1.1);
    border-color: #b6171e !important;
    color: #b6171e !important;
  }
  .dark .leaflet-control-zoom-in, .dark .leaflet-control-zoom-out {
    background: rgba(0, 30, 64, 0.9) !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  .dark .leaflet-control-zoom-in:hover, .dark .leaflet-control-zoom-out:hover {
    background: #001e40 !important;
    border-color: #b6171e !important;
  }
  .dark .leaflet-tile {
    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
  }
  .leaflet-top, .leaflet-bottom {
    z-index: 1000 !important;
  }
`

const REGION_COORDS_OVERRIDE: Record<string, [number, number]> = {
  MCN: [32.8, -16.9],
  MRM: [32.75, -17.0],
  MCS: [32.65, -16.9],
  MPS: [33.06, -16.33],
}

const FUNCHAL_PORT_COORDS: [number, number] = [32.6432113, -16.9148545]

const ICONS_SVG = {
  fountain: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>`,
  toilet: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18" /><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8" /></svg>`,
  trail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>`,
  port: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="replace-pulse"><path d="M12 6v16" /><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1" /><path d="M9 11h6" /><circle cx="12" cy="4" r="2" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="replace-pulse"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>`,
}

const getClusterIcon = (colorClass: string) => {
  return (cluster: { getChildCount: () => number }) => {
    const count = cluster.getChildCount()
    const html = `<div class="flex items-center justify-center w-11 h-11 ${colorClass} text-white rounded-[1rem] shadow-xl border border-white/30 font-bold text-sm backdrop-blur-md transition-transform hover:scale-110">${count}</div>`

    return L.divIcon({
      html: html,
      className: 'custom-marker-cluster',
      iconSize: L.point(44, 44, true),
    })
  }
}

const createCustomIcon = (
  type: 'fountain' | 'toilet' | 'warning' | 'trail' | 'port',
  level?: string,
) => {
  let color = '#3b82f6' // Blue for fountains
  let svgString = ICONS_SVG.warning
  let shouldPulse = false

  if (type === 'fountain') {
    svgString = ICONS_SVG.fountain
  } else if (type === 'toilet') {
    color = '#8b5cf6' // Violet
    svgString = ICONS_SVG.toilet
  } else if (type === 'trail') {
    svgString = ICONS_SVG.trail
    if (level === 'Aberto')
      color = '#10b981' // Emerald
    else if (level === 'Encerrado')
      color = '#ef4444' // Red
    else color = '#f97316' // Orange
  } else if (type === 'port') {
    svgString = ICONS_SVG.port
    if (level === 'busy') {
      color = '#b6171e'
      shouldPulse = true
    } else {
      color = '#10b981'
      shouldPulse = false
    }
  } else if (type === 'warning') {
    switch (level) {
      case 'yellow':
        color = '#eab308'
        shouldPulse = true
        break
      case 'orange':
        color = '#f97316'
        shouldPulse = true
        break
      case 'red':
        color = '#dc2626'
        shouldPulse = true
        break
      default:
        color = '#22c55e'
        svgString = ICONS_SVG.check
        shouldPulse = false
    }
  }

  if (shouldPulse) {
    svgString = svgString.replace('replace-pulse', 'animate-pulse')
  } else {
    svgString = svgString.replace('class="replace-pulse"', '')
  }

  const isWarning = type === 'warning' || type === 'port'
  const size = isWarning ? 40 : 32

  const html = `<div style="display:flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; color:white; background-color:${color}; border-radius:40% 40% 40% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); opacity:${isWarning ? 1 : 0.8};">
    <div style="transform:rotate(45deg); display:flex;">
      ${svgString}
    </div>
  </div>`

  return L.divIcon({
    html: html,
    className: 'custom-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const MapBounds = () => {
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

const userLocationIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-40"></div>
    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
  </div>`,
  className: 'user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const LocationMarker = ({
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

interface MapProps {
  showWater: boolean
  showToilets: boolean
  showAlerts: boolean
  showTrails: boolean
}

const MapComponent: React.FC<MapProps> = ({
  showWater,
  showToilets,
  showAlerts,
  showTrails,
}) => {
  const { t, language } = useTranslation()
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  const { data: amenities = [], isFetching: isFetchingAmenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: fetchAmenities,
  })
  const { data: warnings = [], isFetching: isFetchingWarnings } = useQuery({
    queryKey: ['warnings'],
    queryFn: fetchWeatherWarnings,
  })
  const { data: trailsData, isFetching: isFetchingTrails } = useQuery({
    queryKey: ['trails'],
    queryFn: fetchTrails,
  })
  const { data: portStatus, isFetching: isFetchingShips } = useQuery({
    queryKey: ['ships'],
    queryFn: fetchShipStatus,
  })

  const trails = trailsData?.trails || []
  const isSyncing =
    isFetchingAmenities ||
    isFetchingWarnings ||
    isFetchingTrails ||
    isFetchingShips

  const waterAmenities = useMemo(
    () => (showWater ? amenities.filter(a => a.type === 'fountain') : []),
    [amenities, showWater],
  )
  const toiletAmenities = useMemo(
    () => (showToilets ? amenities.filter(a => a.type === 'toilet') : []),
    [amenities, showToilets],
  )

  const tileLayerUrl =
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const getRegionName = (id: string) => {
    switch (id) {
      case IPMA_REGIONS.NORTH_COAST:
        return t('weather.north_coast')
      case IPMA_REGIONS.MOUNTAIN_REGIONS:
        return t('weather.mountain_regions')
      case IPMA_REGIONS.SOUTH_COAST:
        return t('weather.south_coast')
      case IPMA_REGIONS.PORTO_SANTO:
        return t('weather.porto_santo')
      default:
        return id
    }
  }

  const getAwarenessTranslation = (type: string) => {
    switch (type) {
      case 'Agitação Marítima':
        return t('weather.awareness.maritime')
      case 'Nevoeiro':
        return t('weather.awareness.fog')
      case 'Tempo Frio':
        return t('weather.awareness.cold')
      case 'Tempo Quente':
        return t('weather.awareness.hot')
      case 'Precipitação':
        return t('weather.awareness.rain')
      case 'Neve':
        return t('weather.awareness.snow')
      case 'Trovoada':
        return t('weather.awareness.thunder')
      case 'Vento':
        return t('weather.awareness.wind')
      default:
        return type
    }
  }

  const groupedWarnings = useMemo(() => {
    return warnings.reduce(
      (acc, warning) => {
        if (!acc[warning.idAreaAviso]) acc[warning.idAreaAviso] = []
        acc[warning.idAreaAviso].push(warning)
        return acc
      },
      {} as Record<string, WeatherWarning[]>,
    )
  }, [warnings])

  const dockedShips = portStatus?.ships.filter(s => s.isDockedNow) || []
  const nextArrival =
    !portStatus?.isDocked && portStatus?.ships?.length
      ? portStatus.ships.find(
          s =>
            new Date(s.arrivalDate) > new Date() &&
            s.terminal.includes('Terminal Sul'),
        )
      : null

  return (
    <div className="h-full w-full relative z-10 group/map">
      <style>{mapStyles}</style>

      {/* Syncing Live Data Indicator */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 px-4 py-2 bg-white/95 dark:bg-brand-navy/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-brand-navy/10 dark:border-white/10 pointer-events-none"
          >
            <Loader2 size={12} className="animate-spin text-brand-red" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-navy dark:text-white/90">
              Syncing Data
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-28 right-6 z-[1000] pointer-events-none">
        <button
          type="button"
          onClick={() => {
            if (userLocation && mapInstance) mapInstance.flyTo(userLocation, 16)
            else if (mapInstance)
              mapInstance.locate({ setView: true, maxZoom: 16 })
          }}
          className="pointer-events-auto p-4 bg-white/90 dark:bg-brand-navy/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/20 hover:scale-110 active:scale-95 transition-all group/btn"
          title="Locate Me"
        >
          <Navigation className="w-6 h-6 text-brand-red group-hover/btn:rotate-12 transition-transform" />
        </button>
      </div>

      <MapContainer
        center={[32.72, -16.95]}
        zoom={11}
        zoomControl={true}
        ref={setMapInstance}
        style={{ height: '100%', width: '100%' }}
      >
        {/* LEAFLET RENDERING OPTIMIZATION */}
        <TileLayer
          attribution="&copy; CARTO"
          url={tileLayerUrl}
          keepBuffer={2}
          updateWhenIdle={true}
          updateWhenZooming={false}
        />
        <MapBounds />
        <LocationMarker setUserLocation={setUserLocation} />

        {/* BLUE WATER CLUSTERS */}
        {waterAmenities.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={getClusterIcon('bg-blue-500/80')}
            maxClusterRadius={60}
          >
            {waterAmenities.map(amenity => (
              <Marker
                key={amenity.id}
                position={[amenity.lat, amenity.lon]}
                icon={createCustomIcon(amenity.type)}
              >
                <Popup>
                  <div className="p-6 pr-10 min-w-[180px] text-brand-navy dark:text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 border-b border-white/10 pb-2">
                      {amenity.type}
                    </p>
                    <h3 className="text-sm font-bold uppercase leading-tight">
                      {amenity.name ||
                        `${amenity.lat.toFixed(4)}, ${amenity.lon.toFixed(4)}`}
                    </h3>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {/* VIOLET TOILET CLUSTERS */}
        {toiletAmenities.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={getClusterIcon('bg-violet-500/80')}
            maxClusterRadius={60}
          >
            {toiletAmenities.map(amenity => (
              <Marker
                key={amenity.id}
                position={[amenity.lat, amenity.lon]}
                icon={createCustomIcon(amenity.type)}
              >
                <Popup>
                  <div className="p-6 pr-10 min-w-[180px] text-brand-navy dark:text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 border-b border-white/10 pb-2">
                      {amenity.type}
                    </p>
                    <h3 className="text-sm font-bold uppercase leading-tight">
                      {amenity.name ||
                        `${amenity.lat.toFixed(4)}, ${amenity.lon.toFixed(4)}`}
                    </h3>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {/* EMERALD TRAIL CLUSTERS */}
        {showTrails && trails.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={getClusterIcon('bg-emerald-500/80')}
            maxClusterRadius={40}
          >
            {trails.map(trail => (
              <Marker
                key={`trail-${trail.id}`}
                position={[trail.coordinates.lat, trail.coordinates.lon]}
                icon={createCustomIcon('trail', trail.status)}
              >
                <Popup>
                  <div className="p-6 pr-10 min-w-[220px] text-brand-navy dark:text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 border-b border-white/10 pb-2">
                      PR{trail.pr} • {trail.island}
                    </p>
                    <h3 className="text-sm font-bold uppercase leading-tight mb-2">
                      {trail.id}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider">
                        <span className="opacity-50">Status:</span>{' '}
                        <span
                          className={
                            trail.status === 'Aberto'
                              ? 'text-emerald-500'
                              : trail.status === 'Encerrado'
                                ? 'text-red-500'
                                : 'text-orange-500'
                          }
                        >
                          {trail.status}
                        </span>
                      </p>
                      <p className="text-[10px] uppercase tracking-wider">
                        <span className="opacity-50">Dist:</span>{' '}
                        {trail.distance}
                      </p>
                      <a
                        href="https://ifcn.madeira.gov.pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 mt-4 p-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        <span className="sr-only">IFCN Information link</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        IFCN Info
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {/* NON-CLUSTERED SHIPS & WARNINGS */}
        {portStatus && (
          <Marker
            position={FUNCHAL_PORT_COORDS}
            icon={createCustomIcon(
              'port',
              portStatus.isDocked ? 'busy' : 'clear',
            )}
          >
            <Popup>
              <div className="p-6 min-w-[280px] max-w-[320px] text-brand-navy dark:text-white">
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-brand-navy/5 dark:border-white/5 pb-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-tight truncate">
                      {t('port.name')}
                    </h3>
                    <div
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                        portStatus.isDocked
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-brand-white animate-pulse"
                        aria-hidden="true"
                      >
                        <path d="M12 6v16" />
                        <path d="m19 13 2-1a9 9 0 0 1-18 0l2 1" />
                        <path d="M9 11h6" />
                        <circle cx="12" cy="4" r="2" />
                      </svg>
                      {portStatus.isDocked ? t('port.busy') : t('port.clear')}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2.5">
                    {dockedShips.length > 0 ? (
                      dockedShips.map(ship => (
                        <div
                          key={ship.name}
                          className="group/ship flex flex-col p-3 rounded-2xl border border-brand-navy/5 dark:border-white/5 bg-brand-navy/[0.02] dark:bg-white/[0.02] hover:bg-brand-navy/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 bg-brand-red/10 rounded-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-brand-red"
                                  aria-hidden="true"
                                >
                                  <path d="M12 6v16" />
                                  <path d="m19 13 2-1a9 9 0 0 1-18 0l2 1" />
                                  <path d="M9 11h6" />
                                  <circle cx="12" cy="4" r="2" />
                                </svg>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wide truncate">
                                {ship.name}
                              </span>
                            </div>
                            <span className="flex-shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-lg bg-brand-navy/5 dark:bg-white/10 uppercase tracking-widest opacity-60">
                              {ship.terminal.split('-').pop()?.trim()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                              <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold mb-0.5">
                                {t('port.arrival')}
                              </span>
                              <span className="text-[10px] font-mono font-bold">
                                {ship.arrival}
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center opacity-20">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold mb-0.5">
                                {t('port.departure')}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold ${
                                  new Date(
                                    ship.departureDate,
                                  ).toDateString() !==
                                  new Date(ship.arrivalDate).toDateString()
                                    ? 'text-orange-500'
                                    : ''
                                }`}
                              >
                                {ship.departure}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                        <div className="flex items-center gap-2.5 text-emerald-500 mb-2">
                          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {t('port.clear_now')}
                          </span>
                        </div>
                        {nextArrival && (
                          <div className="flex flex-col gap-1 pl-9 border-l border-emerald-500/10 ml-2.5 py-1">
                            <span className="text-[8px] uppercase tracking-widest opacity-50 font-bold">
                              Próxima Escala
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold">
                                {new Date(
                                  nextArrival.arrivalDate,
                                ).toLocaleDateString(language, {
                                  month: 'short',
                                  day: '2-digit',
                                })}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-emerald-500/30" />
                              <span className="text-[11px] font-mono font-bold">
                                {nextArrival.arrival}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://apram.pt/movimento-navios"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center justify-center gap-2.5 w-full p-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-navy/10 dark:shadow-white/5"
                    >
                      <span className="sr-only">APRAM Information link</span>
                      <span>APRAM Info</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {showAlerts &&
          Object.entries(groupedWarnings).map(([regionId, regionWarnings]) => {
            const worstLevel = regionWarnings.reduce((worst, w) => {
              if (w.awarenessLevelID === 'red') return 'red'
              if (w.awarenessLevelID === 'orange' && worst !== 'red')
                return 'orange'
              if (
                w.awarenessLevelID === 'yellow' &&
                worst !== 'red' &&
                worst !== 'orange'
              )
                return 'yellow'
              return worst
            }, 'green')

            return (
              <Marker
                key={`warning-${regionId}`}
                position={REGION_COORDS_OVERRIDE[regionId] || [32.7, -17.0]}
                icon={createCustomIcon('warning', worstLevel)}
              >
                <Popup>
                  <div className="p-6 pr-10 min-w-[280px] max-w-[320px] text-brand-navy dark:text-white">
                    <div className="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-2">
                      <h3 className="font-bold text-xs uppercase tracking-widest">
                        {getRegionName(regionId)}
                      </h3>
                      <a
                        href={REGION_URLS[regionId]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <span className="sr-only">
                          {`Mais informações para a região ${getRegionName(regionId)}`}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-40"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {regionWarnings.map(warning => {
                        const isGreen = warning.awarenessLevelID === 'green'
                        let levelColor = 'bg-green-500'
                        if (warning.awarenessLevelID === 'red')
                          levelColor = 'bg-red-500'
                        else if (warning.awarenessLevelID === 'orange')
                          levelColor = 'bg-orange-500'
                        else if (warning.awarenessLevelID === 'yellow')
                          levelColor = 'bg-yellow-500'

                        return (
                          <div
                            key={warning.awarenessTypeName}
                            className={`flex flex-col p-2 rounded-xl border ${
                              isGreen
                                ? 'bg-green-500/[0.03] border-green-500/10'
                                : 'bg-white/[0.03] border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${levelColor} ${
                                  !isGreen ? 'animate-pulse' : ''
                                }`}
                              />
                              <span className="text-[7px] font-bold uppercase tracking-widest opacity-70 truncate">
                                {getAwarenessTranslation(
                                  warning.awarenessTypeName,
                                )}
                              </span>
                            </div>
                            {!isGreen && (
                              <div className="flex items-center gap-1 opacity-40">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="7"
                                  height="7"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span className="text-[7px] font-mono">
                                  {new Date(warning.endTime).toLocaleTimeString(
                                    [],
                                    { hour: '2-digit', minute: '2-digit' },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}

export default MapComponent
