import { useState } from "react";


const TacticalMap = () => {
  const [mapData, setMapData] = useState([
    { id: 1, x: 15, y: 45, type: 'friendly', status: 'active' },
    { id: 2, x: 85, y: 25, type: 'friendly', status: 'active' },
    { id: 3, x: 25, y: 75, type: 'threat', status: 'critical' },
    { id: 4, x: 55, y: 35, type: 'neutral', status: 'alert' },
    { id: 5, x: 75, y: 65, type: 'friendly', status: 'active' },
    { id: 6, x: 45, y: 85, type: 'friendly', status: 'active' }
  ]);

  const getMarkerColor = (type, status) => {
    if (type === 'threat') return 'bg-red-500';
    if (type === 'neutral') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const activeCount = mapData.filter(item => item.status === 'active').length;
  const alertCount = mapData.filter(item => item.status === 'alert').length;
  const criticalCount = mapData.filter(item => item.status === 'critical').length;

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-cyan-400 font-mono text-sm">TACTICAL MAP</h3>
          <div className="text-xs text-gray-400">Sector Alpha-7 | Grid Reference: 34°N 118°W</div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-600 rounded-lg h-64 relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute inset-4 border border-cyan-500/20 rounded"></div>
        <div className="absolute left-1/2 top-1/2 w-px h-full bg-cyan-500/10 transform -translate-x-1/2"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/10 transform -translate-y-1/2"></div>
        
        {mapData.map((item) => (
          <div
            key={item.id}
            className={`absolute w-3 h-3 rounded-full ${getMarkerColor(item.type, item.status)} transform -translate-x-1/2 -translate-y-1/2 animate-pulse`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div className={`w-6 h-6 rounded-full ${getMarkerColor(item.type, item.status)} opacity-30 absolute -top-1.5 -left-1.5 animate-ping`}></div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-lg font-mono text-green-400">{activeCount}</span>
          </div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-lg font-mono text-yellow-400">{alertCount}</span>
          </div>
          <div className="text-xs text-gray-400">Alert</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-lg font-mono text-red-400">{criticalCount}</span>
          </div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;