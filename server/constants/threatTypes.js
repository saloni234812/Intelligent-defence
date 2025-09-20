// Comprehensive Threat Types for AEGIS Defense System

const THREAT_TYPES = {
  // Physical Security Threats
  PHYSICAL: {
    INTRUSION: {
      id: 'PHYSICAL_INTRUSION',
      name: 'Physical Intrusion',
      description: 'Unauthorized physical access to restricted areas',
      severity: 'HIGH',
      icon: 'Shield',
      color: '#ef4444',
      subcategories: [
        'Perimeter Breach',
        'Building Intrusion', 
        'Vehicle Intrusion',
        'Personnel Intrusion',
        'Forced Entry'
      ]
    },
    VEHICLE: {
      id: 'VEHICLE_THREAT',
      name: 'Vehicle Threat',
      description: 'Suspicious or unauthorized vehicle activity',
      severity: 'MEDIUM',
      icon: 'Truck',
      color: '#f59e0b',
      subcategories: [
        'Unauthorized Vehicle',
        'Suspicious Vehicle',
        'Vehicle Following',
        'High-Speed Approach',
        'Vehicle Bomb Threat'
      ]
    },
    PEDESTRIAN: {
      id: 'PEDESTRIAN_THREAT',
      name: 'Pedestrian Threat',
      description: 'Suspicious pedestrian activity or unauthorized personnel',
      severity: 'MEDIUM',
      icon: 'User',
      color: '#f59e0b',
      subcategories: [
        'Unauthorized Personnel',
        'Suspicious Behavior',
        'Trespassing',
        'Loitering',
        'Hostile Individual'
      ]
    }
  },

  // Aerial Threats
  AERIAL: {
    UAV: {
      id: 'UAV_THREAT',
      name: 'UAV/Drone Threat',
      description: 'Unauthorized or suspicious unmanned aerial vehicle',
      severity: 'HIGH',
      icon: 'Zap',
      color: '#dc2626',
      subcategories: [
        'Commercial Drone',
        'Military UAV',
        'Suspicious Drone',
        'Swarm Attack',
        'Reconnaissance Drone'
      ]
    },
    AIRCRAFT: {
      id: 'AIRCRAFT_THREAT',
      name: 'Aircraft Threat',
      description: 'Unauthorized or suspicious aircraft activity',
      severity: 'CRITICAL',
      icon: 'Plane',
      color: '#dc2626',
      subcategories: [
        'Unauthorized Aircraft',
        'Low-Flying Aircraft',
        'Aircraft Bomb Threat',
        'Hijacked Aircraft',
        'Military Aircraft'
      ]
    }
  },

  // Cyber Security Threats
  CYBER: {
    INTRUSION: {
      id: 'CYBER_INTRUSION',
      name: 'Cyber Intrusion',
      description: 'Unauthorized access to computer systems or networks',
      severity: 'HIGH',
      icon: 'Shield',
      color: '#7c3aed',
      subcategories: [
        'Network Intrusion',
        'System Compromise',
        'Data Breach',
        'Malware Detection',
        'Phishing Attack'
      ]
    },
    DDOS: {
      id: 'DDOS_ATTACK',
      name: 'DDoS Attack',
      description: 'Distributed Denial of Service attack',
      severity: 'MEDIUM',
      icon: 'Wifi',
      color: '#f59e0b',
      subcategories: [
        'Network Flooding',
        'Service Disruption',
        'Bandwidth Exhaustion',
        'Application Layer Attack',
        'Botnet Attack'
      ]
    },
    DATA_EXFILTRATION: {
      id: 'DATA_EXFILTRATION',
      name: 'Data Exfiltration',
      description: 'Unauthorized data extraction or theft',
      severity: 'CRITICAL',
      icon: 'Database',
      color: '#dc2626',
      subcategories: [
        'Sensitive Data Theft',
        'Intellectual Property Theft',
        'Personal Data Breach',
        'Classified Information Leak',
        'Financial Data Theft'
      ]
    }
  },

  // Environmental Threats
  ENVIRONMENTAL: {
    FIRE: {
      id: 'FIRE_THREAT',
      name: 'Fire Threat',
      description: 'Fire or explosion hazard',
      severity: 'CRITICAL',
      icon: 'Flame',
      color: '#dc2626',
      subcategories: [
        'Structure Fire',
        'Wildfire',
        'Explosion',
        'Gas Leak',
        'Electrical Fire'
      ]
    },
    HAZMAT: {
      id: 'HAZMAT_THREAT',
      name: 'Hazmat Threat',
      description: 'Hazardous material incident',
      severity: 'HIGH',
      icon: 'AlertTriangle',
      color: '#dc2626',
      subcategories: [
        'Chemical Spill',
        'Toxic Gas Release',
        'Radiation Leak',
        'Biological Hazard',
        'Explosive Material'
      ]
    },
    NATURAL_DISASTER: {
      id: 'NATURAL_DISASTER',
      name: 'Natural Disaster',
      description: 'Natural disaster or extreme weather event',
      severity: 'HIGH',
      icon: 'CloudRain',
      color: '#f59e0b',
      subcategories: [
        'Earthquake',
        'Flood',
        'Hurricane',
        'Tornado',
        'Severe Storm'
      ]
    }
  },

  // Communication Threats
  COMMUNICATION: {
    RF_INTERFERENCE: {
      id: 'RF_INTERFERENCE',
      name: 'RF Interference',
      description: 'Radio frequency interference or jamming',
      severity: 'MEDIUM',
      icon: 'Radio',
      color: '#f59e0b',
      subcategories: [
        'Signal Jamming',
        'RF Interference',
        'Communication Disruption',
        'GPS Spoofing',
        'Radio Frequency Attack'
      ]
    },
    COMMUNICATION_BREACH: {
      id: 'COMMUNICATION_BREACH',
      name: 'Communication Breach',
      description: 'Unauthorized access to communication systems',
      severity: 'HIGH',
      icon: 'Phone',
      color: '#7c3aed',
      subcategories: [
        'Eavesdropping',
        'Call Interception',
        'Message Interception',
        'Encryption Bypass',
        'Communication Spoofing'
      ]
    }
  },

  // Equipment/System Threats
  EQUIPMENT: {
    SYSTEM_FAILURE: {
      id: 'SYSTEM_FAILURE',
      name: 'System Failure',
      description: 'Critical system or equipment failure',
      severity: 'HIGH',
      icon: 'AlertCircle',
      color: '#f59e0b',
      subcategories: [
        'Power Failure',
        'Network Outage',
        'Server Failure',
        'Sensor Malfunction',
        'Communication System Down'
      ]
    },
    MAINTENANCE: {
      id: 'MAINTENANCE_REQUIRED',
      name: 'Maintenance Required',
      description: 'Equipment requires maintenance or repair',
      severity: 'LOW',
      icon: 'Wrench',
      color: '#6b7280',
      subcategories: [
        'Scheduled Maintenance',
        'Equipment Degradation',
        'Calibration Required',
        'Replacement Needed',
        'Software Update Required'
      ]
    }
  },

  // Intelligence Threats
  INTELLIGENCE: {
    RECONNAISSANCE: {
      id: 'RECONNAISSANCE',
      name: 'Reconnaissance',
      description: 'Suspected intelligence gathering or surveillance',
      severity: 'MEDIUM',
      icon: 'Eye',
      color: '#f59e0b',
      subcategories: [
        'Surveillance Activity',
        'Intelligence Gathering',
        'Reconnaissance Mission',
        'Spy Activity',
        'Information Collection'
      ]
    },
    ESPIONAGE: {
      id: 'ESPIONAGE',
      name: 'Espionage',
      description: 'Suspected espionage or intelligence operation',
      severity: 'CRITICAL',
      icon: 'UserCheck',
      color: '#dc2626',
      subcategories: [
        'Insider Threat',
        'Foreign Intelligence',
        'Industrial Espionage',
        'Classified Information Access',
        'Mole Activity'
      ]
    }
  }
};

// Helper functions
const getThreatTypeById = (id) => {
  for (const category in THREAT_TYPES) {
    for (const type in THREAT_TYPES[category]) {
      if (THREAT_TYPES[category][type].id === id) {
        return THREAT_TYPES[category][type];
      }
    }
  }
  return null;
};

const getAllThreatTypes = () => {
  const allTypes = [];
  for (const category in THREAT_TYPES) {
    for (const type in THREAT_TYPES[category]) {
      allTypes.push({
        ...THREAT_TYPES[category][type],
        category: category
      });
    }
  }
  return allTypes;
};

const getThreatTypesByCategory = (category) => {
  return THREAT_TYPES[category] ? Object.values(THREAT_TYPES[category]) : [];
};

const getThreatTypesBySeverity = (severity) => {
  return getAllThreatTypes().filter(type => type.severity === severity);
};

module.exports = {
  THREAT_TYPES,
  getThreatTypeById,
  getAllThreatTypes,
  getThreatTypesByCategory,
  getThreatTypesBySeverity
};
