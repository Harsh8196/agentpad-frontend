'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface VariableSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableVariables: string[];
  onAddVariable: (variableName: string) => void;
  placeholder?: string;
  className?: string;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
  value,
  onChange,
  availableVariables,
  onAddVariable,
  placeholder = "Select or create variable",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    const handleScroll = () => {
      // Don't close dropdown on scroll, just reposition if needed
      if (isOpen && dropdownRef.current) {
        // The dropdown will automatically reposition due to CSS positioning
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleSelect = (variable: string) => {
    onChange(variable);
    setInputValue(variable);
    setIsOpen(false);
    setIsCreating(false);
  };

  const handleCreate = () => {
    const trimmedValue = inputValue.trim();
    const isVariableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedValue);
    
    if (trimmedValue && isVariableName && !availableVariables.includes(trimmedValue)) {
      onAddVariable(trimmedValue);
      onChange(trimmedValue);
      setIsOpen(false);
      setIsCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Check if the input looks like a variable name (starts with letter, contains only letters, numbers, underscore)
    const isVariableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newValue.trim());
    
    if (newValue.trim() && isVariableName && !availableVariables.includes(newValue.trim())) {
      setIsCreating(true);
    } else {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCreating) {
        handleCreate();
      } else if (inputValue.trim()) {
        handleSelect(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsCreating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {availableVariables.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Available Variables</div>
              {availableVariables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => handleSelect(variable)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {variable}
                </button>
              ))}
            </div>
          )}

          {isCreating && (
            <div className="border-t border-gray-700 p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Create New Variable</div>
              <button
                onClick={handleCreate}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create "{inputValue.trim()}"</span>
              </button>
            </div>
          )}

          {availableVariables.length === 0 && !isCreating && (
            <div className="p-3 text-center text-gray-400 text-sm">
              No variables available. Type to create a new one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariableSelector; 