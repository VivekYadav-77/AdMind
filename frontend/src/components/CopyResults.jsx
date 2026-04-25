export default function CopyResults({ copy }) {
  if (!copy) return null

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Copy Improvements</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">{copy.summary}</p>

        <div className="mt-6 grid gap-5">
          {copy.variants.map((variant) => (
            <article key={`${variant.keyword}-${variant.new_headline}`} className="rounded-lg border border-gray-100 p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900">
                  {variant.keyword}
                </span>
                <span className="text-sm text-gray-500">{variant.campaign_name}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase text-red-700">Before</p>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{variant.original_headline}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{variant.original_description}</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase text-green-700">After</p>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{variant.new_headline}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{variant.new_description}</p>
                </div>
              </div>

              <p className="mt-4 text-sm italic leading-6 text-gray-600">{variant.improvement_reason}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
