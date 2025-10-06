const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '168.231.114.68',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      reject(new Error('Request timeout'));
      req.destroy();
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Production Authentication Server...\n');
  
  try {
    // Test 1: Basic test endpoint
    console.log('1️⃣ Testing /api/test...');
    const testResult = await testEndpoint('/api/test');
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Response:`, testResult.data);
    console.log('');
    
    // Test 2: Register endpoint
    console.log('2️⃣ Testing /api/auth/register...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    const registerResult = await testEndpoint('/api/auth/register', 'POST', registerData);
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Response:`, registerResult.data);
    console.log('');
    
    // Test 3: Login endpoint
    console.log('3️⃣ Testing /api/auth/login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    const loginResult = await testEndpoint('/api/auth/login', 'POST', loginData);
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response:`, loginResult.data);
    console.log('');
    
    // Test 4: Get user info (if login was successful)
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('4️⃣ Testing /api/auth/me...');
      const meResult = await testEndpoint('/api/auth/me', 'GET', null, {
        'Authorization': `Bearer ${loginResult.data.token}`
      });
      console.log(`   Status: ${meResult.status}`);
      console.log(`   Response:`, meResult.data);
      console.log('');
    }
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
