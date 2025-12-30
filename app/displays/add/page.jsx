"use client";

import { useState, useRef, useEffect } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AddDisplayPage() {
  const supabase = useSupabase();
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

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setError("Utente non autenticato.");
        return;
      }

      const normalizedCode = pairingCode.trim().toUpperCase();

      const { data, error } = await supabase
        .from("displays")
        .update({
          user_id: user.id,
          status: "on",
        })
        .eq("pairing_code", normalizedCode)
        .is("user_id", null)
        .select();

      if (error) {
        setError("Errore durante l'associazione del display.");
        return;
      }

      if (!data || data.length === 0) {
        setError("Codice non valido o display già associato.");
        return;
      }

      setSuccess("Display associato con successo!");
      setTimeout(() => router.push("/displays"), 1200);
    } catch (err) {
      setError("Errore inatteso durante l'associazione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div
        className="
          flex min-h-screen
          bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))]
          text-slate-900 backdrop-blur-2xl
        "
      >
        <Sidebar />
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col">
          <TopBar
            title="Aggiungi Display"
            subtitle="Associa un nuovo display tramite pairing code o QR"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-10 flex justify-center">
            <div
              className="
                w-full max-w-md bg-white/90 border border-slate-200
                rounded-2xl p-8 shadow-lg
                hover:shadow-xl hover:shadow-slate-200/60 transition
              "
            >
              <div className="flex flex-col items-center mb-6">
                <img
                  src="/icons/display.png"
                  className="w-14 h-14 opacity-90 mb-3"
                />
                <h2 className="text-2xl font-bold text-slate-900 text-center">
                  Associa un nuovo display
                </h2>
                <p className="text-sm text-slate-500 text-center mt-1">
                  Inserisci il pairing code o scansiona il QR
                </p>
              </div>

              {/* QR SCAN */}
              <div className="flex flex-col items-center mb-6">
                {!scanning ? (
                  <button
                    onClick={() => setScanning(true)}
                    className="
                      px-4 py-2 rounded-xl text-sm font-semibold
                      bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                      hover:bg-indigo-600 transition
                    "
                  >
                    📷 Scansiona QR Code
                  </button>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="rounded-xl overflow-hidden border border-slate-300 shadow-md">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/png"
                        videoConstraints={{ facingMode: "environment" }}
                        className="w-full"
                      />
                    </div>

                    <button
                      onClick={() => setScanning(false)}
                      className="
                        mt-3 px-4 py-2 rounded-xl text-sm font-semibold
                        bg-white border border-slate-300 text-slate-700
                        hover:bg-slate-100 shadow-sm transition w-full
                      "
                    >
                      Chiudi scanner
                    </button>
                  </div>
                )}
              </div>

              {/* FORM MANUALE */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col items-center">
                  <label className="text-sm font-semibold text-slate-700 mb-1">
                    Inserisci il pairing code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="AB12"
                    className="
                      px-4 py-3 rounded-xl bg-white border border-slate-300
                      focus:ring-2 focus:ring-indigo-300 outline-none
                      text-center text-xl font-bold tracking-widest uppercase
                      shadow-sm
                    "
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-green-600 text-sm text-center font-medium">
                    {success}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="
                    px-4 py-3 rounded-xl text-sm font-semibold
                    bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                    hover:bg-indigo-600 transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
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
    </ProtectedRoute>
  );
}
