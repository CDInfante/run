/** @author Harry Vasanth (harryvasanth.com) */
import React, { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Droplet,
  Toilet as Toilet,
  AlertTriangle,
  Mountain,
  Map as MapIcon,
} from "lucide-react";
import Map from "../ui/Map";

interface MapSectionProps {
  showWater: boolean;
  setShowWater: (val: boolean) => void;
  showToilets: boolean;
  setShowToilets: (val: boolean) => void;
  showAlerts: boolean;
  setShowAlerts: (val: boolean) => void;
  showTrails: boolean;
  setShowTrails: (val: boolean) => void;
}

interface ToggleProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  activeShadow: string;
}

const Toggle: React.FC<ToggleProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
  activeBg,
  activeText,
  activeBorder,
  activeShadow,
}) => (
  <motion.button
    layout // This ensures the button smoothly animates its width when the text expands/collapses
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`flex items-center justify-center px-3.5 py-3 md:px-5 md:py-2.5 rounded-2xl md:rounded-full transition-colors duration-300 border font-bold uppercase text-[9px] md:text-[10px] tracking-widest ${
      active
        ? `${activeBg} ${activeText} ${activeBorder} ${activeShadow} shadow-lg`
        : "glass hover:bg-white/10 border-white/10 text-brand-navy dark:text-white opacity-80 hover:opacity-100 shadow-sm"
    }`}
  >
    <Icon size={14} className={`shrink-0 ${active ? "" : "opacity-60"}`} />

    {/* Responsive Label Logic:
      - Mobile & Inactive: max-width 0, no margin, invisible.
      - Mobile & Active: max-width expands, margin added, visible.
      - Desktop (md+): Always visible, standard margin.
    */}
    <span
      className={`truncate transition-all duration-300 ease-in-out ${
        active
          ? "max-w-[100px] opacity-100 ml-2"
          : "max-w-0 opacity-0 ml-0 md:max-w-[100px] md:opacity-100 md:ml-2"
      }`}
    >
      {label}
    </span>
  </motion.button>
);

const MapSection: React.FC<MapSectionProps> = ({
  showWater,
  setShowWater,
  showToilets,
  setShowToilets,
  showAlerts,
  setShowAlerts,
  showTrails,
  setShowTrails,
}) => {
  const { t } = useTranslation();

  return (
    <section id="map" className="space-y-6 scroll-mt-24 pt-18 w-full">
      {/* Header & Controls Container */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        {/* Title Area */}
        <div className="flex flex-col flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <MapIcon size={12} className="text-brand-red" />
            <span className="text-[9px] font-bold text-brand-red dark:text-white/80 uppercase tracking-[0.2em] leading-none">
              {t("map.title")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white uppercase tracking-tighter leading-tight flex items-center gap-2">
            RUN<span className="text-brand-red font-semibold">INFANTE</span>
          </h2>
          <div className="h-1.5 w-24 bg-brand-red rounded-full mt-2" />
        </div>

        {/* Filters (Flex Wrap for fluid expansion) */}
        <div className="flex flex-row flex-wrap md:flex-nowrap gap-2 md:gap-3 w-full xl:w-auto">
          <Toggle
            active={showWater}
            onClick={() => setShowWater(!showWater)}
            icon={Droplet}
            label={t("map.water")}
            activeBg="bg-blue-500/10"
            activeText="text-blue-600 dark:text-blue-400"
            activeBorder="border-blue-500/30"
            activeShadow="shadow-blue-500/20"
          />
          <Toggle
            active={showToilets}
            onClick={() => setShowToilets(!showToilets)}
            icon={Toilet}
            label={t("map.toilets")}
            activeBg="bg-violet-500/10"
            activeText="text-violet-600 dark:text-violet-400"
            activeBorder="border-violet-500/30"
            activeShadow="shadow-violet-500/20"
          />
          <Toggle
            active={showAlerts}
            onClick={() => setShowAlerts(!showAlerts)}
            icon={AlertTriangle}
            label={t("map.alerts")}
            activeBg="bg-orange-500/10"
            activeText="text-orange-600 dark:text-orange-400"
            activeBorder="border-orange-500/30"
            activeShadow="shadow-orange-500/20"
          />
          <Toggle
            active={showTrails}
            onClick={() => setShowTrails(!showTrails)}
            icon={Mountain}
            label={t("map.prs")}
            activeBg="bg-emerald-500/10"
            activeText="text-emerald-600 dark:text-emerald-400"
            activeBorder="border-emerald-500/30"
            activeShadow="shadow-emerald-500/20"
          />
        </div>
      </div>

      {/* Map Container (Premium Tablet Bezel Effect) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass p-0.5 md:p-1 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative z-0"
      >
        <div className="relative w-full h-[60vh] min-h-[400px] md:min-h-[600px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-brand-navy/10 dark:border-white/5 bg-white/50 dark:bg-black/20">
          <Map
            showWater={showWater}
            showToilets={showToilets}
            showAlerts={showAlerts}
            showTrails={showTrails}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default memo(MapSection);
