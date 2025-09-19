const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketManager extends EventEmitter {
  constructor() {
    super();
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/alerts'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection for alerts');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to alerts WebSocket',
        timestamp: new Date().toISOString()
      }));
    });

    console.log('WebSocket server initialized on /ws/alerts');
  }

  broadcastAlert(alert) {
    const message = JSON.stringify({
      type: 'new_alert',
      alert: alert,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending alert to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  broadcastAlertUpdate(alert) {
    const message = JSON.stringify({
      type: 'alert_updated',
      alert: alert,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending alert update to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }
}

module.exports = new WebSocketManager();
