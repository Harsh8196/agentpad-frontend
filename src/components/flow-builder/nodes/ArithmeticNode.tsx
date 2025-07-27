'use client';

import { Handle, Position } from 'reactflow';
import { Calculator } from 'lucide-react';

interface ArithmeticNodeData {
  label: string;
  type: string;
  config: any;
  description: string;
  status: string;
}

interface ArithmeticNodeProps {
  data: ArithmeticNodeData;
}

const ArithmeticNode: React.FC<ArithmeticNodeProps> = ({ data }) => {
  const { config } = data;
  
  return (
    <div className="bg-gray-800/50 border-2 border-green-500 rounded-lg p-4 shadow-md min-w-[180px] backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-2">
        <Calculator className="h-4 w-4 text-green-400" />
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">{data.description}</div>
      
      {/* Show configuration preview */}
      {config && (
        <div className="bg-green-500/20 p-2 rounded text-xs text-green-300 mb-2">
          <div className="font-medium">Operation:</div>
          <div>
            {config.value1 || '?'} {config.operation || 'add'} {config.value2 || '?'}
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
      
      {/* Arithmetic output */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />
      
      {/* Output label inside the node */}
      <div className="absolute bottom-5 left-0 right-0 text-center text-xs font-medium">
        <span className="text-green-400" style={{ left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>Result</span>
      </div>
    </div>
  );
};

export default ArithmeticNode; 