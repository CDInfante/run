import React, { useState, useEffect, useCallback } from "react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Sun,
  Moon,
  Settings,
  X,
  Menu,
  Globe,
  Share2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Navbar Component
 *
 * Provides top-level navigation, theme toggling, and language switching.
 * Features a scroll-responsive design that shrinks and adds a backdrop blur
 * when the user scrolls down. Includes a full-screen mobile drawer.
 *
 * @author Harry Vasanth (harryvasanth.com)
 *
 */
interface NavbarProps {
  /** Callback to open the settings modal */
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setIsSettingsOpen }) => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { language, setLanguage, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Navigation items used in both desktop and mobile views
  const navLinks = [
    { name: t("nav.dashboard"), href: "#dashboard" },
    { name: t("nav.map"), href: "#map" },
  ];

  /**
   * Handles internal navigation with smooth scrolling
   */
  const handleNavLinkClick = (href: string) => {
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Run - CDInfante",
      text: "Meteorologia em tempo real, alertas, mapa comunitário e horários de navios para atletas na Madeira e Porto Santo.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 px-6",
          scrolled ? "mt-6" : "mt-0",
        )}
      >
        <div
          className={cn(
            "max-w-7xl mx-auto transition-all duration-500",
            scrolled
              ? "bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 py-3 px-8 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-transparent border-transparent py-8 px-0",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/apple-touch-icon.png"
                alt="CDI-M"
                className="h-10 md:h-12 w-auto"
              />
              <div className="flex flex-col -space-y-1">
                <span className="font-extrabold text-xl leading-none tracking-tighter text-brand-navy dark:text-white transition-colors">
                  Clube Desportivo
                </span>
                <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] mt-0.5">
                  Infante Dom Henrique
                </span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavLinkClick(link.href)}
                    className="text-sm font-bold text-brand-navy/70 hover:text-brand-red dark:text-slate-300 dark:hover:text-brand-red transition-all py-2 px-1 tracking-widest uppercase cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleShare}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-brand-navy dark:text-slate-300 cursor-pointer relative"
                aria-label="Share"
              >
                <AnimatePresence mode="wait">
                  {showShareSuccess ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Check size={20} className="text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="share"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Share2 size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {showShareSuccess && (
                  <span className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 text-brand-navy dark:text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-xl whitespace-nowrap border border-slate-100 dark:border-white/10">
                    {t("nav.share_success")}
                  </span>
                )}
              </button>
              <button
                onClick={() =>
                  setLanguage(language === "en-GB" ? "pt-PT" : "en-GB")
                }
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-brand-navy dark:text-slate-300 cursor-pointer"
                aria-label="Toggle language"
              >
                <Globe size={20} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-brand-navy dark:text-slate-300 cursor-pointer"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-brand-navy dark:text-slate-300 cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} />
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-brand-navy dark:text-slate-300 cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} />
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-brand-navy dark:text-slate-300 cursor-pointer"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[1000] bg-white/95 dark:bg-black/95 backdrop-blur-xl pt-24 px-6 lg:hidden flex flex-col"
          >
            {/* Updated Drawer Header */}
            <div className="flex justify-between items-center absolute top-8 left-6 right-6">
              <div className="flex items-center gap-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="CDI-M"
                  className="h-10 w-auto"
                />
                <div className="flex flex-col -space-y-1 text-left">
                  <span className="font-extrabold text-xl leading-none tracking-tighter text-brand-navy dark:text-white transition-colors">
                    Clube Desportivo
                  </span>
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] mt-0.5">
                    Infante Dom Henrique
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-brand-red/10 rounded-xl transition-all text-brand-navy dark:text-white shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-8 text-center mt-20">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavLinkClick(link.href)}
                  className="text-4xl font-black text-brand-navy dark:text-white uppercase tracking-tighter"
                >
                  {link.name}
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-white/10 my-4" />

              <button
                onClick={() => {
                  setLanguage(language === "en-GB" ? "pt-PT" : "en-GB");
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 text-brand-navy/70 dark:text-slate-400 font-bold text-lg cursor-pointer uppercase tracking-widest"
              >
                <Globe size={24} />
                {language === "pt-PT" ? "English" : "Português"}
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-brand-navy text-white dark:bg-white dark:text-brand-navy font-bold uppercase tracking-widest text-sm shadow-xl mt-4"
              >
                <Settings size={20} />
                {t("settings.title")}
              </button>

              {/* Share Button (Already in Drawer) */}
              <button
                onClick={() => {
                  handleShare();
                  if (navigator.share !== undefined) setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 text-brand-navy/70 dark:text-slate-400 font-bold text-lg cursor-pointer uppercase tracking-widest mt-4"
              >
                {showShareSuccess ? (
                  <Check size={24} className="text-green-500" />
                ) : (
                  <Share2 size={24} />
                )}
                {showShareSuccess ? t("nav.share_success") : t("nav.share")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
