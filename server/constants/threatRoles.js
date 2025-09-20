// Roles, responsibilities, and recommended actions per threat type (demo dataset)

const THREAT_ROLES = {
  PHYSICAL_INTRUSION: {
    role: 'Security Operations',
    purpose: 'Prevent, detect, and contain physical perimeter breaches and unauthorized access.',
    recommended_actions: [
      'Dispatch nearest patrol to location',
      'Lockdown affected sector and secure entry points',
      'Activate perimeter cameras for continuous recording',
      'Verify identity and escalate to law enforcement if needed'
    ],
    escalation: {
      to: 'Incident Commander',
      conditions: ['Multiple entry points', 'Armed intruder', 'Hostage situation']
    }
  },
  UAV_THREAT: {
    role: 'Airspace Control',
    purpose: 'Detect and mitigate unauthorized unmanned aerial vehicles near protected areas.',
    recommended_actions: [
      'Track target with radar and optical sensor fusion',
      'Issue RF warning/NOTAM (if applicable)',
      'Engage drone mitigation system (RF takeover / jammer) as authorized',
      'Notify authorities and record evidence'
    ],
    escalation: {
      to: 'Airspace Authority',
      conditions: ['Low-altitude path over restricted zone', 'Payload detected', 'Swarm behavior']
    }
  },
  CYBER_INTRUSION: {
    role: 'Cyber Defense',
    purpose: 'Contain and eradicate unauthorized access attempts in information systems.',
    recommended_actions: [
      'Isolate affected hosts and rotate credentials',
      'Enable enhanced logging and block IOCs',
      'Run malware scan and memory forensics',
      'Activate incident response runbook'
    ],
    escalation: {
      to: 'CISO / Incident Response Team',
      conditions: ['Domain admin compromise', 'Data exfiltration detected', 'Persistence established']
    }
  },
  FIRE_THREAT: {
    role: 'Safety & Emergency Response',
    purpose: 'Protect life and assets against fire or explosion hazards.',
    recommended_actions: [
      'Trigger local alarms and evacuate impacted zones',
      'Engage fire suppression systems if available',
      'Cut power/gas where safe and applicable',
      'Call emergency services and provide live telemetry'
    ],
    escalation: {
      to: 'Emergency Services Command',
      conditions: ['Rapid spread', 'Toxic smoke', 'Injuries reported']
    }
  },
  SYSTEM_FAILURE: {
    role: 'Systems Engineering',
    purpose: 'Restore degraded or failed systems impacting operations.',
    recommended_actions: [
      'Failover to redundant nodes and validate service health',
      'Run diagnostics on power/network subsystems',
      'Create ticket and attach logs/telemetry',
      'Coordinate maintenance window for permanent fix'
    ],
    escalation: {
      to: 'Site Reliability Lead',
      conditions: ['Multiple services impacted', 'No redundancy available', 'SLA breach risk']
    }
  }
};

function getAllThreatRoles() {
  return Object.entries(THREAT_ROLES).map(([id, payload]) => ({ id, ...payload }));
}

function getThreatRoleById(id) {
  return THREAT_ROLES[id] || null;
}

module.exports = { THREAT_ROLES, getAllThreatRoles, getThreatRoleById };
