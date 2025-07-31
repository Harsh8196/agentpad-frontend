import React from 'react';
import { Handle, Position } from 'reactflow';

interface LLMNodeData {
  label: string;
  description: string;
  config?: {
    prompt?: string;
    input?: string;
    model?: string;
    temperature?: number;
    chatInterface?: boolean;
  };
}

interface LLMNodeProps {
  data: LLMNodeData;
}

const LLMNode: React.FC<LLMNodeProps> = ({ data }) => {
  const config = data.config || {};
  const prompt = config.prompt || '';
  const model = config.model || 'gpt-4-turbo';
  const temperature = config.temperature || 0;

  return (
    <div className="bg-pink-600 border-2 border-pink-500 rounded-lg p-4 shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-pink-400 border-2 border-pink-600"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-pink-400 border-2 border-pink-600"
      />
      
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{data.label}</h3>
          <p className="text-pink-100 text-xs">{data.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {prompt && (
          <div className="bg-pink-700/30 rounded p-2">
            <div className="text-pink-100 text-xs font-medium mb-1">Prompt:</div>
            <p className="text-pink-200 text-xs line-clamp-2">{prompt}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-pink-100">Model:</span>
          <span className="text-pink-200 bg-pink-700 px-1 rounded">{model}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-pink-100">Temperature:</span>
          <span className="text-pink-200 bg-pink-700 px-1 rounded">{temperature}</span>
        </div>
        
        {config.chatInterface && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-pink-100 text-xs">Chat Interface</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMNode; 