import { useEffect, useState } from "react";
import { Shield, Zap, Database, Flame, Radio, AlertCircle, Eye, Truck, User, Plane, CloudRain, Phone, Wrench, UserCheck, Wifi } from "lucide-react";
import threatTypesService from "../services/threatTypes";
import apiService from "../services/api";

const ThreatTypesOverview = () => {
  const [threatStats, setThreatStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [alertsData, categoriesData] = await Promise.all([
          apiService.getAlerts({ per_page: 100 }),
          threatTypesService.getCategories()
        ]);
        
        const alerts = alertsData.alerts || [];
        const stats = threatTypesService.getThreatStatistics(alerts);
        setThreatStats(stats);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load threat statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      'PHYSICAL': Shield,
      'AERIAL': Zap,
      'CYBER': Database,
      'ENVIRONMENTAL': Flame,
      'COMMUNICATION': Radio,
      'EQUIPMENT': AlertCircle,
      'INTELLIGENCE': Eye
    };
    const IconComponent = iconMap[categoryId] || AlertCircle;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono text-sm">THREAT TYPES OVERVIEW</h3>
        </div>
        <div className="text-center text-gray-400">Loading threat statistics...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">THREAT TYPES OVERVIEW</h3>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{threatStats?.total || 0}</div>
          <div className="text-xs text-gray-400">Total Alerts</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{threatStats?.bySeverity?.CRITICAL || 0}</div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{threatStats?.bySeverity?.HIGH || 0}</div>
          <div className="text-xs text-gray-400">High</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{threatStats?.bySeverity?.MEDIUM || 0}</div>
          <div className="text-xs text-gray-400">Medium</div>
        </div>
      </div>

      {/* Threat Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-mono text-cyan-300 mb-3">Threat Categories</h4>
        {categories.map(category => {
          const count = threatStats?.byCategory?.[category.id] || 0;
          const percentage = threatStats?.total ? Math.round((count / threatStats.total) * 100) : 0;
          
          return (
            <div key={category.id} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
              <div className="flex items-center gap-3">
                <div style={{ color: threatTypesService.getCategoryColor(category.id) }}>
                  {getCategoryIcon(category.id)}
                </div>
                <div>
                  <div className="text-sm text-gray-200">{category.name}</div>
                  <div className="text-xs text-gray-400">{category.count} types</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-cyan-300">{count}</div>
                <div className="text-xs text-gray-400">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source Distribution */}
      {threatStats?.bySource && (
        <div className="mt-6">
          <h4 className="text-sm font-mono text-cyan-300 mb-3">Alert Sources</h4>
          <div className="space-y-2">
            {Object.entries(threatStats.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: threatTypesService.getSourceColor(source) }}
                  ></div>
                  <span className="text-gray-300">{source}</span>
                </div>
                <span className="text-cyan-300 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {threatStats?.byStatus && (
        <div className="mt-6">
          <h4 className="text-sm font-mono text-cyan-300 mb-3">Alert Status</h4>
          <div className="space-y-2">
            {Object.entries(threatStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{status}</span>
                <span className="text-cyan-300 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatTypesOverview;
