// Test backend connection
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testConnection() {
  console.log('🧪 Testing CallSync Backend Connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData.status);
    } else {
      console.log('   ❌ Health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
  }

  try {
    // Test auth endpoints
    console.log('\n2. Testing authentication endpoints...');
    
    // Test registration endpoint
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (registerResponse.ok) {
      console.log('   ✅ Registration endpoint working');
    } else {
      const errorData = await registerResponse.json();
      console.log('   ⚠️  Registration endpoint response:', registerResponse.status, errorData.error);
    }
  } catch (error) {
    console.log('   ❌ Registration test failed:', error.message);
  }

  try {
    // Test login endpoint
    console.log('\n3. Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (loginResponse.ok) {
      console.log('   ✅ Login endpoint working');
    } else {
      const errorData = await loginResponse.json();
      console.log('   ⚠️  Login endpoint response:', loginResponse.status, errorData.error);
    }
  } catch (error) {
    console.log('   ❌ Login test failed:', error.message);
  }

  try {
    // Test AI endpoints
    console.log('\n4. Testing AI endpoints...');
    
    const aiEndpoints = [
      '/deepseek/health',
      '/bert/health',
      '/openai/health'
    ];

    for (const endpoint of aiEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (response.ok) {
          console.log(`   ✅ ${endpoint} working`);
        } else {
          console.log(`   ⚠️  ${endpoint} response: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} failed: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('   ❌ AI endpoints test failed:', error.message);
  }

  console.log('\n🎉 Connection test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Make sure the backend server is running');
  console.log('   2. Check that MongoDB is running');
  console.log('   3. Verify all environment variables are set');
  console.log('   4. Test the frontend connection');
}

testConnection().catch(console.error);
