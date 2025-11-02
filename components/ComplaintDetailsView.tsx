import React from 'react';
import { Complaint } from '../types';
import ComplaintHistoryTimeline from './ComplaintHistoryTimeline';
import { ExclamationTriangleIcon, CheckCircleIcon } from '../constants';

interface ComplaintDetailsViewProps {
  complaint: Complaint;
}

const getPriorityColor = (priority?: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
        case 'High': return 'bg-red-500 text-white';
        case 'Medium': return 'bg-yellow-500 text-black';
        case 'Low': return 'bg-action-green-500 text-white';
        default: return 'bg-neutral-gray text-black';
    }
};

const getRelevanceColor = (relevance?: 'Actionable' | 'Normal Complaint') => {
    switch (relevance) {
        case 'Actionable': return 'bg-action-green-500 text-white';
        case 'Normal Complaint': return 'bg-gray-400 text-white';
        default: return 'bg-neutral-gray text-black';
    }
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <h4 className="text-sm font-semibold text-gray-500">{label}</h4>
        <div className="text-neutral-dark-gray text-base break-words">{children}</div>
    </div>
);


const ComplaintDetailsView: React.FC<ComplaintDetailsViewProps> = ({ complaint }) => {
  return (
    <div className="space-y-6">
      {/* Main Details */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gov-blue-900 mb-4 border-b pb-2">Complaint Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Category">{complaint.category}</DetailItem>
            <DetailItem label="Contact">{complaint.contact}</DetailItem>
            <DetailItem label="Location">{complaint.location}</DetailItem>
            <DetailItem label="Submitted">{complaint.submittedAt.toLocaleString()}</DetailItem>
            <DetailItem label="Description" fullWidth>{complaint.description}</DetailItem>
        </div>
      </div>
      
      {/* AI Insights Section */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gov-blue-900 mb-4 border-b border-blue-200 pb-2">AI Insights (XAI)</h3>
        <div className="space-y-3 text-sm">
            {complaint.aiSummary && <p><strong>Summary:</strong> {complaint.aiSummary}</p>}
            {complaint.aiActionRecommendation && <p><strong>Recommendation:</strong> {complaint.aiActionRecommendation}</p>}
            <div className="flex items-center gap-6 flex-wrap pt-2">
                {complaint.aiPriority && (
                    <div className="flex items-center gap-2">
                        <strong className="text-gray-600">Priority:</strong>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.aiPriority)}`}>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            {complaint.aiPriority}
                        </span>
                    </div>
                )}
                {complaint.aiRelevanceFlag && (
                    <div className="flex items-center gap-2">
                        <strong className="text-gray-600">Relevance:</strong>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRelevanceColor(complaint.aiRelevanceFlag)}`}>
                            {complaint.aiRelevanceFlag === 'Actionable' && <CheckCircleIcon className="w-4 h-4" />}
                            {complaint.aiRelevanceFlag}
                        </span>
                    </div>
                )}
            </div>
            {complaint.aiJustification && <p><strong>Justification:</strong> {complaint.aiJustification}</p>}
            {complaint.escalationDept && <p><strong>Suggested Dept:</strong> {complaint.escalationDept}</p>}
            {complaint.isDuplicateOf && (
                <p className="text-warning-orange-500 font-semibold">
                    <strong>Duplicate Detected:</strong> Similar to {complaint.isDuplicateOf}
                </p>
            )}
            {complaint.aiConfidence && <p><strong>Confidence Score:</strong> {complaint.aiConfidence}%</p>}
        </div>
      </div>
      
      {/* Photo Evidence Section */}
      {(complaint.photoBeforeUrl || complaint.photoAfterUrl) && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gov-blue-900 mb-4 border-b pb-2">Evidence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complaint.photoBeforeUrl && (
                  <div>
                      <h4 className="font-bold text-sm text-neutral-dark-gray mb-1">Before</h4>
                      <img src={complaint.photoBeforeUrl} alt="Before" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                  </div>
              )}
              {complaint.photoAfterUrl && (
                   <div>
                      <h4 className="font-bold text-sm text-neutral-dark-gray mb-1">After</h4>
                      <img src={complaint.photoAfterUrl} alt="After" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                  </div>
              )}
          </div>
        </div>
      )}

      {/* History Timeline Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gov-blue-900 mb-4 border-b pb-2">History Timeline</h3>
        <ComplaintHistoryTimeline history={complaint.history} />
      </div>
    </div>
  );
};

export default ComplaintDetailsView;