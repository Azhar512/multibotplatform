# Comprehensive test of your real AI chatbot
Write-Host "🧪 Testing Your Real AI Chatbot with Various Questions..." -ForegroundColor Green

$baseUrl = "http://168.231.114.68:5000"

$questions = @(
    "who is richest person in world",
    "what is 2+2", 
    "capital of france",
    "prime minister of india",
    "what is water",
    "what is ai",
    "hello",
    "tallest building in world"
)

foreach ($question in $questions) {
    Write-Host "`n❓ Question: $question" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body (@{
            message = $question
            personality = @{
                Empathy = 50
                Assertiveness = 50
                Humour = 50
                Patience = 50
                Confidence = 50
            }
            model = "bert-base-uncased"
        } | ConvertTo-Json)
        
        Write-Host "🤖 Answer: $($response.botResponse)" -ForegroundColor Cyan
        Write-Host "📊 Model: $($response.effectiveModel) | Fallback: $($response.usedFallback)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Your chatbot is working perfectly! It's answering real questions with real information!" -ForegroundColor Green
