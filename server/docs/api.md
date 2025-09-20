# Aegis Defense System API Documentation

## Overview

The Aegis Defense System API provides comprehensive threat monitoring, alert management, and system control capabilities. This RESTful API is built with Node.js, Express, and MongoDB.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Login endpoint**: 5 requests per minute
- **WebSocket connections**: 1000 concurrent connections

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Endpoints

### Authentication

#### POST /users/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "User"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST /users/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  },
  "token": "jwt_token_here"
}
```

#### GET /users/me
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /users/logout
Logout current user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Alerts

#### GET /alerts
Get all alerts (requires Operator role or higher).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` - Filter by status (ACTIVE, INVESTIGATING, ACKNOWLEDGED, RESOLVED)
- `alert_type` - Filter by alert type (CRITICAL, HIGH, MEDIUM, LOW)
- `threat_type` - Filter by threat type
- `limit` - Number of results (default: 50)
- `offset` - Number of results to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "alert_id",
      "alert_type": "CRITICAL",
      "title": "Unauthorized Aircraft Detected",
      "description": "Low-flying aircraft detected in restricted airspace",
      "location": "Sector Alpha-7",
      "confidence": 95,
      "status": "ACTIVE",
      "threat_type": "AIRCRAFT_THREAT",
      "threat_category": "AERIAL",
      "source": "RADAR",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### POST /alerts
Create a new alert (requires Operator role or higher).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "alert_type": "CRITICAL",
  "title": "New Threat Detected",
  "description": "Description of the threat",
  "location": "Sector Bravo-3",
  "confidence": 90,
  "threat_type": "AIRCRAFT_THREAT",
  "threat_category": "AERIAL",
  "source": "RADAR"
}
```

**Response:**
```json
{
  "data": {
    "id": "alert_id",
    "alert_type": "CRITICAL",
    "title": "New Threat Detected",
    "description": "Description of the threat",
    "location": "Sector Bravo-3",
    "confidence": 90,
    "status": "ACTIVE",
    "threat_type": "AIRCRAFT_THREAT",
    "threat_category": "AERIAL",
    "source": "RADAR",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /alerts/:id/ack
Acknowledge an alert (requires Operator role or higher).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "id": "alert_id",
    "status": "ACKNOWLEDGED",
    "acknowledged_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Radar Data

#### GET /radar
Get radar detection data.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `type` - Filter by detection type
- `location` - Filter by location
- `limit` - Number of results (default: 50)
- `offset` - Number of results to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "radar_id",
      "type": "AIRCRAFT",
      "location": "Sector Alpha-7",
      "distance": 15.5,
      "speed": 250,
      "bearing": 45,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Threat Types

#### GET /threats
Get all threat types.

**Response:**
```json
{
  "data": [
    {
      "id": "threat_001",
      "name": "Aircraft Threat",
      "category": "AERIAL",
      "severity": "HIGH",
      "description": "Unauthorized aircraft in restricted airspace",
      "subcategories": ["Commercial", "Military", "Private"]
    }
  ]
}
```

#### GET /threats/categories
Get threat categories.

**Response:**
```json
{
  "data": [
    {
      "id": "aerial",
      "name": "Aerial Threats",
      "description": "Threats from aircraft and aerial vehicles",
      "color": "#FF6B6B"
    }
  ]
}
```

### System Status

#### GET /system/status
Get system status information.

**Response:**
```json
{
  "status": "ONLINE",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "ONLINE",
    "redis": "ONLINE",
    "websocket": "ONLINE"
  },
  "metrics": {
    "activeAlerts": 5,
    "totalUsers": 25,
    "radarDetections": 150
  }
}
```

#### GET /system/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoint with JWT token:

```
ws://localhost:5000/ws/alerts?token=<jwt-token>
```

### Message Types

#### Client to Server

**Join Room:**
```json
{
  "type": "join_room",
  "room": "alerts"
}
```

**Leave Room:**
```json
{
  "type": "leave_room",
  "room": "alerts"
}
```

**Subscribe to Alerts:**
```json
{
  "type": "subscribe_alerts",
  "filters": {
    "alert_type": "CRITICAL",
    "threat_type": "AIRCRAFT_THREAT"
  }
}
```

**Ping:**
```json
{
  "type": "ping"
}
```

#### Server to Client

**Welcome Message:**
```json
{
  "type": "welcome",
  "message": "Connected to Aegis Defense System",
  "clientId": "client_123",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "Operator"
  }
}
```

**Alert Notification:**
```json
{
  "type": "alert",
  "data": {
    "id": "alert_id",
    "alert_type": "CRITICAL",
    "title": "New Threat Detected",
    "description": "Description of the threat",
    "location": "Sector Alpha-7",
    "confidence": 95,
    "status": "ACTIVE",
    "threat_type": "AIRCRAFT_THREAT",
    "threat_category": "AERIAL",
    "source": "RADAR",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**System Status Update:**
```json
{
  "type": "system_status",
  "data": {
    "status": "WARNING",
    "message": "High memory usage detected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Pong:**
```json
{
  "type": "pong",
  "timestamp": 1704067200000
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_INVALID` | Invalid authentication token |
| `AUTH_EXPIRED` | Authentication token expired |
| `AUTH_INSUFFICIENT_ROLE` | Insufficient role permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## Examples

### Complete Alert Workflow

1. **Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "operator@aegis.com", "password": "password"}'
```

2. **Create Alert:**
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "alert_type": "CRITICAL",
    "title": "Unauthorized Aircraft",
    "description": "Aircraft detected in restricted airspace",
    "location": "Sector Alpha-7",
    "confidence": 95,
    "threat_type": "AIRCRAFT_THREAT",
    "threat_category": "AERIAL",
    "source": "RADAR"
  }'
```

3. **Acknowledge Alert:**
```bash
curl -X POST http://localhost:5000/api/alerts/alert_id/ack \
  -H "Authorization: Bearer <token>"
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws/alerts?token=<jwt-token>');

ws.onopen = function() {
  console.log('Connected to WebSocket');
  
  // Subscribe to alerts
  ws.send(JSON.stringify({
    type: 'subscribe_alerts',
    filters: { alert_type: 'CRITICAL' }
  }));
};

ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install aegis-defense-sdk
```

### Python
```bash
pip install aegis-defense-sdk
```

### Go
```bash
go get github.com/aegis-defense/go-sdk
```

## Support

For API support and questions:
- Email: api-support@aegis-system.com
- Documentation: https://docs.aegis-system.com
- GitHub Issues: https://github.com/aegis-defense/api/issues


