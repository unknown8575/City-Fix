import React, { useState, useMemo } from 'react';
import { Complaint } from '../types';
import { DEPARTMENTS } from '../constants';
import Button from './Button';
import Input from './Input';
import { XMarkIcon } from '../constants';

interface DepartmentAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onAssign: (complaintId: string, department: string) => void;
  isAssigning: boolean;
}

const DepartmentAssignModal: React.FC<DepartmentAssignModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onAssign,
  isAssigning
}) => {
  const [filter, setFilter] = useState('');

  const filteredDepartments = useMemo(() =>
    DEPARTMENTS.filter(dept => dept.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  );
  
  if (!isOpen || !complaint) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 max-h-[70vh] flex flex-col animated-section"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-neutral-gray">
          <h2 className="text-xl font-bold text-neutral-dark-gray">Assign Dept for {complaint.id}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-full hover:bg-neutral-gray">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </header>

        <div className="p-4">
          <Input
            id="dept-search"
            label=""
            placeholder="Search departments..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="p-4 pt-0 overflow-y-auto">
          <ul className="space-y-2">
            {filteredDepartments.map(dept => (
              <li key={dept}>
                <button
                  onClick={() => onAssign(complaint.id, dept)}
                  disabled={isAssigning}
                  className={`w-full text-left p-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    complaint.escalationDept === dept
                      ? 'bg-gov-blue-500 text-white font-semibold'
                      : 'bg-neutral-light-gray hover:bg-neutral-gray'
                  }`}
                >
                  {dept}
                </button>
              </li>
            ))}
            {filteredDepartments.length === 0 && (
                 <li className="text-center text-gray-500 p-4">No departments found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAssignModal;
