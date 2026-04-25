function actionClass(action) {
  if (action === 'pause') return 'bg-red-100 text-red-700'
  if (action === 'increase_budget') return 'bg-green-100 text-green-700'
  if (action === 'test_new_copy' || action === 'test') return 'bg-blue-100 text-blue-700'
  if (action === 'restructure') return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-700'
}

export default function StrategyResults({ strategy }) {
  if (!strategy) return null

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Strategy Recommendations</h2>
        <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">{strategy.summary}</p>

        <div className="mt-6 grid gap-4">
          {strategy.recommendations.map((item) => (
            <article key={`${item.priority}-${item.target}`} className="rounded-lg border border-gray-100 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
                  {item.priority}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionClass(item.action)}`}>
                  {item.action}
                </span>
                <h3 className="text-base font-semibold text-gray-900">{item.target}</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">{item.reasoning}</p>
              <p className="mt-3 text-sm font-medium text-gray-900">Expected impact: {item.expected_impact}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
