
import React from 'react';
import { Complaint } from '../types';
import { StarIcon, ClockIcon } from '../constants';

interface LiveFeedItemProps {
  complaint: Complaint;
}

const calculateResolutionTime = (submitted: Date, resolved?: Date): string => {
    if (!resolved) return 'N/A';
    const diff = resolved.getTime() - submitted.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) {
        return `${hours.toFixed(1)} hours`;
    }
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
};

const LiveFeedItem: React.FC<LiveFeedItemProps> = ({ complaint }) => {
  const resolutionTime = calculateResolutionTime(complaint.submittedAt, complaint.resolvedAt);
  
  return (
    <div className="live-feed-item-enter bg-neutral-light-gray p-3 rounded-lg shadow-sm border border-neutral-gray">
        <div className="flex flex-col gap-2">
             <div>
                <p className="font-bold text-sm text-gov-blue-900">{complaint.category}</p>
                <p className="text-xs text-gray-600 truncate">{complaint.location}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                 {complaint.photoBeforeUrl && (
                    <div>
                        <span className="text-xs font-semibold text-gray-500">Before</span>
                        <img src={complaint.photoBeforeUrl} alt="Before" className="rounded-md w-full h-20 object-cover mt-1"/>
                    </div>
                )}
                 {complaint.photoAfterUrl && (
                    <div>
                        <span className="text-xs font-semibold text-gray-500">After</span>
                        <img src={complaint.photoAfterUrl} alt="After" className="rounded-md w-full h-20 object-cover mt-1"/>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-700 pt-2 border-t border-neutral-gray mt-2">
                <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-gov-blue-500" />
                    <span>Resolved in {resolutionTime}</span>
                </div>
                {complaint.citizenSatisfactionScore && (
                    <div className="flex items-center gap-1 font-semibold">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span>{complaint.citizenSatisfactionScore}/5</span>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default LiveFeedItem;
