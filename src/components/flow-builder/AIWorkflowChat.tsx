'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';

type PlannedFlow = {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data?: any;
    config?: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
  }>;
};

interface AIWorkflowChatProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFlow: (planned: PlannedFlow) => void;
}

const MAX_PROJECT_USES = 3;

const defaultCatalog = [
  {
    type: 'start',
    description: 'Flow starts here. Holds declared variables.',
    inputSchema: {},
    outputSchema: { variables: 'initialized values' },
    configSchema: { variables: 'array of {name, type, defaultValue?}' },
  },
  {
    type: 'marketData',
    description: 'Fetch token prices (CoinGecko API).',
    inputSchema: { symbol: 'string' },
    outputSchema: { 
      'price_usd': 'number',
      'price_btc': 'number', 
      'volume_24h': 'number',
      'market_cap': 'number',
      'price_change_24h': 'number'
    },
    configSchema: { symbol: 'string (e.g. "sei")', outputVariable: 'string variable name' },
    note: 'Use {outputVariable.price_usd} to access USD price in arithmetic operations'
  },
  {
    type: 'arithmetic',
    description: 'Math operations: add, subtract, multiply, divide.',
    inputSchema: { value1: 'number', value2: 'number' },
    outputSchema: { result: 'number' },
    configSchema: { operation: '"add"|"subtract"|"multiply"|"divide"', value1: 'number|variable|property', value2: 'number|variable|property', outputVariable: 'string variable name' },
    note: 'For market data, use {marketDataVar.price_usd} format for value1/value2'
  },
  {
    type: 'conditional',
    description: 'Route flow based on condition comparison.',
    inputSchema: { value1: 'any', value2: 'any' },
    outputSchema: { result: 'boolean' },
    configSchema: { operator: '"equals"|"greater"|"less"|"contains"', value1: 'any|variable|property', value2: 'any|variable|property', outputVariable: 'string variable name (optional)' },
  },
  {
    type: 'telegram',
    description: 'Send messages/alerts to Telegram (bot token from backend env).',
    inputSchema: { message: 'string' },
    outputSchema: { messageSent: 'boolean', timestamp: 'string' },
    configSchema: { message: 'string with {variable} placeholders', interactive: 'boolean', buttons: 'array (optional)', outputVariable: 'string (optional)' },
  },
  {
    type: 'userApproval',
    description: 'Wait for user approval before proceeding (uses backend telegram config).',
    inputSchema: { message: 'string' },
    outputSchema: { userDecision: 'string ("approve"|"reject")', timestamp: 'string' },
    configSchema: { timeout: 'number seconds', message: 'string', approvalActions: 'array ["approve","reject"]', outputVariable: 'string variable name' },
  },
  {
    type: 'blockchain',
    description: 'Execute SEI blockchain operations (Takara lending, Citrex trading, etc).',
    inputSchema: { toolParameters: 'object' },
    outputSchema: 'Direct result value - balance operations return number, transactions return string txHash, other operations return tool-specific data',
    configSchema: { network: '"mainnet"|"testnet"', selectedTool: 'string tool name', toolParameters: 'object with tool params', outputVariable: 'string variable name' },
    availableTools: ['sei_erc20_balance', 'sei_erc20_transfer', 'sei_native_transfer', 'sei_erc721_balance', 'sei_erc721_transfer', 'sei_erc721_mint', 'sei_mint_takara', 'sei_borrow_takara', 'sei_repay_takara', 'sei_redeem_takara', 'sei_citrex_place_order', 'sei_citrex_get_products', 'sei_citrex_list_balances', 'sei_stake', 'sei_unstake'],
    note: 'Returns direct values: balance operations return number (use "balanceVar" NOT "balanceVar.balance"), transactions return txHash string'
  },
  {
    type: 'logger',
    description: 'Log messages and values for debugging.',
    inputSchema: { message: 'string', value: 'any' },
    outputSchema: {},
    configSchema: { level: '"info"|"warn"|"error"', message: 'string with {variable} placeholders', value: 'string|variable|property (optional)' },
  },
  {
    type: 'timer',
    description: 'Add delays or recurring intervals.',
    inputSchema: {},
    outputSchema: { executionCount: 'number', timestamp: 'string' },
    configSchema: { timerType: '"delay"|"interval"', duration: 'number', unit: '"ms"|"s"|"m"', repeatCount: 'number (-1 for infinite)', timeoutAction: '"continue"', outputVariable: 'string (optional)' },
  },
  {
    type: 'variable',
    description: 'Set, get, or modify variables.',
    inputSchema: { value: 'any' },
    outputSchema: { value: 'any' },
    configSchema: { operation: '"set"|"get"', variableName: 'string variable name', value: 'any|variable|property (for set)' },
  },
  {
    type: 'loop',
    description: 'Repeat operations with conditions.',
    inputSchema: { condition: 'boolean' },
    outputSchema: { iterationCount: 'number' },
    configSchema: { condition: 'string condition', maxIterations: 'number' },
  },
  {
    type: 'llm',
    description: 'AI analysis and decision making (optional for complex logic).',
    inputSchema: { input: 'string' },
    outputSchema: { response: 'string', analysis: 'object' },
    configSchema: { outputMode: '"assistant"', analysisType: '"general"|"portfolio"|"risk"', network: '"mainnet"|"testnet"', availableActions: 'string comma-separated', systemPrompt: 'string', input: 'string|variable|property', outputVariable: 'string variable name', model: '"gpt-4o-mini"', temperature: 'number 0-1' },
  },
  {
    type: 'smartContractRead',
    description: 'Read data from smart contracts (any EVM chain).',
    inputSchema: { parameters: 'object' },
    outputSchema: { result: 'any (method-specific)', gasUsed: 'string' },
    configSchema: { network: '"ethereum"|"polygon"|"sei"', contractAddress: 'string address', abi: 'string JSON ABI', methodName: 'string', parameters: 'object', outputVariable: 'string variable name' },
    note: 'Access result with {outputVariable.result}'
  },
  {
    type: 'smartContractWrite',
    description: 'Execute transactions on smart contracts.',
    inputSchema: { parameters: 'object' },
    outputSchema: { txHash: 'string', gasUsed: 'string', blockNumber: 'number' },
    configSchema: { network: '"ethereum"|"polygon"|"sei"', contractAddress: 'string address', abi: 'string JSON ABI', methodName: 'string', parameters: 'object', gasLimit: 'string', gasPrice: 'string', value: 'string', waitForConfirmation: 'boolean', outputVariable: 'string variable name' },
    note: 'Access transaction hash with {outputVariable.txHash}'
  },
];

async function callOpenAIPlanner(userPrompt: string, apiKey: string): Promise<PlannedFlow> {
  const system = `You are an expert workflow planner for AgentPad DeFi automation.

CRITICAL THINKING REQUIRED:
- UNDERSTAND the full requirement - think about what makes the workflow useful and complete
- ANALYZE what components are needed for the workflow to actually work
- CONSIDER the user's intent and add necessary supporting logic

GENERIC WORKFLOW PATTERNS:
- MONITORING: Start → [Timer] → [Data Source] → [Processing] → [Condition Check] → [Action/Alert]
- APPROVAL: Start → [Data/Check] → [User Approval] → [Conditional Action]
- TRADING: Start → [Market Data] → [Analysis] → [User Approval] → [Execution]
- LENDING: Start → [Balance Check] → [Risk Assessment] → [User Approval] → [Action]
- AUTOMATION: Start → [Timer] → [Data] → [Logic] → [Action]

KEY PRINCIPLES:
- ALWAYS initialize variables before using them
- Use Timer nodes for continuous/recurring operations
- Include User Approval before critical actions
- Add meaningful logging for debugging
- Use descriptive variable names
- Follow logical flow: Setup → Data → Process → Decide → Act

STRICT OUTPUT SCHEMA COMPLIANCE:
All nodes have specific input/output schemas. You MUST understand and use these correctly:

⚠️  CRITICAL RULE: BLOCKCHAIN nodes return DIRECT values, NOT objects!
- WRONG: "value1": "{seiBalance.balance}" ❌ 
- CORRECT: "value1": "seiBalance" ✅

1. MARKET DATA NODE:
   - Output: { price_usd: number, price_btc: number, volume_24h: number, market_cap: number, price_change_24h: number }
   - In arithmetic: Use "{marketDataVar.price_usd}" NOT just "marketDataVar"
   - Example: { "value1": "balance", "value2": "{seiPrice.price_usd}", "operation": "multiply" }

2. BLOCKCHAIN NODE:
   - CRITICAL: Returns DIRECT number values, NOT objects
   - WRONG: "{balanceVar.balance}" ❌
   - CORRECT: "balanceVar" ✅
   - Balance operations return raw numbers like 1000.5, not {balance: 1000.5}

3. ARITHMETIC NODE:
   - BLOCKCHAIN balances: Use direct variable name (e.g., "seiBalance" NOT "{seiBalance.balance}")
   - MARKET DATA prices: Use property path (e.g., "{seiPrice.price_usd}")
   - CRITICAL EXAMPLES:
     * WRONG: { "value1": "{seiBalance.balance}", "value2": "{seiPrice.price_usd}" } ❌
     * CORRECT: { "value1": "seiBalance", "value2": "{seiPrice.price_usd}" } ✅

4. SMART CONTRACT NODES:
   - Output: { result: any, gasUsed: string, txHash: string }
   - Access with: "{contractVar.result}" or "{contractVar.txHash}"

5. VARIABLE REFERENCES:
   - Simple variables: "variableName"
   - Object properties: "{objectVar.property}"
   - Use proper property paths based on node output schemas

CRITICAL SCHEMA EXAMPLES (FOLLOW EXACTLY):
- Blockchain balance × Market price: { "value1": "seiBalance", "value2": "{seiPrice.price_usd}", "operation": "multiply" }
- NEVER use: { "value1": "{seiBalance.balance}" } ❌
- ALWAYS use: { "value1": "seiBalance" } ✅ for blockchain variables
- Contract result: { "value1": "{contractResult.result}" }

USE-CASE INFERENCE (GENERIC):
- Identify intent from the prompt and choose nodes accordingly. Do not hardcode examples; reason from available tools.
- If the intent is portfolio monitoring/valuation: for each token mentioned or implied,
  - fetch real-time price (MarketData) and fetch balance (Blockchain),
  - compute tokenValueUSD = balance × price,
  - output BOTH: per-token balances (token units) AND total valuation in USD.
- If the intent is change/alert (e.g., “alert when value/price/portfolio changes”):
  - include Timer, compute current values (using MarketData + Blockchain when token-based),
  - compare against previous values or a threshold variable; prefer percentage when “change” is ambiguous,
  - declare required variables (e.g., previousTotalUSD, threshold) in Start.
- If the intent is price-only monitoring: use Timer + MarketData; if token holdings are referenced, also include balances and USD conversion.
- When parameters are underspecified, declare Start variables (e.g., token contract addresses, thresholds) rather than fabricating placeholder literals.

STRICT TECHNICAL RULES:
- Output ONLY a JSON object with {nodes: [], edges: []} (no Markdown).
- nodes MUST be an ARRAY of node objects, NOT an object with node keys
- Each node MUST have: id, type, position, config
- MUST include a Start node with config.variables listing ALL variables referenced anywhere.
- EVERY node MUST have COMPLETE config following the exact schema. NO EMPTY OR MISSING FIELDS.
- Arithmetic nodes MUST be flat: value1 and value2 are primitives or variable names only. Do NOT nest operation objects; create multiple arithmetic nodes instead and connect them.
- Copy config patterns EXACTLY from the schema examples provided.
- Follow schema types exactly (strings in quotes, numbers as numbers, arrays as arrays).
- Place nodes left to right with x coordinates 100, 300, 500, etc.
- IDs should be short and meaningful.
- Variable names must be descriptive and relevant to the workflow purpose.
- ALL outputVariable fields must be filled with meaningful names.
- ALL blockchain nodes MUST have selectedTool and complete toolParameters.
- EDGES must use "source" and "target" fields, NOT "from" and "to".
- EDGES must have "id", "source", "target" fields at minimum.
- ⚠️ CRITICAL: EDGES cannot have "condition" properties! For conditional logic, use Conditional nodes with separate edges for true/false paths.

CONDITIONAL FLOW STRUCTURE:
- Conditional nodes have TWO outputs: "true" and "false" handles
- Connect edges from conditional node separately: one for true path, one for false path
- Use "sourceHandle" property in edges to specify which output ("true" or "false")
- Example: {"id": "e1", "source": "conditionalNode", "target": "actionNode", "sourceHandle": "true"}
- NEVER use: {"condition": "variable == 'value'"} in edges - this is WRONG!

CRITICAL USER APPROVAL FLOW:
- When using UserApproval nodes, ALWAYS add a Conditional node after to check the decision
- Structure: UserApproval(outputs "userDecision") → Conditional(checks "userDecision" == "approve") → Action
- This ensures actions only execute when user approves

APPROVAL WORKFLOW PATTERN:
- For user approval flows, add a conditional node AFTER UserApproval to check the decision
- UserApproval outputs "userDecision" → Conditional node checks if approved → Execute or skip action
- Example: UserApproval → Conditional(value1="userDecision", value2="approve") → True: Action / False: Skip

CAPABILITIES:
✅ Portfolio rebalancing, LTV monitoring, DCA strategies
✅ Takara lending (mint/borrow/repay/redeem), Citrex trading, SEI staking
✅ Market data fetching, price alerts, Telegram notifications
✅ Smart contract interactions (read/write on EVM chains)
✅ Conditional logic, math operations, user approvals

LIMITATIONS:
❌ Cross-chain bridges, complex arbitrage, MEV strategies
❌ Non-SEI blockchain operations (except EVM smart contracts)
❌ Real-time streaming data, high-frequency trading
❌ Custom protocols not in sei-agent-kit

VARIABLE REFERENCES:
- Variables in config should be just the variable name (e.g., "seiBalance", not "{seiBalance}")
- Only use {variable} syntax in message strings, not in value fields
- For blockchain tools, always specify selectedTool and proper toolParameters
literals. Use Start variables like "seiTokenContract", "usdcTokenContract", "usdtTokenContract". If unknown, set "" and the app will error until provided. - For blockchain REQUIRED parameters (e.g., contract_address), DO NOT use placeholder 

TELEGRAM/APPROVAL NODES:
- DO NOT include chatId, botToken, or approvalType in config (backend handles these)
- Telegram node: only message, interactive, buttons, outputVariable
- UserApproval node: only timeout, message, approvalActions, outputVariable

LLM NODE POLICY:
- ALWAYS ask user: "Do you want AI decision-making in this workflow?" before planning
- Only include LLM node if user confirms they want AI analysis
- For simple automation, skip LLM; for complex decisions, recommend it

IF REQUEST IS UNSUPPORTED:
Respond with: {"error": "This workflow is beyond current capabilities. Supported: [list relevant features]"}`;

  const catalogSnippet = JSON.stringify(defaultCatalog);

  const schemaExamples = {
    // Generic schema examples for each node type - use these patterns but adapt to your specific use case
    start: { id: 'start', type: 'start', position: { x: 100, y: 200 }, config: { variables: [{ name: 'userAddress', type: 'string' }, { name: 'threshold', type: 'number' }, { name: 'status', type: 'string' }] } },
    marketData: { id: 'fetchData', type: 'marketData', position: { x: 300, y: 200 }, config: { symbol: 'sei', outputVariable: 'currentPrice' } },
    blockchain: { id: 'getBalance', type: 'blockchain', position: { x: 500, y: 200 }, config: { network: 'mainnet', selectedTool: 'sei_erc20_balance', toolParameters: { contract_address: 'tokenContractAddress' }, outputVariable: 'tokenBalance' } },
    arithmetic: { id: 'calculate', type: 'arithmetic', position: { x: 700, y: 200 }, config: { operation: 'multiply', value1: 'tokenBalance', value2: '{currentPrice.price_usd}', outputVariable: 'totalValue' } },
    conditional: { id: 'checkCondition', type: 'conditional', position: { x: 900, y: 200 }, config: { operator: 'greater', value1: 'totalValue', value2: 'threshold', outputVariable: 'shouldAct' } },
    telegram: { id: 'notify', type: 'telegram', position: { x: 1100, y: 200 }, config: { message: 'Alert: {message}', interactive: false, buttons: [], outputVariable: '' } },
    userApproval: { id: 'getApproval', type: 'userApproval', position: { x: 1300, y: 200 }, config: { timeout: 300, message: 'Do you want to proceed?', approvalActions: ['approve', 'reject'], outputVariable: 'userDecision' } },
    logger: { id: 'logInfo', type: 'logger', position: { x: 1500, y: 200 }, config: { level: 'info', message: 'Workflow step completed', value: 'totalValue' } },
    timer: { id: 'schedule', type: 'timer', position: { x: 1700, y: 200 }, config: { timerType: 'interval', duration: 300, unit: 's', repeatCount: -1, timeoutAction: 'continue', outputVariable: '' } },
    variable: { id: 'setStatus', type: 'variable', position: { x: 1900, y: 200 }, config: { operation: 'set', variableName: 'status', value: 'completed' } },
    initVariable: { id: 'initialize', type: 'variable', position: { x: 200, y: 200 }, config: { operation: 'set', variableName: 'counter', value: '0' } },
    loop: { id: 'repeat', type: 'loop', position: { x: 2100, y: 200 }, config: { condition: 'counter < maxIterations', maxIterations: 10 } },
    llm: { id: 'analyze', type: 'llm', position: { x: 2300, y: 200 }, config: { outputMode: 'assistant', analysisType: 'general', network: 'mainnet', availableActions: 'hold,buy,sell', systemPrompt: 'Analyze the current situation', input: 'totalValue', outputVariable: 'aiDecision', model: 'gpt-4o-mini', temperature: 0 } },
    smartContractRead: { id: 'readContract', type: 'smartContractRead', position: { x: 2500, y: 200 }, config: { network: 'sei', contractAddress: '0x123...', abi: '[{"name":"balanceOf","type":"function"}]', methodName: 'balanceOf', parameters: { account: 'userAddress' }, outputVariable: 'contractBalance' } },
    smartContractWrite: { id: 'writeContract', type: 'smartContractWrite', position: { x: 2700, y: 200 }, config: { network: 'sei', contractAddress: '0x123...', abi: '[{"name":"transfer","type":"function"}]', methodName: 'transfer', parameters: { to: 'recipient', amount: '1000' }, gasLimit: '100000', gasPrice: '20', value: '0', waitForConfirmation: true, outputVariable: 'txHash' } },
    // Schema-aware examples showing proper property access:
    marketDataArithmetic: { id: 'calc', type: 'arithmetic', position: { x: 800, y: 200 }, config: { operation: 'multiply', value1: 'balance', value2: '{price.price_usd}', outputVariable: 'usdValue' } },
    blockchainArithmetic: { id: 'calc2', type: 'arithmetic', position: { x: 900, y: 200 }, config: { operation: 'add', value1: 'balance1', value2: 'balance2', outputVariable: 'totalBalance' } },
    contractCondition: { id: 'check', type: 'conditional', position: { x: 1000, y: 200 }, config: { operator: 'greater', value1: '{contractResult.result}', value2: '100', outputVariable: 'isValid' } }
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Node Catalog: ${catalogSnippet}` },
        { role: 'user', content: `Schema Examples (use these patterns but adapt to your specific use case): ${JSON.stringify(schemaExamples)}` },
        { role: 'user', content: `Request: "${userPrompt}". 

WORKFLOW ANALYSIS:
- UNDERSTAND the user's intent and create a flexible, reusable workflow
- THINK about what makes a workflow complete and useful for this specific request
- CONSIDER what supporting nodes are needed for the workflow to actually work
- ANALYZE the logical flow: what data is needed, what processing, what decisions, what actions
- DESIGN for flexibility: use descriptive variable names, meaningful conditions, clear logic
- ENSURE completeness: include initialization, data gathering, processing, decision making, and actions
- ADD safety: user approvals for critical actions, logging for debugging, error handling
- MAKE it reusable: generic enough to work with different parameters and conditions

SPECIFIC GUIDANCE:
- For approval workflows: Start → [Data/Check] → User Approval → [Conditional Action]
- For monitoring workflows: Start → Timer → [Data Source] → [Processing] → [Condition Check] → [Action/Alert]
- For automation workflows: Start → [Setup] → [Data] → [Logic] → [Action]
- Always include meaningful logging and user approvals for critical actions

CORRECT JSON FORMAT EXAMPLE (DCA with Approval):
{
  "nodes": [
    { "id": "start", "type": "start", "position": {"x": 100, "y": 200}, "config": {...} },
    { "id": "approval", "type": "userApproval", "position": {"x": 300, "y": 200}, "config": {"outputVariable": "userDecision", ...} },
    { "id": "checkApproval", "type": "conditional", "position": {"x": 500, "y": 200}, "config": {"value1": "userDecision", "value2": "approve", "operator": "equals", "outputVariable": "isApproved"} },
    { "id": "execute", "type": "blockchain", "position": {"x": 700, "y": 200}, "config": {...} },
    { "id": "skip", "type": "logger", "position": {"x": 700, "y": 300}, "config": {...} }
  ],
  "edges": [
    { "id": "e1", "source": "start", "target": "approval" },
    { "id": "e2", "source": "approval", "target": "checkApproval" },
    { "id": "e3", "source": "checkApproval", "target": "execute", "sourceHandle": "true" },
    { "id": "e4", "source": "checkApproval", "target": "skip", "sourceHandle": "false" }
  ]
}

WORKFLOW DESIGN PRINCIPLES:
- START with initialization: set up variables, parameters, and initial state
- GATHER data: fetch market data, check balances, get current state
- PROCESS information: calculate values, analyze conditions, make decisions
- DECIDE on actions: use conditional logic to determine what to do
- EXECUTE safely: include user approvals for critical actions
- LOG everything: add logging for debugging and monitoring
- LOOP if needed: use timers for continuous monitoring or recurring actions

NODE SELECTION GUIDELINES:
- Use Timer nodes for continuous/recurring operations
- Use User Approval nodes before any critical actions (trading, lending, etc.)
- ALWAYS use Conditional nodes AFTER User Approval to check if action was approved
- Use Logger nodes to track important values and decisions
- Use Variable nodes to store and manage state
- Use Conditional nodes to implement decision logic
- Use Arithmetic nodes for calculations and comparisons
- Use Telegram nodes for notifications and alerts

TECHNICAL REQUIREMENTS:
1. Use the EXACT config structure from schema examples above
2. EVERY node must have ALL required fields filled
3. Variables should be meaningful names (no generic "var1", "var2")
4. Blockchain nodes MUST have selectedTool and complete toolParameters
5. All outputVariable fields must be meaningful names
6. Follow the positioning pattern (x: 100, 300, 500, etc.)
7. Use "source"/"target" in edges, NOT "from"/"to"
8. Include ALL necessary nodes to make the workflow actually functional

Generate only the JSON workflow.` },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Planner API error: ${response.status} ${text}`);
  }
  const json = await response.json();
  const content: string = json.choices?.[0]?.message?.content || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // last-resort extraction
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Failed to parse planner output');
    parsed = JSON.parse(match[0]);
  }
  
  // Handle error responses
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  
  if (!parsed.nodes || !parsed.edges) {
    throw new Error('Invalid plan: missing nodes/edges');
  }
  return parsed as PlannedFlow;
}

const AIWorkflowChat: React.FC<AIWorkflowChatProps> = ({ isOpen, onClose, onApplyFlow }) => {
  const [prompt, setPrompt] = useState('Create a price monitoring workflow that alerts when SEI price changes by 10%.');
  const [userApiKey, setUserApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usesLeft, setUsesLeft] = useState<number>(MAX_PROJECT_USES);
  const [needsLlmConfirm, setNeedsLlmConfirm] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [includeLlm, setIncludeLlm] = useState(false);

  const projectKey = useMemo(() => process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', []);

  useEffect(() => {
    const used = Number(localStorage.getItem('aiPlanner_project_used') || '0');
    setUsesLeft(Math.max(0, MAX_PROJECT_USES - used));
    // Load saved personal key when the drawer opens
    if (isOpen && (!projectKey || usesLeft <= 0)) {
      const saved = localStorage.getItem('aiPlanner_user_openai_key') || '';
      if (saved && !userApiKey) setUserApiKey(saved);
    }
  }, [isOpen]);

  const pickKey = useCallback(() => {
    if (projectKey && usesLeft > 0) return projectKey;
    return userApiKey.trim();
  }, [projectKey, usesLeft, userApiKey]);

  const handleGenerate = useCallback(async (finalPrompt?: string) => {
    setError(null);
    const key = pickKey();
    if (!key) {
      setError('API key required. Enter your key to proceed.');
      return;
    }
    
    const workflowPrompt = finalPrompt || prompt;
    
    // Check if this requires LLM confirmation
    const needsAI = /complex|analysis|decision|optimize|strategy|smart|dynamic/i.test(workflowPrompt);
    if (needsAI && !finalPrompt) {
      setNeedsLlmConfirm(true);
      setPendingPrompt(workflowPrompt);
      return;
    }
    
    setIsLoading(true);
    try {
      const plan = await callOpenAIPlanner(workflowPrompt, key);
      
      // Handle case where AI returns nodes as object instead of array
      if (plan.nodes && !Array.isArray(plan.nodes)) {
        plan.nodes = Object.values(plan.nodes);
      }
      
      onApplyFlow(plan);
      if (key === projectKey) {
        const used = Number(localStorage.getItem('aiPlanner_project_used') || '0') + 1;
        localStorage.setItem('aiPlanner_project_used', String(used));
        setUsesLeft(Math.max(0, MAX_PROJECT_USES - used));
      } else {
        // Persist latest user key to localStorage
        localStorage.setItem('aiPlanner_user_openai_key', key);
      }
      setNeedsLlmConfirm(false);
      setPendingPrompt('');
      setIncludeLlm(false);
    } catch (e: any) {
      console.error('❌ AI PLANNER ERROR:', e);
      setError(e.message || 'Failed to generate flow');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, pickKey, onApplyFlow, projectKey]);

  const handleConfirmAndGenerate = useCallback(() => {
    const finalPrompt = includeLlm 
      ? `${pendingPrompt} (Include LLM node for AI decision-making)`
      : `${pendingPrompt} (Simple automation, no LLM needed)`;
    handleGenerate(finalPrompt);
  }, [pendingPrompt, includeLlm, handleGenerate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-md bg-gray-850 bg-gray-800 text-white border-l border-gray-700 shadow-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="font-semibold">AI Workflow Planner</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="h-4 w-4 text-gray-300" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Warning Banner */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-300 text-sm font-medium">AI Generated Content</span>
            </div>
            <p className="text-yellow-200 text-xs mt-1">
              AI-generated workflows may not always be accurate or complete. Please review and test all configurations before using in production.
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Instruction</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Describe the workflow you want..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            {projectKey && usesLeft > 0 ? (
              <div className="text-xs text-gray-400">Project key available. Uses left: {usesLeft}/{MAX_PROJECT_USES}</div>
            ) : (
              <div>
                <label className="block text-sm text-gray-300 mb-2">Your OpenAI API Key</label>
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">Key is stored locally in your browser (localStorage).</div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => localStorage.setItem('aiPlanner_user_openai_key', userApiKey.trim())}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { localStorage.removeItem('aiPlanner_user_openai_key'); setUserApiKey(''); }}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          
          {needsLlmConfirm && (
            <div className="bg-purple-800/20 border border-purple-600/30 rounded-lg p-3 space-y-3">
              <div className="text-sm text-purple-200 mb-3">
                This workflow may benefit from AI decision-making. Configure your preference:
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeLlm"
                  checked={includeLlm}
                  onChange={(e) => setIncludeLlm(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="includeLlm" className="text-sm text-purple-200">
                  Include AI analysis and decision-making in workflow
                </label>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleConfirmAndGenerate}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
                >
                  Generate Workflow
                </button>
                <button
                  onClick={() => {
                    setNeedsLlmConfirm(false);
                    setPendingPrompt('');
                    setIncludeLlm(false);
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200">Close</button>
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || needsLlmConfirm}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
          >
            {isLoading ? (
              <span>Generating...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowChat;


