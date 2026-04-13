// run-cdinfante/src/components/ui/MarineCard.tsx
/** @author Harry Vasanth (harryvasanth.com) */
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Droplets,
  Info,
  Navigation,
  Waves,
  Wind,
} from 'lucide-react'
import type React from 'react'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { getDirection } from '../../lib/utils'
import type { MarineLocationData } from '../../services/marine'
import { fetchMarineData } from '../../services/marine'

interface MarineCardProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
}

const MarineCard: React.FC<MarineCardProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const { t } = useTranslation()
  const [selectedLoc, setSelectedLoc] = useState<MarineLocationData | null>(
    null,
  )

  const { data: marineData, isLoading } = useQuery({
    queryKey: ['marine'],
    queryFn: fetchMarineData,
    refetchInterval: 10 * 60 * 1000,
  })

  const locations = marineData?.locations || []

  const groupedLocations = useMemo(() => {
    return {
      Madeira: locations.filter(l => l.island === 'Madeira'),
      'Porto Santo': locations.filter(l => l.island === 'Porto Santo'),
      Desertas: locations.filter(l => l.island === 'Desertas'),
    }
  }, [locations])

  if (isLoading || !marineData) {
    return (
      <div className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 animate-pulse bg-blue-500/5 dark:bg-blue-900/20 shadow-sm border border-blue-500/10">
        <div className="p-2.5 md:p-3 rounded-2xl shrink-0 bg-blue-500/20 w-10 h-10" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-3 w-28 bg-blue-500/20 rounded-full" />
          <div className="h-2 w-40 bg-blue-500/10 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Toggle */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsCollapsed(!isCollapsed)
          }
        }}
        className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer hover:bg-white/10 group relative border border-blue-500/20 bg-blue-500/[0.02]"
      >
        <div className="p-2.5 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
          <Waves size={20} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-sm md:text-base uppercase tracking-widest leading-tight text-brand-navy dark:text-white break-words">
            {t('marine.title', 'Sea Conditions')}
          </h3>
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-50 mt-0.5 break-words flex items-center gap-1.5">
            MADEIRA & PORTO SANTO
            {marineData.meta.scraped_at && (
              <>
                <span className="w-1 h-1 rounded-full bg-brand-navy/20 dark:bg-white/20" />
                <span className="flex items-center gap-0.5 opacity-70 font-mono text-[7px] text-brand-navy dark:text-white">
                  <Clock size={8} aria-hidden="true" />
                  {new Date(marineData.meta.scraped_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 md:p-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            {isCollapsed ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronUp size={14} aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Pill Grid Selection */}
            <div className="bg-white/[0.03] border border-blue-500/10 rounded-2xl p-4 space-y-4 relative z-10 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
              {(['Madeira', 'Porto Santo', 'Desertas'] as const).map(island => {
                const islandLocs = groupedLocations[island]
                if (!islandLocs || islandLocs.length === 0) return null

                return (
                  <div key={island} className="space-y-2">
                    <h4 className="text-[8px] font-bold uppercase tracking-widest opacity-40 px-1 text-blue-500">
                      {island}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {islandLocs.map(loc => (
                        <button
                          type="button"
                          key={loc.id}
                          onClick={() =>
                            setSelectedLoc(
                              selectedLoc?.id === loc.id ? null : loc,
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                            selectedLoc?.id === loc.id
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                              : 'bg-white/5 border border-blue-500/10 text-brand-navy dark:text-white hover:bg-blue-500/10'
                          }`}
                        >
                          {loc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Location Detailed Metrics */}
            <div className="bg-blue-500/[0.03] border border-blue-500/10 rounded-2xl p-4 relative z-10 min-h-[100px]">
              {selectedLoc ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center border-b border-blue-500/10 pb-3">
                    <h4 className="text-sm font-bold text-brand-navy dark:text-white leading-tight uppercase tracking-widest">
                      {selectedLoc.name}
                    </h4>
                  </div>

                  {/* Primary Metrics (Temp & Main Wave Height) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-brand-red/10">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-red opacity-90">
                        <Droplets size={12} />{' '}
                        {t('marine.sea_temp', 'Sea Temp')}
                      </span>
                      <span className="text-lg font-mono font-bold text-brand-navy dark:text-white">
                        {selectedLoc.ocean_temperature
                          ? `${selectedLoc.ocean_temperature.toFixed(1)}°C`
                          : '--'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-blue-500/10">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-500 opacity-90">
                        <Waves size={12} />{' '}
                        {t('marine.wave_height', 'Main Waves')}
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-mono font-bold text-brand-navy dark:text-white leading-none">
                          {selectedLoc.wave_height
                            ? `${selectedLoc.wave_height.toFixed(1)}m`
                            : '--'}
                        </span>
                        <span className="text-[10px] font-mono opacity-60 mb-0.5">
                          {getDirection(selectedLoc.wave_direction)} •{' '}
                          {selectedLoc.wave_period
                            ? `${selectedLoc.wave_period.toFixed(1)}s`
                            : '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Metrics (Swell vs Wind Waves vs Currents) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Swell Waves */}
                    <div className="flex flex-col gap-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-emerald-500 opacity-80">
                        <Activity size={10} /> {t('marine.swell', 'Swell')}
                      </span>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="opacity-80">
                          {selectedLoc.swell_wave_height
                            ? `${selectedLoc.swell_wave_height.toFixed(1)}m`
                            : '--'}
                        </span>
                        <span className="opacity-40">
                          {selectedLoc.swell_wave_period
                            ? `${selectedLoc.swell_wave_period.toFixed(1)}s`
                            : '--'}
                        </span>
                        <span className="flex items-center gap-0.5 opacity-60">
                          <Compass size={10} />{' '}
                          {getDirection(selectedLoc.swell_wave_direction)}
                        </span>
                      </div>
                    </div>

                    {/* Wind Waves */}
                    <div className="flex flex-col gap-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-cyan-500 opacity-80">
                        <Wind size={10} /> {t('marine.wind_waves', 'Wind Chop')}
                      </span>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="opacity-80">
                          {selectedLoc.wind_wave_height
                            ? `${selectedLoc.wind_wave_height.toFixed(1)}m`
                            : '--'}
                        </span>
                        <span className="opacity-40">
                          {selectedLoc.wind_wave_period
                            ? `${selectedLoc.wind_wave_period.toFixed(1)}s`
                            : '--'}
                        </span>
                        <span className="flex items-center gap-0.5 opacity-60">
                          <Compass size={10} />{' '}
                          {getDirection(selectedLoc.wind_wave_direction)}
                        </span>
                      </div>
                    </div>

                    {/* Ocean Currents */}
                    <div className="flex flex-col gap-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
                      <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-violet-500 opacity-80">
                        <Navigation size={10} />{' '}
                        {t('marine.currents', 'Currents')}
                      </span>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="opacity-80">
                          {selectedLoc.ocean_current_velocity
                            ? `${selectedLoc.ocean_current_velocity.toFixed(2)} km/h`
                            : '--'}
                        </span>
                        <span className="flex items-center gap-0.5 opacity-60">
                          <Compass size={10} />{' '}
                          {getDirection(selectedLoc.ocean_current_direction)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] opacity-40 uppercase tracking-widest flex items-center justify-center h-full gap-2 italic py-6">
                  <Info size={12} aria-hidden="true" />
                  {t(
                    'marine.select_instruction',
                    'Select a location to view metrics',
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(MarineCard)
