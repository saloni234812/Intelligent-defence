import { useState } from "react";
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap} from "lucide-react";


const AuditLog = () => {
  const logs = [
    {
      id: 1,
      type: 'SECURITY',
      event: 'THREAT_ACKNOWLEDGMENT',
      description: 'Acknowledged critical threat alert TH-001',
      operator: 'OPERATOR_01',
      timestamp: '2024-01-15 14:23:15'
    },
    {
      id: 2,
      type: 'OPERATIONAL',
      event: 'UAV_DEPLOYMENT',
      description: 'UAV-ALPHA deployed to coordinates 34.2N 118.1W',
      operator: 'SYSTEM',
      timestamp: '2024-01-15 14:21:30'
    },
    {
      id: 3,
      type: 'ALERT',
      event: 'THREAT_DETECTION',
      description: 'Anomalous vehicle pattern detected - Classification: Critical',
      operator: 'AI_CORE',
      timestamp: '2024-01-15 14:20:45'
    }
  ];

  const getEventColor = (type) => {
    switch(type) {
      case 'SECURITY': return 'text-green-400';
      case 'OPERATIONAL': return 'text-blue-400';
      case 'ALERT': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">AUDIT LOG</h3>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">System operations & security events</div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-900/50 border border-slate-600 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-mono ${getEventColor(log.type)}`}>
                {log.event}
              </span>
              <span className="text-xs text-gray-500">{log.timestamp}</span>
            </div>
            <div className="text-xs text-gray-300">{log.description}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <span>👤 {log.operator}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AuditLog;