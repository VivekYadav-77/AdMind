import { ArrowRight, CheckCircle2, Circle, FileSearch, Lightbulb, PenLine } from 'lucide-react'

const agents = [
  { key: 'auditor', label: 'Audit', icon: FileSearch },
  { key: 'strategist', label: 'Strategy', icon: Lightbulb },
  { key: 'copywriter', label: 'Copy', icon: PenLine }
]

function statusClasses(status) {
  if (status === 'done') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'running') return 'border-blue-200 bg-blue-50 text-blue-700 animate-pulse'
  return 'border-gray-200 bg-white text-gray-500'
}

export default function AgentPipeline({ agentStatus }) {
  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          {agents.map((agent, index) => {
            const Icon = agent.icon
            const status = agentStatus[agent.key]
            const StatusIcon = status === 'done' ? CheckCircle2 : Circle

            return (
              <div className="contents" key={agent.key}>
                <div className={`flex min-h-20 items-center gap-4 rounded-lg border p-4 ${statusClasses(status)}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{agent.label}</p>
                    <p className="text-sm capitalize">{status}</p>
                  </div>
                  <StatusIcon size={20} aria-label={`${agent.label} ${status}`} />
                </div>
                {index < agents.length - 1 && (
                  <div className="hidden justify-center text-gray-300 sm:flex">
                    <ArrowRight size={24} aria-hidden="true" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
