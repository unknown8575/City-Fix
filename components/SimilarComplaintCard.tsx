import React from 'react';
import { Complaint } from '../types';
import { ClockIcon, MapPinIcon } from '../constants';

interface SimilarComplaintCardProps {
    complaint: Complaint;
}

const SimilarComplaintCard: React.FC<SimilarComplaintCardProps> = ({ complaint }) => {
    const resolutionTime = () => {
        if (!complaint.resolvedAt) return 'N/A';
        const diff = complaint.resolvedAt.getTime() - complaint.submittedAt.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-gray overflow-hidden">
            <div className="p-4">
                <p className="font-bold text-gov-blue-900">{complaint.category}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1.5" />
                    <span>{complaint.location}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-neutral-gray">
                {complaint.photoBeforeUrl && (
                    <div className="relative">
                        <img src={complaint.photoBeforeUrl} alt="Before resolution" className="w-full h-32 object-cover" />
                        <span className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">Before</span>
                    </div>
                )}
                {complaint.photoAfterUrl && (
                    <div className="relative">
                        <img src={complaint.photoAfterUrl} alt="After resolution" className="w-full h-32 object-cover" />
                         <span className="absolute top-1 left-1 bg-action-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">After</span>
                    </div>
                )}
            </div>
            <div className="p-3 bg-neutral-light-gray/70 flex justify-between items-center text-sm">
                <span className="font-semibold text-action-green-500">Resolved</span>
                <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    <span>{resolutionTime()}</span>
                </div>
            </div>
        </div>
    );
};

export default SimilarComplaintCard;
