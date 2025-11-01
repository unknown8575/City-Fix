import React from 'react';
import { Complaint } from '../types';
import ComplaintHistoryTimeline from './ComplaintHistoryTimeline';

interface ComplaintDetailsViewProps {
  complaint: Complaint;
}

const getPriorityColor = (priority?: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
        case 'High': return 'bg-red-500';
        case 'Medium': return 'bg-yellow-500 text-black';
        case 'Low': return 'bg-action-green-500';
        default: return 'bg-neutral-gray';
    }
};

const getRelevanceColor = (relevance?: 'Actionable' | 'Normal Complaint') => {
    switch (relevance) {
        case 'Actionable': return 'bg-action-green-500';
        case 'Normal Complaint': return 'bg-gray-400';
        default: return 'bg-neutral-gray';
    }
}

const ComplaintDetailsView: React.FC<ComplaintDetailsViewProps> = ({ complaint }) => {
  return (
    <div className="space-y-4 pt-3">
      {/* AI Insights Section */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="text-sm font-bold text-gov-blue-900 mb-2">AI Insights (XAI)</h4>
        <div className="space-y-2 text-xs">
           {complaint.aiSummary && <p><strong>Summary:</strong> {complaint.aiSummary}</p>}
           {complaint.aiActionRecommendation && <p><strong>Recommendation:</strong> {complaint.aiActionRecommendation}</p>}
           <div className="flex items-center gap-4 flex-wrap">
              {complaint.aiPriority && (
                <div className="flex items-center">
                  <strong className="mr-2">Priority:</strong>
                  <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${getPriorityColor(complaint.aiPriority)}`}>
                    {complaint.aiPriority}
                  </span>
                </div>
              )}
              {complaint.aiRelevanceFlag && (
                <div className="flex items-center">
                  <strong className="mr-2">Relevance:</strong>
                  <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${getRelevanceColor(complaint.aiRelevanceFlag)}`}>
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
        <div>
          <h4 className="text-sm font-bold text-gov-blue-900 mb-2">Evidence</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complaint.photoBeforeUrl && (
                  <div>
                      <h5 className="font-bold text-xs text-neutral-dark-gray mb-1">Before</h5>
                      <img src={complaint.photoBeforeUrl} alt="Before" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                  </div>
              )}
              {complaint.photoAfterUrl && (
                   <div>
                      <h5 className="font-bold text-xs text-neutral-dark-gray mb-1">After</h5>
                      <img src={complaint.photoAfterUrl} alt="After" className="rounded-lg shadow-sm w-full h-auto object-cover"/>
                  </div>
              )}
          </div>
        </div>
      )}

      {/* History Timeline Section */}
      <div>
        <h4 className="text-sm font-bold text-gov-blue-900 mb-2">History Timeline</h4>
        <ComplaintHistoryTimeline history={complaint.history} />
      </div>
    </div>
  );
};

export default ComplaintDetailsView;