"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Child, ParentCampaign, User } from "@/lib/types";
import { useLanguage } from "@/components/LanguageContext";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckCircle2,
  Heart,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Users2,
  X,
} from "lucide-react";

export default function FamilyMembersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [campaigns, setCampaigns] = useState<ParentCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // New recipient form state
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("3");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login?redirect=/dashboard/family");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const [childRes, campRes] = await Promise.all([
        fetch("/api/children"),
        fetch("/api/campaigns"),
      ]);

      if (childRes.ok) {
        const cData = await childRes.json();
        setChildrenList(cData.children || []);
      }
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }
    } catch (err) {
      console.error("Family page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          age: parseInt(newAge, 10),
          notes: newNotes.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChildrenList((prev) => [...prev, data.child]);
        setNewName("");
        setNewNotes("");
        setFeedbackMsg(
          language === "es"
            ? "¡Persona a cuidar agregada exitosamente!"
            : "Care recipient added successfully!"
        );
        setTimeout(() => setFeedbackMsg(""), 3000);
      }
    } catch (err) {
      console.error("Add member error:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (childrenList.length <= 1) {
      alert(
        language === "es"
          ? "Debes mantener al menos una persona o hijo registrado en tu familia."
          : "You must keep at least one family member registered."
      );
      return;
    }

    if (
      !confirm(
        language === "es"
          ? `¿Seguro que deseas eliminar el registro de ${name}?`
          : `Are you sure you want to remove ${name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/children?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setChildrenList((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete member error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user ? { ...user, children: childrenList } : null} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>
              {language === "es"
                ? "← Volver a Mis Campañas"
                : "← Back to My Campaigns"}
            </span>
          </Link>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              {language === "es" ? "Nueva Campaña" : "New Campaign"}
            </span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-950 to-orange-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/20">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold border border-amber-400/30">
                <Users2 className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {language === "es"
                    ? "Gestión de Núcleo Familiar"
                    : "Family Core Management"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {language === "es"
                  ? "Familiares y Personas a Cuidar"
                  : "Family Members & Care Recipients"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === "es"
                  ? "Configura a cada integrante de tu familia (hijos, adultos mayores o personas con necesidades especiales) para que las evaluaciones clínicas, preguntas situacionales y recomendaciones se adapten con precisión."
                  : "Configure family members (children, elderly relatives, or individuals with special needs) so clinical evaluations, situational dilemmas, and recommendations adapt precisely."}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 text-center shrink-0">
              <span className="text-3xl font-black text-amber-300 block">
                {childrenList.length}
              </span>
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                {language === "es" ? "Registrados" : "Registered"}
              </span>
            </div>
          </div>
        </div>

        {/* Members Roster & Add Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Registered Members Cards (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span>{language === "es" ? "Personas Registradas" : "Registered Members"}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {childrenList.length}
                </span>
              </h2>
            </div>

            {childrenList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  {language === "es"
                    ? "No tienes personas registradas aún."
                    : "No family members registered yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  const avatarEmoji = isElderly
                    ? "👵"
                    : isDisability
                    ? "♿"
                    : "👶";
                  const tagLabel = isElderly
                    ? language === "es"
                      ? "Adulto Mayor"
                      : "Elderly Care"
                    : isDisability
                    ? language === "es"
                      ? "Cuidado Especial"
                      : "Special Needs"
                    : language === "es"
                    ? kid.age <= 2
                      ? "Lactante"
                      : kid.age <= 5
                      ? "Primera Infancia"
                      : "Escolar"
                    : "Childcare";

                  const linkedCampaigns = campaigns.filter((c) =>
                    c.targetChildren?.some((k) => k.id === kid.id)
                  );

                  return (
                    <div
                      key={kid.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-black text-xl shadow-2xs">
                              {avatarEmoji}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900">
                                {kid.name}
                              </h3>
                              <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md mt-0.5">
                                {kid.age} {language === "es" ? "años" : "years"}{" "}
                                &bull; {tagLabel}
                              </span>
                            </div>
                          </div>

                          {childrenList.length > 1 && (
                            <button
                              onClick={() => handleDeleteMember(kid.id, kid.name)}
                              title={
                                language === "es"
                                  ? "Eliminar registro"
                                  : "Delete member"
                              }
                              className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {kid.notes ? (
                          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-700 block mb-0.5 text-[10px] uppercase">
                              {language === "es"
                                ? "Condiciones y Cuidados:"
                                : "Care & Conditions:"}
                            </span>
                            {kid.notes}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            {language === "es"
                              ? "Sin notas médicas o condiciones registradas."
                              : "No special medical notes registered."}
                          </p>
                        )}

                        <div className="text-[11px] font-semibold text-slate-500 pt-1">
                          {linkedCampaigns.length > 0 ? (
                            <span className="text-sky-700 font-bold">
                              ✓ {linkedCampaigns.length}{" "}
                              {language === "es"
                                ? "campaña(s) activa(s)"
                                : "active campaign(s)"}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {language === "es"
                                ? "Sin campañas activas"
                                : "No active campaigns"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/dashboard/new?child=${kid.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
                        >
                          <span>
                            {language === "es"
                              ? `+ Campaña para ${kid.name}`
                              : `+ Campaign for ${kid.name}`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Add New Member Form */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {language === "es"
                      ? "Registrar Nueva Persona"
                      : "Register New Care Recipient"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === "es"
                      ? "Hijos, adultos mayores o necesidades especiales"
                      : "Children, elderly, or special needs"}
                  </p>
                </div>
              </div>
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === "es" ? "Edad (Años) *" : "Age (Years) *"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  required
                  placeholder="0 - 120"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {parseInt(newAge, 10) >= 60
                    ? language === "es"
                      ? "👵 Se categorizará automáticamente como Adulto Mayor."
                      : "👵 Will be categorized as Elderly Care."
                    : parseInt(newAge, 10) <= 12
                    ? language === "es"
                      ? "👶 Se categorizará como Cuidado Infantil."
                      : "👶 Will be categorized as Childcare."
                    : language === "es"
                    ? "🧑 Cuidado familiar o especial."
                    : "🧑 Family or special care."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === "es"
                    ? "Condiciones y Cuidados (Opcional)"
                    : "Conditions & Care (Optional)"}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === "es"
                      ? "ej. Movilidad reducida, demencia/Alzheimer, TEA, alergias, medicación programada..."
                      : "e.g. Reduced mobility, dementia/Alzheimer, autism, allergies, medication schedule..."
                  }
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {adding
                    ? "..."
                    : language === "es"
                    ? "+ Guardar en mi Familia"
                    : "+ Save Care Recipient"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
