import { useEffect, useState } from "react";
import { Activity, AlertTriangle, SignalHigh, ShieldHalf, TrendingUp } from "lucide-react";
import apiService from "../services/api";

const formatPercent = (n) => `${Math.round((n || 0) * 10) / 10}%`;

const Sparkline = ({ points }) => {
  const w = 160;
  const h = 40;
  const max = Math.max(...points, 1);
  const step = w / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (p / max) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="opacity-80">
      <path d={path} fill="none" stroke="#22d3ee" strokeWidth="2" />
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
      </linearGradient>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#g)" />
    </svg>
  );
};

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="group bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/60 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <TrendingUp className="w-4 h-4 text-cyan-400 opacity-50" />
    </div>
    <div className="mt-2 text-2xl font-mono text-gray-100">{value}</div>
    {trend && (
      <div className="mt-2">
        <Sparkline points={trend} />
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getAlertStats();
      setSummary(stats.summary);
      setTrends(stats.trends);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      // Fallback to default values
      setSummary({ active_alerts: 0, critical_alerts: 0, system_health: 0, uptime: 0 });
      setTrends([2,3,4,5,6,7,5]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const uptime = summary?.uptime || 99.7;
  const systemHealth = (summary?.system_health || 96) / 100; // Convert to 0..1

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-300">
        <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <label className="flex items-center gap-2">
          <span>From</span>
          <input type="date" className="bg-slate-900 border border-slate-700 rounded px-2 py-1" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span>Min Confidence</span>
          <input type="range" min="0" max="100" step="5" value={minConfidence} onChange={e => setMinConfidence(parseInt(e.target.value))} />
          <span className="font-mono text-cyan-300">{minConfidence}%</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={AlertTriangle} label="Active Alerts" value={summary ? summary.active_alerts : '—'} trend={trends} />
      <StatCard icon={ShieldHalf} label="Critical Alerts" value={summary ? summary.critical_alerts : '—'} trend={trends} />
      <StatCard icon={Activity} label="System Health" value={formatPercent(systemHealth * 100)} trend={[70,80,85,90,95,96,97]} />
      <StatCard icon={SignalHigh} label="Uptime" value={`${uptime}%`} trend={[98,98,99,99,99,99.5,99.7]} />
      </div>
    </div>
  );
};

export default Dashboard;




