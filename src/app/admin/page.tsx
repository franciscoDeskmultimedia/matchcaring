"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdCampaign,
  AdCategory,
  AdPlacement,
  AffiliateSettings,
  Candidate,
  RecommendedProduct,
  User,
} from "@/lib/types";
import { useLanguage } from "@/components/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Baby,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  HeartHandshake,
  Layers,
  MousePointerClick,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Users2,
  Waves,
  X,
} from "lucide-react";

interface AdminMetrics {
  totalUsers: number;
  totalCandidates: number;
  completedAssessments: number;
  talentPoolCount: number;
  totalAdImpressions: number;
  totalAdClicks: number;
  averageCTR: string;
}

interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  childrenCount: number;
  childrenNames: string;
  createdAt: string;
  campaignsCreated: number;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<"users" | "talent_pool" | "monetization" | "affiliates">("users");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [talentPool, setTalentPool] = useState<Candidate[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);

  // Affiliate & Amazon Settings state
  const [affiliateSettings, setAffiliateSettings] = useState<AffiliateSettings | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [amazonTagInput, setAmazonTagInput] = useState("matchcaring-20");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Add Recommended Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"activities" | "books" | "daily_use" | "safety">("activities");
  const [newProdMinAge, setNewProdMinAge] = useState("1");
  const [newProdMaxAge, setNewProdMaxAge] = useState("4");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newProdAffiliateUrl, setNewProdAffiliateUrl] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("$24.99");
  const [newProdBenefit, setNewProdBenefit] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Filters for Talent Pool
  const [nannySearch, setNannySearch] = useState("");
  const [nannyFilter, setNannyFilter] = useState<"all" | "in_pool" | "top_score" | "cpr">("all");

  // Create Ad Modal
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [newSponsor, setNewSponsor] = useState("");
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdHeadline, setNewAdHeadline] = useState("");
  const [newAdDesc, setNewAdDesc] = useState("");
  const [newAdCategory, setNewAdCategory] = useState<AdCategory>("books");
  const [newAdPlacement, setNewAdPlacement] = useState<AdPlacement>("dashboard_banner");
  const [newAdImageUrl, setNewAdImageUrl] = useState("");
  const [newMinAge, setNewMinAge] = useState("2");
  const [newMaxAge, setNewMaxAge] = useState("4");
  const [newCtaText, setNewCtaText] = useState(language === "es" ? "Ver Oferta" : "Learn More");
  const [newCtaUrl, setNewCtaUrl] = useState("https://");
  const [creatingAd, setCreatingAd] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, poolRes, adsRes, affRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/nannies"),
        fetch("/api/admin/ads"),
        fetch("/api/admin/affiliates"),
      ]);

      if (statsRes.status === 403 || statsRes.status === 401) {
        // Not admin
        router.push("/dashboard");
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setMetrics(statsData.metrics);
        setUsers(statsData.users || []);
      }

      if (poolRes.ok) {
        const poolData = await poolRes.json();
        setTalentPool(poolData.pool || []);
      }

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData.ads || []);
      }

      if (affRes.ok) {
        const affData = await affRes.json();
        setAffiliateSettings(affData.settings);
        setAmazonTagInput(affData.settings?.amazonTag || "matchcaring-20");
        setRecommendedProducts(affData.products || []);
      }
    } catch (err) {
      console.error("Admin fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTalentPool = async (candidateId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      const res = await fetch("/api/admin/nannies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          inTalentPool: newVal,
          talentPoolStatus: newVal ? "available" : "review",
        }),
      });

      if (res.ok) {
        setTalentPool((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, inTalentPool: newVal, talentPoolStatus: newVal ? "available" : "review" }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAdActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm(language === "es" ? "¿Eliminar este anuncio publicitario?" : "Delete this ad campaign?")) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAds((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsor.trim() || !newAdTitle.trim()) return;
    setCreatingAd(true);

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorName: newSponsor.trim(),
          title: newAdTitle.trim(),
          headline: newAdHeadline.trim(),
          description: newAdDesc.trim(),
          imageUrl: newAdImageUrl.trim() || undefined,
          category: newAdCategory,
          placement: newAdPlacement,
          targetMinAge: parseInt(newMinAge, 10),
          targetMaxAge: parseInt(newMaxAge, 10),
          badgeText: `${newSponsor} • ${newMinAge}-${newMaxAge} ${language === "es" ? "Años" : "yo"}`,
          ctaText: newCtaText.trim(),
          ctaUrl: newCtaUrl.trim(),
          active: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAds((prev) => [data.ad, ...prev]);
        setIsAdModalOpen(false);
        setNewSponsor("");
        setNewAdTitle("");
        setNewAdHeadline("");
        setNewAdDesc("");
        setNewAdImageUrl("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingAd(false);
    }
  };

  const handleSaveAmazonTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amazonTagInput.trim()) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amazonTag: amazonTagInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliateSettings(data.settings);
        setSettingsSavedSuccess(true);
        setTimeout(() => setSettingsSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim() || !newProdAffiliateUrl.trim()) return;
    setCreatingProduct(true);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProdTitle.trim(),
          category: newProdCategory,
          targetMinAge: parseInt(newProdMinAge, 10),
          targetMaxAge: parseInt(newProdMaxAge, 10),
          imageUrl: newProdImageUrl.trim() || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
          affiliateUrl: newProdAffiliateUrl.trim(),
          priceEstimate: newProdPrice.trim() || "$19.99",
          pedagogicalBenefitEs: newProdBenefit.trim() || "Recomendado para el desarrollo y seguridad infantil.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedProducts((prev) => [data.product, ...prev]);
        setIsProductModalOpen(false);
        setNewProdTitle("");
        setNewProdAffiliateUrl("");
        setNewProdImageUrl("");
        setNewProdBenefit("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(language === "es" ? "¿Eliminar este producto recomendado?" : "Delete this recommended product?")) return;
    try {
      const res = await fetch(`/api/admin/affiliates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecommendedProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPool = talentPool.filter((nanny) => {
    const matchesSearch =
      nanny.name.toLowerCase().includes(nannySearch.toLowerCase()) ||
      (nanny.email && nanny.email.toLowerCase().includes(nannySearch.toLowerCase())) ||
      (nanny.profile?.highestEducation &&
        nanny.profile.highestEducation.toLowerCase().includes(nannySearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (nannyFilter === "in_pool") return nanny.inTalentPool;
    if (nannyFilter === "top_score") return (nanny.result?.overallScore || 0) >= 90;
    if (nannyFilter === "cpr") return nanny.profile?.hasCprCertification;

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {language === "es" ? "Cargando Centro de Mando Super Admin..." : "Loading Super Admin Command Center..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Super Admin Executive Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white tracking-tight text-lg">MatchCaring Bio</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {language === "es" ? "Analíticas • Banco de Niñeras • Motor de Monetización" : "Analytics • Talent Pool • Monetization Engine"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all hover:scale-102"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Volver al Panel Familiar" : "Return to Family Dashboard"}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute right-0 top-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "es" ? "Control Maestro del Ecosistema" : "Ecosystem Master Control"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t.superAdminTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {t.superAdminSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setIsAdModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.createAdCampaign}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.totalRegisteredFamilies}</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalUsers}</p>
              <p className="text-[10px] text-sky-400 mt-0.5">Cuentas activas</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.totalEvaluations}</span>
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{metrics.completedAssessments}</p>
              <p className="text-[10px] text-indigo-400 mt-0.5">Tests terminados</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.nanniesInPool}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">{metrics.talentPoolCount}</p>
              <p className="text-[10px] text-amber-300 mt-0.5">Disponibles</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.adImpressions}</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalAdImpressions}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Vistas totales</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.adClicks}</span>
                <MousePointerClick className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalAdClicks}</p>
              <p className="text-[10px] text-rose-400 mt-0.5">Interacciones</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.averageCtr}</span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-2xl font-black text-teal-400 mt-2">{metrics.averageCTR}</p>
              <p className="text-[10px] text-teal-300 mt-0.5">Conversión media</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-slate-800 text-white shadow-md border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>{t.tabPlatformUsers} ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("talent_pool")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "talent_pool"
                ? "bg-slate-800 text-white shadow-md border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.tabTalentPool} ({talentPool.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("monetization")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "monetization"
                ? "bg-slate-800 text-white shadow-md border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{t.tabMonetization} ({ads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("affiliates")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "affiliates"
                ? "bg-slate-800 text-white shadow-md border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>{language === "es" ? "Afiliados Amazon" : "Amazon Affiliates"} ({recommendedProducts.length})</span>
          </button>
        </div>

        {/* TAB 1: USERS ANALYTICS */}
        {activeTab === "users" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">{t.registeredUsersList}</h2>
                <p className="text-xs text-slate-400">
                  {language === "es"
                    ? "Familias que han creado cuentas, configurado hijos y lanzado pruebas de selección."
                    : "Families who registered, added children, and launched nanny assessments."}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {users.length} {language === "es" ? "Familias Activas" : "Active Families"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Usuario / Familia</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Rol</th>
                    <th className="py-3.5 px-6">Hijos Registrados</th>
                    <th className="py-3.5 px-6">Procesos Creados</th>
                    <th className="py-3.5 px-6">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{u.email}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === "admin"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80">
                          <Baby className="w-3.5 h-3.5 text-amber-400" />
                          <span>{u.childrenNames}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">{u.campaignsCreated}</td>
                      <td className="py-4 px-6 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: NANNY TALENT POOL */}
        {activeTab === "talent_pool" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={language === "es" ? "Buscar por nombre, correo o formación..." : "Search by name, email, or education..."}
                  value={nannySearch}
                  onChange={(e) => setNannySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setNannyFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nannyFilter === "all" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Todas ({talentPool.length})
                </button>
                <button
                  onClick={() => setNannyFilter("in_pool")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nannyFilter === "in_pool" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {language === "es" ? "En Talent Pool" : "In Pool"}
                </button>
                <button
                  onClick={() => setNannyFilter("top_score")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nannyFilter === "top_score" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Top Score (90%+)
                </button>
                <button
                  onClick={() => setNannyFilter("cpr")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nannyFilter === "cpr" ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {language === "es" ? "Con Certificación RCP" : "CPR Certified"}
                </button>
              </div>
            </div>

            {/* Talent Pool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPool.map((nanny) => {
                const score = nanny.result?.overallScore || 0;
                const tier = nanny.result?.tier || "Evaluating";
                const isTopFit = tier === "Exceptional Fit" || score >= 90;

                return (
                  <div
                    key={nanny.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4 group shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${
                              isTopFit
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {nanny.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              {nanny.name}
                            </h3>
                            <p className="text-[11px] text-slate-400">{nanny.roleTarget}</p>
                          </div>
                        </div>

                        {/* Verified Score Badge */}
                        <div className="text-right">
                          <span
                            className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                              isTopFit
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {score}%
                          </span>
                        </div>
                      </div>

                      {/* Location and Profile stats */}
                      {nanny.profile && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {nanny.profile.yearsOfExperience} {language === "es" ? "años exp" : "yrs exp"}
                          </span>
                          {nanny.profile.hasCprCertification && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> RCP
                            </span>
                          )}
                          {nanny.profile.countryOfResidence && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              📍 {nanny.profile.countryOfResidence}
                            </span>
                          )}
                          {nanny.profile.preferredHourlyRate && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                              💵 {nanny.profile.preferredHourlyRate}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Clinical Summary */}
                      {nanny.result?.summary && (
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 line-clamp-2">
                          {language === "es" && nanny.result.summaryEs
                            ? nanny.result.summaryEs
                            : nanny.result.summary}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      {/* Talent Pool Toggle */}
                      <button
                        onClick={() => handleToggleTalentPool(nanny.id, !!nanny.inTalentPool)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          nanny.inTalentPool
                            ? "bg-amber-400/20 text-amber-300 border-amber-400/30 hover:bg-amber-400/30"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {nanny.inTalentPool
                            ? language === "es"
                              ? "En Talent Pool ✓"
                              : "In Talent Pool ✓"
                            : language === "es"
                            ? "+ Guardar en Pool"
                            : "+ Add to Pool"}
                        </span>
                      </button>

                      {/* View Scorecard */}
                      <Link
                        href={`/dashboard/candidate/${nanny.id}`}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>{language === "es" ? "Ver Ficha" : "Scorecard"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MONETIZATION & ADS ENGINE */}
        {activeTab === "monetization" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>{language === "es" ? "Campañas Publicitarias Segmentadas por Edad" : "Age-Targeted Advertising Campaigns"}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === "es"
                      ? "Monetiza el tráfico gratuito de la plataforma mostrando anuncios altamente relevantes según la edad de los hijos de cada familia (pañales para bebés, libros/juguetes para toddlers, actividades preescolares)."
                      : "Monetize free platform traffic with age-targeted sponsor recommendations based on child age."}
                  </p>
                </div>

                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t.createAdCampaign}</span>
                </button>
              </div>

              {/* Ads Table */}
              <div className="divide-y divide-slate-800">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                  >
                    <div className="flex items-start gap-4">
                      {ad.imageUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group/thumb">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          {ad.category === "books" ? (
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                          ) : ad.category === "education" ? (
                            <Waves className="w-6 h-6 text-teal-400" />
                          ) : (
                            <Tag className="w-6 h-6 text-amber-400" />
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-white">{ad.sponsorName}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {ad.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            👶 {language === "es" ? `Edad: ${ad.targetMinAge} a ${ad.targetMaxAge} años` : `Age: ${ad.targetMinAge}-${ad.targetMaxAge}yo`}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {ad.placement}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-white">{ad.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{ad.description}</p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">
                            <strong className="text-white">{ad.impressions}</strong> {language === "es" ? "vistas" : "views"}
                          </span>
                          <span className="text-slate-400">
                            <strong className="text-white">{ad.clicks}</strong> {language === "es" ? "clics" : "clicks"}
                          </span>
                          <span className="font-bold text-emerald-400">
                            {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}% CTR
                          </span>
                        </div>
                      </div>

                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleAdActive(ad.id, ad.active)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          ad.active
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {ad.active ? (language === "es" ? "Activo" : "Active") : (language === "es" ? "Pausado" : "Paused")}
                      </button>

                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AMAZON AFFILIATES & RECOMMENDED PRODUCTS */}
        {activeTab === "affiliates" && (
          <div className="space-y-6">
            {/* Amazon Account Configuration Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {language === "es"
                        ? "Configuración de Cuenta Amazon Associates"
                        : "Amazon Associates Account Settings"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                      {language === "es"
                        ? "Ingresa tu Tracking ID o Tag de Afiliado de Amazon (ej. matchcaring-20). Todos los enlaces a productos y kits de estimulación en la app inyectarán tu código automáticamente para atribuirte comisiones de venta."
                        : "Set your Amazon Associate Tag (e.g. matchcaring-20). All product and kit links in the platform automatically append this tag to attribute purchase commissions."}
                    </p>
                  </div>
                </div>

                {/* Tag Input Form */}
                <form onSubmit={handleSaveAmazonTag} className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="ej. tu-tag-20"
                      value={amazonTagInput}
                      onChange={(e) => setAmazonTagInput(e.target.value)}
                      className="px-3.5 py-2 text-xs font-mono font-bold bg-slate-950 border border-amber-500/40 rounded-xl focus:ring-2 focus:ring-amber-400 text-amber-300 outline-none w-48"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-4 py-2 text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {savingSettings
                      ? language === "es"
                        ? "Guardando..."
                        : "Saving..."
                      : language === "es"
                      ? "Guardar Tag"
                      : "Save Tag"}
                  </button>
                </form>
              </div>

              {settingsSavedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>
                    {language === "es"
                      ? `¡Tag de Amazon guardado exitosamente! Ahora activo: ${amazonTagInput}`
                      : `Amazon Associate tag successfully saved and active: ${amazonTagInput}`}
                  </span>
                </div>
              )}
            </div>

            {/* Products Catalog Manager */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {language === "es" ? "Artículos & Actividades para Padres" : "Curated Parent Gear Catalog"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === "es"
                      ? "Productos recomendados que ven los padres en su dashboard según la edad de sus hijos."
                      : "Items displayed in the parent dashboard matched to children ages."}
                  </p>
                </div>

                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{language === "es" ? "+ Agregar Artículo Recomendado" : "+ Add Recommended Item"}</span>
                </button>
              </div>

              {/* Products Table/List */}
              <div className="divide-y divide-slate-800">
                {recommendedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {prod.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            👶 {prod.targetMinAge} - {prod.targetMaxAge} {language === "es" ? "años" : "yo"}
                          </span>
                          <span className="text-xs font-bold text-amber-300">
                            {prod.priceEstimate}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-white">{prod.title}</h4>
                        <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{prod.pedagogicalBenefitEs}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={prod.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                      >
                        <span>{language === "es" ? "Probar Enlace" : "Test Link"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE AD MODAL */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-800 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{t.createAdCampaign}</h3>
                  <p className="text-xs text-slate-400">
                    {language === "es"
                      ? "Configura un anuncio segmentado por rango de edad del hijo"
                      : "Configure an ad targeted by child age range"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {t.sponsorName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Pampers, Lego, Lovevery"
                    value={newSponsor}
                    onChange={(e) => setNewSponsor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {t.adCategory}
                  </label>
                  <select
                    value={newAdCategory}
                    onChange={(e) => setNewAdCategory(e.target.value as AdCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                  >
                    <option value="diapers">Pañales & Bebé (0-2a)</option>
                    <option value="books">Libros & Cuentos (2-5a)</option>
                    <option value="toys">Juguetes Sensoriales / Montessori</option>
                    <option value="education">Educación & Natación</option>
                    <option value="gear">Coches & Accesorios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Título del Anuncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Pañales Hipoalergénicos & Toallitas Orgánicas"
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Titular Destacado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Máxima absorción y cuidado dermatológico"
                  value={newAdHeadline}
                  onChange={(e) => setNewAdHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe la propuesta de valor para los padres..."
                  value={newAdDesc}
                  onChange={(e) => setNewAdDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {language === "es" ? "URL de la Imagen del Anuncio (Opcional)" : "Ad Image URL (Optional)"}
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... o enlace de producto"
                  value={newAdImageUrl}
                  onChange={(e) => setNewAdImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                />
                {newAdImageUrl.trim() && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={newAdImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-bold">✓ {language === "es" ? "Vista previa activa" : "Live preview"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Age Range Targeting */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                    Edad Mínima del Hijo (Años)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={newMinAge}
                    onChange={(e) => setNewMinAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                    Edad Máxima del Hijo (Años)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={newMaxAge}
                    onChange={(e) => setNewMaxAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Texto Botón CTA
                  </label>
                  <input
                    type="text"
                    value={newCtaText}
                    onChange={(e) => setNewCtaText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    URL de Destino
                  </label>
                  <input
                    type="url"
                    required
                    value={newCtaUrl}
                    onChange={(e) => setNewCtaUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creatingAd}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {creatingAd ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Lanzar Campaña" : "Launch Campaign")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RECOMMENDED PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-800 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {language === "es" ? "Agregar Artículo Recomendado" : "Add Recommended Product"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "es"
                      ? "Se vinculará automáticamente con tu Tracking Tag de Amazon"
                      : "Automatically bound to your Amazon Associate Tag"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Título del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Tablero Montessori de Madera"
                    value={newProdTitle}
                    onChange={(e) => setNewProdTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                  >
                    <option value="activities">Actividades & Juegos</option>
                    <option value="books">Libros & Emociones</option>
                    <option value="daily_use">Uso Diario & Cuidados</option>
                    <option value="safety">Seguridad Infantil</option>
                  </select>
                </div>
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                    Edad Mín. (Años)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={newProdMinAge}
                    onChange={(e) => setNewProdMinAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                    Edad Máx. (Años)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={newProdMaxAge}
                    onChange={(e) => setNewProdMaxAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Precio Aprox.
                  </label>
                  <input
                    type="text"
                    placeholder="$29.99"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL de Imagen del Producto
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... o enlace de imagen"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                />
                {newProdImageUrl.trim() && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={newProdImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-bold">✓ Vista previa de imagen activa</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Amazon Affiliate URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Enlace de Compra en Amazon *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/... o enlace de búsqueda"
                  value={newProdAffiliateUrl}
                  onChange={(e) => setNewProdAffiliateUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Nota: Tu Tag de Afiliado ({amazonTagInput}) se agregará automáticamente al enlace final.
                </p>
              </div>

              {/* Pedagogical Benefit */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Beneficio Pedagógico o de Seguridad
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Estimula la motricidad fina y concentración durante momentos a solas con la niñera..."
                  value={newProdBenefit}
                  onChange={(e) => setNewProdBenefit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creatingProduct
                    ? language === "es"
                      ? "Guardando..."
                      : "Saving..."
                    : language === "es"
                    ? "Guardar Producto"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
