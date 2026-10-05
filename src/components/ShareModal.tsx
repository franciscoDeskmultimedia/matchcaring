"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Mail, MessageCircle, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  token: string;
  roleTarget: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  candidateName,
  token,
  roleTarget,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const testUrl = `${origin}/test/${token}`;

  const messageText =
    language === "es"
      ? `Hola ${candidateName}, ¡gracias por tu interés en la posición (${roleTarget})! Por favor tómate 10 minutos para completar nuestra evaluación de cuidado infantil y seguridad antes de nuestra entrevista: ${testUrl}`
      : `Hi ${candidateName}, thank you for your interest in the position (${roleTarget})! Please complete this brief 10-minute childcare and safety assessment before our interview: ${testUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    language === "es"
      ? `Evaluación de Cuidado Infantil para ${roleTarget}`
      : `Childcare Assessment for ${roleTarget}`
  )}&body=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(testUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.sendLinkTo(candidateName)}
            </h3>
            <p className="text-xs text-slate-500">{t.sendLinkDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Link box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.uniqueUrl}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={testUrl}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shrink-0 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Quick share actions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.directInviteOptions}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.sendWhatsapp}</span>
              </a>

              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 text-sky-800 text-xs font-semibold transition-colors"
              >
                <Mail className="w-4 h-4 text-sky-600" />
                <span>{t.sendEmail}</span>
              </a>
            </div>
          </div>

          {/* Direct preview button */}
          <div className="pt-2 border-t border-slate-100">
            <a
              href={`/test/${token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>{t.previewNewTab}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
