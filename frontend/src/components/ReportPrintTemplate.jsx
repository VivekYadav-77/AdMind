import React, { forwardRef } from 'react';

// Format currency
const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Color helper for severities
const severityColor = (sev) => {
  if (sev === 'high') return 'text-red-700 bg-red-50';
  if (sev === 'medium') return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
};

const ReportPrintTemplate = forwardRef(({ job }, ref) => {
  if (!job) return null;

  const agencyName = localStorage.getItem('agencyName') || 'AdMind';
  const logoUrl = localStorage.getItem('logoUrl');

  const audit = job.audit_data;
  const strategy = job.strategy_data;
  const copy = job.copy_data;

  const inefficientSpend = audit?.inefficient_spend !== undefined ? audit.inefficient_spend : (audit?.wasted_spend || 0);

  return (
    <div 
      ref={ref} 
      className="bg-white text-gray-900 absolute opacity-0 pointer-events-none" 
      style={{ left: '-9999px', top: 0, width: '800px', fontFamily: 'sans-serif', padding: '40px' }}
    >
      {/* 1. Cover Page */}
      <div className="flex flex-col items-center justify-center min-h-[900px] text-center" style={{ pageBreakAfter: 'always' }}>
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-24 object-contain mb-8" crossOrigin="anonymous" />}
        <h1 className="text-4xl font-bold mb-4">{agencyName} Analysis Report</h1>
        
        <div className="mt-16 space-y-2 text-gray-600">
          <p>Report ID: <strong>{job.id}</strong></p>
          <p>Generated: <strong>{new Date(job.created_at).toLocaleString()}</strong></p>
        </div>

        {audit && (
          <div className="mt-16 w-full max-w-2xl mx-auto grid grid-cols-2 gap-6 text-left">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Spend</p>
              <p className="text-2xl font-black">{formatMoney(audit.total_spend)}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Revenue</p>
              <p className="text-2xl font-black text-emerald-600">{formatMoney(audit.total_revenue)}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">ROAS</p>
              <p className="text-2xl font-black text-blue-600">{Number(audit.total_roas || 0).toFixed(2)}x</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-bold text-gray-500 uppercase">Inefficient Spend</p>
              <p className="text-2xl font-black text-red-600">{formatMoney(inefficientSpend)}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Audit Intelligence */}
      {audit && (
        <div style={{ pageBreakAfter: 'always' }}>
          <h2 className="text-3xl font-black mb-6 border-b border-gray-200 pb-2">Audit Intelligence</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="text-xs font-bold uppercase text-blue-800 mb-2">Overview</h3>
              <p className="text-sm text-gray-700">{audit.summary?.overview}</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <h3 className="text-xs font-bold uppercase text-red-800 mb-2">Critical Finding</h3>
              <p className="text-sm text-gray-700">{audit.summary?.critical_finding}</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <h3 className="text-xs font-bold uppercase text-emerald-800 mb-2">Immediate Action</h3>
              <p className="text-sm text-gray-700">{audit.summary?.action_required}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">Underperforming Keywords</h3>
          <table className="w-full mb-8 text-sm text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-2 border-r border-gray-200">Keyword</th>
                <th className="p-2 border-r border-gray-200">Campaign</th>
                <th className="p-2 border-r border-gray-200">Severity</th>
                <th className="p-2 border-r border-gray-200">Issue Type</th>
                <th className="p-2">Impacted Spend</th>
              </tr>
            </thead>
            <tbody>
              {audit.issues?.map((issue, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="p-2 border-r border-gray-200 font-bold">{issue.keyword}</td>
                  <td className="p-2 border-r border-gray-200 text-gray-600">{issue.campaign_name}</td>
                  <td className="p-2 border-r border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${severityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="p-2 border-r border-gray-200 capitalize">{issue.issue_type.replace(/_/g, ' ')}</td>
                  <td className="p-2 font-bold text-red-600">{formatMoney(issue.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {audit.segment_anomalies?.length > 0 && (
            <>
              <h3 className="text-xl font-bold mb-4">Segment Anomalies</h3>
              <table className="w-full text-sm text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-2 border-r border-gray-200">Segment</th>
                    <th className="p-2 border-r border-gray-200">Value</th>
                    <th className="p-2 border-r border-gray-200">Keyword</th>
                    <th className="p-2 border-r border-gray-200">Severity</th>
                    <th className="p-2">Impacted Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.segment_anomalies.map((anomaly, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border-r border-gray-200 capitalize">{anomaly.segment_type}</td>
                      <td className="p-2 border-r border-gray-200 font-bold">{anomaly.segment_value}</td>
                      <td className="p-2 border-r border-gray-200">{anomaly.keyword}</td>
                      <td className="p-2 border-r border-gray-200">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${severityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                      </td>
                      <td className="p-2 font-bold text-amber-600">{formatMoney(anomaly.spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* 3. Strategy Recommendations */}
      {strategy && strategy.recommendations && (
        <div style={{ pageBreakAfter: 'always' }}>
          <h2 className="text-3xl font-black mb-6 border-b border-gray-200 pb-2">Strategy Recommendations</h2>
          
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <h3 className="text-xs font-bold uppercase text-indigo-800 mb-2">AI Strategist Summary</h3>
            <p className="text-sm text-gray-800">{strategy.summary}</p>
          </div>

          <div className="space-y-6">
            {['high', 'medium', 'low'].map(priorityLevel => {
              const items = strategy.recommendations.filter(r => String(r.priority).toLowerCase() === priorityLevel || String(r.priority) === (priorityLevel === 'high' ? '1' : priorityLevel === 'medium' ? '2' : '3'));
              if (items.length === 0) return null;
              
              return (
                <div key={priorityLevel} className="mb-6">
                  <h3 className="text-xl font-bold uppercase mb-4 text-gray-800">{priorityLevel} Priority</h3>
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-bold uppercase tracking-wider">
                            {item.action.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold text-lg">{item.target}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>Reasoning:</strong> {item.reasoning}</p>
                        <p className="text-sm text-indigo-700 font-bold"><strong>Expected Impact:</strong> {item.expected_impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. A/B Copy Frameworks */}
      {copy && copy.variants && (
        <div>
          <h2 className="text-3xl font-black mb-6 border-b border-gray-200 pb-2">A/B Copy Frameworks</h2>
          
          <div className="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <h3 className="text-xs font-bold uppercase text-purple-800 mb-2">Copywriter Summary</h3>
            <p className="text-sm text-gray-800">{copy.summary}</p>
          </div>

          <div className="space-y-8">
            {copy.variants.map((variant, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200">
                  <h3 className="font-bold text-lg">{variant.keyword}</h3>
                  <p className="text-sm text-gray-500">Campaign: {variant.campaign_name}</p>
                </div>
                
                <div className="p-4 bg-white border-b border-gray-200">
                  <p className="text-sm"><strong>Strategic Rationale:</strong> {variant.test_rationale || variant.improvement_reason}</p>
                </div>
                
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  <div className="p-4">
                    <h4 className="font-bold text-blue-700 mb-2">Test A</h4>
                    <p className="text-sm mb-2"><strong>Headline:</strong><br/>{variant.test_a?.headline}</p>
                    <p className="text-sm text-gray-600"><strong>Description:</strong><br/>{variant.test_a?.description}</p>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-amber-700 mb-2">Test B</h4>
                    <p className="text-sm mb-2"><strong>Headline:</strong><br/>{variant.test_b?.headline}</p>
                    <p className="text-sm text-gray-600"><strong>Description:</strong><br/>{variant.test_b?.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ReportPrintTemplate.displayName = 'ReportPrintTemplate';
export default ReportPrintTemplate;
