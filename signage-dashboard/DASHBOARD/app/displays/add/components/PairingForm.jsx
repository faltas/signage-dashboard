"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode } from "lucide-react";

export function PairingForm({ onSubmit, loading, error, success }) {
  const [code, setCode] = useState("");

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => onSubmit(e, code)}
        className="flex flex-col gap-6 mt-4"
      >
        {/* LABEL + INPUT */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-600" />
            Inserisci il pairing code
          </label>

          <Input
            maxLength={4}
            placeholder="AB12"
            className="
              text-center text-2xl font-semibold tracking-widest uppercase 
              h-14 border-slate-300 shadow-sm
              focus-visible:ring-2 focus-visible:ring-indigo-300
            "
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in duration-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-100 border-green-300 animate-in fade-in duration-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button
          disabled={loading}
          className="
            w-full h-12 text-base font-medium shadow-md
            bg-indigo-600 hover:bg-indigo-700 text-white
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Caricamento..." : "Associa Display"}
        </Button>
      </form>
    </div>
  );
}
