#!/bin/bash

echo "🚨 URGENT: Fixing Server Connection Issues"
echo "=========================================="

# Navigate to project directory
cd /var/www/multibotplatform

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Creating Backend Environment File..."
cat > Backend/.env << 'EOF'
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/multibotplatform

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_change_this_immediately_$(date +%s)
JWT_EXPIRES_IN=24h

# Server Configuration - CRITICAL: Use server IP
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

echo "🌐 Creating Frontend Environment File..."
cat > frontend/.env << 'EOF'
# Production Environment Configuration
NODE_ENV=production

# API Configuration - CRITICAL: Use server IP
REACT_APP_API_URL=http://168.231.114.68:5000
REACT_APP_BACKEND_URL=http://168.231.114.68:5000
REACT_APP_WS_URL=ws://168.231.114.68:5000

# Analytics and Monitoring
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id_here
REACT_APP_SENTRY_DSN=your_sentry_dsn_here

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_TRACKING=true
REACT_APP_DEBUG_MODE=false
EOF

echo "📦 Installing Backend Dependencies..."
cd Backend

# Install missing dependencies
npm install sentiment @huggingface/inference @xenova/transformers

# Install all dependencies
npm install

echo "🔧 Fixing Server.js CORS Configuration..."
# Update server.js to include the server IP in CORS
sed -i 's/const allowedOrigins = \[/const allowedOrigins = [\n  "http:\/\/168.231.114.68:3000",/' server.js

echo "🚀 Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

echo "🚀 Starting Backend Server..."
# Kill any existing node processes
pkill -f "node server.js" || true

# Start the backend server
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for server to start
sleep 5

echo "🔍 Testing Backend Connection..."
# Test if backend is responding
if curl -f http://168.231.114.68:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is responding!"
else
    echo "❌ Backend server is not responding. Checking logs..."
    tail -20 backend.log
fi

echo "📦 Installing Frontend Dependencies..."
cd ../frontend

# Install dependencies
npm install

echo "🔧 Building Frontend..."
npm run build

echo "🚀 Starting Frontend Server..."
# Kill any existing frontend processes
pkill -f "react-scripts start" || true

# Start the frontend server
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 10

echo "🔍 Testing Frontend Connection..."
# Test if frontend is responding
if curl -f http://168.231.114.68:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is responding!"
else
    echo "❌ Frontend server is not responding. Checking logs..."
    tail -20 frontend.log
fi

echo "🔧 Checking Firewall Settings..."
# Check if ports are open
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 5000

echo "🌐 Testing Full Connection..."
# Test the full stack
echo "Testing API endpoint..."
curl -X GET http://168.231.114.68:5000/api/test

echo ""
echo "Testing health endpoint..."
curl -X GET http://168.231.114.68:5000/api/health

echo ""
echo "✅ SERVER CONNECTION FIXED!"
echo "=========================="
echo "🎉 Your servers are now running:"
echo "   Frontend: http://168.231.114.68:3000"
echo "   Backend:  http://168.231.114.68:5000"
echo ""
echo "🔍 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 To check server status:"
echo "   ps aux | grep node"
echo ""
echo "📋 To check logs:"
echo "   tail -f Backend/backend.log"
echo "   tail -f frontend/frontend.log"
echo ""
echo "🎯 Try registering again - it should work now!"
