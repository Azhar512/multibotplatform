#!/bin/bash

# ============================================
# Twilio Credentials Setup Script
# ============================================

echo "🔧 Setting up Twilio credentials on production server..."

# Check if we're on the server
if [ ! -d "/var/www/multibotplatform" ]; then
    echo "❌ Error: Not on production server. Please run this on your server."
    exit 1
fi

cd /var/www/multibotplatform

# Backup existing .env
if [ -f .env ]; then
    echo "📦 Backing up existing .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Check if .env exists, create if not
if [ ! -f .env ]; then
    echo "📝 Creating new .env file..."
    touch .env
fi

# Function to add or update env variable
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i "s|^${key}=.*|${key}=${value}|" .env
        echo "✅ Updated: $key"
    else
        # Add new
        echo "${key}=${value}" >> .env
        echo "✅ Added: $key"
    fi
}

# Add Twilio credentials
echo ""
echo "🎯 Adding Twilio credentials..."
echo ""

# REPLACE THESE WITH YOUR ACTUAL TWILIO CREDENTIALS
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+1XXXXXXXXXX"
TWILIO_APP_SID="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_API_KEY="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

update_env "TWILIO_ACCOUNT_SID" "$TWILIO_ACCOUNT_SID"
update_env "TWILIO_AUTH_TOKEN" "$TWILIO_AUTH_TOKEN"
update_env "TWILIO_PHONE_NUMBER" "$TWILIO_PHONE_NUMBER"
update_env "TWILIO_APP_SID" "$TWILIO_APP_SID"
update_env "TWILIO_API_KEY" "$TWILIO_API_KEY"
update_env "TWILIO_API_SECRET" "$TWILIO_API_SECRET"
update_env "BACKEND_URL" "https://168.231.114.68:5000"

echo ""
echo "✅ Twilio credentials configured!"
echo ""

# Restart backend
echo "🔄 Restarting backend with new credentials..."
pm2 restart multibot-backend --update-env

echo ""
echo "⏳ Waiting for service to start..."
sleep 5

echo ""
echo "📊 Checking Twilio initialization..."
pm2 logs multibot-backend --lines 50 --nostream | grep -i twilio

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "🧪 Test your setup:"
echo "1. Token test: curl https://168.231.114.68:5000/api/twilio/token"
echo "2. Open web app and go to Bot Interaction"
echo "3. Click voice icon and make a test call"
echo ""
echo "📝 Next steps:"
echo "1. Configure webhook in Twilio console"
echo "2. Test inbound calls"
echo ""

