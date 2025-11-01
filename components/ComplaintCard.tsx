import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import Button from './Button';
import ComplaintDetailsView from './ComplaintDetailsView';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange: (id: string, newStatus: ComplaintStatus) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const getStatusColorClass = (status: ComplaintStatus) => {
    switch(status) {
        case ComplaintStatus.PENDING: return 'bg-yellow-500';
        case ComplaintStatus.IN_PROGRESS: return 'bg-gov-blue-500';
        case ComplaintStatus.RESOLVED: return 'bg-action-green-500';
        case ComplaintStatus.CLOSED: return 'bg-neutral-dark-gray';
        case ComplaintStatus.DUPLICATE: return 'bg-orange-500';
        default: return 'bg-gray-400';
    }
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onStatusChange, isExpanded, onToggleExpand }) => {
    const relevanceColor = complaint.aiRelevanceFlag === 'Actionable' ? 'text-action-green-500' : 'text-gray-500';

    return (
        <div className={`bg-neutral-white rounded-lg shadow-sm border-l-4 ${isExpanded ? 'border-gov-blue-900' : 'border-gov-blue-500'} transition-all duration-300`}>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-gov-blue-900">{complaint.id}</p>
                        <p className="text-sm text-gray-600">{complaint.category}</p>
                    </div>
                    <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${getStatusColorClass(complaint.status)}`}>{complaint.status}</span>
                </div>
                 <p className={`mt-2 text-xs font-semibold ${relevanceColor}`}>
                    AI Flag: {complaint.aiRelevanceFlag || 'N/A'}
                </p>
                <p className="text-sm text-neutral-dark-gray mt-2">{complaint.description.substring(0, 100)}...</p>
                
                {complaint.aiSummary && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-xs font-bold text-gov-blue-900 mb-1">AI Summary</p>
                        <p className="text-sm text-neutral-dark-gray italic">"{complaint.aiSummary}"</p>
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-3 mb-3">
                    <p><strong>Location:</strong> {complaint.location}</p>
                    <p><strong>Submitted:</strong> {complaint.submittedAt.toLocaleString()}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-gray flex items-center justify-between gap-2">
                     <Button variant="ghost" className="!py-1 !px-2 text-xs" onClick={onToggleExpand}>
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </Button>
                    <div className="flex items-center gap-2">
                        {complaint.status === ComplaintStatus.PENDING && (
                            <Button variant="outline" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.IN_PROGRESS)}>Start Work</Button>
                        )}
                        {complaint.status === ComplaintStatus.IN_PROGRESS && (
                            <Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.RESOLVED)}>Mark Resolved</Button>
                        )}
                        {complaint.status === ComplaintStatus.RESOLVED && (
                            <Button variant="ghost" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.CLOSED)}>Close Ticket</Button>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-gray bg-neutral-light-gray">
                   <ComplaintDetailsView complaint={complaint} />
                </div>
            )}
        </div>
    );
};

export default ComplaintCard;
