# Test script to verify all services are using REAL HuggingFace API
Write-Host "🧪 Testing REAL HuggingFace API integration..." -ForegroundColor Green

$baseUrl = "http://168.231.114.68:5000"

# Test BERT service
Write-Host "`n🤖 Testing BERT Service with REAL HuggingFace API..." -ForegroundColor Yellow
$bertResponse = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body '{
    "message": "who is prime minister of india",
    "personality": {"Empathy": 50, "Assertiveness": 50, "Humour": 50, "Patience": 50, "Confidence": 50},
    "model": "bert-base-uncased"
}'

Write-Host "BERT Response: $($bertResponse.botResponse)" -ForegroundColor Cyan
Write-Host "Effective Model: $($bertResponse.effectiveModel)" -ForegroundColor Cyan
Write-Host "Source: $($bertResponse.source)" -ForegroundColor Cyan
Write-Host "Used Fallback: $($bertResponse.usedFallback)" -ForegroundColor Cyan

# Test DeepSeek service
Write-Host "`n🤖 Testing DeepSeek Service with REAL HuggingFace API..." -ForegroundColor Yellow
$deepseekResponse = Invoke-RestMethod -Uri "$baseUrl/api/deepseek/response" -Method POST -ContentType "application/json" -Body '{
    "message": "what is 2+2",
    "personality": {"Empathy": 50, "Assertiveness": 50, "Humour": 50, "Patience": 50, "Confidence": 50}
}'

Write-Host "DeepSeek Response: $($deepseekResponse.botResponse)" -ForegroundColor Cyan
Write-Host "Model: $($deepseekResponse.model)" -ForegroundColor Cyan
Write-Host "Provider: $($deepseekResponse.provider)" -ForegroundColor Cyan
Write-Host "Is Real Time: $($deepseekResponse.isRealTime)" -ForegroundColor Cyan

# Test OpenAI service
Write-Host "`n🤖 Testing OpenAI Service with REAL APIs..." -ForegroundColor Yellow
$openaiResponse = Invoke-RestMethod -Uri "$baseUrl/api/openai/response" -Method POST -ContentType "application/json" -Body '{
    "message": "capital of france",
    "personality": {"Empathy": 50, "Assertiveness": 50, "Humour": 50, "Patience": 50, "Confidence": 50}
}'

Write-Host "OpenAI Response: $($openaiResponse.botResponse)" -ForegroundColor Cyan
Write-Host "Model: $($openaiResponse.model)" -ForegroundColor Cyan
Write-Host "Source: $($openaiResponse.source)" -ForegroundColor Cyan
Write-Host "Used Fallback: $($openaiResponse.usedFallback)" -ForegroundColor Cyan

Write-Host "`n✅ All services tested! Check the logs above to see if they're using REAL APIs." -ForegroundColor Green
Write-Host "Look for 'HuggingFace API success' or 'OpenAI API success' messages in the server logs." -ForegroundColor Green
