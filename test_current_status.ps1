# Test current server status
Write-Host "🧪 TESTING CURRENT SERVER STATUS" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body (@{
        message = "prime minister of india"
        personality = @{
            Empathy = 50
            Assertiveness = 50
            Humour = 50
            Patience = 50
            Confidence = 50
        }
        model = "bert-base-uncased"
    } | ConvertTo-Json)
    
    Write-Host "✅ Server is responding" -ForegroundColor Green
    Write-Host "📝 Current Response: $($response.botResponse)" -ForegroundColor Cyan
    Write-Host "🔍 Model: $($response.effectiveModel)" -ForegroundColor Cyan
    Write-Host "📊 Confidence: $($response.confidence)" -ForegroundColor Cyan
    
    if ($response.botResponse -like "*Narendra Modi*") {
        Write-Host "🎉 SUCCESS! Enhanced AI service is working!" -ForegroundColor Green
    } else {
        Write-Host "❌ PROBLEM: Still getting generic responses" -ForegroundColor Red
        Write-Host "🔧 Need to deploy enhanced AI service to server" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Server error: $($_.Exception.Message)" -ForegroundColor Red
}
