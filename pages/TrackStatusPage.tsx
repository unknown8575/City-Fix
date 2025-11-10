import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { Complaint, ComplaintStatus } from '../types';
import {
    fetchComplaintById, updateComplaintStatus, subscribeToComplaints, fetchTransparencyInsights,
    fetchSimilarComplaints, addCommentToComplaint, submitSatisfactionFeedback
} from '../services/complaintService';
import ComplaintProgressStepper from '../components/ComplaintProgressStepper';
import ComplaintHistoryTimeline from '../components/ComplaintHistoryTimeline';
import { PhotoIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, XMarkIcon, UserIcon, QrCodeIcon, SpeakerWaveIcon } from '../constants';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import TextArea from '../components/TextArea';
import StarRating from '../components/StarRating';
import SimilarComplaintCard from '../components/SimilarComplaintCard';


const TrackStatusPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [ticketId, setTicketId] = useState(searchParams.get('ticketId') || '');
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
    const [reopenNotes, setReopenNotes] = useState('');
    const [reopenError, setReopenError] = useState('');

    // New state for enhanced features
    const [transparencyInsights, setTransparencyInsights] = useState<{ estimatedTime: string; queuePosition: number; departmentWorkload: number; } | null>(null);
    const [similarComplaints, setSimilarComplaints] = useState<Complaint[]>([]);
    const [newComment, setNewComment] = useState('');
    const [additionalPhoto, setAdditionalPhoto] = useState<File | null>(null);
    const [satisfactionRating, setSatisfactionRating] = useState(0);
    const [satisfactionFeedback, setSatisfactionFeedback] = useState('');

    const loadComplaintData = async (id: string) => {
        setLoading(true);
        setError('');
        setComplaint(null);
        setTransparencyInsights(null);
        setSimilarComplaints([]);
        setSearchParams({ ticketId: id });
        try {
            const result = await fetchComplaintById(id);
            if (result) {
                setComplaint(result);
                // Fetch additional context data
                fetchTransparencyInsights(result.category).then(setTransparencyInsights);
                fetchSimilarComplaints(result.location).then(setSimilarComplaints);
            } else {
                setError(`Complaint with ID "${id}" not found.`);
            }
        } catch (err) {
            setError('An error occurred while fetching the complaint.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialTicketId = searchParams.get('ticketId');
        if (initialTicketId) {
            loadComplaintData(initialTicketId);
        }
    }, []);

    useEffect(() => {
        if (!ticketId || !complaint) return;
        const unsubscribe = subscribeToComplaints(allComplaints => {
            const updatedComplaint = allComplaints.find(c => c.id.toLowerCase() === ticketId.toLowerCase());
            if (updatedComplaint && JSON.stringify(updatedComplaint) !== JSON.stringify(complaint)) {
                setComplaint(updatedComplaint);
            }
        });
        return () => unsubscribe();
    }, [ticketId, complaint]);

    const handleTrack = () => {
        if (ticketId) loadComplaintData(ticketId);
    };

    const handleReopenSubmit = async () => {
        if (reopenNotes.trim().length < 10) {
            setReopenError("Please provide a reason (at least 10 characters).");
            return;
        }
        if (!complaint) return;
        setReopenError("");
        setActionLoading(true);
        try {
            await updateComplaintStatus(complaint.id, ComplaintStatus.REOPENED, `Citizen reopened ticket. Reason: "${reopenNotes}"`, 'Citizen');
            setIsReopenModalOpen(false);
            setReopenNotes('');
        } catch (err) {
            setError('Failed to reopen ticket. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddUpdate = async () => {
        if (!complaint || newComment.trim().length < 5) {
            setError("Please enter a comment (at least 5 characters).");
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            await addCommentToComplaint(complaint.id, newComment, additionalPhoto);
            setNewComment('');
            setAdditionalPhoto(null);
        } catch (err) {
            setError('Failed to add update. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!complaint || satisfactionRating === 0) {
            setError("Please select a star rating before submitting.");
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            await submitSatisfactionFeedback(complaint.id, satisfactionRating, satisfactionFeedback, additionalPhoto);
            // The subscription will handle the UI update
        } catch (err) {
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const TabButton: React.FC<{ name: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ name, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === name ? 'border-gov-blue-500 text-gov-blue-500' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            aria-current={activeTab === name ? 'page' : undefined}
        >
            <Icon className="h-5 w-5" /> {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6 text-center">Track Complaint Status</h1>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <Input id="ticketId" label="Enter your Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="flex-grow !mb-0" placeholder="e.g., TKT-12345" />
                    <Button onClick={handleTrack} disabled={loading} className="w-full sm:w-auto">
                        {loading ? 'Tracking...' : 'Track'}
                    </Button>
                </div>
                {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            </div>

            {loading && <Spinner />}

            {complaint && (
                <>
                    <div className="bg-neutral-white rounded-lg shadow-md animated-section">
                        <header className="p-6 border-b border-neutral-gray flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gov-blue-900">Ticket ID: {complaint.id}</h2>
                                <p className="text-gray-600 mt-1">Category: <span className="font-medium text-neutral-dark-gray">{complaint.category}</span></p>
                            </div>
                            <StatusBadge status={complaint.status} />
                        </header>

                        <section className="p-6">
                            <ComplaintProgressStepper status={complaint.status} />
                        </section>
                        
                        <section className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-light-gray/60 border-y border-neutral-gray">
                           {complaint.assignedOfficial && (
                                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                                    <img src={complaint.assignedOfficial.photoUrl} alt={complaint.assignedOfficial.name} className="w-16 h-16 rounded-full" />
                                    <div>
                                        <p className="text-sm text-gray-500">Assigned To</p>
                                        <p className="font-bold text-lg text-neutral-dark-gray">{complaint.assignedOfficial.name}</p>
                                        <p className="text-sm text-gov-blue-900">{complaint.escalationDept}</p>
                                    </div>
                                </div>
                           )}
                           {transparencyInsights && (
                               <div className="bg-white p-4 rounded-lg shadow-sm">
                                   <h3 className="text-sm text-gray-500 mb-2">Transparency Insights</h3>
                                   <div className="flex justify-around text-center">
                                       <div>
                                           <p className="font-bold text-lg text-neutral-dark-gray">{transparencyInsights.estimatedTime}</p>
                                           <p className="text-xs text-gray-500">Est. Resolution</p>
                                       </div>
                                       <div>
                                           <p className="font-bold text-lg text-neutral-dark-gray">#{transparencyInsights.queuePosition}</p>
                                           <p className="text-xs text-gray-500">In Queue</p>
                                       </div>
                                       <div>
                                           <p className="font-bold text-lg text-neutral-dark-gray">{transparencyInsights.departmentWorkload}</p>
                                           <p className="text-xs text-gray-500">Dept. Workload</p>
                                       </div>
                                   </div>
                               </div>
                           )}
                        </section>

                        <div className="border-b border-neutral-gray px-6 flex justify-between items-center">
                            <nav className="-mb-px flex space-x-2 sm:space-x-6" aria-label="Tabs">
                                <TabButton name="details" label="Details" icon={DocumentTextIcon} />
                                <TabButton name="evidence" label="Evidence" icon={PhotoIcon} />
                                <TabButton name="history" label="History" icon={ClockIcon} />
                            </nav>
                            <div className="flex items-center gap-2 py-2">
                                <Button variant="ghost" className="!p-2"><QrCodeIcon className="w-5 h-5" /></Button>
                                <Button variant="ghost" className="!p-2"><SpeakerWaveIcon className="w-5 h-5" /></Button>
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'details' && (
                                <div>
                                    <div className="space-y-4 mb-8">
                                        <div className="space-y-1"><h3 className="text-sm font-semibold text-gray-500">Submitted On</h3><p className="text-neutral-dark-gray">{complaint.submittedAt.toLocaleString()}</p></div>
                                        <div className="space-y-1"><h3 className="text-sm font-semibold text-gray-500">Location</h3><p className="text-neutral-dark-gray">{complaint.location}</p></div>
                                        <div className="space-y-1"><h3 className="text-sm font-semibold text-gray-500">Your Description</h3><p className="text-neutral-dark-gray bg-neutral-light-gray p-3 rounded-md">{complaint.description}</p></div>
                                    </div>
                                    {(complaint.status === ComplaintStatus.IN_PROGRESS || complaint.status === ComplaintStatus.REOPENED) && (
                                        <div className="p-4 border-t border-neutral-gray mt-6 bg-neutral-light-gray/70 rounded-lg">
                                            <h3 className="font-bold text-neutral-dark-gray mb-2">Add an Update</h3>
                                            <TextArea id="new-comment" label="" placeholder="If the situation has changed, add a comment here..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                                <input type="file" id="additional-photo" onChange={e => setAdditionalPhoto(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gov-blue-50 file:text-gov-blue-700 hover:file:bg-gov-blue-100" />
                                                <Button onClick={handleAddUpdate} disabled={actionLoading}>{actionLoading ? 'Submitting...' : 'Submit Update'}</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                             {activeTab === 'evidence' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {complaint.photoBeforeUrl ? (
                                        <div><h3 className="font-bold text-neutral-dark-gray mb-2">Before</h3><img src={complaint.photoBeforeUrl} alt="Before" className="rounded-lg shadow-sm w-full h-auto object-cover"/></div>
                                    ) : <p className="text-gray-500">No 'Before' photo was submitted.</p>}
                                    {complaint.photoAfterUrl ? (
                                        <div><h3 className="font-bold text-neutral-dark-gray mb-2">After</h3><img src={complaint.photoAfterUrl} alt="After" className="rounded-lg shadow-sm w-full h-auto object-cover"/></div>
                                    ) : <p className="text-gray-500">No 'After' photo available yet.</p>}
                                </div>
                            )}
                            {activeTab === 'history' && <ComplaintHistoryTimeline history={complaint.history} />}
                        </div>

                        {complaint.status === ComplaintStatus.RESOLVED && (
                            <div className="border-t border-neutral-gray bg-neutral-light-gray p-6 rounded-b-lg">
                                <h3 className="text-xl font-bold text-neutral-dark-gray mb-2 text-center">We believe this issue is resolved.</h3>
                                <p className="text-center text-gray-600 mb-4">Help us improve! Please rate your experience.</p>
                                <div className="max-w-md mx-auto">
                                    <StarRating rating={satisfactionRating} onRatingChange={setSatisfactionRating} />
                                    {satisfactionRating > 0 && (
                                        <div className="mt-6 space-y-4 animated-section">
                                            <TextArea id="feedback-text" label="Add optional feedback" value={satisfactionFeedback} onChange={e => setSatisfactionFeedback(e.target.value)} />
                                            <div>
                                                <label htmlFor="resolution-photo" className="block text-sm font-medium text-gray-700 mb-1">Upload 'After' Photo (Optional)</label>
                                                <input type="file" id="resolution-photo" onChange={e => setAdditionalPhoto(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gov-blue-50 file:text-gov-blue-700 hover:file:bg-gov-blue-100" />
                                            </div>
                                            <Button variant="secondary" onClick={handleSubmitFeedback} disabled={actionLoading} className="w-full">{actionLoading ? 'Submitting...' : 'Submit Feedback & Close'}</Button>
                                        </div>
                                    )}
                                     <div className="text-center mt-6">
                                        <Button variant="warning" onClick={() => setIsReopenModalOpen(true)} disabled={actionLoading}>Not Satisfied? Reopen Issue</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {complaint.status === ComplaintStatus.CLOSED && complaint.citizenSatisfactionScore && (
                            <div className="border-t border-neutral-gray bg-neutral-light-gray p-6 rounded-b-lg text-center">
                                <h3 className="text-xl font-bold text-neutral-dark-gray mb-2">Thank you for your feedback!</h3>
                                <div className="flex justify-center items-center gap-2">
                                    <p className="text-lg">Your rating:</p>
                                    <StarRating rating={complaint.citizenSatisfactionScore} readOnly />
                                </div>
                            </div>
                        )}
                    </div>
                     {similarComplaints.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-neutral-dark-gray mb-4 text-center">Similar Resolved Issues Nearby</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {similarComplaints.map(c => <SimilarComplaintCard key={c.id} complaint={c} />)}
                            </div>
                        </div>
                    )}
                </>
            )}
            {isReopenModalOpen && complaint && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 animated-section" role="document">
                        <header className="flex justify-between items-center p-4 border-b border-neutral-gray"><h2 className="text-xl font-bold text-neutral-dark-gray">Reopen Ticket #{complaint.id}</h2><button onClick={() => setIsReopenModalOpen(false)} aria-label="Close modal"><XMarkIcon className="h-6 w-6 text-gray-500" /></button></header>
                        <div className="p-6">
                            <p className="text-neutral-dark-gray mb-4">Please explain why you are not satisfied with the resolution. Your feedback is important.</p>
                            <TextArea id="reopen-notes" label="Reason for Reopening" value={reopenNotes} onChange={(e) => setReopenNotes(e.target.value)} error={reopenError} placeholder="e.g., The pothole was only partially filled and is still dangerous." />
                        </div>
                        <footer className="flex justify-end gap-4 p-4 bg-neutral-light-gray rounded-b-lg"><Button variant="ghost" onClick={() => setIsReopenModalOpen(false)}>Cancel</Button><Button variant="warning" onClick={handleReopenSubmit} disabled={actionLoading}>{actionLoading ? 'Submitting...' : 'Submit & Reopen'}</Button></footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackStatusPage;