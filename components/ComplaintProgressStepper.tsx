
import React from 'react';
import { ComplaintStatus } from '../types';
import { CheckCircleIcon } from '../constants';

interface ComplaintProgressStepperProps {
    status: ComplaintStatus;
}

const ComplaintProgressStepper: React.FC<ComplaintProgressStepperProps> = ({ status }) => {
    const steps = [ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED];
    const currentStatusIndex = steps.indexOf(status);

    return (
        <div className="w-full px-4 sm:px-8">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    // Treat "Submitted" status as being on the "Pending" step visually.
                    const isActive = (index === currentStatusIndex) || (status === ComplaintStatus.SUBMITTED && step === ComplaintStatus.PENDING);
                    const isCompleted = index < currentStatusIndex || status === ComplaintStatus.CLOSED || (status === ComplaintStatus.RESOLVED && index < steps.length) ;
                    
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${isCompleted ? 'bg-action-green-500 text-white' : ''}
                                    ${isActive ? 'bg-gov-blue-500 text-white ring-4 ring-gov-blue-500/30' : ''}
                                    ${!isCompleted && !isActive ? 'bg-neutral-gray text-neutral-dark-gray' : ''}
                                `}>
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" /> : <span className="font-bold">{index + 1}</span>}
                                </div>
                                <p className={`mt-2 text-xs sm:text-sm font-medium ${isActive || isCompleted ? 'text-neutral-dark-gray' : 'text-gray-500'}`}>
                                    {step}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-auto border-t-4 transition-colors duration-300 ${isCompleted ? 'border-action-green-500' : 'border-neutral-gray'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ComplaintProgressStepper;