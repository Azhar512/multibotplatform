# Test script for all AI models
$baseUrl = "http://168.231.114.68:5000"
$testMessage = "what is the capital of france"
$personality = @{
    Empathy = 50
    Assertiveness = 50
    Humour = 50
    Patience = 50
    Confidence = 50
}

Write-Host "Testing all AI models..." -ForegroundColor Green

# Test BERT
Write-Host "`n1. Testing BERT Model..." -ForegroundColor Yellow
try {
    $bertResponse = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body (@{
        message = $testMessage
        personality = $personality
        model = "bert-base-uncased"
    } | ConvertTo-Json)
    Write-Host "BERT Response: $($bertResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "Confidence: $($bertResponse.confidence)" -ForegroundColor Cyan
    Write-Host "Model: $($bertResponse.effectiveModel)" -ForegroundColor Cyan
} catch {
    Write-Host "BERT Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test OpenAI
Write-Host "`n2. Testing OpenAI Model..." -ForegroundColor Yellow
try {
    $openaiResponse = Invoke-RestMethod -Uri "$baseUrl/api/openai/response" -Method POST -ContentType "application/json" -Body (@{
        message = $testMessage
        personality = $personality
        model = "gpt-3.5-turbo"
    } | ConvertTo-Json)
    Write-Host "OpenAI Response: $($openaiResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "Confidence: $($openaiResponse.confidence)" -ForegroundColor Cyan
    Write-Host "Model: $($openaiResponse.model)" -ForegroundColor Cyan
} catch {
    Write-Host "OpenAI Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test DeepSeek
Write-Host "`n3. Testing DeepSeek Model..." -ForegroundColor Yellow
try {
    $deepseekResponse = Invoke-RestMethod -Uri "$baseUrl/api/deepseek/response" -Method POST -ContentType "application/json" -Body (@{
        message = $testMessage
        personality = $personality
        model = "deepseek-chat"
    } | ConvertTo-Json)
    Write-Host "DeepSeek Response: $($deepseekResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "Confidence: $($deepseekResponse.confidence)" -ForegroundColor Cyan
    Write-Host "Model: $($deepseekResponse.model)" -ForegroundColor Cyan
} catch {
    Write-Host "DeepSeek Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test General Bot Chat
Write-Host "`n4. Testing General Bot Chat..." -ForegroundColor Yellow
try {
    $botResponse = Invoke-RestMethod -Uri "$baseUrl/api/bot/chat" -Method POST -ContentType "application/json" -Body (@{
        message = $testMessage
        personality = $personality
        config = @{
            responseDelay = 1000
            enableVoice = $false
            enableTextToSpeech = $false
            enableSentiment = $false
            language = "en-US"
        }
    } | ConvertTo-Json)
    Write-Host "Bot Response: $($botResponse.data.response)" -ForegroundColor Cyan
    Write-Host "Confidence: $($botResponse.data.confidence)" -ForegroundColor Cyan
    Write-Host "Model: $($botResponse.data.model)" -ForegroundColor Cyan
} catch {
    Write-Host "Bot Chat Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting completed!" -ForegroundColor Green
