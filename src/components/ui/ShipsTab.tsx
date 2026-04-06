/** @author Harry Vasanth (harryvasanth.com) */
import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchShipStatus } from "../../services/ships";
import type { ShipStatus } from "../../types";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Map as MapIcon,
  Anchor,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface ShipsTabProps {
  limit?: number;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const ShipsTab: React.FC<ShipsTabProps> = ({
  limit = 4,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [status, setStatus] = useState<ShipStatus | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const { t, language } = useTranslation();

  const formatDateLabel = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString())
      return t("port.today").toUpperCase();
    if (date.toDateString() === tomorrow.toDateString())
      return t("port.tomorrow").toUpperCase();

    return date
      .toLocaleDateString(language, { month: "short", day: "2-digit" })
      .toUpperCase();
  };

  const getDurationString = (targetDate: Date, currentTime: Date): string => {
    const diffMs = targetDate.getTime() - currentTime.getTime();
    if (diffMs <= 0) return "0m";
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  useEffect(() => {
    const load = async () => setStatus(await fetchShipStatus());
    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(clockInterval);
  }, []);

  if (!status)
    return <div className="p-8 glass animate-pulse h-32 rounded-[2.5rem]" />;

  const isPortClearNow = !status.isDocked;
  const dockedShipsCount = status.ships.filter((s) => s.isDockedNow).length;
  const todayShipsCount = status.ships.filter(
    (s) =>
      s.arrivalDate.toDateString() === now.toDateString() ||
      s.departureDate.toDateString() === now.toDateString(),
  ).length;

  let nextArrivalDate: Date | null = null;
  if (isPortClearNow && status.ships.length > 0) {
    // Only check next arrival for Terminal Sul
    const futureShips = status.ships.filter(
      (s) => s.arrivalDate > now && s.terminal.includes("Terminal Sul"),
    );
    if (futureShips.length > 0) {
      nextArrivalDate = futureShips.reduce(
        (min, s) => (s.arrivalDate < min ? s.arrivalDate : min),
        futureShips[0].arrivalDate,
      );
    }
  }

  let durationRemaining = "";
  if (isPortClearNow && nextArrivalDate) {
    durationRemaining = getDurationString(nextArrivalDate, now);
  } else if (!isPortClearNow && status.nextAvailableDate) {
    durationRemaining = getDurationString(status.nextAvailableDate, now);
  }

  return (
    <div className="space-y-4">
      {/* Port Status Header - Standardized */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer group/header relative"
      >
        <div
          className={`p-2.5 md:p-3 rounded-2xl shrink-0 transition-colors ${
            status.isDocked
              ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
              : "bg-green-500 text-white shadow-lg shadow-green-500/20"
          }`}
        >
          {status.isDocked ? <XCircle size={20} /> : <CheckCircle size={20} />}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex flex-col mb-1">
            <span className="text-[8px] md:text-[9px] font-bold text-brand-red dark:text-white/60 uppercase tracking-[0.2em] leading-none mb-1">
              {t("port.name")}
            </span>
            <h2 className="font-bold text-base md:text-lg uppercase tracking-tighter leading-tight text-brand-navy dark:text-white break-words">
              {status.isDocked ? t("port.busy") : t("port.clear")}
            </h2>
          </div>

          {/* Informative Collapsed Summary */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded border border-white/10 opacity-80">
              <Anchor size={10} />
              <span>
                {dockedShipsCount} {t("settings.ships")}
              </span>
            </div>
            {todayShipsCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                • {todayShipsCount} {t("port.today")}
              </span>
            )}
          </div>
        </div>

        {/* Status Indicators Group */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {durationRemaining && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold font-mono tracking-tight ${
                status.isDocked
                  ? "bg-brand-red/10 text-brand-red shadow-sm"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              <Clock size={10} />
              <span>{durationRemaining}</span>
            </div>
          )}
          <div className="p-1 hover:bg-white/10 rounded-full transition-all">
            {isCollapsed ? (
              <ChevronDown size={16} className="opacity-40" />
            ) : (
              <ChevronUp size={16} className="opacity-40" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden space-y-6"
          >
            {/* Ships List */}
            <div className="space-y-2">
              {status.ships.slice(0, limit).map((ship, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-2xl border transition-all ${
                    ship.isDockedNow
                      ? "bg-brand-red/[0.03] border-brand-red/10"
                      : "bg-white/[0.03] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Anchor
                        size={12}
                        className={`mt-0.5 shrink-0 ${ship.isDockedNow ? "text-brand-red" : "opacity-30"}`}
                      />
                      <h4 className="font-bold text-[10px] uppercase tracking-tight break-words leading-tight">
                        {ship.name}
                      </h4>
                    </div>
                    <span
                      className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest shrink-0 ${
                        ship.isDockedNow
                          ? "bg-brand-red text-white"
                          : "bg-white/10 opacity-50"
                      }`}
                    >
                      {ship.terminal}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[8px] font-bold uppercase tracking-widest opacity-60 mt-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="opacity-40 text-[7px]">
                        {t("port.arrival")}
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
                    />
                    <div className="flex flex-col gap-1 items-end text-right">
                      <span className="opacity-40 text-[7px]">
                        {t("port.departure")}
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
                              ? "text-orange-500"
                              : ""
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
                <ExternalLink size={12} />
                <span>APRAM</span>
              </a>

              <a
                href="https://www.marinetraffic.com/en/ais/home/centerx:-16.911/centery:32.644/zoom:16"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 text-brand-navy dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <MapIcon size={12} />
                <span>Live Traffic</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(ShipsTab);
