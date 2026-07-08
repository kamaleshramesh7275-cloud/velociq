export default function StatusBar() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          BLE Connected
        </div>
        <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
          WiFi Sync: last synced 2 min ago
        </div>
        <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          30 trips stored offline (SPIFFS)
        </div>
      </div>
    </div>
  );
}
