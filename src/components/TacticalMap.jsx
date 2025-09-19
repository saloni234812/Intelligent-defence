import { useEffect, useMemo, useState } from "react";


const TacticalMap = () => {
  const [area, setArea] = useState('alpha');
  const [mode, setMode] = useState('online'); // online | offline | maintenance
  const [title, setTitle] = useState('Sector Alpha-7');
  const [grid, setGrid] = useState('34°N 118°W');
  const [mapData, setMapData] = useState([]);

  const API_BASE = useMemo(() => import.meta.env.VITE_API_BASE || 'http://localhost:8000', []);

  const loadOffline = async (key) => {
    const file = key === 'alpha' ? '/src/assets/maps/alpha.json' : '/src/assets/maps/bravo.json';
    const res = await fetch(file);
    const data = await res.json();
    setTitle(data.name);
    setGrid(data.grid);
    setMapData(data.markers);
  };

  const loadOnline = async () => {
    try {
      // Use backend maps endpoint for live area data
      const res = await fetch(`${API_BASE}/maps/${area}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setTitle(data.name || 'Live Operational View');
      setGrid(data.grid || 'dynamic');
      setMapData(Array.isArray(data.markers) ? data.markers : []);
    } catch (e) {
      // Fallback to offline if server unreachable
      await loadOffline(area);
    }
  };

  useEffect(() => {
    if (mode === 'online') loadOnline();
    if (mode === 'offline') loadOffline(area);
    if (mode === 'maintenance') {
      setTitle('Maintenance Mode');
      setGrid('systems check');
      setMapData([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, mode]);

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
          <div className="text-xs text-gray-400">{title} | Grid Reference: {grid}</div>
        </div>
        <div className="flex items-center gap-2">
          <select value={area} onChange={e => setArea(e.target.value)} className="bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 text-gray-300">
            <option value="alpha">Alpha</option>
            <option value="bravo">Bravo</option>
          </select>
          <select value={mode} onChange={e => setMode(e.target.value)} className="bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 text-gray-300">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
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