/** @author Harry Vasanth (harryvasanth.com) */
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  Cloud,
  CloudOff,
  CloudRain,
  Droplets,
  Eye,
  Info,
  Leaf,
  Loader2,
  Navigation,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Tornado,
  Wind,
} from 'lucide-react'
import type React from 'react'
import { memo, useMemo } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { fetchWeather } from '../../services/weather'

const WeatherIcon = ({
  code,
  className,
}: {
  code: number
  className?: string
}) => {
  if (code === 0) return <Sun className={`${className} text-yellow-400`} />
  if (code < 40) return <Cloud className={`${className} text-gray-400`} />
  return <CloudRain className={`${className} text-blue-400`} />
}

const formatTime = (isoString: string | null | undefined) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const displayMetric = (
  val: number | null | undefined,
  unit = '',
  isDecimal = false,
) => {
  if (val === null || val === undefined) return '-'
  return `${isDecimal ? val.toFixed(1) : Math.round(val)}${unit}`
}

const WeatherCard: React.FC<{
  lat: number
  lon: number
  title: string
  municipality?: string
  isExpanded?: boolean
}> = ({ lat, lon, title, municipality, isExpanded = false }) => {
  const { t } = useTranslation()

  const {
    data: weather,
    isLoading,
    isError: error,
  } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat, lon),
    refetchInterval: 10 * 60 * 1000,
  })

  // Memoize arrays to prevent unnecessary re-creations during renders/animations
  const currentStats = useMemo(() => {
    if (!weather) return []
    const aqi = weather.airQuality.european_aqi
    const aqiColor =
      aqi === null
        ? 'text-gray-400'
        : aqi < 50
          ? 'text-green-500'
          : aqi < 100
            ? 'text-yellow-500'
            : 'text-brand-red'

    return [
      {
        id: 'wind',
        icon: Wind,
        val: displayMetric(weather.current.windSpeed),
        unit: 'km/h',
        color: 'text-blue-500',
      },
      {
        id: 'gusts',
        icon: Tornado,
        val: displayMetric(weather.current.windGusts),
        unit: 'km/h',
        color: 'text-indigo-400',
      },
      {
        id: 'aqi',
        icon: Activity,
        val: displayMetric(weather.airQuality.european_aqi),
        unit: 'AQI',
        color: aqiColor,
      },
      {
        id: 'uv',
        icon: Sun,
        val: displayMetric(weather.current.uvIndex, '', true),
        unit: 'UV',
        color: 'text-yellow-500',
      },
    ]
  }, [weather])

  const performanceStats = useMemo(() => {
    if (!weather) return []
    return [
      {
        label: t('weather.max_temp'),
        val: displayMetric(weather.daily.maxTemp, '°C'),
        icon: Thermometer,
      },
      {
        label: t('weather.min_temp'),
        val: displayMetric(weather.daily.minTemp, '°C'),
        icon: Thermometer,
      },
      {
        label: t('weather.rain_prob'),
        val: displayMetric(weather.daily.precipProb, '%'),
        icon: CloudRain,
      },
      {
        label: t('weather.precipitation'),
        val: displayMetric(weather.current.precipitation, 'mm', true),
        icon: CloudRain,
      },
      {
        label: t('weather.humidity'),
        val: displayMetric(weather.current.humidity, '%'),
        icon: Droplets,
      },
      {
        label: t('weather.cloud_cover'),
        val: displayMetric(weather.current.cloudCover, '%'),
        icon: Cloud,
      },
      {
        label: t('weather.visibility'),
        val:
          weather.current.visibility !== null
            ? displayMetric(weather.current.visibility / 1000, 'km', true)
            : '-',
        icon: Eye,
      },
    ]
  }, [weather, t])

  const allergenStats = useMemo(() => {
    if (!weather) return []
    return [
      { key: 'pm25', label: 'PM2.5', val: weather.airQuality.pm2_5 },
      { key: 'pm10', label: 'PM10', val: weather.airQuality.pm10 },
      { key: 'dust', label: t('weather.dust'), val: weather.airQuality.dust },
      {
        key: 'grass',
        label: t('weather.grass'),
        val: weather.airQuality.grass_pollen,
      },
      {
        key: 'olive',
        label: t('weather.olive'),
        val: weather.airQuality.olive_pollen,
      },
      {
        key: 'birch',
        label: t('weather.birch'),
        val: weather.airQuality.birch_pollen,
      },
      {
        key: 'mugwort',
        label: t('weather.mugwort'),
        val: weather.airQuality.mugwort_pollen,
      },
      {
        key: 'alder',
        label: t('weather.alder'),
        val: weather.airQuality.alder_pollen,
      },
      {
        key: 'ragweed',
        label: t('weather.ragweed'),
        val: weather.airQuality.ragweed_pollen,
      },
    ]
  }, [weather, t])

  if (isLoading && !weather) {
    return (
      <div className="p-5 md:p-6 glass rounded-[2rem] shadow-xl min-h-[14rem] w-full flex flex-col items-center justify-center gap-3 bg-white/40 dark:bg-slate-900/40 transition-colors duration-500">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin opacity-80" />
        <div className="text-center">
          <h3 className="text-[11px] md:text-xs font-bold text-brand-red uppercase tracking-widest leading-tight opacity-90">
            {title}
          </h3>
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-navy dark:text-white opacity-50 mt-1 animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="p-5 md:p-6 glass rounded-[2rem] shadow-xl min-h-[14rem] w-full flex flex-col items-center justify-center gap-3 bg-brand-red/5 border border-brand-red/20 transition-colors duration-500">
        <CloudOff className="w-8 h-8 text-brand-red opacity-60" />
        <div className="text-center">
          <h3 className="text-[11px] md:text-xs font-bold text-brand-red uppercase tracking-widest leading-tight opacity-90">
            {title}
          </h3>
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-navy dark:text-white opacity-50 mt-1">
            {t('weather.service_unavailable')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={`p-5 md:p-6 glass rounded-[2rem] shadow-xl transition-colors duration-500 cursor-pointer hover:bg-white/10 group relative overflow-hidden flex flex-col h-fit self-start w-full ${
        isExpanded
          ? 'border-brand-red/30 shadow-2xl bg-white/5 dark:bg-black/20'
          : 'bg-white/40 dark:bg-slate-900/40'
      }`}
    >
      {weather.isBackup && (
        <div className="absolute top-4 right-5 flex items-center gap-1 opacity-40 text-brand-navy dark:text-white">
          <Info size={10} />
          <span className="text-[8px] font-bold uppercase tracking-widest">
            Backup
          </span>
        </div>
      )}

      <motion.div
        layout="position"
        className="flex flex-col relative z-10 flex-1 w-full gap-4 mt-2"
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col flex-1 pr-2 min-w-0">
            <h3 className="text-[11px] md:text-xs font-bold text-brand-red uppercase tracking-widest break-words leading-tight opacity-90">
              {title}
            </h3>
            {municipality && (
              <span className="text-[9px] md:text-[10px] font-bold uppercase opacity-50 tracking-tight break-words mt-0.5">
                {municipality}
              </span>
            )}
            <div className="flex flex-col mt-2">
              <div className="text-4xl md:text-5xl font-bold text-brand-navy dark:text-white tracking-tighter flex items-baseline">
                {displayMetric(weather.current.temp)}
                <span className="text-xl md:text-2xl font-semibold ml-1 opacity-40">
                  °C
                </span>
              </div>
              <div className="text-[9px] md:text-[10px] font-bold text-brand-navy/60 dark:text-white/60 uppercase tracking-widest mt-1">
                {t('weather.apparent_temp')}{' '}
                {displayMetric(weather.current.apparentTemp, '°C')}
              </div>
            </div>
          </div>
          <div className="p-3 md:p-4 bg-white/10 dark:bg-white/5 rounded-2xl border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0">
            <WeatherIcon
              code={weather.current.weatherCode}
              className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-auto w-full">
          {currentStats.map(stat => (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center p-2 bg-white/20 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5"
            >
              <stat.icon className={`w-4 h-4 mb-1 ${stat.color}`} />
              <span className="text-[11px] font-bold text-brand-navy dark:text-white font-mono leading-none">
                {stat.val}
              </span>
              <span className="text-[7px] font-bold uppercase opacity-50 mt-0.5 tracking-wider">
                {stat.unit}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden relative z-10 w-full"
          >
            <div className="pt-4 border-t border-brand-navy/10 dark:border-white/10 space-y-4">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-brand-red opacity-80 mb-2 block">
                  {t('weather.performance')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {performanceStats.map(item => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-1 p-2 bg-white/30 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 flex-1 min-w-[30%] sm:min-w-[20%]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[7px] font-bold uppercase opacity-60 tracking-widest truncate">
                          {item.label}
                        </span>
                        <item.icon
                          size={10}
                          className="text-brand-navy/50 dark:text-white/50 shrink-0"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-brand-navy dark:text-white font-mono">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white/30 dark:bg-white/5 rounded-2xl border border-white/10 dark:border-white/5">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
                  <Leaf size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    {t('weather.allergens')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergenStats.map(p => (
                    <div
                      key={p.key}
                      className="flex flex-col text-center bg-white/20 dark:bg-black/20 rounded-lg py-1.5 px-1 flex-1 min-w-[22%] sm:min-w-[10%]"
                    >
                      <span className="text-[7px] font-bold uppercase opacity-60 tracking-tighter mb-0.5 truncate">
                        {p.label}
                      </span>
                      <span className="text-[9px] font-bold text-brand-navy dark:text-white font-mono">
                        {p.val !== null ? p.val : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-xl border border-orange-500/20 flex-1 justify-center">
                  <Sunrise className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-white font-mono">
                    {formatTime(weather.daily.sunrise)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-1 justify-center">
                  <Navigation
                    size={12}
                    className="text-blue-500"
                    style={{
                      transform: `rotate(${weather.current.windDirection ?? 0}deg)`,
                    }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-white font-mono">
                    {weather.current.windDirection !== null
                      ? `${weather.current.windDirection}°`
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-xl border border-orange-500/20 flex-1 justify-center">
                  <Sunset className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy dark:text-white font-mono">
                    {formatTime(weather.daily.sunset)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(WeatherCard)
