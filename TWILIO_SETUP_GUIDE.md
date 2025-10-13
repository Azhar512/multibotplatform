# 🎯 Twilio Integration Setup Guide

## ✅ Current Implementation Status

### **Backend (Web Application) - ✅ FULLY IMPLEMENTED**

The backend has complete Twilio integration with the following features:

#### 📁 Files Implemented:
1. **`Backend/src/services/twilioService.js`** - Core Twilio service
2. **`Backend/src/routes/twilioRoutes.js`** - API endpoints for Twilio
3. **`Backend/src/models/Call.js`** - Call log database model
4. **`Backend/src/services/aiCallService.js`** - AI-powered call insights
5. **`frontend/src/components/pages/BotInteraction/BotInteraction.js`** - Frontend calling UI

#### 🎯 Features Available:
- ✅ Access token generation for Twilio Voice
- ✅ Outbound call initiation
- ✅ Inbound call handling
- ✅ TwiML generation with personality settings
- ✅ Call status tracking
- ✅ Speech input collection
- ✅ Call recording processing
- ✅ AI-powered call insights
- ✅ Call logging to database

---

## 🔧 Setup Instructions

### **Step 1: Get Twilio Credentials**

1. **Sign up for Twilio** (if you haven't already):
   - Go to https://www.twilio.com/try-twilio
   - Create a free account (you'll get $15 credit)

2. **Get your Account SID and Auth Token**:
   - Go to https://console.twilio.com/
   - Your **Account SID** and **Auth Token** are on the dashboard
   - Copy both values

3. **Get a Twilio Phone Number**:
   - Go to https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click "Buy a Number"
   - Select a phone number (voice-capable)
   - Purchase it (free with trial credit)

4. **Create TwiML App** (for Voice SDK):
   - Go to https://console.twilio.com/us1/develop/voice/manage/twiml-apps
   - Click "Create new TwiML App"
   - Set the name: "MultiBot Platform Voice"
   - **Voice Configuration**:
     - Request URL: `https://YOUR_BACKEND_URL/api/twilio/handle-call`
     - Method: `HTTP POST`
   - **Status Callback URL**: `https://YOUR_BACKEND_URL/api/twilio/call-status`
   - Click "Save"
   - Copy the **Application SID** (starts with `AP...`)

5. **Create API Keys** (for access tokens):
   - Go to https://console.twilio.com/us1/develop/voice/settings/api-keys
   - Click "Create API key"
   - Name: "MultiBot Platform API"
   - Key Type: "Standard"
   - Click "Create API Key"
   - Copy the **API Key SID** and **API Secret** (you won't see the secret again!)

---

### **Step 2: Configure Backend Environment Variables**

1. **On Your Server**, edit your `.env` file:

```bash
# On your server
cd /var/www/multibotplatform
nano .env  # or use vi/vim
```

2. **Add/Update these Twilio variables**:

```bash
# Twilio Configuration - REQUIRED for calling features
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here

# Backend URL (important for callbacks)
BACKEND_URL=https://168.231.114.68:5000
# OR if you have a domain:
# BACKEND_URL=https://yourdomain.com
```

3. **Save and restart the backend**:

```bash
pm2 restart multibot-backend --update-env
```

---

### **Step 3: Configure Frontend Environment Variables**

1. **On Your Server**, edit frontend `.env`:

```bash
cd /var/www/multibotplatform/frontend
nano .env
```

2. **Add/Update**:

```bash
REACT_APP_API_URL=https://168.231.114.68:5000
# OR if you have a domain:
# REACT_APP_API_URL=https://yourdomain.com
```

3. **Rebuild and restart frontend**:

```bash
npm run build
pm2 restart multibot-frontend
```

---

### **Step 4: Configure Twilio Webhooks**

1. **Go to your Twilio Phone Number settings**:
   - https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Click on your phone number

2. **Voice Configuration**:
   - When a call comes in: **Webhook**
   - URL: `https://YOUR_BACKEND_URL/api/twilio/handle-call`
   - HTTP Method: `POST`

3. **Call Status Changes**:
   - Status Callback URL: `https://YOUR_BACKEND_URL/api/twilio/call-status`
   - HTTP Method: `POST`

4. **Save configuration**

---

## 🧪 Testing the Integration

### **Test 1: Check Backend Twilio Initialization**

```bash
# On your server
pm2 logs multibot-backend --lines 100 | grep -i twilio
```

You should see:
```
✅ TwilioService initialized successfully
```

If you see errors, check:
- Environment variables are set correctly
- No typos in credentials
- Account SID and Auth Token are from the same account

---

### **Test 2: Test Token Generation**

Open your browser and go to:
```
https://YOUR_BACKEND_URL/api/twilio/token
```

You should get a JSON response with a JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### **Test 3: Test Outbound Call (Web App)**

1. **Login to your web app**:
   ```
   https://YOUR_FRONTEND_URL
   ```

2. **Navigate to Bot Interaction**

3. **Enable Voice Mode**:
   - Click the microphone icon
   - Allow microphone permissions

4. **Make a Test Call**:
   - Enter a phone number (your own)
   - Click "Call"
   - Your phone should ring!

---

### **Test 4: Test Inbound Call**

1. **Call your Twilio number** from your phone

2. **You should hear**:
   ```
   "Hello, this is your AI assistant calling. How can I help you today?"
   ```

3. **Speak something** like:
   ```
   "Hello, what can you do?"
   ```

4. **The bot should respond** based on your personality settings

---

## 📱 Mobile App Integration (TempAppWorking)

### **Current Status: ⚠️ NOT FOUND IN WORKSPACE**

The mobile app directory `TempAppWorking` is not in the current workspace. To integrate Twilio calling in the mobile app:

### **Option 1: React Native Twilio Voice SDK**

Install the SDK:
```bash
npm install @twilio/voice-react-native-sdk
```

### **Option 2: Use WebRTC Bridge**

Use the existing web implementation with a WebView:
```javascript
import { WebView } from 'react-native-webview'

<WebView 
  source={{ uri: 'https://YOUR_FRONTEND_URL/bot-interaction' }}
  allowsInlineMediaPlayback
  mediaPlaybackRequiresUserAction={false}
/>
```

### **Option 3: Native Twilio Integration**

For iOS and Android native calling, you'll need:

1. **Install Twilio Voice SDK**:
```bash
npm install @twilio/voice-react-native-sdk
npx pod-install  # iOS only
```

2. **iOS Configuration** (`ios/TempAppWorking/Info.plist`):
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for voice calls</string>
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>voip</string>
</array>
```

3. **Android Configuration** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.USE_SIP" />
```

4. **Example React Native Code**:
```javascript
import { Voice } from '@twilio/voice-react-native-sdk'

const voice = new Voice()

// Get token from backend
const token = await fetch('https://YOUR_BACKEND_URL/api/twilio/token')
  .then(res => res.json())
  .then(data => data.data.token)

// Register voice client
await voice.register(token)

// Make a call
const call = await voice.connect({ To: '+1234567890' })

// Handle call events
call.on('connected', () => console.log('Call connected'))
call.on('disconnected', () => console.log('Call ended'))
```

---

## 🔍 Troubleshooting

### **Issue 1: "TwilioService not initialized"**

**Solution**:
1. Check environment variables are set
2. Restart backend: `pm2 restart multibot-backend --update-env`
3. Check logs: `pm2 logs multibot-backend`

---

### **Issue 2: "Failed to generate token"**

**Possible Causes**:
- Missing `TWILIO_API_KEY` or `TWILIO_API_SECRET`
- Missing `TWILIO_APP_SID`
- Invalid credentials

**Solution**:
1. Verify all Twilio env variables are set
2. Create new API keys if needed
3. Check TwiML App exists

---

### **Issue 3: Call connects but no audio**

**Possible Causes**:
- Microphone permissions not granted
- TwiML webhook not configured
- Backend URL not accessible from Twilio

**Solution**:
1. Check browser console for permission errors
2. Verify webhook URL is publicly accessible
3. Test webhook URL directly in browser

---

### **Issue 4: Inbound calls not working**

**Solution**:
1. Check phone number webhook configuration
2. Verify `BACKEND_URL` is publicly accessible
3. Check Twilio debugger: https://console.twilio.com/us1/monitor/debugger

---

## 💡 Advanced Features

### **Custom Voice Messages**

Edit `Backend/src/services/twilioService.js`, line 126:

```javascript
response.say(
  {
    voice: "alice",  // Options: alice, man, woman, Polly.* voices
    language: "en-US",  // Change language
  },
  "Your custom greeting here"
)
```

### **Call Recording**

To enable call recording, modify the TwiML in `twilioService.js`:

```javascript
const call = await this.client.calls.create({
  to: toNumber,
  from: fromNumber,
  url: `${process.env.BACKEND_URL}/api/twilio/handle-call`,
  record: true,  // Enable recording
  recordingStatusCallback: `${process.env.BACKEND_URL}/api/twilio/recording-status`
})
```

### **AI-Powered Call Transcription**

The backend already has AI call insights implemented in `aiCallService.js`. To use it:

1. Enable call recording (see above)
2. The service will automatically:
   - Transcribe the call using Google Cloud Speech-to-Text
   - Analyze sentiment
   - Generate call summary
   - Extract key topics

---

## 📊 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/twilio/token` | GET | Get Twilio access token |
| `/api/twilio/initiate-call` | POST | Start outbound call |
| `/api/twilio/handle-call` | GET | TwiML handler for calls |
| `/api/twilio/call-status` | POST | Call status callback |
| `/api/twilio/collect-input` | POST | Speech input handler |

---

## 🎉 Completion Checklist

- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] TwiML App created
- [ ] API Keys created
- [ ] Backend `.env` configured with all Twilio variables
- [ ] Frontend `.env` configured
- [ ] Backend restarted with new config
- [ ] Frontend rebuilt and restarted
- [ ] Webhooks configured in Twilio console
- [ ] Token generation tested (returns JWT)
- [ ] Outbound call tested (can call from web app)
- [ ] Inbound call tested (can receive calls)
- [ ] Audio working in both directions
- [ ] Call logs appearing in database

---

## 🚀 Next Steps

1. **Test the web app calling** first (it's fully implemented)
2. **If you need mobile calling**, share the `TempAppWorking` directory or let me know the mobile app's location
3. **Configure webhooks** in Twilio console to point to your backend
4. **Monitor calls** using Twilio console debugger

---

## 📞 Need Help?

If you encounter issues:

1. Check backend logs: `pm2 logs multibot-backend`
2. Check Twilio debugger: https://console.twilio.com/us1/monitor/debugger
3. Test webhook URLs manually in browser
4. Verify all environment variables are set correctly

---

**Your Twilio integration is COMPLETE for the web app! 🎉**

Just need to configure the credentials and test it!

