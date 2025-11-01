import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '../types';
import Button from './Button';
import { XMarkIcon } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState<NotificationSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 animated-section">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-dark-gray">Notification Settings</h2>
          <button onClick={onClose} aria-label="Close settings modal">
            <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-black" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-neutral-light-gray rounded-md">
            <label htmlFor="newComplaint" className="font-medium text-neutral-dark-gray">Notify on new complaints</label>
            <input type="checkbox" id="newComplaint" checked={settings.newComplaint} onChange={() => handleToggle('newComplaint')} className="h-5 w-5 rounded text-gov-blue-500 focus:ring-gov-blue-500"/>
          </div>
          <div className="flex justify-between items-center p-3 bg-neutral-light-gray rounded-md">
            <label htmlFor="statusChange" className="font-medium text-neutral-dark-gray">Notify on status changes</label>
            <input type="checkbox" id="statusChange" checked={settings.statusChange} onChange={() => handleToggle('statusChange')} className="h-5 w-5 rounded text-gov-blue-500 focus:ring-gov-blue-500"/>
          </div>
          <div className="flex justify-between items-center p-3 bg-neutral-light-gray rounded-md">
            <label htmlFor="slaBreach" className="font-medium text-neutral-dark-gray">Notify on potential SLA breaches</label>
            <input type="checkbox" id="slaBreach" checked={settings.slaBreach} onChange={() => handleToggle('slaBreach')} className="h-5 w-5 rounded text-gov-blue-500 focus:ring-gov-blue-500"/>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
