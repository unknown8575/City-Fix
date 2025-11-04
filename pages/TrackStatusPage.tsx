import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { Complaint, ComplaintStatus } from '../types';
import { fetchComplaintById, updateComplaintStatus, confirmResolutionWithPhoto } from '../services/complaintService';
import ComplaintProgressStepper from '../components/ComplaintProgressStepper';
import ComplaintHistoryTimeline from '../components/ComplaintHistoryTimeline';
import { PhotoIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon } from '../constants';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';


const TrackStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('ticketId') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [satisfactionResponse, setSatisfactionResponse] = useState<'yes' | null>(null);
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  const handleTrack = async () => {
    if (!ticketId) {
      setError('Please enter a valid Ticket ID.');
      return;
    }
    setLoading(true);
    setError('');
    setComplaint(null);
    setSatisfactionResponse(null); // Reset satisfaction state on new track
    setSearchParams({ ticketId });
    try {
      const result = await fetchComplaintById(ticketId);
      if (result) {
        setComplaint(result);
      } else {
        setError(`Complaint with ID "${ticketId}" not found.`);
      }
    } catch (err) {
      setError('An error occurred while fetching the complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('ticketId')) {
        handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    // Cleanup object URL for photo preview
    return () => {
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }
    };
  }, [photoPreview]);


  // Poll for updates if the complaint is open
  useEffect(() => {
    if (complaint && complaint.status !== ComplaintStatus.CLOSED) {
      const interval = setInterval(async () => {
        try {
          const updatedComplaint = await fetchComplaintById(complaint.id);
          if (updatedComplaint) {
            setComplaint(updatedComplaint);
          }
        } catch (error) {
          console.error("Polling failed:", error);
        }
      }, 15000); // Poll every 15 seconds

      return () => clearInterval(interval);
    }
  }, [complaint]);
  
  const handleCitizenAction = async (action: 'close' | 'reopen') => {
      if (!complaint) return;
      
      setActionLoading(true);
      setError('');
      
      try {
          const newStatus = action === 'close' ? ComplaintStatus.CLOSED : ComplaintStatus.IN_PROGRESS;
          const notes = action === 'close'
              ? 'Citizen confirmed resolution and closed the ticket.'
              : 'Citizen was not satisfied and reopened the ticket.';
          
          const updatedComplaint = await updateComplaintStatus(complaint.id, newStatus, notes);
          setComplaint(updatedComplaint);
      } catch (err) {
          setError('Failed to update status. Please try again.');
      } finally {
          setActionLoading(false);
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    if (file) {
      if (file.size < 5 * 1024 * 1024) { // 5MB limit
        setResolutionPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setResolutionPhoto(null);
        setPhotoPreview(null);
        setError('Photo must be less than 5MB.');
      }
    }
  };
  
  const handleConfirmAndClose = async () => {
      if (!complaint || !resolutionPhoto) return;
      
      setActionLoading(true);
      setError('');
      
      try {
          const notes = 'Citizen confirmed resolution with a photo and closed the ticket.';
          const updatedComplaint = await confirmResolutionWithPhoto(complaint.id, resolutionPhoto, notes);
          setComplaint(updatedComplaint);
      } catch (err) {
          setError('Failed to upload photo and close ticket. Please try again.');
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
          <Icon className="h-5 w-5"/>
          {label}
      </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-neutral-dark-gray mb-6 text-center">Track Complaint Status</h1>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <Input
            id="ticketId"
            label="Enter your Ticket ID"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="flex-grow !mb-0"
            placeholder="e.g., TKT-12345"
          />
          <Button onClick={handleTrack} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Tracking...' : 'Track'}
          </Button>
        </div>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>

      {loading && <Spinner />}

      {complaint && (
        <div className="bg-neutral-white rounded-lg shadow-md animated-section">
            <div className="p-6 border-b border-neutral-gray flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gov-blue-900">Ticket ID: {complaint.id}</h2>
                    <p className="text-gray-600 mt-1">Category: <span className="font-medium text-neutral-dark-gray">{complaint.category}</span></p>
                </div>
                <StatusBadge status={complaint.status} />
            </div>

            <div className="p-6">
                <ComplaintProgressStepper status={complaint.status} />
            </div>

            <div className="border-b border-neutral-gray px-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton name="details" label="Details" icon={DocumentTextIcon} />
                    <TabButton name="evidence" label="Evidence" icon={PhotoIcon} />
                    <TabButton name="history" label="History" icon={ClockIcon} />
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-gray-500">Submitted On</h3>
                            <p className="text-neutral-dark-gray">{complaint.submittedAt.toLocaleString()}</p>
                        </div>
                         <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                            <p className="text-neutral-dark-gray">{complaint.location}</p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-gray-500">Your Description</h3>
                            <p className="text-neutral-dark-gray bg-neutral-light-gray p-3 rounded-md">{complaint.description}</p>
                        </div>
                        {complaint.aiSummary && (
                             <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-blue-800">AI Summary</h3>
                                <p className="text-neutral-dark-gray bg-blue-50 p-3 rounded-md border border-blue-200 italic">"{complaint.aiSummary}"</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'evidence' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {complaint.photoBeforeUrl ? (
                            <div>
                                <h3 className="font-bold text-neutral-dark-gray mb-2">Before</h3>
                                <img src={complaint.photoBeforeUrl} alt="Before" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                            </div>
                        ) : <p className="text-gray-500">No 'Before' photo was submitted.</p>}
                        {complaint.photoAfterUrl ? (
                             <div>
                                <h3 className="font-bold text-neutral-dark-gray mb-2">After</h3>
                                <img src={complaint.photoAfterUrl} alt="After" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                            </div>
                        ) : <p className="text-gray-500">No 'After' photo available yet.</p>}
                    </div>
                )}
                {activeTab === 'history' && (
                     <ComplaintHistoryTimeline history={complaint.history} />
                )}
            </div>


            {complaint.status === ComplaintStatus.RESOLVED && (
                <div className="border-t border-neutral-gray bg-neutral-light-gray p-6 rounded-b-lg">
                    {satisfactionResponse === null ? (
                        <>
                            <h3 className="text-xl font-bold text-neutral-dark-gray mb-4 text-center">The administration has marked this issue as resolved. Are you satisfied with the resolution?</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button variant="secondary" onClick={() => setSatisfactionResponse('yes')} disabled={actionLoading}>Yes, I am satisfied</Button>
                                <Button variant="warning" onClick={() => handleCitizenAction('reopen')} disabled={actionLoading}>No, Reopen Issue</Button>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <h3 className="text-xl font-bold text-neutral-dark-gray mb-2 text-center">Thank you for your confirmation!</h3>
                            <p className="text-center text-gray-700 mb-6">Uploading a photo of the resolution helps us verify the work and maintain records.</p>
                            
                            <div>
                                <label htmlFor="resolution-photo-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload 'After' Photo</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Resolution preview" className="mx-auto h-32 w-auto rounded-md shadow-sm" />
                                        ) : (
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="resolution-photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-gov-blue-500 hover:text-gov-blue-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gov-blue-500">
                                                <span>{resolutionPhoto ? 'Change photo' : 'Select a photo'}</span>
                                                <input id="resolution-photo-upload" name="resolution-photo" type="file" className="sr-only" onChange={handlePhotoUpload} accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                        
                            <div className="mt-6 flex flex-col gap-4">
                                <Button variant="secondary" onClick={handleConfirmAndClose} disabled={actionLoading || !resolutionPhoto}>
                                    {actionLoading ? 'Uploading...' : 'Upload Photo & Close Ticket'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleCitizenAction('close')} disabled={actionLoading}>
                                    Close Ticket Without Photo
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackStatusPage;
