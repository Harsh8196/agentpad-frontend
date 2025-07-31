import React from 'react';
import { Handle, Position } from 'reactflow';

interface BlockchainNodeData {
  label: string;
  description: string;
  config?: {
    network?: string;
    selectedTool?: string;
    toolParameters?: Record<string, any>;
  };
}

interface BlockchainNodeProps {
  data: BlockchainNodeData;
}

const BlockchainNode: React.FC<BlockchainNodeProps> = ({ data }) => {
  const config = data.config || {};
  const network = config.network || 'mainnet';
  const selectedTool = config.selectedTool || '';
  
  // Get tool display name
  const getToolDisplayName = (toolName: string) => {
    const toolNames: Record<string, string> = {
      'sei_erc20_balance': 'Get Balance',
      'sei_erc20_transfer': 'Transfer',
      'sei_native_transfer': 'Native Transfer',
      'sei_swap': 'Swap',
      'sei_stake': 'Stake',
      'sei_borrow_takara': 'Borrow',
      'sei_citrex_place_order': 'Place Order',
      'sei_post_tweet': 'Post Tweet'
    };
    return toolNames[toolName] || toolName;
  };

  return (
    <div className="bg-yellow-600 border-2 border-yellow-500 rounded-lg p-4 shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-400 border-2 border-yellow-600"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 border-2 border-yellow-600"
      />
      
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{data.label}</h3>
          <p className="text-yellow-100 text-xs">{data.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-yellow-100">Network:</span>
          <span className={`px-1 rounded text-xs ${
            network === 'mainnet' ? 'bg-green-700 text-green-200' :
            network === 'testnet' ? 'bg-blue-700 text-blue-200' :
            'bg-purple-700 text-purple-200'
          }`}>
            {network.toUpperCase()}
          </span>
        </div>
        
        {selectedTool && (
          <div className="bg-yellow-700/30 rounded p-2">
            <div className="text-yellow-100 text-xs font-medium mb-1">Operation:</div>
            <p className="text-yellow-200 text-xs">{getToolDisplayName(selectedTool)}</p>
          </div>
        )}
        
        {config.toolParameters && Object.keys(config.toolParameters).length > 0 && (
          <div className="bg-yellow-700/20 rounded p-2">
            <div className="text-yellow-100 text-xs font-medium mb-1">Parameters:</div>
            <div className="space-y-1">
              {Object.entries(config.toolParameters).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-yellow-200">{key}:</span>
                  <span className="text-yellow-300">{String(value).slice(0, 10)}...</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainNode; 