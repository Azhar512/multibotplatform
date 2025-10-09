# Deploy Enhanced AI Service to Server
$serverIP = "168.231.114.68"
$localFile = "Backend\src\services\enhancedAIService.js"
$remotePath = "/var/www/multibotplatform/Backend/src/services/enhancedAIService.js"

Write-Host "Deploying Enhanced AI Service to Server..." -ForegroundColor Green
Write-Host "Server: $serverIP" -ForegroundColor Cyan
Write-Host "Local File: $localFile" -ForegroundColor Cyan
Write-Host "Remote Path: $remotePath" -ForegroundColor Cyan

# Check if local file exists
if (Test-Path $localFile) {
    Write-Host "✅ Local file found: $localFile" -ForegroundColor Green
    
    # Read the file content
    $fileContent = Get-Content $localFile -Raw -Encoding UTF8
    
    # Create a temporary file for transfer
    $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
    $fileContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    Write-Host "📁 File content prepared for transfer" -ForegroundColor Yellow
    
    # Create SCP command
    $scpCommand = "scp `"$tempFile`" root@$serverIP`:$remotePath"
    
    Write-Host "`n🚀 Ready to deploy! Run this command:" -ForegroundColor Yellow
    Write-Host $scpCommand -ForegroundColor Cyan
    
    Write-Host "`n📋 After deployment, run these commands on the server:" -ForegroundColor Yellow
    Write-Host "1. pm2 restart multibot-backend" -ForegroundColor White
    Write-Host "2. pm2 logs multibot-backend" -ForegroundColor White
    
    # Clean up temp file
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
} else {
    Write-Host "❌ Local file not found: $localFile" -ForegroundColor Red
    Write-Host "Please make sure the file exists in the correct location." -ForegroundColor Yellow
}

Write-Host "`n🔧 Alternative: Manual Copy Method" -ForegroundColor Yellow
Write-Host "1. Open the file: $localFile" -ForegroundColor White
Write-Host "2. Copy all content (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "3. SSH to server: ssh root@$serverIP" -ForegroundColor White
Write-Host "4. Edit file: nano $remotePath" -ForegroundColor White
Write-Host "5. Paste content and save (Ctrl+X, Y, Enter)" -ForegroundColor White
Write-Host "6. Restart: pm2 restart multibot-backend" -ForegroundColor White
