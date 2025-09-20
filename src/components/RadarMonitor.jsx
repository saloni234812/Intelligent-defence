import { useEffect, useRef, useState } from 'react';
import apiService from '../services/api';

const levelColor = (lvl) => {
  switch(lvl){
    case 'CRITICAL': return 'bg-red-600/20 border-red-500';
    case 'HIGH': return 'bg-yellow-600/20 border-yellow-500';
    case 'MEDIUM': return 'bg-blue-600/20 border-blue-500';
    default: return 'bg-gray-600/20 border-gray-500';
  }
};

const RadarMonitor = () => {
  const [detections, setDetections] = useState([]);
  const [insights, setInsights] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const eventSrcRef = useRef(null);

  // Load initial radar data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getRadarDetections({ limit: 50 });
        setDetections(data || []);
      } catch (error) {
        console.error('Failed to load initial radar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Set up real-time radar stream
  useEffect(() => {
    const ws = apiService.createRadarWebSocket();
    eventSrcRef.current = ws;
    
    ws.onopen = () => setConnected(true);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'detection') {
          setDetections(prev => [data.detection, ...prev].slice(0, 100));
        } else if (data.type === 'ai_insight') {
          setInsights(prev => [data, ...prev].slice(0, 50));
        }
      } catch (error) {
        console.error('Failed to parse radar data:', error);
      }
    };
    
    return () => { 
      try { 
        ws.close(); 
      } catch (error) {
        console.error('Error closing radar WebSocket:', error);
      }
    };
  }, []);

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-cyan-400 font-mono text-sm">RADAR MONITOR</h3>
        <span className={`ml-auto text-xs px-2 py-1 rounded ${connected ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300'}`}>{connected ? 'LIVE' : 'OFFLINE'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-2">Recent Detections</div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {detections.map(d => (
              <div key={d._id || d.timestamp} className="border border-slate-600/50 rounded p-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>{d.radarId}</span>
                  <span className="text-gray-400">{new Date(d.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>Range: <span className="text-cyan-300 font-mono">{d.rangeMeters} m</span></div>
                  <div>Az: <span className="text-cyan-300 font-mono">{d.azimuthDeg}°</span></div>
                  <div>Vel: <span className="text-cyan-300 font-mono">{d.velocityMps} m/s</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-2">AI Insights</div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {insights.map((i, idx) => (
              <div key={idx} className={`rounded p-2 border ${levelColor(i.level)} text-xs text-gray-200`}>
                <div className="flex justify-between">
                  <span className="font-mono">{i.level}</span>
                  <span className="text-gray-400">{new Date(i.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="mt-1 text-gray-300">{i.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarMonitor;




