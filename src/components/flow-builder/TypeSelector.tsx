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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter variables by expected type if specified
  const filteredVariables = expectedType 
    ? variables.filter(v => v.type === expectedType)
    : variables;

  // Check if input is a valid variable name
  const isValidVariableName = (name: string) => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  };

  // Check if input is a valid value for expected type
  const isValidValue = (val: any) => {
    if (!expectedType) return true;
    
    // Handle null, undefined, or empty values
    if (val === null || val === undefined) return false;
    
    // Convert to string for validation
    const stringVal = String(val);
    if (!stringVal || !stringVal.trim()) return false;
    
    const trimmedVal = stringVal.trim();
    
    // Check if it's a declared variable of the expected type
    const matchingVariable = variables.find(v => v.name === trimmedVal);
    if (matchingVariable && matchingVariable.type === expectedType) {
      return true;
    }
    
    // Check if it's a valid direct value
    switch (expectedType) {
      case 'number':
        return !isNaN(Number(trimmedVal)) && trimmedVal !== '';
      case 'boolean':
        return ['true', 'false', '0', '1'].includes(trimmedVal.toLowerCase());
      case 'array':
        try {
          JSON.parse(trimmedVal);
          return Array.isArray(JSON.parse(trimmedVal));
        } catch {
          return false;
        }
      case 'object':
        try {
          JSON.parse(trimmedVal);
          return typeof JSON.parse(trimmedVal) === 'object' && !Array.isArray(JSON.parse(trimmedVal));
        } catch {
          return false;
        }
      default:
        return true;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If it's a valid variable name, show it as selected
    if (isValidVariableName(newValue) && variables.some(v => v.name === newValue)) {
      onChange(newValue);
    } else if (isValidValue(newValue)) {
      onChange(newValue);
    }
  };

  const handleVariableSelect = (variableName: string) => {
    setInputValue(variableName);
    onChange(variableName);
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent dropdown from closing on scroll
  const handleScroll = (e: React.UIEvent) => {
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
    
    // Check if it's a valid direct value
    if (isValidValue(inputValue)) {
      return 'border-blue-500'; // Valid direct value
    }
    
    return 'border-red-500'; // Invalid
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
    
    // Check if it's a valid direct value
    if (isValidValue(inputValue)) {
      return 'text-blue-300'; // Valid direct value
    }
    
    return 'text-red-300'; // Invalid
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full bg-gray-700 border ${getInputBorderColor()} rounded px-3 py-2 text-sm ${getInputTextColor()} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          onScroll={handleScroll}
        >
          {/* Variable options */}
          {filteredVariables.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Variables</div>
              {filteredVariables.map((variable) => (
                <button
                  key={variable.name}
                  onClick={() => handleVariableSelect(variable.name)}
                  className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded text-sm flex items-center justify-between"
                >
                  <span className="text-green-300">{variable.name}</span>
                  <span className="text-xs text-gray-500">{variable.type}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Create new variable option */}
          {inputValue && (() => {
            const stringValue = String(inputValue);
            if (!stringValue || !stringValue.trim()) return null;
            
            const trimmedValue = stringValue.trim();
            if (isValidVariableName(trimmedValue) && !variables.some(v => v.name === trimmedValue)) {
              return (
                <div className="border-t border-gray-600 p-2">
                  <button
                    onClick={() => handleVariableSelect(trimmedValue)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded text-sm text-blue-300"
                  >
                    Create variable "{trimmedValue}"
                  </button>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Type validation message */}
          {inputValue && !isValidValue(inputValue) && expectedType && (
            <div className="border-t border-gray-600 p-2">
              <div className="text-xs text-red-400">
                Invalid {expectedType} value
              </div>
            </div>
          )}
          
          {/* Type mismatch warning */}
          {inputValue && (() => {
            const stringValue = String(inputValue);
            if (!stringValue || !stringValue.trim()) return null;
            
            const trimmedValue = stringValue.trim();
            const matchingVariable = variables.find(v => v.name === trimmedValue);
            if (matchingVariable && expectedType && matchingVariable.type !== expectedType) {
              return (
                <div className="border-t border-gray-600 p-2">
                  <div className="text-xs text-orange-400">
                    Variable "{trimmedValue}" is {matchingVariable.type}, expected {expectedType}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default TypeSelector; 