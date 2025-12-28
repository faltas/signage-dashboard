export function TopBar({ title, subtitle }) {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400">
          Admin
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
      </div>
		<button className="md:hidden p-2 rounded-lg bg-slate-800">
		☰
		</button>

    </header>
  );
}
