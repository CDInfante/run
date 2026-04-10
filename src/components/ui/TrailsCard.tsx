/** @author Harry Vasanth (harryvasanth.com) */
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Info,
  Mountain,
} from 'lucide-react'
import type React from 'react'
import { memo, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { fetchTrails } from '../../services/trails'
import type { Trail } from '../../types'

interface TrailsCardProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
}

const TrailsCard: React.FC<TrailsCardProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const { t } = useTranslation()
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null)

  const { data: trailsData, isLoading } = useQuery({
    queryKey: ['trails'],
    queryFn: fetchTrails,
    refetchInterval: 10 * 60 * 1000,
  })

  const trails = trailsData?.trails || []

  if (isLoading) {
    return (
      <div className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 animate-pulse bg-white/5 dark:bg-slate-900/40 shadow-sm">
        <div className="p-2.5 md:p-3 rounded-2xl shrink-0 bg-brand-navy/10 dark:bg-white/10 w-10 h-10" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-3 w-28 bg-brand-navy/20 dark:bg-white/20 rounded-full" />
          <div className="h-2 w-40 bg-brand-navy/10 dark:bg-white/10 rounded-full" />
        </div>
        <div className="flex gap-1.5 shrink-0">
          <div className="w-10 h-6 bg-brand-navy/10 dark:bg-white/10 rounded-full" />
          <div className="w-6 h-6 bg-brand-navy/10 dark:bg-white/10 rounded-full" />
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    if (status === 'Aberto') return 'bg-emerald-500'
    if (status === 'Encerrado') return 'bg-red-500'
    return 'bg-orange-500'
  }

  const openTrails = trails.filter(t => t.status === 'Aberto').length
  const closedTrails = trails.filter(t => t.status === 'Encerrado').length
  const warningTrails = trails.length - openTrails - closedTrails

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-controls="trails-content"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsCollapsed(!isCollapsed)
          }
        }}
        className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer hover:bg-white/10 group relative"
      >
        <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 shrink-0">
          <Mountain size={20} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-sm md:text-base uppercase tracking-widest leading-tight text-brand-navy dark:text-white break-words">
            {t('nav.trails')}
          </h3>
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-50 mt-0.5 break-words flex items-center gap-1.5">
            MADEIRA & PORTO SANTO
            {trailsData?.meta?.scraped_at && (
              <>
                <span className="w-1 h-1 rounded-full bg-brand-navy/20 dark:bg-white/20" />
                <span className="flex items-center gap-0.5 opacity-70 font-mono text-[7px] text-brand-navy dark:text-white">
                  <Clock size={8} aria-hidden="true" />
                  {new Date(trailsData.meta.scraped_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {trails.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div
                className="flex items-center gap-1"
                aria-label={`${openTrails} open trails`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[9px] md:text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {openTrails}
                </span>
              </div>
              {(closedTrails > 0 || warningTrails > 0) && (
                <div className="w-px h-3 bg-white/10" />
              )}
              {warningTrails > 0 && (
                <div
                  className="flex items-center gap-1"
                  aria-label={`${warningTrails} trails with warnings`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-[9px] md:text-[10px] font-bold font-mono text-orange-600 dark:text-orange-400">
                    {warningTrails}
                  </span>
                </div>
              )}
              {closedTrails > 0 && (
                <div
                  className="flex items-center gap-1"
                  aria-label={`${closedTrails} closed trails`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[9px] md:text-[10px] font-bold font-mono text-red-600 dark:text-red-400">
                    {closedTrails}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="p-1 md:p-1.5 bg-white/5 rounded-full border border-white/10 group-hover:bg-white/10 transition-colors">
            {isCollapsed ? (
              <ChevronDown
                size={14}
                className="opacity-60"
                aria-hidden="true"
              />
            ) : (
              <ChevronUp size={14} className="opacity-60" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            id="trails-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-4 relative z-10 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
              {['Madeira', 'Porto Santo'].map(island => {
                const islandTrails = trails.filter(t => t.island === island)
                if (islandTrails.length === 0) return null

                return (
                  <div key={island} className="space-y-2">
                    <h4 className="text-[8px] font-bold uppercase tracking-widest opacity-40 px-1">
                      {island}
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 xl:grid-cols-7 gap-2">
                      {islandTrails.map(trail => (
                        <button
                          type="button"
                          key={`${trail.island}-${trail.pr}-${trail.id}`}
                          onClick={() =>
                            setSelectedTrail(
                              selectedTrail?.id === trail.id ? null : trail,
                            )
                          }
                          className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${getStatusColor(
                            trail.status,
                          )} text-white shadow-lg shadow-black/10 hover:scale-110 active:scale-95 ${
                            selectedTrail?.id === trail.id
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-navy/20 scale-110 z-20'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                          title={`${trail.pr} - ${trail.id}`}
                          aria-label={`Trail ${trail.pr}: ${trail.id}`}
                        >
                          {trail.pr}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 relative z-10 min-h-[100px]">
              {selectedTrail ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-brand-navy dark:text-white leading-tight">
                        PR{selectedTrail.pr} - {selectedTrail.id}
                      </h4>
                      <p className="text-[10px] opacity-60 uppercase tracking-wider mt-1 font-mono">
                        {selectedTrail.distance} •{' '}
                        {selectedTrail.status.toUpperCase()}
                      </p>
                    </div>
                    <a
                      href="https://ifcn.madeira.gov.pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group/link"
                      aria-label="More info from IFCN"
                    >
                      <ExternalLink
                        size={14}
                        className="opacity-40 group-hover/link:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                  {selectedTrail.description && (
                    <p className="text-[11px] leading-relaxed opacity-70 italic line-clamp-3">
                      {selectedTrail.description}
                    </p>
                  )}
                  {selectedTrail.additional_status && (
                    <div className="flex gap-2 items-start bg-white/5 p-2 rounded-xl">
                      <Info
                        size={12}
                        className="mt-0.5 shrink-0 opacity-40"
                        aria-hidden="true"
                      />
                      <p className="text-[10px] leading-tight opacity-60">
                        {selectedTrail.additional_status}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] opacity-40 uppercase tracking-widest flex items-center justify-center h-full gap-2 italic">
                  <Info size={12} aria-hidden="true" />
                  {t('map.instructions')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(TrailsCard)
