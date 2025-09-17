import { Radar, Camera } from "lucide-react";
import StatusIndicator from "./statusindicator";

const SensorNetwork = () => {
  const sensors = [
    { id: 'RADAR-01', name: 'North Perimeter', status: 'ONLINE', health: 98, lastUpdate: '2s ago' },
    { id: 'RADAR-02', name: 'East Perimeter', status: 'ONLINE', health: 94, lastUpdate: '1s ago' },
    { id: 'CAM-ALPHA', name: 'Main Gate', status: 'ONLINE', health: 100, lastUpdate: '1s ago' },
    { id: 'CAM-BETA', name: 'South Watch', status: 'MAINTENANCE', health: 0, lastUpdate: '5m ago' }
  ];

  const onlineCount = sensors.filter(s => s.status === 'ONLINE').length;
  const maintenanceCount = sensors.filter(s => s.status === 'MAINTENANCE').length;

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">SENSOR NETWORK</h3>
        <div className="ml-auto">
          <span className="bg-green-600 text-xs px-2 py-1 rounded text-white">5/6 ACTIVE</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">System Health Monitor</div>
      
      <div className="space-y-3">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              {sensor.id.startsWith('RADAR') ? 
                <Radar className="w-4 h-4 text-cyan-400" /> : 
                <Camera className="w-4 h-4 text-cyan-400" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <StatusIndicator status={sensor.status} label={sensor.status} />
                <span className="ml-auto text-xs text-gray-400">{sensor.lastUpdate}</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">{sensor.name}</div>
              <div className="text-xs text-gray-400">{sensor.id}</div>
              {sensor.status !== 'MAINTENANCE' && (
                <div className="mt-1">
                  <div className="text-xs text-gray-400">Health:</div>
                  <div className="w-full bg-slate-700 h-1 rounded mt-1">
                    <div 
                      className="bg-cyan-400 h-1 rounded transition-all duration-300" 
                      style={{ width: `${sensor.health}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-cyan-300 mt-1">{sensor.health}%</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-lg font-mono text-green-400">{onlineCount}</div>
          <div className="text-xs text-gray-400">Online</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono text-yellow-400">{maintenanceCount}</div>
          <div className="text-xs text-gray-400">Maintenance</div>
        </div>
      </div>
    </div>
  );
};
export default SensorNetwork;