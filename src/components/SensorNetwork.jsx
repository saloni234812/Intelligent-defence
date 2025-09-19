import React, { useEffect, useMemo, useState } from "react";
import { Radar, Camera, Filter } from "lucide-react";
import StatusIndicator from "./statusindicator";

const SensorNetwork = () => {
  const [sensors, setSensors] = useState([]);
  const [summary, setSummary] = useState({ total: 0, online: 0, maintenance: 0, offline: 0, activeLabel: "-/- ACTIVE" });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/sensors");
        const json = await res.json();
        if (!isMounted) return;
        setSensors(json.sensors || []);
        setSummary(json.summary || summary);
        setError("");
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load sensors");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => { isMounted = false; clearInterval(timer); };
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return sensors;
    return sensors.filter(s => s.status === statusFilter);
  }, [sensors, statusFilter]);

  const online = useMemo(() => sensors.filter(s => s.status === 'ONLINE'), [sensors]);
  const maintenance = useMemo(() => sensors.filter(s => s.status === 'MAINTENANCE'), [sensors]);
  const offline = useMemo(() => sensors.filter(s => s.status === 'OFFLINE'), [sensors]);

  const renderSensor = (sensor) => (
    <div key={sensor.id} className="flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center">
        {sensor.type === 'RADAR' || sensor.id.startsWith('RADAR') ? 
          <Radar className="w-4 h-4 text-cyan-400" /> : 
          <Camera className="w-4 h-4 text-cyan-400" />
        }
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <StatusIndicator status={sensor.status} label={sensor.status} />
          <span className="ml-auto text-xs text-gray-400">{sensor.lastSeen || sensor.lastUpdate}</span>
        </div>
        <div className="text-xs text-gray-300 mt-1">{sensor.name}</div>
        <div className="text-xs text-gray-400">{sensor.id}</div>
        {sensor.status !== 'MAINTENANCE' && sensor.status !== 'OFFLINE' && (
          <div className="mt-1">
            <div className="text-xs text-gray-400">Health:</div>
            <div className="w-full bg-slate-700 h-1 rounded mt-1">
              <div 
                className="bg-cyan-400 h-1 rounded transition-all duration-300" 
                style={{ width: `${sensor.health ?? 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-cyan-300 mt-1">{sensor.health ?? 0}%</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">SENSOR NETWORK</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-xs text-gray-400">Filter</div>
          <div className="relative">
            <select
              className="bg-slate-900 border border-slate-700 text-xs text-gray-200 rounded px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ONLINE">Online</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
          <span className="bg-green-600 text-xs px-2 py-1 rounded text-white">{summary.activeLabel}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mb-3">System Health Monitor</div>

      {loading && <div className="text-xs text-gray-400">Loading sensors…</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      
      {!loading && (
        <>
          <div className="space-y-3">
            {filtered.map(renderSensor)}
          </div>

          {statusFilter === 'ALL' && offline.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-xs text-red-400 mb-2">Offline</div>
              <div className="space-y-3">
                {offline.map(renderSensor)}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <div className="text-lg font-mono text-green-400">{summary.online}</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-yellow-400">{summary.maintenance}</div>
              <div className="text-xs text-gray-400">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-red-400">{summary.offline}</div>
              <div className="text-xs text-gray-400">Offline</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default SensorNetwork;