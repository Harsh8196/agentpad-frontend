'use client';

import { useState, useEffect, useRef } from 'react';
import TypeSelector from './TypeSelector';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface ValueSelectorProps {
  value: string | number | boolean | null | undefined;
  onChange: (value: string) => void;
  variables: VariableDeclaration[];
  expectedType?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  placeholder?: string;
  className?: string;
  label?: string;
  resetKey?: string; // Use resetKey instead of key for forced re-initialization
}

const  ValueSelector: React.FC<ValueSelectorProps> = ({
  value,
  onChange,
  variables,
  expectedType,
  placeholder = "Enter value or select variable",
  className = "",
  label,
  resetKey,
}) => {
  const [inputMode, setInputMode] = useState<'constant' | 'variable'>('constant');
  const [constantValue, setConstantValue] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInsertOpen, setIsInsertOpen] = useState(false);
  const [insertSearchTerm, setInsertSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const isTypingRef = useRef(false);
  const lastValueRef = useRef(value);

  // Initialize values based on current value - only when resetKey changes or on mount
  useEffect(() => {
    // Only update if value changed from outside (not during typing)
    if (lastValueRef.current !== value && !isTypingRef.current) {
      lastValueRef.current = value;
      
      if (!value) {
        setConstantValue('');
        setVariableValue('');
        setInputMode('constant');
        return;
      }

      const valueStr = value?.toString() || '';
      
      // Check if it's a declared variable
      const isDeclaredVariable = variables.some(v => v.name === valueStr.trim());
      
      if (isDeclaredVariable) {
        setVariableValue(valueStr.trim());
        setConstantValue('');
        setInputMode('variable');
      } else {
        setConstantValue(valueStr);
        setVariableValue('');
        setInputMode('constant');
      }
    }
  }, [resetKey, variables, value]); // Include value to update when prop changes

  // Reset initialization when resetKey changes (forced re-initialization)
  useEffect(() => {
    setIsInitialized(false);
    isTypingRef.current = false;
    lastValueRef.current = value; // Update ref when resetKey changes
  }, [resetKey, value]);

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
    isTypingRef.current = true;
    setConstantValue(newValue);
    onChange(newValue);
    
    // Reset typing flag after a short delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 200);
  };

  // Build variable list for insert dropdown (always include objects so their properties are selectable)
  const filteredInsertVariables = variables
    .filter(v => !expectedType || v.type === expectedType || v.type === 'object')
    .filter(v => !insertSearchTerm ||
      v.name.toLowerCase().includes(insertSearchTerm.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(insertSearchTerm.toLowerCase()))
    );

  const insertAtCursor = (textToInsert: string) => {
    const el = inputRef.current;
    if (!el) {
      handleConstantChange((constantValue || '') + textToInsert);
      return;
    }
    const start = el.selectionStart ?? (constantValue?.length || 0);
    const end = el.selectionEnd ?? (constantValue?.length || 0);
    const before = (constantValue || '').slice(0, start);
    const after = (constantValue || '').slice(end);
    const newVal = `${before}${textToInsert}${after}`;
    handleConstantChange(newVal);
    // restore caret after inserted text
    requestAnimationFrame(() => {
      const pos = start + textToInsert.length;
      el.setSelectionRange(pos, pos);
      el.focus();
    });
  };

  const handleInsertVariable = (variableName: string, propertyPath?: string) => {
    const path = propertyPath ? `${variableName}.${propertyPath}` : variableName;
    insertAtCursor(`{${path}}`);
    setIsInsertOpen(false);
  };

  // Handle variable value change
  const handleVariableChange = (newValue: string) => {
    isTypingRef.current = true;
    setVariableValue(newValue);
    onChange(newValue);
    
    // Reset typing flag after a short delay
    setTimeout(() => {
      isTypingRef.current = false;
    }, 200);
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
        <div className="relative">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={constantValue}
              onChange={(e) => handleConstantChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsInsertOpen((o) => !o);
              }}
              className="px-2 py-2 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 hover:bg-gray-600"
              title="Insert variable or property"
            >
              Insert variable
            </button>
          </div>
          {isInsertOpen && (
            <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-700">
                <input
                  type="text"
                  value={insertSearchTerm}
                  onChange={(e) => setInsertSearchTerm(e.target.value)}
                  placeholder="Search variables..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                {filteredInsertVariables.map((v) => (
                  <div key={v.name} className="border-b border-gray-700">
                    <div
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white"
                      onClick={() => handleInsertVariable(v.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{v.name}</span>
                        <span className="text-xs text-gray-400">({v.type})</span>
                      </div>
                      {v.description && (
                        <div className="text-xs text-gray-400 mt-1">{v.description}</div>
                      )}
                    </div>
                    {v.type === 'object' && v.defaultValue && (
                      <div className="bg-gray-900">
                        {(() => {
                          try {
                            const obj = JSON.parse(v.defaultValue);
                            return Object.keys(obj).map((prop) => (
                              <div
                                key={`${v.name}.${prop}`}
                                className="px-6 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 text-sm border-l-2 border-blue-500 ml-2"
                                onClick={() => handleInsertVariable(v.name, prop)}
                              >
                                <span className="text-blue-400 mr-2">└─</span>
                                <span className="font-medium">{prop}</span>
                                <span className="text-gray-500 ml-2">:</span>
                                <span className="text-gray-400 ml-1">{typeof obj[prop] === 'object' ? 'object' : String(obj[prop])}</span>
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
                {filteredInsertVariables.length === 0 && (
                  <div className="px-3 py-2 text-gray-400 text-sm">No variables</div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <TypeSelector
          value={variableValue}
          onChange={(value) => handleVariableChange(value)}
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