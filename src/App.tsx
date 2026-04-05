import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import SettingsModal from "./components/ui/SettingsModal";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MapSection from "./components/sections/MapSection";
import DashboardSection from "./components/sections/DashboardSection";
import locationsData from "./content/locations.json";
import type { Location } from "./types";

/**
 * Main Application Component
 * Handles the overall layout, state for map toggles, and weather location management.
 * @author Harry Vasanth (harryvasanth.com)
 */
const App: React.FC = () => {
  const [showWater, setShowWater] = useState(() => {
    return localStorage.getItem("showWater") === "true";
  });
  const [showToilets, setShowToilets] = useState(() => {
    return localStorage.getItem("showToilets") === "true";
  });
  const [showAlerts, setShowAlerts] = useState(() => {
    const saved = localStorage.getItem("showAlerts");
    return saved !== null ? saved === "true" : true;
  });
  const [showTrails, setShowTrails] = useState(() => {
    return localStorage.getItem("showTrails") === "true";
  });
  const [numShips, setNumShips] = useState(() => {
    return Number(localStorage.getItem("numShips")) || 4;
  });

  const defaultLocations = ["Sé", "Pico Ruivo", "Porto Moniz", "Machico"];
  const [visibleLocationNames, setVisibleLocationNames] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("visibleLocationNames");
      return saved ? JSON.parse(saved) : defaultLocations;
    },
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Card collapse states with persistence
  const [isShipsCollapsed, setIsShipsCollapsed] = useState(() => {
    const saved = localStorage.getItem("isShipsCollapsed");
    if (saved !== null) return saved === "true";
    return window.innerWidth < 1024; // Default to collapsed on mobile
  });
  const [isWeatherCollapsed, setIsWeatherCollapsed] = useState(() => {
    const saved = localStorage.getItem("isWeatherCollapsed");
    if (saved !== null) return saved === "true";
    return window.innerWidth < 1024;
  });
  const [isTrailsCollapsed, setIsTrailsCollapsed] = useState(() => {
    const saved = localStorage.getItem("isTrailsCollapsed");
    if (saved !== null) return saved === "true";
    return window.innerWidth < 1024;
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-update PWA service worker when a new version is available
  useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        setInterval(
          () => {
            r.update();
          },
          60 * 60 * 1000,
        ); // Check for updates every hour
      }
    },
    onNeedRefresh() {
      // In autoUpdate mode, this might not be strictly necessary, but good to have
      window.location.reload();
    },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "visibleLocationNames",
      JSON.stringify(visibleLocationNames),
    );
  }, [visibleLocationNames]);

  useEffect(() => {
    localStorage.setItem("numShips", numShips.toString());
  }, [numShips]);

  useEffect(() => {
    localStorage.setItem("showWater", showWater.toString());
    localStorage.setItem("showToilets", showToilets.toString());
    localStorage.setItem("showAlerts", showAlerts.toString());
    localStorage.setItem("showTrails", showTrails.toString());
  }, [showWater, showToilets, showAlerts, showTrails]);

  useEffect(() => {
    localStorage.setItem("isShipsCollapsed", isShipsCollapsed.toString());
  }, [isShipsCollapsed]);

  useEffect(() => {
    localStorage.setItem("isWeatherCollapsed", isWeatherCollapsed.toString());
  }, [isWeatherCollapsed]);

  useEffect(() => {
    localStorage.setItem("isTrailsCollapsed", isTrailsCollapsed.toString());
  }, [isTrailsCollapsed]);

  const toggleLocation = (name: string) => {
    setVisibleLocationNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const activeWeatherLocations = useMemo(() => {
    return (locationsData as Location[]).filter((loc) =>
      visibleLocationNames.includes(loc.name),
    );
  }, [visibleLocationNames]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-12 relative overflow-x-hidden"
    >
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(182, 23, 30, 0.1), transparent 80%)`,
        }}
      />

      <Navbar setIsSettingsOpen={setIsSettingsOpen} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        visibleLocationNames={visibleLocationNames}
        toggleLocation={toggleLocation}
        numShips={numShips}
        setNumShips={setNumShips}
      />

      <main className="container mx-auto px-4 mt-8 max-w-7xl space-y-12">
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

        <Footer />
      </main>
    </div>
  );
};

export default App;
