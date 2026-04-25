function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-100 text-red-700'
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-700'
}

export default function AuditResults({ audit }) {
  if (!audit) return null

  const stats = [
    ['Total Spend', money(audit.total_spend)],
    ['Total Revenue', money(audit.total_revenue)],
    ['ROAS', `${Number(audit.total_roas || 0).toFixed(2)}x`],
    ['Wasted Spend', money(audit.wasted_spend)]
  ]

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Audit Results</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-3">Keyword</th>
                <th className="px-3 py-3">Campaign</th>
                <th className="px-3 py-3">Issue Type</th>
                <th className="px-3 py-3">Severity</th>
                <th className="px-3 py-3">Spend</th>
                <th className="px-3 py-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {audit.issues.map((issue, index) => (
                <tr key={`${issue.keyword}-${index}`} className="align-top">
                  <td className="px-3 py-4 font-medium text-gray-900">{issue.keyword}</td>
                  <td className="px-3 py-4 text-gray-600">{issue.campaign_name}</td>
                  <td className="px-3 py-4 text-gray-600">{issue.issue_type}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClass(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-gray-600">{money(issue.spend)}</td>
                  <td className="max-w-md px-3 py-4 text-gray-600">{issue.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-gray-700">{audit.summary}</p>
      </div>
    </section>
  )
}
