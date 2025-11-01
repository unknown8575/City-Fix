import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllComplaints, fetchDashboardStats, sendCitizenNotification } from '../services/complaintService';
import { Complaint, ComplaintStatus, DashboardStats } from '../types';
import Button from '../components/Button';
import { ClockIcon, FolderOpenIcon, ExclamationTriangleIcon, ArrowPathIcon, MagnifyingGlassCircleIcon, CogIcon } from '../constants';
import Input from '../components/Input';
import SettingsModal from '../components/SettingsModal';
import { NotificationSettings } from '../types';
import DashboardStatCard from '../components/DashboardStatCard';
import ComplaintCard from '../components/ComplaintCard';


// --- Main Page Component ---

const AdminDashboardPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        newComplaint: true,
        statusChange: true,
        slaBreach: true,
    });


    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllComplaints();
            setComplaints(data);
            setStats(fetchDashboardStats(data));
        } catch (err) {
            setError("Failed to load complaints. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = (complaintId: string, newStatus: ComplaintStatus) => {
        let updatedComplaint: Complaint | null = null;
        const adminId = "Admin #007"; // Mock admin identifier
        const note = `Status updated to ${newStatus} by ${adminId}.`;

        const updatedComplaints = complaints.map(c => {
            if (c.id === complaintId) {
                const newHistoryEntry = { status: newStatus, timestamp: new Date(), notes: note };
                updatedComplaint = {
                    ...c,
                    status: newStatus,
                    history: [...c.history, newHistoryEntry],
                };
                if (newStatus === ComplaintStatus.RESOLVED) {
                    updatedComplaint.resolvedAt = new Date();
                }
                return updatedComplaint;
            }
            return c;
        });

        setComplaints(updatedComplaints);
        setStats(fetchDashboardStats(updatedComplaints));

        // After state update, send the simulated notification
        if (updatedComplaint && notificationSettings.statusChange) {
            sendCitizenNotification({
                ticketId: updatedComplaint.id,
                contact: updatedComplaint.contact,
                newStatus: newStatus,
                notes: note,
            }).catch(error => {
                console.error("Failed to send notification:", error);
                // In a real app, you might show an error toast to the admin here.
            });
        }
    };
    
    const handleToggleExpand = (complaintId: string) => {
        setExpandedComplaintId(prevId => (prevId === complaintId ? null : complaintId));
    };
    
    const handleSaveSettings = (newSettings: NotificationSettings) => {
        setNotificationSettings(newSettings);
        console.log("Notification settings saved:", newSettings);
        setIsSettingsOpen(false);
    };

    const filteredComplaints = useMemo(() => {
        return complaints
            .filter(c => statusFilter === 'All' || c.status === statusFilter)
            .filter(c => {
                const query = searchQuery.toLowerCase();
                return c.id.toLowerCase().includes(query) ||
                       c.description.toLowerCase().includes(query) ||
                       c.location.toLowerCase().includes(query);
            });
    }, [complaints, statusFilter, searchQuery]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6">Admin Situation Room</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DashboardStatCard icon={FolderOpenIcon} value={stats?.open ?? '...'} name="Open Complaints" color="bg-gov-blue-500" />
                <DashboardStatCard icon={ClockIcon} value={`${stats?.avgResolutionHours ?? '...'} hrs`} name="Avg. Resolution" color="bg-action-green-500" />
                <DashboardStatCard icon={ExclamationTriangleIcon} value={stats?.slaBreaches ?? '...'} name="SLA Breaches" color="bg-warning-orange-500" />
            </div>

            {/* Controls */}
            <div className="mb-6 bg-neutral-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-1/2 lg:w-1/3">
                    <Input id="search" label="" placeholder="Search ID, keyword, location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="!mb-0 pl-10" />
                    <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="status-filter" className="font-semibold text-sm">Status:</label>
                    <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border-neutral-gray focus:ring-gov-blue-500 focus:border-gov-blue-500">
                        <option>All</option>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                        <option>Duplicate</option>
                    </select>
                </div>
                <div className="flex-grow"></div>
                <Button onClick={loadData} disabled={loading} variant="ghost" className="!p-2" aria-label="Refresh Data">
                    <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" className="!p-2" aria-label="Open Settings">
                    <CogIcon className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="text-center p-8">Loading complaints...</div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map(complaint => (
                            <ComplaintCard 
                                key={complaint.id} 
                                complaint={complaint} 
                                onStatusChange={handleUpdateStatus} 
                                isExpanded={expandedComplaintId === complaint.id}
                                onToggleExpand={() => handleToggleExpand(complaint.id)}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center p-8 text-gray-500">No complaints found matching your criteria.</p>
                    )}
                </div>
            )}
            
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentSettings={notificationSettings}
                onSave={handleSaveSettings}
            />
        </div>
    );
};

export default AdminDashboardPage;
