
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { Complaint, ComplaintStatus } from '../types';
import { fetchComplaintById } from '../services/complaintService';
import ComplaintProgressStepper from '../components/ComplaintProgressStepper';
import ComplaintHistoryTimeline from '../components/ComplaintHistoryTimeline';


const TrackStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('ticketId') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!ticketId) {
      setError('Please enter a valid Ticket ID.');
      return;
    }
    setLoading(true);
    setError('');
    setComplaint(null);
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md animated-section">
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
        <div className="bg-neutral-white p-6 sm:p-8 rounded-lg shadow-md mt-8 animated-section">
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

             {complaint.status !== ComplaintStatus.RESOLVED && complaint.status !== ComplaintStatus.CLOSED && (
                <div className="mt-8 pt-6 border-t border-neutral-gray text-center">
                    <h3 className="text-xl font-bold text-neutral-dark-gray mb-4">Is the issue resolved to your satisfaction?</h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="secondary">Mark as Resolved</Button>
                        <Button variant="outline">Upload Resolution Photo</Button>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackStatusPage;