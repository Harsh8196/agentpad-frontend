'use client';

import { useState, useEffect, useRef } from 'react';
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
  Building2,
  Bot,
  Play,
  Send,
  CheckCircle,
  FileText,
  Edit3
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
  const [selectedCategory, setSelectedCategory] = useState('core');
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories: BlockCategory[] = [
    {
      id: 'core',
      name: 'Core',
      icon: Play,
      blocks: [
        {
          id: 'start',
          name: 'Start',
          description: 'Flow execution starts here',
          icon: Play,
          type: 'start',
          color: 'bg-green-600',
        },
      ],
    },
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
        {
          id: 'logger',
          name: 'Logger',
          description: 'Log variables or messages at runtime',
          icon: MessageSquare,
          type: 'logger',
          color: 'bg-gray-500',
        },
        {
          id: 'telegram',
          name: 'Telegram',
          description: 'Send notifications and interactive messages',
          icon: Send,
          type: 'telegram',
          color: 'bg-blue-600',
        },
        {
          id: 'userApproval',
          name: 'User Approval',
          description: 'Wait for user confirmation before proceeding',
          icon: CheckCircle,
          type: 'userApproval',
          color: 'bg-green-600',
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
          name: 'Blockchain Operation',
          description: 'Execute any SEI blockchain operation',
          icon: Wallet,
          type: 'blockchain',
          color: 'bg-yellow-500',
        },
      ],
    },
    {
      id: 'ai',
      name: 'AI & Data',
      icon: Bot,
      blocks: [
        {
          id: 'marketData',
          name: 'Market Data',
          description: 'Fetch real-time token price and market data',
          icon: TrendingUp,
          type: 'marketData',
          color: 'bg-emerald-500',
        },
        {
          id: 'llm',
          name: 'AI Assistant',
          description: 'Use AI to analyze and make decisions',
          icon: Bot,
          type: 'llm',
          color: 'bg-pink-500',
        },
        {
          id: 'smartContractRead',
          name: 'Smart Contract Read',
          description: 'Read data from any smart contract',
          icon: FileText,
          type: 'smartContractRead',
          color: 'bg-blue-500',
        },
        {
          id: 'smartContractWrite',
          name: 'Smart Contract Write',
          description: 'Execute transactions on smart contracts',
          icon: Edit3,
          type: 'smartContractWrite',
          color: 'bg-orange-500',
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
    <div className={`bg-gray-800/50 border-r border-gray-700 flex flex-col transition-all duration-300 backdrop-blur-sm h-full min-h-0 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
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
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-300 transition-colors"
              title="Expand Block Library"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="w-6 h-px bg-gray-600"></div>
          </div>
        )}
      </div>

                           {/* Collapsed Category Icons with Expandable Sections */}
        {isCollapsed && (
                                         <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto block-library-scrollbar min-h-0" ref={dropdownRef}>
            {categories.map((category) => (
              <div key={category.id} className="relative">
                {/* Category Header */}
                                                   <button
                    onClick={() => setOpenDropdown(openDropdown === category.id ? null : category.id)}
                    className="w-full p-2 hover:bg-gray-700/50 transition-colors group relative flex items-center justify-center"
                    title={`${category.name} (${category.blocks.length} blocks)`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                    </div>
                  </button>
                
                {/* Expandable Category Section */}
                {openDropdown === category.id && (
                  <div className="bg-gray-700/30 border-t border-gray-600/50">
                    {/* Category Label */}
                                         <div className="px-2 py-1 border-b border-gray-600/50">
                       <div className="flex items-center justify-center">
                         <div className="w-4 h-4 flex items-center justify-center mr-1">
                           <category.icon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                         </div>
                         <span className="text-xs text-gray-400 font-medium">{category.name}</span>
                       </div>
                     </div>
                    
                    {/* Category Blocks */}
                    <div className="py-1">
                      {category.blocks.map((block) => (
                                                 <div
                           key={block.id}
                           draggable
                           onDragStart={(e) => handleDragStart(e, block)}
                           onDragEnd={handleDragEnd}
                           onClick={() => {
                             handleBlockClick(block);
                             setOpenDropdown(null);
                           }}
                           className="mx-1 mb-1 p-2 border border-gray-600/50 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                           title={`${block.name}: ${block.description}`}
                         >
                           <div className="flex items-center justify-center w-8 h-8">
                             <div className={`p-1.5 rounded ${block.color} w-5 h-5 flex items-center justify-center`}>
                               <block.icon className="h-3 w-3 text-white flex-shrink-0" />
                             </div>
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Bottom padding for scrollbar visibility */}
            <div className="h-4"></div>
            
            {/* Scroll indicator gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none"></div>
          </div>
       )}

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
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

      {/* Categories - Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 block-library-scrollbar relative custom-scroll">
            <div className="p-4 pb-8">
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
            
            {/* Scroll indicator gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockLibrary; 