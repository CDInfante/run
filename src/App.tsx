import { useRegisterSW } from 'virtual:pwa-register/react'
/** @author Harry Vasanth (harryvasanth.com) */
import { Loader2 } from 'lucide-react'
import type React from 'react'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import NetworkMonitor from './components/layout/NetworkMonitor'
import SettingsModal from './components/ui/SettingsModal'
import ToastContainer from './components/ui/ToastContainer'
import locationsData from './content/locations.json'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTranslation } from './hooks/useTranslation'
import type { Location } from './types'

// Lazy load heavy sections to reduce initial bundle size
const MapSection = lazy(() => import('./components/sections/MapSection'))
const DashboardSection = lazy(
  () => import('./components/sections/DashboardSection'),
)

const App: React.FC = () => {
  const { t } = useTranslation()

  const defaultLocations = ['Sé', 'Pico Ruivo', 'Porto Moniz', 'Machico']
  const isMobileInitial =
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false

  // Refactored LocalStorage States
  const [showWater, setShowWater] = useLocalStorage<boolean>('showWater', false)
  const [showToilets, setShowToilets] = useLocalStorage<boolean>(
    'showToilets',
    false,
  )
  const [showAlerts, setShowAlerts] = useLocalStorage<boolean>(
    'showAlerts',
    true,
  )
  const [showTrails, setShowTrails] = useLocalStorage<boolean>(
    'showTrails',
    false,
  )
  const [numShips, setNumShips] = useLocalStorage<number>('numShips', 4)
  const [visibleLocationNames, setVisibleLocationNames] = useLocalStorage<
    string[]
  >('visibleLocationNames', defaultLocations)

  const [isShipsCollapsed, setIsShipsCollapsed] = useLocalStorage<boolean>(
    'isShipsCollapsed',
    isMobileInitial,
  )
  const [isWeatherCollapsed, setIsWeatherCollapsed] = useLocalStorage<boolean>(
    'isWeatherCollapsed',
    isMobileInitial,
  )
  const [isTrailsCollapsed, setIsTrailsCollapsed] = useLocalStorage<boolean>(
    'isTrailsCollapsed',
    isMobileInitial,
  )

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // OPTIMIZATION: Use refs for frequent DOM updates to avoid React re-renders
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  // Auto-update PWA service worker with prompt mode
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        setInterval(
          () => {
            r.update()
          },
          60 * 60 * 1000,
        ) // Check for updates every hour
      }
    },
  })

  useEffect(() => {
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      // OPTIMIZATION: Update CSS directly via ref inside requestAnimationFrame
      rafId = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(182, 23, 30, 0.1), transparent 80%)`
        }
      })
    }

    // Use passive listener for better scroll/interaction performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const toggleLocation = (name: string) => {
    setVisibleLocationNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name],
    )
  }

  const activeWeatherLocations = useMemo(() => {
    // Failsafe in case localStorage was corrupted and isn't an array
    const safeLocations = Array.isArray(visibleLocationNames)
      ? visibleLocationNames
      : defaultLocations
    return (locationsData as Location[]).filter(loc =>
      safeLocations.includes(loc.name),
    )
  }, [visibleLocationNames, defaultLocations]) // Added missing dependency to satisfy linters

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-12 relative overflow-x-hidden"
    >
      <div
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at -1000px -1000px, rgba(182, 23, 30, 0.1), transparent 80%)`, // Default off-screen
        }}
      />

      <ToastContainer />
      <NetworkMonitor />

      <Navbar setIsSettingsOpen={setIsSettingsOpen} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        visibleLocationNames={
          Array.isArray(visibleLocationNames)
            ? visibleLocationNames
            : defaultLocations
        }
        toggleLocation={toggleLocation}
        numShips={numShips}
        setNumShips={setNumShips}
      />

      <main className="container mx-auto px-4 mt-8 max-w-7xl space-y-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin opacity-80" />
            </div>
          }
        >
          <MapSection
            showWater={showWater}
            setShowWater={setShowWater}
            showToilets={showToilets}
            setShowToilets={setShowToilets}
            showAlerts={showAlerts}
            setShowAlerts={setShowAlerts}
            showTrails={showTrails}
            setShowTrails={setShowTrails}
          />

          <DashboardSection
            numShips={numShips}
            activeWeatherLocations={activeWeatherLocations}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
            setIsSettingsOpen={setIsSettingsOpen}
            isShipsCollapsed={isShipsCollapsed}
            setIsShipsCollapsed={setIsShipsCollapsed}
            isWeatherCollapsed={isWeatherCollapsed}
            setIsWeatherCollapsed={setIsWeatherCollapsed}
            isTrailsCollapsed={isTrailsCollapsed}
            setIsTrailsCollapsed={setIsTrailsCollapsed}
          />
        </Suspense>

        <Footer />
      </main>

      {/* --- GRACEFUL UPDATE PROMPT UI --- */}
      {needRefresh && (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] p-4 md:p-5 bg-brand-navy dark:bg-slate-800 text-white rounded-2xl shadow-2xl flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-8 border border-white/10">
          <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest">
            {t('app.update_available')}
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="text-[10px] text-white/60 hover:text-white font-bold uppercase tracking-widest transition-colors px-2 py-2"
            >
              {t('app.close_btn')}
            </button>
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="px-5 py-2 bg-brand-red rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-brand-red/20"
            >
              {t('app.update_btn')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
