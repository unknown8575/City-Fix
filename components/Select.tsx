import React, { useState, useRef, useEffect, KeyboardEvent, useCallback, useMemo } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '../constants';

interface SelectProps {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ id, label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filter, setFilter] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  
  const filteredOptions = useMemo(() => 
    options.filter(option => option.toLowerCase().includes(filter.toLowerCase())),
    [options, filter]
  );

  const handleSelect = useCallback((option: string) => {
    onChange(option);
    setFilter('');
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onChange]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (isOpen) {
        setHighlightedIndex(0);
        setTimeout(() => filterInputRef.current?.focus(), 100);
    } else {
        setFilter('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current?.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter': case ' ': e.preventDefault(); setIsOpen(prev => !prev); break;
      case 'ArrowUp': case 'ArrowDown': e.preventDefault(); setIsOpen(true); break;
      case 'Escape': setIsOpen(false); break;
    }
  };
  
  const handleListKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
            break;
        case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            if(highlightedIndex >= 0) handleSelect(filteredOptions[highlightedIndex]);
            break;
        case 'Escape':
            setIsOpen(false);
            buttonRef.current?.focus();
            break;
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <label htmlFor={id} className="block text-neutral-dark-gray text-sm font-medium mb-1">
        {label}
      </label>
      <button
        type="button" id={id} ref={buttonRef} onClick={() => setIsOpen(!isOpen)} onKeyDown={handleKeyDown}
        className="form-input mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-gov-blue-500/50 border-neutral-gray flex justify-between items-center"
        aria-haspopup="listbox" aria-expanded={isOpen}
      >
        <span className={value ? 'text-black' : 'text-gray-500'}>{value || placeholder}</span>
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div 
          onKeyDown={handleListKeyDown}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5"
        >
          <div className="p-2">
            <input
              ref={filterInputRef}
              type="text"
              placeholder="Search municipality..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setHighlightedIndex(0);
              }}
              className="form-input block w-full px-3 py-1.5 border rounded-md shadow-sm border-neutral-gray focus:ring-gov-blue-500/50 focus:outline-none sm:text-sm"
            />
          </div>
          <ul
            ref={listRef}
            className="max-h-56 py-1 text-base overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1} role="listbox" aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
          >
            {filteredOptions.length > 0 ? filteredOptions.map((option, index) => (
              <li
                key={option} id={`${id}-option-${index}`} onClick={() => handleSelect(option)} onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer select-none relative py-2 pl-4 pr-9 ${highlightedIndex === index ? 'bg-gov-blue-500 text-white' : 'text-gray-900'}`}
                role="option" aria-selected={value === option}
              >
                <span className={`block truncate ${value === option ? 'font-semibold' : 'font-normal'}`}>{option}</span>
                {value === option && (
                  <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? 'text-white' : 'text-gov-blue-500'}`}>
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            )) : (
              <li className="text-gray-500 cursor-default select-none relative py-2 px-4">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
