import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import MarkerClusterGroup from "react-leaflet-cluster";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { WeatherWarning } from "../../types";

import { fetchAmenities } from "../../services/amenities";
import {
  fetchWeatherWarnings,
  REGION_URLS,
  IPMA_REGIONS,
} from "../../services/ipma";
import { fetchShipStatus } from "../../services/ships";
import { fetchTrails } from "../../services/trails";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Droplet,
  Toilet as Toilet,
  AlertTriangle,
  Check,
  Navigation,
  ExternalLink,
  Mountain,
  Clock,
  Anchor,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { renderToString } from "react-dom/server";

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
`;

const REGION_COORDS_OVERRIDE: Record<string, [number, number]> = {
  MCN: [32.8, -16.9],
  MRM: [32.75, -17.0],
  MCS: [32.65, -16.9],
  MPS: [33.06, -16.33],
};

const FUNCHAL_PORT_COORDS: [number, number] = [32.6432113, -16.9148545];

// Factory to dynamically generate cluster icons based on the passed color class
const getClusterIcon = (colorClass: string) => {
  return function (cluster: any) {
    const count = cluster.getChildCount();
    const html = renderToString(
      <div
        className={`flex items-center justify-center w-11 h-11 ${colorClass} text-white rounded-[1rem] shadow-xl border border-white/30 font-bold text-sm backdrop-blur-md transition-transform hover:scale-110`}
      >
        {count}
      </div>,
    );

    return L.divIcon({
      html: html,
      className: "custom-marker-cluster",
      iconSize: L.point(44, 44, true),
    });
  };
};

const createCustomIcon = (
  type: "fountain" | "toilet" | "warning" | "trail" | "port",
  level?: string,
) => {
  let color = "#3b82f6"; // Blue for fountains
  let IconComponent = AlertTriangle;
  let shouldPulse = false;

  if (type === "toilet") color = "#8b5cf6"; // Violet for toilets
  if (type === "trail") {
    if (level === "Aberto")
      color = "#10b981"; // Emerald for open trails
    else if (level === "Encerrado") color = "#ef4444";
    else color = "#f97316";
  }

  if (type === "port") {
    if (level === "busy") {
      color = "#b6171e";
      shouldPulse = true;
    } else {
      color = "#10b981";
      shouldPulse = false;
    }
    IconComponent = Anchor;
  }

  if (type === "warning") {
    switch (level) {
      case "yellow":
        color = "#eab308";
        shouldPulse = true;
        break;
      case "orange":
        color = "#f97316";
        shouldPulse = true;
        break;
      case "red":
        color = "#dc2626";
        shouldPulse = true;
        break;
      default:
        color = "#22c55e";
        IconComponent = Check;
        shouldPulse = false;
    }
  }

  const isWarning = type === "warning" || type === "port";
  const size = isWarning ? 40 : 32;

  const iconMarkup = renderToString(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        color: "white",
        backgroundColor: color,
        borderRadius: "40% 40% 40% 0",
        transform: "rotate(-45deg)",
        border: "2px solid white",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        opacity: isWarning ? 1 : 0.8, // 80% opacity for normal markers
      }}
    >
      <div style={{ transform: "rotate(45deg)", display: "flex" }}>
        {type === "fountain" && <Droplet size={18} strokeWidth={3} />}
        {type === "toilet" && <Toilet size={18} strokeWidth={3} />}
        {type === "trail" && <Mountain size={18} strokeWidth={3} />}
        {type === "port" && (
          <Anchor
            size={18}
            strokeWidth={3}
            className={shouldPulse ? "animate-pulse" : ""}
          />
        )}
        {type === "warning" && (
          <IconComponent
            size={18}
            strokeWidth={3}
            className={shouldPulse ? "animate-pulse" : ""}
          />
        )}
      </div>
    </div>,
  );

  return L.divIcon({
    html: iconMarkup,
    className: "custom-leaflet-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const MapBounds = () => {
  const map = useMap();
  useEffect(() => {
    const bounds: L.LatLngBoundsExpression = [
      [32.3, -17.4],
      [33.2, -16.1],
    ];
    map.setMaxBounds(bounds);
    map.setMinZoom(9);
  }, [map]);
  return null;
};

const userLocationIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-40"></div>
    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
  </div>`,
  className: "user-location-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const LocationMarker = ({
  setUserLocation,
}: {
  setUserLocation: (pos: L.LatLng) => void;
}) => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 });
    map.on("locationfound", (e) => {
      setPosition(e.latlng);
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, 14);
    });
    map.on("locationerror", () => console.warn("Location access denied."));
  }, [map, setUserLocation]);

  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon} zIndexOffset={1000}>
      <Popup>
        <div className="p-4 text-center font-bold text-xs uppercase tracking-widest">
          {t("map.user_location")}
        </div>
      </Popup>
    </Marker>
  );
};

interface MapProps {
  showWater: boolean;
  showToilets: boolean;
  showAlerts: boolean;
  showTrails: boolean;
}

const Map: React.FC<MapProps> = ({
  showWater,
  showToilets,
  showAlerts,
  showTrails,
}) => {
  const { t, language } = useTranslation();
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const { data: amenities = [], isFetching: isFetchingAmenities } = useQuery({
    queryKey: ["amenities"],
    queryFn: fetchAmenities,
  });
  const { data: warnings = [], isFetching: isFetchingWarnings } = useQuery({
    queryKey: ["warnings"],
    queryFn: fetchWeatherWarnings,
  });
  const { data: trailsData, isFetching: isFetchingTrails } = useQuery({
    queryKey: ["trails"],
    queryFn: fetchTrails,
  });
  const { data: portStatus, isFetching: isFetchingShips } = useQuery({
    queryKey: ["ships"],
    queryFn: fetchShipStatus,
  });

  const trails = trailsData?.trails || [];
  const isSyncing =
    isFetchingAmenities ||
    isFetchingWarnings ||
    isFetchingTrails ||
    isFetchingShips;

  // Pre-filter amenities by type to give them distinct cluster colors
  const waterAmenities = useMemo(
    () => (showWater ? amenities.filter((a) => a.type === "fountain") : []),
    [amenities, showWater],
  );
  const toiletAmenities = useMemo(
    () => (showToilets ? amenities.filter((a) => a.type === "toilet") : []),
    [amenities, showToilets],
  );

  const tileLayerUrl =
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const getRegionName = (id: string) => {
    switch (id) {
      case IPMA_REGIONS.NORTH_COAST:
        return t("weather.north_coast");
      case IPMA_REGIONS.MOUNTAIN_REGIONS:
        return t("weather.mountain_regions");
      case IPMA_REGIONS.SOUTH_COAST:
        return t("weather.south_coast");
      case IPMA_REGIONS.PORTO_SANTO:
        return t("weather.porto_santo");
      default:
        return id;
    }
  };

  const getAwarenessTranslation = (type: string) => {
    switch (type) {
      case "Agitação Marítima":
        return t("weather.awareness.maritime");
      case "Nevoeiro":
        return t("weather.awareness.fog");
      case "Tempo Frio":
        return t("weather.awareness.cold");
      case "Tempo Quente":
        return t("weather.awareness.hot");
      case "Precipitação":
        return t("weather.awareness.rain");
      case "Neve":
        return t("weather.awareness.snow");
      case "Trovoada":
        return t("weather.awareness.thunder");
      case "Vento":
        return t("weather.awareness.wind");
      default:
        return type;
    }
  };

  const groupedWarnings = useMemo(() => {
    return warnings.reduce(
      (acc, warning) => {
        if (!acc[warning.idAreaAviso]) acc[warning.idAreaAviso] = [];
        acc[warning.idAreaAviso].push(warning);
        return acc;
      },
      {} as Record<string, WeatherWarning[]>,
    );
  }, [warnings]);

  const dockedShips = portStatus?.ships.filter((s) => s.isDockedNow) || [];
  const nextArrival =
    !portStatus?.isDocked && portStatus?.ships?.length
      ? portStatus.ships.find(
          (s) =>
            new Date(s.arrivalDate) > new Date() &&
            s.terminal.includes("Terminal Sul"),
        )
      : null;

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
          onClick={() => {
            if (userLocation && mapInstance)
              mapInstance.flyTo(userLocation, 16);
            else if (mapInstance)
              mapInstance.locate({ setView: true, maxZoom: 16 });
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
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer attribution="&copy; CARTO" url={tileLayerUrl} />
        <MapBounds />
        <LocationMarker setUserLocation={setUserLocation} />

        {/* BLUE WATER CLUSTERS */}
        {waterAmenities.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={getClusterIcon("bg-blue-500/80")}
            maxClusterRadius={60}
          >
            {waterAmenities.map((amenity) => (
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
            iconCreateFunction={getClusterIcon("bg-violet-500/80")}
            maxClusterRadius={60}
          >
            {toiletAmenities.map((amenity) => (
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
            iconCreateFunction={getClusterIcon("bg-emerald-500/80")}
            maxClusterRadius={40}
          >
            {trails.map((trail) => (
              <Marker
                key={`trail-${trail.id}`}
                position={[trail.coordinates.lat, trail.coordinates.lon]}
                icon={createCustomIcon("trail", trail.status)}
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
                        <span className="opacity-50">Status:</span>{" "}
                        <span
                          className={
                            trail.status === "Aberto"
                              ? "text-emerald-500"
                              : trail.status === "Encerrado"
                                ? "text-red-500"
                                : "text-orange-500"
                          }
                        >
                          {trail.status}
                        </span>
                      </p>
                      <p className="text-[10px] uppercase tracking-wider">
                        <span className="opacity-50">Dist:</span>{" "}
                        {trail.distance}
                      </p>
                      <a
                        href="https://ifcn.madeira.gov.pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 mt-4 p-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        <ExternalLink size={10} />
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
              "port",
              portStatus.isDocked ? "busy" : "clear",
            )}
          >
            <Popup>
              <div className="p-6 min-w-[280px] max-w-[320px] text-brand-navy dark:text-white">
                <div className="flex items-center justify-between gap-4 mb-4 border-b border-brand-navy/5 dark:border-white/5 pb-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-bold text-sm uppercase tracking-tight truncate">
                      {t("port.name")}
                    </h3>
                    <div
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${portStatus.isDocked ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
                    >
                      <Anchor
                        size={12}
                        className="text-brand-white animate-pulse"
                      />
                      {portStatus.isDocked ? t("port.busy") : t("port.clear")}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2.5">
                    {dockedShips.length > 0 ? (
                      dockedShips.map((ship, idx) => (
                        <div
                          key={idx}
                          className="group/ship flex flex-col p-3 rounded-2xl border border-brand-navy/5 dark:border-white/5 bg-brand-navy/[0.02] dark:bg-white/[0.02] hover:bg-brand-navy/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 bg-brand-red/10 rounded-lg">
                                <Anchor size={12} className="text-brand-red" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wide truncate">
                                {ship.name}
                              </span>
                            </div>
                            <span className="flex-shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-lg bg-brand-navy/5 dark:bg-white/10 uppercase tracking-widest opacity-60">
                              {ship.terminal.split("-").pop()?.trim()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                              <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold mb-0.5">
                                Arrival
                              </span>
                              <span className="text-[10px] font-mono font-bold">
                                {ship.arrival}
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center opacity-20">
                              <ArrowRight size={10} />
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold mb-0.5">
                                Departure
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold ${new Date(ship.departureDate).toDateString() !== new Date(ship.arrivalDate).toDateString() ? "text-orange-500" : ""}`}
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
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {t("port.clear_now")}
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
                                  month: "short",
                                  day: "2-digit",
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
                      <span>APRAM Info</span>
                      <ExternalLink
                        size={12}
                        className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                      />
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
              if (w.awarenessLevelID === "red") return "red";
              if (w.awarenessLevelID === "orange" && worst !== "red")
                return "orange";
              if (
                w.awarenessLevelID === "yellow" &&
                worst !== "red" &&
                worst !== "orange"
              )
                return "yellow";
              return worst;
            }, "green");

            return (
              <Marker
                key={`warning-${regionId}`}
                position={REGION_COORDS_OVERRIDE[regionId] || [32.7, -17.0]}
                icon={createCustomIcon("warning", worstLevel)}
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
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} className="opacity-40" />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {regionWarnings.map((warning, index) => {
                        const isGreen = warning.awarenessLevelID === "green";
                        let levelColor = "bg-green-500";
                        if (warning.awarenessLevelID === "red")
                          levelColor = "bg-red-500";
                        else if (warning.awarenessLevelID === "orange")
                          levelColor = "bg-orange-500";
                        else if (warning.awarenessLevelID === "yellow")
                          levelColor = "bg-yellow-500";

                        return (
                          <div
                            key={index}
                            className={`flex flex-col p-2 rounded-xl border ${isGreen ? "bg-green-500/[0.03] border-green-500/10" : "bg-white/[0.03] border-white/10"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${levelColor} ${!isGreen ? "animate-pulse" : ""}`}
                              />
                              <span className="text-[7px] font-bold uppercase tracking-widest opacity-70 truncate">
                                {getAwarenessTranslation(
                                  warning.awarenessTypeName,
                                )}
                              </span>
                            </div>
                            {!isGreen && (
                              <div className="flex items-center gap-1 opacity-40">
                                <Clock size={7} />
                                <span className="text-[7px] font-mono">
                                  {new Date(warning.endTime).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default Map;
