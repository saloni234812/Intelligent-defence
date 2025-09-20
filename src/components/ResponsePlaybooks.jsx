import { useState, useEffect } from "react";
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap } from "lucide-react";
import apiService from "../services/api";

const ResponsePlaybooks = () => {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load playbooks from API
  useEffect(() => {
    const loadPlaybooks = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPlaybooks();
        setPlaybooks(data.playbooks || data || []);
      } catch (error) {
        console.error('Failed to load playbooks:', error);
        // Fallback to default playbooks if API fails
        setPlaybooks([
          {
            id: 1,
            name: 'Deploy Patrol Response Team',
            description: 'to threat location',
            status: 'AVAILABLE',
            priority: 'HIGH',
            eta: '3m',
            isActive: false
          },
          {
            id: 2,
            name: 'LOCKDOWN PROTOCOL',
            description: 'Secure all access points and initiate perimeter lockdown',
            status: 'AVAILABLE',
            priority: 'CRITICAL',
            eta: '30s',
            isActive: false
          },
          {
            id: 3,
            name: 'LAUNCH UAV RECON',
            description: 'Deploy drone for aerial surveillance and assessment',
            status: 'IN PROGRESS',
            priority: 'HIGH',
            eta: '45s',
            isActive: true
          },
          {
            id: 4,
            name: 'ALERT COMMAND CENTER',
            description: 'Notify higher command of critical threat status',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            eta: '1s',
            isActive: false
          },
          {
            id: 5,
            name: 'ACTIVATE EMP SHIELD',
            description: 'Deploy electronic countermeasures in affected zone',
            status: 'AVAILABLE',
            priority: 'CRITICAL',
            eta: '10s',
            isActive: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaybooks();
  }, []);

  const executePlaybook = async (id) => {
    try {
      await apiService.executePlaybook(id);
      setPlaybooks(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'IN PROGRESS', isActive: true } : p
      ));
    } catch (error) {
      console.error('Failed to execute playbook:', error);
    }
  };

  const activeCount = playbooks.filter(p => p.status === 'IN PROGRESS').length;
  const readyCount = playbooks.filter(p => p.status === 'AVAILABLE').length;
  const completeCount = playbooks.filter(p => p.status === 'COMPLETED').length;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-yellow-600';
      case 'MEDIUM': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return 'text-green-400';
      case 'IN PROGRESS': return 'text-yellow-400';
      case 'COMPLETED': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">RESPONSE PLAYBOOKS</h3>
        <div className="ml-auto">
          <span className="bg-yellow-600 text-xs px-2 py-1 rounded text-white">1 ACTIVE</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">Automated tactical responses</div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {playbooks.map((playbook) => (
          <div key={playbook.id} className="bg-slate-900/50 border border-slate-600 rounded p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(playbook.priority)} text-white`}>
                    {playbook.priority}
                  </span>
                  {playbook.isActive && <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />}
                </div>
                <div className="text-sm text-gray-200 font-medium mb-1">{playbook.name}</div>
                <div className="text-xs text-gray-400">{playbook.description}</div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-xs">
                    ETA: <span className={getStatusColor(playbook.status)}>{playbook.eta}</span>
                  </div>
                  <div className="text-xs">
                    Status: <span className={getStatusColor(playbook.status)}>{playbook.status}</span>
                  </div>
                </div>
              </div>
              <div className="ml-3">
                {playbook.status === 'AVAILABLE' && (
                  <button 
                    onClick={() => executePlaybook(playbook.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
                  >
                    EXECUTE
                  </button>
                )}
                {playbook.status === 'IN PROGRESS' && (
                  <div className="text-yellow-400 text-xs font-mono">RUNNING...</div>
                )}
                {playbook.status === 'COMPLETED' && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-lg font-mono text-green-400">{readyCount}</div>
          <div className="text-xs text-gray-400">Ready</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono text-yellow-400">{activeCount}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono text-gray-400">{completeCount}</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>
    </div>
  );
};

 export default ResponsePlaybooks;