"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function QRScanner({ open, onClose, onDetected }) {
  const webcamRef = useRef(null);

  useEffect(() => {
    if (!open) return;

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

        if (qr?.data) {
          let code = qr.data.trim().toUpperCase();

          if (code.startsWith("SIGNAGE://PAIR/"))
            code = code.replace("SIGNAGE://PAIR/", "");

          if (code.includes("/pair/"))
            code = code.split("/pair/")[1];

          if (code.length === 4) {
            onDetected(code);
          }
        }
      };
    }, 350);

    return () => clearInterval(interval);
  }, [open, onDetected]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">
            Scansiona QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0 flex flex-col gap-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={{ facingMode: "environment" }}
            className="rounded-xl border shadow-sm"
          />

          <Button variant="outline" onClick={onClose} className="w-full">
            Chiudi scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
