"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, X } from "lucide-react";

export function AddDisplayLayout({ children, onScanClick, onClose }) {
  return (
    <Card className="relative w-full max-w-lg p-8 shadow-xl border border-slate-200 bg-white/95 backdrop-blur-xl rounded-2xl">

      {/* X CHIUSURA */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="
          absolute top-4 right-4
          text-red-500 hover:text-red-700
          hover:bg-red-100
          rounded-full transition
        "
      >
        <X className="w-5 h-5" />
      </Button>

      {/* HEADER */}
      <div className="flex flex-col items-center text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Associa un nuovo display
        </h2>

        <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
          Inserisci il pairing code oppure utilizza la scansione del QR code per associare rapidamente il tuo display.
        </p>
      </div>

      {/* FORM */}
      <div className="mb-6">
        {children}
      </div>

      {/* PULSANTE SCANSIONE QR */}
      <Button
        onClick={onScanClick}
        className="
          w-full h-11 text-base font-medium shadow-md
          flex items-center justify-center gap-2
        "
      >
        <QrCode className="w-5 h-5" />
        Scansiona QR Code
      </Button>
    </Card>
  );
}

