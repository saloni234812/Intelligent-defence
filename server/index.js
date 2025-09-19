// Load environment variables first
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');
const logger = require('./logger');
const errorMw = require('./middleware/error');
const wsManager = require('./websocket');
const userRoutes = require('./routes/userRoutes');
let sensorRoutes;
try { sensorRoutes = require('./routes/sensorRoutes'); } catch {}
const radarRoutes = require('./routes/radarRoutes');
const alertRoutes = require('./routes/alertRoutes');
const playbookRoutes = require('./routes/playbookRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const systemRoutes = require('./routes/systemRoutes');
const aiRoutes = require('./routes/aiRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const mapRoutes = require('./routes/mapRoutes');
const threatRoutes = require('./routes/threatRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  optionsSuccessStatus: 200
}));

// Swagger
try { require('./swagger')(app); } catch {}

// Routes
app.use('/api/users', userRoutes);
if (sensorRoutes) app.use('/api/sensors', sensorRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/threats', threatRoutes);

// Default route
app.get('/', (req, res) => res.json({ message: 'Server running' }));

// Error handler
app.use(errorMw);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
  
  // Initialize WebSocket
  wsManager.initialize(server);
  logger.info('✅ WebSocket server initialized');
});
