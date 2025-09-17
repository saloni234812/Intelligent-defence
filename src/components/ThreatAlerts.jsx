import { useState } from "react";
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap} from "lucide-react";


const ThreatAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'CRITICAL',
      title: 'UNAUTHORIZED VEHICLE DETECTED',
      description: 'AI Analysis: High-speed vehicle approaching Sector 7. Pattern does not match authorized patrol routes. Recommend immediate intercept.',
      location: 'Grid 34.2N, 118.1W',
      confidence: 94,
      timestamp: '2024-01-15 14:23:15',
      acknowledged: false
    },
    {
      id: 2,
      type: 'HIGH',
      title: 'ANOMALOUS MOVEMENT PATTERN',
      description: 'Multiple objects detected moving in formation. AI suggests potential coordinated activity requiring attention.',
      location: 'Perimeter Zone',
      confidence: 78,
      timestamp: '2024-01-15 14:21:45',
      acknowledged: false
    },
    {
      id: 3,
      type: 'MEDIUM',
      title: 'SENSOR CALIBRATION DRIFT',
      description: 'RADAR-02 showing minor calibration variance. Automatic compensation applied. Monitor for further deviation.',
      location: 'Station 2',
      confidence: 78,
      timestamp: '2024-01-15 14:19:30',
      acknowledged: false
    }
  ]);

  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-600/20 border-red-500';
      case 'HIGH': return 'bg-yellow-600/20 border-yellow-500';
      case 'MEDIUM': return 'bg-blue-600/20 border-blue-500';
      default: return 'bg-gray-600/20 border-gray-500';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-yellow-600';
      case 'MEDIUM': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const newAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">THREAT ALERTS</h3>
        <div className="ml-auto">
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white">{newAlertsCount} NEW</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">Real-time AI-powered threat detection</div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className={`rounded-lg p-3 border ${getAlertColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className={`px-2 py-1 text-xs rounded ${getAlertIcon(alert.type)} text-white`}>
                  {alert.type}
                </span>
                <span className="text-xs text-gray-400">{alert.timestamp}</span>
              </div>
              {!alert.acknowledged && (
                <button 
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-gray-300 transition-colors"
                >
                  ACK
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-200 font-medium mb-2">{alert.title}</div>
            <div className="text-xs text-gray-400 mb-2">{alert.description}</div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400">
                <span className="text-red-400">📍</span> {alert.location}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  AI Confidence: <span className="text-green-400 font-mono">{alert.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
 export default ThreatAlerts;