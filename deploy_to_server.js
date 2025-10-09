// Simple deployment script using Node.js
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING ENHANCED AI SERVICE TO SERVER');
console.log('==========================================');

const serverIP = '168.231.114.68';
const localFile = 'Backend/src/services/enhancedAIService.js';
const remotePath = '/var/www/multibotplatform/Backend/src/services/enhancedAIService.js';

// Check if file exists
if (fs.existsSync(localFile)) {
    console.log('✅ Local file found:', localFile);
    
    // Read the file content
    const fileContent = fs.readFileSync(localFile, 'utf8');
    
    // Create deployment instructions
    const instructions = `
=== DEPLOYMENT INSTRUCTIONS ===

1. SSH to your server:
   ssh root@${serverIP}

2. Navigate to the services directory:
   cd /var/www/multibotplatform/Backend/src/services/

3. Backup the current file (optional):
   cp enhancedAIService.js enhancedAIService.js.backup

4. Create/Edit the enhanced AI service file:
   nano enhancedAIService.js

5. Copy and paste the following content:
   (The file content will be shown below)

6. Save the file (Ctrl+X, then Y, then Enter)

7. Restart the backend:
   pm2 restart multibot-backend

8. Check the logs:
   pm2 logs multibot-backend

=== FILE CONTENT ===
${fileContent}
`;

    // Save instructions to file
    fs.writeFileSync('deployment_instructions.txt', instructions);
    
    console.log('📁 Created deployment_instructions.txt');
    console.log('📋 Follow the instructions in the file to deploy');
    console.log('🔧 Or manually copy the file content to your server');
    
} else {
    console.log('❌ Local file not found:', localFile);
    console.log('Please make sure the file exists in the correct location.');
}
