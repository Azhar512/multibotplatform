# Copy enhanced AI service content to clipboard
$filePath = "Backend\src\services\enhancedAIService.js"

if (Test-Path $filePath) {
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $content | Set-Clipboard
    Write-Host "✅ Enhanced AI Service content copied to clipboard!" -ForegroundColor Green
    Write-Host "📋 You can now paste it directly into nano on your server" -ForegroundColor Yellow
    Write-Host "📁 File: $filePath" -ForegroundColor Cyan
    Write-Host "📏 Content length: $($content.Length) characters" -ForegroundColor Cyan
} else {
    Write-Host "❌ File not found: $filePath" -ForegroundColor Red
}
