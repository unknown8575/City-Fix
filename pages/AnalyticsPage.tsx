
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { ClockIcon, UserGroupIcon, MagnifyingGlassCircleIcon, HandThumbUpIcon } from '../constants';
import { fetchAnalyticsStats, fetchAllComplaints } from '../services/complaintService';
import { Stat, CategoryStat, Complaint, ComplaintStatus } from '../types';

const AnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState<Stat[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
    const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, complaintsData] = await Promise.all([
                    fetchAnalyticsStats(),
                    fetchAllComplaints()
                ]);

                const fetchedStats: Stat[] = [
                    { name: "Complaints Processed (30 Days)", value: statsData.processedLast30Days, icon: ClockIcon },
                    { name: "Avg. Resolution Time", value: `${statsData.avgResolutionHours} hrs`, icon: UserGroupIcon },
                    { name: "Duplicate Filings Reduced", value: `${statsData.duplicateReduction}%`, icon: MagnifyingGlassCircleIcon },
                    { name: "Citizen Satisfaction", value: `${statsData.citizenSatisfaction}%`, icon: HandThumbUpIcon },
                ];
                setStats(fetchedStats);

                const resComplaints = complaintsData.filter(c => c.status === ComplaintStatus.RESOLVED);
                setResolvedComplaints(resComplaints);
                
                // Mock category resolution times
                const catStats: CategoryStat[] = [
                    { name: 'Waste Mgmt', time: 22 },
                    { name: 'Roads', time: 16 },
                    { name: 'Water Supply', time: 30 },
                    { name: 'Lighting', time: 12 },
                    { name: 'Public Safety', time: 48 },
                ];
                setCategoryData(catStats);

            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="text-center p-10">Loading Analytics...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6">Our AI Impact</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                    <StatCard key={index} name={stat.name} value={stat.value} icon={stat.icon} />
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-neutral-white p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">Resolution Time by Category (Hours)</h2>
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="time" fill="#3B82F6" name="Avg. Hours to Resolve"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-neutral-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-neutral-dark-gray mb-4">Live Feed: Recently Resolved</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {resolvedComplaints.map(c => (
                            <div key={c.id} className="flex items-center gap-4 border-b pb-2">
                                <img src={c.photoAfterUrl || 'https://picsum.photos/seed/resolved/100'} alt="Resolved" className="w-16 h-16 rounded-md object-cover"/>
                                <div>
                                    <p className="font-semibold text-sm text-gov-blue-900">{c.category}</p>
                                    <p className="text-xs text-gray-600">{c.location}</p>
                                    <p className="text-xs text-action-green-500 font-bold">Resolved on {c.resolvedAt?.toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
