"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useSupabase();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div
        className="
          flex min-h-screen 
          bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))]
          text-slate-900 backdrop-blur-2xl
        "
      >
        {/* SIDEBAR FISSA */}
        <Sidebar />

        {/* MOBILE SIDEBAR */}
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* CONTENUTO */}
        <div className="flex-1 flex flex-col">
          <TopBar
            title="Impostazioni"
            subtitle="Configura il sistema e le preferenze"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-10 space-y-10">

            {/* HEADER */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Impostazioni generali
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Gestisci preferenze, account, API key e configurazioni avanzate.
              </div>
            </div>

            {/* SEZIONE ACCOUNT */}
            <section
              className="
                bg-white/90 border border-slate-200 rounded-2xl p-6
                shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
              "
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Account
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Informazioni sul tuo profilo e gestione dell’account.
              </p>

              <button
                onClick={() => router.push('/settings/account')}
                className="
                  px-4 py-2 rounded-xl text-sm font-semibold
                  bg-white border border-slate-300 text-slate-700
                  hover:bg-slate-100 shadow-sm transition
                "
              >
                Gestisci account
              </button>
            </section>

            {/* SEZIONE API KEY */}
            <section
              className="
                bg-white/90 border border-slate-200 rounded-2xl p-6
                shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
              "
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                API Key
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Genera o rigenera le chiavi API per l’integrazione con servizi esterni.
              </p>

              <button
                onClick={() => router.push('/settings/api')}
                className="
                  px-4 py-2 rounded-xl text-sm font-semibold
                  bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                  hover:bg-indigo-600 transition
                "
              >
                Gestisci API Key
              </button>
            </section>

            {/* SEZIONE SISTEMA */}
            <section
              className="
                bg-white/90 border border-slate-200 rounded-2xl p-6
                shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition
              "
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Sistema
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Configurazioni avanzate del sistema e preferenze globali.
              </p>

              <button
                onClick={() => router.push('/settings/system')}
                className="
                  px-4 py-2 rounded-xl text-sm font-semibold
                  bg-white border border-slate-300 text-slate-700
                  hover:bg-slate-100 shadow-sm transition
                "
              >
                Apri impostazioni di sistema
              </button>
            </section>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
