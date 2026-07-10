"use client";

import { useState, useMemo, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Circle, ArrowLeft } from "lucide-react";

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "Este email ya está registrado con otro método. Usa tu contraseña.",
  OAuthCallbackError: "Error al conectar con Google. Intenta de nuevo.",
  OAuthSignin: "No se pudo iniciar sesión con Google. Intenta de nuevo.",
  Callback: "Error en el proceso de autenticación. Intenta de nuevo.",
  AccessDenied: "Acceso denegado.",
  Default: "Error al iniciar sesión. Intenta de nuevo.",
};

type Mode = "login" | "register";

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-[11px] transition-colors ${ok ? "text-emerald-500" : "text-gray-400"}`}>
      {ok ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Circle className="w-3 h-3 shrink-0" />}
      {label}
    </span>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");

  const [showPwd, setShowPwd] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const authError = searchParams.get("error");

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const pwdRules = useMemo(() => ({
    length: regPassword.length >= 8,
    upper: /[A-Z]/.test(regPassword),
    sign: /[^A-Za-z0-9]/.test(regPassword),
  }), [regPassword]);

  const pwdValid = pwdRules.length && pwdRules.upper && pwdRules.sign;

  function goTo(m: Mode) {
    setMode(m);
    setLoginError(null);
    setRegError(null);
    setRegSuccess(false);
    setShowPwd(false);
  }

  function handleGoogle() {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoginLoading(false);
    if (result?.error) { setLoginError("Credenciales incorrectas. Verifica tu email y contraseña."); return; }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdValid) { setRegError("La contraseña no cumple los requisitos."); return; }
    setRegError(null);
    setRegLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
    });
    const data = await res.json();
    setRegLoading(false);
    if (!res.ok) { setRegError(data.error ?? "Error al crear la cuenta."); return; }
    // Switch to login tab with email pre-filled
    setEmail(regEmail);
    setRegSuccess(true);
    setMode("login");
    setLoginError(null);
    setRegError(null);
    setShowPwd(false);
  }

  const isLoading = loginLoading || regLoading || googleLoading;

  return (
    <div className="min-h-screen flex">

      {/* ── Left ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-200 via-sky-100 to-cyan-200 px-8 py-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-cyan-300/40 rounded-full blur-3xl pointer-events-none" />

        {/* Back link — desktop only (absolute) */}
        <Link href="/" className="hidden sm:flex absolute top-5 left-5 items-center gap-1.5 text-xs font-semibold text-blue-700/70 hover:text-blue-800 transition-colors bg-white/50 hover:bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al inicio
        </Link>

        <div className={`relative w-full bg-white rounded-3xl shadow-[0_25px_80px_rgba(59,130,246,0.55),0_8px_24px_rgba(59,130,246,0.30)] border border-blue-100 transition-all duration-300 ${mode === "register" ? "max-w-sm p-8" : "max-w-md p-10"}`}>

          {/* Back link — mobile only (inside card) */}
          <Link href="/" className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-7">
            <Image src="/medicare.png" alt="MediCare AI" width={40} height={40} className="rounded-xl" />
            <span className="font-bold text-gray-800 text-xl tracking-tight">
              Medicare<span className="text-blue-500">AI</span>
            </span>
          </div>

          {/* Segmented selector */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
            {(["login", "register"] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => goTo(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === m ? "bg-white text-blue-600 shadow-sm shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}>
                {m === "login" ? "Iniciar sesión" : "Registrarme"}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {authError && !loginError && !regError && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {AUTH_ERRORS[authError] ?? `Error: ${authError}`}
            </div>
          )}
          {(loginError || regError) && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loginError ?? regError}
            </div>
          )}
          {regSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm mb-5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Cuenta creada.{" "}
              <button className="underline font-semibold" onClick={() => goTo("login")}>Inicia sesión</button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h1>
                <p className="text-gray-400 text-sm">Ingresa a tu cuenta para continuar</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Correo electrónico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required
                    className="w-full border-b border-gray-200 pb-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-blue-500 bg-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Contraseña</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full border-b border-gray-200 pb-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-blue-500 bg-transparent transition-colors pr-8" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-0 bottom-2.5 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
                </button>
              </form>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 border-t border-gray-100" />
                <span className="text-xs text-gray-300 font-medium">o continúa con</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <button type="button" onClick={handleGoogle} disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Continuar con Google
              </button>
            </>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
                <p className="text-gray-400 text-sm">Regístrate para gestionar tus citas</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Nombre completo</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Juan Pérez" required
                    className="w-full border-b border-gray-200 pb-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-blue-500 bg-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Correo electrónico</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@email.com" required
                    className="w-full border-b border-gray-200 pb-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-blue-500 bg-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 tracking-widest uppercase">Contraseña</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full border-b border-gray-200 pb-2.5 text-gray-800 placeholder-gray-300 text-sm focus:outline-none focus:border-blue-500 bg-transparent transition-colors pr-8" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-0 bottom-2.5 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regPassword.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                      <PasswordRule ok={pwdRules.length} label="8 caracteres" />
                      <PasswordRule ok={pwdRules.upper} label="Una mayúscula" />
                      <PasswordRule ok={pwdRules.sign} label="Un signo especial" />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 !mt-5">
                  {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
                </button>
              </form>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 border-t border-gray-100" />
                <span className="text-xs text-gray-300 font-medium">o</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <button type="button" onClick={handleGoogle} disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Continuar con Google
              </button>
            </>
          )}

        </div>
      </div>

      {/* ── Right — photo ── */}
      <div className="hidden lg:block w-[55%] relative">
        <Image
          src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1400&q=85"
          alt="Clínica moderna"
          fill
          className="object-cover"
          priority
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-900/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="text-white text-sm leading-relaxed mb-4">
              "Desde que implementamos MediCare AI redujimos un 40% el tiempo administrativo y mejoramos la satisfacción de nuestros pacientes."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shrink-0">AM</div>
              <div>
                <p className="text-white font-semibold text-sm">Dra. Ana Martínez</p>
                <p className="text-blue-200 text-xs">Directora · Hospital Metropolitano</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
