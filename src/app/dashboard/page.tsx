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
import ShareCampaignModal from "@/components/ShareCampaignModal";
import { Candidate, CareCategory, Child, ParentCampaign, User } from "@/lib/types";
import { useLanguage } from "@/components/LanguageContext";
import {
  AlertOctagon,
  ArrowLeft,
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

  // Share Modal state
  const [shareCandidate, setShareCandidate] = useState<Candidate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Campaigns and Question Bank state
  const [campaigns, setCampaigns] = useState<ParentCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);

  // Campaign Sharing & Collaboration state
  const [shareCampaign, setShareCampaign] = useState<ParentCampaign | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

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
      if (params.get("joinCode")) {
        setJoinCodeInput(params.get("joinCode")!);
        setIsJoinModalOpen(true);
      }
      if (params.get("view") === "pool") {
        setDashboardView("pool");
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        const returnUrl =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/dashboard";
        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
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
        if (selectedCampaignId === id) {
          setSelectedCampaignId(null);
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Delete campaign error:", err);
    }
  };

  const handleCopyCampaignLink = (campaign: ParentCampaign) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const code = campaign.shareCode || campaign.id;
    const link = `${origin}/dashboard?joinCode=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopiedCampaignId(campaign.id);
    setTimeout(() => setCopiedCampaignId(null), 2000);
  };

  const handleJoinCampaign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    setJoinError("");
    setJoinSuccess("");

    try {
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(
          data.error ||
            (language === "es"
              ? "Código inválido o no se encontró la campaña."
              : "Invalid code or campaign not found.")
        );
      } else {
        setJoinSuccess(
          language === "es"
            ? `¡Te has unido exitosamente a "${data.campaign.title}"!`
            : `Successfully joined "${data.campaign.title}"!`
        );
        setCampaigns((prev) => {
          const exists = prev.find((c) => c.id === data.campaign.id);
          if (exists) {
            return prev.map((c) => (c.id === data.campaign.id ? data.campaign : c));
          }
          return [data.campaign, ...prev];
        });
        setSelectedCampaignId(data.campaign.id);
        router.push(`/dashboard?campaignId=${data.campaign.id}`);

        // Refresh candidate list to load co-shared candidates immediately
        const candRes = await fetch("/api/candidates");
        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(candData.candidates || []);
        }

        setTimeout(() => {
          setIsJoinModalOpen(false);
          setJoinSuccess("");
          setJoinCodeInput("");
        }, 1600);
      }
    } catch (err: any) {
      setJoinError(err.message || "Network error");
    } finally {
      setIsJoining(false);
    }
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
      alert(
        language === "es"
          ? "Debes mantener al menos una persona registrada."
          : "You must keep at least one registered recipient."
      );
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

  // Helper to extract candidates belonging to a campaign
  const getCampaignCandidates = (camp: ParentCampaign) => {
    return candidates.filter((c) => {
      if (c.campaignId && c.campaignId === camp.id) return true;
      const matchesChildren = camp.targetChildren?.some((k) =>
        c.targetChildren?.some((tc) => tc.id === k.id) ||
        (!c.targetChildren && c.roleTarget.toLowerCase().includes(k.name.toLowerCase()))
      );
      if (matchesChildren) return true;
      if (camp.title && c.roleTarget.toLowerCase().includes(camp.title.toLowerCase())) {
        return true;
      }
      return false;
    });
  };

  // Active Campaign derivation
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Candidates for currently active view
  const currentCampaignCandidates = activeCampaign
    ? getCampaignCandidates(activeCampaign)
    : candidates;

  // Metrics calculation specifically for the active campaign
  const completedCandidates = currentCampaignCandidates.filter(
    (c) => c.status === "completed" && c.result
  );
  const pendingCandidates = currentCampaignCandidates.filter(
    (c) => c.status === "invited" || c.status === "in_progress"
  );
  const candidatesWithRedFlags = completedCandidates.filter(
    (c) => c.result && c.result.redFlags && c.result.redFlags.length > 0
  );
  const topCandidate = completedCandidates.reduce<Candidate | null>((top, current) => {
    if (!top || (current.result?.overallScore || 0) > (top.result?.overallScore || 0)) {
      return current;
    }
    return top;
  }, null);

  // Active target recipient for ads / recommendations
  const activeRecipient =
    activeCampaign?.targetChildren?.[0] || childrenList[0];
  const activeAge = activeRecipient?.age ?? user?.childProfile?.age ?? 3;
  const activeName =
    activeRecipient?.name ??
    user?.childProfile?.name ??
    (language === "es" ? "Familiar" : "Family Member");

  const activeCareCategory: CareCategory | "all" = activeCampaign?.careCategory
    ? activeCampaign.careCategory
    : activeAge >= 60
    ? "elderly_care"
    : activeRecipient?.notes &&
      /tea|autis|discapacidad|ruedas|sensorial/i.test(activeRecipient.notes)
    ? "disability_care"
    : "childcare";

  // Filtered candidate list for the active campaign
  const filteredCandidates = currentCampaignCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roleTarget && c.roleTarget.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "completed") return c.status === "completed";
    if (statusFilter === "pending")
      return c.status === "invited" || c.status === "in_progress";
    if (statusFilter === "redflags") {
      return c.result && c.result.redFlags && c.result.redFlags.length > 0;
    }
    if (statusFilter === "topfit") {
      return (
        c.result &&
        (c.result.tier === "Exceptional Fit" || c.result.overallScore >= 88)
      );
    }

    return true;
  });

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    router.push(`/dashboard?campaignId=${id}`);
  };

  const handleBackToAllCampaigns = () => {
    setSelectedCampaignId(null);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">
            {language === "es"
              ? "Cargando Panel de Reclutamiento..."
              : "Loading Recruitment Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user ? { ...user, children: childrenList } : null}
        onOpenCreateCampaign={() => setIsCreateCampaignOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =========================================================================
            STATE 1: NO CAMPAIGN SELECTED -> AVAILABLE CAMPAIGNS HUB (MAIN ENTRY)
           ========================================================================= */}
        {!selectedCampaignId || !activeCampaign ? (
          <div className="space-y-8 animate-in fade-in">
            {/* Header / Intro Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
              <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-semibold border border-sky-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                      <span>
                        {language === "es"
                          ? "Panel de Campañas"
                          : "Campaigns Dashboard"}
                      </span>
                    </div>

                    <Link
                      href="/dashboard/family"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-semibold border border-amber-400/30 transition-colors"
                      title={
                        language === "es"
                          ? "Administrar familiares y personas a cuidar"
                          : "Manage family members and care recipients"
                      }
                    >
                      <Users2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {childrenList.length > 0
                          ? childrenList
                              .map(
                                (c) =>
                                  `${c.name} (${c.age}${
                                    language === "es" ? "a" : "y"
                                  })`
                              )
                              .join(" • ")
                          : language === "es"
                          ? "Personas a Cuidar"
                          : "Care Recipients"}
                      </span>
                      <Settings2 className="w-3 h-3 text-amber-300 ml-0.5" />
                    </Link>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {language === "es"
                      ? "Mis Campañas de Selección"
                      : "My Screening Campaigns"}
                  </h1>

                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {language === "es"
                      ? "Selecciona una campaña para ver sus métricas, candidatas evaluadas y pool de talento disponible, o crea una nueva campaña para iniciar otro proceso."
                      : "Select a campaign to view its scorecard metrics, evaluated candidates, and talent pool, or create a new campaign to begin screening."}
                  </p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsCreateCampaignOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>
                      {language === "es" ? "+ Nueva Campaña" : "+ New Campaign"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setJoinError("");
                      setJoinSuccess("");
                      setIsJoinModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-sky-300" />
                    <span>
                      {language === "es"
                        ? "Unirse con Código"
                        : "Join with Code"}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsQuestionBankOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs sm:text-sm border border-slate-700/80 transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">
                      {language === "es" ? "Banco de Preguntas" : "Question Bank"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign Grid Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                    <Sparkles className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>
                        {language === "es"
                          ? "Campañas Disponibles"
                          : "Available Campaigns"}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        {campaigns.length}{" "}
                        {language === "es" ? "activas" : "active"}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      {language === "es"
                        ? "Haz clic en 'Entrar a esta Campaña' para ver sus resultados, alertas y candidatas."
                        : "Click 'Enter Campaign' to see results, red flag alerts, and candidates."}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/family"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all"
                >
                  <Users2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {language === "es"
                      ? "Personas a Cuidar"
                      : "Care Recipients"}
                  </span>
                </Link>
              </div>

              {campaigns.length === 0 ? (
                <div className="text-center py-14 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center shadow-xs">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    {language === "es"
                      ? "Aún no tienes campañas de selección activas"
                      : "No active screening campaigns yet"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    {language === "es"
                      ? "Crea una campaña para definir a la persona a cuidar, horarios y preguntas clave, o genera enlaces de evaluación para tus postulantes."
                      : "Create a campaign to define recipient, schedule, and key questions to evaluate caregivers."}
                  </p>
                  <button
                    onClick={() => setIsCreateCampaignOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    {language === "es"
                      ? "+ Crear mi Primera Campaña"
                      : "+ Create My First Campaign"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {campaigns.map((camp) => {
                    const campCands = getCampaignCandidates(camp);
                    const campCompletedCount = campCands.filter(
                      (c) => c.status === "completed"
                    ).length;
                    const campPendingCount = campCands.filter(
                      (c) => c.status === "invited" || c.status === "in_progress"
                    ).length;
                    const campRedFlagsCount = campCands.filter(
                      (c) =>
                        c.result &&
                        c.result.redFlags &&
                        c.result.redFlags.length > 0
                    ).length;

                    return (
                      <div
                        key={camp.id}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/50 to-white hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between gap-5 group"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {camp.careCategory === "elderly_care" ? (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                  <span>👵</span>
                                  <span>
                                    {language === "es"
                                      ? "Adulto Mayor"
                                      : "Elderly Care"}
                                  </span>
                                </span>
                              ) : camp.careCategory === "disability_care" ? (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-900 border border-purple-300 flex items-center gap-1">
                                  <span>♿</span>
                                  <span>
                                    {language === "es"
                                      ? "Discapacidad"
                                      : "Special Needs"}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100/80 text-sky-900 border border-sky-300 flex items-center gap-1">
                                  <span>👶</span>
                                  <span>
                                    {language === "es"
                                      ? "Infantil"
                                      : "Childcare"}
                                  </span>
                                </span>
                              )}

                              {camp.userId !== user?.id && (
                                <span
                                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1"
                                  title={
                                    language === "es"
                                      ? "Campaña compartida contigo"
                                      : "Shared with you"
                                  }
                                >
                                  <Users className="w-3 h-3 text-purple-700" />
                                  <span>
                                    {language === "es"
                                      ? "Compartida"
                                      : "Shared"}
                                  </span>
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCampaign(camp.id, camp.title);
                              }}
                              title={
                                language === "es"
                                  ? "Eliminar campaña"
                                  : "Delete campaign"
                              }
                              className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
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
                                <span>
                                  {k.name} ({k.age}a)
                                </span>
                              </span>
                            ))}

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {camp.scheduleType === "full_time"
                                ? language === "es"
                                  ? "Tiempo Completo"
                                  : "Full Time"
                                : camp.scheduleType === "part_time"
                                ? language === "es"
                                  ? "Medio Tiempo"
                                  : "Part Time"
                                : camp.scheduleType === "weekends"
                                ? language === "es"
                                  ? "Fines de Semana"
                                  : "Weekends"
                                : language === "es"
                                ? "Por Horas"
                                : "Hourly"}
                            </span>

                            {camp.expectedHourlyRate && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                                {camp.expectedHourlyRate}
                              </span>
                            )}
                          </div>

                          {/* Quick Candidate Metrics Summary for this Campaign */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-semibold">
                              {campCands.length}{" "}
                              {language === "es"
                                ? "candidata(s)"
                                : "candidate(s)"}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-emerald-700 font-bold">
                                {campCompletedCount} {language === "es" ? "listas" : "done"}
                              </span>
                              {campRedFlagsCount > 0 && (
                                <span className="text-rose-600 font-bold">
                                  • {campRedFlagsCount} ⚠️
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Card CTA Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectCampaign(camp.id)}
                            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20 active:scale-98"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-200" />
                            <span>
                              {language === "es"
                                ? "🎯 Entrar a esta Campaña"
                                : "🎯 Enter Campaign"}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setShareCampaign(camp)}
                              className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title={
                                language === "es"
                                  ? "Compartir con cónyuge o familiar"
                                  : "Share with family"
                              }
                            >
                              <Share2 className="w-3 h-3 text-purple-600" />
                              <span>
                                {language === "es" ? "Compartir" : "Share"}
                              </span>
                            </button>

                            <Link
                              href={`/dashboard/new?campaignId=${camp.id}`}
                              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title={
                                language === "es"
                                  ? "Crear evaluación para esta campaña"
                                  : "Invite candidate"
                              }
                            >
                              <UserPlus className="w-3 h-3 text-sky-400" />
                              <span>
                                {language === "es" ? "+ Evaluar" : "+ Evaluate"}
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick banner linking to family recipients */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {language === "es"
                      ? "Familiares y Personas a Cuidar"
                      : "Family Members & Care Recipients"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {language === "es"
                      ? "Registra niños, adultos mayores o personas con discapacidad para adaptar las preguntas clínicas."
                      : "Register children, seniors, or special needs members to personalize questions."}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/family"
                className="px-4 py-2 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs transition-all shrink-0"
              >
                {language === "es"
                  ? "Administrar Personas a Cuidar →"
                  : "Manage Care Recipients →"}
              </Link>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STATE 2: CAMPAIGN SELECTED -> FOCUSED CAMPAIGN PAGE WITH INTERNAL BLOCKS
             ========================================================================= */
          <div className="space-y-8 animate-in fade-in">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={handleBackToAllCampaigns}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-2xs transition-all cursor-pointer self-start"
              >
                <ArrowLeft className="w-4 h-4 text-sky-600" />
                <span>
                  {language === "es"
                    ? "← Volver a Mis Campañas"
                    : "← Back to My Campaigns"}
                </span>
              </button>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Campaign Switcher Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => handleSelectCampaign(e.target.value)}
                    className="appearance-none px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 pr-8 focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.careCategory === "elderly_care"
                          ? "👵"
                          : c.careCategory === "disability_care"
                          ? "♿"
                          : "👶"}{" "}
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsCreateCampaignOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {language === "es" ? "Nueva" : "New"}
                  </span>
                </button>
              </div>
            </div>

            {/* BLOCK 1: CAMPAIGN TITLE & HERO HEADER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border-2 border-sky-400/40">
              <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950">
                      {language === "es" ? "Campaña Activa" : "Active Campaign"}
                    </span>

                    <span className="text-xs font-bold text-sky-200 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                      {activeCampaign.careCategory === "elderly_care"
                        ? language === "es"
                          ? "👵 Adulto Mayor"
                          : "👵 Elderly Care"
                        : activeCampaign.careCategory === "disability_care"
                        ? language === "es"
                          ? "♿ Cuidados Especiales"
                          : "♿ Special Needs"
                        : language === "es"
                        ? "👶 Cuidado Infantil"
                        : "👶 Childcare"}
                    </span>

                    {activeRecipient && (
                      <span className="text-xs text-amber-300 font-bold bg-amber-400/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                        • {activeRecipient.name} ({activeRecipient.age}{" "}
                        {language === "es" ? "años" : "yo"})
                      </span>
                    )}

                    <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                      {activeCampaign.scheduleType === "full_time"
                        ? language === "es"
                          ? "Tiempo Completo"
                          : "Full Time"
                        : activeCampaign.scheduleType === "part_time"
                        ? language === "es"
                          ? "Medio Tiempo"
                          : "Part Time"
                        : activeCampaign.scheduleType === "weekends"
                        ? language === "es"
                          ? "Fines de Semana"
                          : "Weekends"
                        : language === "es"
                        ? "Por Horas"
                        : "Hourly"}
                    </span>

                    {activeCampaign.expectedHourlyRate && (
                      <span className="text-xs text-emerald-300 font-bold bg-emerald-400/20 px-2 py-0.5 rounded-md border border-emerald-400/30">
                        Tarifa: {activeCampaign.expectedHourlyRate}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {activeCampaign.title}
                  </h1>

                  {activeCampaign.notes && (
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      {activeCampaign.notes}
                    </p>
                  )}

                  {/* Collaboration Code Snippet */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                      <span className="text-slate-400 font-semibold">
                        {language === "es" ? "Código de Colaboración:" : "Share Code:"}
                      </span>
                      <span className="font-mono font-bold text-white">
                        {activeCampaign.shareCode || activeCampaign.id}
                      </span>
                      <button
                        onClick={() => handleCopyCampaignLink(activeCampaign)}
                        className="ml-1 text-sky-300 hover:text-white font-bold cursor-pointer"
                        title="Copiar enlace de acceso"
                      >
                        {copiedCampaignId === activeCampaign.id
                          ? language === "es"
                            ? "✓ Copiado"
                            : "✓ Copied"
                          : language === "es"
                          ? "Copiar"
                          : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campaign Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    href={`/dashboard/new?campaignId=${activeCampaign.id}`}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {language === "es"
                        ? "+ Evaluar Candidata"
                        : "+ Evaluate Candidate"}
                    </span>
                  </Link>

                  <button
                    onClick={() => setShareCampaign(activeCampaign)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-purple-300" />
                    <span>
                      {language === "es"
                        ? "Compartir Campaña"
                        : "Share Campaign"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* BLOCK 2: STATS ROW (SCOPED TO THIS CAMPAIGN) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.totalEvaluated}
                  </span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {currentCampaignCandidates.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.candidatesFinished(
                    completedCandidates.length,
                    pendingCandidates.length
                  )}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.topCandidate}
                  </span>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 truncate">
                  {topCandidate
                    ? topCandidate.name
                    : language === "es"
                    ? "Ninguna aún"
                    : "None yet"}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {topCandidate?.result
                    ? `${topCandidate.result.overallScore}% (${
                        language === "es" && topCandidate.result.tierEs
                          ? topCandidate.result.tierEs
                          : topCandidate.result.tier
                      })`
                    : t.sendToViewRankings}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
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

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
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

            {/* BLOCK 3: VIEW SWITCHER TABS (Mis Candidatas vs Pool de Candidatos/as) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDashboardView("candidates")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    dashboardView === "candidates"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {language === "es"
                      ? "Mis Candidatas Evaluadas"
                      : "Evaluated Candidates"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      dashboardView === "candidates"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {currentCampaignCandidates.length}
                  </span>
                </button>

                <button
                  onClick={() => setDashboardView("pool")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    dashboardView === "pool"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>
                    {language === "es"
                      ? "Pool de Candidatos/as Disponibles"
                      : "Verified Candidates Pool"}
                  </span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {language === "es" ? "Reclutar" : "Hire"}
                  </span>
                </button>
              </div>

              {dashboardView === "candidates" && (
                <Link
                  href={`/dashboard/new?campaignId=${activeCampaign.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    {language === "es"
                      ? "+ Evaluar Nueva Candidata"
                      : "+ Invite Candidate"}
                  </span>
                </Link>
              )}
            </div>

            {/* BLOCK 4: TAB CONTENT */}
            {dashboardView === "candidates" ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search & Filter Controls Bar */}
                <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === "all"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {t.filterAll} ({currentCampaignCandidates.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("completed")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === "completed"
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {t.filterCompleted} ({completedCandidates.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("topfit")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === "topfit"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {t.filterTopFit}
                    </button>
                    <button
                      onClick={() => setStatusFilter("redflags")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === "redflags"
                          ? "bg-rose-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {t.filterRedFlags} ({candidatesWithRedFlags.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === "pending"
                          ? "bg-amber-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {t.filterPending} ({pendingCandidates.length})
                    </button>
                  </div>
                </div>

                {/* Candidate List */}
                {filteredCandidates.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Users className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-base font-bold text-slate-700">
                      {t.noCandidatesMatch}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {t.noCandidatesDesc}
                    </p>
                    <Link
                      href={`/dashboard/new?campaignId=${activeCampaign.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.inviteNewCandidate}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredCandidates.map((cand) => {
                      const isCompleted =
                        cand.status === "completed" && cand.result;
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
                                    : cand.result?.tier ===
                                      "High Risk / Not Recommended"
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-sky-100 text-sky-800 border border-sky-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {cand.name.charAt(0)}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">
                                  {cand.name}
                                </h3>
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
                              </div>

                              <p className="text-xs text-slate-500">
                                {cand.roleTarget} &bull;{" "}
                                {cand.phone && <span>{cand.phone} &bull; </span>}
                                <span>
                                  {isCompleted
                                    ? `${
                                        language === "es"
                                          ? "Completado el"
                                          : "Completed"
                                      } ${new Date(
                                        cand.result!.completedAt
                                      ).toLocaleDateString()}`
                                    : `${
                                        language === "es"
                                          ? "Invitada el"
                                          : "Invited"
                                      } ${new Date(
                                        cand.createdAt
                                      ).toLocaleDateString()}`}
                                </span>
                              </p>

                              {/* Experience and CPR tags */}
                              {cand.profile && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                    {t.yrsExperience(
                                      cand.profile.yearsOfExperience
                                    )}
                                  </span>
                                  {cand.profile.hasCprCertification ? (
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />{" "}
                                      {t.cprCertified}
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
                                    <span className="text-xs font-semibold text-slate-400">
                                      /100
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold block ${
                                      cand.result?.tier === "Exceptional Fit"
                                        ? "text-emerald-700"
                                        : cand.result?.tier ===
                                          "High Risk / Not Recommended"
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
                                  onClick={() =>
                                    handleCopyLink(cand.token, cand.id)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>
                                    {copiedId === cand.id ? t.copied : t.copyLink}
                                  </span>
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
                              onClick={() =>
                                handleDeleteCandidate(cand.id, cand.name)
                              }
                              title={t.delete}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
              /* Pool de Candidatos/as Tab Content */
              <NannyPoolExplorer
                childrenList={
                  activeCampaign.targetChildren &&
                  activeCampaign.targetChildren.length > 0
                    ? activeCampaign.targetChildren
                    : childrenList
                }
                defaultCategory={activeCareCategory}
                onNannyInvited={(newCand) => {
                  setCandidates((prev) => [
                    { ...newCand, campaignId: activeCampaign.id },
                    ...prev,
                  ]);
                  setShareCandidate(newCand);
                  setDashboardView("candidates");
                }}
              />
            )}

            {/* BLOCK 5: SPONSORED ADS & RECOMMENDED PRODUCTS (FOCUSED ON THIS CAMPAIGN) */}
            <AgeTargetedAdCard
              childAge={activeAge}
              childName={activeName}
              careCategory={activeCareCategory}
              placement="dashboard_banner"
            />

            <RecommendedProductsSection
              childAge={activeAge}
              childName={activeName}
              careCategory={activeCareCategory}
              className="pt-2"
            />
          </div>
        )}
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
                    {language === "es"
                      ? "Familiares y Personas a Cuidar"
                      : "Family Members & Care Recipients"}
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Members Roster */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es"
                  ? "Personas Registradas en tu Familia"
                  : "Registered Family Members"}
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {childrenList.map((kid) => {
                  const isElderly =
                    kid.age >= 60 ||
                    (kid.notes &&
                      /abuel|mayor|ancian|alzheimer|demencia/i.test(kid.notes));
                  const isDisability =
                    kid.notes &&
                    /tea|autis|discapacidad|ruedas|motor|sensorial/i.test(
                      kid.notes
                    );
                  const avatar = isElderly ? "👵" : isDisability ? "♿" : "👶";

                  return (
                    <div
                      key={kid.id}
                      className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-base">
                          {avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {kid.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {kid.age}{" "}
                            {language === "es" ? "años" : "years old"}
                            {kid.notes && ` • ${kid.notes}`}
                          </p>
                        </div>
                      </div>

                      {childrenList.length > 1 && (
                        <button
                          onClick={() => handleDeleteChild(kid.id)}
                          title="Remove"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            <form
              onSubmit={handleAddChild}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5"
            >
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  {language === "es"
                    ? "+ Agregar Familiar o Persona a Cuidar"
                    : "+ Add Family Member or Care Recipient"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {language === "es" ? "Nombre *" : "Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      language === "es"
                        ? "ej. Carmen, Sofía o Mateo"
                        : "e.g. Carmen, Sofia, or Leo"
                    }
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
                  {language === "es"
                    ? "Detalles de Salud / Cuidados (Opcional)"
                    : "Care & Health Details (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "es"
                      ? "ej. Movilidad reducida, Alzheimer, TEA, alergias..."
                      : "e.g. Mobility, dementia, autism, allergies..."
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
                    ? "+ Guardar"
                    : "+ Save"}
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
          handleSelectCampaign(newCamp.id);
        }}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
      />

      {/* Share Campaign Modal */}
      <ShareCampaignModal
        isOpen={Boolean(shareCampaign)}
        onClose={() => setShareCampaign(null)}
        campaign={shareCampaign}
        currentUserId={user?.id}
        onCampaignUpdated={(updated) => {
          setCampaigns((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
          setShareCampaign(updated);
        }}
      />

      {/* Join Campaign by Code Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {language === "es"
                      ? "Unirse a una Campaña Compartida"
                      : "Join a Shared Campaign"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === "es"
                      ? "Ingresa el código proporcionado por el titular"
                      : "Enter the code provided by the campaign owner"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsJoinModalOpen(false);
                  setJoinError("");
                  setJoinSuccess("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinCampaign} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  {language === "es"
                    ? "Código de Campaña (ej. MC-ABCD-1234)"
                    : "Campaign Code (e.g. MC-ABCD-1234)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="MC-XXXX-YYYY"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 text-sm font-mono tracking-wider font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              {joinError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {joinError}
                </p>
              )}

              {joinSuccess && (
                <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{joinSuccess}</span>
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !joinCodeInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-black shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {isJoining
                      ? language === "es"
                        ? "Vinculando..."
                        : "Linking..."
                      : language === "es"
                      ? "Vincular Campaña"
                      : "Link Campaign"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
