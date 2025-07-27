'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface StartNodeData {
  label: string;
  type: string;
  config: {
    variables?: VariableDeclaration[];
  };
  description: string;
  status: string;
}

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data }) => {
  const [showVariables, setShowVariables] = useState(false);
  const variables = data.config?.variables || [];

  return (
    <div className="bg-green-600 border-2 border-green-400 rounded-lg p-4 min-w-[250px] shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
        <h3 className="text-white font-semibold text-sm">{data.label}</h3>
      </div>
      <p className="text-green-100 text-xs mb-3">{data.description}</p>
      
      {/* Variables Section */}
      <div className="mb-3">
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="text-green-200 text-xs hover:text-white flex items-center space-x-1"
        >
          <span>Variables ({variables.length})</span>
          <span className="text-lg">{showVariables ? '▼' : '▶'}</span>
        </button>
        
        {showVariables && (
          <div className="mt-2 space-y-2">
            {variables.length === 0 ? (
              <p className="text-green-300 text-xs italic">No variables declared</p>
            ) : (
              variables.map((variable, index) => (
                <div key={index} className="bg-green-700/30 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-200 text-xs font-medium">
                      {variable.name}
                    </span>
                    <span className="text-green-300 text-xs bg-green-800/50 px-2 py-1 rounded">
                      {variable.type}
                    </span>
                  </div>
                  {variable.defaultValue && (
                    <p className="text-green-300 text-xs mt-1">
                      Default: {variable.defaultValue}
                    </p>
                  )}
                  {variable.description && (
                    <p className="text-green-400 text-xs mt-1">
                      {variable.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="bg-green-700/50 rounded p-2 mb-2">
        <p className="text-green-200 text-xs">
          <strong>Status:</strong> {data.status}
        </p>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-300 border-2 border-green-600"
        style={{ top: '50%' }}
      />
    </div>
  );
};

export default memo(StartNode); 