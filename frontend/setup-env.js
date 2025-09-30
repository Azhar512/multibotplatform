// Setup environment configuration for frontend
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up Frontend Environment Configuration...\n');

// Get the current IP address (you can modify this)
const backendIP = '168.231.114.68'; // Change this to your actual backend IP
const backendPort = '5000';
const frontendPort = '3000';

const envContent = `# CallSync Frontend Environment Configuration

# Backend API URL - Change this to match your backend server
REACT_APP_API_URL=http://${backendIP}:${backendPort}

# Frontend URL (for reference)
REACT_APP_FRONTEND_URL=http://${backendIP}:${frontendPort}

# Socket.io URL for real-time features
REACT_APP_SOCKET_URL=http://${backendIP}:${backendPort}
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log(`📡 Backend API URL: http://${backendIP}:${backendPort}`);
  console.log(`🌐 Frontend URL: http://${backendIP}:${frontendPort}`);
  console.log('\n⚠️  IMPORTANT: You must restart your frontend server for changes to take effect!');
  console.log('   Run: npm start (or yarn start)');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Please create the .env file manually with this content:');
  console.log('---');
  console.log(envContent);
  console.log('---');
}
