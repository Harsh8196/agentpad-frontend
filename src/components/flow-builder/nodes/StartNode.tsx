'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface StartNodeData {
  label: string;
  description: string;
  config?: {
    variables?: VariableDeclaration[];
  };
}

interface StartNodeProps {
  data: StartNodeData;
}

const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  const variables = data.config?.variables || [];

  return (
    <div className="bg-green-600 border-2 border-green-500 rounded-lg p-4 shadow-lg min-w-[200px]">
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-400 border-2 border-green-600"
      />
      
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{data.label}</h3>
          <p className="text-green-100 text-xs">{data.description}</p>
        </div>
      </div>
      
      {variables.length > 0 && (
        <div className="mt-3">
          <div className="text-green-100 text-xs font-medium mb-1">Variables:</div>
          <div className="space-y-1">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-green-100">{variable.name}</span>
                <span className="text-green-200 bg-green-700 px-1 rounded text-xs">
                  {variable.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartNode; 