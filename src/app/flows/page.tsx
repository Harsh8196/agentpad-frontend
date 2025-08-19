'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Play, Calendar, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthContext } from '../../components/auth/AuthProvider';

interface Flow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  flow_data: any;
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      loadFlows();
    }
  }, [user]);

  const loadFlows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading flows:', error);
        return;
      }

      setFlows(data || []);
    } catch (error) {
      console.error('Error loading flows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlowClick = (flow: Flow) => {
    // Store the flow data in localStorage for the flow builder to load
    localStorage.setItem('selectedFlow', JSON.stringify(flow));
    router.push('/flow-builder');
  };

  const handleNewFlow = () => {
    // Clear any previously selected flow
    localStorage.removeItem('selectedFlow');
    router.push('/flow-builder');
  };

  const handleDeleteFlow = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this flow?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId);

      if (error) {
        console.error('Error deleting flow:', error);
        alert('Failed to delete flow');
        return;
      }

      // Remove from local state
      setFlows(flows.filter(flow => flow.id !== flowId));
    } catch (error) {
      console.error('Error deleting flow:', error);
      alert('Failed to delete flow');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Flows</h1>
            <p className="text-gray-400">
              {flows.length} flow{flows.length !== 1 ? 's' : ''} • Manage your AI agent workflows
            </p>
          </div>
          
          <button
            onClick={handleNewFlow}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Flow</span>
          </button>
        </div>

        {/* Flows Grid */}
        {flows.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No flows yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first AI agent workflow to get started
              </p>
              <button
                onClick={handleNewFlow}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Flow</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => handleFlowClick(flow)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:bg-gray-800/70 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {flow.name}
                    </h3>
                    {flow.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {flow.description}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteFlow(flow.id, e)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete flow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {formatDate(flow.updated_at)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 