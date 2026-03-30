"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Flag from "react-country-flag";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const languages = {
    "fr": "Français",
    "en": "English",
    "fr_short": "FR",
    "en_short": "EN"
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    if (!langOpen) return;
    const handler = () => setLangOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  return (
    <div className={`relative ${className}`} onMouseDown={(e) => e.stopPropagation()}>
      <button
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E4E7ED] text-[#1A2532] text-sm font-medium hover:bg-[#F2F5F8] transition-colors"
        onClick={() => setLangOpen((v) => !v)}
      >
        <Globe className="w-4 h-4" />
        <span>{locale == 'fr' ? "FR" : "EN"}</span>
        <motion.span animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {langOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E7ED] rounded-xl shadow-lg overflow-hidden z-100"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {["fr", "en"].map((loc) => (
              <button
                key={loc}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors hover:bg-[#F8FAFD] ${loc === locale ? "bg-[#F2F5F8] font-semibold text-[#1A2532]" : "text-[#6B7280]"
                  }`}
                onClick={() => {
                  if (loc !== locale) {
                    const newPathname = pathname.replace(`/${locale}`, `/${loc}`);
                    router.push(newPathname === `/${loc}` ? `/${loc}` : newPathname);
                  }
                  setLangOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Flag
                    countryCode={loc === "fr" ? "FR" : "GB"}
                    svg
                    style={{ width: "20px", height: "15px" }}
                  />
                  <span>{locale == 'fr' ? 'Français' : "English"}</span>
                </div>
                {loc === locale && <Check className="w-3.5 h-3.5 text-[#1A2532]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
