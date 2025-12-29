export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50 px-6">
      <div className="text-center space-y-3">
        <div className="text-4xl font-bold text-slate-300">Playlist non trovata</div>
        <div className="text-sm text-slate-500">
          La playlist richiesta non esiste o è stata eliminata.
        </div>
      </div>
    </div>
  );
}
