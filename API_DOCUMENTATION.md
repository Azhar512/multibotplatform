# MultiBot Platform API Documentation

## Overview

The MultiBot Platform API provides comprehensive endpoints for AI-powered chatbot interactions, voice processing, CRM integration, and analytics. This RESTful API is built with Node.js, Express, and MongoDB.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://api.multibotplatform.com`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **AI Services**: 20 requests per minute
- **Voice Services**: 10 requests per minute

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "data": {}, // Response data (success only)
  "error": "Error message", // Error message (error only)
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "message": "Registration successful"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "message": "Login successful"
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /api/auth/logout
Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  }
}
```

### Bot Interactions

#### POST /api/bot/chat
Send a message to the AI bot.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "message": "Hello, how can you help me?",
  "personalitySettings": {
    "Empathy": 80,
    "Assertiveness": 60,
    "Humour": 40,
    "Patience": 90,
    "Confidence": 70
  },
  "modelType": "gpt-4-turbo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Hello! I'm here to help you with any questions or tasks you might have.",
    "confidence": 0.95,
    "sentiment": 0.8,
    "model": "gpt-4-turbo",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/bot/voice
Process voice input and return AI response.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
audio: <audio-file>
personalitySettings: <json-string>
modelType: "gpt-4-turbo"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "Hello, how are you?",
    "processedResponse": "I'm doing well, thank you for asking!",
    "confidence": 0.92,
    "sentiment": 0.7,
    "audioUrl": "/api/audio/response.mp3"
  }
}
```

### AI Models

#### POST /openai/response
Get response from OpenAI GPT models.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "message": "Explain quantum computing",
  "model": "gpt-4-turbo",
  "temperature": 0.7,
  "maxTokens": 500
}
```

#### POST /deepseek/response
Get response from DeepSeek models.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "message": "What is machine learning?",
  "model": "deepseek-chat",
  "temperature": 0.8
}
```

#### POST /bert/response
Get response from BERT models.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "message": "Analyze this text sentiment",
  "model": "bert-base-uncased"
}
```

### Dashboard & Analytics

#### GET /api/dashboard/stats
Get dashboard statistics.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInteractions": 1250,
    "activeUsers": 45,
    "averageResponseTime": 1.2,
    "successRate": 98.5,
    "recentActivity": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "type": "chat",
        "user": "John Doe",
        "message": "Hello"
      }
    ]
  }
}
```

#### GET /api/dashboard/analytics
Get detailed analytics data.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `startDate`: ISO 8601 date string
- `endDate`: ISO 8601 date string
- `metric`: Analytics metric type

**Response:**
```json
{
  "success": true,
  "data": {
    "interactions": {
      "total": 1250,
      "byType": {
        "chat": 800,
        "voice": 450
      },
      "byModel": {
        "gpt-4-turbo": 600,
        "deepseek-chat": 400,
        "bert": 250
      }
    },
    "performance": {
      "averageResponseTime": 1.2,
      "successRate": 98.5,
      "errorRate": 1.5
    }
  }
}
```

### Voice Services

#### POST /api/twilio/voice
Handle incoming Twilio voice calls.

**Request Body:**
```json
{
  "CallSid": "call-sid",
  "From": "+1234567890",
  "To": "+0987654321",
  "CallStatus": "ringing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Call handled successfully",
    "callSid": "call-sid"
  }
}
```

### CRM Integration

#### GET /api/crm/contacts
Get CRM contacts.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `limit`: Number of contacts to return (default: 20)
- `offset`: Number of contacts to skip (default: 0)
- `search`: Search term for filtering

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact-id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "company": "Acme Corp"
      }
    ],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /api/crm/contacts
Create a new CRM contact.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily down |

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### `bot_response`
Real-time bot response updates.

```javascript
socket.on('bot_response', (data) => {
  console.log('Bot response:', data);
});
```

#### `analytics_update`
Real-time analytics updates.

```javascript
socket.on('analytics_update', (data) => {
  console.log('Analytics update:', data);
});
```

#### `user_connected`
User connection status.

```javascript
socket.on('user_connected', (data) => {
  console.log('User connected:', data);
});
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install multibot-platform-sdk
```

```javascript
import { MultiBotClient } from 'multibot-platform-sdk';

const client = new MultiBotClient({
  apiUrl: 'http://localhost:5000',
  token: 'your-jwt-token'
});

const response = await client.chat.sendMessage({
  message: 'Hello!',
  personalitySettings: { Empathy: 80 }
});
```

### Python
```bash
pip install multibot-platform
```

```python
from multibot_platform import MultiBotClient

client = MultiBotClient(
    api_url='http://localhost:5000',
    token='your-jwt-token'
)

response = client.chat.send_message(
    message='Hello!',
    personality_settings={'Empathy': 80}
)
```

## Support

For API support and questions:
- Email: api-support@multibotplatform.com
- Documentation: https://docs.multibotplatform.com
- GitHub Issues: https://github.com/your-org/multibot-platform/issues
