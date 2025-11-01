
import React from 'react';
import Button from './Button';

interface LanguageToggleProps {
  currentLang: string;
  onToggle: (lang: string) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant={currentLang === 'en' ? 'primary' : 'outline'}
        onClick={() => onToggle('en')}
        className="text-sm px-4 py-2"
        aria-label="Switch to English language"
        aria-pressed={currentLang === 'en'}
      >
        English
      </Button>
      <Button
        variant={currentLang === 'hi' ? 'primary' : 'outline'}
        onClick={() => onToggle('hi')}
        className="text-sm px-4 py-2 font-sans"
        aria-label="Switch to Hindi language"
        aria-pressed={currentLang === 'hi'}
      >
        हिंदी
      </Button>
    </div>
  );
};

export default LanguageToggle;
