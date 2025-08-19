export interface FlowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedFlow?: any;
}

export interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

export function validateAndFixFlow(flowData: any): FlowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fixedFlow = JSON.parse(JSON.stringify(flowData)); // Deep clone

  // 1. Check for uninitialized variables in percentage monitoring flows
  const hasPercentageMonitoring = checkForPercentageMonitoring(fixedFlow);
  if (hasPercentageMonitoring) {
    const initializationFix = fixVariableInitialization(fixedFlow);
    if (initializationFix.fixed) {
      warnings.push('Added missing variable initialization for percentage monitoring');
      fixedFlow = initializationFix.flow;
    }
  }

  // 2. Check for incomplete percentage calculations
  const percentageCalcFix = fixPercentageCalculation(fixedFlow);
  if (percentageCalcFix.fixed) {
    warnings.push('Fixed incomplete percentage calculation (added missing multiply by 100 step)');
    fixedFlow = percentageCalcFix.flow;
  }

  // 3. Check for missing timer connections in monitoring flows
  const timerFix = fixTimerConnections(fixedFlow);
  if (timerFix.fixed) {
    warnings.push('Fixed timer node connections for monitoring workflow');
    fixedFlow = timerFix.flow;
  }

  // 4. Check for critical errors that can't be auto-fixed
  const criticalErrors = checkCriticalErrors(fixedFlow);
  errors.push(...criticalErrors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedFlow: warnings.length > 0 ? fixedFlow : undefined
  };
}

function checkForPercentageMonitoring(flow: any): boolean {
  const nodes = flow.nodes || [];
  
  // Check if flow has price monitoring pattern
  const hasMarketData = nodes.some((n: any) => n.type === 'marketData');
  const hasArithmetic = nodes.some((n: any) => n.type === 'arithmetic');
  const hasConditional = nodes.some((n: any) => n.type === 'conditional');
  const hasTimer = nodes.some((n: any) => n.type === 'timer');
  
  // Check for percentage-related variables
  const startNode = nodes.find((n: any) => n.type === 'start');
  const variables = startNode?.data?.config?.variables || [];
  const hasPercentageVars = variables.some((v: any) => 
    v.name.toLowerCase().includes('percentage') || 
    v.name.toLowerCase().includes('previous') ||
    v.name.toLowerCase().includes('change')
  );
  
  return hasMarketData && hasArithmetic && hasConditional && hasTimer && hasPercentageVars;
}

function fixVariableInitialization(flow: any): { fixed: boolean; flow: any } {
  const nodes = flow.nodes || [];
  const edges = flow.edges || [];
  
  // Check if previousPrice (or similar) is initialized
  const startNode = nodes.find((n: any) => n.type === 'start');
  const variables = startNode?.data?.config?.variables || [];
  const trackingVar = variables.find((v: any) => 
    v.name.toLowerCase().includes('previous') || 
    v.name === 'previousPrice'
  );
  
  if (!trackingVar) return { fixed: false, flow };
  
  // Check if there's already an initialization node
  const hasInitialization = nodes.some((n: any) => 
    n.type === 'variable' && 
    n.data?.config?.operation === 'set' &&
    n.data?.config?.variableName === trackingVar.name &&
    (n.data?.config?.value === 0 || n.data?.config?.value === '0')
  );
  
  if (hasInitialization) return { fixed: false, flow };
  
  // Add initialization node
  const timerNode = nodes.find((n: any) => n.type === 'timer');
  if (!timerNode) return { fixed: false, flow };
  
  const initNode = {
    id: 'autofix_init',
    type: 'variable',
    position: { x: timerNode.position.x - 200, y: timerNode.position.y },
    data: {
      label: 'Variable',
      type: 'variable',
      config: {
        operation: 'set',
        variableName: trackingVar.name,
        value: '0'
      },
      description: 'Auto-added: Initialize tracking variable',
      status: 'idle'
    }
  };
  
  // Insert initialization node
  flow.nodes.push(initNode);
  
  // Fix edges: Start -> Init -> Timer
  const startToTimerEdge = edges.find((e: any) => 
    e.source === 'start' && e.target === timerNode.id
  );
  
  if (startToTimerEdge) {
    startToTimerEdge.target = 'autofix_init';
    flow.edges.push({
      id: 'autofix_edge_init',
      source: 'autofix_init',
      target: timerNode.id,
      type: 'default'
    });
  }
  
  return { fixed: true, flow };
}

function fixPercentageCalculation(flow: any): { fixed: boolean; flow: any } {
  const nodes = flow.nodes || [];
  
  // Find arithmetic nodes for percentage calculation
  const arithmeticNodes = nodes.filter((n: any) => n.type === 'arithmetic');
  
  // Check if we have subtract and divide but missing multiply by 100
  const hasSubtract = arithmeticNodes.some((n: any) => n.data?.config?.operation === 'subtract');
  const hasDivide = arithmeticNodes.some((n: any) => n.data?.config?.operation === 'divide');
  const hasMultiply100 = arithmeticNodes.some((n: any) => 
    n.data?.config?.operation === 'multiply' && 
    (n.data?.config?.value2 === 100 || n.data?.config?.value2 === '100')
  );
  
  if (!hasSubtract || !hasDivide || hasMultiply100) {
    return { fixed: false, flow };
  }
  
  // Find the divide node to insert multiply after it
  const divideNode = arithmeticNodes.find((n: any) => n.data?.config?.operation === 'divide');
  if (!divideNode) return { fixed: false, flow };
  
  // Check if divide node outputs to a ratio variable
  const ratioOutput = divideNode.data?.config?.outputVariable;
  if (!ratioOutput) return { fixed: false, flow };
  
  // Find what the divide node connects to
  const edges = flow.edges || [];
  const divideEdge = edges.find((e: any) => e.source === divideNode.id);
  if (!divideEdge) return { fixed: false, flow };
  
  // Create multiply by 100 node
  const multiplyNode = {
    id: 'autofix_multiply100',
    type: 'arithmetic',
    position: { x: divideNode.position.x + 200, y: divideNode.position.y },
    data: {
      label: 'Arithmetic',
      type: 'arithmetic',
      config: {
        operation: 'multiply',
        value1: ratioOutput,
        value2: '100',
        outputVariable: 'priceChangePercentage'
      },
      description: 'Auto-added: Convert ratio to percentage',
      status: 'idle'
    }
  };
  
  // Insert multiply node
  flow.nodes.push(multiplyNode);
  
  // Fix edges: Divide -> Multiply -> NextNode
  divideEdge.target = 'autofix_multiply100';
  flow.edges.push({
    id: 'autofix_edge_multiply',
    source: 'autofix_multiply100',
    target: divideEdge.target,
    type: 'default'
  });
  
  // Update any conditional nodes that might be using the wrong variable
  const conditionalNodes = nodes.filter((n: any) => n.type === 'conditional');
  conditionalNodes.forEach((node: any) => {
    if (node.data?.config?.value1 === ratioOutput) {
      node.data.config.value1 = 'priceChangePercentage';
      // Also adjust the threshold if it's comparing ratio (0.1) instead of percentage (10)
      if (node.data.config.value2 === 0.1) {
        node.data.config.value2 = 10;
      }
    }
  });
  
  return { fixed: true, flow };
}

function fixTimerConnections(flow: any): { fixed: boolean; flow: any } {
  const nodes = flow.nodes || [];
  const edges = flow.edges || [];
  
  const timerNode = nodes.find((n: any) => n.type === 'timer');
  if (!timerNode) return { fixed: false, flow };
  
  // Check if timer has input connection
  const hasTimerInput = edges.some((e: any) => e.target === timerNode.id);
  if (hasTimerInput) return { fixed: false, flow };
  
  // Connect start to timer
  const startNode = nodes.find((n: any) => n.type === 'start');
  if (!startNode) return { fixed: false, flow };
  
  flow.edges.push({
    id: 'autofix_timer_input',
    source: startNode.id,
    target: timerNode.id,
    type: 'default'
  });
  
  return { fixed: true, flow };
}

function checkCriticalErrors(flow: any): string[] {
  const errors: string[] = [];
  const nodes = flow.nodes || [];
  
  // Check for nodes without required configs
  nodes.forEach((node: any) => {
    if (!node.data?.config) {
      errors.push(`Node ${node.id} (${node.type}) is missing configuration`);
    }
    
    // Check specific node requirements
    if (node.type === 'arithmetic') {
      const config = node.data?.config;
      if (!config?.operation || !config?.value1 || !config?.value2) {
        errors.push(`Arithmetic node ${node.id} has incomplete configuration`);
      }
    }
    
    if (node.type === 'conditional') {
      const config = node.data?.config;
      if (!config?.operator || !config?.value1 || config?.value2 === undefined) {
        errors.push(`Conditional node ${node.id} has incomplete configuration`);
      }
    }
  });
  
  return errors;
}
