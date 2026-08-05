import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';

export function useReportExport(job, printRef) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null); // 'pdf' | 'docx'

  const downloadPDF = async () => {
    if (!printRef.current || !job) return;
    
    setIsExporting(true);
    setExportType('pdf');
    
    try {
      const element = printRef.current;
      
      const opt = {
        margin:       10,
        filename:     `admind-report-${job.id}-${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const downloadDOCX = async () => {
    if (!job) return;
    
    setIsExporting(true);
    setExportType('docx');
    
    try {
      const doc = generateWordDocument(job);
      const blob = await Packer.toBlob(doc);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admind-report-${job.id}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX generation failed", error);
      alert("Failed to generate DOCX. Please try again.");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return { downloadPDF, downloadDOCX, isExporting, exportType };
}

// DOCX generation helper
function generateWordDocument(job) {
  // Helper to safely format currency
  const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const sections = [];
  
  const agencyName = localStorage.getItem('agencyName') || 'AdMind';

  // 1. Cover / Meta
  sections.push(
    new Paragraph({
      text: `${agencyName} Analysis Report`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: `Report ID: `, bold: true }),
        new TextRun(`${job.id}`),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date: `, bold: true }),
        new TextRun(`${new Date(job.created_at).toLocaleString()}`),
      ],
    }),
    new Paragraph({ text: "" })
  );

  // 2. Audit Section
  if (job.audit_data) {
    const audit = job.audit_data;
    const inefficientSpend = audit.inefficient_spend !== undefined ? audit.inefficient_spend : (audit.wasted_spend || 0);

    sections.push(
      new Paragraph({ text: "Audit Intelligence", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "" }),
      
      new Paragraph({ children: [new TextRun({ text: "Overview", bold: true })] }),
      new Paragraph({ text: audit.summary?.overview || "No overview available." }),
      new Paragraph({ text: "" }),

      new Paragraph({ children: [new TextRun({ text: "Critical Finding", bold: true })] }),
      new Paragraph({ text: audit.summary?.critical_finding || "None." }),
      new Paragraph({ text: "" }),

      new Paragraph({ children: [new TextRun({ text: "Immediate Action", bold: true })] }),
      new Paragraph({ text: audit.summary?.action_required || "None." }),
      new Paragraph({ text: "" }),

      new Paragraph({ children: [new TextRun({ text: "Key Metrics", bold: true })] }),
      createMetricsTable([
        ["Total Spend", formatMoney(audit.total_spend)],
        ["Total Revenue", formatMoney(audit.total_revenue)],
        ["ROAS", `${Number(audit.total_roas || 0).toFixed(2)}x`],
        ["Inefficient Spend", formatMoney(inefficientSpend)]
      ]),
      new Paragraph({ text: "" }),
    );

    // Issues table
    if (audit.issues && audit.issues.length > 0) {
      sections.push(
        new Paragraph({ children: [new TextRun({ text: "Underperforming Keywords", bold: true })] }),
        createIssuesTable(audit.issues),
        new Paragraph({ text: "" })
      );
    }
    
    // Segment Anomalies
    if (audit.segment_anomalies && audit.segment_anomalies.length > 0) {
      sections.push(
        new Paragraph({ children: [new TextRun({ text: "Segment Anomalies", bold: true })] }),
        createAnomaliesTable(audit.segment_anomalies),
        new Paragraph({ text: "" })
      );
    }
  }

  // 3. Strategy Section
  if (job.strategy_data && job.strategy_data.recommendations) {
    sections.push(
      new Paragraph({ text: "Strategy Recommendations", heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: "AI Strategist Summary", bold: true })] }),
      new Paragraph({ text: job.strategy_data.summary || "" }),
      new Paragraph({ text: "" })
    );

    const grouped = job.strategy_data.recommendations.reduce((acc, item) => {
      const p = String(item.priority).toLowerCase();
      const groupKey = (p === 'high' || p === '1') ? 'High Priority' : (p === 'medium' || p === '2') ? 'Medium Priority' : 'Low Priority';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {});

    for (const [priority, items] of Object.entries(grouped)) {
      sections.push(new Paragraph({ text: priority, heading: HeadingLevel.HEADING_2 }));
      
      items.forEach((item) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[${item.action.replace(/_/g, ' ').toUpperCase()}] `, bold: true }),
              new TextRun({ text: item.target, bold: true }),
            ]
          }),
          new Paragraph({ text: `Reasoning: ${item.reasoning}` }),
          new Paragraph({ text: `Expected Impact: ${item.expected_impact}` }),
          new Paragraph({ text: "" })
        );
      });
    }
  }

  // 4. A/B Copy Section
  if (job.copy_data && job.copy_data.variants) {
    sections.push(
      new Paragraph({ text: "A/B Copy Frameworks", heading: HeadingLevel.HEADING_1, pageBreakBefore: true }),
      new Paragraph({ text: "" }),
      new Paragraph({ children: [new TextRun({ text: "Copywriter Summary", bold: true })] }),
      new Paragraph({ text: job.copy_data.summary || "" }),
      new Paragraph({ text: "" })
    );

    job.copy_data.variants.forEach((variant) => {
      sections.push(
        new Paragraph({ text: `Target: ${variant.keyword} (${variant.campaign_name})`, heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun({ text: "Strategic Rationale:", bold: true })] }),
        new Paragraph({ text: variant.test_rationale || variant.improvement_reason || "" }),
        new Paragraph({ text: "" })
      );

      sections.push(
        new Paragraph({ children: [new TextRun({ text: "Test A", bold: true })] }),
        new Paragraph({ text: `Headline: ${variant.test_a?.headline || ""}` }),
        new Paragraph({ text: `Description: ${variant.test_a?.description || ""}` }),
        new Paragraph({ text: "" }),
        
        new Paragraph({ children: [new TextRun({ text: "Test B", bold: true })] }),
        new Paragraph({ text: `Headline: ${variant.test_b?.headline || ""}` }),
        new Paragraph({ text: `Description: ${variant.test_b?.description || ""}` }),
        new Paragraph({ text: "" })
      );
    });
  }

  return new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });
}

function createMetricsTable(rowsData) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: rowsData.map(row => (
      new TableRow({
        children: row.map(cellText => (
          new TableCell({
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({ text: cellText })]
          })
        ))
      })
    ))
  });
}

function createIssuesTable(issues) {
  const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  
  const headers = ["Keyword", "Campaign", "Severity", "Issue Type", "Impacted Spend"];
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
    }))
  });
  
  const rows = issues.map(issue => {
    return new TableRow({
      children: [
        issue.keyword,
        issue.campaign_name,
        issue.severity,
        issue.issue_type.replace(/_/g, ' '),
        formatMoney(issue.spend)
      ].map(text => new TableCell({
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ text: String(text) })]
      }))
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows]
  });
}

function createAnomaliesTable(anomalies) {
  const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  
  const headers = ["Segment Type", "Value", "Keyword", "Campaign", "Severity", "Spend"];
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
    }))
  });
  
  const rows = anomalies.map(anomaly => {
    return new TableRow({
      children: [
        anomaly.segment_type,
        anomaly.segment_value,
        anomaly.keyword,
        anomaly.campaign_name,
        anomaly.severity,
        formatMoney(anomaly.spend)
      ].map(text => new TableCell({
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({ text: String(text) })]
      }))
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows]
  });
}
