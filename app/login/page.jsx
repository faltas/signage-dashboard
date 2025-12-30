"use client";

import { useState } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useSupabase();
  // login | signup | reset
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Campi aggiuntivi per la registrazione
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Loader
  const [loading, setLoading] = useState(false);

  // LOGIN
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return setError(error.message);

    router.push("/displays");
  }

  // SIGNUP
  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) return setError(error.message);

    setMessage("Controlla la tua email per confermare l'account.");
  }

  // RESET PASSWORD
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

  // LOGIN WITH PROVIDER
  async function loginWith(provider) {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-img.jpg')" }}
      />

      {/* Dark overlay + blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">

        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" && "Accedi a Signage Cloud"}
          {mode === "signup" && "Crea un nuovo account"}
          {mode === "reset" && "Recupera la password"}
        </h1>

        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">{error}</div>
        )}

        {message && (
          <div className="text-green-400 text-sm mb-4 text-center">
            {message}
          </div>
        )}

        {/* FORM */}
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
          {/* NOME + COGNOME SOLO IN SIGNUP */}
          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Nome"
                className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700 
                           focus:border-blue-500 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Cognome"
                className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700 
                           focus:border-blue-500 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700 
                       focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          {mode !== "reset" && (
            <div className="flex flex-col">
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700 
                           focus:border-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* PASSWORD DIMENTICATA */}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs text-slate-300 hover:text-white mt-2 text-left cursor-pointer"
                >
                  Password dimenticata?
                </button>
              )}
            </div>
          )}

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2"
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

        {/* SWITCH MODES */}
        <div className="text-center text-xs text-slate-300 mt-4">
          {mode === "login" && (
            <button
              onClick={() => setMode("signup")}
              className="underline cursor-pointer"
            >
              Crea un nuovo account
            </button>
          )}

          {mode === "signup" && (
            <button
              onClick={() => setMode("login")}
              className="underline cursor-pointer"
            >
              Hai già un account? Accedi
            </button>
          )}

          {mode === "reset" && (
            <button
              onClick={() => setMode("login")}
              className="underline cursor-pointer"
            >
              Torna al login
            </button>
          )}
        </div>

        {/* PROVIDERS */}
        {mode === "login" && (
          <>
            <div className="mt-6 text-center text-sm text-slate-400">
              Oppure continua con
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => loginWith("google")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800/70 py-3 rounded-lg 
                           border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              >
                <FcGoogle size={22} />
                Google
              </button>

              <button
                onClick={() => loginWith("apple")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800/70 py-3 rounded-lg 
                           border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              >
                <FaApple size={22} />
                Apple
              </button>

              <button
                onClick={() => loginWith("azure")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800/70 py-3 rounded-lg 
                           border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
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
