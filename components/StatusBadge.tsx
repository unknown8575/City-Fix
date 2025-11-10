import React from 'react';
import { ComplaintStatus } from '../types';
import { DocumentTextIcon, CogIcon, SparklesIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '../constants';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusConfig = {
        [ComplaintStatus.PENDING]: { Icon: DocumentTextIcon, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
        [ComplaintStatus.SUBMITTED]: { Icon: DocumentTextIcon, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Submitted' },
        [ComplaintStatus.IN_PROGRESS]: { Icon: CogIcon, color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Progress' },
        [ComplaintStatus.REOPENED]: { Icon: ExclamationTriangleIcon, color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Reopened' },
        [ComplaintStatus.RESOLVED]: { Icon: SparklesIcon, color: 'bg-green-100 text-green-800 border-green-300', label: 'Resolved' },
        [ComplaintStatus.CLOSED]: { Icon: CheckCircleIcon, color: 'bg-gray-200 text-gray-800 border-gray-300', label: 'Closed' },
        [ComplaintStatus.DUPLICATE]: { Icon: ExclamationCircleIcon, color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Duplicate' },
    };

    const config = statusConfig[status] || statusConfig[ComplaintStatus.PENDING];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.color}`}>
            <config.Icon className="w-4 h-4" />
            {config.label}
        </span>
    );
};

export default StatusBadge;