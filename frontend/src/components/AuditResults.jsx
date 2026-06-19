import { AlertTriangle, Monitor, MapPin, Users } from 'lucide-react'

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-100 text-red-700'
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-700'
}

function segmentIcon(segmentType) {
  if (segmentType === 'device') return Monitor
  if (segmentType === 'location') return MapPin
  if (segmentType === 'age_group') return Users
  return AlertTriangle
}

function segmentLabel(segmentType) {
  if (segmentType === 'device') return 'Device'
  if (segmentType === 'location') return 'Location'
  if (segmentType === 'age_group') return 'Age Group'
  return 'Segment'
}

export default function AuditResults({ audit }) {
  if (!audit) return null

  const stats = [
    ['Total Spend', money(audit.total_spend)],
    ['Total Revenue', money(audit.total_revenue)],
    ['ROAS', `${Number(audit.total_roas || 0).toFixed(2)}x`],
    ['Wasted Spend', money(audit.wasted_spend)]
  ]

  const anomalies = audit.segment_anomalies || []

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

        {/* Segment Anomalies Section */}
        {anomalies.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-900">Segment Anomalies Detected</h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                {anomalies.length} found
              </span>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              These hidden performance gaps were found by comparing device, location, and age segments within your campaigns.
            </p>

            <div className="grid gap-3">
              {anomalies.map((anomaly, index) => {
                const Icon = segmentIcon(anomaly.segment_type)
                return (
                  <div
                    key={`anomaly-${index}`}
                    className="flex items-start gap-4 rounded-lg border border-amber-100 bg-amber-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{anomaly.keyword}</span>
                        <span className="text-xs text-gray-500">in {anomaly.campaign_name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityClass(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                          {segmentLabel(anomaly.segment_type)}: {anomaly.segment_value}
                        </span>
                        <span className="text-xs text-gray-500">Segment spend: {money(anomaly.spend)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-700">{anomaly.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
