import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllComplaints, fetchDashboardStats, updateComplaintStatus, sendFeedbackRequest, updateComplaintDepartment, subscribeToComplaints } from '../services/complaintService';
import { Complaint, ComplaintStatus, DashboardStats } from '../types';
import Button from '../components/Button';
import { ClockIcon, FolderOpenIcon, ExclamationTriangleIcon, ArrowPathIcon, MagnifyingGlassCircleIcon, CogIcon } from '../constants';
import Input from '../components/Input';
import SettingsModal from '../components/SettingsModal';
import { NotificationSettings } from '../types';
import DashboardStatCard from '../components/DashboardStatCard';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import DepartmentAssignModal from '../components/DepartmentAssignModal';
import Spinner from '../components/Spinner';


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
    const [departmentAssignment, setDepartmentAssignment] = useState<{ complaintId: string; department: string } | null>(null);
    const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        newComplaint: true,
        statusChange: true,
        slaBreach: true,
    });


    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToComplaints(allComplaints => {
            setComplaints(allComplaints);
            setStats(fetchDashboardStats(allComplaints));
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);

    const handleUpdateStatus = async (complaintId: string, newStatus: ComplaintStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [complaintId]: true }));
        const adminId = "Admin #007"; // Mock admin identifier
        const note = `Status updated to ${newStatus} by ${adminId}.`;

        try {
            // The service will update state and notify all subscribers
            await updateComplaintStatus(complaintId, newStatus, note);
        } catch (err) {
            setError(`Failed to update status for ${complaintId}. Please try again.`);
            console.error(err);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [complaintId]: false }));
        }
    };

    const handleAssignDepartment = async (complaintId: string, newDepartment: string) => {
        setDepartmentAssignment({ complaintId, department: newDepartment });
        try {
            await updateComplaintDepartment(complaintId, newDepartment);
            if (assignModalComplaint) {
                setAssignModalComplaint(null);
            }
        } catch (err) {
            setError(`Failed to assign department for ${complaintId}. Please try again.`);
            console.error(err);
        } finally {
            setDepartmentAssignment(null);
        }
    };


    const handleRequestFeedback = async (complaintId: string) => {
        const complaint = complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        setFeedbackLoading(complaintId);
        try {
            // The service will update state and notify all subscribers
            await sendFeedbackRequest({
                ticketId: complaint.id,
                contact: complaint.contact,
            });
        } catch (error) {
            console.error("Failed to send feedback request:", error);
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

    const handleOpenAssignModal = (complaint: Complaint) => {
        setAssignModalComplaint(complaint);
    };

    const filteredComplaints = useMemo(() => {
        return complaints
            .filter(c => {
                if (statusFilter === 'All') return true;
                if (statusFilter === 'In Progress') return c.status === 'In Progress' || c.status === 'Reopened';
                return c.status === statusFilter;
            })
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
                <Button onClick={() => {}} disabled={true} variant="ghost" className="!p-2" aria-label="Refresh Data">
                    <ArrowPathIcon className="h-5 w-5 text-green-500" title="Real-time sync enabled" />
                </Button>
                <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" className="!p-2" aria-label="Open Settings">
                    <CogIcon className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Content */}
            {loading ? (
                <Spinner />
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
                                onAssignDepartment={handleAssignDepartment}
                                onOpenAssignModal={handleOpenAssignModal}
                                isFeedbackLoading={feedbackLoading === complaint.id}
                                isUpdatingStatus={!!updatingStatus[complaint.id]}
                                isAssigning={departmentAssignment?.complaintId === complaint.id}
                                assigningTo={departmentAssignment?.complaintId === complaint.id ? departmentAssignment.department : undefined}
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

            <DepartmentAssignModal
                isOpen={!!assignModalComplaint}
                onClose={() => setAssignModalComplaint(null)}
                complaint={assignModalComplaint}
                onAssign={handleAssignDepartment}
                isAssigning={!!departmentAssignment}
            />
        </div>
    );
};

export default AdminDashboardPage;