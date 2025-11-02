import React, { useEffect } from 'react';
import { Complaint } from '../types';
import ComplaintDetailsView from './ComplaintDetailsView';
import { XMarkIcon } from '../constants';

interface ComplaintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
}

const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({ isOpen, onClose, complaint }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !complaint) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-neutral-light-gray rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col animated-section"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex justify-between items-center p-4 border-b border-neutral-gray bg-white rounded-t-lg sticky top-0">
          <h2 className="text-xl font-bold text-gov-blue-900">Details for {complaint.id}</h2>
          <button onClick={onClose} aria-label="Close details modal" className="p-1 rounded-full hover:bg-neutral-gray">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto">
          <ComplaintDetailsView complaint={complaint} />
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsModal;
