# Direct deployment script for server
$serverIP = "168.231.114.68"
$huggingfaceToken = "[YOUR_HUGGINGFACE_TOKEN_HERE]"

Write-Host "🚀 DEPLOYING ENHANCED AI SERVICE TO SERVER" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Read the enhanced AI service file
$enhancedAIServicePath = "Backend\src\services\enhancedAIService.js"
if (Test-Path $enhancedAIServicePath) {
    $fileContent = Get-Content $enhancedAIServicePath -Raw -Encoding UTF8
    
    Write-Host "✅ Enhanced AI Service file found" -ForegroundColor Green
    Write-Host "📁 File size: $($fileContent.Length) characters" -ForegroundColor Cyan
    
    # Create deployment instructions
    $deploymentInstructions = @"
=== DEPLOY TO SERVER ===

1. SSH to your server:
   ssh root@$serverIP

2. Navigate to services directory:
   cd /var/www/multibotplatform/Backend/src/services/

3. Backup current file:
   cp realAIService.js realAIService.js.backup

4. Create the enhanced AI service:
   nano enhancedAIService.js
   
5. Copy and paste this content:
$fileContent

6. Save file (Ctrl+X, then Y, then Enter)

7. Update environment variables:
   cd /var/www/multibotplatform/Backend/
   nano .env
   
   Add this line:
   HUGGINGFACE_API_KEY=$huggingfaceToken

8. Restart backend:
   pm2 restart multibot-backend

9. Check logs:
   pm2 logs multibot-backend

=== TEST AFTER DEPLOYMENT ===
Run this command to test:
Invoke-RestMethod -Uri "http://$serverIP:5000/api/bert/response" -Method POST -ContentType "application/json" -Body '{"message":"prime minister of india","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}' | Select-Object botResponse, effectiveModel, confidence

Expected result:
- botResponse: "As of 2024, the Prime Minister of India is Narendra Modi."
- effectiveModel: "knowledge-base"
- confidence: 0.9
"@

    # Save deployment instructions
    $deploymentInstructions | Out-File -FilePath "DEPLOY_TO_SERVER_NOW.txt" -Encoding UTF8
    
    Write-Host "📋 Created DEPLOY_TO_SERVER_NOW.txt with complete instructions" -ForegroundColor Yellow
    Write-Host "🔑 HuggingFace Token: $huggingfaceToken" -ForegroundColor Green
    Write-Host "`n🚀 Follow the instructions in DEPLOY_TO_SERVER_NOW.txt to deploy!" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Enhanced AI Service file not found: $enhancedAIServicePath" -ForegroundColor Red
}
