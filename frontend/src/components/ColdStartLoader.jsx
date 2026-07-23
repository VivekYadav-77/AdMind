import { BrainCircuit, ServerCog, Sparkles } from 'lucide-react'

export default function ColdStartLoader({ visible }) {
  if (!visible) return null

  return (
    <section className="py-8">
      <div className="relative overflow-hidden rounded-xl border border-borderwarm card-warm p-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 via-amber-400 to-emerald-400" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-borderwarm" />
            <div className="absolute inset-1 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#252522] text-brand-400">
              <BrainCircuit size={24} aria-hidden="true" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-400">
                <ServerCog size={14} aria-hidden="true" />
                Waking Render backend
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Sparkles size={14} aria-hidden="true" />
                Preparing agents
              </span>
            </div>
            <h2 className="mt-3 text-lg font-serif text-[#FAF4EC]">Starting the analysis engine</h2>
            <p className="mt-2 text-sm leading-6 text-textmuted">
              The backend may take a moment to wake up after being idle. Keep this tab open while AdMind connects and starts streaming results.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
              <div className="h-2 rounded-full bg-brand-500 animate-pulse" />
              <div className="h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:150ms]" />
              <div className="h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
