"use client";

export function TopBar({ title, subtitle, onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          ☰
        </button>

        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
