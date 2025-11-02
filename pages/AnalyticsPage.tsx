

import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { ClockIcon, UserGroupIcon, MagnifyingGlassCircleIcon, HandThumbUpIcon } from '../constants';
import { fetchAnalyticsStats, fetchAllComplaints } from '../services/complaintService';
import { Stat, CategoryStat, Complaint, ComplaintStatus } from '../types';
import LiveFeedItem from '../components/LiveFeedItem';
import Spinner from '../components/Spinner';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};


const AnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState<Stat[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
    const [liveFeedItems, setLiveFeedItems] = useState<Complaint[]>([]); // This will hold displayed items
    const [loading, setLoading] = useState(true);
    
    // Use a ref to hold the pool of complaints to be added to the feed
    const unprocessedComplaintsRef = useRef<Complaint[]>([]);
    const feedIndexRef = useRef<number>(0);

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

                const resolvedComplaints = complaintsData.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED);
                
                // Shuffle and store in ref for the live feed simulation
                unprocessedComplaintsRef.current = shuffleArray(resolvedComplaints);
                
                // Initialize the feed with the first 5 items
                setLiveFeedItems(unprocessedComplaintsRef.current.slice(0, 5));
                feedIndexRef.current = 5;

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

    // Effect for the live feed simulation
    useEffect(() => {
        if (loading) return; // Don't start interval until initial data is loaded

        const interval = setInterval(() => {
            if (unprocessedComplaintsRef.current.length === 0) {
                return; // Stop if no complaints
            }
            
            // Loop back if we've reached the end
            if (feedIndexRef.current >= unprocessedComplaintsRef.current.length) {
                feedIndexRef.current = 0;
            }

            const nextComplaint = unprocessedComplaintsRef.current[feedIndexRef.current];
            feedIndexRef.current++;

            setLiveFeedItems(prevItems => {
                // Avoid adding duplicates if the list is small
                if (prevItems.find(item => item.id === nextComplaint.id)) {
                    return prevItems;
                }
                const newItems = [nextComplaint, ...prevItems];
                return newItems.slice(0, 5); // Keep the feed to a max of 5 items
            });

        }, 4000); // Add a new item every 4 seconds

        return () => clearInterval(interval); // Cleanup
    }, [loading]);

    if (loading) {
        return <Spinner />;
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
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                        {liveFeedItems.length > 0 ? (
                           liveFeedItems.map(c => (
                                <LiveFeedItem key={c.id} complaint={c} />
                           ))
                        ) : (
                           <p className="text-sm text-gray-500 text-center pt-10">Waiting for resolved complaints...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
