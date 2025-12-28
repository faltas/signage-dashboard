"use client";

export function MobileSidebar({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4">
        <button
          onClick={onClose}
          className="text-slate-400 mb-4"
        >
          ✕ Chiudi
        </button>

        {/* Qui puoi riusare il menu della sidebar */}
      </aside>
    </div>
  );
}
