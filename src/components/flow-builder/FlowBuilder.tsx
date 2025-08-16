'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import BlockLibrary from './BlockLibrary';
import FlowToolbar from './FlowToolbar';
import NodePanel from './NodePanel';
import CustomNode from './nodes/CustomNode';
import ConditionalNode from './nodes/ConditionalNode';
import ArithmeticNode from './nodes/ArithmeticNode';
import VariableNode from './nodes/VariableNode';
import LoopNode from './nodes/LoopNode';
import TimerNode from './nodes/TimerNode';
import BlockchainNode from './nodes/BlockchainNode';
import StartNode from './nodes/StartNode';
import LLMNode from './nodes/LLMNode';
import MarketDataNode from './nodes/MarketDataNode';
import TelegramNode from './nodes/TelegramNode';
import UserApprovalNode from './nodes/UserApprovalNode';
import LoggerNode from './nodes/LoggerNode';
import SmartContractReadNode from './nodes/SmartContractReadNode';
import SmartContractWriteNode from './nodes/SmartContractWriteNode';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

interface VariableDeclaration {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  conditional: ConditionalNode,
  arithmetic: ArithmeticNode,
  variable: VariableNode,
  loop: LoopNode,
  timer: TimerNode,
  blockchain: BlockchainNode,
  start: StartNode,
  llm: LLMNode,
  marketData: MarketDataNode,
  telegram: TelegramNode,
  userApproval: UserApprovalNode,
  logger: LoggerNode,
  smartContractRead: SmartContractReadNode,
  smartContractWrite: SmartContractWriteNode,
};

// Define the flow schema
const flowSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.object({
      label: z.string(),
      type: z.string(),
      config: z.record(z.string(), z.any()),
      description: z.string(),
      status: z.string(),
    }),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
    label: z.string().optional(),
    data: z.record(z.string(), z.any()).optional(),
  })),
  timestamp: z.string(),
});



const FlowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [currentFlowName, setCurrentFlowName] = useState('Untitled Flow');
  const [isNewFlow, setIsNewFlow] = useState(true);
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [declaredVariables, setDeclaredVariables] = useState<VariableDeclaration[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Fit view function
  const onFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.1, includeHiddenNodes: false });
    }
  }, [reactFlowInstance]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Add new node from library
  const onAddNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    // Get default configuration based on node type
    const getDefaultConfig = (type: string) => {
      switch (type) {
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
            condition: '',
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
        case 'logger':
          return {
            level: 'info',
            message: '',
            value: '',
          };
        case 'blockchain':
          return {
            network: 'mainnet',
            selectedTool: '',
            toolParameters: {},
            outputVariable: '',
          };
        case 'start':
          return {
            variables: [],
          };
        case 'llm':
          return {
            outputMode: 'assistant',
            analysisType: 'general',
            network: 'mainnet',
            availableActions: 'buy_sei,sell_sei,stake_sei,hold,rebalance', // default; user can clear to empty string
            systemPrompt: '',
            input: '',
            outputVariable: '',
            chatInterface: false,
            model: 'gpt-4o-mini',
            temperature: 0,
          };
        case 'telegram':
          return {
            botToken: '',
            chatId: '',
            message: '',
            interactive: false,
            buttons: [],
            outputVariable: '',
          };
        case 'userApproval':
          return {
            approvalType: 'telegram',
            timeout: 3600,
            message: 'Please approve this action',
            approvalActions: ['approve', 'reject'],
            outputVariable: '',
          };
        case 'marketData':
          return {
            symbol: 'sei',
            outputVariable: '',
          };
        case 'smartContractRead':
          return {
            network: 'sei',
            contractAddress: '',
            abi: '',
            methodName: '',
            parameters: {},
            outputVariable: '',
          };
        case 'smartContractWrite':
          return {
            network: 'sei',
            contractAddress: '',
            abi: '',
            methodName: '',
            parameters: {},
            gasLimit: '',
            gasPrice: '',
            value: '',
            waitForConfirmation: true,
            outputVariable: '',
          };
        default:
          return {};
      }
    };

    const getNodeLabel = (type: string) => {
      const labels: Record<string, string> = {
        'start': 'Start',
        'conditional': 'Conditional',
        'arithmetic': 'Arithmetic',
        'variable': 'Variable',
        'loop': 'Loop',
        'timer': 'Timer',
        'blockchain': 'Blockchain Operation',
        'llm': 'AI Assistant',
        'telegram': 'Telegram',
        'userApproval': 'User Approval',
        'marketData': 'Market Data',
        'smartContractRead': 'Smart Contract Read',
        'smartContractWrite': 'Smart Contract Write',
      };
      return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getNodeDescription = (type: string) => {
      const descriptions: Record<string, string> = {
        'start': 'Flow execution starts here',
        'conditional': 'Make decisions based on conditions',
        'arithmetic': 'Perform mathematical operations',
        'variable': 'Set, get, or modify variables',
        'loop': 'Repeat operations',
        'timer': 'Add delays or intervals',
        'blockchain': 'Execute SEI blockchain operations',
        'llm': 'Use AI to analyze and make decisions',
        'telegram': 'Send notifications and interactive messages',
        'userApproval': 'Wait for user confirmation before proceeding',
        'marketData': 'Fetch real-time token price and market data',
        'smartContractRead': 'Read data from any smart contract',
        'smartContractWrite': 'Execute transactions on smart contracts',
      };
      return descriptions[type] || `Configure your ${type} node`;
    };

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: getNodeLabel(nodeType),
        type: nodeType,
        config: getDefaultConfig(nodeType),
        description: getNodeDescription(nodeType),
        status: 'idle',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Handle node data changes
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...newData,
                config: {
                  ...node.data.config,
                  ...newData.config,
                },
              },
            }
          : node
      )
    );
    // Update selected node if it's the one being changed
    setSelectedNode((prev) =>
      prev?.id === nodeId
        ? {
            ...prev,
            data: {
              ...prev.data,
              ...newData,
              config: {
                ...prev.data.config,
                ...newData.config,
              },
            },
          }
        : prev
    );
  }, [setNodes]);

  // Handle edge deletion
  const onEdgeDelete = useCallback((edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [setEdges]);

  // Handle node deletion
  const onNodeDelete = useCallback((node: Node) => {
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
  }, [setNodes, setEdges]);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete') {
      if (selectedNode) {
        onNodeDelete(selectedNode);
        setSelectedNode(null);
      } else if (selectedEdge) {
        onEdgeDelete(selectedEdge);
        setSelectedEdge(null);
      }
    }
  }, [selectedNode, selectedEdge, onNodeDelete, onEdgeDelete]);

  // Handle drag and drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowBounds
        ? {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          }
        : { x: 0, y: 0 };

      onAddNode(nodeType, position);
    },
    [onAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update existing flow
  const handleUpdateFlow = useCallback(async () => {
    if (!user || !currentFlowId) {
      alert('No flow to update');
      return;
    }

    // Validate node configurations before updating
    const validationErrors = validateNodeConfigurations();
    if (validationErrors.length > 0) {
      const errorMessage = 'Flow validation failed:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }

    setIsSaving(true);
    try {
      const flowData = {
        nodes,
        edges,
        timestamp: new Date().toISOString(),
      };

      // Validate flow data
      const result = flowSchema.safeParse(flowData);
      if (!result.success) {
        alert('Flow is invalid!\n' + JSON.stringify(result.error.issues, null, 2));
        return;
      }

      const { error } = await supabase
        .from('flows')
        .update({
          flow_data: flowData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentFlowId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating flow:', error);
        alert('Failed to update flow: ' + error.message);
        return;
      }

      alert('Flow updated successfully!');
    } catch (error) {
      console.error('Error updating flow:', error);
      alert('Failed to update flow');
    } finally {
      setIsSaving(false);
    }
  }, [user, currentFlowId, nodes, edges]);

  // Save flow
  const onSaveFlow = useCallback(() => {
    if (!user) {
      alert('Please log in to save flows');
      return;
    }
    
    // If we have a current flow ID, update the existing flow
    if (currentFlowId) {
      handleUpdateFlow();
    } else {
      // Show save dialog for new flows
      setShowSaveDialog(true);
    }
  }, [user, currentFlowId, handleUpdateFlow]);

  const handleSaveFlow = useCallback(async () => {
    if (!user || !flowName.trim()) {
      alert('Please provide a flow name');
      return;
    }

    // Validate node configurations before saving
    const validationErrors = validateNodeConfigurations();
    if (validationErrors.length > 0) {
      const errorMessage = 'Flow validation failed:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }

    setIsSaving(true);
    try {
    const flowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
      // Validate flow data
      const result = flowSchema.safeParse(flowData);
      if (!result.success) {
        alert('Flow is invalid!\n' + JSON.stringify(result.error.issues, null, 2));
        return;
      }

      const { data, error } = await supabase
        .from('flows')
        .insert({
          user_id: user.id,
          name: flowName.trim(),
          description: flowDescription.trim() || null,
          flow_data: flowData
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving flow:', error);
        alert('Failed to save flow: ' + error.message);
        return;
      }

      alert('Flow saved successfully!');
      setShowSaveDialog(false);
      setCurrentFlowId(data.id);
      setCurrentFlowName(flowName.trim());
      setIsNewFlow(false);
      // Do NOT clear flowName/flowDescription here
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  }, [user, flowName, flowDescription, nodes, edges]);



  // Extract variables from flow nodes
  const extractVariablesFromFlow = useCallback((flowNodes: Node[]) => {
    const variables: string[] = [];
    flowNodes.forEach(node => {
      if (node.type === 'variable' && node.data.config.variableName) {
        variables.push(node.data.config.variableName);
      }
    });
    return variables;
  }, []);

  // Add new variable to available variables and declared variables
  const addVariable = useCallback((variableName: string) => {
    console.log('FlowBuilder addVariable called:', variableName);
    if (!availableVariables.includes(variableName)) {
      setAvailableVariables(prev => [...prev, variableName]);
    }
    
    // Also add to declared variables if it doesn't exist
    if (!declaredVariables.some(v => v.name === variableName)) {
      const newVariable: VariableDeclaration = {
        name: variableName,
        type: 'string', // Default type for new variables
        defaultValue: '',
        description: `Variable ${variableName}`
      };
      
      console.log('Adding new variable to declaredVariables:', newVariable);
      setDeclaredVariables(prev => [...prev, newVariable]);
      
      // Update the Start node's config with the new variable
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.type === 'start'
            ? {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...node.data.config,
                    variables: [...(node.data.config.variables || []), newVariable],
                  },
                },
              }
            : node
        )
      );
    }
  }, [availableVariables, declaredVariables, setNodes]);

  const handleVariablesChange = useCallback((variables: VariableDeclaration[]) => {
    console.log('FlowBuilder handleVariablesChange called:', variables);
    setDeclaredVariables(variables);
    // Update available variables list from declared variables
    const variableNames = variables.map(v => v.name);
    setAvailableVariables(variableNames);
    
    // Update the Start node's config with the new variables
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.type === 'start'
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  variables: variables,
                },
              },
            }
          : node
      )
    );
  }, [setNodes]);

  // Create start node for new flows
  const createStartNode = useCallback(() => {
    const startNode = {
      id: 'start-node',
      type: 'start',
      position: { x: 50, y: 200 },
      data: {
        label: 'Start',
        type: 'start',
        config: {
          variables: [],
        },
        description: 'Flow execution starts here',
        status: 'ready',
      },
    };
    return startNode;
  }, []);

  // Load flow on component mount
  useEffect(() => {
    try {
      const selectedFlow = localStorage.getItem('selectedFlow');
      console.log('Selected flow from localStorage:', selectedFlow);
      
      if (selectedFlow) {
        const flow = JSON.parse(selectedFlow);
        console.log('Parsed flow data:', flow);
        console.log('Flow name:', flow.name);
        console.log('Flow ID:', flow.id);
        
        setNodes(flow.flow_data.nodes || []);
        setEdges(flow.flow_data.edges || []);
        setCurrentFlowId(flow.id);
        setCurrentFlowName(flow.name);
        setFlowName(flow.name);
        setFlowDescription(flow.description || '');
        setIsNewFlow(false);
        
        // Extract variables from existing flow
        const variables = extractVariablesFromFlow(flow.flow_data.nodes || []);
        setAvailableVariables(variables);
        
        // Load declared variables from Start node
        const startNode = flow.flow_data.nodes?.find((node: any) => node.type === 'start');
        if (startNode?.data?.config?.variables) {
          setDeclaredVariables(startNode.data.config.variables);
          // Also update available variables from declared variables
          const variableNames = startNode.data.config.variables.map((v: VariableDeclaration) => v.name);
          setAvailableVariables(variableNames);
        }
        
        console.log('Set currentFlowName to:', flow.name);
        console.log('Set isNewFlow to: false');
        // Do NOT remove from localStorage here
      } else {
        console.log('No flow selected, setting up new flow');
        // No flow selected, this is a new flow
        setIsNewFlow(true);
        setCurrentFlowId(null);
        setCurrentFlowName('Untitled Flow');
        setFlowName('');
        setFlowDescription('');
        
        // Add start node for new flows
        const startNode = createStartNode();
        setNodes([startNode]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Error loading flow from storage:', error);
    }
  }, [createStartNode]); // Add createStartNode to dependencies

  // Clear canvas
  const onClearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      const startNode = createStartNode();
      setNodes([startNode]);
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
      setAvailableVariables([]);
      setDeclaredVariables([]);
      // Reset flow state to new flow
      setIsNewFlow(true);
      setCurrentFlowId(null);
      setCurrentFlowName('Untitled Flow');
      setFlowName('');
      setFlowDescription('');
    }
  }, [setNodes, setEdges, createStartNode]);

  // Helper function to validate if a value is valid (declared variable or direct value)
  const isValidValue = useCallback((value: any, expectedType?: string): boolean => {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined) return false;
    
    // Convert to string for validation
    const stringValue = String(value);
    if (!stringValue || !stringValue.trim()) return false;
    
    const trimmedValue = stringValue.trim();
    
    // Check if it's a declared variable
    const isDeclaredVariable = declaredVariables.some(v => v.name === trimmedValue);
    if (isDeclaredVariable) return true;
    
    // For constants, be more lenient - accept any non-empty value
    // Only apply strict type checking if expectedType is specified
    if (expectedType) {
      // Check for boolean values
      if (expectedType === 'boolean' && ['true', 'false', '0', '1'].includes(trimmedValue.toLowerCase())) {
        return true;
      }
      
      // Check for numbers
      if (expectedType === 'number' && !isNaN(Number(trimmedValue)) && trimmedValue !== '') {
        return true;
      }
      
      // Check for strings (anything that's not empty)
      if (expectedType === 'string' && trimmedValue.length > 0) {
        return true;
      }
      
      // For other types, accept any non-empty value
      return trimmedValue.length > 0;
    }
    
    // If no expected type, accept any non-empty value
    return trimmedValue.length > 0;
  }, [declaredVariables]);

  // Validate all node configurations
  const validateNodeConfigurations = useCallback(() => {
    const errors: string[] = [];
    
    nodes.forEach((node, index) => {
      if (node.type === 'start') {
        // Start node doesn't need validation
        return;
      }
      
      const config = node.data.config || {};
      const nodeName = node.data.label || `Node ${index + 1}`;
      
      // Check if node has input connections (except start node)
      const hasInputConnection = edges.some(edge => edge.target === node.id);
      if (!hasInputConnection) {
        errors.push(`${nodeName}: Missing input connection`);
      }
      
      switch (node.type) {
        case 'conditional':
          if (!isValidValue(config.value1)) {
            errors.push(`${nodeName}: Value 1 is required (use constant or variable)`);
          }
          if (!isValidValue(config.value2)) {
            errors.push(`${nodeName}: Value 2 is required (use constant or variable)`);
          }
          if (config.outputVariable && !isValidValue(config.outputVariable, 'boolean')) {
            errors.push(`${nodeName}: Output variable must be a declared boolean variable`);
          }
          break;
          
        case 'arithmetic':
          if (!isValidValue(config.value1, 'number')) {
            errors.push(`${nodeName}: Value 1 must be a number (use constant or number variable)`);
          }
          if (!isValidValue(config.value2, 'number')) {
            errors.push(`${nodeName}: Value 2 must be a number (use constant or number variable)`);
          }
          if (config.outputVariable && !isValidValue(config.outputVariable, 'number')) {
            errors.push(`${nodeName}: Output variable must be a declared number variable`);
          }
          break;
          
        case 'variable':
          if (!isValidValue(config.variableName)) {
            errors.push(`${nodeName}: Variable name must be a declared variable`);
          }
          if (config.operation === 'set' && !isValidValue(config.value)) {
            errors.push(`${nodeName}: Value must be a declared variable or valid value for 'set' operation`);
          }
          break;
          
        case 'loop':
          if (config.loopType === 'while' && !isValidValue(config.condition, 'boolean')) {
            errors.push(`${nodeName}: Condition must be a declared boolean variable or valid boolean value`);
          }
          if (config.loopType === 'for' && !isValidValue(config.startValue, 'number')) {
            errors.push(`${nodeName}: Start value must be a declared number variable or numeric value`);
          }
          if (config.loopType === 'for' && !isValidValue(config.endValue, 'number')) {
            errors.push(`${nodeName}: End value must be a declared number variable or numeric value`);
          }
          if (config.loopType === 'foreach' && !isValidValue(config.collection, 'array')) {
            errors.push(`${nodeName}: Collection must be a declared array variable`);
          }
          break;
          
        case 'timer':
          if (!isValidValue(config.duration, 'number')) {
            errors.push(`${nodeName}: Duration must be a number greater than 0 (use constant or number variable)`);
          }
          if (config.outputVariable && !isValidValue(config.outputVariable, 'number')) {
            errors.push(`${nodeName}: Output variable must be a declared number variable`);
          }
          break;
          
        case 'blockchain':
          if (config.operation === 'getBalance' && !isValidValue(config.address, 'string')) {
            errors.push(`${nodeName}: Address must be a declared string variable or valid address`);
          }
          if (config.operation === 'transfer' && !isValidValue(config.address, 'string')) {
            errors.push(`${nodeName}: Address must be a declared string variable or valid address`);
          }
          if (config.operation === 'transfer' && !isValidValue(config.amount, 'number')) {
            errors.push(`${nodeName}: Amount must be a declared number variable or numeric value greater than 0`);
          }
          if (config.outputVariable && !isValidValue(config.outputVariable)) {
            errors.push(`${nodeName}: Output variable must be a declared variable`);
          }
          break;
          
        case 'custom':
          // Custom nodes might have custom validation requirements
          // For now, we'll assume they're valid if they have any config
          if (!config || Object.keys(config).length === 0) {
            errors.push(`${nodeName}: Configuration is required`);
          }
          break;
      }
    });
    
    return errors;
  }, [nodes, edges, isValidValue]);

  const onDownloadFlow = useCallback(() => {
    // First validate node configurations
    const validationErrors = validateNodeConfigurations();
    if (validationErrors.length > 0) {
      const errorMessage = 'Flow validation failed:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }
    
    const flowData = {
      name: currentFlowName,
      description: flowDescription,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const result = flowSchema.safeParse(flowData);
    if (!result.success) {
      alert('Flow is invalid!\n' + JSON.stringify(result.error.issues, null, 2));
      return;
    }
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFlowName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, currentFlowName, flowDescription, validateNodeConfigurations]);

  const onAddToTemplateLibrary = useCallback(async () => {
    if (!user) {
      alert('Please log in to add flows to template library');
      return;
    }

    if (user.user_metadata?.role !== 'admin') {
      alert('Only admins can add flows to template library');
      return;
    }

    const templateName = prompt('Enter template name:');
    if (!templateName?.trim()) {
      alert('Template name is required');
      return;
    }

    const templateDescription = prompt('Enter template description (optional):');

    // Validate node configurations before adding to template library
    const validationErrors = validateNodeConfigurations();
    if (validationErrors.length > 0) {
      const errorMessage = 'Flow validation failed:\n\n' + validationErrors.join('\n');
      alert(errorMessage);
      return;
    }

    try {
      const flowData = {
        nodes,
        edges,
        timestamp: new Date().toISOString(),
      };

      // Validate flow data
      const result = flowSchema.safeParse(flowData);
      if (!result.success) {
        alert('Flow is invalid!\n' + JSON.stringify(result.error.issues, null, 2));
        return;
      }

      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: templateName.trim(),
          description: templateDescription?.trim() || null,
          category: 'Custom', // Default category, can be made configurable
          flow_data: flowData,
          is_official: false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        alert('Failed to save template: ' + error.message);
        return;
      }

      alert('Template added to library successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  }, [user, nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Section */}
      <div className="flex flex-1 min-h-0">
        {/* Block Library */}
        <BlockLibrary
          isOpen={isLibraryOpen}
          isCollapsed={isLibraryCollapsed}
          onToggleCollapse={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
          onAddNode={onAddNode}
        />

        {/* Main Flow Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <FlowToolbar
            onSave={onSaveFlow}
            onClear={onClearCanvas}
            onRunFlow={() => alert('Run functionality coming in Phase 2!')}
            isExecuting={false}
            onDownload={onDownloadFlow}
            currentFlowName={currentFlowName}
            isNewFlow={isNewFlow}
            isSaving={isSaving}
            validationErrors={validateNodeConfigurations()}
            onFitView={onFitView}
          />
          {/* Admin-only: Add to Template Library */}
          {user?.user_metadata?.role === 'admin' && (
            <div className="p-4">
              <button
                onClick={onAddToTemplateLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Template Library
              </button>
            </div>
          )}

          {/* Save Flow Dialog */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
              <div className="bg-gray-800 rounded-xl p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">Save Flow</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flow Name *
                    </label>
                    <input
                      type="text"
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      placeholder="Enter flow name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={flowDescription}
                      onChange={(e) => setFlowDescription(e.target.value)}
                      placeholder="Enter flow description"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveFlow}
                      disabled={isSaving || !flowName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Save Flow'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        if (!currentFlowId) {
                          setFlowName('');
                          setFlowDescription('');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* React Flow Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onKeyDown={onKeyDown}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                attributionPosition="bottom-left"
                className="dark"
                style={{ zIndex: 1 }}
              >
                <Controls className="dark" />
                <Background color="#374151" gap={20} />
                <MiniMap className="dark" />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>

      {/* Node Configuration Panel - Bottom */}
      <NodePanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onNodeDataChange={onNodeDataChange}
        availableVariables={availableVariables}
        declaredVariables={declaredVariables}
        onVariablesChange={handleVariablesChange}
      />
    </div>
  );
};

export default FlowBuilder; 