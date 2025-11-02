import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllComplaints, fetchDashboardStats, updateComplaintStatus, sendFeedbackRequest } from '../services/complaintService';
import { Complaint, ComplaintStatus, DashboardStats } from '../types';
import Button from '../components/Button';
import { ClockIcon, FolderOpenIcon, ExclamationTriangleIcon, ArrowPathIcon, MagnifyingGlassCircleIcon, CogIcon } from '../constants';
import Input from '../components/Input';
import SettingsModal from '../components/SettingsModal';
import { NotificationSettings } from '../types';
import DashboardStatCard from '../components/DashboardStatCard';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';


// --- Main Page Component ---

const AdminDashboardPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        newComplaint: true,
        statusChange: true,
        slaBreach: true,
    });


    const loadData = useCallback(async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await fetchAllComplaints();
            setComplaints(data);
            setStats(fetchDashboardStats(data));
        } catch (err) {
            setError("Failed to load complaints. Please try again.");
            console.error(err);
        } finally {
            if (!isBackgroundRefresh) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadData(); // Initial load
        const intervalId = setInterval(() => loadData(true), 15000); // Background refresh every 15 seconds
        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [loadData]);

    const handleUpdateStatus = async (complaintId: string, newStatus: ComplaintStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [complaintId]: true }));
        const adminId = "Admin #007"; // Mock admin identifier
        const note = `Status updated to ${newStatus} by ${adminId}.`;

        try {
            // Call the service to make the update persistent
            const updatedComplaint = await updateComplaintStatus(complaintId, newStatus, note);
            
            // Update local state with the confirmed result from the service
            const newComplaints = complaints.map(c => 
                c.id === complaintId ? updatedComplaint : c
            );
            setComplaints(newComplaints);
            setStats(fetchDashboardStats(newComplaints)); // Recalculate stats

        } catch (err) {
            setError(`Failed to update status for ${complaintId}. Please try again.`);
            console.error(err);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [complaintId]: false }));
        }
    };


    const handleRequestFeedback = async (complaintId: string) => {
        const complaint = complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        setFeedbackLoading(complaintId);
        try {
            const score = await sendFeedbackRequest({
                ticketId: complaint.id,
                contact: complaint.contact,
            });

            // Update local state to reflect the new score and history
            setComplaints(prevComplaints =>
                prevComplaints.map(c => {
                    if (c.id === complaintId) {
                        const newHistory = [...c.history, {
                            status: c.status,
                            timestamp: new Date(),
                            notes: `Citizen feedback received: ${score}/5.`,
                        }];
                        return { ...c, citizenSatisfactionScore: score, history: newHistory };
                    }
                    return c;
                })
            );
        } catch (error) {
            console.error("Failed to send feedback request:", error);
            // In a real app, you might show an error toast to the admin here.
        } finally {
            setFeedbackLoading(null);
        }
    };
    
    const handleViewDetails = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
    };

    const handleCloseModal = () => {
        setSelectedComplaint(null);
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
                <Button onClick={() => loadData()} disabled={loading} variant="ghost" className="!p-2" aria-label="Refresh Data">
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
                                onViewDetails={() => handleViewDetails(complaint)}
                                onRequestFeedback={() => handleRequestFeedback(complaint.id)}
                                isFeedbackLoading={feedbackLoading === complaint.id}
                                isUpdatingStatus={!!updatingStatus[complaint.id]}
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

            <ComplaintDetailsModal
                isOpen={!!selectedComplaint}
                onClose={handleCloseModal}
                complaint={selectedComplaint}
            />
        </div>
    );
};

export default AdminDashboardPage;