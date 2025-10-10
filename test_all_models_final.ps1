# Test all models after server update
Write-Host "🧪 TESTING ALL MODELS AFTER CLEANUP" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test BERT Model
Write-Host "`n1. Testing BERT Model..." -ForegroundColor Yellow
try {
    $bertResponse = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body '{"message":"who is prime minister of india","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50},"model":"bert-base-uncased"}' -TimeoutSec 30
    Write-Host "✅ BERT Response:" -ForegroundColor Green
    Write-Host "   Response: $($bertResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "   Model: $($bertResponse.effectiveModel)" -ForegroundColor Cyan
    Write-Host "   Source: $($bertResponse.source)" -ForegroundColor Cyan
    Write-Host "   Confidence: $($bertResponse.confidence)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ BERT Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test DeepSeek Model
Write-Host "`n2. Testing DeepSeek Model..." -ForegroundColor Yellow
try {
    $deepseekResponse = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/deepseek/response" -Method POST -ContentType "application/json" -Body '{"message":"what is 2+2","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50}}' -TimeoutSec 30
    Write-Host "✅ DeepSeek Response:" -ForegroundColor Green
    Write-Host "   Response: $($deepseekResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "   Model: $($deepseekResponse.effectiveModel)" -ForegroundColor Cyan
    Write-Host "   Source: $($deepseekResponse.source)" -ForegroundColor Cyan
    Write-Host "   Confidence: $($deepseekResponse.confidence)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ DeepSeek Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test OpenAI Model
Write-Host "`n3. Testing OpenAI Model..." -ForegroundColor Yellow
try {
    $openaiResponse = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/openai/response" -Method POST -ContentType "application/json" -Body '{"message":"capital of france","personality":{"Empathy":50,"Assertiveness":50,"Humour":50,"Patience":50,"Confidence":50}}' -TimeoutSec 30
    Write-Host "✅ OpenAI Response:" -ForegroundColor Green
    Write-Host "   Response: $($openaiResponse.botResponse)" -ForegroundColor Cyan
    Write-Host "   Model: $($openaiResponse.effectiveModel)" -ForegroundColor Cyan
    Write-Host "   Source: $($openaiResponse.source)" -ForegroundColor Cyan
    Write-Host "   Confidence: $($openaiResponse.confidence)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ OpenAI Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 ANALYSIS:" -ForegroundColor Magenta
Write-Host "✅ If you see 'source: huggingface' - BERT and DeepSeek are using real HuggingFace API" -ForegroundColor Green
Write-Host "✅ If you see 'source: openai' - OpenAI is using real OpenAI API" -ForegroundColor Green
Write-Host "❌ If you see 'effectiveModel: contextual' - Models are using fallback responses" -ForegroundColor Red
Write-Host "❌ If you see generic responses - Models are not using real AI APIs" -ForegroundColor Red

Write-Host "`n🚀 EXPECTED RESULTS:" -ForegroundColor Yellow
Write-Host "- BERT: Real HuggingFace API responses with 'source: huggingface'" -ForegroundColor White
Write-Host "- DeepSeek: Real HuggingFace API responses with 'source: huggingface'" -ForegroundColor White
Write-Host "- OpenAI: Real OpenAI API responses with 'source: openai' (if API key valid)" -ForegroundColor White
