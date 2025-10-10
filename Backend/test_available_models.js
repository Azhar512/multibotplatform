import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(apiKey);

// List of popular conversational models to test
const modelsToTest = [
  // Mistral models
  'mistralai/Mistral-7B-Instruct-v0.1',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'mistralai/Mistral-7B-Instruct-v0.3',
  
  // Meta Llama models
  'meta-llama/Llama-2-7b-chat-hf',
  'meta-llama/Llama-3-8B-Instruct',
  'meta-llama/Meta-Llama-3-8B-Instruct',
  
  // Google T5/Flan models
  'google/flan-t5-small',
  'google/flan-t5-base',
  'google/flan-t5-large',
  'google/flan-t5-xl',
  
  // GPT models
  'openai-community/gpt2',
  'openai-community/gpt2-medium',
  'gpt2',
  'distilgpt2',
  
  // Facebook OPT models
  'facebook/opt-125m',
  'facebook/opt-350m',
  'facebook/opt-1.3b',
  'facebook/opt-2.7b',
  
  // Bloom models
  'bigscience/bloom-560m',
  'bigscience/bloom-1b1',
  'bigscience/bloom-1b7',
  
  // EleutherAI models
  'EleutherAI/gpt-neo-125m',
  'EleutherAI/gpt-neo-1.3B',
  'EleutherAI/gpt-neo-2.7B',
  'EleutherAI/gpt-j-6b',
  
  // Falcon models
  'tiiuae/falcon-7b-instruct',
  'tiiuae/falcon-7b',
  
  // MPT models
  'mosaicml/mpt-7b-instruct',
  'mosaicml/mpt-7b-chat',
  
  // Zephyr models
  'HuggingFaceH4/zephyr-7b-beta',
  'HuggingFaceH4/zephyr-7b-alpha',
  
  // Phi models
  'microsoft/phi-2',
  'microsoft/phi-1_5',
  
  // Qwen models
  'Qwen/Qwen-7B-Chat',
  'Qwen/Qwen-1_8B-Chat',
];

async function testModel(modelName) {
  console.log(`\n🧪 Testing: ${modelName}`);
  
  try {
    const startTime = Date.now();
    const response = await hf.textGeneration({
      model: modelName,
      inputs: 'Hello, how are you?',
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
        return_full_text: false,
      },
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response && response.generated_text) {
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${response.generated_text.substring(0, 100)}...`);
      console.log(`   Duration: ${duration}ms`);
      return { success: true, model: modelName, response: response.generated_text, duration };
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
  console.log('🚀 Starting HuggingFace Inference API Model Test');
  console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);
  console.log(`📊 Testing ${modelsToTest.length} models...\n`);
  
  const results = [];
  
  for (const model of modelsToTest) {
    const result = await testModel(model);
    results.push(result);
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 ===== TEST RESULTS SUMMARY =====');
  console.log(`✅ Working models: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed models: ${results.filter(r => !r.success).length}`);
  
  console.log('\n✅ WORKING MODELS:');
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
    'working_models.json',
    JSON.stringify(results.filter(r => r.success), null, 2)
  );
  
  console.log('\n✅ Working models saved to working_models.json');
}

main().catch(console.error);

