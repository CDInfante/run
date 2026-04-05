/** @author Harry Vasanth (harryvasanth.com) */
import React from "react";
import { useTranslation } from "../../hooks/useTranslation";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm opacity-60">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
            {t("footer.emergency")}
          </span>
          <span className="text-lg font-bold text-brand-red">112</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
            {t("footer.civil_protection")}
          </span>
          <span className="text-lg font-bold">291 700 112</span>
        </div>
      </div>
      <div className="text-center">
        <div className="w-20 h-1 bg-brand-red/20 rounded-full mb-12 mx-auto" />
        <p className="text-brand-navy/40 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.3em] text-center leading-relaxed">
          © {new Date().getFullYear()} Clube Desportivo Infante Dom Henrique{" "}
          <br className="md:hidden" />
          <span className="hidden md:inline mx-2">•</span> {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
