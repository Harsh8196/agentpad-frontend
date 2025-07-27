'use client';

import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

interface ConditionalNodeData {
  label: string;
  type: string;
  config: any;
  description: string;
  status: string;
}

interface ConditionalNodeProps {
  data: ConditionalNodeData;
}

const ConditionalNode: React.FC<ConditionalNodeProps> = ({ data }) => {
  const { config } = data;
  
  return (
    <div className="bg-gray-800/50 border-2 border-blue-500 rounded-lg p-4 shadow-md min-w-[180px] backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-2">
        <GitBranch className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">{data.description}</div>
      
      {/* Show configuration preview */}
      {config && (
        <div className="bg-blue-500/20 p-2 rounded text-xs text-blue-300 mb-2">
          <div className="font-medium">Condition:</div>
          <div>
            {config.value1 || '?'} {config.operator || 'equals'} {config.value2 || '?'}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.status === 'idle' ? 'bg-gray-600 text-gray-300' :
          data.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
          data.status === 'success' ? 'bg-green-500/20 text-green-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {data.status}
        </span>
      </div>
      
      {/* Two output handles for true/false */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true"
        className="w-3 h-3 bg-green-400 border-2 border-white"
        style={{ left: '25%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        className="w-3 h-3 bg-red-400 border-2 border-white"
        style={{ left: '75%' }}
      />
      
      {/* Output labels inside the node */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-between text-xs font-medium">
        <span className="text-green-400" style={{ left: '25%', transform: 'translateX(-50%)', position: 'absolute' }}>True</span>
        <span className="text-red-400" style={{ left: '75%', transform: 'translateX(-50%)', position: 'absolute' }}>False</span>
      </div>
    </div>
  );
};

export default ConditionalNode; 