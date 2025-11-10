import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import Button from './Button';
import { StarIcon, ExclamationTriangleIcon, ClipboardDocumentIcon, CheckIcon } from '../constants';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange: (id: string, newStatus: ComplaintStatus) => void;
  onViewDetails: () => void;
  onRequestFeedback: () => void;
  onAssignDepartment: (id: string, department: string) => void;
  onOpenAssignModal: (complaint: Complaint) => void;
  isFeedbackLoading?: boolean;
  isUpdatingStatus?: boolean;
  isAssigning?: boolean;
  assigningTo?: string;
}

const getStatusColorClass = (status: ComplaintStatus) => {
    switch(status) {
        case ComplaintStatus.PENDING: return 'bg-yellow-500';
        case ComplaintStatus.IN_PROGRESS: return 'bg-gov-blue-500';
        case ComplaintStatus.REOPENED: return 'bg-orange-600';
        case ComplaintStatus.RESOLVED: return 'bg-action-green-500';
        case ComplaintStatus.CLOSED: return 'bg-neutral-dark-gray';
        case ComplaintStatus.DUPLICATE: return 'bg-orange-500';
        default: return 'bg-gray-400';
    }
}

const getPriorityInfo = (priority: 'High' | 'Medium' | 'Low') => {
    switch(priority) {
        case 'High': return { colorClass: 'bg-red-100 text-red-800', Icon: ExclamationTriangleIcon };
        case 'Medium': return { colorClass: 'bg-yellow-100 text-yellow-800', Icon: ExclamationTriangleIcon };
        case 'Low': return { colorClass: 'bg-green-100 text-green-800', Icon: null };
        default: return { colorClass: 'bg-gray-100 text-gray-800', Icon: null };
    }
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
    complaint, 
    onStatusChange, 
    onViewDetails, 
    onRequestFeedback, 
    isFeedbackLoading, 
    isUpdatingStatus,
    onAssignDepartment,
    onOpenAssignModal,
    isAssigning,
    assigningTo,
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const relevanceColor = complaint.aiRelevanceFlag === 'Actionable' ? 'text-action-green-500' : 'text-gray-500';
    const TOP_DEPARTMENTS = ['Sanitation Dept.', 'Public Works Dept.', 'Water Board'];

    const handleCopyInsights = () => {
        const insightsText = `
AI Insights for Ticket: ${complaint.id}
---------------------------------
Summary: ${complaint.aiSummary || 'N/A'}
Suggested Department: ${complaint.escalationDept || 'N/A'}
Priority: ${complaint.aiPriority || 'N/A'}
Justification: ${complaint.aiJustification || 'N/A'}
Recommendation: ${complaint.aiActionRecommendation || 'N/A'}
        `.trim().replace(/^\s+/gm, '');

        navigator.clipboard.writeText(insightsText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy AI insights: ', err);
        });
    };
    
    const priorityInfo = complaint.aiPriority ? getPriorityInfo(complaint.aiPriority) : null;

    return (
        <div className="bg-neutral-white rounded-lg shadow-sm border-l-4 border-gov-blue-500 transition-all duration-300 flex flex-col">
            <div className="p-4 flex-grow">
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

                <div className="mt-3 p-3 bg-blue-50/70 rounded-md border border-blue-100 space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gov-blue-900">AI Triage Details</h4>
                        <button 
                            onClick={handleCopyInsights} 
                            className="text-gray-500 hover:text-gov-blue-900 transition-colors p-1 rounded-md disabled:opacity-50"
                            aria-label="Copy AI Insights"
                            title="Copy AI Insights"
                        >
                            {isCopied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                        </button>
                    </div>
                    
                    {priorityInfo && (
                        <div className="flex items-start gap-2">
                            <strong className="text-xs text-gray-600 min-w-[70px] pt-0.5">Priority:</strong>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${priorityInfo.colorClass}`}>
                                {priorityInfo.Icon && <priorityInfo.Icon className="w-3 h-3" />}
                                {complaint.aiPriority}
                            </span>
                        </div>
                    )}

                    {complaint.aiJustification && (
                        <div className="flex items-start gap-2">
                            <strong className="text-xs text-gray-600 min-w-[70px]">Justification:</strong>
                            <p className="text-xs text-gray-700">{complaint.aiJustification}</p>
                        </div>
                    )}
                </div>

                <div className="text-xs text-gray-500 mt-3">
                    <p><strong>Location:</strong> {complaint.location}</p>
                    <p><strong>Assigned Dept:</strong> {complaint.escalationDept || 'N/A'}</p>
                    <p><strong>Submitted:</strong> {complaint.submittedAt.toLocaleString()}</p>
                </div>
            </div>
            <div className="p-4 mt-auto bg-neutral-light-gray/50 border-t border-neutral-gray space-y-3">
                <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                        Quick Assign Dept:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {TOP_DEPARTMENTS.map(dept => (
                            <Button
                                key={dept}
                                variant={complaint.escalationDept === dept ? 'primary' : 'outline'}
                                className="!py-1 !px-2 text-xs flex-grow sm:flex-grow-0"
                                onClick={() => onAssignDepartment(complaint.id, dept)}
                                disabled={isUpdatingStatus || isAssigning || isFeedbackLoading}
                            >
                                {isAssigning && assigningTo === dept ? '...' : dept.replace(' Dept.', '')}
                            </Button>
                        ))}
                         <Button
                            variant="ghost"
                            className="!py-1 !px-2 text-xs flex-grow sm:flex-grow-0"
                            onClick={() => onOpenAssignModal(complaint)}
                            disabled={isUpdatingStatus || isAssigning || isFeedbackLoading}
                        >
                            More...
                        </Button>
                    </div>
                </div>
                <div className="pt-3 border-t border-neutral-gray flex items-center justify-between gap-2">
                     <Button variant="ghost" className="!py-1 !px-2 text-xs" onClick={onViewDetails}>
                        View Details
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {complaint.status === ComplaintStatus.PENDING && (
                            <Button variant="outline" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.IN_PROGRESS)} disabled={isUpdatingStatus || isAssigning}>
                                {isUpdatingStatus ? 'Starting...' : 'Start Work'}
                            </Button>
                        )}
                        {(complaint.status === ComplaintStatus.IN_PROGRESS || complaint.status === ComplaintStatus.REOPENED) && (
                            <Button variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.RESOLVED)} disabled={isUpdatingStatus || isAssigning}>
                                {isUpdatingStatus ? 'Resolving...' : 'Mark Resolved'}
                            </Button>
                        )}
                        {complaint.status === ComplaintStatus.RESOLVED && (
                             <>
                                {!complaint.citizenSatisfactionScore ? (
                                    <Button variant="primary" className="!py-1 !px-2 text-xs" onClick={onRequestFeedback} disabled={isFeedbackLoading || isUpdatingStatus || isAssigning}>
                                        {isFeedbackLoading ? 'Sending...' : 'Request Feedback'}
                                    </Button>
                                ) : (
                                    <div className="text-xs font-semibold text-gray-700 flex items-center">
                                        Feedback: {complaint.citizenSatisfactionScore}/5 <StarIcon className="w-4 h-4 text-yellow-500 ml-1" />
                                    </div>
                                )}
                                <Button variant="ghost" className="!py-1 !px-2 text-xs" onClick={() => onStatusChange(complaint.id, ComplaintStatus.CLOSED)} disabled={isUpdatingStatus || isAssigning}>
                                    {isUpdatingStatus ? 'Closing...' : 'Close Ticket'}
                                </Button>
                            </>
                        )}
                         {complaint.status === ComplaintStatus.CLOSED && complaint.citizenSatisfactionScore && (
                              <div className="text-xs font-semibold text-gray-700 flex items-center">
                                Feedback: {complaint.citizenSatisfactionScore}/5 <StarIcon className="w-4 h-4 text-yellow-500 ml-1" />
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;