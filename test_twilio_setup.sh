#!/bin/bash

# ============================================
# Twilio Setup Test Script
# ============================================

echo "🧪 Testing Twilio Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check environment variables
echo "============================================"
echo "Test 1: Checking Environment Variables"
echo "============================================"

check_env() {
    local var_name=$1
    if grep -q "^${var_name}=" /var/www/multibotplatform/.env 2>/dev/null; then
        echo -e "${GREEN}✅ $var_name is set${NC}"
        return 0
    else
        echo -e "${RED}❌ $var_name is missing${NC}"
        return 1
    fi
}

check_env "TWILIO_ACCOUNT_SID"
check_env "TWILIO_AUTH_TOKEN"
check_env "TWILIO_PHONE_NUMBER"
check_env "TWILIO_APP_SID"
check_env "TWILIO_API_KEY"
check_env "TWILIO_API_SECRET"
check_env "BACKEND_URL"

echo ""

# Test 2: Check backend logs
echo "============================================"
echo "Test 2: Checking Backend Initialization"
echo "============================================"

if pm2 logs multibot-backend --lines 100 --nostream 2>/dev/null | grep -q "TwilioService initialized successfully"; then
    echo -e "${GREEN}✅ TwilioService initialized successfully${NC}"
else
    echo -e "${RED}❌ TwilioService initialization failed${NC}"
    echo ""
    echo "Recent logs:"
    pm2 logs multibot-backend --lines 20 --nostream | grep -i twilio
fi

echo ""

# Test 3: Test token endpoint
echo "============================================"
echo "Test 3: Testing Token Generation"
echo "============================================"

TOKEN_RESPONSE=$(curl -s https://168.231.114.68:5000/api/twilio/token 2>/dev/null)

if echo "$TOKEN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Token generation working${NC}"
    echo "Token preview: $(echo $TOKEN_RESPONSE | grep -o 'eyJ[^"]*' | head -c 50)..."
else
    echo -e "${RED}❌ Token generation failed${NC}"
    echo "Response: $TOKEN_RESPONSE"
fi

echo ""

# Test 4: Test TwiML endpoint
echo "============================================"
echo "Test 4: Testing TwiML Generation"
echo "============================================"

TWIML_RESPONSE=$(curl -s https://168.231.114.68:5000/api/twilio/handle-call 2>/dev/null)

if echo "$TWIML_RESPONSE" | grep -q "<Response>"; then
    echo -e "${GREEN}✅ TwiML generation working${NC}"
    echo "TwiML preview: $(echo $TWIML_RESPONSE | head -c 100)..."
else
    echo -e "${RED}❌ TwiML generation failed${NC}"
    echo "Response: $TWIML_RESPONSE"
fi

echo ""

# Test 5: Check PM2 status
echo "============================================"
echo "Test 5: Checking Backend Status"
echo "============================================"

if pm2 list | grep -q "multibot-backend.*online"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

echo ""

# Summary
echo "============================================"
echo "📊 TEST SUMMARY"
echo "============================================"
echo ""
echo "If all tests passed (✅), you're ready to:"
echo ""
echo "1️⃣  Configure Twilio Webhook:"
echo "   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming"
echo "   - Click your number: +12187577764"
echo "   - Voice URL: https://168.231.114.68:5000/api/twilio/handle-call"
echo "   - Method: POST"
echo "   - Status Callback: https://168.231.114.68:5000/api/twilio/call-status"
echo "   - Click Save"
echo ""
echo "2️⃣  Test Making a Call:"
echo "   - Login to: https://168.231.114.68 (or your frontend URL)"
echo "   - Go to Bot Interaction"
echo "   - Click voice/phone icon"
echo "   - Enter your phone number"
echo "   - Click Call"
echo ""
echo "3️⃣  Test Receiving a Call:"
echo "   - Call: +12187577764"
echo "   - You should hear: 'Hello, this is your AI assistant...'"
echo ""
echo "============================================"
echo ""

