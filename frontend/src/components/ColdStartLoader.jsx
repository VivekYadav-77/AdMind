import { BrainCircuit, ServerCog, Sparkles } from 'lucide-react'

export default function ColdStartLoader({ visible }) {
  if (!visible) return null

  return (
    <section className="py-8">
      <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-1 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-white">
              <BrainCircuit size={24} aria-hidden="true" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ServerCog size={14} aria-hidden="true" />
                Waking Render backend
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <Sparkles size={14} aria-hidden="true" />
                Preparing agents
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">Starting the analysis engine</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              The backend may take a moment to wake up after being idle. Keep this tab open while AdMind connects and starts streaming results.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
              <div className="h-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:150ms]" />
              <div className="h-2 rounded-full bg-green-400 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
