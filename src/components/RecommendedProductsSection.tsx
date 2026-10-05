"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import {
  RECOMMENDED_PRODUCTS,
  RecommendedProduct,
} from "@/lib/recommendedProducts";
import { AffiliateSettings, CareCategory } from "@/lib/types";
import {
  BookOpen,
  Check,
  ExternalLink,
  Flame,
  Heart,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";

interface RecommendedProductsSectionProps {
  childAge?: number;
  childName?: string;
  careCategory?: CareCategory | "all";
  className?: string;
}

export default function RecommendedProductsSection({
  childAge = 3,
  childName,
  careCategory = "all",
  className = "",
}: RecommendedProductsSectionProps) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<RecommendedProduct[]>(RECOMMENDED_PRODUCTS);
  const [amazonTag, setAmazonTag] = useState<string>("matchcaring-20");

  const categories =
    careCategory === "elderly_care"
      ? [
          { id: "all", labelEs: "Todos los Artículos", labelEn: "All Items" },
          { id: "elderly", labelEs: "Medicamentos & Salud", labelEn: "Medication & Health" },
          { id: "safety", labelEs: "Seguridad & Anti-Caídas", labelEn: "Fall Safety" },
        ]
      : careCategory === "disability_care"
      ? [
          { id: "all", labelEs: "Todos los Recursos", labelEn: "All Resources" },
          { id: "disability", labelEs: "Regulación & Comunicación", labelEn: "Sensory & AAC" },
        ]
      : [
          { id: "all", labelEs: "Todos los Artículos", labelEn: "All Items" },
          { id: "activities", labelEs: "Actividades & Juegos", labelEn: "Activities & Play" },
          { id: "books", labelEs: "Libros & Emociones", labelEn: "Books & Feelings" },
          { id: "daily_use", labelEs: "Uso Diario & Cuidados", labelEn: "Daily Essentials" },
          { id: "safety", labelEs: "Seguridad Infantil", labelEn: "Child Safety" },
        ];

  useEffect(() => {
    setSelectedCategory("all");
  }, [careCategory]);

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const catQuery = careCategory && careCategory !== "all" ? `&careCategory=${careCategory}` : "";
        const res = await fetch(`/api/affiliates?age=${childAge}&category=${selectedCategory}${catQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
          if (data.settings?.amazonTag) {
            setAmazonTag(data.settings.amazonTag);
          }
        }
      } catch (err) {
        console.error("Failed to load affiliate products", err);
      }
    };

    fetchAffiliates();
  }, [childAge, selectedCategory, careCategory]);

  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== "all" && prod.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const sectionTitle =
    careCategory === "elderly_care"
      ? language === "es"
        ? "Equipamiento y Salud para Adultos Mayores"
        : "Senior Care & Health Essentials"
      : careCategory === "disability_care"
      ? language === "es"
        ? "Herramientas de Apoyo y Regulación Sensorial"
        : "Sensory Support & Special Needs Gear"
      : language === "es"
      ? "Artículos & Actividades para tu Familia"
      : "Recommended Essentials & Activities";

  const sectionDesc =
    careCategory === "elderly_care"
      ? language === "es"
        ? "Dispositivos de seguridad, monitoreo de signos vitales y pastilleros inteligentes para cuidadores geriátricos."
        : "Fall prevention, vital signs monitors, and smart medication organizers for senior care."
      : careCategory === "disability_care"
      ? language === "es"
        ? "Materiales recomendados por terapeutas para autorregulación sensorial, comunicación aumentativa (SAAC) y autonomía."
        : "Therapist-recommended sensory regulation aids, AAC communication boards, and ergonomic support."
      : language === "es"
      ? "Herramientas de juego, autorregulación y seguridad probadas por especialistas para que tus cuidadores tengan el mejor material en casa."
      : "Pediatric-tested sensory tools, daily routines, and home safety essentials recommended for caregivers.";

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === "es"
                ? "Programa de Afiliados Amazon • Selección Curada"
                : "Amazon Associates Program • Curated Gear"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{sectionTitle}</span>
            {childName && (
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                {language === "es"
                  ? `Para ${childName} (${childAge >= 60 ? `${childAge} años • Senior` : `${childAge} años`})`
                  : `For ${childName} (${childAge}yo)`}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {sectionDesc}
          </p>
        </div>

        {/* Affiliate Disclosure Badge */}
        <div className="text-[11px] text-slate-400 max-w-xs self-start md:self-auto bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="font-bold text-slate-600">
            {language === "es" ? "Aviso de Afiliados:" : "Affiliate Notice:"}
          </span>{" "}
          {language === "es"
            ? "Como asociados de Amazon, obtenemos comisiones por compras válidas sin coste adicional para ti."
            : "As an Amazon Associate, we earn from qualifying purchases at no extra cost to you."}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {language === "es" ? cat.labelEs : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const isAgeMatch = childAge >= prod.targetMinAge && childAge <= prod.targetMaxAge;
          const title = language === "es" ? prod.titleEs : prod.title;
          const desc = language === "es" ? prod.descriptionEs : prod.description;
          const benefit = language === "es" ? prod.pedagogicalBenefitEs : prod.pedagogicalBenefitEn;
          const badge = language === "es" && prod.badgeEs ? prod.badgeEs : prod.badge;

          return (
            <div
              key={prod.id}
              className={`group flex flex-col justify-between rounded-2xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-md ${
                isAgeMatch ? "border-amber-400/80 shadow-xs ring-1 ring-amber-400/30" : "border-slate-200"
              }`}
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={prod.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {badge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                        <Flame className="w-3 h-3 fill-white" />
                        {badge}
                      </span>
                    )}
                    {isAgeMatch && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {language === "es" ? `Ideal ${childAge} años` : `Best for ${childAge}yo`}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    {language === "es" ? prod.ageBadgeEs : prod.ageBadge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">
                      {language === "es" ? prod.categoryLabelEs : prod.categoryLabelEn}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{prod.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({prod.reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {desc}
                  </p>

                  {/* Pedagogical Benefit callout */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{benefit}</span>
                  </div>
                </div>
              </div>

              {/* Price & Buy Action Footer */}
              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 mt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {language === "es" ? "Aprox." : "Approx."}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {prod.priceEstimate}
                  </span>
                </div>

                <a
                  href={prod.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span>{language === "es" ? "Ver en Amazon" : "View on Amazon"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
