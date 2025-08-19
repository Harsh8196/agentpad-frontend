'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, Book, Code, Zap, Database, MessageSquare, Timer, Brain, Shield, Settings, GitBranch, Activity, Smartphone, CheckCircle, AlertCircle, BarChart3, Globe, Wallet, ChevronLeft, Sparkles, Map } from 'lucide-react';

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const nodes = [
    {
      id: 'start',
      name: 'Start Node',
      icon: <Settings className="w-5 h-5" />,
      category: 'Core',
      description: 'Entry point for all workflows. Initializes variables and sets up the execution context.',
      useCases: [
        'Define user addresses and contract addresses',
        'Set default values for calculations',
        'Initialize configuration parameters',
        'Declare workflow variables'
      ],
      inputSchema: {},
      outputSchema: { variables: 'Initialized values as declared' },
      configSchema: {
        variables: 'Array of {name: string, type: "string"|"number"|"boolean"|"array"|"object", defaultValue?: any}'
      },
      examples: [
        {
          title: 'Portfolio Setup',
          config: {
            variables: [
              { name: 'userAddress', type: 'string', defaultValue: '0x...' },
              { name: 'threshold', type: 'number', defaultValue: 1000 },
              { name: 'enabled', type: 'boolean', defaultValue: true }
            ]
          }
        }
      ]
    },
    {
      id: 'marketData',
      name: 'Market Data Node',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'Data Sources',
      description: 'Fetches real-time cryptocurrency prices and market data from CoinGecko API.',
      useCases: [
        'Get current token prices for portfolio valuation',
        'Monitor price changes for alerts',
        'Calculate percentage changes',
        'Track market cap and volume'
      ],
      inputSchema: { symbol: 'Token symbol (string)' },
      outputSchema: {
        price_usd: 'Current price in USD (number)',
        price_btc: 'Current price in BTC (number)',
        volume_24h: '24-hour trading volume (number)',
        market_cap: 'Market capitalization (number)',
        price_change_24h: '24-hour price change percentage (number)'
      },
      configSchema: {
        symbol: 'Token symbol (e.g., "sei", "bitcoin", "ethereum")',
        outputVariable: 'Variable name to store the result object'
      },
      examples: [
        {
          title: 'SEI Price Monitoring',
          config: { symbol: 'sei', outputVariable: 'seiPrice' },
          usage: 'Access USD price with: {seiPrice.price_usd}'
        }
      ]
    },
    {
      id: 'blockchain',
      name: 'Blockchain Node',
      icon: <Wallet className="w-5 h-5" />,
      category: 'Blockchain',
      description: 'Executes blockchain operations using sei-agent-kit. Supports balance queries, transfers, DeFi protocols, and more.',
      useCases: [
        'Check token balances',
        'Execute transfers and transactions',
        'Interact with Takara lending protocol',
        'Trade on Citrex DEX',
        'Stake and unstake tokens'
      ],
      inputSchema: { toolParameters: 'Parameters specific to selected tool' },
      outputSchema: 'Direct result values - balance operations return numbers, transactions return txHash strings',
      configSchema: {
        network: '"mainnet" or "testnet"',
        selectedTool: 'Tool name from available options',
        toolParameters: 'Object with tool-specific parameters',
        outputVariable: 'Variable name to store the result'
      },
      availableTools: [
        'sei_erc20_balance - Get ERC20 token balance',
        'sei_erc20_transfer - Transfer ERC20 tokens',
        'sei_native_transfer - Transfer native SEI',
        'sei_erc721_balance - Get NFT balance',
        'sei_erc721_transfer - Transfer NFT',
        'sei_erc721_mint - Mint NFT',
        'sei_mint_takara - Supply liquidity to Takara',
        'sei_borrow_takara - Borrow from Takara protocol',
        'sei_repay_takara - Repay Takara loan',
        'sei_redeem_takara - Withdraw from Takara',
        'sei_citrex_place_order - Place order on Citrex DEX',
        'sei_citrex_get_products - Get available Citrex products',
        'sei_citrex_list_balances - List Citrex balances',
        'sei_stake - Stake SEI tokens',
        'sei_unstake - Unstake SEI tokens'
      ],
      examples: [
        {
          title: 'Check USDC Balance',
          config: {
            network: 'mainnet',
            selectedTool: 'sei_erc20_balance',
            toolParameters: { contract_address: 'usdcTokenContract' },
            outputVariable: 'usdcBalance'
          }
        }
      ]
    },
    {
      id: 'arithmetic',
      name: 'Arithmetic Node',
      icon: <Activity className="w-5 h-5" />,
      category: 'Processing',
      description: 'Performs mathematical operations on numbers and variables. Supports basic arithmetic with proper type checking.',
      useCases: [
        'Calculate portfolio values (balance × price)',
        'Compute percentage changes',
        'Sum multiple values',
        'Calculate ratios and metrics'
      ],
      inputSchema: { value1: 'First operand (number)', value2: 'Second operand (number)' },
      outputSchema: { result: 'Calculated result (number)' },
      configSchema: {
        operation: '"add", "subtract", "multiply", or "divide"',
        value1: 'First value - number, variable name, or {object.property}',
        value2: 'Second value - number, variable name, or {object.property}',
        outputVariable: 'Variable name to store the result'
      },
      examples: [
        {
          title: 'Portfolio Value Calculation',
          config: {
            operation: 'multiply',
            value1: 'tokenBalance',
            value2: '{tokenPrice.price_usd}',
            outputVariable: 'tokenValueUSD'
          }
        }
      ]
    },
    {
      id: 'conditional',
      name: 'Conditional Node',
      icon: <GitBranch className="w-5 h-5" />,
      category: 'Logic',
      description: 'Creates branching logic based on comparisons. Routes workflow execution based on conditions.',
      useCases: [
        'Check if portfolio value exceeds threshold',
        'Compare prices for arbitrage opportunities',
        'Validate transaction results',
        'Implement risk management logic'
      ],
      inputSchema: { value1: 'First comparison value', value2: 'Second comparison value' },
      outputSchema: { result: 'Boolean result of comparison' },
      configSchema: {
        operator: '"equals", "greater", "less", or "contains"',
        value1: 'First comparison value',
        value2: 'Second comparison value',
        outputVariable: 'Variable name to store boolean result (optional)'
      },
      examples: [
        {
          title: 'Price Alert Condition',
          config: {
            operator: 'greater',
            value1: 'portfolioValue',
            value2: 'threshold',
            outputVariable: 'shouldAlert'
          }
        }
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram Node',
      icon: <MessageSquare className="w-5 h-5" />,
      category: 'Communication',
      description: 'Sends messages and alerts to Telegram. Bot token and chat ID are configured in backend environment.',
      useCases: [
        'Send portfolio alerts',
        'Notify about completed transactions',
        'Report workflow status',
        'Share market insights'
      ],
      inputSchema: { message: 'Message text with variable placeholders' },
      outputSchema: { messageSent: 'Boolean success status', timestamp: 'Send timestamp' },
      configSchema: {
        message: 'Message text with {variable} placeholders',
        interactive: 'Boolean - whether to include interaction buttons',
        buttons: 'Array of button labels (optional)',
        outputVariable: 'Variable name to store result (optional)'
      },
      examples: [
        {
          title: 'Portfolio Alert',
          config: {
            message: 'Portfolio Value: ${totalValue} USD',
            interactive: false,
            outputVariable: 'telegramResult'
          }
        }
      ]
    },
    {
      id: 'userApproval',
      name: 'User Approval Node',
      icon: <CheckCircle className="w-5 h-5" />,
      category: 'Communication',
      description: 'Pauses workflow execution to wait for user approval via Telegram. Essential for transaction safety.',
      useCases: [
        'Approve large transactions',
        'Confirm trading decisions',
        'Authorize lending operations',
        'Manual intervention points'
      ],
      inputSchema: { message: 'Approval request message' },
      outputSchema: { userDecision: '"approve" or "reject"', timestamp: 'Decision timestamp' },
      configSchema: {
        timeout: 'Timeout in seconds',
        message: 'Approval request message',
        approvalActions: 'Array of allowed actions ["approve", "reject"]',
        outputVariable: 'Variable name to store user decision'
      },
      examples: [
        {
          title: 'Transaction Approval',
          config: {
            timeout: 300,
            message: 'Approve transfer of {amount} USDC?',
            approvalActions: ['approve', 'reject'],
            outputVariable: 'userDecision'
          }
        }
      ]
    },
    {
      id: 'timer',
      name: 'Timer Node',
      icon: <Timer className="w-5 h-5" />,
      category: 'Control Flow',
      description: 'Controls workflow timing with delays or recurring intervals. Essential for monitoring and automation.',
      useCases: [
        'Regular portfolio monitoring',
        'Periodic price checks',
        'Scheduled rebalancing',
        'Rate limiting API calls'
      ],
      inputSchema: {},
      outputSchema: { executionCount: 'Number of executions', timestamp: 'Current timestamp' },
      configSchema: {
        timerType: '"delay" for one-time delay, "interval" for recurring',
        duration: 'Time duration (number)',
        unit: '"ms", "s", or "m"',
        repeatCount: 'Number of repeats (-1 for infinite)',
        timeoutAction: '"continue" - action after timeout',
        outputVariable: 'Variable name to store timer info (optional)'
      },
      examples: [
        {
          title: 'Hourly Monitoring',
          config: {
            timerType: 'interval',
            duration: 1,
            unit: 'h',
            repeatCount: -1,
            timeoutAction: 'continue'
          }
        }
      ]
    },
    {
      id: 'variable',
      name: 'Variable Node',
      icon: <Database className="w-5 h-5" />,
      category: 'Data Management',
      description: 'Manages workflow variables - create, update, or retrieve values during execution.',
      useCases: [
        'Store intermediate calculations',
        'Update counters and flags',
        'Format messages and outputs',
        'Manage workflow state'
      ],
      inputSchema: { value: 'Value to set (for set operation)' },
      outputSchema: { value: 'Current variable value' },
      configSchema: {
        operation: '"set" or "get"',
        variableName: 'Name of the variable to operate on',
        value: 'Value to set (for set operation) - can be literal or reference'
      },
      examples: [
        {
          title: 'Set Status Message',
          config: {
            operation: 'set',
            variableName: 'status',
            value: 'Portfolio monitoring active'
          }
        }
      ]
    },
    {
      id: 'logger',
      name: 'Logger Node',
      icon: <AlertCircle className="w-5 h-5" />,
      category: 'Debugging',
      description: 'Logs messages and values for debugging and monitoring. Essential for workflow troubleshooting.',
      useCases: [
        'Debug variable values',
        'Track workflow progress',
        'Monitor calculation results',
        'Audit workflow execution'
      ],
      inputSchema: { message: 'Log message', value: 'Value to log' },
      outputSchema: {},
      configSchema: {
        level: '"info", "warn", or "error"',
        message: 'Log message with {variable} placeholders',
        value: 'Variable or value to log (optional)'
      },
      examples: [
        {
          title: 'Portfolio Debug Log',
          config: {
            level: 'info',
            message: 'Portfolio calculated',
            value: 'totalValue'
          }
        }
      ]
    },
    {
      id: 'llm',
      name: 'LLM Node',
      icon: <Brain className="w-5 h-5" />,
      category: 'AI & Analysis',
      description: 'AI-powered analysis and decision making using sei-agent-kit\'s LangChain integration. Provides intelligent insights.',
      useCases: [
        'Portfolio risk analysis',
        'Market sentiment analysis',
        'Trading decision support',
        'Complex condition evaluation'
      ],
      inputSchema: { input: 'Text input for analysis' },
      outputSchema: { response: 'AI response text', analysis: 'Structured analysis object' },
      configSchema: {
        outputMode: '"assistant" for text responses',
        analysisType: '"general", "portfolio", or "risk"',
        network: '"mainnet" or "testnet"',
        availableActions: 'Comma-separated list of available actions',
        systemPrompt: 'System prompt for AI context',
        input: 'Input text or variable reference',
        outputVariable: 'Variable name to store AI response',
        model: 'AI model (e.g., "gpt-4o-mini")',
        temperature: 'Randomness level (0-1)'
      },
      examples: [
        {
          title: 'Portfolio Risk Assessment',
          config: {
            outputMode: 'assistant',
            analysisType: 'portfolio',
            network: 'mainnet',
            systemPrompt: 'Analyze portfolio risk',
            input: 'portfolioData',
            outputVariable: 'riskAnalysis',
            model: 'gpt-4o-mini',
            temperature: 0.1
          }
        }
      ]
    },
    {
      id: 'smartContractRead',
      name: 'Smart Contract Read',
      icon: <Code className="w-5 h-5" />,
      category: 'Blockchain',
      description: 'Reads data from smart contracts on any EVM chain. Supports dynamic ABI parsing and method calls.',
      useCases: [
        'Query token balances',
        'Read contract state',
        'Get protocol data',
        'Verify contract conditions'
      ],
      inputSchema: { parameters: 'Method parameters object' },
      outputSchema: { result: 'Method return value', gasUsed: 'Gas consumed for call' },
      configSchema: {
        network: '"ethereum", "polygon", "sei", etc.',
        contractAddress: 'Contract address (0x...)',
        abi: 'Contract ABI as JSON string',
        methodName: 'Method name to call',
        parameters: 'Object with method parameters',
        outputVariable: 'Variable name to store result'
      },
      examples: [
        {
          title: 'Token Balance Query',
          config: {
            network: 'sei',
            contractAddress: '0x...',
            methodName: 'balanceOf',
            parameters: { account: 'userAddress' },
            outputVariable: 'balance'
          },
          usage: 'Access result with: {balance.result}'
        }
      ]
    },
    {
      id: 'smartContractWrite',
      name: 'Smart Contract Write',
      icon: <Zap className="w-5 h-5" />,
      category: 'Blockchain',
      description: 'Executes transactions on smart contracts. Supports gas estimation and transaction confirmation.',
      useCases: [
        'Transfer tokens',
        'Execute swaps',
        'Interact with DeFi protocols',
        'Update contract state'
      ],
      inputSchema: { parameters: 'Transaction parameters object' },
      outputSchema: { txHash: 'Transaction hash', gasUsed: 'Gas consumed', blockNumber: 'Block number' },
      configSchema: {
        network: '"ethereum", "polygon", "sei", etc.',
        contractAddress: 'Contract address (0x...)',
        abi: 'Contract ABI as JSON string',
        methodName: 'Method name to call',
        parameters: 'Object with method parameters',
        gasLimit: 'Gas limit for transaction',
        gasPrice: 'Gas price in wei',
        value: 'ETH value to send (optional)',
        waitForConfirmation: 'Boolean - wait for confirmation',
        outputVariable: 'Variable name to store transaction result'
      },
      examples: [
        {
          title: 'Token Transfer',
          config: {
            network: 'sei',
            contractAddress: 'tokenContract',
            methodName: 'transfer',
            parameters: { to: 'recipient', amount: '1000' },
            gasLimit: '100000',
            waitForConfirmation: true,
            outputVariable: 'txResult'
          },
          usage: 'Access transaction hash with: {txResult.txHash}'
        }
      ]
    }
  ];

  const categories = ['Core', 'Data Sources', 'Blockchain', 'Processing', 'Logic', 'Communication', 'Control Flow', 'Data Management', 'Debugging', 'AI & Analysis'];

  const renderOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">AgentPad Documentation</h1>
        <p className="text-gray-300 text-lg">
          AgentPad is a powerful blockchain automation platform built on top of <strong>sei-agent-kit</strong>. 
          Create sophisticated DeFi workflows with an intuitive visual interface.
        </p>
      </div>



      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-500/30">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          sei-agent-kit Foundation
        </h2>
        <div className="space-y-4 text-gray-300">
          <p>
            AgentPad is built on <strong>sei-agent-kit</strong>, a comprehensive SDK for SEI blockchain interactions. 
            This provides AgentPad with powerful capabilities:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-400" />
                Blockchain Node Integration
              </h3>
                             <ul className="list-disc list-inside space-y-1 text-sm">
                 <li>Native SEI token operations</li>
                 <li>ERC20/ERC721 token management</li>
                 <li>Takara lending protocol integration</li>
                 <li>Citrex DEX trading capabilities</li>
                 <li>Symphony protocol integration</li>
                 <li>Carbon protocol support</li>
                 <li>Staking and delegation features</li>
                 <li>NFT minting and management</li>
               </ul>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                LLM Node Integration
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>LangChain framework integration</li>
                <li>Multiple AI model support</li>
                <li>Structured output parsing</li>
                <li>Context-aware analysis</li>
                <li>DeFi-specific prompting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-400" />
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Activity className="w-5 h-5" />, title: 'Visual Workflow Builder', desc: 'Drag-and-drop interface for creating complex automation' },
            { icon: <Brain className="w-5 h-5" />, title: 'AI-Powered Generation', desc: 'Natural language to workflow conversion' },
            { icon: <Wallet className="w-5 h-5" />, title: 'DeFi Protocol Support', desc: 'Built-in integrations for major SEI protocols' },
            { icon: <Timer className="w-5 h-5" />, title: 'Real-time Monitoring', desc: 'Continuous portfolio and market monitoring' },
            { icon: <MessageSquare className="w-5 h-5" />, title: 'Telegram Integration', desc: 'Alerts and user approval via Telegram' },
            { icon: <Shield className="w-5 h-5" />, title: 'Security First', desc: 'User approval nodes for transaction safety' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-blue-400">{feature.icon}</div>
                <h3 className="font-medium text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-4">Common Workflow Patterns</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Portfolio Monitoring',
              pattern: 'Start → Timer → Market Data → Blockchain → Arithmetic → Conditional → Telegram',
              description: 'Monitor portfolio value and send alerts when thresholds are met'
            },
            {
              title: 'DeFi Automation',
              pattern: 'Start → Market Data → LLM Analysis → User Approval → Blockchain → Telegram',
              description: 'AI-powered DeFi operations with user confirmation'
            },
            {
              title: 'Rebalancing',
              pattern: 'Start → Timer → Multiple Data Sources → Calculations → Conditional Logic → Transactions',
              description: 'Automated portfolio rebalancing based on target allocations'
            }
          ].map((workflow, idx) => (
            <div key={idx} className="bg-gray-700/30 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-medium text-white mb-1">{workflow.title}</h3>
              <p className="text-blue-300 text-sm font-mono mb-2">{workflow.pattern}</p>
              <p className="text-gray-400 text-sm">{workflow.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNodeDocs = () => {
    const allExpanded = Object.keys(expandedNodes).length > 0 && Object.values(expandedNodes).every(Boolean);
    const toggleAllNodes = () => {
      if (allExpanded) {
        setExpandedNodes({});
      } else {
        const allNodes: Record<string, boolean> = {};
        nodes.forEach(node => {
          allNodes[node.id] = true;
        });
        setExpandedNodes(allNodes);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Node Reference</h1>
            <p className="text-gray-300 mb-8">
              Comprehensive guide to all available nodes, their schemas, and usage patterns.
            </p>
          </div>
          <button
            onClick={toggleAllNodes}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expand All
              </>
            )}
          </button>
        </div>

      {categories.map(category => {
        const categoryNodes = nodes.filter(node => node.category === category);
        if (categoryNodes.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
              {category} Nodes
            </h2>
            
            {categoryNodes.map(node => (
              <div key={node.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleNode(node.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">{node.icon}</div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{node.name}</h3>
                        <p className="text-gray-400 text-sm">{node.description}</p>
                      </div>
                    </div>
                    {expandedNodes[node.id] ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </div>

                {expandedNodes[node.id] && (
                  <div className="border-t border-gray-700 p-6 space-y-6">
                    {/* Use Cases */}
                    <div>
                      <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Use Cases
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 ml-6">
                        {node.useCases.map((useCase, idx) => (
                          <li key={idx}>{useCase}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Schemas */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h5 className="font-medium text-green-400 mb-2 flex items-center gap-1">
                          <Code className="w-4 h-4" />
                          Input Schema
                        </h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto docs-scrollbar">
                          {JSON.stringify(node.inputSchema, null, 2)}
                        </pre>
                      </div>

                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-400 mb-2 flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          Output Schema
                        </h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto docs-scrollbar">
                          {JSON.stringify(node.outputSchema, null, 2)}
                        </pre>
                      </div>

                      <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-400 mb-2 flex items-center gap-1">
                          <Settings className="w-4 h-4" />
                          Config Schema
                        </h5>
                        <pre className="text-xs text-gray-300 overflow-x-auto docs-scrollbar">
                          {JSON.stringify(node.configSchema, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Available Tools */}
                    {node.availableTools && (
                      <div>
                        <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          Available Tools
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {node.availableTools.map((tool, idx) => (
                            <div key={idx} className="bg-gray-700/50 p-2 rounded text-sm text-gray-300 font-mono">
                              {tool}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Examples */}
                    {node.examples && node.examples.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                          <Book className="w-4 h-4 text-orange-400" />
                          Examples
                        </h4>
                        {node.examples.map((example, idx) => (
                          <div key={idx} className="bg-gray-700/30 p-4 rounded-lg border-l-4 border-orange-500">
                            <h5 className="font-medium text-white mb-2">{example.title}</h5>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-400">Configuration:</span>
                                <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded mt-1 overflow-x-auto docs-scrollbar">
                                  {JSON.stringify(example.config, null, 2)}
                                </pre>
                              </div>
                                                             {(example as any).usage && (
                                 <div>
                                   <span className="text-sm font-medium text-gray-400">Usage:</span>
                                   <p className="text-sm text-green-300 font-mono bg-gray-800 p-2 rounded mt-1">
                                     {(example as any).usage}
                                   </p>
                                 </div>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
    );
  };

  const renderAIPlannerExamples = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">AI Planner Examples</h1>
        <p className="text-gray-300 mb-6">
          These detailed prompts demonstrate the full capabilities of AgentPad's AI workflow planner. Each prompt is designed to create comprehensive automation flows that showcase different DeFi use cases.
        </p>
      </div>

             {/* Example 1 */}
       <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
         <div className="flex items-center space-x-3 mb-4">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <span className="text-white font-bold">1</span>
           </div>
           <h2 className="text-xl font-semibold text-white">📈 Price Alert & Notification System</h2>
         </div>
         
         <div className="space-y-4">
           <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
             <h3 className="text-lg font-medium text-blue-300 mb-3">Prompt:</h3>
             <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-950 p-4 rounded border border-gray-700 overflow-x-auto">
{`Create a smart price monitoring system that tracks SEI token price movements and sends targeted alerts:

1. Regular Monitoring: Check SEI price every 15 minutes using CoinGecko market data
2. Price Threshold Detection: Monitor for specific price levels (e.g., above $0.50 or below $0.30)
3. Percentage Change Alerts: Track significant price movements (5% up/down within 1 hour)
4. Volume Analysis: Include 24-hour trading volume in price context
5. Market Trend Indicators: Compare current price to 24-hour high/low values
6. Smart Notifications: Send Telegram alerts only when important thresholds are met
7. Alert Frequency Control: Prevent spam by limiting alerts to once per hour per condition
8. Buy/Sell Opportunity Detection: Identify potential entry/exit points based on price action
9. Historical Comparison: Compare current price to 7-day and 30-day averages
10. Custom Threshold Management: Allow easy adjustment of price alert levels

The system should provide timely, relevant market information without overwhelming the user with constant notifications.`}
             </pre>
           </div>
           
           <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
             <h4 className="text-sm font-medium text-green-300 mb-2">Expected Output:</h4>
             <p className="text-sm text-green-200">
               Timer → Market Data → Arithmetic (price calculations) → Conditional (threshold checks) → Variable (tracking) → Telegram (alerts)
             </p>
           </div>
         </div>
       </div>

      {/* Example 2 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">2</span>
          </div>
          <h2 className="text-xl font-semibold text-white">📊 Takara Protocol Health Monitor & Auto-Liquidation Protection</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-medium text-blue-300 mb-3">Prompt:</h3>
                         <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-950 p-4 rounded border border-gray-700 overflow-x-auto">
{`Design an advanced monitoring system for Takara lending positions that prevents liquidations through automated actions:

1. Position Monitoring: Check user's collateral, borrowed amounts, and current LTV ratio every 15 minutes
2. Market Analysis: Fetch real-time prices for all collateral and borrowed assets
3. Risk Calculation: Calculate current LTV, liquidation threshold (85%), and safety buffer
4. Multi-Level Alerts: 
   - Yellow alert at 70% LTV (telegram notification only)
   - Orange alert at 78% LTV (telegram + email notification)
   - Red alert at 82% LTV (immediate action required)
5. Automated Protection: When LTV exceeds 82%:
   - Calculate minimum repayment needed to bring LTV to 65%
   - Check available USDC balance for repayment
   - If sufficient funds: auto-repay portion of loan
   - If insufficient funds: send urgent notification with manual intervention options
6. Smart Decision Making: Use LLM analysis to determine best protection strategy based on:
   - Current market conditions
   - Available liquidity
   - Gas costs vs liquidation penalty
   - Historical volatility patterns
7. Transaction Execution: Execute repayments or additional collateral deposits automatically
8. Comprehensive Reporting: Generate detailed reports of all actions taken, savings achieved, and system performance

Include safeguards to prevent infinite loops and maximum daily intervention limits.`}
            </pre>
          </div>
          
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-300 mb-2">Expected Output:</h4>
            <p className="text-sm text-green-200">
              Timer → Blockchain (Takara operations) → Market Data → Arithmetic (LTV calculations) → Conditional logic → LLM analysis → User Approval → Blockchain (repay/collateral) → Telegram alerts
            </p>
          </div>
        </div>
      </div>

             {/* Example 3 */}
       <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
         <div className="flex items-center space-x-3 mb-4">
           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
             <span className="text-white font-bold">3</span>
           </div>
           <h2 className="text-xl font-semibold text-white">💰 Automated DCA (Dollar Cost Averaging) Investment Strategy</h2>
         </div>
         
         <div className="space-y-4">
           <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
             <h3 className="text-lg font-medium text-blue-300 mb-3">Prompt:</h3>
             <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-950 p-4 rounded border border-gray-700 overflow-x-auto">
{`Create an automated Dollar Cost Averaging (DCA) system that regularly purchases SEI tokens regardless of price fluctuations:

1. Schedule Setup: Execute purchases every week (every 7 days) using timer automation
2. Budget Management: Set fixed USDC amount to invest each period (e.g., $100 per week)
3. Balance Check: Verify sufficient USDC balance before attempting purchase
4. Market Data: Fetch current SEI price from CoinGecko for record keeping
5. Purchase Execution: Use Symphony DEX to swap USDC for SEI tokens
6. Investment Tracking: Calculate total invested amount and average purchase price
7. Portfolio Monitoring: Track accumulated SEI tokens and current portfolio value
8. Smart Notifications: Send Telegram alerts with purchase confirmation and portfolio summary
9. Safety Features: Include user approval for large purchases above threshold
10. Performance Reporting: Weekly summary of DCA performance vs market timing

The system should handle market volatility gracefully and maintain consistent investment discipline regardless of price movements.`}
             </pre>
           </div>
           
           <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
             <h4 className="text-sm font-medium text-green-300 mb-2">Expected Output:</h4>
             <p className="text-sm text-green-200">
               Timer → Blockchain (balance check) → Market Data → Conditional logic → Blockchain (Symphony swap) → Arithmetic (tracking) → Telegram notifications
             </p>
           </div>
         </div>
       </div>

             {/* Example 4 */}
       <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
         <div className="flex items-center space-x-3 mb-4">
           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
             <span className="text-white font-bold">4</span>
           </div>
           <h2 className="text-xl font-semibold text-white">📊 Simple Portfolio Performance Tracker</h2>
         </div>
         
         <div className="space-y-4">
           <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
             <h3 className="text-lg font-medium text-blue-300 mb-3">Prompt:</h3>
             <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-950 p-4 rounded border border-gray-700 overflow-x-auto">
{`Create a daily portfolio performance tracking system that monitors your DeFi holdings and sends regular updates:

1. Daily Schedule: Check portfolio status every 24 hours at a specific time
2. Token Balance Monitoring: Fetch current balances for major holdings (SEI, USDC, USDT)
3. Price Data Collection: Get current market prices for all tracked tokens from CoinGecko
4. Portfolio Valuation: Calculate total portfolio value in USD
5. Performance Metrics: Compare current value to previous day's value
6. Percentage Calculations: Determine daily gain/loss percentage
7. Trend Analysis: Track 7-day and 30-day performance trends
8. Milestone Detection: Alert when portfolio reaches new highs or drops below thresholds
9. Regular Reporting: Send daily Telegram summary with key metrics
10. Weekly Deep Dive: Generate comprehensive weekly performance report

The system should provide clear insights into portfolio performance and help track investment progress over time.`}
             </pre>
           </div>
           
           <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
             <h4 className="text-sm font-medium text-green-300 mb-2">Expected Output:</h4>
             <p className="text-sm text-green-200">
               Timer → Blockchain (balance queries) → Market Data → Arithmetic (calculations) → Conditional (thresholds) → Variable (storage) → Telegram (reporting)
             </p>
           </div>
         </div>
       </div>

      {/* Key Features Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">🎯 Key Features These Prompts Demonstrate</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-blue-300 mb-3">Node Type Coverage:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Timer:</strong> Automated scheduling and intervals</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Blockchain:</strong> SEI ecosystem operations (Symphony, Takara, Citrex)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Market Data:</strong> Real-time price feeds</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Arithmetic:</strong> Complex financial calculations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Conditional:</strong> Multi-level decision logic</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>LLM:</strong> AI-powered analysis and strategy</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>User Approval:</strong> Risk management and human oversight</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Telegram:</strong> Comprehensive notification system</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Smart Contract:</strong> Custom contract interactions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span><strong>Variable:</strong> Data flow and state management</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-300 mb-3">DeFi Use Cases:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span><strong>Portfolio Management:</strong> Automated rebalancing and optimization</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span><strong>Risk Management:</strong> Liquidation protection and health monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span><strong>Trading Strategies:</strong> Arbitrage and market-making</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span><strong>Emergency Systems:</strong> Crisis response and portfolio insurance</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-medium text-blue-300 mb-3 mt-6">Complexity Levels:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><strong>Beginner:</strong> Simple monitoring and alerts</li>
              <li><strong>Intermediate:</strong> Multi-step automation with approvals</li>
              <li><strong>Advanced:</strong> Complex decision trees and risk management</li>
              <li><strong>Expert:</strong> Full autonomous trading and emergency systems</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">📝 How to Use These Prompts</h2>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span><strong>Copy the entire prompt</strong> (including context and requirements)</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span><strong>Paste into AI Planner</strong> in AgentPad</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span><strong>Review the generated workflow</strong> for completeness</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span><strong>Customize parameters</strong> (timeframes, thresholds, tokens)</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">5</span>
            <span><strong>Test with small amounts</strong> before full deployment</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">6</span>
            <span><strong>Save successful workflows</strong> to template library</span>
          </li>
        </ol>
        
        
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Development Roadmap</h1>
        <p className="text-gray-300 mb-6">
          AgentPad's development roadmap outlines our strategic vision and planned features across multiple quarters. This roadmap reflects our commitment to building the most comprehensive DeFi automation platform.
        </p>
      </div>

      {/* Q3 2024 - Completed */}
      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-green-300">Q3 2024 - Foundation & Core Features</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🎯 Core Platform</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Visual flow builder with ReactFlow integration</li>
                <li>• Real-time flow execution engine</li>
                <li>• Node-based architecture with 15+ node types</li>
                <li>• Variable management and data flow system</li>
                <li>• Template library and workflow sharing</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🔗 Blockchain Integration</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• sei-agent-kit integration for SEI blockchain</li>
                <li>• Support for 15+ blockchain operations</li>
                <li>• Takara lending protocol integration</li>
                <li>• Citrex DEX trading capabilities</li>
                <li>• Smart contract read/write operations</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🤖 AI Integration</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• AI Workflow Planner with natural language input</li>
                <li>• OpenAI GPT-4/5 integration via LangChain</li>
                <li>• Intelligent workflow generation and optimization</li>
                <li>• Context-aware AI suggestions</li>
                <li>• Automated flow validation and error detection</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">📊 Data & Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• CoinGecko market data integration</li>
                <li>• Real-time price monitoring and alerts</li>
                <li>• Portfolio tracking and performance metrics</li>
                <li>• Historical data analysis capabilities</li>
                <li>• Custom data visualization tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Q4 2024 - In Progress */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-blue-300">Q4 2024 - Advanced Features & Deployment</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🚀 Deployment & Infrastructure</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Docker containerization for backend services</li>
                <li>• Cloud deployment automation (AWS/GCP/Azure)</li>
                <li>• Load balancing and auto-scaling capabilities</li>
                <li>• Multi-region deployment support</li>
                <li>• CI/CD pipeline integration</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🔐 Wallet Management</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Multi-wallet support and management</li>
                <li>• Hardware wallet integration (Ledger, Trezor)</li>
                <li>• Wallet security and encryption</li>
                <li>• Transaction signing and approval workflows</li>
                <li>• Gas optimization and fee management</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">🎯 Rivalz.ai ADCS Integration</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Advanced AI decision-making capabilities</li>
                <li>• Predictive analytics and market forecasting</li>
                <li>• Risk assessment and portfolio optimization</li>
                <li>• Automated strategy execution</li>
                <li>• Real-time market sentiment analysis</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">📈 Advanced Analytics</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Advanced portfolio analytics and reporting</li>
                <li>• Performance benchmarking and comparison</li>
                <li>• Risk metrics and volatility analysis</li>
                <li>• Custom dashboard creation</li>
                <li>• Export capabilities for external analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

             {/* Q1 2026 - Future Vision */}
       <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
         <div className="flex items-center space-x-3 mb-4">
           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
             <Zap className="w-5 h-5 text-white" />
           </div>
           <h2 className="text-xl font-semibold text-purple-300">Q1 2026 - Enterprise & Advanced Protocols</h2>
         </div>
         
         <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
               <h3 className="text-lg font-medium text-white mb-3">🏢 Enterprise Features</h3>
               <ul className="space-y-2 text-sm text-gray-300">
                 <li>• Multi-user team collaboration</li>
                 <li>• Role-based access control (RBAC)</li>
                 <li>• Audit trails and compliance reporting</li>
                 <li>• API rate limiting and usage analytics</li>
                 <li>• White-label solutions for institutions</li>
               </ul>
             </div>
             
             <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
               <h3 className="text-lg font-medium text-white mb-3">🌐 Multi-Chain Support</h3>
               <ul className="space-y-2 text-sm text-gray-300">
                 <li>• Ethereum and EVM-compatible chains</li>
                 <li>• Solana blockchain integration</li>
                 <li>• Cross-chain bridge operations</li>
                 <li>• Layer 2 scaling solutions</li>
                 <li>• Interoperability protocols</li>
               </ul>
             </div>
             
             <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
               <h3 className="text-lg font-medium text-white mb-3">🔗 Advanced DeFi Protocols</h3>
               <ul className="space-y-2 text-sm text-gray-300">
                 <li>• Uniswap V4 integration</li>
                 <li>• Aave lending protocol support</li>
                 <li>• Curve stablecoin trading</li>
                 <li>• Yearn Finance yield optimization</li>
                 <li>• Custom protocol connectors</li>
               </ul>
             </div>
           </div>
         </div>
       </div>

      {/* Development Philosophy */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Development Philosophy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Security First</h3>
            <p className="text-sm text-gray-300">
              Every feature is built with security as the foundation, ensuring user assets and data remain protected.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">User Experience</h3>
            <p className="text-sm text-gray-300">
              Intuitive design and seamless workflows make complex DeFi operations accessible to everyone.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Innovation</h3>
            <p className="text-sm text-gray-300">
              Continuous innovation in AI, blockchain integration, and automation to stay ahead of the curve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <style jsx>{`
        .docs-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .docs-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        .docs-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .docs-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .docs-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
      `}</style>
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 border-r border-gray-700 min-h-screen sticky top-0 transition-all duration-300`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && <h2 className="text-xl font-bold text-white">Documentation</h2>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {!sidebarCollapsed && (
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection('nodes')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'nodes' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Node Reference
                </button>
                <button
                  onClick={() => setActiveSection('ai-planner')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'ai-planner' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  AI Planner Examples
                </button>
                <button
                  onClick={() => setActiveSection('roadmap')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'roadmap' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Development Roadmap
                </button>
              </nav>
            )}

            {sidebarCollapsed && (
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full p-2 rounded-lg transition-colors ${
                    activeSection === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  title="Overview"
                >
                  <Book className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSection('nodes')}
                  className={`w-full p-2 rounded-lg transition-colors ${
                    activeSection === 'nodes' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  title="Node Reference"
                >
                  <Code className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSection('ai-planner')}
                  className={`w-full p-2 rounded-lg transition-colors ${
                    activeSection === 'ai-planner' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  title="AI Planner Examples"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSection('roadmap')}
                  className={`w-full p-2 rounded-lg transition-colors ${
                    activeSection === 'roadmap' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  title="Development Roadmap"
                >
                  <Map className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-full">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'nodes' && renderNodeDocs()}
            {activeSection === 'ai-planner' && renderAIPlannerExamples()}
            {activeSection === 'roadmap' && renderRoadmap()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
