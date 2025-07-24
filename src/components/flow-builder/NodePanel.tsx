'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { X, Settings } from 'lucide-react';

interface NodePanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({
  selectedNode,
  selectedEdge,
  onNodeDataChange,
}) => {
  const [config, setConfig] = useState<any>({});

  // Update config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, { config: newConfig });
    }
  };

  const renderConditionalConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operator
        </label>
        <select
          value={config.operator || 'equals'}
          onChange={(e) => handleConfigChange('operator', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="equals">Equals</option>
          <option value="notEquals">Not Equals</option>
          <option value="greaterThan">Greater Than</option>
          <option value="lessThan">Less Than</option>
          <option value="contains">Contains</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value 1
        </label>
        <input
          type="text"
          value={config.value1 || ''}
          onChange={(e) => handleConfigChange('value1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter first value"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value 2
        </label>
        <input
          type="text"
          value={config.value2 || ''}
          onChange={(e) => handleConfigChange('value2', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter second value"
        />
      </div>
    </div>
  );

  const renderArithmeticConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'add'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="add">Add (+)</option>
          <option value="subtract">Subtract (-)</option>
          <option value="multiply">Multiply (×)</option>
          <option value="divide">Divide (÷)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value 1
        </label>
        <input
          type="number"
          value={config.value1 || ''}
          onChange={(e) => handleConfigChange('value1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter first number"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value 2
        </label>
        <input
          type="number"
          value={config.value2 || ''}
          onChange={(e) => handleConfigChange('value2', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter second number"
        />
      </div>
    </div>
  );

  const renderVariableConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'set'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="set">Set</option>
          <option value="get">Get</option>
          <option value="increment">Increment</option>
          <option value="decrement">Decrement</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variable Name
        </label>
        <input
          type="text"
          value={config.variableName || ''}
          onChange={(e) => handleConfigChange('variableName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter variable name"
        />
      </div>
      
      {config.operation === 'set' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            type="text"
            value={config.value || ''}
            onChange={(e) => handleConfigChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter value"
          />
        </div>
      )}
      
      {(config.operation === 'increment' || config.operation === 'decrement') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={config.amount || 1}
            onChange={(e) => handleConfigChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>
      )}
    </div>
  );

  const renderBlockchainConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'getBalance'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="getBalance">Get Balance</option>
          <option value="transfer">Transfer</option>
          <option value="swap">Swap Tokens</option>
          <option value="stake">Stake</option>
          <option value="borrow">Borrow</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={config.address || ''}
          onChange={(e) => handleConfigChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter wallet address"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Token
        </label>
        <input
          type="text"
          value={config.token || ''}
          onChange={(e) => handleConfigChange('token', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter token symbol"
        />
      </div>
    </div>
  );

  const renderConfig = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'conditional':
        return renderConditionalConfig();
      case 'arithmetic':
        return renderArithmeticConfig();
      case 'variable':
        return renderVariableConfig();
      case 'blockchain':
        return renderBlockchainConfig();
      default:
        return (
          <div className="text-gray-500 text-sm">
            Configuration options for this node type are not yet implemented.
          </div>
        );
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Select a node or edge to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedNode ? selectedNode.data.label : 'Edge Configuration'}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedNode ? selectedNode.data.description : 'Configure connection'}
          </p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Configuration */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedNode && renderConfig()}
        {selectedEdge && (
          <div className="text-gray-500 text-sm">
            Edge configuration options coming soon.
          </div>
        )}
      </div>
    </div>
  );
};

export default NodePanel; 