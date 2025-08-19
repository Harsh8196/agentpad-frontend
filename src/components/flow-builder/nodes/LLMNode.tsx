import React from 'react';
import { Handle, Position } from 'reactflow';

interface LLMNodeData {
  label: string;
  type: string;
  config: any;
  description: string;
  status: string;
}

interface LLMNodeProps {
  data: LLMNodeData;
}

const LLMNode: React.FC<LLMNodeProps> = ({ data }) => {
  const config = data.config || {};
  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 shadow-md min-w-[150px] backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-2">
        <svg className="h-4 w-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>
      
      <div className="text-xs text-gray-400 mb-2">{data.description}</div>
      
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.status === 'idle' ? 'bg-gray-600 text-gray-300' :
          data.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
          data.status === 'success' ? 'bg-green-500/20 text-green-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {data.status}
        </span>
        {config?.outputVariable && (
          <span className="text-[10px] text-gray-300">→ {config.outputVariable}</span>
        )}
      </div>
      
      {/* Custom output */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* Output label inside the node */}
      <div className="absolute bottom-5 left-0 right-0 text-center text-xs font-medium">
        <span className="text-gray-400" style={{ left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>Output</span>
      </div>
    </div>
  );
};

export default LLMNode; 