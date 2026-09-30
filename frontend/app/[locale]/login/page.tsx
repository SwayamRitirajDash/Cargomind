"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  UserIcon,
  LockIcon,
  BuildingIcon,
  ShieldCheckIcon,
  CheckmarkCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  LogoutIcon,
  SparklesIcon,
  TruckIcon,
  PackageIcon,
  CpuIcon,
  CreditCardIcon,
  RouteIcon,
} from "../../../components/icons/Hugeicons";
import {
  DEMO_PRESETS,
  TenantRole,
  AuthSession,
  getStoredAuth,
  loginWithDemo,
  loginWithCredentials,
  registerTenant,
  clearStoredAuth,
  subscribeAuthChange,
} from "../../../lib/api/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-50 dark:bg-[#09090b]">
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Loading Access Gateway...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const t = useTranslations("auth");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const redirectTarget = searchParams.get("redirect") || `/${locale}`;

  const [activeTab, setActiveTab] = useState<"demo" | "login" | "register">("demo");
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    role: "shipper" as TenantRole,
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    role: "shipper" as TenantRole,
    region: "Guwahati Multimodal Logistics Park (MMLP)",
  });

  useEffect(() => {
    setCurrentSession(getStoredAuth());
    const unsubscribe = subscribeAuthChange((session) => {
      setCurrentSession(session);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleDemoLogin = async (role: TenantRole) => {
    try {
      setLoadingRole(role);
      const session = await loginWithDemo(role);
      showToast("success", `${session.name} (${session.tenantRole.toUpperCase()}) authenticated successfully!`);
      setTimeout(() => {
        if (redirectTarget && redirectTarget !== `/${locale}/login`) {
          router.push(redirectTarget);
        }
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Authentication error";
      showToast("error", errorMsg);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.identifier.trim()) {
      showToast("error", "Please enter an email, username, or Tenant UUID.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await loginWithCredentials(
        loginForm.identifier,
        loginForm.password,
        loginForm.role
      );
      showToast("success", `${session.name} authenticated!`);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Sign in failed";
      showToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) {
      showToast("error", "Please enter your enterprise / organization name.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await registerTenant(
        registerForm.name,
        registerForm.role,
        registerForm.email
      );
      showToast("success", `Registered ${session.name}! Session initialized.`);
      setTimeout(() => {
        router.push(redirectTarget);
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Registration failed";
      showToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    clearStoredAuth();
    showToast("success", "Successfully signed out. Switched to guest mode.");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-neutral-50/50 dark:bg-[#09090b] text-[#0a0a0a] dark:text-[#f4f4f5] transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-800"
                : "bg-red-950/90 text-red-100 border-red-800"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckmarkCircleIcon size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircleIcon size={18} className="text-red-400 shrink-0" />
            )}
            <span className="text-xs font-mono font-medium">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Status */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-[1680px] px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="text-black dark:text-white font-semibold">{t("breadcrumb")}</span>
            <span>{"//"}</span>
            <span className="uppercase tracking-wider">{t("systemBadge")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              AUTH SERVICE ONLINE
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1680px] px-6 sm:px-10 py-8 lg:py-12 space-y-8">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              <ShieldCheckIcon size={12} className="text-emerald-500" />
              <span>Multi-Tenant Zero-Trust Identity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white font-sans">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Current Session Indicator */}
          {currentSession && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm">
                {currentSession.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[160px]">
                    {currentSession.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    {currentSession.tenantRole}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                  {currentSession.email || currentSession.tenantId.slice(0, 18) + "..."}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title={t("profile.signOut")}
                className="p-2 ml-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogoutIcon size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-200/60 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 w-fit max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveTab("demo")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "demo"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <span>{t("tabs.demo")}</span>
          </button>
          <button
            onClick={() => setActiveTab("login")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "login"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <span>{t("tabs.login")}</span>
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "register"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <span>{t("tabs.register")}</span>
          </button>
        </div>

        {/* TAB 1: INSTANT DEMO ACCESS */}
        {activeTab === "demo" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                <SparklesIcon size={14} className="text-amber-500" />
                <span>{t("demo.title")}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                {t("demo.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Shipper Preset */}
              {(() => {
                const preset = DEMO_PRESETS.shipper;
                const isCurrent = currentSession?.tenantRole === "shipper";
                const isLoading = loadingRole === "shipper";

                return (
                  <div
                    key="shipper"
                    className={`relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition-all duration-200 ${
                      isCurrent
                        ? "border-neutral-950 dark:border-white shadow-md ring-2 ring-neutral-900/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-[10px] font-bold uppercase tracking-widest shadow-xs">
                        {t("demo.activeIdentity")}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <PackageIcon size={24} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
                          {preset.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                          {preset.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                          {preset.email}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between text-neutral-500">
                          <span>Corridor Hub:</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
                            {preset.region}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-500">
                          <span>Role:</span>
                          <span className="font-semibold uppercase text-amber-600 dark:text-amber-400">
                            SHIPPER
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleDemoLogin("shipper")}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            : "bg-neutral-950 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-xs active:scale-[0.98]"
                        }`}
                      >
                        {isLoading ? (
                          <span>Authenticating...</span>
                        ) : (
                          <>
                            <span>{isCurrent ? t("demo.switchAction") : `${t("demo.quickLogin")} Shipper`}</span>
                            <ArrowRightIcon size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Carrier Preset */}
              {(() => {
                const preset = DEMO_PRESETS.carrier;
                const isCurrent = currentSession?.tenantRole === "carrier";
                const isLoading = loadingRole === "carrier";

                return (
                  <div
                    key="carrier"
                    className={`relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition-all duration-200 ${
                      isCurrent
                        ? "border-neutral-950 dark:border-white shadow-md ring-2 ring-neutral-900/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-[10px] font-bold uppercase tracking-widest shadow-xs">
                        {t("demo.activeIdentity")}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <TruckIcon size={24} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
                          {preset.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                          {preset.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                          {preset.email}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between text-neutral-500">
                          <span>Corridor Hub:</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
                            {preset.region}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-500">
                          <span>Role:</span>
                          <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">
                            CARRIER
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleDemoLogin("carrier")}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            : "bg-neutral-950 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-xs active:scale-[0.98]"
                        }`}
                      >
                        {isLoading ? (
                          <span>Authenticating...</span>
                        ) : (
                          <>
                            <span>{isCurrent ? t("demo.switchAction") : `${t("demo.quickLogin")} Carrier`}</span>
                            <ArrowRightIcon size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Admin Preset */}
              {(() => {
                const preset = DEMO_PRESETS.admin;
                const isCurrent = currentSession?.tenantRole === "admin";
                const isLoading = loadingRole === "admin";

                return (
                  <div
                    key="admin"
                    className={`relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition-all duration-200 ${
                      isCurrent
                        ? "border-neutral-950 dark:border-white shadow-md ring-2 ring-neutral-900/10 dark:ring-white/10"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-[10px] font-bold uppercase tracking-widest shadow-xs">
                        {t("demo.activeIdentity")}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <CpuIcon size={24} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
                          {preset.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                          {preset.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                          {preset.email}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between text-neutral-500">
                          <span>Corridor Hub:</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
                            {preset.region}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-500">
                          <span>Role:</span>
                          <span className="font-semibold uppercase text-purple-600 dark:text-purple-400">
                            COMMAND ADMIN
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleDemoLogin("admin")}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            : "bg-neutral-950 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-xs active:scale-[0.98]"
                        }`}
                      >
                        {isLoading ? (
                          <span>Authenticating...</span>
                        ) : (
                          <>
                            <span>{isCurrent ? t("demo.switchAction") : `${t("demo.quickLogin")} Admin`}</span>
                            <ArrowRightIcon size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: CREDENTIALS SIGN IN */}
        {activeTab === "login" && (
          <div className="max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-sans">
                  {t("tabs.login")}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter your assigned credentials, registered email, or tenant identifier.
                </p>
              </div>

              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                {/* Identifier */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.identifierLabel")}
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      required
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      placeholder={t("form.identifierPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-950 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.passwordLabel")}
                  </label>
                  <div className="relative">
                    <LockIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder={t("form.passwordPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-950 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.roleLabel")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["shipper", "carrier", "admin"] as TenantRole[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setLoginForm({ ...loginForm, role: r })}
                        className={`py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                          loginForm.role === r
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-2xs"
                            : "bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-neutral-950 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold font-mono uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isSubmitting ? <span>{t("form.signingIn")}</span> : <span>{t("form.signInButton")}</span>}
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER TENANT */}
        {activeTab === "register" && (
          <div className="max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-sans">
                  {t("tabs.register")}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Provision a new authenticated tenant partition in the North-East logistics network.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Organization Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.orgNameLabel")}
                  </label>
                  <div className="relative">
                    <BuildingIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder={t("form.orgNamePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-950 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.emailLabel")}
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder={t("form.emailPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-950 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.roleLabel")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["shipper", "carrier", "admin"] as TenantRole[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRegisterForm({ ...registerForm, role: r })}
                        className={`py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                          registerForm.role === r
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-2xs"
                            : "bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operating Region Hub */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                    {t("form.regionLabel")}
                  </label>
                  <select
                    value={registerForm.region}
                    onChange={(e) => setRegisterForm({ ...registerForm, region: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 text-xs font-mono text-neutral-900 dark:text-white focus:outline-hidden focus:border-neutral-950 dark:focus:border-white transition-colors"
                  >
                    <option value="Guwahati Multimodal Logistics Park (MMLP)">Guwahati Multimodal Logistics Park (MMLP)</option>
                    <option value="Dibrugarh Multi-Modal Rail/River Depot">Dibrugarh Multi-Modal Rail/River Depot</option>
                    <option value="Silchar Barak Valley Transit Hub">Silchar Barak Valley Transit Hub</option>
                    <option value="Jorhat Upper Assam Aggregation Point">Jorhat Upper Assam Aggregation Point</option>
                    <option value="HQ Dispur Central Operations Command">HQ Dispur Central Operations Command</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-neutral-950 text-white hover:bg-black dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold font-mono uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isSubmitting ? <span>{t("form.registering")}</span> : <span>{t("form.registerButton")}</span>}
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Security & System Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            <ShieldCheckIcon size={18} className="text-emerald-500 shrink-0" />
            <div>
              <div className="font-semibold text-neutral-950 dark:text-white">JWT HS-256 Tokens</div>
              <div className="text-[11px] text-neutral-500">Cryptographically signed state</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            <CpuIcon size={18} className="text-purple-500 shrink-0" />
            <div>
              <div className="font-semibold text-neutral-950 dark:text-white">Row-Level Tenant Isolation</div>
              <div className="text-[11px] text-neutral-500">FastAPI dependency guard rails</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-600 dark:text-neutral-400">
            <CreditCardIcon size={18} className="text-blue-500 shrink-0" />
            <div>
              <div className="font-semibold text-neutral-950 dark:text-white">Instant Settlement Link</div>
              <div className="text-[11px] text-neutral-500">Zero-fee ledger synchronization</div>
            </div>
          </div>
        </div>

        {/* Quick Module Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
            Jump to Platform Modules:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${locale}/payments`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors"
            >
              <CreditCardIcon size={12} />
              <span>Payments & Invoices</span>
            </Link>
            <Link
              href={`/${locale}/map`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors"
            >
              <RouteIcon size={12} />
              <span>Digital Map Twin</span>
            </Link>
            <Link
              href={`/${locale}/ai-intelligence`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors"
            >
              <CpuIcon size={12} />
              <span>AI Intelligence</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
