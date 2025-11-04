import React, { useState, useEffect } from 'react';
import Button from './Button';
import { XMarkIcon, CheckIcon } from '../constants';

export interface ReportOptions {
    sections: string[];
    format: 'pdf' | 'csv';
}

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (options: ReportOptions) => void;
}

const reportSections = [
    { id: 'riskMetrics', label: 'High-Level Risk Metrics' },
    { id: 'criticalAreas', label: 'Top 5 Critical Areas' },
    { id: 'heatmap', label: 'Geospatial Heatmap Snapshot' },
    { id: 'distribution', label: 'Expected Complaint Distribution' },
    { id: 'recommendations', label: 'Actionable Recommendations' }
];

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ isOpen, onClose, onDownload }) => {
  const [selectedSections, setSelectedSections] = useState<string[]>(reportSections.map(s => s.id));
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  useEffect(() => {
    if (isOpen) {
      setSelectedSections(reportSections.map(s => s.id));
      setFormat('pdf');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSectionToggle = (id: string) => {
    setSelectedSections(prev => 
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleDownloadClick = () => {
    onDownload({ sections: selectedSections, format });
  };
  
  const isDownloadDisabled = format === 'csv' && !selectedSections.includes('criticalAreas');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col animated-section"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-neutral-gray">
          <h2 className="text-xl font-bold text-neutral-dark-gray">Download Prediction Report</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-full hover:bg-neutral-gray">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <h3 className="font-semibold text-neutral-dark-gray mb-2">Select Sections to Include:</h3>
                <div className="space-y-2">
                    {reportSections.map(section => (
                        <label key={section.id} className="flex items-center p-2 bg-neutral-light-gray rounded-md cursor-pointer hover:bg-neutral-gray">
                            <input
                                type="checkbox"
                                checked={selectedSections.includes(section.id)}
                                onChange={() => handleSectionToggle(section.id)}
                                className="h-5 w-5 rounded text-gov-blue-500 focus:ring-gov-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-neutral-dark-gray">{section.label}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-neutral-dark-gray mb-2">Choose Format:</h3>
                <div className="flex gap-4">
                    <label className={`flex items-center p-3 rounded-md cursor-pointer border-2 w-full ${format === 'pdf' ? 'border-gov-blue-500 bg-gov-blue-500/10' : 'border-neutral-gray'}`}>
                        <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="h-4 w-4 text-gov-blue-500 focus:ring-gov-blue-500"/>
                        <span className="ml-2">PDF Document</span>
                    </label>
                     <label className={`flex items-center p-3 rounded-md cursor-pointer border-2 w-full ${format === 'csv' ? 'border-gov-blue-500 bg-gov-blue-500/10' : 'border-neutral-gray'}`}>
                        <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} className="h-4 w-4 text-gov-blue-500 focus:ring-gov-blue-500"/>
                        <span className="ml-2">CSV Data</span>
                    </label>
                </div>
                {format === 'csv' && <p className="text-xs text-gray-500 mt-2">CSV format only includes data from the 'Top 5 Critical Areas' section.</p>}
            </div>
        </div>
        
        <footer className="p-4 bg-neutral-light-gray/50 border-t border-neutral-gray flex justify-end">
            <div className="flex items-center gap-4">
                 {isDownloadDisabled && <p className="text-xs text-red-500">Please select 'Top Critical Areas' for CSV.</p>}
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleDownloadClick} disabled={isDownloadDisabled}>
                    Download
                </Button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default DownloadReportModal;
