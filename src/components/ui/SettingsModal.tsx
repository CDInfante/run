/** @author Harry Vasanth (harryvasanth.com) */
import { Check, Plus, RefreshCw, Search, X } from 'lucide-react'
import type React from 'react'
import { useMemo, useState } from 'react'
import locationsData from '../../content/locations.json'
import { useTranslation } from '../../hooks/useTranslation'
import type { Location } from '../../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  visibleLocationNames: string[]
  toggleLocation: (name: string) => void
  numShips: number
  setNumShips: (num: number) => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  visibleLocationNames,
  toggleLocation,
  numShips,
  setNumShips,
}) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLocations = useMemo(() => {
    return (locationsData as Location[]).filter(
      loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.municipality.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        onKeyUp={e => {
          if (e.key === 'Enter' || e.key === 'Escape') onClose()
        }}
      />
      <div className="glass-heavy w-full max-w-lg p-6 md:p-8 rounded-[2.5rem] relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              {t('settings.title')}
            </h2>
            <div className="h-1 w-12 bg-brand-red mt-1 rounded-full" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-brand-red hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all text-xs font-bold uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              {t('settings.reset')}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase opacity-50 tracking-widest">
                {t('settings.weather_locations')}
              </h3>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                  size={14}
                />
                <input
                  type="text"
                  placeholder={t('settings.search')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-brand-red/50 w-32 md:w-48 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {filteredLocations.map(loc => (
                <button
                  type="button"
                  key={loc.name}
                  onClick={() => toggleLocation(loc.name)}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    visibleLocationNames.includes(loc.name)
                      ? 'bg-brand-red text-white border-brand-red shadow-lg scale-[0.98]'
                      : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase truncate w-32">
                      {loc.name}
                    </p>
                    <p
                      className={`text-[10px] font-bold opacity-70 ${
                        visibleLocationNames.includes(loc.name)
                          ? 'text-white'
                          : ''
                      }`}
                    >
                      {loc.municipality}
                    </p>
                  </div>
                  {visibleLocationNames.includes(loc.name) ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase opacity-50 tracking-widest">
                {t('settings.port_ships')}
              </h3>
              <span className="text-sm font-bold text-brand-red bg-brand-red/10 px-3 py-1 rounded-full">
                {numShips}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={numShips}
              onChange={e => setNumShips(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-red"
            />
            <div className="flex justify-between mt-3 text-[10px] font-bold opacity-50 uppercase tracking-widest">
              <span>1 {t('settings.ship')}</span>
              <span>12 {t('settings.ships')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
