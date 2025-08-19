'use client';

import { useState, useRef, useEffect } from 'react';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  variables: VariableDeclaration[];
  expectedType?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  placeholder?: string;
  className?: string;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  onChange,
  variables,
  expectedType,
  placeholder = "Enter value or select variable",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter variables by expected type and search term
  // Always include object variables so users can pick their properties even when expectedType is 'string'/'number'
  const filteredVariables = variables
    .filter(v => !expectedType || v.type === expectedType || v.type === 'object')
    .filter(v => !searchTerm || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );





  const handleVariableSelect = (variableName: string, propertyPath?: string) => {

    const fullPath = propertyPath ? `${variableName}.${propertyPath}` : variableName;
    setInputValue(fullPath);
    onChange(fullPath);
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only close if the focus is not moving to an element inside the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (dropdownRef.current && !dropdownRef.current.contains(relatedTarget)) {
      setTimeout(() => {
        setIsOpen(false);
        setSearchTerm('');
      }, 150);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent dropdown from closing on scroll and other interactions
  const handleDropdownInteraction = (e: React.MouseEvent | React.UIEvent) => {
    // Stop bubbling outside, but do not preventDefault here to avoid canceling click synthesis
    e.stopPropagation();
  };

  const getInputBorderColor = () => {
    if (!inputValue) return 'border-gray-600';
    
    // Convert to string for comparison
    const stringValue = String(inputValue);
    if (!stringValue || !stringValue.trim()) return 'border-gray-600';
    
    const trimmedValue = stringValue.trim();
    
    // Check if it's a declared variable
    const matchingVariable = variables.find(v => v.name === trimmedValue);
    if (matchingVariable) {
      if (expectedType && matchingVariable.type !== expectedType) {
        return 'border-orange-500'; // Type mismatch
      }
      return 'border-green-500'; // Valid variable
    }
    
    // For now, assume any non-variable value is valid
    return 'border-blue-500';
  };

  const getInputTextColor = () => {
    if (!inputValue) return 'text-white';
    
    // Convert to string for comparison
    const stringValue = String(inputValue);
    if (!stringValue || !stringValue.trim()) return 'text-white';
    
    const trimmedValue = stringValue.trim();
    
    // Check if it's a declared variable
    const matchingVariable = variables.find(v => v.name === trimmedValue);
    if (matchingVariable) {
      if (expectedType && matchingVariable.type !== expectedType) {
        return 'text-orange-300'; // Type mismatch
      }
      return 'text-green-300'; // Valid variable
    }
    
    // For now, assume any non-variable value is valid
    return 'text-blue-300';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Select Button */}
             <button
         type="button"
         onClick={(e) => {
           e.preventDefault();
           e.stopPropagation();
           setIsOpen(!isOpen);
         }}
         onBlur={handleBlur}
         className={`w-full bg-gray-700 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${getInputBorderColor()} ${getInputTextColor()}`}
       >
        <div className="flex items-center justify-between">
          <span className={inputValue ? 'text-white' : 'text-gray-400'}>
            {inputValue || placeholder}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                     <div onScroll={handleDropdownInteraction} onMouseDown={handleDropdownInteraction}>
            {/* Search/Filter Option */}
            <div className="p-2 border-b border-gray-600">
                             <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search variables..."
                 className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                 onFocus={(e) => e.stopPropagation()}
                 onMouseDown={(e) => e.stopPropagation()}
                 onClick={(e) => e.stopPropagation()}
               />
            </div>
            
            {/* Variables List */}
            {filteredVariables.map((variable) => (
              <div key={variable.name}>
                {/* Variable Option */}
                 <div
                   className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-600"
                    onClick={() => handleVariableSelect(variable.name)}
                    onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                 >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{variable.name}</span>
                      {variable.description && (
                        <div className="text-xs text-gray-400">{variable.description}</div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">({variable.type})</span>
                  </div>
                </div>
                
                {/* Object Properties (if variable is object type) */}
                {variable.type === 'object' && variable.defaultValue && (
                  <div className="bg-gray-900">
                    {(() => {
                      try {
                        const obj = JSON.parse(variable.defaultValue);
                        return Object.keys(obj).map(property => (
                                                     <div
                             key={`${variable.name}.${property}`}
                             className="px-6 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 text-sm border-l-2 border-blue-500 ml-2"
                              onClick={() => handleVariableSelect(variable.name, property)}
                              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                           >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-blue-400 mr-2">└─</span>
                                <span className="font-medium">{property}</span>
                                <span className="text-gray-500 ml-2">:</span>
                                <span className="text-gray-400 ml-1">
                                  {typeof obj[property] === 'object' ? 'object' : String(obj[property])}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">property</span>
                            </div>
                          </div>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                )}
              </div>
            ))}
            
            {/* No variables message */}
            {filteredVariables.length === 0 && (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No variables available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeSelector; 