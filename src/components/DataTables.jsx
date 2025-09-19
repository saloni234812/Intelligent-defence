import { useEffect, useState } from 'react';
import { Database, Users, AlertTriangle, Radar, Edit, Trash2, Plus } from 'lucide-react';

const DataTables = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [radar, setRadar] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5000';

  const fetchData = async (endpoint, setter) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setter(data.users || data.alerts || data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchData('/api/users', setUsers);
    if (activeTab === 'alerts') fetchData('/api/alerts', setAlerts);
    if (activeTab === 'radar') fetchData('/api/radar', setRadar);
  }, [activeTab]);

  const deleteItem = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/${type}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        // Refresh data
        if (type === 'users') fetchData('/api/users', setUsers);
        if (type === 'alerts') fetchData('/api/alerts', setAlerts);
        if (type === 'radar') fetchData('/api/radar', setRadar);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'text-red-400';
      case 'ACKNOWLEDGED': return 'text-yellow-400';
      case 'RESOLVED': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CRITICAL': return 'text-red-400 bg-red-900/20';
      case 'HIGH': return 'text-yellow-400 bg-yellow-900/20';
      case 'MEDIUM': return 'text-blue-400 bg-blue-900/20';
      case 'LOW': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm">DATA MANAGEMENT</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 text-xs rounded ${activeTab === 'users' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Users
        </button>
        <button
          className={`px-3 py-1 text-xs rounded ${activeTab === 'alerts' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}
          onClick={() => setActiveTab('alerts')}
        >
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          Alerts
        </button>
        <button
          className={`px-3 py-1 text-xs rounded ${activeTab === 'radar' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}
          onClick={() => setActiveTab('radar')}
        >
          <Radar className="w-4 h-4 inline mr-1" />
          Radar
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center py-4 text-gray-400">Loading...</div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 text-gray-300">Name</th>
                <th className="text-left py-2 text-gray-300">Email</th>
                <th className="text-left py-2 text-gray-300">Role</th>
                <th className="text-left py-2 text-gray-300">Created</th>
                <th className="text-left py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700">
                  <td className="py-2 text-gray-200">{user.name}</td>
                  <td className="py-2 text-gray-200">{user.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'Admin' ? 'bg-red-900/20 text-red-400' :
                      user.role === 'Operator' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-blue-900/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteItem('users', user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'alerts' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 text-gray-300">Type</th>
                <th className="text-left py-2 text-gray-300">Title</th>
                <th className="text-left py-2 text-gray-300">Location</th>
                <th className="text-left py-2 text-gray-300">Confidence</th>
                <th className="text-left py-2 text-gray-300">Status</th>
                <th className="text-left py-2 text-gray-300">Created</th>
                <th className="text-left py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-slate-700">
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(alert.alert_type)}`}>
                      {alert.alert_type}
                    </span>
                  </td>
                  <td className="py-2 text-gray-200">{alert.title}</td>
                  <td className="py-2 text-gray-200">{alert.location}</td>
                  <td className="py-2 text-gray-200">{alert.confidence}%</td>
                  <td className="py-2">
                    <span className={getStatusColor(alert.status)}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-400">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteItem('alerts', alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'radar' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 text-gray-300">Radar ID</th>
                <th className="text-left py-2 text-gray-300">Range (m)</th>
                <th className="text-left py-2 text-gray-300">Azimuth</th>
                <th className="text-left py-2 text-gray-300">Velocity</th>
                <th className="text-left py-2 text-gray-300">Confidence</th>
                <th className="text-left py-2 text-gray-300">Timestamp</th>
                <th className="text-left py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {radar.slice(0, 20).map((detection) => (
                <tr key={detection.id} className="border-b border-slate-700">
                  <td className="py-2 text-gray-200">{detection.radar_id || detection.radarId}</td>
                  <td className="py-2 text-gray-200">{detection.range_meters || detection.rangeMeters}</td>
                  <td className="py-2 text-gray-200">{detection.azimuth_deg || detection.azimuthDeg}°</td>
                  <td className="py-2 text-gray-200">{detection.velocity_mps || detection.velocityMps} m/s</td>
                  <td className="py-2 text-gray-200">
                    {Math.round((detection.confidence || 0) * 100)}%
                  </td>
                  <td className="py-2 text-gray-400">
                    {new Date(detection.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteItem('radar', detection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {radar.length > 20 && (
            <div className="text-center py-2 text-gray-400 text-xs">
              Showing 20 of {radar.length} detections
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTables;

