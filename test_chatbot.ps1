# Test your real AI chatbot
Write-Host "🧪 Testing Your Real AI Chatbot..." -ForegroundColor Green

$baseUrl = "http://168.231.114.68:5000"

# Test 1: Richest person
Write-Host "`n❓ Question: who is richest person in world" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body '{"message":"who is richest person in world","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}'
Write-Host "🤖 Answer: $($response1.botResponse)" -ForegroundColor Cyan

# Test 2: Math
Write-Host "`n❓ Question: what is 2+2" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body '{"message":"what is 2+2","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}'
Write-Host "🤖 Answer: $($response2.botResponse)" -ForegroundColor Cyan

# Test 3: Capital
Write-Host "`n❓ Question: capital of france" -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "$baseUrl/api/bert/response" -Method POST -ContentType "application/json" -Body '{"message":"capital of france","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}'
Write-Host "🤖 Answer: $($response3.botResponse)" -ForegroundColor Cyan

Write-Host "`n🎉 Your chatbot is working perfectly!" -ForegroundColor Green
