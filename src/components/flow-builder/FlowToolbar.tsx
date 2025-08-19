'use client';

import { 
  Save, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  Eye,
  EyeOff,
  X,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface FlowToolbarProps {
  onSave: () => void;
  onClear: () => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
  onRunFlow?: () => void;
  isExecuting?: boolean;
  onDownload: () => void;
  currentFlowName?: string;
  isNewFlow?: boolean;
  isSaving?: boolean;
  validationErrors?: string[];
  onFitView?: () => void;
  onOpenAIPlanner?: () => void;
  onAddToTemplateLibrary?: () => void;
  isAdmin?: boolean;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  onSave,
  onClear,
  onDeleteSelected,
  hasSelection = false,
  onRunFlow,
  isExecuting = false,
  onDownload,
  currentFlowName = 'Untitled Flow',
  isNewFlow = true,
  isSaving = false,
  validationErrors = [],
  onFitView,
  onOpenAIPlanner,
  onAddToTemplateLibrary,
  isAdmin = false,
}) => {

  
  return (
    <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Flow info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-white">{currentFlowName}</h2>
            <span className={`px-2 py-1 text-xs rounded ${
              isNewFlow 
                ? 'bg-orange-600 text-orange-200' 
                : 'bg-green-600 text-green-200'
            }`}>
              {isNewFlow ? 'New' : 'Saved'}
            </span>
            {validationErrors.length > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-red-600 text-red-200">
                {validationErrors.length} Error{validationErrors.length !== 1 ? 's' : ''}
              </span>
            )}
            {isSaving && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                <span className="text-xs text-blue-400">Saving...</span>
              </div>
            )}
          </div>
        </div>

        {/* Center - View controls */}
        <div className="flex items-center space-x-2">
          {onFitView && (
            <button
              onClick={onFitView}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Fit view to canvas"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          
          <button
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Toggle grid"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* AI Planner */}
          {onOpenAIPlanner && (
            <button
              onClick={onOpenAIPlanner}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white hover:from-purple-600 hover:to-blue-600"
              title="Open AI Workflow Planner"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Plan</span>
            </button>
          )}
          
          {/* Add to Template Library (Admin only) */}
          {isAdmin && onAddToTemplateLibrary && (
            <button
              onClick={onAddToTemplateLibrary}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors"
              title="Add to Template Library"
            >
              <span>Add to Template Library</span>
            </button>
          )}
          {/* Delete selected */}
          {onDeleteSelected && (
            <button
              onClick={onDeleteSelected}
              disabled={!hasSelection}
              className={`p-2 rounded-lg transition-colors ${
                hasSelection 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              title={hasSelection ? 'Delete selected' : 'No selection'}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Clear canvas */}
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="h-4 w-4" />
          </button>



          {/* Save flow */}
          <button
            onClick={onSave}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Save flow"
          >
            <Save className="h-4 w-4" />
          </button>

          {/* Download flow */}
          <button
            onClick={onDownload}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
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
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
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
                  ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/20'
                  : 'text-gray-500 cursor-not-allowed'
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