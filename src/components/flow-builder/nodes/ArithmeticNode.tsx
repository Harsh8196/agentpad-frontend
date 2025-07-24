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
    <div className="bg-white border-2 border-green-300 rounded-lg p-4 shadow-md min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-2">
        <Calculator className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-gray-900">{data.label}</span>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">{data.description}</div>
      
      {/* Show configuration preview */}
      {config && (
        <div className="bg-green-50 p-2 rounded text-xs text-green-800 mb-2">
          <div className="font-medium">Operation:</div>
          <div>
            {config.value1 || '?'} {config.operation || 'add'} {config.value2 || '?'}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.status === 'idle' ? 'bg-gray-100 text-gray-600' :
          data.status === 'running' ? 'bg-blue-100 text-blue-600' :
          data.status === 'success' ? 'bg-green-100 text-green-600' :
          'bg-red-100 text-red-600'
        }`}>
          {data.status}
        </span>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default ArithmeticNode; 