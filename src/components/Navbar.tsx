"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Baby,
  LogOut,
  HeartHandshake,
  UserPlus,
  Eye,
  Users,
  Users2,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Layers,
  Settings,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageContext";
import { Child } from "@/lib/types";
import BrandLogo from "./BrandLogo";

interface NavbarProps {
  user?: {
    id?: string;
    name: string;
    email: string;
    role?: "parent" | "admin";
    children?: Child[];
    childProfile?: {
      name: string;
      age: number;
    };
  } | null;
  onOpenCreateCampaign?: () => void;
  onOpenQuestionBank?: () => void;
}

export default function Navbar({
  user,
  onOpenCreateCampaign,
  onOpenQuestionBank,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const isAdmin =
    user?.role === "admin" ||
    user?.email === "francisco.deskmultimedia@gmail.com";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const childrenCount = user?.children?.length || (user?.childProfile ? 1 : 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Main Nav */}
        <div className="flex items-center gap-8">
          <BrandLogo href={user ? "/dashboard" : "/"} />

          {/* Navigation items for logged-in parents */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/dashboard"
                    ? "bg-slate-100 text-slate-900 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {language === "es" ? "Campañas" : "Campaigns"}
              </Link>

              <Link
                href="/dashboard/family"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname === "/dashboard/family"
                    ? "bg-amber-50 text-amber-900 font-black border border-amber-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === "es" ? "Personas a Cuidar" : "Care Recipients"}</span>
                {childrenCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                    {childrenCount}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/questions"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname === "/dashboard/questions"
                    ? "bg-indigo-50 text-indigo-900 font-black border border-indigo-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === "es" ? "Banco de Preguntas & Tests" : "Question Bank & Tests"}</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Actions, Language Switcher & User Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <>
              {/* Primary Action Button: Create Campaign */}
              {onOpenCreateCampaign ? (
                <button
                  type="button"
                  onClick={onOpenCreateCampaign}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                  <span>
                    {language === "es" ? "+ Nueva Campaña" : "+ New Campaign"}
                  </span>
                </button>
              ) : (
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    {language === "es" ? "+ Invitar Niñera" : "+ Invite Nanny"}
                  </span>
                </Link>
              )}

              {/* Simplified Profile Avatar Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer select-none"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {/* User Info Header */}
                    <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {user.name}
                          </p>
                          {isAdmin && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Children Quick Info */}
                    <div className="p-2.5 my-1 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <Baby className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t.familyChildren}</span>
                        </span>
                        <Link
                          href="/dashboard/family"
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline"
                        >
                          {language === "es" ? "Administrar" : "Manage"} &rarr;
                        </Link>
                      </div>
                      <p className="text-[11px] text-amber-800/90 truncate">
                        {user.children && user.children.length > 0
                          ? user.children
                              .map((c) => `${c.name} (${c.age}a)`)
                              .join(" • ")
                          : user.childProfile
                          ? `${user.childProfile.name} (${user.childProfile.age}a)`
                          : language === "es"
                          ? "Sin familiares registrados"
                          : "No care recipients added"}
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="space-y-0.5 py-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors"
                        >
                          <span className="text-sm">👑</span>
                          <span>Super Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        href="/test/preview"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-sky-600" />
                        <span>
                          {language === "es"
                            ? "Vista Previa del Test de Evaluación"
                            : "Assessment Form Preview"}
                        </span>
                      </Link>

                      <Link
                        href="/dashboard/questions"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>
                          {language === "es"
                            ? "Banco de Preguntas & Tests"
                            : "Question Bank & Tests"}
                        </span>
                      </Link>

                      <Link
                        href="/dashboard/family"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors"
                      >
                        <Users2 className="w-4 h-4 text-amber-600" />
                        <span>
                          {language === "es"
                            ? "Personas y Familiares a Cuidar"
                            : "Family & Care Recipients"}
                        </span>
                      </Link>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.signOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                {t.signIn}
              </Link>
              <Link
                href="/login?tab=register"
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-sky-600/20 transition-all active:scale-95"
              >
                {t.getStarted}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
