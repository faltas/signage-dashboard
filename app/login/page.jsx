"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  }

  async function loginWith(provider) {
    await supabase.auth.signInWithOAuth({ provider });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm border border-slate-800">
        <h1 className="text-xl font-semibold mb-4">Accedi</h1>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium">
            Accedi
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          Oppure accedi con
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => loginWith("google")}
            className="flex-1 bg-slate-800 py-2 rounded-lg border border-slate-700"
          >
            Google
          </button>

          <button
            onClick={() => loginWith("azure")}
            className="flex-1 bg-slate-800 py-2 rounded-lg border border-slate-700"
          >
            Microsoft
          </button>

          <button
            onClick={() => loginWith("apple")}
            className="flex-1 bg-slate-800 py-2 rounded-lg border border-slate-700"
          >
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}
