'use client';

import { useState, useCallback, useRef } from 'react';
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

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  conditional: ConditionalNode,
  arithmetic: ArithmeticNode,
  variable: VariableNode,
  loop: LoopNode,
  timer: TimerNode,
  blockchain: BlockchainNode,
};

const FlowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
          };
        case 'arithmetic':
          return {
            operation: 'add',
            value1: '',
            value2: '',
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
            duration: 1000,
            unit: 'ms',
          };
        case 'blockchain':
          return {
            operation: 'getBalance',
            address: '',
            token: '',
          };
        default:
          return {};
      }
    };

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        type: nodeType,
        config: getDefaultConfig(nodeType),
        description: `Configure your ${nodeType} node`,
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
  const onKeyDown = useCallback((event: KeyboardEvent) => {
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

  // Save flow
  const onSaveFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    // For now, just log the flow data
    console.log('Saving flow:', flowData);
    
    // TODO: Implement save to database
    alert('Flow saved! (Console log for now)');
  }, [nodes, edges]);

  // Load flow
  const onLoadFlow = useCallback(() => {
    // TODO: Implement load from database
    alert('Load flow functionality coming soon!');
  }, []);

  // Clear canvas
  const onClearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen flex">
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
          onLoad={onLoadFlow}
          onClear={onClearCanvas}
          onRun={() => alert('Run functionality coming in Phase 2!')}
          isExecuting={false}
        />

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
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <Background />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Node Configuration Panel */}
      <NodePanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onNodeDataChange={onNodeDataChange}
      />
    </div>
  );
};

export default FlowBuilder; 