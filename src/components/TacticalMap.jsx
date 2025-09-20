import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { 
  Radar, 
  AlertTriangle, 
  Shield, 
  Eye, 
  Zap, 
  Target, 
  Navigation,
  Layers,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different threat types
const createCustomIcon = (color, type) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${type}</text>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// AI Monitoring Component
const AIMonitoring = ({ onThreatDetected, isActive }) => {
  const [threats, setThreats] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setIsScanning(true);
      // Simulate AI scanning every 3 seconds
      intervalRef.current = setInterval(() => {
        // Simulate random threat detection
        if (Math.random() < 0.3) { // 30% chance of detecting a threat
          const newThreat = {
            id: Date.now(),
            type: ['AIRCRAFT', 'VEHICLE', 'PERSON', 'UAV'][Math.floor(Math.random() * 4)],
            severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
            lat: 40.7128 + (Math.random() - 0.5) * 0.01,
            lng: -74.0060 + (Math.random() - 0.5) * 0.01,
            confidence: Math.floor(Math.random() * 40) + 60,
            timestamp: new Date(),
            description: `AI detected ${['suspicious movement', 'unauthorized access', 'anomalous pattern', 'potential threat'][Math.floor(Math.random() * 4)]}`
          };
          setThreats(prev => [...prev, newThreat]);
          onThreatDetected(newThreat);
        }
      }, 3000);
    } else {
      setIsScanning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onThreatDetected]);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-slate-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-white font-semibold">AI Monitoring</span>
      </div>
      <div className="text-xs text-gray-300">
        Status: {isScanning ? 'ACTIVE' : 'INACTIVE'}
      </div>
      <div className="text-xs text-gray-400">
        Threats Detected: {threats.length}
      </div>
    </div>
  );
};

// Map Controls Component
const MapControls = ({ onLayerToggle, onAIToggle, onClearThreats, isAIActive }) => {
  const [layers, setLayers] = useState({
    radar: true,
    cameras: true,
    sensors: true,
    threats: true,
    zones: true
  });

  const handleLayerToggle = (layer) => {
    const newLayers = { ...layers, [layer]: !layers[layer] };
    setLayers(newLayers);
    onLayerToggle(newLayers);
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-slate-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-white font-semibold mb-3">Map Controls</h3>
      
      {/* Layer Controls */}
      <div className="space-y-2 mb-4">
        <h4 className="text-gray-300 text-sm font-medium">Layers</h4>
        {Object.entries(layers).map(([layer, active]) => (
          <label key={layer} className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={active}
              onChange={() => handleLayerToggle(layer)}
              className="w-3 h-3"
            />
            {layer.charAt(0).toUpperCase() + layer.slice(1)}
          </label>
        ))}
      </div>

      {/* AI Controls */}
      <div className="space-y-2 mb-4">
        <h4 className="text-gray-300 text-sm font-medium">AI Monitoring</h4>
        <button
          onClick={onAIToggle}
          className={`w-full px-3 py-1 rounded text-xs font-medium ${
            isAIActive 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isAIActive ? <><Pause className="w-3 h-3 inline mr-1" />Pause AI</> : <><Play className="w-3 h-3 inline mr-1" />Start AI</>}
        </button>
        <button
          onClick={onClearThreats}
          className="w-full px-3 py-1 rounded text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RotateCcw className="w-3 h-3 inline mr-1" />
          Clear Threats
        </button>
      </div>

      {/* Map Settings */}
      <div className="space-y-2">
        <h4 className="text-gray-300 text-sm font-medium">Settings</h4>
        <button className="w-full px-3 py-1 rounded text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white">
          <Settings className="w-3 h-3 inline mr-1" />
          Map Settings
        </button>
      </div>
    </div>
  );
};

// Threat Alert Component
const ThreatAlert = ({ threat, onDismiss }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className={`${getSeverityColor(threat.severity)} text-white p-3 rounded-lg mb-2 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">{threat.type} THREAT</span>
        </div>
        <button
          onClick={() => onDismiss(threat.id)}
          className="text-white hover:text-gray-300"
        >
          ×
        </button>
      </div>
      <div className="text-sm mt-1">
        <div>Confidence: {threat.confidence}%</div>
        <div>Location: {threat.lat.toFixed(4)}, {threat.lng.toFixed(4)}</div>
        <div>Time: {threat.timestamp.toLocaleTimeString()}</div>
        <div className="mt-1">{threat.description}</div>
      </div>
    </div>
  );
};

// Main Tactical Map Component
const TacticalMap = () => {
  const [threats, setThreats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isAIActive, setIsAIActive] = useState(false);
  const [layers, setLayers] = useState({
    radar: true,
    cameras: true,
    sensors: true,
    threats: true,
    zones: true
  });
  const [selectedThreat, setSelectedThreat] = useState(null);

  // Sample data for different map elements
  const radarStations = [
    { id: 1, lat: 40.7128, lng: -74.0060, name: 'RADAR-01', status: 'ONLINE', range: 5000 },
    { id: 2, lat: 40.7200, lng: -74.0100, name: 'RADAR-02', status: 'ONLINE', range: 5000 },
    { id: 3, lat: 40.7050, lng: -74.0150, name: 'RADAR-03', status: 'MAINTENANCE', range: 5000 }
  ];

  const cameraStations = [
    { id: 1, lat: 40.7150, lng: -74.0080, name: 'CAM-ALPHA', status: 'ONLINE' },
    { id: 2, lat: 40.7080, lng: -74.0120, name: 'CAM-BETA', status: 'ONLINE' },
    { id: 3, lat: 40.7200, lng: -74.0050, name: 'CAM-GAMMA', status: 'OFFLINE' }
  ];

  const sensorStations = [
    { id: 1, lat: 40.7100, lng: -74.0090, name: 'SENSOR-01', type: 'MOTION', status: 'ACTIVE' },
    { id: 2, lat: 40.7180, lng: -74.0070, name: 'SENSOR-02', type: 'SOUND', status: 'ACTIVE' },
    { id: 3, lat: 40.7050, lng: -74.0110, name: 'SENSOR-03', type: 'VIBRATION', status: 'INACTIVE' }
  ];

  const securityZones = [
    {
      id: 1,
      name: 'High Security Zone',
      coordinates: [
        [40.7100, -74.0150],
        [40.7200, -74.0150],
        [40.7200, -74.0050],
        [40.7100, -74.0050]
      ],
      type: 'RESTRICTED'
    },
    {
      id: 2,
      name: 'Monitoring Zone',
      coordinates: [
        [40.7050, -74.0200],
        [40.7250, -74.0200],
        [40.7250, -74.0000],
        [40.7050, -74.0000]
      ],
      type: 'MONITORED'
    }
  ];

  const handleThreatDetected = (threat) => {
    setThreats(prev => [...prev, threat]);
    setAlerts(prev => [...prev, threat]);
  };

  const handleAIToggle = () => {
    setIsAIActive(!isAIActive);
  };

  const handleLayerToggle = (newLayers) => {
    setLayers(newLayers);
  };

  const handleClearThreats = () => {
    setThreats([]);
    setAlerts([]);
  };

  const handleDismissAlert = (threatId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== threatId));
  };

  const getThreatIcon = (type, severity) => {
    const colors = {
      'CRITICAL': '#FF0000',
      'HIGH': '#FF8C00',
      'MEDIUM': '#FFD700',
      'LOW': '#00FF00'
    };
    return createCustomIcon(colors[severity] || '#808080', type[0]);
  };

  const getZoneColor = (type) => {
    return type === 'RESTRICTED' ? '#FF0000' : '#00FF00';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6" />
          Tactical Operations Map
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isAIActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">
            AI Status: {isAIActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-3 relative">
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={13}
            className="h-full w-full rounded-lg"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Radar Stations */}
            {layers.radar && radarStations.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={createCustomIcon(station.status === 'ONLINE' ? '#00FF00' : '#FF0000', 'R')}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{station.name}</div>
                    <div>Status: {station.status}</div>
                    <div>Range: {station.range}m</div>
                  </div>
                </Popup>
                <Circle
                  center={[station.lat, station.lng]}
                  radius={station.range}
                  pathOptions={{
                    color: station.status === 'ONLINE' ? '#00FF00' : '#FF0000',
                    fillColor: station.status === 'ONLINE' ? '#00FF00' : '#FF0000',
                    fillOpacity: 0.1
                  }}
                />
              </Marker>
            ))}

            {/* Camera Stations */}
            {layers.cameras && cameraStations.map(camera => (
              <Marker
                key={camera.id}
                position={[camera.lat, camera.lng]}
                icon={createCustomIcon(camera.status === 'ONLINE' ? '#0066FF' : '#FF0000', 'C')}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{camera.name}</div>
                    <div>Status: {camera.status}</div>
                    <div>Type: Camera</div>
          </div>
                </Popup>
              </Marker>
            ))}

            {/* Sensor Stations */}
            {layers.sensors && sensorStations.map(sensor => (
              <Marker
                key={sensor.id}
                position={[sensor.lat, sensor.lng]}
                icon={createCustomIcon(sensor.status === 'ACTIVE' ? '#FF6600' : '#808080', 'S')}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{sensor.name}</div>
                    <div>Type: {sensor.type}</div>
                    <div>Status: {sensor.status}</div>
      </div>
                </Popup>
              </Marker>
            ))}

            {/* Security Zones */}
            {layers.zones && securityZones.map(zone => (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: getZoneColor(zone.type),
                  fillColor: getZoneColor(zone.type),
                  fillOpacity: 0.2
                }}
              />
            ))}

            {/* Threats */}
            {layers.threats && threats.map(threat => (
              <Marker
                key={threat.id}
                position={[threat.lat, threat.lng]}
                icon={getThreatIcon(threat.type, threat.severity)}
                eventHandlers={{
                  click: () => setSelectedThreat(threat)
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{threat.type} THREAT</div>
                    <div>Severity: {threat.severity}</div>
                    <div>Confidence: {threat.confidence}%</div>
                    <div>Time: {threat.timestamp.toLocaleTimeString()}</div>
                    <div className="mt-2">{threat.description}</div>
          </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Controls */}
          <MapControls
            onLayerToggle={handleLayerToggle}
            onAIToggle={handleAIToggle}
            onClearThreats={handleClearThreats}
            isAIActive={isAIActive}
          />

          {/* AI Monitoring Status */}
          <AIMonitoring
            onThreatDetected={handleThreatDetected}
            isActive={isAIActive}
          />
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700 rounded-lg p-4 h-full">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Live Alerts
            </h3>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Shield className="w-12 h-12 mx-auto mb-2" />
                  <p>No active alerts</p>
                  <p className="text-xs">AI monitoring will detect threats</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <ThreatAlert
                    key={alert.id}
                    threat={alert}
                    onDismiss={handleDismissAlert}
                  />
                ))
              )}
            </div>

            {/* Statistics */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <div className="text-xs text-gray-400 space-y-1">
                <div>Total Threats: {threats.length}</div>
                <div>Active Alerts: {alerts.length}</div>
                <div>AI Status: {isAIActive ? 'SCANNING' : 'STANDBY'}</div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;