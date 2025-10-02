#!/bin/bash

echo "🔧 Fixing MultiBot Platform Server Connection Issues..."

# Navigate to project directory
cd /var/www/multibotplatform

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Create backend .env file with correct server IP
echo "🔧 Creating backend environment file..."
cat > Backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multibotplatform
JWT_SECRET=your_production_jwt_secret_change_this_immediately
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://168.231.114.68:3000
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
HUBSPOT_API_KEY=your_hubspot_api_key_here
SALESFORCE_CLIENT_ID=your_salesforce_client_id_here
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret_here
SALESFORCE_USERNAME=your_salesforce_username_here
SALESFORCE_PASSWORD=your_salesforce_password_here
SALESFORCE_SECURITY_TOKEN=your_salesforce_security_token_here
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=./logs/service.log
EOF

# Create frontend .env file with correct server IP
echo "🌐 Creating frontend environment file..."
cat > frontend/.env << 'EOF'
NODE_ENV=production
REACT_APP_API_URL=http://168.231.114.68:5000
REACT_APP_BACKEND_URL=http://168.231.114.68:5000
REACT_APP_WS_URL=ws://168.231.114.68:5000
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
EOF

# Install dependencies
echo "📦 Installing backend dependencies..."
cd Backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Configuration updated!"
echo "🚀 Now start the backend server:"
echo "   cd /var/www/multibotplatform/Backend"
echo "   npm start"
echo ""
echo "🌐 Then start the frontend:"
echo "   cd /var/www/multibotplatform/frontend"
echo "   npm start"
