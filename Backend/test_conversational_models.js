import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(apiKey);

// Models that support conversational task
const conversationalModels = [
  'mistralai/Mistral-7B-Instruct-v0.2',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'meta-llama/Meta-Llama-3-8B-Instruct',
  'HuggingFaceH4/zephyr-7b-beta',
  'HuggingFaceH4/zephyr-7b-alpha',
  'microsoft/DialoGPT-medium',
  'microsoft/DialoGPT-small',
  'microsoft/DialoGPT-large',
  'facebook/blenderbot-400M-distill',
  'facebook/blenderbot-1B-distill',
  'facebook/blenderbot-3B',
];

async function testConversationalModel(modelName) {
  console.log(`\n🧪 Testing: ${modelName}`);
  
  try {
    const startTime = Date.now();
    
    // Use conversational API for chat models
    const response = await hf.conversational({
      model: modelName,
      inputs: {
        text: 'Hello, how are you?',
      },
      parameters: {
        max_length: 100,
        temperature: 0.7,
      },
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response && response.generated_text) {
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${response.generated_text.substring(0, 100)}...`);
      console.log(`   Duration: ${duration}ms`);
      return { success: true, model: modelName, response: response.generated_text, duration, type: 'conversational' };
    } else {
      console.log(`❌ FAILED: ${modelName} - No generated text`);
      return { success: false, model: modelName, error: 'No generated text' };
    }
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, model: modelName, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Conversational Models on HuggingFace');
  console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);
  console.log(`📊 Testing ${conversationalModels.length} conversational models...\n`);
  
  const results = [];
  
  for (const model of conversationalModels) {
    const result = await testConversationalModel(model);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 ===== TEST RESULTS SUMMARY =====');
  console.log(`✅ Working models: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed models: ${results.filter(r => !r.success).length}`);
  
  console.log('\n✅ WORKING CONVERSATIONAL MODELS:');
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
    'working_conversational_models.json',
    JSON.stringify(results.filter(r => r.success), null, 2)
  );
  
  console.log('\n✅ Working conversational models saved to working_conversational_models.json');
}

main().catch(console.error);

