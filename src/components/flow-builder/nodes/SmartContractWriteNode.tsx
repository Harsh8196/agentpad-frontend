import { Handle, Position } from 'reactflow';
import { Edit3 } from 'lucide-react';

interface SmartContractWriteNodeProps {
  data: {
    label: string;
    description: string;
    status?: string;
    config?: any;
  };
}

const SmartContractWriteNode: React.FC<SmartContractWriteNodeProps> = ({ data }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'running': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] backdrop-blur-sm transition-all duration-200 ${getStatusColor(data.status)}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-gray-600"
      />
      
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Edit3 className="h-5 w-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {data.label}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {data.description}
          </div>
          {data.config?.contractAddress && (
            <div className="text-xs text-gray-500 truncate mt-1">
              {data.config.contractAddress.slice(0, 8)}...{data.config.contractAddress.slice(-6)}
            </div>
          )}
        </div>
      </div>

      {data.status && (
        <div className="flex items-center justify-between mt-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            data.status === 'success' ? 'bg-green-500/20 text-green-400' :
            data.status === 'error' ? 'bg-red-500/20 text-red-400' :
            data.status === 'running' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {data.status}
          </span>
          {data.config?.outputVariable && (
            <span className="text-[10px] text-gray-300">→ {data.config.outputVariable}</span>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-gray-600"
      />
    </div>
  );
};

export default SmartContractWriteNode;