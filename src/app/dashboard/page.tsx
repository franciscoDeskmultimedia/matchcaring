"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ShareModal from "@/components/ShareModal";
import AgeTargetedAdCard from "@/components/AgeTargetedAdCard";
import RecommendedProductsSection from "@/components/RecommendedProductsSection";
import NannyPoolExplorer from "@/components/NannyPoolExplorer";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import QuestionBankModal from "@/components/QuestionBankModal";
import { Candidate, CareCategory, Child, ParentCampaign, User } from "@/lib/types";
import { useLanguage } from "@/components/LanguageContext";
import {
  AlertOctagon,
  ArrowRight,
  Baby,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Layers,
  Plus,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Users2,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isChildrenModalOpen, setIsChildrenModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("1");
  const [newChildNotes, setNewChildNotes] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [dashboardView, setDashboardView] = useState<"candidates" | "pool">("candidates");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("all");

  // Share Modal state
  const [shareCandidate, setShareCandidate] = useState<Candidate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Campaigns and Question Bank state
  const [campaigns, setCampaigns] = useState<ParentCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("manageChildren") === "true") {
        setIsChildrenModalOpen(true);
      }
      if (params.get("newCampaign") === "true") {
        setIsCreateCampaignOpen(true);
      }
      if (params.get("campaignId")) {
        setSelectedCampaignId(params.get("campaignId")!);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch children
      const childRes = await fetch("/api/children");
      if (childRes.ok) {
        const childData = await childRes.json();
        setChildrenList(childData.children || []);
      }

      // Fetch campaigns
      const campRes = await fetch("/api/campaigns");
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      const candRes = await fetch("/api/candidates");
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData.candidates || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (
      !confirm(
        language === "es"
          ? `¿Eliminar la campaña "${title}"?`
          : `Delete campaign "${title}"?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete campaign error:", err);
    }
  };

  const handleCopyCampaignLink = (campaign: ParentCampaign) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = campaign.publicToken
      ? `${origin}/test/${campaign.publicToken}`
      : `${origin}/dashboard/new?campaignId=${campaign.id}`;
    navigator.clipboard.writeText(link);
    setCopiedCampaignId(campaign.id);
    setTimeout(() => setCopiedCampaignId(null), 2000);
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(t.confirmDelete(name))) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete candidate error:", err);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    setAddingChild(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildName,
          age: parseInt(newChildAge, 10),
          notes: newChildNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChildrenList((prev) => [...prev, data.child]);
        setNewChildName("");
        setNewChildNotes("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingChild(false);
    }
  };

  const handleDeleteChild = async (id: string) => {
    if (childrenList.length <= 1) {
      alert(language === "es" ? "Debes mantener al menos un hijo registrado." : "You must keep at least one child registered.");
      return;
    }
    try {
      const res = await fetch(`/api/children?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setChildrenList((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (token: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/test/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation
  const completedCandidates = candidates.filter((c) => c.status === "completed" && c.result);
  const pendingCandidates = candidates.filter((c) => c.status === "invited" || c.status === "in_progress");
  const candidatesWithRedFlags = completedCandidates.filter(
    (c) => c.result && c.result.redFlags && c.result.redFlags.length > 0
  );
  const topCandidate = completedCandidates.reduce<Candidate | null>((top, current) => {
    if (!top || (current.result?.overallScore || 0) > (top.result?.overallScore || 0)) {
      return current;
    }
    return top;
  }, null);

  // Active Campaign derivation
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Active target recipient (child, elderly, disability)
  const activeRecipient = activeCampaign?.targetChildren?.[0] ||
    (childFilter !== "all" && childFilter !== "siblings"
      ? childrenList.find((k) => k.id === childFilter)
      : childrenList[0]);

  const activeAge = activeRecipient?.age ?? user?.childProfile?.age ?? 3;
  const activeName = activeRecipient?.name ?? user?.childProfile?.name ?? (language === "es" ? "Familiar" : "Family Member");

  // Active Care Category
  const activeCareCategory: CareCategory | "all" = activeCampaign?.careCategory
    ? activeCampaign.careCategory
    : activeAge >= 60
    ? "elderly_care"
    : activeRecipient?.notes && /tea|autis|discapacidad|ruedas|sensorial/i.test(activeRecipient.notes)
    ? "disability_care"
    : selectedCampaignId !== "all"
    ? "childcare"
    : "all";

  // Filtered list
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roleTarget && c.roleTarget.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter by selected campaign
    if (selectedCampaignId !== "all" && activeCampaign) {
      const matchesCampaignId = c.campaignId === selectedCampaignId;
      const matchesChildren = activeCampaign.targetChildren?.some((k) =>
        c.targetChildren?.some((tc) => tc.id === k.id) ||
        (!c.targetChildren && c.roleTarget.toLowerCase().includes(k.name.toLowerCase()))
      );
      const matchesTitle =
        activeCampaign.title &&
        c.roleTarget.toLowerCase().includes(activeCampaign.title.toLowerCase());

      if (!matchesCampaignId && !matchesChildren && !matchesTitle) {
        return false;
      }
    }

    // Filter by child campaign
    if (childFilter !== "all") {
      if (childFilter === "siblings") {
        const isSiblings =
          (c.targetChildren && c.targetChildren.length > 1) ||
          (!c.targetChildren && (
            c.roleTarget.toLowerCase().includes("&") ||
            c.roleTarget.toLowerCase().includes(" y ") ||
            c.roleTarget.toLowerCase().includes("hermanos") ||
            c.roleTarget.toLowerCase().includes("siblings")
          ));
        if (!isSiblings) return false;
      } else {
        const matchesChild =
          c.targetChildren?.some((k) => k.id === childFilter) ||
          (!c.targetChildren &&
            childrenList
              .filter((k) => k.id === childFilter)
              .some((k) => c.roleTarget.toLowerCase().includes(k.name.toLowerCase())));
        if (!matchesChild) return false;
      }
    }

    if (statusFilter === "completed") return c.status === "completed";
    if (statusFilter === "pending") return c.status === "invited" || c.status === "in_progress";
    if (statusFilter === "redflags") {
      return c.result && c.result.redFlags && c.result.redFlags.length > 0;
    }
    if (statusFilter === "topfit") {
      return c.result && (c.result.tier === "Exceptional Fit" || c.result.overallScore >= 88);
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">
            {language === "es" ? "Cargando Panel de Reclutamiento..." : "Loading Recruitment Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  const childName = activeName;
  const childAge = activeAge;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user ? { ...user, children: childrenList } : null}
        onOpenCreateCampaign={() => setIsCreateCampaignOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Child Profile Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-semibold border border-sky-400/30">
                  <Baby className="w-3.5 h-3.5 text-sky-300" />
                  <span>{t.activeRecruitment}</span>
                </div>

                {/* Children Roster Badge */}
                {childrenList.length > 0 && (
                  <button
                    onClick={() => setIsChildrenModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-semibold border border-amber-400/30 transition-colors cursor-pointer"
                  >
                    <Users2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {childrenList.map((c) => `${c.name} (${c.age}${language === "es" ? "a" : "y"})`).join(" • ")}
                    </span>
                    <Settings2 className="w-3 h-3 text-amber-300 ml-0.5" />
                  </button>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {childrenList.length > 1
                  ? language === "es"
                    ? `Evaluación y Campañas para ${childrenList.map((c) => c.name).join(" y ")}`
                    : `Screening & Campaigns for ${childrenList.map((c) => c.name).join(" & ")}`
                  : t.campaignTitle(childName, childAge)}
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {t.campaignDesc}
              </p>

              {/* Child Campaign Direct Actions */}
              {childrenList.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-sky-200 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {language === "es" ? "Proceso rápido por hijo:" : "Quick process by child:"}
                  </span>
                  {childrenList.map((kid) => (
                    <Link
                      key={kid.id}
                      href={`/dashboard/new?child=${kid.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all hover:scale-102"
                    >
                      <Baby className="w-3.5 h-3.5 text-sky-300" />
                      <span>{t.newCampaignForChild(kid.name, kid.age)}</span>
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/new?mode=siblings"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 text-xs font-semibold border border-indigo-400/40 transition-all hover:scale-102"
                  >
                    <Users2 className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{t.newCampaignForSiblings}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Primary: Create Campaign */}
              <button
                onClick={() => setIsCreateCampaignOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>{language === "es" ? "+ Nueva Campaña" : "+ New Campaign"}</span>
              </button>

              {/* Direct Invite Nanny */}
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4 text-sky-300" />
                <span>{t.inviteNewCandidate}</span>
              </Link>

              {/* Question Bank Direct Button */}
              <button
                onClick={() => setIsQuestionBankOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs sm:text-sm border border-slate-700/80 transition-all active:scale-95 shrink-0 cursor-pointer"
                title={language === "es" ? "Abrir Banco de Preguntas" : "Open Question Bank"}
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{language === "es" ? "Banco de Preguntas" : "Question Bank"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.totalEvaluated}
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {candidates.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {t.candidatesFinished(completedCandidates.length, pendingCandidates.length)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.topCandidate}
              </span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 truncate">
              {topCandidate ? topCandidate.name : (language === "es" ? "Ninguna aún" : "None yet")}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {topCandidate?.result
                ? `${topCandidate.result.overallScore}% (${language === "es" && topCandidate.result.tierEs ? topCandidate.result.tierEs : topCandidate.result.tier})`
                : t.sendToViewRankings}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.pendingResponses}
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {pendingCandidates.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {t.testUrlsSent}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.redFlagAlerts}
              </span>
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
              {candidatesWithRedFlags.length}
            </p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">
              {t.requiringCaution}
            </p>
          </div>
        </div>

        {/* Parent Screening Campaigns Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>
                    {language === "es"
                      ? "Mis Campañas de Selección"
                      : "My Screening Campaigns"}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    {campaigns.length} {language === "es" ? "campañas" : "campaigns"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === "es"
                    ? "Crea procesos personalizados para cada hijo o necesidad. Cada campaña genera un link público de postulación."
                    : "Create tailored screening funnels per child. Each campaign generates a public application link."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsQuestionBankOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === "es" ? "Banco de Preguntas" : "Question Bank"}</span>
              </button>

              <button
                onClick={() => setIsCreateCampaignOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md shadow-sky-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === "es" ? "+ Nueva Campaña" : "+ New Campaign"}</span>
              </button>
            </div>
          </div>

          {/* Campaign Quick Selector Bar with Dropdown & Pills */}
          {campaigns.length > 0 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {language === "es" ? "Filtrar por Campaña:" : "Filter by Campaign:"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {campaigns.length} {language === "es" ? "activas" : "active"}
                  </span>
                </div>

                {/* Dropdown control for long titles without edge cutoff */}
                <div className="relative w-full sm:w-72">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full appearance-none px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 pr-9 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="all">
                      🌐 {language === "es" ? `Todas las Campañas (${campaigns.length})` : `All Campaigns (${campaigns.length})`}
                    </option>
                    {campaigns.map((c) => {
                      const emoji =
                        c.careCategory === "elderly_care"
                          ? "👵"
                          : c.careCategory === "disability_care"
                          ? "♿"
                          : "👶";
                      return (
                        <option key={c.id} value={c.id}>
                          {emoji} {c.title}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Quick Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                <button
                  onClick={() => setSelectedCampaignId("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedCampaignId === "all"
                      ? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>🌐</span>
                  <span>{language === "es" ? "Todas" : "All"}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 font-black">
                    {campaigns.length}
                  </span>
                </button>

                {campaigns.map((c) => {
                  const isSel = selectedCampaignId === c.id;
                  const emoji =
                    c.careCategory === "elderly_care"
                      ? "👵"
                      : c.careCategory === "disability_care"
                      ? "♿"
                      : "👶";
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCampaignId(isSel ? "all" : c.id)}
                      title={c.title}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        isSel
                          ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-400"
                          : "bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300"
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="truncate max-w-[200px]">{c.title}</span>
                      {isSel && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {language === "es"
                  ? "Aún no has creado campañas personalizadas"
                  : "No custom screening campaigns yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === "es"
                  ? "Crea una campaña para definir el tipo de horario, tarifa estimada y seleccionar preguntas clave de tu banco para evaluar a las candidatas."
                  : "Create a campaign to define schedule type, estimated hourly rate, and attach key questions to evaluate applicants."}
              </p>
              <button
                onClick={() => setIsCreateCampaignOpen(true)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
              >
                {language === "es" ? "+ Crear mi Primera Campaña" : "+ Create My First Campaign"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((camp) => {
                const isSelected = selectedCampaignId === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(isSelected ? "all" : camp.id)}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group cursor-pointer ${
                      isSelected
                        ? "border-sky-500 ring-2 ring-sky-500/40 bg-sky-50/70 shadow-md"
                        : "border-slate-200/90 bg-gradient-to-b from-slate-50/50 to-white hover:border-sky-300 hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isSelected ? (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-600 text-white shadow-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-white" />
                              <span>{language === "es" ? "Seleccionada" : "Selected"}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {language === "es" ? "Activa" : "Active"}
                            </span>
                          )}

                          {camp.careCategory === "elderly_care" ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                              <span>👵</span>
                              <span>{language === "es" ? "Adulto Mayor" : "Elderly Care"}</span>
                            </span>
                          ) : camp.careCategory === "disability_care" ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-900 border border-purple-300 flex items-center gap-1">
                              <span>♿</span>
                              <span>{language === "es" ? "Discapacidad" : "Special Needs"}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100/80 text-sky-900 border border-sky-300 flex items-center gap-1">
                              <span>👶</span>
                              <span>{language === "es" ? "Infantil" : "Childcare"}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(camp.id, camp.title);
                          }}
                          title={language === "es" ? "Eliminar campaña" : "Delete campaign"}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h3
                          className={`text-sm font-black transition-colors line-clamp-1 ${
                            isSelected ? "text-sky-900" : "text-slate-900 group-hover:text-sky-600"
                          }`}
                        >
                          {camp.title}
                        </h3>
                        {camp.notes && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {camp.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {camp.targetChildren?.map((k) => (
                          <span
                            key={k.id}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1"
                          >
                            <Baby className="w-3 h-3 text-amber-600" />
                            <span>{k.name} ({k.age}a)</span>
                          </span>
                        ))}

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {camp.scheduleType === "full_time"
                            ? language === "es" ? "Tiempo Completo" : "Full Time"
                            : camp.scheduleType === "part_time"
                            ? language === "es" ? "Medio Tiempo" : "Part Time"
                            : camp.scheduleType === "weekends"
                            ? language === "es" ? "Fines de Semana" : "Weekends"
                            : language === "es" ? "Por Horas" : "Hourly"}
                        </span>

                        {camp.expectedHourlyRate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                            {camp.expectedHourlyRate}
                          </span>
                        )}

                        {camp.customQuestions && camp.customQuestions.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {camp.customQuestions.length} {language === "es" ? "preguntas" : "questions"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      {/* Select / Enter Campaign Main Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaignId(isSelected ? "all" : camp.id);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                            : "bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-sky-300 shadow-2xs"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                            <span>{language === "es" ? "✓ Campaña Activa (Clic para ver todas)" : "✓ Active Campaign (Click for all)"}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-sky-600" />
                            <span>{language === "es" ? "🎯 Entrar a esta Campaña" : "🎯 Select & Enter Campaign"}</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCampaignLink(camp);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>
                            {copiedCampaignId === camp.id
                              ? language === "es" ? "¡Copiado!" : "Copied!"
                              : language === "es" ? "Copiar Enlace" : "Copy Link"}
                          </span>
                        </button>

                        <Link
                          href={`/dashboard/new?campaignId=${camp.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title={language === "es" ? "Invitar candidata a esta campaña" : "Invite candidate to this campaign"}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === "es" ? "Invitar" : "Invite"}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Family Care Recipients Hub */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{language === "es" ? "Familiares y Personas a Cuidar" : "Family Members & Care Recipients"}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {childrenList.length} {language === "es" ? "registrado(s)" : "registered"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === "es"
                    ? "Registra a tus hijos, adultos mayores o personas con discapacidad para adaptar las preguntas clínicas y dinámicas de cuidado."
                    : "Register children, elderly relatives, or individuals with special needs to adapt clinical questions and care protocols."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChildrenModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === "es" ? "+ Agregar Familiar o Niño" : "+ Add Member / Child"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childrenList.map((kid) => {
              const childCandidatesCount = candidates.filter(
                (c) =>
                  c.targetChildren?.some((k) => k.id === kid.id) ||
                  (!c.targetChildren && c.roleTarget.toLowerCase().includes(kid.name.toLowerCase()))
              ).length;

              const isElderly = kid.age >= 60 || (kid.notes && /abuel|mayor|ancian|alzheimer|demencia/i.test(kid.notes));
              const isDisability = kid.notes && /tea|autis|discapacidad|ruedas|motor|sensorial/i.test(kid.notes);
              const avatarEmoji = isElderly ? "👵" : isDisability ? "♿" : "👶";
              const tagLabel = isElderly
                ? (language === "es" ? "Adulto Mayor" : "Elderly")
                : isDisability
                ? (language === "es" ? "Cuidado Especial" : "Special Needs")
                : (language === "es" ? (kid.age <= 2 ? "Lactante" : kid.age <= 5 ? "Primera Infancia" : "Escolar") : "Childcare");

              return (
                <div
                  key={kid.id}
                  className="p-5 rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg">
                          {avatarEmoji}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                            {kid.name}
                          </h3>
                          <span className="inline-block text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md mt-0.5">
                            {kid.age} {language === "es" ? "años" : "years"} &bull; {tagLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsChildrenModalOpen(true)}
                        title={language === "es" ? "Editar / Configurar" : "Edit / Configure"}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>

                    {kid.notes ? (
                      <p className="text-xs text-slate-600 leading-relaxed bg-white/90 p-2.5 rounded-lg border border-slate-100 shadow-2xs line-clamp-3">
                        {kid.notes}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        {language === "es" ? "Sin notas adicionales." : "No specific notes."}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {childCandidatesCount} {language === "es" ? "candidata(s)" : "candidate(s)"}
                    </span>

                    <Link
                      href={`/dashboard/new?child=${kid.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>{language === "es" ? `Campaña para ${kid.name}` : `Campaign for ${kid.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Member Card */}
            <button
              onClick={() => setIsChildrenModalOpen(true)}
              className="p-6 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/20 hover:bg-amber-50/60 transition-all flex flex-col items-center justify-center gap-2.5 text-center group cursor-pointer min-h-[140px]"
            >
              <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 shadow-xs transition-transform">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 group-hover:text-amber-900">
                  {language === "es" ? "+ Registrar Nueva Persona a Cuidar" : "+ Register New Care Recipient"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === "es" ? "Hijos, adultos mayores o necesidades especiales" : "Children, elderly, or special needs"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Active Campaign Focus Notification Banner */}
        {selectedCampaignId !== "all" && activeCampaign && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border-2 border-sky-400/50">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl backdrop-blur-md border border-white/20 shrink-0 shadow-inner">
                  {activeCampaign.careCategory === "elderly_care"
                    ? "👵"
                    : activeCampaign.careCategory === "disability_care"
                    ? "♿"
                    : "👶"}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950 font-black">
                      {language === "es" ? "Campaña Seleccionada" : "Active Campaign Focus"}
                    </span>
                    <span className="text-xs font-bold text-sky-200">
                      {activeCampaign.careCategory === "elderly_care"
                        ? (language === "es" ? "👵 Adulto Mayor" : "👵 Elderly Care")
                        : activeCampaign.careCategory === "disability_care"
                        ? (language === "es" ? "♿ Cuidados Especiales" : "♿ Special Needs")
                        : (language === "es" ? "👶 Cuidado Infantil" : "👶 Childcare")}
                    </span>
                    {activeRecipient && (
                      <span className="text-xs text-amber-300 font-bold">
                        • {activeRecipient.name} ({activeRecipient.age}{language === "es" ? " años" : " yo"})
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {activeCampaign.title}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {language === "es"
                      ? "🎯 Vista enfocada: los anuncios patrocinados, el catálogo de recomendaciones de Amazon y las candidatas mostradas corresponden exclusivamente al perfil de esta campaña."
                      : "🎯 Focused view: sponsored ads, Amazon recommended products, and candidate lists correspond exclusively to this campaign's profile."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                <button
                  onClick={() => setSelectedCampaignId("all")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>{language === "es" ? "Ver Todas las Campañas (Limpiar Filtro)" : "View All Campaigns"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Age-Targeted Sponsored Recommendation Card */}
        <AgeTargetedAdCard
          childAge={activeAge}
          childName={activeName}
          careCategory={activeCareCategory}
          placement="dashboard_banner"
        />

        {/* View Switcher: Mis Candidatas vs Pool de Niñeras */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDashboardView("candidates")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                dashboardView === "candidates"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === "es" ? "Mis Candidatas Evaluadas" : "My Candidate Tests"}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  dashboardView === "candidates"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setDashboardView("pool")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                dashboardView === "pool"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              <span>{language === "es" ? "Pool de Niñeras Disponibles" : "Verified Nanny Pool"}</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {language === "es" ? "Reclutar" : "Hire"}
              </span>
            </button>
          </div>

          {dashboardView === "candidates" && (
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.inviteNewCandidate}</span>
            </Link>
          )}
        </div>

        {dashboardView === "candidates" ? (
          /* Candidate List Section */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Active Campaign Filter Notification inside Candidate Table */}
            {selectedCampaignId !== "all" && activeCampaign && (
              <div className="p-3 sm:px-6 bg-sky-50/90 border-b border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                  <span className="font-bold text-sky-950">
                    {language === "es" ? "Filtrando por Campaña:" : "Filtered by Campaign:"}
                  </span>
                  <span className="font-extrabold text-sky-800 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 shadow-2xs">
                    {activeCampaign.title}
                  </span>
                  <span className="text-slate-600 font-semibold">
                    ({filteredCandidates.length} {language === "es" ? "candidata(s)" : "candidate(s)"})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCampaignId("all")}
                  className="text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "Limpiar filtro de campaña" : "Clear campaign filter"}</span>
                </button>
              </div>
            )}

            {/* Child Campaign Filter Selector */}
          {childrenList.length > 1 && (
            <div className="p-3.5 sm:px-6 bg-gradient-to-r from-sky-50/80 to-indigo-50/50 border-b border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-sky-600" />
                  {t.filterByCampaign}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setChildFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    childFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {t.allChildrenCampaigns} ({candidates.length})
                </button>
                {childrenList.map((kid) => {
                  const count = candidates.filter(
                    (c) =>
                      c.targetChildren?.some((k) => k.id === kid.id) ||
                      (!c.targetChildren && c.roleTarget.toLowerCase().includes(kid.name.toLowerCase()))
                  ).length;
                  return (
                    <button
                      key={kid.id}
                      onClick={() => setChildFilter(kid.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        childFilter === kid.id
                          ? "bg-sky-700 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Baby className="w-3 h-3 text-sky-500" />
                      <span>{t.singleChildCampaign(kid.name, kid.age)} ({count})</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setChildFilter("siblings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    childFilter === "siblings"
                      ? "bg-indigo-700 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Users2 className="w-3 h-3 text-indigo-400" />
                  <span>
                    {t.siblingsCampaign} (
                    {
                      candidates.filter(
                        (c) =>
                          (c.targetChildren && c.targetChildren.length > 1) ||
                          (!c.targetChildren && (
                            c.roleTarget.toLowerCase().includes("&") ||
                            c.roleTarget.toLowerCase().includes(" y ") ||
                            c.roleTarget.toLowerCase().includes("hermanos") ||
                            c.roleTarget.toLowerCase().includes("siblings")
                          ))
                      ).length
                    }
                    )
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.filterAll} ({candidates.length})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "completed"
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.filterCompleted} ({completedCandidates.length})
              </button>
              <button
                onClick={() => setStatusFilter("topfit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "topfit"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.filterTopFit}
              </button>
              <button
                onClick={() => setStatusFilter("redflags")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "redflags"
                    ? "bg-rose-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.filterRedFlags} ({candidatesWithRedFlags.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.filterPending} ({pendingCandidates.length})
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          {filteredCandidates.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">{t.noCandidatesMatch}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.noCandidatesDesc}
              </p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.inviteNewCandidate}</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredCandidates.map((cand) => {
                const isCompleted = cand.status === "completed" && cand.result;
                const redFlagCount = cand.result?.redFlags?.length || 0;
                const tierLabel =
                  language === "es" && cand.result?.tierEs
                    ? cand.result.tierEs
                    : cand.result?.tier;

                return (
                  <div
                    key={cand.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    {/* Candidate Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                          isCompleted
                            ? cand.result?.tier === "Exceptional Fit"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : cand.result?.tier === "High Risk / Not Recommended"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-sky-100 text-sky-800 border border-sky-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {cand.name.charAt(0)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{cand.name}</h3>
                          {/* Status Badge */}
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              {t.assessmentCompleted}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {t.linkSentAwaiting}
                            </span>
                          )}

                          {/* Red Flag Badge */}
                          {redFlagCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertOctagon className="w-3 h-3 text-rose-600" />
                              {t.redFlagBadge(redFlagCount)}
                            </span>
                          )}

                          {/* Child Campaign Badge */}
                          {cand.targetChildren && cand.targetChildren.length === 1 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                              <Baby className="w-3 h-3 text-sky-600" />
                              {t.campaignBadgeLabel(`${cand.targetChildren[0].name} (${cand.targetChildren[0].age}${language === "es" ? "a" : "yo"})`)}
                            </span>
                          )}
                          {cand.targetChildren && cand.targetChildren.length > 1 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Users2 className="w-3 h-3 text-indigo-600" />
                              {language === "es" ? `Campaña: Hermanos (${cand.targetChildren.map((k) => k.name).join(" + ")})` : `Campaign: Siblings (${cand.targetChildren.map((k) => k.name).join(" + ")})`}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500">
                          {cand.roleTarget} &bull;{" "}
                          {cand.phone && <span>{cand.phone} &bull; </span>}
                          <span>
                            {isCompleted
                              ? `${language === "es" ? "Completado el" : "Completed"} ${new Date(cand.result!.completedAt).toLocaleDateString()}`
                              : `${language === "es" ? "Invitada el" : "Invited"} ${new Date(cand.createdAt).toLocaleDateString()}`}
                          </span>
                        </p>

                        {/* Experience and CPR tags */}
                        {cand.profile && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {t.yrsExperience(cand.profile.yearsOfExperience)}
                            </span>
                            {cand.profile.hasCprCertification ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> {t.cprCertified}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                {t.noCpr}
                              </span>
                            )}
                            {cand.profile.preferredHourlyRate && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {cand.profile.preferredHourlyRate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score / Metrics Display */}
                    <div className="flex items-center gap-6 self-end lg:self-center">
                      {isCompleted ? (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-2xl font-black text-slate-900">
                                {cand.result?.overallScore}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">/100</span>
                            </div>
                            <span
                              className={`text-[11px] font-bold block ${
                                cand.result?.tier === "Exceptional Fit"
                                  ? "text-emerald-700"
                                  : cand.result?.tier === "High Risk / Not Recommended"
                                  ? "text-rose-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {tierLabel}
                            </span>
                          </div>

                          <Link
                            href={`/dashboard/candidate/${cand.id}`}
                            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <span>{t.viewScorecard}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(cand.token, cand.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === cand.id ? t.copied : t.copyLink}</span>
                          </button>

                          <button
                            onClick={() => setShareCandidate(cand)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{t.share}</span>
                          </button>

                          <a
                            href={`/test/${cand.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open candidate form in new tab"
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCandidate(cand.id, cand.name)}
                        title={t.delete}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        ) : (
          <NannyPoolExplorer
            childrenList={childrenList}
            onNannyInvited={(newCand) => {
              setCandidates((prev) => [newCand, ...prev]);
              setShareCandidate(newCand);
              setDashboardView("candidates");
            }}
          />
        )}

        {/* Recommended Products & Care Activities Section (Amazon Partner Program) */}
        <RecommendedProductsSection
          childAge={activeAge}
          childName={activeName}
          careCategory={activeCareCategory}
          className="pt-4"
        />
      </main>

      {/* Share Modal */}
      {shareCandidate && (
        <ShareModal
          isOpen={!!shareCandidate}
          onClose={() => setShareCandidate(null)}
          candidateName={shareCandidate.name}
          token={shareCandidate.token}
          roleTarget={shareCandidate.roleTarget}
        />
      )}

      {/* Children Management Modal */}
      {isChildrenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {language === "es" ? "Familiares y Personas a Cuidar" : "Family Members & Care Recipients"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "es"
                      ? "Registra niños, adultos mayores o personas con discapacidad para adaptar las evaluaciones"
                      : "Register children, seniors, or persons with disabilities to adapt evaluations"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChildrenModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Members Roster */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es" ? "Personas Registradas en tu Familia" : "Registered Family Members"}
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {childrenList.map((kid) => {
                  const isElderly = kid.age >= 60 || (kid.notes && /abuel|mayor|ancian|alzheimer|demencia/i.test(kid.notes));
                  const isDisability = kid.notes && /tea|autis|discapacidad|ruedas|motor|sensorial/i.test(kid.notes);
                  const avatar = isElderly ? "👵" : isDisability ? "♿" : "👶";

                  return (
                    <div key={kid.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-base">
                          {avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{kid.name}</p>
                          <p className="text-xs text-slate-500">
                            {kid.age} {language === "es" ? "años" : "years old"}
                            {kid.notes && ` • ${kid.notes}`}
                          </p>
                        </div>
                      </div>

                      {childrenList.length > 1 && (
                        <button
                          onClick={() => handleDeleteChild(kid.id)}
                          title="Remove"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Care Recipient / Family Member Form */}
            <form onSubmit={handleAddChild} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {language === "es" ? "+ Agregar Familiar o Persona a Cuidar" : "+ Add Family Member or Care Recipient"}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === "es"
                    ? "Registra a un hijo(a), adulto mayor o persona con necesidades especiales para personalizar sus pruebas."
                    : "Register a child, elderly relative, or person with special needs to tailor screening tests."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {language === "es" ? "Nombre *" : "Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === "es" ? "ej. Carmen, Sofía o Mateo" : "e.g. Carmen, Sofia, or Leo"}
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {language === "es" ? "Edad (Años) *" : "Age (Years) *"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    required
                    placeholder="0 - 120"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {language === "es" ? "Detalles de Salud / Cuidados (Opcional)" : "Care & Health Details (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "es"
                      ? "ej. Movilidad reducida, demencia/Alzheimer, TEA, alergias, medicación..."
                      : "e.g. Reduced mobility, dementia/Alzheimer, autism, allergies, medication..."
                  }
                  value={newChildNotes}
                  onChange={(e) => setNewChildNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={addingChild || !newChildName.trim()}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {addingChild
                    ? "..."
                    : language === "es"
                    ? "+ Guardar Familiar / Persona a Cuidar"
                    : "+ Save Family Member"}
                </span>
              </button>
            </form>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsChildrenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {language === "es" ? "Listo" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Wizard Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        childrenList={childrenList}
        onCampaignCreated={(newCamp) => {
          setCampaigns((prev) => [newCamp, ...prev]);
        }}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
      />
    </div>
  );
}

