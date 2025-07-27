'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { X, Settings, RotateCcw } from 'lucide-react';
import VariableSelector from './VariableSelector';
import TypeSelector from './TypeSelector';
import VariableDeclarationPanel from './VariableDeclarationPanel';
import ValueSelector from './ValueSelector';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

interface NodePanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  availableVariables?: string[];
  onAddVariable?: (variableName: string) => void;
  declaredVariables?: VariableDeclaration[];
  onVariablesChange?: (variables: VariableDeclaration[]) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({
  selectedNode,
  selectedEdge,
  onNodeDataChange,
  availableVariables = [],
  onAddVariable = () => {},
  declaredVariables = [],
  onVariablesChange = () => {},
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

  const handleResetConfig = () => {
    const defaultConfig = getDefaultConfig(selectedNode?.type || 'custom');
    setConfig(defaultConfig);
    
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, { config: defaultConfig });
    }
  };

  const getDefaultConfig = (nodeType: string) => {
    switch (nodeType) {
      case 'conditional':
        return {
          operator: 'equals',
          value1: '',
          value2: '',
          outputVariable: '',
        };
      case 'arithmetic':
        return {
          operation: 'add',
          value1: '',
          value2: '',
          outputVariable: '',
        };
      case 'variable':
        return {
          operation: 'set',
          variableName: '',
          value: '',
        };
      case 'loop':
        return {
          loopType: 'while',
          condition: '',
          startValue: '',
          endValue: '',
          stepValue: '1',
          collection: '',
          maxIterations: 10,
        };
              case 'timer':
          return {
            timerType: 'delay',
            duration: 1000,
            unit: 'ms',
            repeatCount: -1,
            timeoutAction: 'continue',
            outputVariable: '',
          };
              case 'blockchain':
          return {
            operation: 'getBalance',
            address: '',
            token: '',
            outputVariable: '',
          };
      default:
        return {};
    }
  };

  const renderConditionalConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Operator
        </label>
        <select
          value={config.operator || 'equals'}
          onChange={(e) => handleConfigChange('operator', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="equals" className="bg-gray-700 text-white">Equals</option>
          <option value="not_equals" className="bg-gray-700 text-white">Not Equals</option>
          <option value="greater" className="bg-gray-700 text-white">Greater Than</option>
          <option value="less" className="bg-gray-700 text-white">Less Than</option>
          <option value="contains" className="bg-gray-700 text-white">Contains</option>
        </select>
      </div>
      
      <ValueSelector
        value={config.value1 || ''}
        onChange={(value) => handleConfigChange('value1', value)}
        variables={declaredVariables}
        placeholder="Enter value or select variable"
        label="Value 1"
      />
      
      <ValueSelector
        value={config.value2 || ''}
        onChange={(value) => handleConfigChange('value2', value)}
        variables={declaredVariables}
        placeholder="Enter value or select variable"
        label="Value 2"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Output Variable (optional)
        </label>
        <TypeSelector
          value={config.outputVariable || ''}
          onChange={(value) => handleConfigChange('outputVariable', value)}
          variables={declaredVariables}
          expectedType="boolean"
          placeholder="Select boolean variable to store result"
        />
      </div>
    </div>
  );

  const renderArithmeticConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'add'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="add" className="bg-gray-700 text-white">Add (+)</option>
          <option value="subtract" className="bg-gray-700 text-white">Subtract (-)</option>
          <option value="multiply" className="bg-gray-700 text-white">Multiply (×)</option>
          <option value="divide" className="bg-gray-700 text-white">Divide (÷)</option>
        </select>
      </div>
      
      <ValueSelector
        value={config.value1 || ''}
        onChange={(value) => handleConfigChange('value1', value)}
        variables={declaredVariables}
        expectedType="number"
        placeholder="Enter number or select number variable"
        label="Value 1"
      />
      
      <ValueSelector
        value={config.value2 || ''}
        onChange={(value) => handleConfigChange('value2', value)}
        variables={declaredVariables}
        expectedType="number"
        placeholder="Enter number or select number variable"
        label="Value 2"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Output Variable (optional)
        </label>
        <TypeSelector
          value={config.outputVariable || ''}
          onChange={(value) => handleConfigChange('outputVariable', value)}
          variables={declaredVariables}
          expectedType="number"
          placeholder="Select number variable to store result"
        />
      </div>
    </div>
  );

  const renderVariableConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'set'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="set" className="bg-gray-700 text-white">Set</option>
          <option value="get" className="bg-gray-700 text-white">Get</option>
          <option value="increment" className="bg-gray-700 text-white">Increment</option>
          <option value="decrement" className="bg-gray-700 text-white">Decrement</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Variable Name
        </label>
        <TypeSelector
          value={config.variableName || ''}
          onChange={(value) => handleConfigChange('variableName', value)}
          variables={declaredVariables}
          placeholder="Select variable"
        />
      </div>
      
      {config.operation === 'set' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Value
          </label>
          <ValueSelector
            value={config.value || ''}
            onChange={(value) => handleConfigChange('value', value)}
            variables={declaredVariables}
            expectedType="string"
          />
        </div>
      )}
      
      {(config.operation === 'increment' || config.operation === 'decrement') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={config.amount || 1}
            onChange={(e) => handleConfigChange('amount', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
            placeholder="Enter amount"
          />
        </div>
      )}
    </div>
  );

  const renderLoopConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Loop Type
        </label>
        <select
          value={config.loopType || 'while'}
          onChange={(e) => handleConfigChange('loopType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="while" className="bg-gray-700 text-white">While Loop</option>
          <option value="for" className="bg-gray-700 text-white">For Loop</option>
          <option value="foreach" className="bg-gray-700 text-white">ForEach Loop</option>
        </select>
      </div>
      
      {config.loopType === 'while' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Condition
          </label>
          <ValueSelector
            value={config.condition || ''}
            onChange={(value) => handleConfigChange('condition', value)}
            variables={declaredVariables}
            expectedType="string"
            placeholder="Enter while condition (e.g., i < 10)"
          />
        </div>
      )}
      
      {config.loopType === 'for' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Value
            </label>
            <ValueSelector
              value={config.startValue || ''}
              onChange={(value) => handleConfigChange('startValue', value)}
              variables={declaredVariables}
              expectedType="number"
              placeholder="Enter start value (e.g., 0)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Value
            </label>
            <ValueSelector
              value={config.endValue || ''}
              onChange={(value) => handleConfigChange('endValue', value)}
              variables={declaredVariables}
              expectedType="number"
              placeholder="Enter end value (e.g., 10)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Step Value
            </label>
            <ValueSelector
              value={config.stepValue || '1'}
              onChange={(value) => handleConfigChange('stepValue', value)}
              variables={declaredVariables}
              expectedType="number"
              placeholder="Enter step value (e.g., 1)"
            />
          </div>
        </>
      )}
      
      {config.loopType === 'foreach' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Collection/Array
          </label>
          <ValueSelector
            value={config.collection || ''}
            onChange={(value) => handleConfigChange('collection', value)}
            variables={declaredVariables}
            expectedType="array"
            placeholder="Enter collection name or array"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Max Iterations
        </label>
        <input
          type="number"
          value={config.maxIterations || 10}
          onChange={(e) => handleConfigChange('maxIterations', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
          placeholder="Enter max iterations"
          min="1"
          max="1000"
        />
      </div>
    </div>
  );

  const renderTimerConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Timer Type
        </label>
        <select
          value={config.timerType || 'delay'}
          onChange={(e) => handleConfigChange('timerType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="delay" className="bg-gray-700 text-white">Delay</option>
          <option value="interval" className="bg-gray-700 text-white">Interval</option>
          <option value="timeout" className="bg-gray-700 text-white">Timeout</option>
        </select>
      </div>
      
      <ValueSelector
        value={config.duration?.toString() || '1000'}
        onChange={(value) => handleConfigChange('duration', parseInt(value) || 1000)}
        variables={declaredVariables}
        expectedType="number"
        placeholder="Enter duration value"
        label="Duration"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Unit
        </label>
        <select
          value={config.unit || 'ms'}
          onChange={(e) => handleConfigChange('unit', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="ms" className="bg-gray-700 text-white">Milliseconds</option>
          <option value="s" className="bg-gray-700 text-white">Seconds</option>
          <option value="m" className="bg-gray-700 text-white">Minutes</option>
        </select>
      </div>
      
      {config.timerType === 'interval' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Repeat Count
          </label>
          <ValueSelector
            value={config.repeatCount?.toString() || '-1'}
            onChange={(value) => handleConfigChange('repeatCount', parseInt(value) || -1)}
            variables={declaredVariables}
            expectedType="number"
            placeholder="Enter repeat count (-1 for infinite)"
          />
        </div>
      )}
      
      {config.timerType === 'timeout' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Timeout Action
          </label>
          <select
            value={config.timeoutAction || 'continue'}
            onChange={(e) => handleConfigChange('timeoutAction', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
            style={{
              colorScheme: 'dark'
            }}
          >
            <option value="continue" className="bg-gray-700 text-white">Continue</option>
            <option value="stop" className="bg-gray-700 text-white">Stop</option>
            <option value="retry" className="bg-gray-700 text-white">Retry</option>
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Output Variable (optional)
        </label>
        <TypeSelector
          value={config.outputVariable || ''}
          onChange={(value) => handleConfigChange('outputVariable', value)}
          variables={declaredVariables}
          placeholder="Select variable to store timing result"
        />
      </div>
    </div>
  );

  const renderBlockchainConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Operation
        </label>
        <select
          value={config.operation || 'getBalance'}
          onChange={(e) => handleConfigChange('operation', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="getBalance" className="bg-gray-700 text-white">Get Balance</option>
          <option value="transfer" className="bg-gray-700 text-white">Transfer</option>
          <option value="swap" className="bg-gray-700 text-white">Swap Tokens</option>
          <option value="stake" className="bg-gray-700 text-white">Stake</option>
          <option value="borrow" className="bg-gray-700 text-white">Borrow</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Address
        </label>
        <ValueSelector
          value={config.address || ''}
          onChange={(value) => handleConfigChange('address', value)}
          variables={declaredVariables}
          expectedType="string"
          placeholder="Enter wallet address"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Token
        </label>
        <ValueSelector
          value={config.token || ''}
          onChange={(value) => handleConfigChange('token', value)}
          variables={declaredVariables}
          expectedType="string"
          placeholder="Enter token symbol"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Output Variable (optional)
        </label>
        <TypeSelector
          value={config.outputVariable || ''}
          onChange={(value) => handleConfigChange('outputVariable', value)}
          variables={declaredVariables}
          placeholder="Select variable to store result"
        />
      </div>
    </div>
  );

  const renderStartConfig = () => {
    // Use variables from the selected node's config if available, otherwise use declaredVariables
    const nodeVariables = selectedNode?.data?.config?.variables || declaredVariables;
    
    return (
      <div className="space-y-4">
        <VariableDeclarationPanel
          variables={nodeVariables}
          onVariablesChange={onVariablesChange}
        />
      </div>
    );
  };

  const renderConfig = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'start':
        return renderStartConfig();
      case 'conditional':
        return renderConditionalConfig();
      case 'arithmetic':
        return renderArithmeticConfig();
      case 'variable':
        return renderVariableConfig();
      case 'loop':
        return renderLoopConfig();
      case 'timer':
        return renderTimerConfig();
      case 'blockchain':
        return renderBlockchainConfig();
      default:
        return (
          <div className="text-gray-400 text-sm">
            Configuration options for this node type are not yet implemented.
          </div>
        );
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="h-64 bg-gray-800/50 border-t border-gray-700 p-4 backdrop-blur-sm">
        <div className="text-center text-gray-400">
          <Settings className="h-12 w-12 mx-auto mb-2 text-gray-500" />
          <p>Select a node or edge to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-800/50 border-t border-gray-700 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {selectedNode ? selectedNode.data.label : 'Edge Configuration'}
          </h3>
          <p className="text-sm text-gray-400">
            {selectedNode ? selectedNode.data.description : 'Configure connection'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetConfig}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300 transition-colors"
            title="Reset configuration"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedNode && renderConfig()}
        {selectedEdge && (
          <div className="text-gray-400 text-sm">
            Edge configuration options coming soon.
          </div>
        )}
      </div>
    </div>
  );
};

export default NodePanel; 