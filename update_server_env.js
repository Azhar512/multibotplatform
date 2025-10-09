// Script to update server environment variables
const fs = require('fs');

console.log('🔧 UPDATING SERVER ENVIRONMENT VARIABLES');
console.log('========================================');

const huggingfaceToken = '[YOUR_HUGGINGFACE_TOKEN_HERE]';

const envContent = `# Environment Variables for MultiBot Platform
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/multibotplatform

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# API Keys
OPENAI_API_KEY=sk-test-key
DEEPSEEK_API_KEY=your_deepseek_api_key_here
HUGGINGFACE_API_KEY=${huggingfaceToken}

# Frontend URL
FRONTEND_URL=http://168.231.114.68:3000

# CORS Origins
CORS_ORIGINS=http://168.231.114.68:3000,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log`;

const instructions = `
=== UPDATE SERVER ENVIRONMENT ===

1. SSH to your server:
   ssh root@168.231.114.68

2. Navigate to the Backend directory:
   cd /var/www/multibotplatform/Backend/

3. Edit the .env file:
   nano .env

4. Add or update this line:
   HUGGINGFACE_API_KEY=${huggingfaceToken}

5. Save the file (Ctrl+X, then Y, then Enter)

6. Restart the backend:
   pm2 restart multibot-backend

7. Check the logs:
   pm2 logs multibot-backend

=== COMPLETE .env FILE CONTENT ===
${envContent}
`;

// Save instructions
fs.writeFileSync('update_env_instructions.txt', instructions);

console.log('✅ Created update_env_instructions.txt');
console.log('📋 Follow the instructions to update your server environment');
console.log('🔑 HuggingFace Token:', huggingfaceToken);
