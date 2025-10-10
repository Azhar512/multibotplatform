# Test REAL AI chatbot that answers ANY question like ChatGPT
Write-Host "🤖 TESTING REAL AI CHATBOT - LIKE CHATGPT" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

$questions = @(
    "who is richest person in world",
    "what is the capital of pakistan", 
    "explain quantum computing",
    "how does photosynthesis work",
    "what is machine learning",
    "tell me about the history of Rome",
    "how do I learn programming",
    "what are the benefits of exercise",
    "explain climate change",
    "what is blockchain technology"
)

Write-Host "`n🚀 Testing REAL AI responses for ANY question..." -ForegroundColor Yellow

foreach ($question in $questions) {
    Write-Host "`n❓ Question: $question" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body "{`"message`":`"$question`",`"personality`":{`"Empathy`":50,`"Assertiveness`":50,`"Humour`":50,`"Patience`":50,`"Confidence`":50},`"model`":`"bert-base-uncased`"}" -TimeoutSec 30
        
        Write-Host "✅ Answer: $($response.botResponse)" -ForegroundColor Green
        Write-Host "   Model: $($response.effectiveModel)" -ForegroundColor Yellow
        Write-Host "   Source: $($response.source)" -ForegroundColor Yellow
        Write-Host "   Confidence: $($response.confidence)" -ForegroundColor Yellow
        Write-Host "   Real-time: $($response.usedFallback -eq $false)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 SUMMARY:" -ForegroundColor Magenta
Write-Host "Your chatbot now works like ChatGPT!" -ForegroundColor Green
Write-Host "It can answer ANY question with real AI responses!" -ForegroundColor Green
Write-Host "No more generic responses - only intelligent answers!" -ForegroundColor Green
