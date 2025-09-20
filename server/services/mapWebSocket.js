const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { EventEmitter } = require('events');

class MapWebSocketService extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.wss = null;
    this.clients = new Map();
    this.rooms = new Map();
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket server for maps
   */
  initializeWebSocket() {
    this.wss = new WebSocket.Server({
      server: this.server,
      path: '/ws/maps',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🗺️ Map WebSocket server initialized on /ws/maps');
  }

  /**
   * Verify client connection
   */
  verifyClient(info) {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('Map WebSocket connection rejected: No token provided');
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      info.req.user = decoded;
      return true;
    } catch (error) {
      console.log('Map WebSocket connection rejected: Invalid token');
      return false;
    }
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    const user = req.user;
    const clientId = this.generateClientId();
    
    // Store client information
    this.clients.set(clientId, {
      ws,
      user,
      rooms: new Set(),
      lastPing: Date.now(),
      isAlive: true,
      mapView: {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 13,
        layers: {
          radar: true,
          cameras: true,
          sensors: true,
          threats: true,
          zones: true
        }
      }
    });

    console.log(`🗺️ Map client connected: ${user.email} (${clientId})`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'map_welcome',
      message: 'Connected to Aegis Tactical Maps',
      clientId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    // Set up event handlers
    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnection(clientId));
    ws.on('error', (error) => this.handleError(clientId, error));
    ws.on('pong', () => this.handlePong(clientId));

    // Start ping interval
    this.startPingInterval(clientId);

    // Join default map room
    this.joinRoom(clientId, 'tactical_maps');
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.log(`Received message from unknown map client: ${clientId}`);
        return;
      }

      console.log(`Map message from ${client.user.email}:`, message.type);

      switch (message.type) {
        case 'map_view_update':
          this.handleMapViewUpdate(clientId, message.data);
          break;
        case 'layer_toggle':
          this.handleLayerToggle(clientId, message.layer, message.enabled);
          break;
        case 'threat_subscribe':
          this.handleThreatSubscribe(clientId, message.filters);
          break;
        case 'threat_unsubscribe':
          this.handleThreatUnsubscribe(clientId);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        default:
          console.log(`Unknown map message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling map message from ${clientId}:`, error);
    }
  }

  /**
   * Handle map view update
   */
  handleMapViewUpdate(clientId, viewData) {
    const client = this.clients.get(clientId);
    if (client) {
      client.mapView = { ...client.mapView, ...viewData };
      
      // Broadcast view update to other clients in the same room
      this.broadcastToRoom('tactical_maps', {
        type: 'map_view_updated',
        clientId,
        view: viewData
      }, [clientId]);
    }
  }

  /**
   * Handle layer toggle
   */
  handleLayerToggle(clientId, layer, enabled) {
    const client = this.clients.get(clientId);
    if (client) {
      client.mapView.layers[layer] = enabled;
      
      // Broadcast layer update
      this.broadcastToRoom('tactical_maps', {
        type: 'layer_toggled',
        layer,
        enabled,
        clientId
      });
    }
  }

  /**
   * Handle threat subscription
   */
  handleThreatSubscribe(clientId, filters) {
    const client = this.clients.get(clientId);
    if (client) {
      client.threatFilters = filters;
      this.joinRoom(clientId, 'threat_alerts');
      
      this.sendToClient(clientId, {
        type: 'threat_subscribed',
        filters,
        message: 'Subscribed to threat alerts on map'
      });
    }
  }

  /**
   * Handle threat unsubscription
   */
  handleThreatUnsubscribe(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.threatFilters = null;
      this.leaveRoom(clientId, 'threat_alerts');
      
      this.sendToClient(clientId, {
        type: 'threat_unsubscribed',
        message: 'Unsubscribed from threat alerts'
      });
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`🗺️ Map client disconnected: ${client.user.email} (${clientId})`);
      
      // Leave all rooms
      for (const room of client.rooms) {
        this.leaveRoom(clientId, room);
      }
      
      this.clients.delete(clientId);
    }
  }

  /**
   * Handle WebSocket error
   */
  handleError(clientId, error) {
    console.error(`Map WebSocket error for client ${clientId}:`, error);
    this.handleDisconnection(clientId);
  }

  /**
   * Handle pong response
   */
  handlePong(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = true;
      client.lastPing = Date.now();
    }
  }

  /**
   * Handle ping message
   */
  handlePing(clientId) {
    this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
  }

  /**
   * Join a room
   */
  joinRoom(clientId, room) {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.add(room);
      
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      
      this.rooms.get(room).add(clientId);
      console.log(`Map client ${clientId} joined room: ${room}`);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(clientId, room) {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.delete(room);
      
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(clientId);
        
        // Clean up empty rooms
        if (this.rooms.get(room).size === 0) {
          this.rooms.delete(room);
        }
      }
      
      console.log(`Map client ${clientId} left room: ${room}`);
    }
  }

  /**
   * Start ping interval for client
   */
  startPingInterval(clientId) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      if (!client.isAlive) {
        console.log(`Map client ${clientId} not responding to ping, closing connection`);
        client.ws.terminate();
        clearInterval(interval);
        return;
      }

      client.isAlive = false;
      client.ws.ping();
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients in a room
   */
  broadcastToRoom(room, message, excludeClients = []) {
    if (this.rooms.has(room)) {
      for (const clientId of this.rooms.get(room)) {
        if (!excludeClients.includes(clientId)) {
          this.sendToClient(clientId, message);
        }
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(message) {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  /**
   * Send threat update to map clients
   */
  sendThreatUpdate(threat) {
    const message = {
      type: 'threat_update',
      data: threat,
      timestamp: new Date().toISOString()
    };

    // Send to all clients in threat_alerts room
    this.broadcastToRoom('threat_alerts', message);
  }

  /**
   * Send radar detection update
   */
  sendRadarUpdate(detection) {
    const message = {
      type: 'radar_update',
      data: detection,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRoom('tactical_maps', message);
  }

  /**
   * Send sensor status update
   */
  sendSensorUpdate(sensor) {
    const message = {
      type: 'sensor_update',
      data: sensor,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRoom('tactical_maps', message);
  }

  /**
   * Send system status update
   */
  sendSystemStatusUpdate(status, message) {
    const statusMessage = {
      type: 'system_status',
      data: {
        status,
        message,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToAll(statusMessage);
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `map_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      rooms: Array.from(this.rooms.keys()),
      clients: Array.from(this.clients.keys()).map(clientId => {
        const client = this.clients.get(clientId);
        return {
          id: clientId,
          user: client.user.email,
          role: client.user.role,
          rooms: Array.from(client.rooms),
          isAlive: client.isAlive,
          mapView: client.mapView
        };
      })
    };
  }
}

module.exports = MapWebSocketService;

