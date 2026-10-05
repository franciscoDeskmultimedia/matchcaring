"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ParentCampaign } from "@/lib/types";
import { useLanguage } from "./LanguageContext";

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: ParentCampaign | null;
  currentUserId?: string;
  onCampaignUpdated?: (updated: ParentCampaign) => void;
}

export default function ShareCampaignModal({
  isOpen,
  onClose,
  campaign,
  currentUserId,
  onCampaignUpdated,
}: ShareCampaignModalProps) {
  const { language } = useLanguage();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !campaign) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareCode = campaign.shareCode || campaign.id;
  const joinUrl = `${origin}/dashboard?joinCode=${encodeURIComponent(shareCode)}`;

  const isOwner = !currentUserId || campaign.userId === currentUserId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText =
    language === "es"
      ? `¡Hola! Te comparto la campaña de selección de cuidadores "${campaign.title}" en MatchCaring. Puedes unirte al panel de evaluación con este enlace: ${joinUrl} o ingresando el código: ${shareCode}`
      : `Hi! I'm sharing the caregiver screening campaign "${campaign.title}" on MatchCaring. You can join the evaluation panel using this link: ${joinUrl} or code: ${shareCode}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/campaigns/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          email: inviteEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(
          data.error ||
            (language === "es"
              ? "Error al compartir la campaña"
              : "Failed to share campaign")
        );
      } else {
        setSuccessMessage(
          language === "es"
            ? `¡Campaña compartida con ${inviteEmail.trim()}!`
            : `Campaign shared with ${inviteEmail.trim()}!`
        );
        setInviteEmail("");
        if (data.campaign && onCampaignUpdated) {
          onCampaignUpdated(data.campaign);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>
                  {language === "es"
                    ? "Compartir Campaña con Otro Usuario"
                    : "Share Campaign with Another User"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {campaign.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Explanation banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5">
            <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === "es"
                ? "Al compartir esta campaña con tu pareja, familiar o co-evaluador, podrán ver a las mismas postulantes, comparar puntajes psicológicos y revisar alertas de seguridad en tiempo real."
                : "Sharing this campaign with your spouse, family member, or co-evaluator lets them view candidate profiles, compare psychological scores, and review safety flags in real time."}
            </p>
          </div>

          {/* Share Code Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {language === "es"
                ? "Código Único de Campaña"
                : "Unique Campaign Code"}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 text-center tracking-wider select-all">
                {shareCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{language === "es" ? "Copiado" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === "es" ? "Copiar Código" : "Copy Code"}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === "es"
                ? "El otro usuario puede ingresar este código en su panel para vincular la campaña al instante."
                : "The other user can enter this code in their dashboard to link this campaign instantly."}
            </p>
          </div>

          {/* Direct Invite Link */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {language === "es" ? "Enlace Directo de Co-evaluador" : "Direct Co-evaluator Link"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copiedLink
                    ? language === "es"
                      ? "Copiado"
                      : "Copied"
                    : language === "es"
                    ? "Copiar"
                    : "Copy"}
                </span>
              </button>
            </div>
          </div>

          {/* Quick share actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>{language === "es" ? "Compartir por WhatsApp" : "Share via WhatsApp"}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Copy className="w-4 h-4 text-indigo-600" />
              <span>{language === "es" ? "Copiar Invitación" : "Copy Invitation"}</span>
            </button>
          </div>

          {/* Invite by Email Form */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {language === "es"
                  ? "Invitar por Correo Electrónico"
                  : "Invite via Email"}
              </span>
            </label>
            <form onSubmit={handleInviteUser} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? language === "es"
                      ? "Enviando..."
                      : "Sending..."
                    : language === "es"
                    ? "Compartir"
                    : "Share"}
                </span>
              </button>
            </form>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </p>
            )}
          </div>

          {/* List of current shared users / collaborators */}
          {campaign.sharedWithEmails && campaign.sharedWithEmails.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === "es"
                  ? `Colaboradores con acceso (${campaign.sharedWithEmails.length})`
                  : `Collaborators with access (${campaign.sharedWithEmails.length})`}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.sharedWithEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>{email}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === "es"
                ? "Privacidad protegida: solo personas autorizadas"
                : "Protected privacy: only authorized parties"}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            {language === "es" ? "Cerrar" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
