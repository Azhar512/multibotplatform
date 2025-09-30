// Simple test script to verify API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testEndpoints = async () => {
  console.log('🧪 Testing API endpoints...\n');

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData.status);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }

  // Test DeepSeek endpoint
  try {
    const deepseekResponse = await fetch(`${BASE_URL}/deepseek/health`);
    const deepseekData = await deepseekResponse.json();
    console.log('✅ DeepSeek endpoint:', deepseekData.status);
  } catch (error) {
    console.log('❌ DeepSeek endpoint failed:', error.message);
  }

  // Test BERT endpoint
  try {
    const bertResponse = await fetch(`${BASE_URL}/bert/health`);
    const bertData = await bertResponse.json();
    console.log('✅ BERT endpoint:', bertData.status);
  } catch (error) {
    console.log('❌ BERT endpoint failed:', error.message);
  }

  // Test OpenAI endpoint
  try {
    const openaiResponse = await fetch(`${BASE_URL}/openai/health`);
    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI endpoint:', openaiData.status);
  } catch (error) {
    console.log('❌ OpenAI endpoint failed:', error.message);
  }

  console.log('\n🎉 Endpoint testing completed!');
};

testEndpoints().catch(console.error);
