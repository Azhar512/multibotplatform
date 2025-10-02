# 🤖 Multi-Bot Platform

A comprehensive AI-powered multi-bot platform with voice capabilities, CRM integration, and advanced analytics.

## 🚀 Features

### Core Functionality
- **Multiple AI Models**: DeepSeek, BERT, OpenAI GPT-4 integration
- **Voice Interface**: Twilio-powered voice calls and speech-to-text
- **Personality Customization**: 5-trait personality system with industry presets
- **Real-time Analytics**: Live dashboard with interaction metrics
- **CRM Integration**: HubSpot, Salesforce, Zoho support
- **User Management**: Complete user authentication and management system

### Technical Features
- **Modern Architecture**: Node.js/Express backend, React frontend
- **Database**: MongoDB with optimized indexes
- **Security**: JWT authentication, rate limiting, input validation
- **Performance**: Memory leak prevention, caching, optimization
- **Monitoring**: Comprehensive logging and health checks

## 🛠️ Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB 6.0+
- npm 8+ or yarn 1.22+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/multibot-platform.git
   cd multibot-platform
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp Backend/env.example Backend/.env
   cp frontend/env.example frontend/.env
   
   # Edit configuration files with your API keys
   # See Configuration section below for required variables
   ```

4. **Start the application**
   ```bash
   # Development mode (both backend and frontend)
   npm run dev
   
   # Or start individually
   npm run start:backend  # Terminal 1
   npm run start:frontend # Terminal 2
   ```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/multibotplatform

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# AI Services
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# CRM
HUBSPOT_API_KEY=your_hubspot_key
SALESFORCE_CLIENT_ID=your_salesforce_client_id
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Bot Interaction
- `POST /api/bot/chat` - Send message to bot
- `POST /api/bot/voice` - Voice interaction
- `GET /api/bot/history` - Get conversation history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics` - Get analytics data

### Twilio Integration
- `POST /api/twilio/voice` - Handle incoming calls
- `POST /api/twilio/status` - Call status updates

## 🔒 Security Features

- **Rate Limiting**: Configurable rate limits for different endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Secure cross-origin resource sharing
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Sanitization**: XSS and injection protection

## 📈 Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Memory Management**: Conversation history cleanup
- **Caching**: Response caching for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for responses

## 🐳 Docker Support

The application includes complete Docker support with:
- Multi-stage builds for optimization
- Production-ready configurations
- Health checks and monitoring
- Volume management for data persistence

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

## 📝 Logging

The application uses structured logging with different levels:
- **Error**: System errors and exceptions
- **Warn**: Warning messages and rate limit hits
- **Info**: General information and user actions
- **Debug**: Detailed debugging information

Logs are written to:
- Console (development)
- Files (production)
- External services (optional)

## 🔄 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test all integrations
- [ ] Performance testing
- [ ] Security audit

### Environment-Specific Configurations
- **Development**: Full logging, relaxed CORS
- **Staging**: Production-like with test data
- **Production**: Optimized performance, strict security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔄 Changelog

### v2.0.0 (Current)
- ✅ Fixed module system consistency
- ✅ Added comprehensive input validation
- ✅ Implemented rate limiting
- ✅ Enhanced security configuration
- ✅ Added Docker support
- ✅ Performance optimizations
- ✅ Memory leak fixes
- ✅ Database indexing
- ✅ Production-ready configuration

---

**Built with ❤️ for the AI community**
