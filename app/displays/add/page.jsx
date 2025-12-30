"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import Webcam from "react-webcam";
import jsQR from "jsqr";

export default function AddDisplayPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [pairingCode, setPairingCode] = useState("");
  const [scanning, setScanning] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const webcamRef = useRef(null);

  // -----------------------------
  // SCAN QR LOOP
  // -----------------------------
  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      const webcam = webcamRef.current;
      if (!webcam) return;

      const screenshot = webcam.getScreenshot();
      if (!screenshot) return;

      const img = new Image();
      img.src = screenshot;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, canvas.width, canvas.height);

        if (qr && qr.data) {
          let code = qr.data.trim().toUpperCase();

          // Formati accettati:
          // signage://pair/AB12
          // https://domain.com/pair/AB12
          // AB12

          if (code.startsWith("SIGNAGE://PAIR/")) {
            code = code.replace("SIGNAGE://PAIR/", "");
          }

          if (code.includes("/pair/")) {
            code = code.split("/pair/")[1];
          }

          if (code.length === 4) {
            setPairingCode(code);
            setScanning(false);
          }
        }
      };
    }, 500);

    return () => clearInterval(interval);
  }, [scanning]);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("displays")
      .update({ user_id: user.id })
      .eq("pairing_code", pairingCode.toUpperCase())
      .select();

    setLoading(false);

    if (error || !data || data.length === 0) {
      setError("Codice non valido o display già associato.");
      return;
    }

    setSuccess("Display associato con successo!");
    setTimeout(() => router.push("/displays"), 1200);
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Aggiungi Display"
          subtitle="Associa un nuovo display tramite pairing code o QR"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-10 flex justify-center">
          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">

            <h2 className="text-xl font-semibold mb-4 text-center">
              Associa un nuovo display
            </h2>

            {/* QR SCAN */}
            <div className="flex flex-col items-center mb-6">
              {!scanning ? (
                <button
                  onClick={() => setScanning(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium cursor-pointer"
                >
                  📷 Scansiona QR Code
                </button>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={{ facingMode: "environment" }}
                    className="rounded-lg overflow-hidden"
                  />

                  <button
                    onClick={() => setScanning(false)}
                    className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm cursor-pointer w-full"
                  >
                    Chiudi scanner
                  </button>
                </div>
              )}
            </div>

            {/* FORM MANUALE */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={4}
                placeholder="AB12"
                className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700 
                           focus:border-blue-500 outline-none text-center text-lg tracking-widest uppercase"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
              />

              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}

              {success && (
                <div className="text-green-400 text-sm text-center">{success}</div>
              )}

              <button
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Associa Display"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
