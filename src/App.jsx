import React, { useState, useEffect } from 'react';
import { Shield, Radar, Camera, AlertTriangle, Eye, Lock, Send, CheckCircle, Clock, Zap } from 'lucide-react';
import AICommand from './components/AICommand';
import AuditLog from './components/AuditLog';
import ResponsePlaybooks from './components/ResponsePlaybooks';
import SensorNetwork from './components/SensorNetwork';
import StatusIndicator from './components/statusindicator';
import TacticalMap from './components/TacticalMap';
import ThreatAlerts from './components/ThreatAlerts';

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 text-gray-100 min-h-screen p-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-mono text-cyan-400">AEGIS DEFENSE SYSTEM</h1>
            <p className="text-sm text-gray-400">Advanced Tactical Operations Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <Clock className="w-4 h-4 inline mr-2" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}, {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-xs px-2 py-1 rounded text-white">OPERATIONAL</span>
            <span className="bg-yellow-600 text-xs px-2 py-1 rounded text-white">THREAT LEVEL: ELEVATED</span>
          </div>
        </div>
      </header>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-6">
            <span>System Status: <span className="text-green-400">NOMINAL</span></span>
            <span>Network: <span className="text-green-400">SECURE</span></span>
            <span>AI Core: <span className="text-green-400">ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span>Uptime: <span className="text-cyan-400">99.7%</span></span>
            <span>Version: <span className="text-gray-400">AEGIS-2.1.4</span></span>
            <span>Classification: <span className="text-red-400">CONFIDENTIAL</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SensorNetwork />
          <TacticalMap />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <ResponsePlaybooks />
          <AICommand />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <ThreatAlerts />
          <AuditLog />
        </div>
      </div>
    </div>
  );
};

export default App;