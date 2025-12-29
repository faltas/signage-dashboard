"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft } from "react-icons/fa";

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

    if (error) return setError(error.message);

    router.push("/display");
  }

  async function loginWith(provider) {
    await supabase.auth.signInWithOAuth({ provider });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-xl">
        
        <h1 className="text-2xl font-bold mb-6 text-center">
          Benvenuto in Signage Cloud
        </h1>

        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition">
            Accedi
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Oppure continua con
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => loginWith("google")}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            <FcGoogle size={22} />
            Google
          </button>

          <button
            onClick={() => loginWith("apple")}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            <FaApple size={22} />
            Apple
          </button>

          <button
            onClick={() => loginWith("azure")}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            <FaMicrosoft size={22} />
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
