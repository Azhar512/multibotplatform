# Script to update server files
$serverPath = "C:\Users\speed\Desktop\multibotplatform\Backend\src\services\enhancedAIService.js"
$remotePath = "/var/www/multibotplatform/Backend/src/services/enhancedAIService.js"

Write-Host "Updating enhanced AI service on server..." -ForegroundColor Green

# Read the local file
$fileContent = Get-Content $serverPath -Raw

# Create a temporary file with the content
$tempFile = [System.IO.Path]::GetTempFileName()
$fileContent | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "File content prepared. Please manually copy the enhancedAIService.js file to the server." -ForegroundColor Yellow
Write-Host "Local file: $serverPath" -ForegroundColor Cyan
Write-Host "Remote path: $remotePath" -ForegroundColor Cyan

# Clean up
Remove-Item $tempFile
