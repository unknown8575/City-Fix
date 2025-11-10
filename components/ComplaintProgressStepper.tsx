import React from 'react';
import { ComplaintStatus } from '../types';
import { CheckCircleIcon } from '../constants';

interface ComplaintProgressStepperProps {
    status: ComplaintStatus;
}

const ComplaintProgressStepper: React.FC<ComplaintProgressStepperProps> = ({ status }) => {
    const steps = [
        { status: ComplaintStatus.PENDING, label: 'Submitted', percentage: '0%' },
        { status: ComplaintStatus.IN_PROGRESS, label: 'In Progress', percentage: '50%' },
        { status: ComplaintStatus.RESOLVED, label: 'Resolved', percentage: '100%' },
    ];
    
    // Visually treat 'Reopened' as 'In Progress'
    const effectiveStatus = status === ComplaintStatus.REOPENED ? ComplaintStatus.IN_PROGRESS : status;
    let currentStatusIndex = steps.findIndex(step => step.status === effectiveStatus);
    
    // If status is closed, it's fully complete
    if (status === ComplaintStatus.CLOSED) {
        currentStatusIndex = steps.length - 1;
    }
    // If it's a legacy status, default to the start.
    if (currentStatusIndex === -1) {
        currentStatusIndex = 0;
    }

    return (
        <div className="w-full px-4 sm:px-8">
            <div className="flex items-start">
                {steps.map((step, index) => {
                    const isActive = index === currentStatusIndex;
                    const isCompleted = index < currentStatusIndex || status === ComplaintStatus.CLOSED;
                    
                    return (
                        <React.Fragment key={step.status}>
                            <div className="flex flex-col items-center text-center w-1/3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${isCompleted ? 'bg-action-green-500 text-white' : ''}
                                    ${isActive ? 'bg-gov-blue-500 text-white ring-4 ring-gov-blue-500/30' : ''}
                                    ${!isCompleted && !isActive ? 'bg-neutral-gray text-neutral-dark-gray' : ''}
                                `}>
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : <span className="font-bold">{index + 1}</span>}
                                </div>
                                <p className={`mt-2 text-xs sm:text-sm font-medium ${isActive || isCompleted ? 'text-neutral-dark-gray' : 'text-gray-500'}`}>
                                    {step.status === ComplaintStatus.IN_PROGRESS && status === ComplaintStatus.REOPENED ? 'Reopened' : step.label}
                                </p>
                                <p className={`text-xs ${isActive ? 'text-gov-blue-500' : 'text-gray-400'}`}>
                                    {step.percentage} Complete
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-auto border-t-4 transition-colors duration-300 mt-5 ${isCompleted ? 'border-action-green-500' : 'border-neutral-gray'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ComplaintProgressStepper;