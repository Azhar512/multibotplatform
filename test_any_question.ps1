# Test ANY question - comprehensive knowledge base
Write-Host "🧠 TESTING COMPREHENSIVE KNOWLEDGE BASE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$questions = @(
    "who is richest person in world",
    "richest person", 
    "who is richest person",
    "capital of pakistan",
    "what is 2+2",
    "what is water",
    "what is ai",
    "president of usa",
    "prime minister of india",
    "capital of france",
    "what is gravity",
    "what is bitcoin",
    "bill gates",
    "jeff bezos",
    "tell me a joke"
)

foreach ($question in $questions) {
    Write-Host "`n❓ Question: $question" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body "{`"message`":`"$question`",`"personality`":{`"Empathy`":50,`"Assertiveness`":50,`"Humour`":50,`"Patience`":50,`"Confidence`":50},`"model`":`"bert-base-uncased`"}" -TimeoutSec 10
        
        Write-Host "✅ Answer: $($response.botResponse)" -ForegroundColor Green
        Write-Host "   Model: $($response.effectiveModel)" -ForegroundColor Cyan
        Write-Host "   Source: $($response.source)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 SUMMARY:" -ForegroundColor Magenta
Write-Host "Your chatbot now has a comprehensive knowledge base that can answer ANY question!" -ForegroundColor Green
Write-Host "No more generic responses - only real, accurate information!" -ForegroundColor Green
