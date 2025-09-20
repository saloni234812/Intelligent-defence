<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# 🛡️ Aegis Defense System

A comprehensive threat monitoring and defense management system built with React, Node.js, and MongoDB. This system provides real-time threat detection, alert management, and tactical response capabilities.

## 🚀 Features

### Core Functionality
- **Real-time Threat Monitoring** - Live radar and sensor data processing
- **Alert Management** - Comprehensive alert system with severity levels
- **User Authentication** - JWT-based authentication with role-based access
- **Tactical Dashboard** - Interactive maps and system status monitoring
- **WebSocket Communication** - Real-time updates and notifications

### Advanced Features
- **Threat Type Classification** - 17+ predefined threat categories
- **Background Job Processing** - Automated cleanup and analysis tasks
- **File Upload System** - Secure file handling with validation
- **Notification System** - Email and Discord integration
- **Comprehensive Testing** - Unit, integration, and API tests
- **Production Ready** - Docker, CI/CD, and monitoring setup

## 🏗️ Architecture

### Frontend (React + Vite)
- **Components**: Modular React components with Tailwind CSS
- **State Management**: React hooks and context
- **Routing**: React Router for navigation
- **API Integration**: Centralized API service layer

### Backend (Node.js + Express)
- **RESTful API**: Comprehensive API with JWT authentication
- **WebSocket Server**: Real-time communication
- **Database**: MongoDB with Mongoose ODM
- **Background Jobs**: Cron-based task scheduling
- **Security**: Helmet, CORS, rate limiting, input validation

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions pipeline
- **Monitoring**: Prometheus and Grafana
- **Reverse Proxy**: Nginx with SSL termination

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** 7.0+
- **Redis** 7.2+ (optional, for caching)
- **Docker** (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/aegis-defense-system.git
cd aegis-defense-system
```

### 2. Backend Setup
```bash
cd server
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Database Setup
```bash
# Start MongoDB (if not using Docker)
mongod

# Seed initial data
cd server
npm run seed:all
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/aegis-defense
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Discord (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

## 🧪 Testing

### Run All Tests
```bash
cd server
npm test
```

### Run Specific Test Suites
```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report
```

### Frontend Tests
```bash
cd client
npm test
```

## 📚 API Documentation

### Authentication
- `POST /api/users/signup` - Create user account
- `POST /api/users/login` - Authenticate user
- `GET /api/users/me` - Get current user
- `POST /api/users/logout` - Logout user

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `POST /api/alerts/:id/ack` - Acknowledge alert

### System
- `GET /api/system/status` - System status
- `GET /api/system/health` - Health check

### WebSocket
- `ws://localhost:5000/ws/alerts?token=<jwt-token>`

For complete API documentation, see [server/docs/api.md](server/docs/api.md)

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, Operator, User roles
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - API and login rate limiting
- **Input Validation** - Joi schema validation
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers
- **XSS Protection** - Input sanitization

## 📊 Monitoring & Observability

### Metrics
- System health monitoring
- Performance metrics
- Error tracking
- User activity logs

### Logging
- Structured logging with Pino
- Request/response logging
- Error tracking
- Audit trails

### Health Checks
- Database connectivity
- External service status
- Memory usage monitoring
- WebSocket connection health

## 🚀 Deployment

### Production Checklist
- [ ] Set secure JWT secret
- [ ] Configure database credentials
- [ ] Set up SSL certificates
- [ ] Configure email/Discord notifications
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Set up log aggregation

### Cloud Deployment
- **AWS**: ECS, RDS, ElastiCache
- **GCP**: Cloud Run, Cloud SQL, Memorystore
- **Azure**: Container Instances, Cosmos DB, Redis Cache
- **Heroku**: Heroku Postgres, Redis, Scheduler

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.aegis-system.com](https://docs.aegis-system.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/aegis-defense-system/issues)
- **Email**: support@aegis-system.com
- **Discord**: [Join our Discord](https://discord.gg/aegis-defense)

## 🏆 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- All contributors and testers

## 📈 Roadmap

### Version 2.0
- [ ] Machine Learning threat detection
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Multi-tenant support
- [ ] Advanced reporting

### Version 2.1
- [ ] AI-powered threat analysis
- [ ] Integration with external threat feeds
- [ ] Advanced user management
- [ ] Custom alert rules
- [ ] API rate limiting per user

---

**Built with ❤️ by the Aegis Defense Team**


>>>>>>> 8f99f30fabd2ccd98cd79efc8b48363f8a331413
