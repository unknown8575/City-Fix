import React from 'react';
import { Complaint } from '../types';
import ComplaintHistoryTimeline from './ComplaintHistoryTimeline';
import { ExclamationTriangleIcon, CheckCircleIcon, LightBulbIcon } from '../constants';

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
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-gov-blue-900">AI Insights (XAI)</h3>
            <p className="text-sm text-gray-600">Explainable AI analysis to aid in decision-making.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* AI Summary */}
            {complaint.aiSummary && (
                <div className="bg-white p-4 rounded-lg border border-neutral-gray">
                    <h4 className="font-semibold text-neutral-dark-gray mb-2">AI Summary</h4>
                    <blockquote className="text-neutral-dark-gray italic border-l-4 border-gov-blue-500 pl-4">
                        {complaint.aiSummary}
                    </blockquote>
                </div>
            )}
            
            {/* AI Recommendation */}
            {complaint.aiActionRecommendation && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Action Recommendation</h4>
                        <p className="text-yellow-900">{complaint.aiActionRecommendation}</p>
                    </div>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Triage */}
            <div className="space-y-3">
                <h4 className="font-semibold text-neutral-dark-gray mb-2">Triage Suggestions</h4>
                <div className="flex items-center gap-2">
                    <strong className="text-gray-600 text-sm min-w-[120px]">Suggested Dept:</strong>
                    <span className="font-semibold text-gov-blue-900">{complaint.escalationDept || 'N/A'}</span>
                </div>
                {complaint.aiPriority && (
                    <div className="flex items-center gap-2">
                        <strong className="text-gray-600 text-sm min-w-[120px]">Priority Level:</strong>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.aiPriority)}`}>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            {complaint.aiPriority}
                        </span>
                    </div>
                )}
                {complaint.aiRelevanceFlag && (
                    <div className="flex items-center gap-2">
                        <strong className="text-gray-600 text-sm min-w-[120px]">Relevance Flag:</strong>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getRelevanceColor(complaint.aiRelevanceFlag)}`}>
                            {complaint.aiRelevanceFlag === 'Actionable' && <CheckCircleIcon className="w-4 h-4" />}
                            {complaint.aiRelevanceFlag}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Justification */}
            {complaint.aiJustification && (
                <div>
                     <h4 className="font-semibold text-neutral-dark-gray mb-2">Justification</h4>
                     <p className="text-sm text-gray-700">{complaint.aiJustification}</p>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-200">
            {/* Confidence */}
            {complaint.aiConfidence && (
                <div>
                    <h4 className="font-semibold text-neutral-dark-gray mb-2">Confidence Score</h4>
                    <div className="flex items-center gap-3">
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div className="bg-gov-blue-500 h-2.5 rounded-full" style={{ width: `${complaint.aiConfidence}%` }}></div>
                        </div>
                        <span className="font-bold text-gov-blue-900">{complaint.aiConfidence}%</span>
                    </div>
                </div>
            )}
             {/* Duplicate */}
            {complaint.isDuplicateOf && (
                <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Duplicate Detected</h4>
                    <p className="text-sm text-orange-700">
                        This complaint seems similar to ticket <span className="font-bold">{complaint.isDuplicateOf}</span>.
                    </p>
                </div>
            )}
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