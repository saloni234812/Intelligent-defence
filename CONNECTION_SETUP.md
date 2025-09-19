# Backend-Frontend Connection Setup

This document explains how the backend and frontend are connected in the Intelligent Defense System.

## Architecture Overview

- **Backend**: Node.js/Express server running on port 5000
- **Frontend**: React/Vite development server running on port 5173
- **Database**: Mock database (can be replaced with Supabase)
- **WebSocket**: Real-time communication for alerts and radar data

## Connection Configuration

### Backend Configuration

The backend server (`server/index.js`) is configured with:

1. **CORS Settings**: Allows requests from frontend origins
   ```javascript
   app.use(cors({ 
     origin: ['http://localhost:5173', 'http://localhost:3000'], 
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
   }));
   ```

2. **API Routes**: All routes are prefixed with `/api`
   - `/api/alerts` - Alert management
   - `/api/radar` - Radar detection data
   - `/api/playbooks` - Response playbooks
   - `/api/system` - System status and metrics
   - `/api/ai` - AI command processing
   - `/api/voice` - Voice synthesis
   - `/api/maps` - Tactical map data

3. **WebSocket Support**: Real-time communication on `/ws/alerts`

### Frontend Configuration

The frontend (`client/vite.config.js`) is configured with:

1. **Proxy Settings**: Routes API calls to backend
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         secure: false,
       },
       '/ws': {
         target: 'ws://localhost:5000',
         ws: true,
         changeOrigin: true,
       }
     }
   }
   ```

2. **API Service**: Centralized API communication (`client/src/services/api.js`)
   - Handles all HTTP requests to backend
   - Manages WebSocket connections
   - Provides error handling and fallbacks

## Starting the Application

### Option 1: Use the provided batch script (Windows)
```bash
start-both.bat
```

### Option 2: Start manually

1. **Start Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Option 3: Use individual scripts
- `start-backend.bat` - Start only backend
- `start-frontend.bat` - Start only frontend

## Testing the Connection

Run the connection test script:
```bash
node test-connection.js
```

This will test:
- Backend server availability
- API endpoint responses
- Connection status

## Features

### Real-time Updates
- **WebSocket Alerts**: Real-time alert notifications
- **Radar Data**: Live radar detection updates
- **System Status**: Automatic backend connection monitoring

### Error Handling
- **Connection Fallbacks**: Graceful degradation when backend is offline
- **Retry Logic**: Automatic reconnection attempts
- **Status Indicators**: Visual feedback for connection status

### API Integration
All frontend components use the centralized API service:
- Dashboard: System metrics and alerts
- ThreatAlerts: Alert management
- RadarMonitor: Radar detection data
- TacticalMap: Map data and markers
- AICommand: AI command processing
- ResponsePlaybooks: Playbook management

## Troubleshooting

### Backend Not Starting
1. Check if port 5000 is available
2. Ensure all dependencies are installed (`npm install` in server directory)
3. Check for any error messages in the console

### Frontend Can't Connect to Backend
1. Verify backend is running on port 5000
2. Check CORS configuration in backend
3. Ensure proxy settings in vite.config.js are correct
4. Check browser console for network errors

### WebSocket Issues
1. Verify WebSocket server is initialized
2. Check browser WebSocket support
3. Ensure firewall allows WebSocket connections

## Environment Variables

Create these files for custom configuration:

**server/.env**:
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**client/.env**:
```
VITE_API_BASE=http://localhost:5000
VITE_WS_BASE=ws://localhost:5000
```

## Development Notes

- The system uses a mock database for development
- All API endpoints return mock data
- WebSocket connections are fully functional
- CORS is configured for development origins
- Hot reloading works for both frontend and backend
