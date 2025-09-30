// Environment configuration checker
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'DEEPSEEK_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'FRONTEND_URL'
];

console.log('🔍 Checking environment configuration...\n');

// Check required variables
console.log('✅ Required Environment Variables:');
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
  }
});

console.log('\n🔧 Optional Environment Variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (some features may not work)`);
  }
});

console.log('\n📋 Configuration Summary:');
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Missing'}`);
console.log(`  JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
console.log(`  OpenAI API: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
console.log(`  DeepSeek API: ${process.env.DEEPSEEK_API_KEY ? 'Set' : 'Not set'}`);
console.log(`  Twilio: ${process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set'}`);

console.log('\n🎉 Environment check completed!');
