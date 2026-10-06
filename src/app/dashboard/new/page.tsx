"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AgeTargetedAdCard from "@/components/AgeTargetedAdCard";
import { Child, CustomQuestion, CustomQuestionType, User } from "@/lib/types";
import { DEFAULT_QUESTION_BANK_GROUPS } from "@/lib/questionBank";
import QuestionBankModal from "@/components/QuestionBankModal";
import { useLanguage } from "@/components/LanguageContext";
import {
  AlignLeft,
  ArrowLeft,
  Baby,
  BookmarkCheck,
  Check,
  Copy,
  ExternalLink,
  Eye,
  HelpCircle,
  Layers,
  ListPlus,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  UserCheck,
  Users2,
  X,
} from "lucide-react";

export default function NewCandidatePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [familyChildren, setFamilyChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [roleTarget, setRoleTarget] = useState("");
  const [askHourlyRate, setAskHourlyRate] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [parentNotes, setParentNotes] = useState("");

  // Custom Questions Builder state
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Quick Add Child Modal state
  const [showQuickAddChild, setShowQuickAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("3");
  const [newChildNotes, setNewChildNotes] = useState("");
  const [savingChild, setSavingChild] = useState(false);

  // Result state after creation
  const [createdCandidate, setCreatedCandidate] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleQuickAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    setSavingChild(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildName.trim(),
          age: parseInt(newChildAge, 10),
          notes: newChildNotes.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = [...familyChildren, data.child];
        setFamilyChildren(updated);
        setSelectedChildIds([data.child.id]);
        updateDefaultRole([data.child]);
        setNewChildName("");
        setNewChildNotes("");
        setShowQuickAddChild(false);
      }
    } catch (err) {
      console.error("Quick add child error:", err);
    } finally {
      setSavingChild(false);
    }
  };

  useEffect(() => {
    fetchUserAndChildren();
  }, [language]);

  const fetchUserAndChildren = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);

      // Fetch children roster
      const childRes = await fetch("/api/children");
      let kids: Child[] = [];
      if (childRes.ok) {
        const childData = await childRes.json();
        kids = childData.children || [];
      } else if (data.user?.children && data.user.children.length > 0) {
        kids = data.user.children;
      } else if (data.user?.childProfile) {
        kids = [
          {
            id: "child_leo",
            name: data.user.childProfile.name,
            age: data.user.childProfile.age,
            notes: data.user.childProfile.notes,
          },
        ];
      }

      setFamilyChildren(kids);
      const allIds = kids.map((k) => k.id);
      
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetChildParam = urlParams?.get("child");
      const targetModeParam = urlParams?.get("mode");
      const targetCampParam = urlParams?.get("campaignId");

      if (targetCampParam) {
        setCampaignId(targetCampParam);
      }

      let initialSelectedIds = allIds;
      if (targetChildParam && kids.some((k) => k.id === targetChildParam)) {
        initialSelectedIds = [targetChildParam];
      } else if (targetModeParam === "siblings" || targetModeParam === "all") {
        initialSelectedIds = allIds;
      }

      setSelectedChildIds(initialSelectedIds);
      const activeKids = kids.filter((k) => initialSelectedIds.includes(k.id));
      updateDefaultRole(activeKids);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateDefaultRole = (kids: Child[]) => {
    if (kids.length === 0) {
      setRoleTarget(language === "es" ? "Niñera de Tiempo Completo" : "Full-Time Nanny");
    } else if (kids.length === 1) {
      const k = kids[0];
      setRoleTarget(
        language === "es"
          ? `Niñera de Tiempo Completo para ${k.name} (${k.age} años)`
          : `Full-Time Nanny for ${k.age}yo ${k.name}`
      );
    } else {
      const namesStr = kids.map((k) => `${k.name} (${k.age}${language === "es" ? "a" : "yo"})`).join(" & ");
      setRoleTarget(
        language === "es"
          ? `Niñera para ${namesStr}`
          : `Full-Time Nanny for ${namesStr}`
      );
    }
  };

  const handleToggleChild = (childId: string) => {
    const isSelected = selectedChildIds.includes(childId);
    let nextIds: string[];
    if (isSelected) {
      if (selectedChildIds.length === 1) return; // Keep at least one selected
      nextIds = selectedChildIds.filter((id) => id !== childId);
    } else {
      nextIds = [...selectedChildIds, childId];
    }
    setSelectedChildIds(nextIds);
    const activeKids = familyChildren.filter((k) => nextIds.includes(k.id));
    updateDefaultRole(activeKids);
  };

  // Custom Questions Builder Handlers
  const addCustomQuestion = (type: CustomQuestionType = "multiple_choice") => {
    const newQ: CustomQuestion = {
      id: `cq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      prompt: "",
      options: type === "multiple_choice" ? ["", ""] : undefined,
      required: true,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestionPrompt = (id: string, prompt: string) => {
    setCustomQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, prompt } : q)));
  };

  const updateQuestionType = (id: string, type: CustomQuestionType) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          type,
          options:
            type === "multiple_choice"
              ? q.options && q.options.length >= 2
                ? q.options
                : ["", ""]
              : undefined,
        };
      })
    );
  };

  const updateQuestionOption = (id: string, optIdx: number, val: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options) return q;
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      })
    );
  };

  const addOptionToQuestion = (id: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        return { ...q, options: [...(q.options || []), ""] };
      })
    );
  };

  const removeOptionFromQuestion = (id: string, optIdx: number) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options || q.options.length <= 2) return q;
        return { ...q, options: q.options.filter((_, idx) => idx !== optIdx) };
      })
    );
  };

  const [savedBankIds, setSavedBankIds] = useState<string[]>([]);
  const [savingBankId, setSavingBankId] = useState<string | null>(null);

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSaveToBank = async (q: CustomQuestion) => {
    if (!q.prompt?.trim()) {
      alert(language === "es" ? "Por favor escribe el texto de la pregunta antes de guardarla en tu banco." : "Please enter the question text before saving to your bank.");
      return;
    }
    setSavingBankId(q.id);
    try {
      const opts = q.type === "multiple_choice" ? q.options?.filter((o) => o.trim().length > 0) : undefined;
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q.prompt.trim(),
          promptEs: q.prompt.trim(),
          type: q.type,
          options: opts,
          optionsEs: opts,
          required: q.required !== false,
          groupId: "grp_user_saved",
          groupNameEs: "⭐ Mis Preguntas Guardadas",
          groupNameEn: "⭐ My Saved Questions",
        }),
      });
      if (res.ok) {
        setSavedBankIds((prev) => [...prev, q.id]);
      }
    } catch (e) {
      console.error("Error saving question to bank:", e);
    } finally {
      setSavingBankId(null);
    }
  };

  const applyTemplate = (templateKey: "driver" | "pets" | "travel" | "swimming") => {
    let prompt = "";
    let type: CustomQuestionType = "multiple_choice";
    let options: string[] = [];

    if (templateKey === "driver") {
      prompt =
        language === "es"
          ? "¿Cuenta con licencia de conducir vigente y récord limpio para trasladar a los niños si fuera necesario?"
          : "Do you have a valid driver's license and clean record to drive the children if needed?";
      options =
        language === "es"
          ? [
              "Sí, tengo licencia vigente y vehículo propio",
              "Sí, tengo licencia vigente pero no vehículo",
              "No conduzco",
            ]
          : [
              "Yes, valid license and personal vehicle",
              "Yes, valid license but no vehicle",
              "I do not drive",
            ];
    } else if (templateKey === "pets") {
      prompt =
        language === "es"
          ? "En casa tenemos mascotas. ¿Tiene alguna alergia o problema conviviendo con perros/gatos?"
          : "We have pets at home. Do you have any allergies or discomfort living around dogs/cats?";
      options =
        language === "es"
          ? [
              "Amo los animales y no tengo alergias",
              "No me molestan pero prefiero no pasearlos",
              "Tengo alergia a perros/gatos",
            ]
          : [
              "I love animals and have no allergies",
              "Comfortable with them but prefer not walking them",
              "I have pet allergies",
            ];
    } else if (templateKey === "travel") {
      prompt =
        language === "es"
          ? "¿Tendría disponibilidad para viajar con la familia durante vacaciones o fines de semana (con viáticos cubiertos)?"
          : "Would you be available to travel with the family during vacations or weekends (all expenses paid)?";
      options =
        language === "es"
          ? [
              "Total disponibilidad para viajar nacional e internacionalmente",
              "Disponible solo para viajes cortos locales",
              "No tengo disponibilidad para viajar",
            ]
          : [
              "Fully available for domestic and international travel",
              "Available only for short local trips",
              "Not available to travel",
            ];
    } else if (templateKey === "swimming") {
      prompt =
        language === "es"
          ? "¿Sabe nadar y se siente cómoda supervisando activamente a niños en la piscina?"
          : "Can you swim and are you confident providing active touch supervision at swimming pools?";
      options =
        language === "es"
          ? [
              "Sé nadar con soltura y tengo experiencia supervisando niños en agua",
              "Sé nadar básico",
              "No sé nadar",
            ]
          : [
              "Strong swimmer with active pool supervision experience",
              "Basic swimmer",
              "Cannot swim",
            ];
    }

    const newQ: CustomQuestion = {
      id: `cq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      prompt,
      options,
      required: true,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
  };

  const applyBankGroup = (groupId: string) => {
    const grp = DEFAULT_QUESTION_BANK_GROUPS.find((g) => g.id === groupId);
    if (!grp) return;
    const questionsToAdd: CustomQuestion[] = grp.questions.map((q) => ({
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: q.type,
      prompt: language === "es" && q.promptEs ? q.promptEs : q.prompt,
      options:
        q.type === "multiple_choice"
          ? language === "es" && q.optionsEs
            ? q.optionsEs
            : q.options || ["Sí", "No"]
          : undefined,
      required: q.required !== false,
    }));
    setCustomQuestions((prev) => [...prev, ...questionsToAdd]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const targetChildren = familyChildren.filter((k) => selectedChildIds.includes(k.id));
      const validCustomQuestions = customQuestions.filter((q) => q.prompt.trim() !== "");

      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaignId || undefined,
          name,
          roleTarget,
          targetChildren,
          askHourlyRate,
          phone,
          email,
          parentNotes,
          customQuestions: validCustomQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create candidate invitation");

      setCreatedCandidate(data.candidate);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const testUrl = createdCandidate ? `${origin}/test/${createdCandidate.token}` : "";
  const shareMessage = createdCandidate
    ? t.whatsappInvite(createdCandidate.name, createdCandidate.roleTarget, testUrl)
    : "";

  const handleCopy = () => {
    if (!testUrl) return;
    navigator.clipboard.writeText(testUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMultiChildSelected = selectedChildIds.length > 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToCandidates}</span>
          </Link>

          {/* Quick link to preview form */}
          <Link
            href="/test/preview"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === "es" ? "Vista Previa del Test" : "Preview Candidate Test"}</span>
          </Link>
        </div>

        {!createdCandidate ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.inviteCandidateHeader}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.inviteCandidateSub}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Camila Rodriguez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              {/* Children Selection Section */}
              {familyChildren.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {t.selectChildrenForRole}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {selectedChildIds.length} {language === "es" ? "seleccionado(s)" : "selected"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddChild(true)}
                        className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>{language === "es" ? "+ Registrar otra persona" : "+ Register another recipient"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Campaign Focus Selectors */}
                  {familyChildren.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 pb-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {language === "es" ? "Campaña para:" : "Campaign for:"}
                      </span>
                      {familyChildren.map((kid) => (
                        <button
                          key={kid.id}
                          type="button"
                          onClick={() => {
                            setSelectedChildIds([kid.id]);
                            updateDefaultRole([kid]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selectedChildIds.length === 1 && selectedChildIds[0] === kid.id
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          👶 {language === "es" ? `Solo ${kid.name} (${kid.age}a)` : `Only ${kid.name} (${kid.age}yo)`}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = familyChildren.map((k) => k.id);
                          setSelectedChildIds(allIds);
                          updateDefaultRole(familyChildren);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedChildIds.length === familyChildren.length
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        👫 {language === "es" ? "Ambos Hermanos" : "All Siblings"}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {familyChildren.map((kid) => {
                      const isChecked = selectedChildIds.includes(kid.id);
                      return (
                        <button
                          key={kid.id}
                          type="button"
                          onClick={() => handleToggleChild(kid.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                            isChecked
                              ? "bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-xs"
                              : "bg-slate-100/60 border-slate-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isChecked ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              <Baby className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{kid.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {kid.age} {language === "es" ? "años de edad" : "years old"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              isChecked
                                ? "bg-sky-600 border-sky-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isMultiChildSelected && (
                    <div className="p-3 rounded-lg bg-sky-100/60 border border-sky-200/80 flex items-start gap-2.5 text-xs text-sky-950">
                      <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          {language === "es"
                            ? "✨ Modo Múltiples Hijos Activo"
                            : "✨ Multi-Child Mode Active"}
                        </span>
                        <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">
                          {t.multiChildExplanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Age-Targeted Recommendation Interstitial */}
              {selectedChildIds.length > 0 && (
                <AgeTargetedAdCard
                  childAge={familyChildren.find((k) => selectedChildIds.includes(k.id))?.age || 3}
                  childName={familyChildren.find((k) => selectedChildIds.includes(k.id))?.name}
                  placement="campaign_interstitial"
                />
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.targetPosition}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Time Nanny for 3yo Leo"
                  value={roleTarget}
                  onChange={(e) => setRoleTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.phoneOptional}
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.emailOptional}
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.privateNotesOptional}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === "es"
                      ? "Ej: Contactada por recomendación. Indicó 4 años de experiencia. Verificar certificado de RCP..."
                      : "e.g. Stated 4 years experience with twins. Needs verification on CPR card..."
                  }
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              {/* Hourly Rate Option (Parent Choice) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={askHourlyRate}
                    onChange={(e) => setAskHourlyRate(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {t.askHourlyRateLabel}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {t.askHourlyRateDesc}
                    </p>
                  </div>
                </label>
              </div>

              {/* Family Custom Questions Builder */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-sky-50/50 to-slate-50/80 border border-sky-200/70 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-black text-slate-900">
                        {t.customQuestionsTitle}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t.customQuestionsDesc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsQuestionBankOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === "es" ? "📚 Banco de Preguntas" : "📚 Question Bank"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addCustomQuestion("multiple_choice")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === "es" ? "+ Opción Múltiple" : "+ Multiple Choice"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addCustomQuestion("open_text")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === "es" ? "+ Texto Libre" : "+ Open Text"}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Suggestion Templates & Bank Groups */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === "es" ? "Insertar Grupos del Banco de Preguntas:" : "Insert Question Bank Groups:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsQuestionBankOpen(true)}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
                    >
                      {language === "es" ? "Ver todas las preguntas →" : "Browse all questions →"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyBankGroup("grp_safety")}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-colors font-semibold flex items-center gap-1"
                    >
                      <span>🛡️</span> {language === "es" ? "Seguridad & Vacunas (3)" : "Safety & Vaccines (3)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBankGroup("grp_tech_privacy")}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-800 transition-colors font-semibold flex items-center gap-1"
                    >
                      <span>📱</span> {language === "es" ? "Celular & Redes (2)" : "Phone & Social (2)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBankGroup("grp_nutrition")}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 transition-colors font-semibold flex items-center gap-1"
                    >
                      <span>🍎</span> {language === "es" ? "Alimentación & BLW (2)" : "Nutrition & BLW (2)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBankGroup("grp_discipline")}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-800 transition-colors font-semibold flex items-center gap-1"
                    >
                      <span>🧸</span> {language === "es" ? "Rabietas & Crianza (2)" : "Tantrums & Care (2)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBankGroup("grp_logistics")}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 transition-colors font-semibold flex items-center gap-1"
                    >
                      <span>🚗</span> {language === "es" ? "Licencia & Viajes (2)" : "Driving & Travel (2)"}
                    </button>
                  </div>
                </div>

                {/* Custom Questions List */}
                {customQuestions.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {customQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold flex items-center justify-center">
                              {qIdx + 1}
                            </span>
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                              <button
                                type="button"
                                onClick={() => updateQuestionType(q.id, "multiple_choice")}
                                className={`px-2 py-0.5 rounded-md transition-colors ${
                                  q.type === "multiple_choice"
                                    ? "bg-white text-sky-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {t.typeMultipleChoice}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateQuestionType(q.id, "open_text")}
                                className={`px-2 py-0.5 rounded-md transition-colors ${
                                  q.type === "open_text"
                                    ? "bg-white text-sky-900 shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {t.typeOpenText}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveToBank(q)}
                              disabled={savingBankId === q.id || savedBankIds.includes(q.id)}
                              title={language === "es" ? "Guardar en mi Banco de Preguntas para futuras evaluaciones" : "Save to my Question Bank for future assessments"}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                savedBankIds.includes(q.id)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200"
                              }`}
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>
                                {savedBankIds.includes(q.id)
                                  ? language === "es" ? "✓ En Banco" : "✓ In Bank"
                                  : savingBankId === q.id
                                  ? "..."
                                  : language === "es" ? "Guardar en Banco" : "Save to Bank"}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => removeCustomQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title={t.removeQuestion}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Question Prompt */}
                        <div>
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => updateQuestionPrompt(q.id, e.target.value)}
                            placeholder={t.promptPlaceholder}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-800"
                          />
                        </div>

                        {/* Multiple Choice Options */}
                        {q.type === "multiple_choice" && (
                          <div className="space-y-2 pl-2 border-l-2 border-sky-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {t.optionsLabel}
                            </span>

                            {q.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    updateQuestionOption(q.id, optIdx, e.target.value)
                                  }
                                  placeholder={t.optionPlaceholder(optIdx)}
                                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                                {q.options && q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOptionFromQuestion(q.id, optIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addOptionToQuestion(q.id)}
                              className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1 pt-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t.addOption}</span>
                            </button>
                          </div>
                        )}

                        {q.type === "open_text" && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs text-slate-500 italic">
                            {language === "es"
                              ? "La candidata responderá en un campo de texto abierto con sus propias palabras."
                              : "The candidate will answer with their own detailed words in a free-form text box."}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 px-3 rounded-xl border border-dashed border-sky-200 bg-white/60">
                    <p className="text-xs text-slate-500">
                      {language === "es"
                        ? "¿Deseas hacer preguntas particulares sobre tu hogar? Usa las sugerencias arriba o agrega una pregunta propia."
                        : "Want to ask household-specific questions? Click a template above or create your own."}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t.generating : t.createAndGetLink}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {t.linkReadyTitle(createdCandidate.name)}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.linkReadyDesc}
              </p>
            </div>

            {/* Test Link Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t.uniqueUrl}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={testUrl}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-800 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shrink-0 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.copied : t.copyLink}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.sendWhatsapp}</span>
              </a>

              <a
                href={`mailto:${createdCandidate.email || ""}?subject=${encodeURIComponent(
                  language === "es"
                    ? `Evaluación de Cuidado Infantil para ${createdCandidate.roleTarget}`
                    : `Childcare Assessment for ${createdCandidate.roleTarget}`
                )}&body=${encodeURIComponent(shareMessage)}`}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-colors"
              >
                <Mail className="w-4 h-4 text-sky-600" />
                <span>{t.sendEmail}</span>
              </a>
            </div>

            {/* Try it out yourself button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`/test/${createdCandidate.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <span>{t.previewNewTab}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                {t.returnDashboard}
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Quick Add Child Modal */}
      {showQuickAddChild && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === "es" ? "Registrar Familiar o Persona a Cuidar" : "Register Care Recipient"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "es" ? "Hijo, adulto mayor o persona con necesidades especiales" : "Child, elderly, or special needs recipient"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddChild(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddChild} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === "es" ? "Nombre *" : "Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "es" ? "ej. Carmen, Sofía o Mateo" : "e.g. Carmen, Sofia, or Leo"}
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === "es" ? "Notas de Atención / Cuidados (Opcional)" : "Care Details / Routines (Optional)"}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === "es" ? "ej. Movilidad reducida, demencia, TEA, alergias, siestas..." : "e.g. Reduced mobility, dementia, autism, allergies, routines..."}
                  value={newChildNotes}
                  onChange={(e) => setNewChildNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddChild(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingChild || !newChildName.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl disabled:opacity-50"
                >
                  {savingChild ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar y Seleccionar" : "Save & Select")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAddQuestions={(newQs) => setCustomQuestions((prev) => [...prev, ...newQs])}
      />
    </div>
  );
}
