"use client";

import { useState, useEffect } from "react";
import { CareCategory, CustomQuestion, QuestionBankGroup, QuestionBankItem } from "@/lib/types";
import { DEFAULT_QUESTION_BANK_GROUPS } from "@/lib/questionBank";
import { useLanguage } from "./LanguageContext";
import {
  Activity,
  AlignLeft,
  Brain,
  Check,
  CheckSquare,
  ChevronDown,
  Filter,
  HelpCircle,
  Layers,
  ListPlus,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Square,
  Trash2,
  Utensils,
  X,
  BookmarkCheck,
} from "lucide-react";

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions?: (questions: CustomQuestion[]) => void;
  existingQuestionPrompts?: string[];
  initialCategory?: CareCategory | "all";
}

export default function QuestionBankModal({
  isOpen,
  onClose,
  onAddQuestions,
  existingQuestionPrompts = [],
  initialCategory = "all",
}: QuestionBankModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"browse" | "create">("browse");
  const [controlType, setControlType] = useState<"dropdown" | "pills">("dropdown");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<QuestionBankGroup[]>(DEFAULT_QUESTION_BANK_GROUPS);
  const [careDomainFilter, setCareDomainFilter] = useState<CareCategory | "all">(
    initialCategory || "all"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // New question form state
  const [newCareCategory, setNewCareCategory] = useState<CareCategory>(
    initialCategory !== "all" ? initialCategory : "childcare"
  );
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState<"multiple_choice" | "open_text">("multiple_choice");
  const [newOptions, setNewOptions] = useState<string[]>(["Sí", "No", "Depende de la ocasión"]);
  const [newRequired, setNewRequired] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/question-bank");
      if (res.ok) {
        const data = await res.json();
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
        }
      }
    } catch (e) {
      console.error("Error fetching question bank:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredGroups = groups.filter((g) => {
    if (careDomainFilter === "all") return true;
    if (!g.careCategory || g.careCategory === "all") return true;
    return g.careCategory === careDomainFilter;
  });

  const allQuestions: QuestionBankItem[] = filteredGroups.flatMap((g) => g.questions);

  const displayedQuestions =
    selectedGroupId === "all"
      ? allQuestions
      : filteredGroups.find((g) => g.id === selectedGroupId)?.questions || [];

  const searchedQuestions = displayedQuestions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    const prompt = (language === "es" && q.promptEs ? q.promptEs : q.prompt).toLowerCase();
    const group = (language === "es" ? q.groupNameEs : q.groupNameEn).toLowerCase();
    const options = (language === "es" && q.optionsEs ? q.optionsEs : q.options || []).join(" ").toLowerCase();
    return prompt.includes(term) || group.includes(term) || options.includes(term);
  });

  const handleToggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSelectAllInCurrentGroup = () => {
    const currentIds = searchedQuestions.map((q) => q.id);
    const allAlreadySelected = currentIds.length > 0 && currentIds.every((id) => selectedQuestionIds.includes(id));

    if (allAlreadySelected) {
      setSelectedQuestionIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleConfirmAdd = () => {
    if (!onAddQuestions) {
      onClose();
      return;
    }

    const questionsToAdd: CustomQuestion[] = allQuestions
      .filter((q) => selectedQuestionIds.includes(q.id))
      .map((q) => {
        const prompt = language === "es" && q.promptEs ? q.promptEs : q.prompt;
        const options =
          q.type === "multiple_choice"
            ? language === "es" && q.optionsEs
              ? q.optionsEs
              : q.options || ["Sí", "No"]
            : undefined;

        return {
          id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: q.type,
          prompt,
          options,
          required: q.required !== false,
        };
      });

    onAddQuestions(questionsToAdd);
    onClose();
  };

  // Create new question in bank
  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    setSavingQuestion(true);
    setSaveSuccessMsg("");

    try {
      const filteredOpts =
        newType === "multiple_choice"
          ? newOptions.filter((o) => o.trim().length > 0)
          : undefined;

      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: newPrompt.trim(),
          promptEs: newPrompt.trim(),
          type: newType,
          options: filteredOpts,
          optionsEs: filteredOpts,
          required: newRequired,
          careCategory: newCareCategory,
          groupId: "grp_user_saved",
          groupNameEs: "⭐ Mis Preguntas Guardadas",
          groupNameEn: "⭐ My Saved Questions",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh question list
        await fetchGroups();
        setSaveSuccessMsg(
          language === "es"
            ? "¡Pregunta guardada exitosamente en tu banco!"
            : "Question saved successfully to your bank!"
        );
        // Automatically select the new question
        if (data.item?.id) {
          setSelectedQuestionIds((prev) => [...prev, data.item.id]);
        }
        // Reset form
        setNewPrompt("");
        setNewOptions(["Sí", "No", "Depende de la ocasión"]);
        // Switch back to browse tab after 1s
        setTimeout(() => {
          setActiveTab("browse");
          setSelectedGroupId("grp_user_saved");
          setSaveSuccessMsg("");
        }, 1200);
      }
    } catch (err) {
      console.error("Error creating bank question:", err);
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteUserQuestion = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === "es" ? "¿Eliminar esta pregunta de tu banco personal?" : "Delete this question from your personal bank?")) return;

    try {
      const res = await fetch(`/api/question-bank?id=${questionId}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedQuestionIds((prev) => prev.filter((id) => id !== questionId));
        await fetchGroups();
      }
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{language === "es" ? "Banco de Preguntas" : "Question Bank"}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {allQuestions.length} {language === "es" ? "preguntas" : "questions"}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === "es"
                  ? "Crea o selecciona preguntas reutilizables para tus evaluaciones y campañas."
                  : "Create or pick reusable questions for your evaluations and campaigns."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Explorar vs Crear) */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "browse"
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {language === "es" ? "📚 Explorar Banco" : "📚 Browse Bank"} ({allQuestions.length})
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "create"
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Crear Nueva Pregunta" : "Create New Question"}</span>
            </button>
          </div>

          {activeTab === "browse" && (
            <button
              onClick={() => setActiveTab("create")}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span>{language === "es" ? "+ Agregar al Banco" : "+ Add to Bank"}</span>
            </button>
          )}
        </div>

        {activeTab === "browse" ? (
          <>
            {/* Search and Control Mode Switcher Bar */}
            <div className="px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Live search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === "es"
                      ? "Buscar preguntas por palabra clave, grupo..."
                      : "Search questions by keyword, topic..."
                  }
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Control Mode Switcher: Dropdown vs Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setControlType("dropdown")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    controlType === "dropdown"
                      ? "bg-white text-sky-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={
                    language === "es"
                      ? "Menú desplegable: excelente para títulos largos sin cortes"
                      : "Dropdown menu: best for long titles"
                  }
                >
                  <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
                  <span>{language === "es" ? "Menú Desplegable" : "Dropdown Menu"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setControlType("pills")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    controlType === "pills"
                      ? "bg-white text-sky-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={
                    language === "es"
                      ? "Etiquetas y pestañas visuales con espaciado amplio"
                      : "Tags & pills view"
                  }
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === "es" ? "Etiquetas / Pestañas" : "Tags / Pills"}</span>
                </button>
              </div>
            </div>

            {controlType === "dropdown" ? (
              /* Dropdown Select Mode: Ideal for very long titles so nothing gets lost on edges */
              <div className="px-6 py-4 bg-white border-b border-slate-200/80 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Dropdown 1: Care Focus */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>{language === "es" ? "1. Enfoque de Cuidado:" : "1. Care Focus:"}</span>
                      </span>
                      {careDomainFilter !== "all" && (
                        <span className="text-[10px] text-sky-600 font-bold lowercase">
                          ({language === "es" ? "filtrado" : "filtered"})
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={careDomainFilter}
                        onChange={(e) => {
                          setCareDomainFilter(e.target.value as CareCategory | "all");
                          setSelectedGroupId("all");
                        }}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="all">
                          🌐 {language === "es" ? "Todos los Cuidados (Infantil, Mayor, Discapacidad)" : "All Care Categories"}
                        </option>
                        <option value="childcare">
                          👶 {language === "es" ? "Niñeras e Infantil (Desarrollo y Seguridad)" : "Childcare & Nannies"}
                        </option>
                        <option value="elderly_care">
                          👵 {language === "es" ? "Adulto Mayor (Gerontología, Medicación y Movilidad)" : "Elderly & Gerontological Care"}
                        </option>
                        <option value="disability_care">
                          ♿ {language === "es" ? "Discapacidad, Neurodiversidad y Necesidades Especiales" : "Disability & Neurodiversity"}
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dropdown 2: Group / Thematic Topic */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{language === "es" ? "2. Grupo Temático de Preguntas:" : "2. Thematic Question Group:"}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {filteredGroups.length} {language === "es" ? "grupos" : "groups"}
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="all">
                          📚 {language === "es" ? `Todos los Grupos Temáticos (${allQuestions.length} preguntas)` : `All Groups (${allQuestions.length} questions)`}
                        </option>
                        {filteredGroups.map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {language === "es" ? grp.nameEs : grp.nameEn} ({grp.questions.length}{" "}
                            {language === "es" ? "preguntas" : "questions"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Active Selection Breadcrumb info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-400">
                      {language === "es" ? "Grupo activo:" : "Active group:"}
                    </span>
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedGroupId === "all"
                        ? language === "es"
                          ? "Todos los Grupos"
                          : "All Groups"
                        : language === "es"
                        ? filteredGroups.find((g) => g.id === selectedGroupId)?.nameEs
                        : filteredGroups.find((g) => g.id === selectedGroupId)?.nameEn}
                    </span>
                  </div>
                  {selectedGroupId !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId("all")}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
                    >
                      {language === "es" ? "Ver todos los grupos" : "View all groups"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Pills / Tags Mode: With ample spacing and full wrap */
              <>
                {/* Care Domain Filter Bar */}
                <div className="px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>{language === "es" ? "Filtrar por Enfoque de Cuidado:" : "Filter by Care Focus:"}</span>
                    </span>
                    {careDomainFilter !== "all" && (
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full border border-sky-200">
                        {language === "es" ? "Enfoque activo" : "Active focus"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCareDomainFilter("all");
                        setSelectedGroupId("all");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                        careDomainFilter === "all"
                          ? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20"
                          : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                      }`}
                    >
                      <span>🌐</span>
                      <span>{language === "es" ? "Todos los Cuidados" : "All Care"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCareDomainFilter("childcare");
                        setSelectedGroupId("all");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                        careDomainFilter === "childcare"
                          ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/30"
                          : "bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-800 border border-slate-200"
                      }`}
                    >
                      <span>👶</span>
                      <span>{language === "es" ? "Niñeras e Infantil" : "Childcare"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCareDomainFilter("elderly_care");
                        setSelectedGroupId("all");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                        careDomainFilter === "elderly_care"
                          ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30"
                          : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
                      }`}
                    >
                      <span>👵</span>
                      <span>{language === "es" ? "Adulto Mayor (Gerontología)" : "Elderly Care"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCareDomainFilter("disability_care");
                        setSelectedGroupId("all");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                        careDomainFilter === "disability_care"
                          ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/30"
                          : "bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-800 border border-slate-200"
                      }`}
                    >
                      <span>♿</span>
                      <span>{language === "es" ? "Discapacidad y Neurodiversidad" : "Disability & Neurodiversity"}</span>
                    </button>
                  </div>
                </div>

                {/* Category / Group Filter Pills */}
                <div className="px-6 py-4 bg-white border-b border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === "es" ? "Grupos y Temáticas Disponibles:" : "Thematic Groups:"}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {filteredGroups.length} {language === "es" ? "grupos" : "groups"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    <button
                      onClick={() => setSelectedGroupId("all")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                        selectedGroupId === "all"
                          ? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                      }`}
                    >
                      <span>{language === "es" ? "Todos los Grupos" : "All Groups"}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          selectedGroupId === "all" ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-700"
                        }`}
                      >
                        {allQuestions.length}
                      </span>
                    </button>

                    {filteredGroups.map((grp) => {
                      const isSelected = selectedGroupId === grp.id;
                      return (
                        <button
                          key={grp.id}
                          onClick={() => setSelectedGroupId(grp.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2 ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/25"
                              : "bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-900 border border-slate-200 hover:border-sky-300"
                          }`}
                        >
                          <span>{language === "es" ? grp.nameEs : grp.nameEn}</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {grp.questions.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Batch action bar */}
            <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleSelectAllInCurrentGroup}
                className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-sky-600" />
                <span>
                  {language === "es"
                    ? "Seleccionar / Deseleccionar Todo lo Visible"
                    : "Select / Deselect all visible"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">
                  {searchedQuestions.length}{" "}
                  {language === "es" ? "preguntas disponibles" : "questions available"}
                  {searchQuery && (
                    <span className="text-sky-600 font-bold ml-1">
                      {language === "es"
                        ? `(filtrado por "${searchQuery}")`
                        : `(filtered by "${searchQuery}")`}
                    </span>
                  )}
                </span>
                <span className="text-slate-800 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {selectedQuestionIds.length}{" "}
                  {language === "es" ? "seleccionadas" : "selected"}
                </span>
              </div>
            </div>

            {/* Questions List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {searchedQuestions.length === 0 && searchQuery ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {language === "es"
                      ? `No encontramos preguntas con "${searchQuery}"`
                      : `No questions found matching "${searchQuery}"`}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === "es"
                      ? "Intenta buscar con otra palabra clave o limpia el filtro para ver todas las preguntas disponibles."
                      : "Try another keyword or clear the search to see all questions."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {language === "es" ? "Limpiar Búsqueda" : "Clear Search"}
                  </button>
                </div>
              ) : displayedQuestions.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {language === "es" ? "Aún no tienes preguntas guardadas" : "No saved questions yet"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === "es"
                      ? "Crea preguntas personalizadas y guárdalas aquí para no tener que escribirlas de nuevo."
                      : "Create custom questions and save them here so you never have to retype them."}
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition-colors"
                  >
                    {language === "es" ? "+ Crear mi Primera Pregunta" : "+ Create My First Question"}
                  </button>
                </div>
              ) : (
                searchedQuestions.map((q) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  const prompt = language === "es" && q.promptEs ? q.promptEs : q.prompt;
                  const options = language === "es" && q.optionsEs ? q.optionsEs : q.options;

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleToggleQuestion(q.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group relative ${
                        isSelected
                          ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="pt-0.5 shrink-0 text-sky-600">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {language === "es" ? q.groupNameEs : q.groupNameEn}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                q.type === "multiple_choice"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {q.type === "multiple_choice"
                                ? language === "es"
                                  ? "Opción Múltiple"
                                  : "Multiple Choice"
                                : language === "es"
                                ? "Texto Libre"
                                : "Open Text"}
                            </span>
                            {q.isCustomUser && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                <span>{language === "es" ? "Guardada por ti" : "Saved by you"}</span>
                              </span>
                            )}
                            {q.required && (
                              <span className="text-[10px] text-amber-700 font-semibold">
                                *{language === "es" ? "Obligatoria" : "Required"}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{prompt}</h4>

                          {q.type === "multiple_choice" && options && options.length > 0 && (
                            <div className="pt-1.5 flex flex-wrap gap-1.5">
                              {options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  &bull; {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {q.isCustomUser && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteUserQuestion(q.id, e)}
                            title={language === "es" ? "Eliminar de mi banco" : "Delete from my bank"}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Create Question View */
          <form onSubmit={handleSaveNewQuestion} className="flex-1 overflow-y-auto p-6 space-y-5">
            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es" ? "Enfoque o Categoría de Cuidado *" : "Care Category / Focus *"}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewCareCategory("childcare")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    newCareCategory === "childcare"
                      ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-500/30"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>👶</span>
                  <span>{language === "es" ? "Niñeras e Infantil" : "Childcare"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewCareCategory("elderly_care")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    newCareCategory === "elderly_care"
                      ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>👵</span>
                  <span>{language === "es" ? "Adulto Mayor" : "Elderly Care"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewCareCategory("disability_care")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    newCareCategory === "disability_care"
                      ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/30"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span>♿</span>
                  <span>{language === "es" ? "Discapacidad / Especial" : "Special Needs"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === "es" ? "Enunciado o Pregunta *" : "Question / Prompt *"}
              </label>
              <input
                type="text"
                required
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder={
                  language === "es"
                    ? "Ej: ¿Tienes experiencia cuidando a niños con alergias o dietas especiales?"
                    : "E.g.: Do you have experience caring for children with food allergies?"
                }
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es" ? "Tipo de Respuesta" : "Answer Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("multiple_choice")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newType === "multiple_choice"
                        ? "bg-sky-50 border-sky-500 text-sky-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {language === "es" ? "Opción Múltiple" : "Multiple Choice"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("open_text")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newType === "open_text"
                        ? "bg-sky-50 border-sky-500 text-sky-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {language === "es" ? "Texto Libre" : "Open Text"}
                  </button>
                </div>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {language === "es" ? "Respuesta obligatoria para la candidata" : "Required response for candidate"}
                  </span>
                </label>
              </div>
            </div>

            {newType === "multiple_choice" && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {language === "es" ? "Opciones de Respuesta" : "Answer Choices"}
                </label>
                <div className="space-y-2">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx] = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`Opción ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ""])}
                  className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "+ Añadir otra opción" : "+ Add another option"}</span>
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                {language === "es" ? "Volver al Banco" : "Back to Bank"}
              </button>

              <button
                type="submit"
                disabled={savingQuestion || !newPrompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>
                  {savingQuestion
                    ? language === "es" ? "Guardando..." : "Saving..."
                    : language === "es" ? "Guardar en Mi Banco" : "Save to My Bank"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {language === "es" ? "Cerrar" : "Close"}
          </button>

          {onAddQuestions && (
            <button
              type="button"
              disabled={selectedQuestionIds.length === 0}
              onClick={handleConfirmAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>
                {language === "es"
                  ? `Añadir (${selectedQuestionIds.length}) al Test`
                  : `Add (${selectedQuestionIds.length}) to Test`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
