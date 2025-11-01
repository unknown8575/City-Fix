
import React from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { DocumentTextIcon, CogIcon, SparklesIcon, CheckCircleIcon } from '../constants';

interface ComplaintHistoryTimelineProps {
  history: Complaint['history'];
}

const getStatusInfo = (status: ComplaintStatus) => {
    switch (status) {
        case ComplaintStatus.PENDING: return { Icon: DocumentTextIcon, color: 'bg-yellow-500' };
        case ComplaintStatus.SUBMITTED: return { Icon: DocumentTextIcon, color: 'bg-gray-500' };
        case ComplaintStatus.IN_PROGRESS: return { Icon: CogIcon, color: 'bg-gov-blue-500' };
        case ComplaintStatus.RESOLVED: return { Icon: SparklesIcon, color: 'bg-action-green-500' };
        case ComplaintStatus.CLOSED: return { Icon: CheckCircleIcon, color: 'bg-neutral-dark-gray' };
        default: return { Icon: DocumentTextIcon, color: 'bg-gray-500' };
    }
};

const ComplaintHistoryTimeline: React.FC<ComplaintHistoryTimelineProps> = ({ history }) => {
    return (
        <div className="mt-4">
            <ol className="relative border-l border-neutral-gray ml-3">
                {history.map((event, index) => {
                    const { Icon, color } = getStatusInfo(event.status);
                    return (
                        <li key={index} className="mb-6 ml-6">
                            <span className={`absolute flex items-center justify-center w-6 h-6 ${color} rounded-full -left-3 ring-4 ring-white`}>
                                <Icon className="w-4 h-4 text-white" />
                            </span>
                            <div className="ml-2">
                                <h3 className="font-semibold text-neutral-dark-gray text-sm">{event.status}</h3>
                                <time className="block mb-1 text-xs font-normal text-gray-500">{event.timestamp.toLocaleString()}</time>
                                <p className="text-sm font-normal text-gray-600 bg-neutral-light-gray p-2 rounded-md">{event.notes}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default ComplaintHistoryTimeline;