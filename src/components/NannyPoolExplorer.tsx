"use client";

import { useEffect, useState } from "react";
import { Candidate, CareCategory, Child } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import {
  Baby,
  Briefcase,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Heart,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
  X,
} from "lucide-react";

interface NannyPoolExplorerProps {
  childrenList: Child[];
  onNannyInvited: (candidate: Candidate) => void;
  defaultCategory?: CareCategory | "all";
  className?: string;
}

export default function NannyPoolExplorer({
  childrenList,
  onNannyInvited,
  defaultCategory = "all",
  className = "",
}: NannyPoolExplorerProps) {
  const { language } = useLanguage();
  const [pool, setPool] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "cpr" | "exp" | "edu">("all");

  // Invite modal state
  const [selectedNanny, setSelectedNanny] = useState<Candidate | null>(null);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);

  const initialDomain: "all" | "childcare" | "elderly" | "disability" =
    defaultCategory === "elderly_care"
      ? "elderly"
      : defaultCategory === "disability_care"
      ? "disability"
      : defaultCategory === "childcare"
      ? "childcare"
      : "all";

  const [domainFilter, setDomainFilter] = useState<"all" | "childcare" | "elderly" | "disability">(initialDomain);

  useEffect(() => {
    fetchPool();
  }, []);

  const fetchPool = async () => {
    try {
      const res = await fetch("/api/nanny-pool");
      if (res.ok) {
        const data = await res.json();
        setPool(data.pool || []);
      }
    } catch (err) {
      console.error("Failed to load nanny pool", err);
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = (nanny: Candidate) => {
    setSelectedNanny(nanny);
    setSelectedChildIds(childrenList.length > 0 ? [childrenList[0].id] : []);
  };

  const handleConfirmInvite = async () => {
    if (!selectedNanny) return;
    setInviting(true);

    try {
      const res = await fetch("/api/nanny-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolCandidateId: selectedNanny.id,
          targetChildrenIds: selectedChildIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onNannyInvited(data.candidate);
        setSelectedNanny(null);
      }
    } catch (err) {
      console.error("Error inviting nanny from pool", err);
    } finally {
      setInviting(false);
    }
  };

  const filteredPool = pool.filter((nanny) => {
    const text = `${nanny.name} ${nanny.roleTarget || ""} ${nanny.profile?.highestEducation || ""} ${nanny.profile?.personalStatement || ""}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;

    // Domain filter
    if (domainFilter === "elderly") {
      const isElderly = text.includes("adulto") || text.includes("geriátric") || text.includes("gerontología") || text.includes("senior");
      if (!isElderly) return false;
    } else if (domainFilter === "disability") {
      const isDisability = text.includes("discapacidad") || text.includes("tea") || text.includes("terapia") || text.includes("autismo");
      if (!isDisability) return false;
    } else if (domainFilter === "childcare") {
      const isSpecialized = text.includes("adulto mayor") || text.includes("geriátric") || text.includes("discapacidad") || text.includes("terapia ocupacional");
      if (isSpecialized) return false;
    }

    if (filter === "cpr" && !nanny.profile?.hasCprCertification) return false;
    if (filter === "exp" && (nanny.profile?.yearsOfExperience || 0) < 5) return false;
    if (filter === "edu" && !nanny.profile?.hasEarlyChildhoodEducation) return false;

    return true;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === "es"
                ? "Talento Pre-Verificado • Disponibilidad Inmediata"
                : "Pre-Vetted Caregiving Talent • Immediate Availability"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>
              {language === "es"
                ? "Pool de Candidatos/as Disponibles"
                : "Verified Caregiver Candidates Pool"}
            </span>
            <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredPool.length} {language === "es" ? "candidatos/as" : "candidates"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {language === "es"
              ? "Explora perfiles verificados para Cuidado Infantil, Adulto Mayor y Personas con Discapacidad. Agrégalas a tu campaña con un solo clic."
              : "Browse vetted profiles for Childcare, Elderly Care, and Special Needs. Add them to your campaign with one click."}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === "es" ? "Buscar por nombre, especialidad..." : "Search by name, specialty..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Domain Category Selector Bar */}
      <div className="p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1">
        <button
          onClick={() => setDomainFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            domainFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          🌐 {language === "es" ? "Todas las Áreas" : "All Care Areas"}
        </button>
        <button
          onClick={() => setDomainFilter("childcare")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            domainFilter === "childcare"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          👶 {language === "es" ? "Niñeras e Infantil" : "Childcare"}
        </button>
        <button
          onClick={() => setDomainFilter("elderly")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            domainFilter === "elderly"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          👵 {language === "es" ? "Adulto Mayor (Geriátrico)" : "Elderly Care"}
        </button>
        <button
          onClick={() => setDomainFilter("disability")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            domainFilter === "disability"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          ♿ {language === "es" ? "Discapacidad y Neurodiversidad" : "Special Needs"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {language === "es" ? "Todos los Filtros" : "All Filters"}
        </button>
        <button
          onClick={() => setFilter("cpr")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            filter === "cpr"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === "es" ? "Certificación RCP Vigente" : "Active CPR Certified"}</span>
        </button>
        <button
          onClick={() => setFilter("exp")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            filter === "exp"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{language === "es" ? "5+ Años de Experiencia" : "5+ Years Experience"}</span>
        </button>
        <button
          onClick={() => setFilter("edu")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
            filter === "edu"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{language === "es" ? "Educación Infantil" : "Early Childhood Ed"}</span>
        </button>
      </div>

      {/* Grid of Nannies */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">{language === "es" ? "Cargando pool de niñeras..." : "Loading nanny pool..."}</p>
        </div>
      ) : filteredPool.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700">
            {language === "es" ? "No se encontraron niñeras con estos filtros." : "No nannies match this search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPool.map((nanny) => {
            const exp = nanny.profile?.yearsOfExperience || 3;
            const hasCpr = nanny.profile?.hasCprCertification;
            const hasEdu = nanny.profile?.hasEarlyChildhoodEducation;
            const rate = nanny.profile?.preferredHourlyRate || "$25 - $30 / hr";
            const statement = nanny.profile?.personalStatement || "Especialista en cuidado infantil y desarrollo temprano.";

            return (
              <div
                key={nanny.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        {nanny.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
                          {nanny.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp} {language === "es" ? "años de experiencia" : "years experience"}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {rate}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {hasCpr && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{language === "es" ? "RCP Vigente" : "CPR Certified"}</span>
                      </span>
                    )}
                    {hasEdu && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <GraduationCap className="w-3 h-3 text-indigo-600" />
                        <span>{language === "es" ? "Educación Infantil" : "Early Ed"}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{language === "es" ? "Disponible" : "Available"}</span>
                    </span>
                  </div>

                  {/* Statement */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &ldquo;{statement}&rdquo;
                  </p>

                  {/* Degree/Education info */}
                  {nanny.profile?.highestEducation && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{nanny.profile.highestEducation}</span>
                    </div>
                  )}
                </div>

                {/* Invite CTA Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openInviteModal(nanny)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {language === "es"
                        ? "Invitar a mi Campaña (Mandar Test)"
                        : "Invite to Campaign (Send Test)"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Selection Modal */}
      {selectedNanny && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {selectedNanny.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === "es" ? "Invitar a" : "Invite"} {selectedNanny.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "es"
                      ? "Selecciona para qué hijo(s) deseas evaluar a esta niñera"
                      : "Choose which child(ren) to evaluate this nanny for"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNanny(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Child Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === "es" ? "Campaña del Hijo(a):" : "Child Campaign:"}
              </label>

              <div className="space-y-1.5">
                {childrenList.map((kid) => {
                  const isChecked = selectedChildIds.includes(kid.id);
                  return (
                    <div
                      key={kid.id}
                      onClick={() =>
                        setSelectedChildIds((prev) =>
                          prev.includes(kid.id)
                            ? prev.length > 1
                              ? prev.filter((id) => id !== kid.id)
                              : prev
                            : [...prev, kid.id]
                        )
                      }
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400/30"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Baby className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{kid.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {kid.age} {language === "es" ? "años" : "yo"}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">
                {language === "es" ? "¿Qué sucederá?" : "What happens next?"}
              </span>{" "}
              {language === "es"
                ? `Se creará el registro de ${selectedNanny.name} en tu panel y se generará un enlace único para que complete el test psicológico adaptado a la edad de tus hijos.`
                : `A candidate entry for ${selectedNanny.name} will be created in your dashboard with an assessment link.`}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNanny(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={inviting || selectedChildIds.length === 0}
                onClick={handleConfirmInvite}
                className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {inviting
                  ? language === "es"
                    ? "Generando..."
                    : "Generating..."
                  : language === "es"
                  ? "Crear Invitación y Ver Link"
                  : "Create Invitation & Get Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
