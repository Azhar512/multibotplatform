# Simple deployment script
$serverIP = "168.231.114.68"
$localFile = "Backend\src\services\enhancedAIService.js"
$remotePath = "/var/www/multibotplatform/Backend/src/services/enhancedAIService.js"

Write-Host "=== DEPLOY ENHANCED AI SERVICE ===" -ForegroundColor Green
Write-Host "Server: $serverIP" -ForegroundColor Cyan

if (Test-Path $localFile) {
    Write-Host "✅ File found: $localFile" -ForegroundColor Green
    
    # Create the file content for manual copy
    $fileContent = Get-Content $localFile -Raw -Encoding UTF8
    
    # Save to a file that can be easily copied
    $outputFile = "enhancedAIService_for_server.js"
    $fileContent | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host "📁 Created: $outputFile" -ForegroundColor Yellow
    Write-Host "`n🚀 DEPLOYMENT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Copy the file: $outputFile" -ForegroundColor White
    Write-Host "2. Upload to server at: $remotePath" -ForegroundColor White
    Write-Host "3. SSH to server and run: pm2 restart multibot-backend" -ForegroundColor White
    
} else {
    Write-Host "❌ File not found: $localFile" -ForegroundColor Red
}
