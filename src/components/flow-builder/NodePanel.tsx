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
  declaredVariables?: VariableDeclaration[];
  onVariablesChange?: (variables: VariableDeclaration[]) => void;
}

// Network configurations
const SUPPORTED_NETWORKS = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    nativeCurrency: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    nativeCurrency: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  bsc: {
    name: 'Binance Smart Chain',
    chainId: 56,
    nativeCurrency: 'BNB',
    blockExplorer: 'https://bscscan.com'
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    nativeCurrency: 'ETH',
    blockExplorer: 'https://arbiscan.io'
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    nativeCurrency: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io'
  },
  base: {
    name: 'Base',
    chainId: 8453,
    nativeCurrency: 'ETH',
    blockExplorer: 'https://basescan.org'
  },
  sei: {
    name: 'SEI Mainnet',
    chainId: 1329,
    nativeCurrency: 'SEI',
    blockExplorer: 'https://seitrace.com'
  },
  sei_testnet: {
    name: 'SEI Testnet',
    chainId: 1328,
    nativeCurrency: 'SEI',
    blockExplorer: 'https://testnet.seistream.app'
  }
};

// ABI parsing utilities
const parseABI = (abiString: string) => {
  try {
    const abi = JSON.parse(abiString);
    if (!Array.isArray(abi)) {
      throw new Error('ABI must be an array');
    }
    
    return {
      readMethods: abi.filter(item => 
        item.type === 'function' && 
        (item.stateMutability === 'view' || item.stateMutability === 'pure')
      ),
      writeMethods: abi.filter(item => 
        item.type === 'function' && 
        (item.stateMutability === 'nonpayable' || item.stateMutability === 'payable')
      ),
      events: abi.filter(item => item.type === 'event'),
      isValid: true,
      error: null
    };
  } catch (error) {
    return {
      readMethods: [],
      writeMethods: [],
      events: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid ABI format'
    };
  }
};

const getMethodSignature = (method: any) => {
  const inputs = method.inputs?.map((input: any) => 
    `${input.name}: ${input.type}`
  ).join(', ') || '';
  return `${method.name}(${inputs})`;
};

const NodePanel: React.FC<NodePanelProps> = ({
  selectedNode,
  selectedEdge,
  onNodeDataChange,
  availableVariables = [],
  declaredVariables = [],
  onVariablesChange = () => {},
}) => {
  const [config, setConfig] = useState<any>({});
  
  // Blockchain node state
  const [blockchainNetwork, setBlockchainNetwork] = useState('mainnet');
  const [blockchainSelectedTool, setBlockchainSelectedTool] = useState('');
  const [blockchainToolParameters, setBlockchainToolParameters] = useState<Record<string, any>>({});

  // Smart Contract node state
  const [parsedABI, setParsedABI] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // Update config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const newConfig = selectedNode.data.config || {};
      setConfig(newConfig);
      
      // Initialize blockchain state if it's a blockchain node
      if (selectedNode.type === 'blockchain') {
        setBlockchainNetwork(newConfig.network || 'mainnet');
        setBlockchainSelectedTool(newConfig.selectedTool || '');
        setBlockchainToolParameters(newConfig.toolParameters || {});
      }
    }
  }, [selectedNode]);

  // Parse ABI when config changes (for smart contract nodes)
  useEffect(() => {
    if (config.abi && (selectedNode?.type === 'smartContractRead' || selectedNode?.type === 'smartContractWrite')) {
      const parsed = parseABI(config.abi);
      setParsedABI(parsed);
      
      // Only set method selection if ABI changes and method exists in new ABI
      if (config.methodName && parsed.isValid) {
        const methodType = selectedNode?.type === 'smartContractRead' ? 'readMethods' : 'writeMethods';
        const method = parsed[methodType].find((m: any) => m.name === config.methodName);
        if (method) {
          setSelectedMethod(method);
        } else {
          // Method doesn't exist in new ABI, clear the method name
          setSelectedMethod(null);
        }
      }
    } else {
      setParsedABI(null);
      setSelectedMethod(null);
    }
  }, [config.abi, selectedNode?.type]); // Removed config.methodName from dependencies

  // Handle method selection when methodName changes
  useEffect(() => {
    console.log('Method selection useEffect triggered:', {
      methodName: config.methodName,
      hasParsedABI: !!parsedABI,
      isValid: parsedABI?.isValid,
      nodeType: selectedNode?.type
    });
    
    if (parsedABI && parsedABI.isValid && config.methodName) {
      const methodType = selectedNode?.type === 'smartContractRead' ? 'readMethods' : 'writeMethods';
      const method = parsedABI[methodType].find((m: any) => m.name === config.methodName);
      console.log('Found method in useEffect:', method);
      if (method) {
        setSelectedMethod(method);
      }
    } else if (!config.methodName) {
      console.log('Clearing selected method');
      setSelectedMethod(null);
    }
  }, [config.methodName, parsedABI, selectedNode?.type]);

  const handleConfigChange = (key: string, value: any) => {
    console.log('handleConfigChange', key, value);
    const newConfig = { ...config, [key]: value };
    console.log('newConfig', newConfig);
    setConfig(newConfig);
    
    if (selectedNode) {
      console.log('Calling onNodeDataChange with:', { config: newConfig });
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
            network: 'mainnet',
            selectedTool: '',
            toolParameters: {},
            outputVariable: '',
          };
              case 'llm':
          return {
            outputMode: 'assistant',
            analysisType: 'general',
            network: 'mainnet',
            availableActions: 'buy_sei,sell_sei,stake_sei,hold,rebalance',
            systemPrompt: '',
            input: '',
            outputVariable: '',
            chatInterface: false,
            model: 'gpt-4-turbo',
            temperature: 0,
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

  const renderLoggerConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
        <select
          value={config.level || 'info'}
          onChange={(e) => handleConfigChange('level', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message (optional)</label>
        <input
          type="text"
          value={config.message || ''}
          onChange={(e) => handleConfigChange('message', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
          placeholder="Static message to log"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Value (variable or text)</label>
        <ValueSelector
          value={config.value || ''}
          onChange={(value) => handleConfigChange('value', value)}
          variables={declaredVariables}
          expectedType={undefined}
          placeholder="Enter value or insert variables"
        />
        <p className="text-xs text-gray-400 mt-1">Use Insert variable to include {`{myObject.prop}`}</p>
      </div>
    </div>
  );

  // Tool network support mapping (matching backend)
  const TOOL_NETWORK_SUPPORT = {
    // Basic Operations (All Networks)
    'sei_erc20_balance': ['mainnet', 'testnet'],
    'sei_erc20_transfer': ['mainnet', 'testnet'],
    'sei_native_transfer': ['mainnet', 'testnet'],
    'sei_erc721_balance': ['mainnet', 'testnet'],
    'sei_erc721_transfer': ['mainnet', 'testnet'],
    'sei_erc721_mint': ['mainnet', 'testnet'],
    
    // DeFi Operations (Mainnet Only)
    'sei_swap': ['mainnet'],
    'sei_stake': ['mainnet'],
    'sei_unstake': ['mainnet'],
    'sei_mint_takara': ['mainnet'],
    'sei_borrow_takara': ['mainnet'],
    'sei_repay_takara': ['mainnet'],
    'sei_redeem_takara': ['mainnet'],
    'sei_get_redeemable_amount': ['mainnet'],
    'sei_get_borrow_balance': ['mainnet'],
    
    // Trading Operations (Mainnet Only)
    'sei_citrex_deposit': ['mainnet'],
    'sei_citrex_withdraw': ['mainnet'],
    'sei_citrex_get_products': ['mainnet'],
    'sei_citrex_get_order_book': ['mainnet'],
    'sei_citrex_get_account_health': ['mainnet'],
    'sei_citrex_get_tickers': ['mainnet'],
    'sei_citrex_calculate_margin_requirement': ['mainnet'],
    'sei_citrex_get_klines': ['mainnet'],
    'sei_citrex_get_product': ['mainnet'],
    'sei_citrex_get_server_time': ['mainnet'],
    'sei_citrex_get_trade_history': ['mainnet'],
    'sei_citrex_cancel_and_replace_order': ['mainnet'],
    'sei_citrex_cancel_open_orders_for_product': ['mainnet'],
    'sei_citrex_cancel_order': ['mainnet'],
    'sei_citrex_cancel_orders': ['mainnet'],
    'sei_citrex_list_balances': ['mainnet'],
    'sei_citrex_list_open_orders': ['mainnet'],
    'sei_citrex_list_positions': ['mainnet'],
    'sei_citrex_place_order': ['mainnet'],
    'sei_citrex_place_orders': ['mainnet'],
    
    // Social Operations (Mainnet Only)
    'sei_post_tweet': ['mainnet'],
    'sei_get_account_details': ['mainnet'],
    'sei_get_account_mentions': ['mainnet'],
    'sei_post_tweet_reply': ['mainnet'],
    
    // Carbon Strategies (Mainnet Only)
    'sei_compose_trade_by_source_tx': ['mainnet'],
    'sei_compose_trade_by_target_tx': ['mainnet'],
    'sei_create_buy_sell_strategy': ['mainnet'],
    'sei_create_overlapping_strategy': ['mainnet'],
    'sei_delete_strategy': ['mainnet'],
    'sei_get_user_strategies': ['mainnet'],
    'sei_update_strategy': ['mainnet'],




  };

  // Available tools with labels and categories
  const AVAILABLE_TOOLS = [
    // Basic Operations
    { value: 'sei_erc20_balance', label: 'Get ERC-20 Token Balance', category: 'Basic' },
    { value: 'sei_erc20_transfer', label: 'Transfer ERC-20 Tokens', category: 'Basic' },
    { value: 'sei_native_transfer', label: 'Transfer Native SEI', category: 'Basic' },
    { value: 'sei_erc721_balance', label: 'Get NFT Balance', category: 'Basic' },
    { value: 'sei_erc721_transfer', label: 'Transfer NFT', category: 'Basic' },
    { value: 'sei_erc721_mint', label: 'Mint NFT', category: 'Basic' },
    
    // DeFi Operations
    { value: 'sei_swap', label: 'Symphony - Swap Tokens', category: 'DeFi' },
    { value: 'sei_stake', label: 'Stake SEI Tokens', category: 'DeFi' },
    { value: 'sei_unstake', label: 'Unstake SEI Tokens', category: 'DeFi' },
    { value: 'sei_mint_takara', label: 'Takara - Mint tTokens', category: 'DeFi' },
    { value: 'sei_borrow_takara', label: 'Takara - Borrow Assets', category: 'DeFi' },
    { value: 'sei_repay_takara', label: 'Takara - Repay Loan', category: 'DeFi' },
    { value: 'sei_redeem_takara', label: 'Takara - Redeem Assets', category: 'DeFi' },
    
    // Trading Operations
    { value: 'sei_citrex_place_order', label: 'Citrex - Place Trading Order', category: 'Trading' },
    { value: 'sei_citrex_get_products', label: 'Citrex - Get Trading Products', category: 'Trading' },
    { value: 'sei_citrex_get_order_book', label: 'Citrex - Get Order Book', category: 'Trading' },
    { value: 'sei_citrex_list_balances', label: 'Citrex - Get Trading Balance', category: 'Trading' },
    { value: 'sei_citrex_deposit', label: 'Citrex - Deposit Funds', category: 'Trading' },
    { value: 'sei_citrex_withdraw', label: 'Citrex - Withdraw Funds', category: 'Trading' },
    { value: 'sei_citrex_get_account_health', label: 'Citrex - Get Account Health', category: 'Trading' },
    { value: 'sei_citrex_list_open_orders', label: 'Citrex - List Open Orders', category: 'Trading' },
    { value: 'sei_citrex_cancel_order', label: 'Citrex - Cancel Order', category: 'Trading' },
    
    // Social Operations
    { value: 'sei_post_tweet', label: 'Twitter - Post Tweet', category: 'Social' },
    { value: 'sei_get_account_details', label: 'Twitter - Get Account Details', category: 'Social' },
    { value: 'sei_post_tweet_reply', label: 'Twitter - Reply to Tweet', category: 'Social' },
    
    // Carbon Strategies
    { value: 'sei_compose_trade_by_source_tx', label: 'Carbon - Compose Trade by Source', category: 'Carbon' },
    { value: 'sei_compose_trade_by_target_tx', label: 'Carbon - Compose Trade by Target', category: 'Carbon' },
    { value: 'sei_create_buy_sell_strategy', label: 'Carbon - Create Buy/Sell Strategy', category: 'Carbon' },
    { value: 'sei_create_overlapping_strategy', label: 'Carbon - Create Overlapping Strategy', category: 'Carbon' },
    { value: 'sei_delete_strategy', label: 'Carbon - Delete Strategy', category: 'Carbon' },
    { value: 'sei_get_user_strategies', label: 'Carbon - Get User Strategies', category: 'Carbon' },
    { value: 'sei_update_strategy', label: 'Carbon - Update Strategy', category: 'Carbon' },
    

  ];

  const renderBlockchainConfig = () => {
    // Get available tools based on selected network
    const getAvailableTools = (selectedNetwork: string) => {
      return AVAILABLE_TOOLS.filter(tool => 
        TOOL_NETWORK_SUPPORT[tool.value as keyof typeof TOOL_NETWORK_SUPPORT]?.includes(selectedNetwork)
      );
    };
    
    const availableTools = getAvailableTools(blockchainNetwork);
    
    // Tool parameter schemas
    const toolSchemas = {
      // Basic Operations
      sei_erc20_balance: [
        { name: 'contract_address', type: 'string', label: 'Contract Address', required: true, placeholder: '0x...' }
      ],
      sei_erc20_transfer: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' },
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC, USDT' }
      ],
      sei_native_transfer: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' }
      ],
      sei_erc721_balance: [
        { name: 'collectionAddress', type: 'string', label: 'Collection Address', required: true, placeholder: '0x...' }
      ],
      sei_erc721_transfer: [
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' },
        { name: 'tokenId', type: 'string', label: 'Token ID', required: true, placeholder: '1' },
        { name: 'collectionAddress', type: 'string', label: 'Collection Address', required: true, placeholder: '0x...' }
      ],
      sei_erc721_mint: [
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' },
        { name: 'tokenId', type: 'string', label: 'Token ID', required: true, placeholder: '1' },
        { name: 'collectionAddress', type: 'string', label: 'Collection Address', required: true, placeholder: '0x...' }
      ],

      // DeFi Operations
      sei_swap: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'tokenIn', type: 'string', label: 'Token In Address', required: true, placeholder: '0x...' },
        { name: 'tokenOut', type: 'string', label: 'Token Out Address', required: true, placeholder: '0x...' }
      ],
      sei_stake: [
        { name: 'amount', type: 'string', label: 'Amount to Stake', required: true, placeholder: '10' }
      ],
      sei_unstake: [
        { name: 'amount', type: 'string', label: 'Amount to Unstake', required: true, placeholder: '10' }
      ],

      // Takara Operations
      sei_mint_takara: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC' },
        { name: 'amount', type: 'string', label: 'Amount to Mint', required: true, placeholder: '100' }
      ],
      sei_borrow_takara: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC' },
        { name: 'borrowAmount', type: 'string', label: 'Borrow Amount', required: true, placeholder: '100' }
      ],
      sei_repay_takara: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC' },
        { name: 'repayAmount', type: 'string', label: 'Repay Amount', required: true, placeholder: '100' }
      ],
      sei_redeem_takara: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC' },
        { name: 'amount', type: 'string', label: 'Amount to Redeem', required: true, placeholder: '100' }
      ],

      // Citrex Trading
      sei_citrex_place_order: [
        { name: 'orderArgs', type: 'object', label: 'Order Arguments', required: true, placeholder: '{"side": "buy", "size": "10", "price": "1.5"}' }
      ],
      sei_citrex_get_products: [],
      sei_citrex_get_order_book: [
        { name: 'product_id', type: 'string', label: 'Product ID', required: true, placeholder: 'SEI-USDC' },
        { name: 'aggregation', type: 'string', label: 'Aggregation Level', required: false, placeholder: '0.01' }
      ],
      sei_citrex_list_balances: [],
      sei_citrex_deposit: [
        { name: 'amount', type: 'string', label: 'Deposit Amount', required: true, placeholder: '100' }
      ],
      sei_citrex_withdraw: [
        { name: 'amount', type: 'string', label: 'Withdraw Amount', required: true, placeholder: '100' }
      ],
      sei_citrex_get_account_health: [],
      sei_citrex_list_open_orders: [],
      sei_citrex_cancel_order: [
        { name: 'order_id', type: 'string', label: 'Order ID', required: true, placeholder: '12345' }
      ],

      // Social Operations
      sei_post_tweet: [
        { name: 'tweet', type: 'string', label: 'Tweet Content', required: true, placeholder: 'Your tweet here...' }
      ],
      sei_get_account_details: [
        { name: 'username', type: 'string', label: 'Username', required: true, placeholder: '@username' }
      ],
      sei_post_tweet_reply: [
        { name: 'tweet', type: 'string', label: 'Reply Content', required: true, placeholder: 'Your reply...' },
        { name: 'reply_to_tweet_id', type: 'string', label: 'Tweet ID to Reply To', required: true, placeholder: '1234567890' }
      ],

      // Carbon Strategies
      sei_compose_trade_by_source_tx: [
        { name: 'sourceAmount', type: 'string', label: 'Source Amount', required: true, placeholder: '100' },
        { name: 'sourceToken', type: 'string', label: 'Source Token', required: true, placeholder: '0x...' },
        { name: 'targetToken', type: 'string', label: 'Target Token', required: true, placeholder: '0x...' },
        { name: 'tradeActions', type: 'object', label: 'Trade Actions', required: true, placeholder: '[]' }
      ],
      sei_compose_trade_by_target_tx: [
        { name: 'targetAmount', type: 'string', label: 'Target Amount', required: true, placeholder: '100' },
        { name: 'sourceToken', type: 'string', label: 'Source Token', required: true, placeholder: '0x...' },
        { name: 'targetToken', type: 'string', label: 'Target Token', required: true, placeholder: '0x...' },
        { name: 'tradeActions', type: 'object', label: 'Trade Actions', required: true, placeholder: '[]' }
      ],
      sei_create_buy_sell_strategy: [
        { name: 'baseToken', type: 'string', label: 'Base Token', required: true, placeholder: '0x...' },
        { name: 'quoteToken', type: 'string', label: 'Quote Token', required: true, placeholder: '0x...' },
        { name: 'buyMin', type: 'string', label: 'Buy Min Price', required: true, placeholder: '1.0' },
        { name: 'buyMax', type: 'string', label: 'Buy Max Price', required: true, placeholder: '1.2' },
        { name: 'sellMin', type: 'string', label: 'Sell Min Price', required: true, placeholder: '1.3' },
        { name: 'sellMax', type: 'string', label: 'Sell Max Price', required: true, placeholder: '1.5' },
        { name: 'buyBudget', type: 'string', label: 'Buy Budget', required: true, placeholder: '1000' },
        { name: 'sellBudget', type: 'string', label: 'Sell Budget', required: true, placeholder: '1000' }
      ],
      sei_create_overlapping_strategy: [
        { name: 'baseToken', type: 'string', label: 'Base Token', required: true, placeholder: '0x...' },
        { name: 'quoteToken', type: 'string', label: 'Quote Token', required: true, placeholder: '0x...' },
        { name: 'min', type: 'string', label: 'Min Price', required: true, placeholder: '1.0' },
        { name: 'max', type: 'string', label: 'Max Price', required: true, placeholder: '2.0' },
        { name: 'marginalPriceMin', type: 'string', label: 'Marginal Price Min', required: true, placeholder: '1.1' },
        { name: 'marginalPriceMax', type: 'string', label: 'Marginal Price Max', required: true, placeholder: '1.9' },
        { name: 'budget', type: 'string', label: 'Budget', required: true, placeholder: '1000' }
      ],
      sei_delete_strategy: [
        { name: 'strategyId', type: 'string', label: 'Strategy ID', required: true, placeholder: '123' }
      ],
      sei_get_user_strategies: [],
      sei_update_strategy: [
        { name: 'strategyId', type: 'string', label: 'Strategy ID', required: true, placeholder: '123' },
        { name: 'encoded_data', type: 'string', label: 'Encoded Data', required: true, placeholder: '0x...' }
      ],



    };
    
    const currentSchema = toolSchemas[blockchainSelectedTool as keyof typeof toolSchemas] || [];
    
    return (
      <div className="space-y-4">
        {/* Network Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Network Environment
          </label>
          <select
            value={blockchainNetwork}
            onChange={(e) => {
              const newNetwork = e.target.value;
              
              setBlockchainNetwork(newNetwork);
              
              // Reset tool selection if current tool is not supported on new network
              if (blockchainSelectedTool && !getAvailableTools(newNetwork).find(t => t.value === blockchainSelectedTool)) {
                setBlockchainSelectedTool('');
                setBlockchainToolParameters({});
              }
              
              // Update node config
              const newConfig = {
                ...config,
                network: newNetwork,
                selectedTool: blockchainSelectedTool && !getAvailableTools(newNetwork).find(t => t.value === blockchainSelectedTool) ? '' : blockchainSelectedTool,
                toolParameters: blockchainSelectedTool && !getAvailableTools(newNetwork).find(t => t.value === blockchainSelectedTool) ? {} : blockchainToolParameters
              };
              
              if (selectedNode) {
                onNodeDataChange(selectedNode.id, { config: newConfig });
              }
            }}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200 cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="mainnet">Mainnet (All Operations)</option>
            <option value="testnet">Testnet (Basic Operations Only)</option>
          </select>
        </div>
        
        {/* Network Warning */}
        {blockchainNetwork !== 'mainnet' && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-300 text-sm font-medium">
                {blockchainNetwork.toUpperCase()} Environment
              </span>
            </div>
            <p className="text-yellow-200 text-xs mt-1">
              Only basic operations (ERC-20, Native SEI) are available on {blockchainNetwork}. 
              DeFi protocols require mainnet.
            </p>
          </div>
        )}
        
        {/* Tool Selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1">
            Blockchain Operation
          </label>
          <select
            value={blockchainSelectedTool}
            onChange={(e) => {
              const selectedValue = e.target.value;
              
              // Update local state
              setBlockchainSelectedTool(selectedValue);
              setBlockchainToolParameters({});
              
              // Update node config
              const newConfig = {
                ...config,
                selectedTool: selectedValue,
                toolParameters: {}
              };
              
              if (selectedNode) {
                onNodeDataChange(selectedNode.id, { config: newConfig });
              }
            }}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200 cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Select a blockchain operation</option>
            {availableTools.map(tool => (
              <option key={tool.value} value={tool.value} className="bg-gray-700 text-white">
                {tool.label} ({tool.category})
              </option>
            ))}
          </select>
        </div>
        
        {/* Dynamic Parameters */}
        {blockchainSelectedTool && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Parameters</h4>
            {currentSchema.map(param => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {param.label} {param.required && <span className="text-red-400">*</span>}
                </label>
                {(param as any).description && (
                  <p className="text-xs text-gray-400 mb-2 bg-gray-800/50 p-2 rounded border-l-2 border-blue-500">
                    💡 {(param as any).description}
                  </p>
                )}
                {param.type === 'string' && (
                  <ValueSelector
                    value={blockchainToolParameters[param.name] || ''}
                    onChange={(value) => {
                      const newParams = { ...blockchainToolParameters, [param.name]: value };
                      setBlockchainToolParameters(newParams);
                      
                      // Update node config
                      const newConfig = {
                        ...config,
                        toolParameters: newParams
                      };
                      
                      if (selectedNode) {
                        onNodeDataChange(selectedNode.id, { config: newConfig });
                      }
                    }}
                    variables={declaredVariables}
                    expectedType="string"
                    placeholder={param.placeholder}
                  />
                )}
                {param.type === 'object' && (
                  <textarea
                    value={JSON.stringify(blockchainToolParameters[param.name] || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const value = JSON.parse(e.target.value);
                        const newParams = { ...blockchainToolParameters, [param.name]: value };
                        setBlockchainToolParameters(newParams);
                        
                        // Update node config
                        const newConfig = {
                          ...config,
                          toolParameters: newParams
                        };
                        
                        if (selectedNode) {
                          onNodeDataChange(selectedNode.id, { config: newConfig });
                        }
                      } catch (error) {
                        // Handle invalid JSON
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                    placeholder={param.placeholder}
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Output Variable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Output Variable (optional)
          </label>
          <TypeSelector
            value={config.outputVariable || ''}
            onChange={(value) => {
              const newConfig = {
                ...config,
                outputVariable: value
              };
              
              // Update local state immediately
              setConfig(newConfig);
              
              if (selectedNode) {
                onNodeDataChange(selectedNode.id, { config: newConfig });
              }
            }}
            variables={declaredVariables}
            placeholder="Variable to store result"
          />
        </div>
        
        {/* Tool Description */}
        {blockchainSelectedTool && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Operation Description</h4>
            <p className="text-xs text-gray-400">
              {getToolDescription(blockchainSelectedTool)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getToolDescription = (toolName: string) => {
    const descriptions: Record<string, string> = {
      'sei_erc20_balance': 'Get the balance of ERC-20 tokens for the connected wallet',
      'sei_erc20_transfer': 'Transfer ERC-20 tokens to another address',
      'sei_native_transfer': 'Transfer native SEI tokens to another address',
      'sei_swap': 'Swap tokens using the Symphony aggregator',
      'sei_stake': 'Stake SEI tokens to earn rewards',
      'sei_borrow_takara': 'Borrow tokens from the Takara lending protocol',
      'sei_citrex_place_order': 'Place a trading order on Citrex perpetual exchange',
      'sei_post_tweet': 'Post a tweet to Twitter'
    };
    return descriptions[toolName] || 'Execute blockchain operation';
  };

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Output Mode
        </label>
        <select
          value={config.outputMode || 'assistant'}
          onChange={(e) => handleConfigChange('outputMode', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="assistant">AI Assistant (Conversational)</option>
          <option value="action">Action Engine (Automation)</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Action Engine returns structured JSON for automation flows, Assistant provides conversational responses
        </p>
      </div>

      {config.outputMode === 'action' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Available Actions
          </label>
            <input
            type="text"
              value={config.availableActions ?? 'buy_sei,sell_sei,stake_sei,hold,rebalance'}
            onChange={(e) => handleConfigChange('availableActions', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
            placeholder="Comma-separated actions (e.g., buy_sei,sell_sei,stake_sei)"
          />
          <p className="text-xs text-gray-400 mt-1">
            Define what actions the LLM can return for automation
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Analysis Type
        </label>
        <select
          value={config.analysisType || 'general'}
          onChange={(e) => handleConfigChange('analysisType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="general">General AI Assistant</option>
          <option value="portfolio">Portfolio Analyzer</option>
          <option value="trading">Trading Assistant</option>
          <option value="defi">DeFi Specialist</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Portfolio Analyzer provides specialized blockchain portfolio analysis with risk assessment
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Network
        </label>
        <select
          value={config.network || 'mainnet'}
          onChange={(e) => handleConfigChange('network', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="mainnet">Mainnet (Production)</option>
          <option value="testnet">Testnet (Testing)</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Mainnet provides full DeFi access, testnet for testing
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          System Prompt
        </label>
        <textarea
          value={config.systemPrompt || config.prompt || ''}
          onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
          placeholder="Define the LLM's role and capabilities..."
          rows={4}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Input
        </label>
        <ValueSelector
          value={config.input || ''}
          onChange={(value) => handleConfigChange('input', value)}
          variables={declaredVariables}
          expectedType="string"
          placeholder="Enter input or select variable"
        />
      </div>
      
              <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Output Variable
          </label>
          <TypeSelector
            value={config.outputVariable || ''}
            onChange={(value) => {
              const newConfig = {
                ...config,
                outputVariable: value
              };
              
              // Update local state immediately
              setConfig(newConfig);
              
              if (selectedNode) {
                onNodeDataChange(selectedNode.id, { config: newConfig });
              }
            }}
            variables={declaredVariables}
            placeholder="Variable to store LLM output"
          />
        </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={config.chatInterface || false}
          onChange={(e) => handleConfigChange('chatInterface', e.target.checked)}
          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-300">
          Enable Interactive Chat (Terminal)
        </label>
      </div>
      
      {config.chatInterface && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-blue-300 font-medium">Interactive Chat Mode</span>
          </div>
          <p className="text-xs text-gray-400">
            When enabled, this LLM node will open an interactive terminal chat interface. 
            Users can have real-time conversations with the AI agent, which has access to all blockchain tools.
            The chat session will start with the configured input message.
          </p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Model
        </label>
        <select
          value={config.model || 'gpt-4o-mini'}
          onChange={(e) => handleConfigChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="gpt-4o-mini">GPT-4o-mini</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4.1">GPT-4.1</option>
          <option value="gpt-4.1-mini">GPT-4.1-mini</option>
          <option value="gpt-4-turbo">GPT-4 Turbo (legacy)</option>
          <option value="gpt-4">GPT-4 (legacy)</option>
          <option value="o3">o3 (reasoning)</option>
          <option value="o3-mini">o3-mini (reasoning)</option>
          <option value="gpt-5">GPT-5</option>
          <option value="gpt-5-mini">GPT-5-mini</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Temperature
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature || 0}
          onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{config.temperature || 0}</span>
      </div>
    </div>
  );

  const renderStartConfig = () => {
    return (
      <div className="space-y-4">
        <VariableDeclarationPanel
          variables={declaredVariables}
          onVariablesChange={(newVariables) => {
            console.log('Start node variables changed:', newVariables);
            // Update the node's config with the new variables
            if (selectedNode) {
              const newConfig = {
                ...config,
                variables: newVariables
              };
              setConfig(newConfig);
              onNodeDataChange(selectedNode.id, { config: newConfig });
            }
            // Also call the parent's onVariablesChange
            onVariablesChange(newVariables);
          }}
        />
      </div>
    );
  };

  const renderTelegramConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bot Token
        </label>
        <input
          type="text"
          value={config.botToken || ''}
          onChange={(e) => handleConfigChange('botToken', e.target.value)}
          placeholder="Enter Telegram bot token"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Leave empty to use TELEGRAM_BOT_TOKEN environment variable
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Chat ID
        </label>
        <input
          type="text"
          value={config.chatId || ''}
          onChange={(e) => handleConfigChange('chatId', e.target.value)}
          placeholder="Enter Telegram chat ID"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Leave empty to use TELEGRAM_CHAT_ID environment variable
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Message
        </label>
        <textarea
          value={config.message || ''}
          onChange={(e) => handleConfigChange('message', e.target.value)}
          placeholder="Enter message to send"
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Use {'{variableName}'} to include variables
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.interactive || false}
            onChange={(e) => handleConfigChange('interactive', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-300">Interactive Message</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          Enable to send messages with inline buttons
        </p>
      </div>

      {config.interactive && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buttons
          </label>
          <div className="space-y-2">
            {(config.buttons || []).map((button: any, index: number) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={button.text || ''}
                  onChange={(e) => {
                    const newButtons = [...(config.buttons || [])];
                    newButtons[index] = { ...newButtons[index], text: e.target.value };
                    handleConfigChange('buttons', newButtons);
                  }}
                  placeholder="Button text"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={button.value || ''}
                  onChange={(e) => {
                    const newButtons = [...(config.buttons || [])];
                    newButtons[index] = { ...newButtons[index], value: e.target.value };
                    handleConfigChange('buttons', newButtons);
                  }}
                  placeholder="Button value"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newButtons = (config.buttons || []).filter((_: any, i: number) => i !== index);
                    handleConfigChange('buttons', newButtons);
                  }}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newButtons = [...(config.buttons || []), { text: '', value: '' }];
                handleConfigChange('buttons', newButtons);
              }}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Add Button
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Output Variable
        </label>
        <input
          type="text"
          value={config.outputVariable || ''}
          onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
          placeholder="Variable name to store result"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderUserApprovalConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Approval Type
        </label>
        <select
          value={config.approvalType || 'telegram'}
          onChange={(e) => handleConfigChange('approvalType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="telegram">Telegram</option>
          <option value="webhook">Webhook</option>
          <option value="cli">CLI</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Timeout (seconds)
        </label>
        <input
          type="number"
          value={config.timeout || 3600}
          onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
          min="60"
          max="86400"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          How long to wait for user approval (1 hour default)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Message
        </label>
        <textarea
          value={config.message || ''}
          onChange={(e) => handleConfigChange('message', e.target.value)}
          placeholder="Message to show to user"
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Approval Actions
        </label>
        <div className="space-y-2">
          {(config.approvalActions || ['approve', 'reject']).map((action: string, index: number) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={action}
                onChange={(e) => {
                  const newActions = [...(config.approvalActions || [])];
                  newActions[index] = e.target.value;
                  handleConfigChange('approvalActions', newActions);
                }}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newActions = (config.approvalActions || []).filter((_: string, i: number) => i !== index);
                  handleConfigChange('approvalActions', newActions);
                }}
                className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newActions = [...(config.approvalActions || []), 'new_action'];
              handleConfigChange('approvalActions', newActions);
            }}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Add Action
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Output Variable
        </label>
        <input
          type="text"
          value={config.outputVariable || ''}
          onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
          placeholder="Variable name to store approval result"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderMarketDataConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Symbol
        </label>
        <input
          type="text"
          value={config.symbol || ''}
          onChange={(e) => handleConfigChange('symbol', e.target.value)}
          placeholder="sei"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1 bg-gray-800/50 p-2 rounded border-l-2 border-blue-500">
          💡 Use lowercase token symbol (e.g., "sei", "btc", "eth"). Check <a href="https://www.coingecko.com/en/api/documentation" target="_blank" className="text-blue-400 hover:underline">CoinGecko API documentation</a> for valid symbols.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Output Variable
        </label>
        <ValueSelector
          value={config.outputVariable || ''}
          onChange={(value) => handleConfigChange('outputVariable', value)}
          placeholder="Select or enter variable name"
          variables={declaredVariables || []}
        />
      </div>
      
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">📊</span>
          <span className="text-blue-400 text-sm font-medium">
            Market Data Output
          </span>
        </div>
        <p className="text-blue-200 text-xs mt-1">
          Returns: price_usd, market_cap, volume_24h, change_24h, last_updated, symbol
        </p>
      </div>
    </div>
  );

  const renderSmartContractReadConfig = () => {

    const handleMethodChange = (methodName: string) => {
      console.log('handleMethodChange called with:', methodName);
      const method = parsedABI?.readMethods.find((m: any) => m.name === methodName);
      console.log('Found method:', method);
      setSelectedMethod(method);
      
      // Update both methodName and parameters in a single config update
      const newConfig = { ...config, methodName, parameters: {} };
      console.log('Updating config with methodName and reset parameters:', newConfig);
      setConfig(newConfig);
      
      if (selectedNode) {
        onNodeDataChange(selectedNode.id, { config: newConfig });
      }
    };

    const handleParameterChange = (paramName: string, value: string) => {
      const newParams = { ...config.parameters };
      newParams[paramName] = value;
      handleConfigChange('parameters', newParams);
    };

    return (
      <div className="space-y-4">
        {/* Network Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Network
          </label>
          <select
            value={config.network || 'ethereum'}
            onChange={(e) => handleConfigChange('network', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          >
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <option key={key} value={key} className="bg-gray-700 text-white">
                {network.name} ({network.nativeCurrency})
              </option>
            ))}
          </select>
        </div>

        {/* Contract Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            value={config.contractAddress || ''}
            onChange={(e) => handleConfigChange('contractAddress', e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ABI Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract ABI
          </label>
          <textarea
            value={config.abi || ''}
            onChange={(e) => handleConfigChange('abi', e.target.value)}
            placeholder='[{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"","type":"uint256"}],"stateMutability":"view"}]'
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
          {parsedABI && !parsedABI.isValid && (
            <p className="text-red-400 text-xs mt-1">{parsedABI.error}</p>
          )}
          {parsedABI && parsedABI.isValid && (
            <p className="text-green-400 text-xs mt-1">
              ✅ Valid ABI - Found {parsedABI.readMethods.length} read methods
            </p>
          )}
        </div>

        {/* Method Selection */}
        {parsedABI && parsedABI.isValid && parsedABI.readMethods.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Method ({parsedABI.readMethods.length} available)
            </label>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mb-1">
              Debug: methodName="{config.methodName}", selectedMethod="{selectedMethod?.name}"
            </div>
            <select
              value={config.methodName || ''}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
            >
              <option value="" className="bg-gray-700 text-white">Select a method...</option>
              {parsedABI.readMethods.map((method: any, index: number) => (
                <option key={index} value={method.name} className="bg-gray-700 text-white">
                  {getMethodSignature(method)}
                </option>
              ))}
            </select>
          </div>
        )}
        {parsedABI && !parsedABI.isValid && (
          <div className="text-red-400 text-xs">
            Invalid ABI: {parsedABI.error}
          </div>
        )}
        {parsedABI && parsedABI.isValid && parsedABI.readMethods.length === 0 && (
          <div className="text-yellow-400 text-xs">
            No read methods found in ABI
          </div>
        )}

        {/* Method Parameters */}
        {selectedMethod && selectedMethod.inputs && selectedMethod.inputs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parameters
            </label>
            <div className="space-y-3">
              {selectedMethod.inputs.map((input: any, index: number) => (
                <div key={index} className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">
                    {input.name} ({input.type})
                  </label>
                  <ValueSelector
                    value={config.parameters?.[input.name] || ''}
                    onChange={(value) => handleParameterChange(input.name, value)}
                    placeholder={`Enter ${input.type} value`}
                    variables={declaredVariables}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Variable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Output Variable
          </label>
          <ValueSelector
            value={config.outputVariable || ''}
            onChange={(value) => handleConfigChange('outputVariable', value)}
            placeholder="Select or enter variable name"
            variables={declaredVariables}
          />
        </div>

        {/* Info Panel */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">📖</span>
            <span className="text-blue-400 text-sm font-medium">
              Smart Contract Read
            </span>
          </div>
          <p className="text-blue-200 text-xs mt-1">
            Read data from any smart contract without gas fees. View and pure functions only.
          </p>
        </div>
      </div>
    );
  };

  const renderSmartContractWriteConfig = () => {

    const handleMethodChange = (methodName: string) => {
      const method = parsedABI?.writeMethods.find((m: any) => m.name === methodName);
      setSelectedMethod(method);
      
      // Update both methodName and parameters in a single config update
      const newConfig = { ...config, methodName, parameters: {} };
      console.log('Updating write config with methodName and reset parameters:', newConfig);
      setConfig(newConfig);
      
      if (selectedNode) {
        onNodeDataChange(selectedNode.id, { config: newConfig });
      }
    };

    const handleParameterChange = (paramName: string, value: string) => {
      const newParams = { ...config.parameters };
      newParams[paramName] = value;
      handleConfigChange('parameters', newParams);
    };

    return (
      <div className="space-y-4">
        {/* Network Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Network
          </label>
          <select
            value={config.network || 'ethereum'}
            onChange={(e) => handleConfigChange('network', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
          >
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <option key={key} value={key} className="bg-gray-700 text-white">
                {network.name} ({network.nativeCurrency})
              </option>
            ))}
          </select>
        </div>

        {/* Contract Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            value={config.contractAddress || ''}
            onChange={(e) => handleConfigChange('contractAddress', e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ABI Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract ABI
          </label>
          <textarea
            value={config.abi || ''}
            onChange={(e) => handleConfigChange('abi', e.target.value)}
            placeholder='[{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"}]'
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
          />
          {parsedABI && !parsedABI.isValid && (
            <p className="text-red-400 text-xs mt-1">{parsedABI.error}</p>
          )}
          {parsedABI && parsedABI.isValid && (
            <p className="text-green-400 text-xs mt-1">
              ✅ Valid ABI - Found {parsedABI.writeMethods.length} write methods
            </p>
          )}
        </div>

        {/* Method Selection */}
        {parsedABI && parsedABI.isValid && parsedABI.writeMethods.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Method ({parsedABI.writeMethods.length} available)
            </label>
            {/* Debug info */}
            <div className="text-xs text-gray-400 mb-1">
              Debug: methodName="{config.methodName}", selectedMethod="{selectedMethod?.name}"
            </div>
            <select
              value={config.methodName || ''}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
            >
              <option value="" className="bg-gray-700 text-white">Select a method...</option>
              {parsedABI.writeMethods.map((method: any, index: number) => (
                <option key={index} value={method.name} className="bg-gray-700 text-white">
                  {getMethodSignature(method)}
                </option>
              ))}
            </select>
          </div>
        )}
        {parsedABI && !parsedABI.isValid && (
          <div className="text-red-400 text-xs">
            Invalid ABI: {parsedABI.error}
          </div>
        )}
        {parsedABI && parsedABI.isValid && parsedABI.writeMethods.length === 0 && (
          <div className="text-yellow-400 text-xs">
            No write methods found in ABI
          </div>
        )}

        {/* Method Parameters */}
        {selectedMethod && selectedMethod.inputs && selectedMethod.inputs.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parameters
            </label>
            <div className="space-y-3">
              {selectedMethod.inputs.map((input: any, index: number) => (
                <div key={index} className="flex flex-col space-y-1">
                  <label className="text-xs text-gray-400">
                    {input.name} ({input.type})
                  </label>
                  <ValueSelector
                    value={config.parameters?.[input.name] || ''}
                    onChange={(value) => handleParameterChange(input.name, value)}
                    placeholder={`Enter ${input.type} value`}
                    variables={declaredVariables}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Options */}
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Transaction Options</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Gas Limit (optional)
              </label>
              <input
                type="text"
                value={config.gasLimit || ''}
                onChange={(e) => handleConfigChange('gasLimit', e.target.value)}
                placeholder="21000"
                className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Gas Price (gwei, optional)
              </label>
              <input
                type="text"
                value={config.gasPrice || ''}
                onChange={(e) => handleConfigChange('gasPrice', e.target.value)}
                placeholder="20"
                className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs text-gray-400 mb-1">
              ETH Value (optional)
            </label>
            <input
              type="text"
              value={config.value || ''}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="mt-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.waitForConfirmation !== false}
                onChange={(e) => handleConfigChange('waitForConfirmation', e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">Wait for transaction confirmation</span>
            </label>
          </div>
        </div>

        {/* Output Variable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Output Variable
          </label>
          <ValueSelector
            value={config.outputVariable || ''}
            onChange={(value) => handleConfigChange('outputVariable', value)}
            placeholder="Select or enter variable name"
            variables={declaredVariables}
          />
        </div>

        {/* Info Panel */}
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400">⚡</span>
            <span className="text-orange-400 text-sm font-medium">
              Smart Contract Write
            </span>
          </div>
          <p className="text-orange-200 text-xs mt-1">
            Execute transactions on smart contracts. Requires gas fees and will modify blockchain state.
          </p>
        </div>
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
      case 'logger':
        return renderLoggerConfig();
      case 'blockchain':
        return renderBlockchainConfig();
      case 'llm':
        return renderLLMConfig();
      case 'telegram':
        return renderTelegramConfig();
      case 'userApproval':
        return renderUserApprovalConfig();
      case 'marketData':
        return renderMarketDataConfig();
      case 'smartContractRead':
        return renderSmartContractReadConfig();
      case 'smartContractWrite':
        return renderSmartContractWriteConfig();
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
      <div className="h-[30vh] bg-gray-800/50 border-t border-gray-700 p-4 backdrop-blur-sm">
        <div className="text-center text-gray-400">
          <Settings className="h-12 w-12 mx-auto mb-2 text-gray-500" />
          <p>Select a node or edge to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[30vh] bg-gray-800/50 border-t border-gray-700 flex flex-col backdrop-blur-sm">
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