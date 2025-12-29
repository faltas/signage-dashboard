"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);

  // 🔐 Se l'utente è già loggato → vai a /displays
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/displays");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  // ⛔ Finché non sappiamo se l’utente è loggato, NON renderizziamo nulla
  if (!ready) return null;

  // login | signup | reset
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // LOGIN
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setError(error.message);

    router.push("/displays");
  }

  // SIGNUP
  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setError(error.message);

    setMessage("Controlla la tua email per confermare l'account.");
  }

  // RESET PASSWORD
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return setError(error.message);

    setMessage("Email inviata! Controlla la tua casella di posta.");
  }

  // LOGIN WITH PROVIDER
  async function loginWith(provider) {
    await supabase.auth.signInWithOAuth({ provider });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-xl">
        
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
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 
                       focus:border-blue-500 focus:bg-slate-800 focus:text-white outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          {mode !== "reset" && (
            <div className="flex flex-col">
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 
                           focus:border-blue-500 focus:bg-slate-800 focus:text-white outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* PASSWORD DIMENTICATA */}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs text-slate-400 hover:text-slate-200 mt-2 text-left cursor-pointer"
                >
                  Password dimenticata?
                </button>
              )}
            </div>
          )}

          {/* SUBMIT */}
          <button className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition cursor-pointer">
            {mode === "login" && "Accedi"}
            {mode === "signup" && "Crea account"}
            {mode === "reset" && "Invia email di reset"}
          </button>
        </form>

        {/* SWITCH MODES */}
        <div className="text-center text-xs text-slate-400 mt-4">
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
            <div className="mt-6 text-center text-sm text-slate-500">
              Oppure continua con
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => loginWith("google")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg 
                           border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              >
                <FcGoogle size={22} />
                Google
              </button>

              <button
                onClick={() => loginWith("apple")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg 
                           border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              >
                <FaApple size={22} />
                Apple
              </button>

              <button
                onClick={() => loginWith("azure")}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg 
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
