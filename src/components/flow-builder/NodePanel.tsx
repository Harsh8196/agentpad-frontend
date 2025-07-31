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

  const handleConfigChange = (key: string, value: any) => {
    console.log('handleConfigChange', key, value);
    const newConfig = { ...config, [key]: value };
    console.log('newConfig', newConfig);
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
            network: 'mainnet',
            selectedTool: '',
            toolParameters: {},
            outputVariable: '',
          };
              case 'llm':
          return {
            prompt: '',
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

  // Tool network support mapping (matching backend)
  const TOOL_NETWORK_SUPPORT = {
    // Basic Operations (All Networks)
    'sei_erc20_balance': ['mainnet', 'testnet', 'devnet'],
    'sei_erc20_transfer': ['mainnet', 'testnet', 'devnet'],
    'sei_native_transfer': ['mainnet', 'testnet', 'devnet'],
    'sei_erc721_balance': ['mainnet', 'testnet', 'devnet'],
    'sei_erc721_transfer': ['mainnet', 'testnet', 'devnet'],
    'sei_erc721_mint': ['mainnet', 'testnet', 'devnet'],
    
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
    'sei_update_strategy': ['mainnet']
  };

  // Available tools with labels and categories
  const AVAILABLE_TOOLS = [
    // Basic Operations
    { value: 'sei_erc20_balance', label: 'Get Token Balance', category: 'Basic' },
    { value: 'sei_erc20_transfer', label: 'Transfer Tokens', category: 'Basic' },
    { value: 'sei_native_transfer', label: 'Transfer Native SEI', category: 'Basic' },
    { value: 'sei_erc721_balance', label: 'Get NFT Balance', category: 'Basic' },
    { value: 'sei_erc721_transfer', label: 'Transfer NFT', category: 'Basic' },
    { value: 'sei_erc721_mint', label: 'Mint NFT', category: 'Basic' },
    
    // DeFi Operations
    { value: 'sei_swap', label: 'Swap Tokens', category: 'DeFi' },
    { value: 'sei_stake', label: 'Stake SEI', category: 'DeFi' },
    { value: 'sei_unstake', label: 'Unstake SEI', category: 'DeFi' },
    { value: 'sei_mint_takara', label: 'Mint tTokens', category: 'DeFi' },
    { value: 'sei_borrow_takara', label: 'Borrow from Takara', category: 'DeFi' },
    { value: 'sei_repay_takara', label: 'Repay to Takara', category: 'DeFi' },
    { value: 'sei_redeem_takara', label: 'Redeem from Takara', category: 'DeFi' },
    
    // Trading Operations
    { value: 'sei_citrex_place_order', label: 'Place Trading Order', category: 'Trading' },
    { value: 'sei_citrex_get_products', label: 'Get Trading Products', category: 'Trading' },
    { value: 'sei_citrex_get_order_book', label: 'Get Order Book', category: 'Trading' },
    { value: 'sei_citrex_list_balances', label: 'Get Trading Balance', category: 'Trading' },
    
    // Social Operations
    { value: 'sei_post_tweet', label: 'Post Tweet', category: 'Social' },
    { value: 'sei_get_account_details', label: 'Get Account Details', category: 'Social' }
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
      sei_erc20_balance: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: false, placeholder: 'SEI, USDC, USDT' },
        { name: 'contract_address', type: 'string', label: 'Contract Address', required: false, placeholder: '0x...' }
      ],
      sei_erc20_transfer: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' },
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: false, placeholder: 'SEI, USDC, USDT' }
      ],
      sei_native_transfer: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'recipient', type: 'string', label: 'Recipient Address', required: true, placeholder: '0x...' }
      ],
      sei_swap: [
        { name: 'amount', type: 'string', label: 'Amount', required: true, placeholder: '1.5' },
        { name: 'tokenIn', type: 'string', label: 'Token In Address', required: true, placeholder: '0x...' },
        { name: 'tokenOut', type: 'string', label: 'Token Out Address', required: true, placeholder: '0x...' }
      ],
      sei_stake: [
        { name: 'amount', type: 'string', label: 'Amount to Stake', required: true, placeholder: '10' }
      ],
      sei_borrow_takara: [
        { name: 'ticker', type: 'string', label: 'Token Ticker', required: true, placeholder: 'SEI, USDC' },
        { name: 'borrowAmount', type: 'string', label: 'Borrow Amount', required: true, placeholder: '100' }
      ],
      sei_citrex_place_order: [
        { name: 'orderArgs', type: 'object', label: 'Order Arguments', required: true, placeholder: 'JSON object' }
      ],
      sei_post_tweet: [
        { name: 'tweet', type: 'string', label: 'Tweet Content', required: true, placeholder: 'Your tweet here...' }
      ]
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
            <option value="devnet">Devnet (Basic Operations Only)</option>
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
          System Prompt
        </label>
        <textarea
          value={config.prompt || ''}
          onChange={(e) => handleConfigChange('prompt', e.target.value)}
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
          Enable Chat Interface
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Model
        </label>
        <select
          value={config.model || 'gpt-4-turbo'}
          onChange={(e) => handleConfigChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm transition-all duration-200"
        >
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
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
      case 'llm':
        return renderLLMConfig();
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