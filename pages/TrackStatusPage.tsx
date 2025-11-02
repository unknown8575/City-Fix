import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { Complaint, ComplaintStatus } from '../types';
import { fetchComplaintById, updateComplaintStatus, confirmResolutionWithPhoto } from '../services/complaintService';
import ComplaintProgressStepper from '../components/ComplaintProgressStepper';
import ComplaintHistoryTimeline from '../components/ComplaintHistoryTimeline';
import { PhotoIcon } from '../constants';


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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md">
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

      {complaint && (
        <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold text-gov-blue-900 mb-6 text-center">Complaint Progress</h2>
            <div className="mb-8">
                <ComplaintProgressStepper status={complaint.status} />
            </div>

            <h2 className="text-2xl font-bold text-gov-blue-900 mb-4 pt-6 border-t">Complaint Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div><strong className="text-neutral-dark-gray">Ticket ID:</strong> {complaint.id}</div>
                <div><strong className="text-neutral-dark-gray">Status:</strong> <span className={`font-bold ${complaint.status === ComplaintStatus.RESOLVED ? 'text-action-green-500' : 'text-gov-blue-500'}`}>{complaint.status}</span></div>
                <div><strong className="text-neutral-dark-gray">Category:</strong> {complaint.category}</div>
                <div><strong className="text-neutral-dark-gray">Submitted:</strong> {complaint.submittedAt.toLocaleDateString()}</div>
            </div>
            
            <div className="space-y-4">
                <p className="text-gray-700 bg-neutral-light-gray p-4 rounded-lg"><strong className="block text-neutral-dark-gray mb-1">Your Description:</strong>{complaint.description}</p>
                {complaint.aiSummary && (
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg"><strong className="block text-gov-blue-900 mb-1">AI Summary:</strong>{complaint.aiSummary}</p>
                )}
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {complaint.photoBeforeUrl && (
                    <div>
                        <h3 className="font-bold text-neutral-dark-gray mb-2">Before</h3>
                        <img src={complaint.photoBeforeUrl} alt="Before" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                    </div>
                )}
                {complaint.photoAfterUrl && (
                     <div>
                        <h3 className="font-bold text-neutral-dark-gray mb-2">After</h3>
                        <img src={complaint.photoAfterUrl} alt="After" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                    </div>
                )}
            </div>
            
            <h2 className="text-2xl font-bold text-gov-blue-900 mt-8 mb-4">Status History</h2>
            <ComplaintHistoryTimeline history={complaint.history} />

            {complaint.status === ComplaintStatus.RESOLVED && (
                <div className="mt-8 pt-6 border-t border-neutral-gray bg-gov-blue-500/10 p-6 rounded-lg">
                    {satisfactionResponse === null ? (
                        <>
                            <h3 className="text-xl font-bold text-neutral-dark-gray mb-4 text-center">The administration has marked this issue as resolved. Are you satisfied with the resolution?</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button variant="secondary" onClick={() => setSatisfactionResponse('yes')} disabled={actionLoading}>Yes, I am satisfied</Button>
                                <Button variant="warning" onClick={() => handleCitizenAction('reopen')} disabled={actionLoading}>No, Reopen Issue</Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-neutral-dark-gray mb-4 text-center">Thank you for your confirmation!</h3>
                            <p className="text-center text-gray-700 mb-6">Uploading a photo of the resolution helps us verify the work and maintain records.</p>
                            
                            <div className="max-w-md mx-auto">
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
                        </>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackStatusPage;
