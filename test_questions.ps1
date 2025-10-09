# Test various questions to verify real-time answers
$baseUrl = "http://168.231.114.68:5000"
$personality = @{
    Empathy = 50
    Assertiveness = 50
    Humour = 50
    Patience = 50
    Confidence = 50
}

$testQuestions = @(
    "what is the capital of france",
    "prime minister of india", 
    "what is 2+2",
    "what is 5+5",
    "president of usa",
    "capital of pakistan",
    "what is water",
    "what is ai",
    "tell me a joke"
)

Write-Host "Testing various questions for real-time answers..." -ForegroundColor Green

foreach ($question in $testQuestions) {
    Write-Host "`nQuestion: $question" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body (@{
            message = $question
            personality = $personality
            model = "bert-base-uncased"
        } | ConvertTo-Json)
        
        Write-Host "Answer: $($response.botResponse)" -ForegroundColor Cyan
        Write-Host "Source: $($response.effectiveModel)" -ForegroundColor Green
        Write-Host "Confidence: $($response.confidence)" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
