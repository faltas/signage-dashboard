export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50 px-6">
      <div className="text-center space-y-3">
        <div className="text-4xl font-bold text-slate-300">Display non trovato</div>
        <div className="text-sm text-slate-500">
          Il display richiesto non esiste o è stato rimosso.
        </div>
      </div>
    </div>
  );
}
