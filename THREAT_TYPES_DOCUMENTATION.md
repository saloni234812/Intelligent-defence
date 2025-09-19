# Threat Types System Documentation

## Overview

The AEGIS Defense System now includes a comprehensive threat types system that categorizes and visualizes different types of security threats. This system provides detailed classification, filtering, and visualization capabilities for threat alerts.

## Threat Categories

### 1. Physical Security Threats
- **PHYSICAL_INTRUSION**: Unauthorized physical access to restricted areas
- **VEHICLE_THREAT**: Suspicious or unauthorized vehicle activity  
- **PEDESTRIAN_THREAT**: Suspicious pedestrian activity or unauthorized personnel

### 2. Aerial Threats
- **UAV_THREAT**: Unauthorized or suspicious unmanned aerial vehicles
- **AIRCRAFT_THREAT**: Unauthorized or suspicious aircraft activity

### 3. Cyber Security Threats
- **CYBER_INTRUSION**: Unauthorized access to computer systems or networks
- **DDOS_ATTACK**: Distributed Denial of Service attacks
- **DATA_EXFILTRATION**: Unauthorized data extraction or theft

### 4. Environmental Threats
- **FIRE_THREAT**: Fire or explosion hazards
- **HAZMAT_THREAT**: Hazardous material incidents
- **NATURAL_DISASTER**: Natural disasters or extreme weather events

### 5. Communication Threats
- **RF_INTERFERENCE**: Radio frequency interference or jamming
- **COMMUNICATION_BREACH**: Unauthorized access to communication systems

### 6. Equipment/System Threats
- **SYSTEM_FAILURE**: Critical system or equipment failures
- **MAINTENANCE_REQUIRED**: Equipment requiring maintenance or repair

### 7. Intelligence Threats
- **RECONNAISSANCE**: Suspected intelligence gathering or surveillance
- **ESPIONAGE**: Suspected espionage or intelligence operations

## Alert Data Structure

Each alert now includes comprehensive threat type information:

```json
{
  "id": "a-1001",
  "alert_type": "CRITICAL",
  "threat_type": "PHYSICAL_INTRUSION",
  "threat_category": "PHYSICAL",
  "threat_subcategory": "Perimeter Breach",
  "title": "Intrusion detected at North Gate",
  "description": "Unauthorized perimeter breach detected by motion sensors.",
  "location": "Grid N-12",
  "confidence": 92,
  "status": "OPEN",
  "source": "SENSOR",
  "priority": 1,
  "tags": ["perimeter", "intrusion", "unauthorized"],
  "metadata": {
    "sensor_id": "MOTION_001",
    "detection_method": "motion_sensor",
    "weather": "clear",
    "time_of_day": "night"
  },
  "created_at": "2025-09-18T09:15:00Z"
}
```

## API Endpoints

### Threat Types
- `GET /api/threats` - Get all threat types
- `GET /api/threats/categories/list` - Get threat categories
- `GET /api/threats/category/:category` - Get threat types by category
- `GET /api/threats/severity/:severity` - Get threat types by severity
- `GET /api/threats/:id` - Get specific threat type by ID

## Frontend Components

### 1. ThreatAlerts Component
Enhanced with:
- Threat type icons and colors
- Category-based filtering
- Severity-based filtering
- Threat metadata display
- Source and priority indicators

### 2. ThreatTypesOverview Component
New component showing:
- Threat statistics by category
- Alert distribution by source
- Status distribution
- Visual threat type breakdown

### 3. ThreatTypesService
Centralized service providing:
- Threat type data management
- Icon and color mappings
- Filtering and grouping utilities
- Statistics calculation

## Visual Indicators

### Icons
Each threat type has a specific icon:
- Physical: Shield, Truck, User
- Aerial: Zap, Plane
- Cyber: Shield, Database, Wifi
- Environmental: Flame, CloudRain, AlertTriangle
- Communication: Radio, Phone
- Equipment: AlertCircle, Wrench
- Intelligence: Eye, UserCheck

### Colors
- **Categories**: Each category has a distinct color
- **Severity**: Critical (red), High (orange), Medium (yellow), Low (gray)
- **Sources**: System (gray), Sensor (blue), Manual (green), AI (purple), Radar (orange)

## Filtering and Search

### Category Filtering
Filter alerts by threat category (Physical, Aerial, Cyber, etc.)

### Severity Filtering
Filter alerts by severity level (Critical, High, Medium, Low)

### Source Filtering
Filter alerts by detection source (System, Sensor, Manual, AI, Radar)

### Priority Filtering
Filter alerts by priority level (1-10, where 1 is highest priority)

## Statistics and Analytics

The system provides comprehensive statistics:
- Total alerts by category
- Severity distribution
- Source distribution
- Status distribution
- Priority analysis
- Trend analysis

## Real-time Updates

All threat type information is updated in real-time via WebSocket connections, ensuring operators always have the latest threat intelligence.

## Usage Examples

### Filtering Alerts by Category
```javascript
const physicalAlerts = threatTypesService.filterAlertsByCategory(alerts, 'PHYSICAL');
```

### Getting Threat Statistics
```javascript
const stats = threatTypesService.getThreatStatistics(alerts);
console.log(stats.byCategory); // { PHYSICAL: 5, CYBER: 3, ... }
```

### Formatting Threat Types
```javascript
const formatted = threatTypesService.formatThreatType('PHYSICAL_INTRUSION');
// Returns: "Physical Intrusion"
```

## Configuration

Threat types are defined in `server/constants/threatTypes.js` and can be easily extended with new categories, types, and subcategories.

## Future Enhancements

- Machine learning-based threat classification
- Automated threat response based on type
- Integration with external threat intelligence feeds
- Advanced analytics and reporting
- Custom threat type definitions
