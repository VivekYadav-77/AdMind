import { BrainCircuit } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white">
          <BrainCircuit size={22} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-brand-900">AdMind</h1>
          <p className="text-sm text-gray-500">Multi-Agent Ad Campaign Optimizer</p>
        </div>
      </div>
    </header>
  )
}
