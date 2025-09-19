// Load environment variables first
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');
const logger = require('./logger');
const errorMw = require('./middleware/error');
let userRoutes, sensorRoutes;
try { userRoutes = require('./routes/userRoutes'); } catch {}
try { sensorRoutes = require('./routes/sensorRoutes'); } catch {}
const radarRoutes = require('./routes/radarRoutes');
const alertRoutes = require('./routes/alertRoutes');
const playbookRoutes = require('./routes/playbookRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Swagger
try { require('./swagger')(app); } catch {}

// Routes
if (userRoutes) app.use('/api/users', userRoutes);
if (sensorRoutes) app.use('/api/sensors', sensorRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/system', systemRoutes);

// Default route
app.get('/', (req, res) => res.json({ message: 'Server running' }));

// Error handler
app.use(errorMw);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
});
