# Test working chatbot
Write-Host "Testing working chatbot..." -ForegroundColor Green

$questions = @(
    "capital of pakistan",
    "what is 2+2", 
    "prime minister of india",
    "hello"
)

foreach ($question in $questions) {
    Write-Host "`nQuestion: $question" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://168.231.114.68:5000/api/bert/response" -Method POST -ContentType "application/json" -Body "{`"message`":`"$question`",`"personality`":{`"Empathy`":50,`"Assertiveness`":50,`"Humour`":50,`"Patience`":50,`"Confidence`":50},`"model`":`"bert-base-uncased`"}" -TimeoutSec 30
        
        Write-Host "Answer: $($response.botResponse)" -ForegroundColor Green
        Write-Host "Model: $($response.effectiveModel)" -ForegroundColor Yellow
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
