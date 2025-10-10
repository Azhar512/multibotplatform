import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(apiKey);

// Models that support chat completion
const chatModels = [
  'mistralai/Mistral-7B-Instruct-v0.2',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'meta-llama/Meta-Llama-3-8B-Instruct',
  'HuggingFaceH4/zephyr-7b-beta',
  'HuggingFaceH4/zephyr-7b-alpha',
  'microsoft/DialoGPT-medium',
  'microsoft/DialoGPT-small',
  'tiiuae/falcon-7b-instruct',
  'google/gemma-7b-it',
  'google/gemma-2b-it',
];

async function testChatModel(modelName) {
  console.log(`\n🧪 Testing: ${modelName}`);
  
  try {
    const startTime = Date.now();
    
    // Use chatCompletion API for chat models
    const response = await hf.chatCompletion({
      model: modelName,
      messages: [
        {
          role: "user",
          content: "Hello, how are you?"
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      const messageContent = response.choices[0].message.content;
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${messageContent.substring(0, 100)}...`);
      console.log(`   Duration: ${duration}ms`);
      return { 
        success: true, 
        model: modelName, 
        response: messageContent, 
        duration, 
        type: 'chatCompletion' 
      };
    } else {
      console.log(`❌ FAILED: ${modelName} - No message content`);
      return { success: false, model: modelName, error: 'No message content' };
    }
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, model: modelName, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Chat Completion Models on HuggingFace');
  console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);
  console.log(`📊 Testing ${chatModels.length} chat models...\n`);
  
  const results = [];
  
  for (const model of chatModels) {
    const result = await testChatModel(model);
    results.push(result);
    
    // Add a delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 ===== TEST RESULTS SUMMARY =====');
  console.log(`✅ Working models: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed models: ${results.filter(r => !r.success).length}`);
  
  console.log('\n✅ WORKING CHAT COMPLETION MODELS:');
  results.filter(r => r.success).forEach(r => {
    console.log(`   - ${r.model} (${r.duration}ms)`);
  });
  
  console.log('\n❌ FAILED MODELS:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`   - ${r.model}: ${r.error}`);
  });
  
  // Save results to file
  const fs = await import('fs');
  fs.writeFileSync(
    'working_chat_models.json',
    JSON.stringify(results.filter(r => r.success), null, 2)
  );
  
  console.log('\n✅ Working chat models saved to working_chat_models.json');
  
  if (results.filter(r => r.success).length > 0) {
    console.log('\n🎉 SUCCESS! Found working models. Use these in your services!');
  } else {
    console.log('\n⚠️ No working models found with free HuggingFace API.');
    console.log('💡 Recommendation: Use OpenAI API or upgrade HuggingFace plan for model access.');
  }
}

main().catch(console.error);

