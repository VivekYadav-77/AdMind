import { Beaker, Sparkles } from 'lucide-react'

export default function CopyResults({ copy }) {
  if (!copy) return null

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Beaker size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">A/B Test Frameworks</h2>
            <p className="text-sm text-gray-500">Structured creative tests for underperforming keywords</p>
          </div>
        </div>
        <p className="mt-4 rounded-lg bg-purple-50 p-4 text-sm leading-6 text-gray-700">{copy.summary}</p>

        <div className="mt-6 grid gap-6">
          {copy.variants.map((variant) => (
            <article
              key={`${variant.keyword}-ab`}
              className="rounded-lg border border-gray-100 p-5"
            >
              {/* Keyword header */}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900">
                  {variant.keyword}
                </span>
                <span className="text-sm text-gray-500">{variant.campaign_name}</span>
              </div>

              {/* Side-by-side A/B tests */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Test A */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-blue-700">
                      Test A
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {variant.test_a?.label || 'Variation A'}
                    </span>
                  </div>
                  <p className="mb-3 text-xs italic text-gray-600">
                    {variant.test_a?.angle || ''}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {variant.test_a?.headline || ''}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {variant.test_a?.description || ''}
                  </p>
                </div>

                {/* Test B */}
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase text-amber-700">
                      Test B
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {variant.test_b?.label || 'Variation B'}
                    </span>
                  </div>
                  <p className="mb-3 text-xs italic text-gray-600">
                    {variant.test_b?.angle || ''}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {variant.test_b?.headline || ''}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {variant.test_b?.description || ''}
                  </p>
                </div>
              </div>

              {/* Test rationale */}
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-purple-500" aria-hidden="true" />
                <p className="text-sm leading-6 text-gray-700">
                  <span className="font-semibold text-gray-900">Why test this: </span>
                  {variant.test_rationale || variant.improvement_reason || ''}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
