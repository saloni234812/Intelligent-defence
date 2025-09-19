# API Connections Documentation

## Overview
All React components in the Intelligent Defense System have been connected to their respective backend APIs through a centralized API service.

## Centralized API Service
**File:** `client/src/services/api.js`

This service provides a unified interface for all API calls with:
- Consistent error handling
- Automatic request/response formatting
- WebSocket connection management
- Environment-based configuration

## Component API Connections

### 1. Dashboard Component
**File:** `client/src/components/Dashboard.jsx`
- **APIs Used:**
  - `GET /api/system/status` - System health and metrics
  - `GET /api/system/metrics` - Historical trends
- **Features:**
  - Real-time system status updates
  - Alert statistics display
  - System health monitoring

### 2. RadarMonitor Component
**File:** `client/src/components/RadarMonitor.jsx`
- **APIs Used:**
  - `GET /api/radar` - Initial radar detections
  - `WebSocket /api/radar/stream` - Real-time radar data
- **Features:**
  - Live radar detection streaming
  - AI insights display
  - Connection status monitoring

### 3. ThreatAlerts Component
**File:** `client/src/components/ThreatAlerts.jsx`
- **APIs Used:**
  - `GET /api/alerts` - Alert list
  - `POST /api/alerts/:id/ack` - Acknowledge alerts
  - `POST /api/voice/speak` - Voice announcements
  - `WebSocket /ws/alerts` - Real-time alert updates
- **Features:**
  - Real-time alert notifications
  - Voice announcement system
  - Alert acknowledgment
  - WebSocket-based live updates

### 4. TacticalMap Component
**File:** `client/src/components/TacticalMap.jsx`
- **APIs Used:**
  - `GET /api/maps/:area` - Map data for specific areas
- **Features:**
  - Dynamic map loading
  - Offline/online mode switching
  - Real-time marker updates

### 5. SensorNetwork Component
**File:** `client/src/components/SensorNetwork.jsx`
- **APIs Used:**
  - `GET /api/sensors` - Sensor status and health
- **Features:**
  - Real-time sensor monitoring
  - Health status indicators
  - Automatic refresh every 5 seconds

### 6. DataTables Component
**File:** `client/src/components/DataTables.jsx`
- **APIs Used:**
  - `GET /api/users` - User management
  - `GET /api/alerts` - Alert data
  - `GET /api/radar` - Radar detections
  - `DELETE /api/users/:id` - User deletion
- **Features:**
  - Tabbed data management
  - CRUD operations
  - Real-time data refresh

### 7. AICommand Component
**File:** `client/src/components/AICommand.jsx`
- **APIs Used:**
  - `POST /api/ai/command` - AI command processing
- **Features:**
  - Natural language command processing
  - Real-time AI responses
  - Command history

### 8. ResponsePlaybooks Component
**File:** `client/src/components/ResponsePlaybooks.jsx`
- **APIs Used:**
  - `GET /api/playbooks` - Playbook list
  - `POST /api/playbooks/:id/execute` - Execute playbook
- **Features:**
  - Playbook management
  - Execution status tracking
  - Priority-based organization

### 9. AuditLog Component
**File:** `client/src/components/AuditLog.jsx`
- **APIs Used:**
  - `GET /api/audit-logs` - Audit log entries
- **Features:**
  - System event logging
  - Security event tracking
  - Fallback to mock data

## Backend API Endpoints

### Core Endpoints
- `GET /api/system/status` - System status and health
- `GET /api/system/metrics` - System metrics and trends
- `GET /api/system/health` - Health check

### Alert Management
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `POST /api/alerts/:id/ack` - Acknowledge alert

### Radar System
- `GET /api/radar` - List radar detections
- `POST /api/radar` - Create radar detection
- `DELETE /api/radar` - Clear radar detections
- `GET /api/radar/stream` - SSE stream for radar data

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Playbook Management
- `GET /api/playbooks` - List playbooks
- `POST /api/playbooks` - Create playbook
- `POST /api/playbooks/:id/execute` - Execute playbook
- `PUT /api/playbooks/:id` - Update playbook
- `DELETE /api/playbooks/:id` - Delete playbook

### Additional Services
- `GET /api/maps/:area` - Map data
- `POST /api/ai/command` - AI command processing
- `POST /api/voice/speak` - Voice synthesis
- `GET /api/sensors` - Sensor status

## WebSocket Connections
- `/ws/alerts` - Real-time alert updates
- `/api/radar/stream` - Real-time radar data (SSE)

## Environment Configuration
Set the following environment variables:
- `VITE_API_BASE` - Backend API base URL (default: http://localhost:5000)
- `VITE_WS_BASE` - WebSocket base URL (default: ws://localhost:5000)

## Error Handling
All components include:
- Graceful error handling
- Fallback to mock data when APIs are unavailable
- User-friendly error messages
- Console logging for debugging

## Real-time Features
- Live radar detection updates
- Real-time alert notifications
- WebSocket-based data streaming
- Automatic reconnection handling
