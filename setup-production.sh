#!/bin/bash

# Production Setup Script for MultiBot Platform
echo "🚀 Setting up MultiBot Platform for Production..."

# Create backend production environment
cat > Backend/.env << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/multibotplatform

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_change_this_immediately
JWT_EXPIRES_IN=24h

# Server Configuration
FRONTEND_URL=http://168.231.114.68:3000

# AI Services (Add your actual API keys)
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Twilio Configuration (Add your actual credentials)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# CRM Integration (Add your actual credentials)
HUBSPOT_API_KEY=your_hubspot_api_key_here
SALESFORCE_CLIENT_ID=your_salesforce_client_id_here
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret_here
SALESFORCE_USERNAME=your_salesforce_username_here
SALESFORCE_PASSWORD=your_salesforce_password_here
SALESFORCE_SECURITY_TOKEN=your_salesforce_security_token_here

# Google Cloud Services
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/service.log
EOF

# Create frontend production environment
cat > frontend/.env << EOF
# Production Environment Configuration
NODE_ENV=production

# API Configuration - Use server IP instead of localhost
REACT_APP_API_URL=http://168.231.114.68:5000
REACT_APP_BACKEND_URL=http://168.231.114.68:5000
REACT_APP_WS_URL=ws://168.231.114.68:5000

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here

# Optional: Error Tracking
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
EOF

echo "✅ Environment files created!"
echo "📝 Please update the API keys in Backend/.env with your actual credentials"
echo "🔧 Now you can start the backend and frontend services"
