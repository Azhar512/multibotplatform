// Test script to verify endpoints are working
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing Multi-Bot Platform Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      const token = registerResult.token;
      
      // Test 3: Login with same credentials
      console.log('\n3. Testing login with same credentials...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });

      const loginResult = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        
        // Test 4: Bot response (authenticated)
        console.log('\n4. Testing bot response...');
        const botResponse = await fetch(`${BASE_URL}/api/bot/bot/response`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: 'Hello, how are you?',
            personality: {
              formality: 0.5,
              friendliness: 0.8,
              creativity: 0.7
            },
            config: {
              enableTextToSpeech: false
            }
          })
        });

        const botResult = await botResponse.json();
        if (botResponse.ok) {
          console.log('✅ Bot response successful:', botResult.text?.substring(0, 100) + '...');
        } else {
          console.log('❌ Bot response failed:', botResult.error);
        }

        // Test 5: Get user info
        console.log('\n5. Testing get user info...');
        const userResponse = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const userResult = await userResponse.json();
        if (userResponse.ok) {
          console.log('✅ Get user info successful:', userResult.user.email);
        } else {
          console.log('❌ Get user info failed:', userResult.error);
        }

      } else {
        console.log('❌ Login failed:', loginResult.error);
      }
    } else {
      console.log('❌ Registration failed:', registerResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests
testEndpoints();