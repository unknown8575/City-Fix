import { CriticalArea, PredictionData } from '../types';
import { ReportOptions } from '../components/DownloadReportModal';

export const downloadCsv = (data: CriticalArea[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                `"${String(row[header as keyof CriticalArea]).replace(/"/g, '""')}"`
            ).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generatePdfMock = (data: PredictionData, options: ReportOptions) => {
    const { sections } = options;
    const date = new Date().toLocaleDateString();

    let content = `
        <style>
            body { font-family: sans-serif; margin: 2rem; }
            h1, h2, h3 { color: #1E40AF; border-bottom: 2px solid #3B82F6; padding-bottom: 5px; }
            h1 { font-size: 2.5rem; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
            th { background-color: #F9FAFB; }
            ul { padding-left: 20px; }
            .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
            .metric-card { border: 1px solid #E5E7EB; padding: 1rem; border-radius: 8px; text-align: center; }
            .metric-card h3 { border: none; margin: 0; font-size: 1rem; }
            .metric-card p { font-size: 2rem; font-weight: bold; color: #1F2937; margin: 0.5rem 0 0; }
        </style>
        <h1>AI Prediction Report</h1>
        <p style="text-align: center;">Generated on: ${date}</p>
    `;

    if (sections.includes('riskMetrics')) {
        content += `
            <h2>High-Level Risk Metrics</h2>
            <div class="metric-grid">
                <div class="metric-card"><h3>City-Wide Risk</h3><p>${data.cityWideRisk}</p></div>
                <div class="metric-card"><h3>Traffic Congestion</h3><p>${data.predictedTrafficCongestion}</p></div>
                <div class="metric-card"><h3>Water Shortage Risk</h3><p>${data.waterShortageRisk}</p></div>
            </div>
        `;
    }

    if (sections.includes('criticalAreas')) {
        content += `
            <h2>Top Critical Areas</h2>
            <table>
                <thead><tr><th>Location</th><th>Predicted Issue</th><th>Severity Score</th></tr></thead>
                <tbody>
                    ${data.topCriticalAreas.map(area => `
                        <tr>
                            <td>${area.location}</td>
                            <td>${area.predictedIssue}</td>
                            <td>${area.severityScore}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    if (sections.includes('heatmap')) {
        content += `
            <h2>Geospatial Heatmap</h2>
            <p>[A static image or placeholder for the heatmap would be included here in a real PDF generation scenario.]</p>
        `;
    }

    if (sections.includes('distribution')) {
        content += `
            <h2>Expected Complaint Distribution</h2>
             <ul>
                ${data.expectedCategoryDistribution.map(item => `<li>${item.name}: ${item.value}%</li>`).join('')}
            </ul>
        `;
    }

    if (sections.includes('recommendations')) {
        content += `
            <h2>Actionable Recommendations</h2>
            <ul>
                ${data.actionableRecommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
    }

    const pdfWindow = window.open('', '_blank');
    pdfWindow?.document.write(content);
    pdfWindow?.document.close();
    pdfWindow?.print();
};
