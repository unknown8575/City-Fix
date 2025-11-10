import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../hooks/useLocalization';
import { fetchPredictionData } from '../services/complaintService';
import { PredictionData, RiskLevel, CriticalArea } from '../types';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { DocumentTextIcon, LightBulbIcon, GlobeAltIcon, TruckIcon, BeakerIcon, ExclamationTriangleIcon } from '../constants';
import GeospatialHeatmap from '../components/GeospatialHeatmap';
import DownloadReportModal, { ReportOptions } from '../components/DownloadReportModal';
import { downloadCsv, generatePdfMock } from '../utils/downloadUtils';

const MetricCard: React.FC<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: RiskLevel;
}> = ({ icon: Icon, label, value }) => {
  const riskConfig = {
    [RiskLevel.LOW]: { color: 'border-action-green-500', text: 'text-action-green-500' },
    [RiskLevel.MEDIUM]: { color: 'border-warning-orange-500', text: 'text-warning-orange-500' },
    [RiskLevel.HIGH]: { color: 'border-red-500', text: 'text-red-500' },
    [RiskLevel.CRITICAL]: { color: 'border-red-700', text: 'text-red-700' },
  };
  const { color, text } = riskConfig[value] || riskConfig[RiskLevel.LOW];

  return (
    <div className={`bg-neutral-white p-4 rounded-lg shadow-md border-l-8 ${color}`}>
      <div className="flex items-center">
        <Icon className={`h-10 w-10 mr-4 ${text}`} />
        <div>
          <p className="font-semibold text-neutral-dark-gray">{label}</p>
          <p className={`text-3xl font-bold ${text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

const PredictionPage: React.FC = () => {
    const { t } = useLocalization();
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<CriticalArea | null>(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [season, setSeason] = useState('Default');

    const seasons = ['Default', 'Monsoon', 'Summer', 'Winter'];

    useEffect(() => {
        const loadPrediction = async () => {
            setLoading(true);
            try {
                const predictionData = await fetchPredictionData(season);
                setData(predictionData);
            } catch (error) {
                console.error("Failed to load prediction data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPrediction();
    }, [season]);

    const handleAreaClick = (area: CriticalArea) => {
        setSelectedLocation(area.location === selectedLocation?.location ? null : area);
    };
    
    const handleDownload = (options: ReportOptions) => {
        if (!data) return;
        console.log("Downloading report with options:", options);
        setIsDownloadModalOpen(false);

        if (options.format === 'csv') {
            if (options.sections.includes('criticalAreas')) {
                downloadCsv(data.topCriticalAreas, 'critical_areas_prediction.csv');
            } else {
                alert("Please select 'Top Critical Areas' to download a CSV report.");
            }
        } else {
            // PDF generation
            generatePdfMock(data, options);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    if (loading && !data) {
        return <Spinner />;
    }
    
    if (!data) {
        return <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">Failed to load prediction data. Please try again later.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-dark-gray text-center">{t('predictionTitle')}</h1>
                <p className="text-center text-gray-600 mt-2">{t('predictionSubtitle')}</p>
            </div>

            <div className="bg-neutral-white p-4 rounded-lg shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="date-range" className="font-semibold text-sm text-neutral-dark-gray">{t('dateRange')}</label>
                        <select id="date-range" className="rounded-lg border-neutral-gray focus:ring-gov-blue-500 focus:border-gov-blue-500">
                            <option>Next 2 Weeks</option>
                            <option>Next Month</option>
                        </select>
                    </div>
                    <Button variant="primary" onClick={() => setIsDownloadModalOpen(true)} className="!py-2 !px-4 text-sm flex items-center gap-2 w-full sm:w-auto">
                        <DocumentTextIcon className="h-5 w-5"/>
                        {t('downloadReport')}
                    </Button>
                </div>
                 <div className="border-t border-neutral-gray pt-4">
                    <label className="font-semibold text-sm text-neutral-dark-gray mb-2 block">Select Season:</label>
                    <div className="flex flex-wrap gap-2">
                        {seasons.map(s => (
                            <Button 
                                key={s}
                                variant={season === s ? 'primary' : 'outline'}
                                onClick={() => setSeason(s)}
                                className="!py-1.5 !px-3 text-sm"
                            >
                                {s === 'Default' ? 'Normal' : s}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {data.seasonalImpactMessage && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 flex items-start gap-3 rounded-r-lg animated-section">
                    <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-yellow-500"/>
                    <div>
                        <h3 className="font-bold">Seasonal Advisory</h3>
                        <p>{data.seasonalImpactMessage}</p>
                    </div>
                </div>
            )}
            
            <div className={`relative ${loading ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-lg"><Spinner /></div>
                )}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard icon={GlobeAltIcon} label={t('cityWideRisk')} value={data.cityWideRisk} />
                        <MetricCard icon={TruckIcon} label={t('predictedTrafficCongestion')} value={data.predictedTrafficCongestion} />
                        <MetricCard icon={BeakerIcon} label={t('waterShortageRisk')} value={data.waterShortageRisk} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">{t('topCriticalAreas')}</h2>
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {data.topCriticalAreas.sort((a,b) => b.severityScore - a.severityScore).map((area, index) => (
                                    <li key={index} 
                                        onClick={() => handleAreaClick(area)}
                                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedLocation?.location === area.location ? 'bg-gov-blue-500 shadow-lg scale-105' : 'bg-neutral-light-gray hover:shadow-md hover:bg-gov-blue-500/10'}`}
                                    >
                                        <div className="flex-grow">
                                            <p className={`font-semibold ${selectedLocation?.location === area.location ? 'text-white' : 'text-gov-blue-900'}`}>{area.location}</p>
                                            <p className={`text-sm ${selectedLocation?.location === area.location ? 'text-blue-100' : 'text-gray-600'}`}>{area.predictedIssue}</p>
                                        </div>
                                        <div className={`text-right flex-shrink-0 ml-4 p-2 rounded-md ${selectedLocation?.location === area.location ? 'bg-white/20' : ''}`}>
                                            <p className={`font-bold text-lg ${selectedLocation?.location === area.location ? 'text-white' : 'text-red-500'}`}>{area.severityScore}</p>
                                            <p className={`text-xs ${selectedLocation?.location === area.location ? 'text-blue-100' : 'text-gray-500'}`}>{t('severity')}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">{t('geospatialRisk')}</h2>
                            <GeospatialHeatmap 
                                criticalAreas={data.topCriticalAreas}
                                selectedLocation={selectedLocation}
                                onAreaClick={handleAreaClick}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">{t('expectedComplaints')}</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={data.expectedCategoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {data.expectedCategoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-neutral-dark-gray mb-4 flex items-center gap-2">
                                <LightBulbIcon className="w-6 h-6 text-yellow-500"/>
                                {t('actionableRecs')}
                            </h2>
                            <ul className="space-y-3 list-disc list-inside text-gray-700">
                                {data.actionableRecommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <DownloadReportModal 
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
            />
        </div>
    );
};

export default PredictionPage;