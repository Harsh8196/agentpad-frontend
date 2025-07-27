'use client';

import { useState, useEffect } from 'react';
import TypeSelector from './TypeSelector';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  variables: VariableDeclaration[];
  expectedType?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  placeholder?: string;
  className?: string;
  label?: string;
}

const ValueSelector: React.FC<ValueSelectorProps> = ({
  value,
  onChange,
  variables,
  expectedType,
  placeholder = "Enter value or select variable",
  className = "",
  label,
}) => {
  const [inputMode, setInputMode] = useState<'constant' | 'variable'>('constant');
  const [constantValue, setConstantValue] = useState('');
  const [variableValue, setVariableValue] = useState('');

  // Initialize values based on current value
  useEffect(() => {
    if (!value) {
      setConstantValue('');
      setVariableValue('');
      setInputMode('constant');
      return;
    }

    // Check if it's a declared variable
    const isDeclaredVariable = variables.some(v => v.name === value.trim());
    if (isDeclaredVariable) {
      setVariableValue(value.trim());
      setConstantValue('');
      setInputMode('variable');
    } else {
      setConstantValue(value);
      setVariableValue('');
      setInputMode('constant');
    }
  }, [value, variables]);

  // Handle mode change
  const handleModeChange = (mode: 'constant' | 'variable') => {
    setInputMode(mode);
    if (mode === 'constant') {
      onChange(constantValue);
    } else {
      onChange(variableValue);
    }
  };

  // Handle constant value change
  const handleConstantChange = (newValue: string) => {
    setConstantValue(newValue);
    onChange(newValue);
  };

  // Handle variable value change
  const handleVariableChange = (newValue: string) => {
    setVariableValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Mode Toggle */}
      <div className="flex bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => handleModeChange('constant')}
          className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            inputMode === 'constant'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Constant
        </button>
        <button
          onClick={() => handleModeChange('variable')}
          className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            inputMode === 'variable'
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Variable
        </button>
      </div>

      {/* Input Field */}
      {inputMode === 'constant' ? (
        <input
          type="text"
          value={constantValue}
          onChange={(e) => handleConstantChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <TypeSelector
          value={variableValue}
          onChange={handleVariableChange}
          variables={variables}
          expectedType={expectedType}
          placeholder="Select variable"
        />
      )}

      {/* Type Hint */}
      {expectedType && (
        <div className="text-xs text-gray-400">
          Expected type: <span className="text-blue-300">{expectedType}</span>
        </div>
      )}
    </div>
  );
};

export default ValueSelector; 