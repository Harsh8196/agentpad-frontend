'use client';

import { useState } from 'react';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface VariableDeclarationPanelProps {
  variables: VariableDeclaration[];
  onVariablesChange: (variables: VariableDeclaration[]) => void;
}

const VariableDeclarationPanel: React.FC<VariableDeclarationPanelProps> = ({
  variables,
  onVariablesChange,
}) => {
  const [newVariable, setNewVariable] = useState<Partial<VariableDeclaration>>({
    name: '',
    type: 'string',
    defaultValue: '',
    description: '',
  });

  const addVariable = () => {
    if (!newVariable.name || !newVariable.type) return;
    
    const variable: VariableDeclaration = {
      name: newVariable.name,
      type: newVariable.type as VariableDeclaration['type'],
      defaultValue: newVariable.defaultValue || undefined,
      description: newVariable.description || undefined,
    };

    console.log('VariableDeclarationPanel addVariable called:', variable);
    onVariablesChange([...variables, variable]);
    setNewVariable({
      name: '',
      type: 'string',
      defaultValue: '',
      description: '',
    });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onVariablesChange(updatedVariables);
  };

  const updateVariable = (index: number, field: keyof VariableDeclaration, value: string) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    onVariablesChange(updatedVariables);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Variable Declarations</h3>
      
      {/* Add New Variable */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Add New Variable</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={newVariable.name}
              onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              placeholder="variable_name"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              value={newVariable.type}
              onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as VariableDeclaration['type'] })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Default Value</label>
            <input
              type="text"
              value={newVariable.defaultValue}
              onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              placeholder="Optional default value"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={newVariable.description}
              onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              placeholder="Optional description"
            />
          </div>
        </div>
        
        <button
          onClick={addVariable}
          disabled={!newVariable.name}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded text-sm font-medium"
        >
          Add Variable
        </button>
      </div>

      {/* Existing Variables */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Declared Variables ({variables.length})</h4>
        
        {variables.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No variables declared yet</p>
        ) : (
          variables.map((variable, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-200">{variable.name}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {variable.type}
                  </span>
                </div>
                <button
                  onClick={() => removeVariable(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Default Value</label>
                  <input
                    type="text"
                    value={variable.defaultValue || ''}
                    onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                    placeholder="No default"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={variable.description || ''}
                    onChange={(e) => updateVariable(index, 'description', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                    placeholder="No description"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VariableDeclarationPanel; 