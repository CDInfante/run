/** @author Harry Vasanth (harryvasanth.com) */
import { CloudSun } from 'lucide-react'
import type React from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { Location } from '../../types'
import ShipsTab from '../ui/ShipsTab'
import TrailsCard from '../ui/TrailsCard'
import WeatherCard from '../ui/WeatherCard'
import WeatherWarnings from '../ui/WeatherWarnings'

interface DashboardSectionProps {
  numShips: number
  activeWeatherLocations: Location[]
  expandedCard: string | null
  setExpandedCard: (val: string | null) => void
  setIsSettingsOpen: (val: boolean) => void
  isShipsCollapsed: boolean
  setIsShipsCollapsed: (val: boolean) => void
  isWeatherCollapsed: boolean
  setIsWeatherCollapsed: (val: boolean) => void
  isTrailsCollapsed: boolean
  setIsTrailsCollapsed: (val: boolean) => void
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  numShips,
  activeWeatherLocations,
  expandedCard,
  setExpandedCard,
  setIsSettingsOpen,
  isShipsCollapsed,
  setIsShipsCollapsed,
  isWeatherCollapsed,
  setIsWeatherCollapsed,
  isTrailsCollapsed,
  setIsTrailsCollapsed,
}) => {
  const { t } = useTranslation()

  return (
    <div
      id="dashboard"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-24"
    >
      {/* Left Column: Ships & Alerts */}
      <div className="lg:col-span-4 space-y-6">
        <ShipsTab
          limit={numShips}
          isCollapsed={isShipsCollapsed}
          setIsCollapsed={setIsShipsCollapsed}
        />

        <WeatherWarnings
          isCollapsed={isWeatherCollapsed}
          setIsCollapsed={setIsWeatherCollapsed}
        />

        <TrailsCard
          isCollapsed={isTrailsCollapsed}
          setIsCollapsed={setIsTrailsCollapsed}
        />
      </div>

      {/* Right Column: Weather */}
      <div id="weather" className="lg:col-span-8 space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-brand-navy dark:text-white">
            <CloudSun size={18} className="text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest">
              {t('weather.regional')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="text-[8px] font-bold uppercase tracking-widest bg-white/5 hover:bg-brand-red hover:text-white px-3 py-1.5 rounded-full transition-all border border-white/10"
          >
            + {t('settings.add_location')}
          </button>
        </div>

        {/* FIX: Removed auto-rows-fr and grid-flow-dense, added items-start */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start transition-all duration-500 ease-in-out">
          {activeWeatherLocations.map(loc => (
            <div
              key={loc.name}
              /* FIX: Changed wrapper to h-fit, and expanded cards use col-span-full */
              className={`transition-all duration-500 ease-in-out cursor-pointer h-fit ${
                expandedCard === loc.name
                  ? 'md:col-span-full xl:col-span-full'
                  : 'col-span-1'
              }`}
              onClick={() =>
                setExpandedCard(expandedCard === loc.name ? null : loc.name)
              }
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setExpandedCard(expandedCard === loc.name ? null : loc.name)
                }
              }}
            >
              <WeatherCard
                lat={loc.latitude}
                lon={loc.longitude}
                title={loc.name}
                municipality={loc.municipality}
                isExpanded={expandedCard === loc.name}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardSection
