const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { EventEmitter } = require('events');

class WebSocketService extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.wss = null;
    this.clients = new Map();
    this.rooms = new Map();
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket server
   */
  initializeWebSocket() {
    this.wss = new WebSocket.Server({
      server: this.server,
      path: '/ws/alerts',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('WebSocket server initialized on /ws/alerts');
  }

  /**
   * Verify client connection
   * @param {Object} info - Connection info
   * @returns {boolean} True if client is verified
   */
  verifyClient(info) {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('WebSocket connection rejected: No token provided');
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      info.req.user = decoded;
      return true;
    } catch (error) {
      console.log('WebSocket connection rejected: Invalid token');
      return false;
    }
  }

  /**
   * Handle new WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} req - HTTP request
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
      isAlive: true
    });

    console.log(`WebSocket client connected: ${user.email} (${clientId})`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'welcome',
      message: 'Connected to Aegis Defense System',
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

    // Join default rooms based on user role
    this.joinDefaultRooms(clientId, user.role);
  }

  /**
   * Handle incoming WebSocket message
   * @param {string} clientId - Client ID
   * @param {Buffer} data - Message data
   */
  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.log(`Received message from unknown client: ${clientId}`);
        return;
      }

      console.log(`Message from ${client.user.email}:`, message.type);

      switch (message.type) {
        case 'join_room':
          this.handleJoinRoom(clientId, message.room);
          break;
        case 'leave_room':
          this.handleLeaveRoom(clientId, message.room);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        case 'subscribe_alerts':
          this.handleSubscribeAlerts(clientId, message.filters);
          break;
        case 'unsubscribe_alerts':
          this.handleUnsubscribeAlerts(clientId);
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
    }
  }

  /**
   * Handle client disconnection
   * @param {string} clientId - Client ID
   */
  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`WebSocket client disconnected: ${client.user.email} (${clientId})`);
      
      // Leave all rooms
      for (const room of client.rooms) {
        this.leaveRoom(clientId, room);
      }
      
      this.clients.delete(clientId);
    }
  }

  /**
   * Handle WebSocket error
   * @param {string} clientId - Client ID
   * @param {Error} error - Error object
   */
  handleError(clientId, error) {
    console.error(`WebSocket error for client ${clientId}:`, error);
    this.handleDisconnection(clientId);
  }

  /**
   * Handle pong response
   * @param {string} clientId - Client ID
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
   * @param {string} clientId - Client ID
   */
  handlePing(clientId) {
    this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
  }

  /**
   * Handle join room request
   * @param {string} clientId - Client ID
   * @param {string} room - Room name
   */
  handleJoinRoom(clientId, room) {
    this.joinRoom(clientId, room);
    this.sendToClient(clientId, {
      type: 'room_joined',
      room,
      message: `Joined room: ${room}`
    });
  }

  /**
   * Handle leave room request
   * @param {string} clientId - Client ID
   * @param {string} room - Room name
   */
  handleLeaveRoom(clientId, room) {
    this.leaveRoom(clientId, room);
    this.sendToClient(clientId, {
      type: 'room_left',
      room,
      message: `Left room: ${room}`
    });
  }

  /**
   * Handle subscribe to alerts
   * @param {string} clientId - Client ID
   * @param {Object} filters - Alert filters
   */
  handleSubscribeAlerts(clientId, filters = {}) {
    const client = this.clients.get(clientId);
    if (client) {
      client.alertFilters = filters;
      this.joinRoom(clientId, 'alerts');
      this.sendToClient(clientId, {
        type: 'alerts_subscribed',
        filters,
        message: 'Subscribed to alert notifications'
      });
    }
  }

  /**
   * Handle unsubscribe from alerts
   * @param {string} clientId - Client ID
   */
  handleUnsubscribeAlerts(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.alertFilters = null;
      this.leaveRoom(clientId, 'alerts');
      this.sendToClient(clientId, {
        type: 'alerts_unsubscribed',
        message: 'Unsubscribed from alert notifications'
      });
    }
  }

  /**
   * Join a room
   * @param {string} clientId - Client ID
   * @param {string} room - Room name
   */
  joinRoom(clientId, room) {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.add(room);
      
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      
      this.rooms.get(room).add(clientId);
      console.log(`Client ${clientId} joined room: ${room}`);
    }
  }

  /**
   * Leave a room
   * @param {string} clientId - Client ID
   * @param {string} room - Room name
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
      
      console.log(`Client ${clientId} left room: ${room}`);
    }
  }

  /**
   * Join default rooms based on user role
   * @param {string} clientId - Client ID
   * @param {string} role - User role
   */
  joinDefaultRooms(clientId, role) {
    // All users join the general room
    this.joinRoom(clientId, 'general');
    
    // Role-specific rooms
    switch (role) {
      case 'Admin':
        this.joinRoom(clientId, 'admin');
        this.joinRoom(clientId, 'alerts');
        break;
      case 'Operator':
        this.joinRoom(clientId, 'operators');
        this.joinRoom(clientId, 'alerts');
        break;
      case 'User':
        this.joinRoom(clientId, 'users');
        break;
    }
  }

  /**
   * Start ping interval for client
   * @param {string} clientId - Client ID
   */
  startPingInterval(clientId) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      if (!client.isAlive) {
        console.log(`Client ${clientId} not responding to ping, closing connection`);
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
   * @param {string} clientId - Client ID
   * @param {Object} message - Message object
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients in a room
   * @param {string} room - Room name
   * @param {Object} message - Message object
   */
  broadcastToRoom(room, message) {
    if (this.rooms.has(room)) {
      for (const clientId of this.rooms.get(room)) {
        this.sendToClient(clientId, message);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   * @param {Object} message - Message object
   */
  broadcastToAll(message) {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  /**
   * Send alert notification to subscribed clients
   * @param {Object} alert - Alert object
   */
  sendAlertNotification(alert) {
    const message = {
      type: 'alert',
      data: alert,
      timestamp: new Date().toISOString()
    };

    // Send to all clients in alerts room
    this.broadcastToRoom('alerts', message);

    // Send to specific role rooms based on alert severity
    if (alert.alert_type === 'CRITICAL') {
      this.broadcastToRoom('admin', message);
      this.broadcastToRoom('operators', message);
    } else if (alert.alert_type === 'HIGH') {
      this.broadcastToRoom('operators', message);
    }
  }

  /**
   * Send system status update
   * @param {string} status - System status
   * @param {string} message - Status message
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
   * @returns {string} Client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   * @returns {Object} Connection stats
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
          isAlive: client.isAlive
        };
      })
    };
  }
}

module.exports = WebSocketService;


