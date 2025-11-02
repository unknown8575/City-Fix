import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../hooks/useLocalization';
import { fetchPredictionData } from '../services/complaintService';
import { PredictionData } from '../types';
import Spinner from '../components/Spinner';
import RiskGauge from '../components/RiskGauge';
import Button from '../components/Button';
import { DocumentTextIcon, ExclamationTriangleIcon } from '../constants';

const PredictionPage: React.FC = () => {
    const { t } = useLocalization();
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPrediction = async () => {
            try {
                const predictionData = await fetchPredictionData();
                setData(predictionData);
            } catch (error) {
                console.error("Failed to load prediction data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPrediction();
    }, []);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    if (loading) {
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

            <div className="bg-neutral-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="date-range" className="font-semibold text-sm text-neutral-dark-gray">{t('dateRange')}</label>
                    <select id="date-range" className="rounded-lg border-neutral-gray focus:ring-gov-blue-500 focus:border-gov-blue-500">
                        <option>Next 2 Weeks</option>
                        <option>Next Month</option>
                    </select>
                </div>
                <Button variant="primary" className="!py-2 !px-4 text-sm flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5"/>
                    {t('downloadReport')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* City-Wide Risk */}
                <div className="bg-neutral-white p-6 rounded-lg shadow-md lg:col-span-1">
                    <h2 className="text-xl font-bold text-neutral-dark-gray mb-4 text-center">{t('cityWideRisk')}</h2>
                    <RiskGauge riskLevel={data.cityWideRisk} />
                </div>

                {/* Top Critical Areas */}
                <div className="bg-neutral-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">{t('topCriticalAreas')}</h2>
                    <ul className="space-y-3">
                        {data.topCriticalAreas.map((area, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-neutral-light-gray rounded-md">
                                <div>
                                    <p className="font-semibold text-gov-blue-900">{area.location}</p>
                                    <p className="text-sm text-gray-600">{area.predictedIssue}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-red-500">{area.severityScore}</p>
                                    <p className="text-xs text-gray-500">{t('severity')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expected Complaint Distribution */}
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
                
                {/* Geospatial Risk Heatmap */}
                <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">{t('geospatialRisk')}</h2>
                    <img src={data.heatmapUrl} alt="City Heatmap" className="w-full h-auto rounded-lg border-2 border-neutral-gray object-cover"/>
                </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-neutral-dark-gray mb-4 flex items-center gap-2"><ExclamationTriangleIcon className="w-6 h-6 text-warning-orange-500"/>{t('actionableRecs')}</h2>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                    {data.actionableRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default PredictionPage;
