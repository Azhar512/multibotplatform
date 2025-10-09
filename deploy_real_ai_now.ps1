# Deploy REAL AI service to server - NO MORE MOCK DATA!
$serverIP = "168.231.114.68"
$huggingfaceToken = "[YOUR_HUGGINGFACE_TOKEN_HERE]"

Write-Host "🚀 DEPLOYING REAL AI SERVICE - NO MORE MOCK DATA!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Read the real-time AI service content
$realTimeAIServicePath = "Backend\src\services\realTimeAIService.js"
if (Test-Path $realTimeAIServicePath) {
    $fileContent = Get-Content $realTimeAIServicePath -Raw -Encoding UTF8
    
    Write-Host "✅ Real-Time AI Service file found" -ForegroundColor Green
    Write-Host "📋 Creating deployment commands..." -ForegroundColor Yellow
    
    # Create the exact commands to run on server
    $serverCommands = @"
# DEPLOY REAL AI SERVICE - NO MORE MOCK DATA!

# 1. SSH to server
ssh root@$serverIP

# 2. Navigate to services directory
cd /var/www/multibotplatform/Backend/src/services/

# 3. Create real-time AI service file
cat > realTimeAIService.js << 'EOF'
$fileContent
EOF

# 4. Update environment variables
cd /var/www/multibotplatform/Backend/
echo "HUGGINGFACE_API_KEY=[YOUR_HUGGINGFACE_TOKEN_HERE]" >> .env

# 5. Restart backend
pm2 restart multibot-backend

# 6. Test REAL AI response
curl -X POST http://168.231.114.68:5000/api/bert/response -H "Content-Type: application/json" -d '{"message":"who is prime minister of india","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}'
"@

    # Save the commands
    $serverCommands | Out-File -FilePath "DEPLOY_REAL_AI_NOW.txt" -Encoding UTF8
    
    Write-Host "📁 Created DEPLOY_REAL_AI_NOW.txt with exact commands" -ForegroundColor Green
    Write-Host "🔑 HuggingFace Token: $huggingfaceToken" -ForegroundColor Cyan
    
    Write-Host "`n🚀 IMMEDIATE ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "1. Open DEPLOY_REAL_AI_NOW.txt" -ForegroundColor Yellow
    Write-Host "2. Copy all commands" -ForegroundColor Yellow
    Write-Host "3. Run them on your server" -ForegroundColor Yellow
    Write-Host "4. Test for REAL AI responses!" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Real-Time AI Service file not found!" -ForegroundColor Red
}
