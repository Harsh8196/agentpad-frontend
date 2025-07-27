'use client';

import { useState } from 'react';
import { 
  Zap, 
  Users, 
  Settings, 
  Database, 
  GitBranch, 
  Code, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Clock,
  RotateCcw,
  Network,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Building2
} from 'lucide-react';

interface BlockLibraryProps {
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface BlockCategory {
  id: string;
  name: string;
  icon: any;
  blocks: Block[];
}

interface Block {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: string;
  color: string;
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({ 
  onAddNode, 
  isOpen = true,
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('basic-logic');
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const categories: BlockCategory[] = [
    {
      id: 'basic-logic',
      name: 'Basic Logic',
      icon: Code,
      blocks: [
        {
          id: 'conditional',
          name: 'Conditional',
          description: 'If-then-else logic with comparison operators',
          icon: GitBranch,
          type: 'conditional',
          color: 'bg-blue-500',
        },
        {
          id: 'arithmetic',
          name: 'Arithmetic',
          description: 'Mathematical operations (add, subtract, multiply, divide)',
          icon: Calculator,
          type: 'arithmetic',
          color: 'bg-green-500',
        },
        {
          id: 'variable',
          name: 'Variable',
          description: 'Set, get, and manipulate variables',
          icon: Database,
          type: 'variable',
          color: 'bg-purple-500',
        },
        {
          id: 'loop',
          name: 'Loop',
          description: 'For, while, and forEach loops',
          icon: RotateCcw,
          type: 'loop',
          color: 'bg-orange-500',
        },
        {
          id: 'timer',
          name: 'Timer',
          description: 'Delay, interval, and timeout operations',
          icon: Clock,
          type: 'timer',
          color: 'bg-indigo-500',
        },
      ],
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      icon: Network,
      blocks: [
        {
          id: 'blockchain',
          name: 'Blockchain',
          description: 'SEI blockchain operations (balance, transfer, swap)',
          icon: Wallet,
          type: 'blockchain',
          color: 'bg-yellow-500',
        },
      ],
    },
  ];

  const handleDragStart = (event: React.DragEvent, block: Block) => {
    event.dataTransfer.setData('application/reactflow', block.type);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedBlock(block);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const handleBlockClick = (block: Block) => {
    // Add node at center of canvas for now
    onAddNode(block.type, { x: 250, y: 250 });
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    blocks: category.blocks.filter(block =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.blocks.length > 0);

  if (!isOpen) return null;

  return (
    <div className={`bg-gray-800/50 border-r border-gray-700 flex flex-col transition-all duration-300 backdrop-blur-sm ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <>
            <h2 className="text-lg font-semibold text-white">Block Library</h2>
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-700/50 rounded mx-auto text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="mb-6">
                  <div className="flex items-center mb-3">
                    <category.icon className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-white">{category.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.blocks.map((block) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleBlockClick(block)}
                        className={`p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors ${
                          draggedBlock?.id === block.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${block.color}`}>
                            <block.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{block.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{block.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockLibrary; 