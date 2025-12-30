"use client";

import { useState } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/displays");
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: fullName } },
    });

    setLoading(false);
    if (error) return setError(error.message);
    setMessage("Controlla la tua email per confermare l'account.");
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) return setError(error.message);
    setMessage("Email inviata! Controlla la tua casella di posta.");
  }

  async function loginWith(provider) {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-img.jpg')" }}
      />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 shadow-xl">

        <h1 className="text-xl md:text-2xl font-bold mb-6 text-center text-slate-900">
          {mode === "login" && "Accedi a Signage Cloud"}
          {mode === "signup" && "Crea un nuovo account"}
          {mode === "reset" && "Recupera la password"}
        </h1>

        {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}
        {message && <div className="text-green-600 text-sm mb-4 text-center">{message}</div>}

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "signup"
              ? handleSignup
              : handleResetPassword
          }
          className="flex flex-col gap-4"
        >
          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Nome"
                className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-300 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Cognome"
                className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-300 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-300 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {mode !== "reset" && (
            <div className="flex flex-col">
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-300 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs text-slate-600 hover:text-slate-900 mt-2 text-left"
                >
                  Password dimenticata?
                </button>
              )}
            </div>
          )}

          <button
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 py-3 rounded-xl font-semibold text-white shadow-md shadow-indigo-200/50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {mode === "login" && "Accedi"}
                {mode === "signup" && "Crea account"}
                {mode === "reset" && "Invia email di reset"}
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 mt-4">
          {mode === "login" && (
            <button onClick={() => setMode("signup")} className="underline">
              Crea un nuovo account
            </button>
          )}

          {mode === "signup" && (
            <button onClick={() => setMode("login")} className="underline">
              Hai già un account? Accedi
            </button>
          )}

          {mode === "reset" && (
            <button onClick={() => setMode("login")} className="underline">
              Torna al login
            </button>
          )}
        </div>

        {mode === "login" && (
          <>
            <div className="mt-6 text-center text-sm text-slate-500">
              Oppure continua con
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => loginWith("google")}
                className="flex-1 flex items-center justify-center gap-2 bg-white py-3 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition"
              >
                <FcGoogle size={22} />
                Google
              </button>

              <button
                onClick={() => loginWith("apple")}
                className="flex-1 flex items-center justify-center gap-2 bg-white py-3 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition"
              >
                <FaApple size={22} />
                Apple
              </button>

              <button
                onClick={() => loginWith("azure")}
                className="flex-1 flex items-center justify-center gap-2 bg-white py-3 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-100 transition"
              >
                <FaMicrosoft size={22} />
                Microsoft
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
