/** @author Harry Vasanth (harryvasanth.com) */
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Anchor,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Map as MapIcon,
  XCircle,
} from 'lucide-react'
import type React from 'react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { fetchShipStatus } from '../../services/ships'

interface ShipsTabProps {
  limit?: number
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
}

// OPTIMIZATION: Moved outside component to prevent recreation
const getDurationString = (targetDate: Date, currentTime: Date): string => {
  const diffMs = targetDate.getTime() - currentTime.getTime()
  if (diffMs <= 0) return '0m'
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const getPortTheme = (isClear: boolean) => {
  if (!isClear) {
    return {
      container: 'border-brand-red/20 bg-brand-red/[0.02]',
      chevron:
        'bg-brand-red/10 border-brand-red/20 text-brand-red group-hover/header:bg-brand-red/20',
      iconBox: 'bg-brand-red text-white shadow-brand-red/20',
      innerBox: 'border-brand-red/10 bg-brand-red/[0.02]',
    }
  }
  return {
    container: 'border-green-500/20 bg-green-500/[0.02]',
    chevron:
      'bg-green-500/10 border-green-500/20 text-green-500 group-hover/header:bg-green-500/20',
    iconBox: 'bg-green-500 text-white shadow-green-500/20',
    innerBox: 'border-green-500/10 bg-green-500/[0.02]',
  }
}

const ShipsTab: React.FC<ShipsTabProps> = ({
  limit = 4,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [now, setNow] = useState<Date>(new Date())
  const { t, language } = useTranslation()

  const { data: status, isLoading } = useQuery({
    queryKey: ['ships'],
    queryFn: fetchShipStatus,
    refetchInterval: 10 * 60 * 1000,
  })

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(clockInterval)
  }, [])

  const formatDateLabel = (date: Date): string => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString())
      return t('port.today').toUpperCase()
    if (date.toDateString() === tomorrow.toDateString())
      return t('port.tomorrow').toUpperCase()

    return date
      .toLocaleDateString(language, { month: 'short', day: '2-digit' })
      .toUpperCase()
  }

  // OPTIMIZATION: Memoize ship derived state so it doesn't calculate heavily on UI collapse toggles
  const {
    isPortClearNow,
    dockedShipsCount,
    todayShipsCount,
    durationRemaining,
  } = useMemo(() => {
    if (!status) {
      return {
        isPortClearNow: true,
        dockedShipsCount: 0,
        todayShipsCount: 0,
        durationRemaining: '',
      }
    }

    const clearNow = !status.isDocked
    const dockedCount = status.ships.filter(s => s.isDockedNow).length
    const todayCount = status.ships.filter(
      s =>
        s.arrivalDate.toDateString() === now.toDateString() ||
        s.departureDate.toDateString() === now.toDateString(),
    ).length

    let nextArrivalDate: Date | null = null
    if (clearNow && status.ships.length > 0) {
      const futureShips = status.ships.filter(
        s => s.arrivalDate > now && s.terminal.includes('Terminal Sul'),
      )
      if (futureShips.length > 0) {
        nextArrivalDate = futureShips.reduce(
          (min, s) => (s.arrivalDate < min ? s.arrivalDate : min),
          futureShips[0].arrivalDate,
        )
      }
    }

    let remaining = ''
    if (clearNow && nextArrivalDate) {
      remaining = getDurationString(nextArrivalDate, now)
    } else if (!clearNow && status.nextAvailableDate) {
      remaining = getDurationString(status.nextAvailableDate, now)
    }

    return {
      isPortClearNow: clearNow,
      dockedShipsCount: dockedCount,
      todayShipsCount: todayCount,
      durationRemaining: remaining,
    }
  }, [status, now])

  if (isLoading || !status) {
    return (
      <div className="space-y-4">
        <div className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 animate-pulse bg-white/[0.02] border border-white/10 shadow-sm">
          <div className="p-2.5 md:p-3 rounded-2xl shrink-0 bg-brand-navy/10 dark:bg-white/10 w-10 h-10" />
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="h-2 w-16 bg-brand-navy/20 dark:bg-white/20 rounded-full" />
            <div className="h-3 w-32 bg-brand-navy/15 dark:bg-white/15 rounded-full" />
            <div className="h-2 w-20 bg-brand-navy/10 dark:bg-white/10 rounded-full" />
          </div>
          <div className="w-8 h-8 bg-brand-navy/10 dark:bg-white/10 rounded-full shrink-0" />
        </div>
      </div>
    )
  }

  const theme = getPortTheme(isPortClearNow)

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-controls="ships-content"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyUp={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsCollapsed(!isCollapsed)
          }
        }}
        className={`p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer hover:bg-white/10 group/header relative border ${theme.container}`}
      >
        <div
          className={`p-2.5 md:p-3 rounded-2xl shrink-0 transition-colors ${theme.iconBox}`}
        >
          {!isPortClearNow ? (
            <XCircle size={20} aria-hidden="true" />
          ) : (
            <CheckCircle size={20} aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex flex-col mb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] md:text-[9px] font-bold text-brand-red dark:text-white/60 uppercase tracking-[0.2em] leading-none">
                {t('port.name')}
              </span>
              {status.scrapedAt && (
                <>
                  <span className="w-1 h-1 rounded-full bg-brand-red/20 dark:bg-white/20" />
                  <span className="flex items-center gap-0.5 text-[7px] font-mono font-bold opacity-40 uppercase tracking-widest text-brand-navy dark:text-white">
                    <Clock size={8} aria-hidden="true" />
                    {new Date(status.scrapedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </>
              )}
            </div>
            <h2 className="font-bold text-base md:text-lg uppercase tracking-tighter leading-tight text-brand-navy dark:text-white break-words">
              {!isPortClearNow ? t('port.busy') : t('port.clear')}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded border border-white/10 opacity-80">
              <Anchor size={10} aria-hidden="true" />
              <span>
                {dockedShipsCount} {t('settings.ships')}
              </span>
            </div>
            {todayShipsCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                • {todayShipsCount} {t('port.today')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {durationRemaining && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold font-mono tracking-tight ${
                !isPortClearNow
                  ? 'bg-brand-red/10 text-brand-red shadow-sm'
                  : 'bg-green-500/10 text-green-500'
              }`}
            >
              <Clock size={10} aria-hidden="true" />
              <span>{durationRemaining}</span>
            </div>
          )}
          <div
            className={`p-1 md:p-1.5 rounded-full border transition-colors ${theme.chevron}`}
          >
            {isCollapsed ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronUp size={14} aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            id="ships-content"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Themed Inner Bounding Box for the Ship List */}
            <div
              className={`border ${theme.innerBox} rounded-2xl p-3 md:p-4 space-y-2 relative z-10 overflow-y-auto custom-scrollbar max-h-[350px] pr-2`}
            >
              {status.ships.slice(0, limit).map(ship => (
                <div
                  key={`${ship.name}-${ship.arrival}`}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    ship.isDockedNow
                      ? 'bg-brand-red/[0.05] border-brand-red/10'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Anchor
                        size={12}
                        aria-hidden="true"
                        className={`mt-0.5 shrink-0 ${
                          ship.isDockedNow ? 'text-brand-red' : 'opacity-30'
                        }`}
                      />
                      <h4 className="font-bold text-[10px] uppercase tracking-tight break-words leading-tight">
                        {ship.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0 ${
                        ship.isDockedNow
                          ? 'bg-brand-red text-white'
                          : 'bg-white/10 opacity-50'
                      }`}
                    >
                      {ship.terminal}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[8px] font-bold uppercase tracking-widest opacity-60 mt-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="opacity-40 text-[7px]">
                        {t('port.arrival')}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono tracking-normal">
                        <span className="font-mono">{ship.arrival}</span>
                        {formatDateLabel(ship.arrivalDate) && (
                          <span className="font-mono text-[7px] opacity-60 border-l border-white/20 pl-1.5">
                            {formatDateLabel(ship.arrivalDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      size={10}
                      className="opacity-20 hidden md:block"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-1 items-end text-right">
                      <span className="opacity-40 text-[7px]">
                        {t('port.departure')}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono tracking-normal">
                        {formatDateLabel(ship.departureDate) && (
                          <span className="font-mono text-[7px] opacity-60 border-r border-white/20 pr-1.5">
                            {formatDateLabel(ship.departureDate)}
                          </span>
                        )}
                        <span
                          className={`font-mono ${
                            ship.departureDate.toDateString() !==
                            ship.arrivalDate.toDateString()
                              ? 'text-orange-500'
                              : ''
                          }`}
                        >
                          {ship.departure}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 px-1 pb-1">
              <a
                href="https://apram.pt/movimento-navios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-brand-navy dark:bg-white text-white dark:text-brand-navy rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
              >
                <ExternalLink size={12} aria-hidden="true" />
                <span>APRAM</span>
              </a>
              <a
                href="https://www.marinetraffic.com/en/ais/home/centerx:-16.911/centery:32.644/zoom:16"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 text-brand-navy dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <MapIcon size={12} aria-hidden="true" />
                <span>Live Traffic</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(ShipsTab)
