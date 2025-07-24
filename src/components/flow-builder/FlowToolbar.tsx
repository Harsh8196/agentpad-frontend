'use client';

import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface FlowToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
  onRunFlow?: () => void;
  isExecuting?: boolean;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  onSave,
  onLoad,
  onClear,
  onDeleteSelected,
  hasSelection = false,
  onRunFlow,
  isExecuting = false,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Flow info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">My Agent Flow</h2>
            <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
              Draft
            </span>
          </div>
        </div>

        {/* Center - View controls */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle minimap"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle grid"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Delete selected */}
          {onDeleteSelected && (
            <button
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              className={`p-2 rounded-lg transition-colors ${
                hasSelection 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={hasSelection ? 'Delete selected' : 'No selection'}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Clear canvas */}
          <button
            onClick={onClear}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Load flow */}
          <button
            onClick={onLoad}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Load flow"
          >
            <Upload className="h-4 w-4" />
          </button>

          {/* Save flow */}
          <button
            onClick={onSave}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Save flow"
          >
            <Save className="h-4 w-4" />
          </button>

          {/* Download flow */}
          <button
            onClick={onSave}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download flow"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Run flow */}
          {onRunFlow && (
            <button
              onClick={onRunFlow}
              disabled={isExecuting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isExecuting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={isExecuting ? 'Running...' : 'Run flow'}
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Run</span>
                </>
              )}
            </button>
          )}

          {/* Pause execution */}
          {onRunFlow && (
            <button
              onClick={() => {}} // TODO: Implement pause
              disabled={!isExecuting}
              className={`p-2 rounded-lg transition-colors ${
                isExecuting
                  ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={isExecuting ? 'Pause execution' : 'Not running'}
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowToolbar; 