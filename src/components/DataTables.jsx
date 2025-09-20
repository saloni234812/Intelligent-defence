import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Radar, Shield, Edit, Trash2, Plus } from 'lucide-react';
import { threatTypesService } from '../services/threatTypes';

const DataTables = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [threatTypes, setThreatTypes] = useState([]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'users':
          const usersRes = await fetch('/api/users');
          const usersData = await usersRes.json();
          setUsers(usersData.data || usersData || []);
          break;
        case 'alerts':
          const alertsRes = await fetch('/api/alerts');
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.data || alertsData || []);
          break;
        case 'radar':
          const radarRes = await fetch('/api/radar');
          const radarData = await radarRes.json();
          setRadarData(radarData.data || radarData || []);
          break;
        case 'threats':
          const threatTypesData = await threatTypesService.getThreatTypes();
          setThreatTypes(threatTypesData);
          console.log('Threat types loaded:', threatTypesData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'radar', label: 'Radar', icon: Radar },
    { id: 'threats', label: 'Threat Types', icon: Shield }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Data Management</h2>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="flex space-x-1 mb-6 bg-slate-700 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-2 text-gray-300">Loading...</span>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 text-gray-300">ID</th>
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
                  <td className="py-2 text-gray-200 font-mono">{user.id}</td>
                  <td className="py-2 text-gray-200">{user.name}</td>
                  <td className="py-2 text-gray-300">{user.email}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
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
                    <button className="text-red-400 hover:text-red-300">
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
                <th className="text-left py-2 text-gray-300">ID</th>
                <th className="text-left py-2 text-gray-300">Type</th>
                <th className="text-left py-2 text-gray-300">Title</th>
                <th className="text-left py-2 text-gray-300">Threat Type</th>
                <th className="text-left py-2 text-gray-300">Location</th>
                <th className="text-left py-2 text-gray-300">Status</th>
                <th className="text-left py-2 text-gray-300">Confidence</th>
                <th className="text-left py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-slate-700">
                  <td className="py-2 text-gray-200 font-mono">{alert.id}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.alert_type === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.alert_type === 'HIGH' ? 'bg-orange-600 text-white' :
                      alert.alert_type === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {alert.alert_type}
                    </span>
                  </td>
                  <td className="py-2 text-gray-200">{alert.title}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                      {threatTypesService.formatThreatType(alert.threat_type)}
                    </span>
                  </td>
                  <td className="py-2 text-gray-300">{alert.location}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.status === 'ACTIVE' ? 'bg-red-600 text-white' :
                      alert.status === 'INVESTIGATING' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-300">{alert.confidence}%</td>
                  <td className="py-2">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
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
                <th className="text-left py-2 text-gray-300">ID</th>
                <th className="text-left py-2 text-gray-300">Type</th>
                <th className="text-left py-2 text-gray-300">Location</th>
                <th className="text-left py-2 text-gray-300">Distance</th>
                <th className="text-left py-2 text-gray-300">Speed</th>
                <th className="text-left py-2 text-gray-300">Bearing</th>
                <th className="text-left py-2 text-gray-300">Timestamp</th>
                <th className="text-left py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {radarData.map((detection) => (
                <tr key={detection.id} className="border-b border-slate-700">
                  <td className="py-2 text-gray-200 font-mono">{detection.id}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                      {detection.type}
                    </span>
                  </td>
                  <td className="py-2 text-gray-200">{detection.location}</td>
                  <td className="py-2 text-gray-300">{detection.distance} km</td>
                  <td className="py-2 text-gray-300">{detection.speed} km/h</td>
                  <td className="py-2 text-gray-300">{detection.bearing}°</td>
                  <td className="py-2 text-gray-400">
                    {new Date(detection.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'threats' && (
        <div className="overflow-x-auto">
          {threatTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No threat types available</p>
              <p className="text-xs mt-2">Check console for errors</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2 text-gray-300">ID</th>
                  <th className="text-left py-2 text-gray-300">Name</th>
                  <th className="text-left py-2 text-gray-300">Category</th>
                  <th className="text-left py-2 text-gray-300">Severity</th>
                  <th className="text-left py-2 text-gray-300">Description</th>
                  <th className="text-left py-2 text-gray-300">Subcategories</th>
                  <th className="text-left py-2 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {threatTypes.map((threat) => (
                  <tr key={threat.id} className="border-b border-slate-700">
                    <td className="py-2 text-gray-200 font-mono">{threat.id}</td>
                    <td className="py-2 text-gray-200">{threat.name}</td>
                    <td className="py-2">
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: threatTypesService.getCategoryColor(threat.category) + '20',
                          color: threatTypesService.getCategoryColor(threat.category)
                        }}
                      >
                        {threatTypesService.formatCategory(threat.category)}
                      </span>
                    </td>
                    <td className="py-2">
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          backgroundColor: threatTypesService.getSeverityColor(threat.severity) + '20',
                          color: threatTypesService.getSeverityColor(threat.severity)
                        }}
                      >
                        {threat.severity}
                      </span>
                    </td>
                    <td className="py-2 text-gray-300 max-w-xs truncate">{threat.description}</td>
                    <td className="py-2 text-gray-400">
                      {threat.subcategories ? threat.subcategories.slice(0, 2).join(', ') + (threat.subcategories.length > 2 ? '...' : '') : 'None'}
                    </td>
                    <td className="py-2">
                      <button className="text-cyan-400 hover:text-cyan-300 mr-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTables;