// Setup and start script for CallSync Backend
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CallSync Backend Setup and Start\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# CallSync Backend Environment Configuration

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/callsync

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_${Date.now()}

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API Keys (Optional - some features require these)
# OPENAI_API_KEY=your_openai_api_key_here
# DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Twilio Configuration (Optional - for voice features)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
# TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Additional Configuration
LOG_LEVEL=info`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the API keys in .env file if you want to use AI features.\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if MongoDB is running
console.log('🔍 Checking MongoDB connection...');
try {
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('✅ MongoDB is running and accessible\n');
  await client.close();
} catch (error) {
  console.log('❌ MongoDB connection failed:', error.message);
  console.log('📋 Please make sure MongoDB is running:');
  console.log('   1. Install MongoDB if not installed');
  console.log('   2. Start MongoDB service');
  console.log('   3. Run this script again\n');
  process.exit(1);
}

// Start the server
console.log('🚀 Starting the server...');
try {
  const { spawn } = await import('child_process');
  
  const serverProcess = spawn('node', ['start-server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });

} catch (error) {
  console.error('❌ Error starting server:', error);
  process.exit(1);
}
