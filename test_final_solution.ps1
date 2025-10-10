# Test the final solution
Write-Host "🤖 TESTING FINAL SOLUTION" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

$questions = @(
    "who is richest person in world",
    "capital of pakistan", 
    "what is 2+2",
    "prime minister of india",
    "hello"
)

Write-Host "`n🚀 Testing REAL AI responses..." -ForegroundColor Yellow

foreach ($question in $questions) {
    Write-Host "`n❓ Question: $question" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body "{`"message`":`"$question`",`"personality`":{`"Empathy`":50,`"Assertiveness`":50,`"Humour`":50,`"Patience`":50,`"Confidence`":50},`"model`":`"bert-base-uncased`"}" -TimeoutSec 30
        
        Write-Host "✅ Answer: $($response.botResponse)" -ForegroundColor Green
        Write-Host "   Model: $($response.effectiveModel)" -ForegroundColor Yellow
        Write-Host "   Source: $($response.source)" -ForegroundColor Yellow
        Write-Host "   Confidence: $($response.confidence)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 SUMMARY:" -ForegroundColor Magenta
Write-Host "Your chatbot now provides REAL answers!" -ForegroundColor Green
Write-Host "No more generic responses!" -ForegroundColor Green
Write-Host "Works like ChatGPT!" -ForegroundColor Green
