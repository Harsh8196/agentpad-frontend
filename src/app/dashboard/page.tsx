import { 
  Workflow, 
  FileText, 
  BarChart3, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome to your AgentPad workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Workflow className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Flows</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Active Executions</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Last 24h Executions</p>
              <p className="text-2xl font-bold text-white">47</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Errors</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/flow-builder"
            className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
          >
            <Workflow className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <p className="font-medium text-white">Create New Flow</p>
              <p className="text-sm text-gray-400">Build a new AI agent</p>
            </div>
          </a>

          <a
            href="/templates"
            className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-colors"
          >
            <FileText className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="font-medium text-white">Browse Templates</p>
              <p className="text-sm text-gray-400">Use pre-built flows</p>
            </div>
          </a>

          <a
            href="/analytics"
            className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-purple-400 mr-3" />
            <div>
              <p className="font-medium text-white">View Analytics</p>
              <p className="text-sm text-gray-400">Monitor performance</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-white">Flow "Arbitrage Bot" executed successfully</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Success</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-white">New flow "Yield Farming" created</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">Created</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-white">Flow "Price Alert" failed execution</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">Error</span>
          </div>
        </div>
      </div>
    </div>
  );
} 