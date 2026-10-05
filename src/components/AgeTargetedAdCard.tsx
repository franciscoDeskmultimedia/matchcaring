"use client";

import { useEffect, useState } from "react";
import { AdCampaign, AdPlacement, CareCategory } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import { BookOpen, ExternalLink, ShieldCheck, Sparkles, Tag, Waves, X } from "lucide-react";

interface AgeTargetedAdCardProps {
  childAge?: number;
  childName?: string;
  careCategory?: CareCategory | "all";
  placement?: AdPlacement;
  className?: string;
}

export default function AgeTargetedAdCard({
  childAge = 3,
  childName,
  careCategory = "all",
  placement = "dashboard_banner",
  className = "",
}: AgeTargetedAdCardProps) {
  const { language } = useLanguage();
  const [ad, setAd] = useState<AdCampaign | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset dismissed state when careCategory or age changes
    setDismissed(false);

    const fetchAd = async () => {
      try {
        const catQuery = careCategory && careCategory !== "all" ? `&careCategory=${careCategory}` : "";
        const res = await fetch(`/api/ads/active?age=${childAge}&placement=${placement}${catQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ads && data.ads.length > 0) {
            setAd(data.ads[0]);
          } else {
            setAd(null);
          }
        }
      } catch (err) {
        console.error("Failed to load targeted ad", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [childAge, careCategory, placement]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`dismissed_ad_${childAge}_${placement}`, "true");
    }
  };

  const handleClickCta = () => {
    if (!ad) return;
    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id }),
    }).catch(() => {});
  };

  if (loading || dismissed || !ad) return null;

  const title = language === "es" && ad.titleEs ? ad.titleEs : ad.title;
  const headline = language === "es" && ad.headlineEs ? ad.headlineEs : ad.headline;
  const desc = language === "es" && ad.descriptionEs ? ad.descriptionEs : ad.description;
  const cta = language === "es" && ad.ctaTextEs ? ad.ctaTextEs : ad.ctaText;
  const badge =
    language === "es" && ad.badgeTextEs
      ? ad.badgeTextEs
      : ad.badgeText || (language === "es" ? "Patrocinador Recomendado" : "Featured Sponsor");

  // Icon according to category
  const renderIcon = () => {
    switch (ad.category) {
      case "books":
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case "education":
        return <Waves className="w-5 h-5 text-teal-600" />;
      case "diapers":
      default:
        return <Tag className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r ${
        ad.bgColor || "from-amber-500/10 via-orange-500/5 to-rose-500/10"
      } p-5 sm:p-6 shadow-xs transition-all animate-in fade-in ${className}`}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        title={language === "es" ? "Ocultar recomendación" : "Dismiss suggestion"}
        className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pr-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
          {ad.imageUrl ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200/80 bg-white">
              <img
                src={ad.imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-white/95 backdrop-blur-xs shadow-2xs border border-slate-200/60">
                {renderIcon()}
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {badge}
              </span>
              {childName && (
                <span className="text-[11px] font-semibold text-slate-500">
                  {language === "es"
                    ? `Seleccionado para la etapa de ${childName} (${childAge} años)`
                    : `Matched for ${childName} (${childAge}yo stage)`}
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs font-semibold text-slate-700">{headline}</p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">{desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <a
            href={ad.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClickCta}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-95"
          >
            <span>{cta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
