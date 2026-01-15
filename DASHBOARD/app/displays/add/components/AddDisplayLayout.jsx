"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, X } from "lucide-react";

// Import dinamico per evitare errori SSR
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export function AddDisplayLayout({ children, onScanClick, onClose, onCodeDetected }) {
  const [scanMode, setScanMode] = useState(false);

  return (
    <Card className="
      relative w-full max-w-md p-8 rounded-3xl
      bg-white/90 backdrop-blur-xl border border-border/40 shadow-xl
    ">

      {/* CHIUSURA */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="
          absolute top-4 right-4 rounded-full
          text-rose-500 hover:text-rose-700 hover:bg-rose-100
          transition
        "
      >
        <X className="w-5 h-5" />
      </Button>

      {/* HEADER */}
      <div className="flex flex-col items-center text-center mb-6">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Associa un nuovo display
        </h2>

        <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
          Inserisci il pairing code oppure scansiona il QR code per associare rapidamente il tuo display.
        </p>
      </div>

      {/* FORM */}
      <div className="mb-6">{children}</div>

      {/* SCAN BUTTON */}
      {!scanMode && (
        <Button
          onClick={() => setScanMode(true)}
          className="
            w-full h-12 rounded-xl font-black text-xs tracking-widest uppercase
            flex items-center justify-center gap-2 shadow-md
          "
        >
          <QrCode className="w-5 h-5" />
          Scansiona QR Code
        </Button>
      )}

      {/* QR SCANNER OVERLAY */}
      {scanMode && (
        <div className="
          absolute inset-0 z-50 flex flex-col items-center justify-center
          bg-black/60 backdrop-blur-md rounded-3xl p-6
          animate-in fade-in duration-300
        ">
          <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-lg border border-white/10">
            <QrReader
              delay={300}
              onError={() => setScanMode(false)}
              onScan={(data) => {
                if (data) {
                  const extracted = data.trim().slice(0, 4).toUpperCase();
                  onCodeDetected?.(extracted);
                  setScanMode(false);
                }
              }}
              style={{ width: "100%" }}
            />
          </div>

          <Button
            variant="ghost"
            onClick={() => setScanMode(false)}
            className="mt-4 text-white hover:bg-white/10 rounded-xl"
          >
            Annulla
          </Button>
        </div>
      )}
    </Card>
  );
}
