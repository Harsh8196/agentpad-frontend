'use client';

import { Handle, Position } from 'reactflow';
import { Code } from 'lucide-react';

interface CustomNodeData {
  label: string;
  type: string;
  config: any;
  description: string;
  status: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 rounded-lg p-4 shadow-md min-w-[150px] backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2 mb-2">
        <Code className="h-4 w-4 text-gray-400" />
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

export default CustomNode; 