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
        className="flex flex-col gap-6 mt-6"
      >
        {/* LABEL + INPUT */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-black text-muted-foreground flex items-center gap-2 tracking-wide">
            <QrCode className="w-4 h-4 text-muted-foreground/70" />
            Inserisci il pairing code
          </label>

          <Input
            maxLength={4}
            placeholder="AB12"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="
              h-16 w-40 text-center text-3xl font-black uppercase tracking-[0.4em]
              bg-muted/20 border-none rounded-2xl shadow-sm
              focus-visible:ring-primary/30 placeholder:text-muted-foreground/20
            "
          />
        </div>

        {/* ERROR */}
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in zoom-in-95 duration-200 rounded-xl"
          >
            <AlertDescription className="font-medium tracking-wide">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* SUCCESS */}
        {success && (
          <Alert className="bg-emerald-50 border-emerald-300 animate-in fade-in zoom-in-95 duration-200 rounded-xl">
            <AlertDescription className="font-medium tracking-wide text-emerald-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* SUBMIT */}
        <Button
          disabled={loading}
          className="
            w-full h-14 rounded-2xl font-black text-xs tracking-widest uppercase
            bg-primary text-primary-foreground shadow-lg shadow-primary/20
            hover:bg-primary/90 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Caricamento..." : "Associa Display"}
        </Button>
      </form>
    </div>
  );
}
