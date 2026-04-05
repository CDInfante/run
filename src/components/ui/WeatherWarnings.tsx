/** @author Harry Vasanth (harryvasanth.com) */
import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WeatherWarning } from "../../types";
import {
  fetchWeatherWarnings,
  IPMA_REGIONS,
  REGION_URLS,
} from "../../services/ipma";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Wind,
  Droplets,
  ThermometerSun,
  ThermometerSnowflake,
  Waves,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "../../hooks/useTranslation";

interface WeatherWarningsProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const WeatherWarnings: React.FC<WeatherWarningsProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  const [warnings, setWarnings] = useState<WeatherWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
      const data = await fetchWeatherWarnings();
      setWarnings(data);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <div className="h-24 glass animate-pulse rounded-[2rem]"></div>;

  const getRegionName = (id: string) => {
    switch (id) {
      case IPMA_REGIONS.NORTH_COAST:
        return t("weather.north_coast");
      case IPMA_REGIONS.MOUNTAIN_REGIONS:
        return t("weather.mountain_regions");
      case IPMA_REGIONS.SOUTH_COAST:
        return t("weather.south_coast");
      case IPMA_REGIONS.PORTO_SANTO:
        return t("weather.porto_santo");
      default:
        return id;
    }
  };

  const getAwarenessTranslation = (type: string) => {
    switch (type) {
      case "Agitação Marítima":
        return t("weather.awareness.maritime");
      case "Nevoeiro":
        return t("weather.awareness.fog");
      case "Tempo Frio":
        return t("weather.awareness.cold");
      case "Tempo Quente":
        return t("weather.awareness.hot");
      case "Precipitação":
        return t("weather.awareness.rain");
      case "Neve":
        return t("weather.awareness.snow");
      case "Trovoada":
        return t("weather.awareness.thunder");
      case "Vento":
        return t("weather.awareness.wind");
      default:
        return type;
    }
  };

  const getWarningIcon = (type: string, className = "") => {
    switch (type) {
      case "Vento":
        return <Wind className={className} />;
      case "Precipitação":
        return <Droplets className={className} />;
      case "Tempo Quente":
        return <ThermometerSun className={className} />;
      case "Tempo Frio":
      case "Neve":
        return <ThermometerSnowflake className={className} />;
      case "Agitação Marítima":
        return <Waves className={className} />;
      case "Trovoada":
        return <Zap className={className} />;
      default:
        return <AlertTriangle className={className} />;
    }
  };

  const activeWarnings = warnings.filter((w) => w.awarenessLevelID !== "green");
  const groupedWarnings = warnings.reduce(
    (acc, warning) => {
      if (!acc[warning.idAreaAviso]) acc[warning.idAreaAviso] = [];
      acc[warning.idAreaAviso].push(warning);
      return acc;
    },
    {} as Record<string, WeatherWarning[]>,
  );

  const regionOrder = [
    IPMA_REGIONS.NORTH_COAST,
    IPMA_REGIONS.MOUNTAIN_REGIONS,
    IPMA_REGIONS.SOUTH_COAST,
    IPMA_REGIONS.PORTO_SANTO,
  ];

  // Determine overall severity
  let highestSeverity = "green";
  if (activeWarnings.some((w) => w.awarenessLevelID === "red"))
    highestSeverity = "red";
  else if (activeWarnings.some((w) => w.awarenessLevelID === "orange"))
    highestSeverity = "orange";
  else if (activeWarnings.some((w) => w.awarenessLevelID === "yellow"))
    highestSeverity = "yellow";

  // Unique active warning types for summary
  const activeTypes = Array.from(
    new Set(activeWarnings.map((w) => w.awarenessTypeName)),
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 md:p-5 glass rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer hover:bg-white/10 group relative"
      >
        <div
          className={`p-2.5 rounded-2xl shrink-0 shadow-lg ${
            highestSeverity === "red"
              ? "bg-red-500 text-white shadow-red-500/20"
              : highestSeverity === "orange"
                ? "bg-orange-500 text-white shadow-orange-500/20"
                : highestSeverity === "yellow"
                  ? "bg-yellow-500 text-white shadow-yellow-500/20"
                  : "bg-green-500 text-white shadow-green-500/20"
          }`}
        >
          {highestSeverity === "green" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} className="animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-sm md:text-base uppercase tracking-widest leading-tight text-brand-navy dark:text-white break-words">
            {t("weather.warnings")}
          </h3>
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest opacity-50 mt-0.5 break-words">
            {activeWarnings.length > 0
              ? "IPMA - MADEIRA"
              : t("weather.no_warnings")}
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {activeWarnings.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-[9px] md:text-[10px] font-bold font-mono opacity-80 mr-1">
                {activeWarnings.length}
              </span>
              <div className="flex items-center gap-1">
                {activeTypes.slice(0, 3).map((type, idx) => (
                  <div key={idx} className="opacity-80">
                    {getWarningIcon(type, "w-3 h-3")}
                  </div>
                ))}
                {activeTypes.length > 3 && (
                  <span className="text-[8px] opacity-50 ml-0.5">
                    +{activeTypes.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-1 md:p-1.5 bg-white/5 rounded-full border border-white/10 group-hover:bg-white/10 transition-colors">
            {isCollapsed ? (
              <ChevronDown size={14} className="opacity-60" />
            ) : (
              <ChevronUp size={14} className="opacity-60" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {regionOrder.map((regionId) => {
                const regionWarnings = groupedWarnings[regionId] || [];
                if (regionWarnings.length === 0) return null;

                return (
                  <div key={regionId} className="space-y-2">
                    <h4 className="font-bold uppercase text-[9px] tracking-widest opacity-40 px-2 pt-2 border-t border-white/5 first:border-0 first:pt-0">
                      {getRegionName(regionId)}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
                      {regionWarnings.map((warning, index) => {
                        const isGreen = warning.awarenessLevelID === "green";
                        let colorStyles =
                          "border-green-500/10 text-green-600 dark:text-green-400 bg-green-500/[0.03]";
                        let iconColor = "bg-green-500/10";

                        if (warning.awarenessLevelID === "red") {
                          colorStyles =
                            "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/[0.08]";
                          iconColor = "bg-red-500/20";
                        } else if (warning.awarenessLevelID === "orange") {
                          colorStyles =
                            "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/[0.08]";
                          iconColor = "bg-orange-500/20";
                        } else if (warning.awarenessLevelID === "yellow") {
                          colorStyles =
                            "border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/[0.08]";
                          iconColor = "bg-yellow-500/20";
                        }

                        return (
                          <a
                            key={`${regionId}-${index}`}
                            href={REGION_URLS[regionId]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-2 rounded-xl border transition-all hover:bg-white/10 duration-300 flex items-center gap-3 group/warning ${colorStyles}`}
                          >
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${iconColor}`}
                            >
                              {isGreen ? (
                                <CheckCircle size={12} />
                              ) : (
                                getWarningIcon(
                                  warning.awarenessTypeName,
                                  `w-3 h-3 ${warning.awarenessLevelID !== "yellow" ? "animate-pulse" : ""}`,
                                )
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-widest truncate leading-none mb-1">
                                {getAwarenessTranslation(
                                  warning.awarenessTypeName,
                                )}
                              </p>
                              {!isGreen && (
                                <div className="flex items-center gap-1 opacity-60">
                                  <Clock size={8} />
                                  <span className="text-[8px] font-bold font-mono">
                                    {format(
                                      new Date(warning.startTime),
                                      "HH:mm",
                                    )}{" "}
                                    -{" "}
                                    {format(new Date(warning.endTime), "HH:mm")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(WeatherWarnings);
