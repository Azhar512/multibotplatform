import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

// Define fallback config directly in this file to avoid import issues
const FALLBACK_CONFIG = {
  name: 'gpt2',
  maxLength: 1024,
  temperature: 0.7,
  industry: 'General',
  description: 'Fallback general-purpose model',
  endpoint: 'text-generation',
  apiConfig: {
    max_new_tokens: 512,
    top_p: 0.95,
    do_sample: true,
    return_full_text: false,
    temperature: 0.7,
    repetition_penalty: 1.1
  }
};

class DeepseekService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.initializationError = null;
    this.hf = null;
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    // Use a model that exists on HuggingFace
    this.conversationModel = 'google/flan-t5-large';
    this.fallbackInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }

      if (!this.apiKey) {
        throw new Error('HUGGINGFACE_API_KEY environment variable is not set');
      }

      console.log('Initializing DeepseekService...');
      
      this.hf = new HfInference(this.apiKey);

      // Test connection with the conversation model instead of deepseek-r1
      await this.hf.textGeneration({
        model: this.conversationModel,
        inputs: 'Test connection',
        parameters: {
          max_new_tokens: 128,
          do_sample: true,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.0
        }
      });

      this.isInitialized = true;
      console.log('DeepseekService initialized successfully');
      return true;
    } catch (error) {
      // Try to initialize with fallback model if primary fails
      try {
        console.log(`Primary model initialization failed. Trying fallback model ${FALLBACK_CONFIG.name}...`);
        
        await this.hf.textGeneration({
          model: FALLBACK_CONFIG.name,  // Use the fallback model name from config
          inputs: 'Test connection',
          parameters: FALLBACK_CONFIG.apiConfig
        });
        
        // If fallback succeeds, mark as partially initialized
        this.conversationModel = FALLBACK_CONFIG.name;
        this.fallbackInitialized = true;
        this.initializationError = `Primary model failed: ${error.message}. Using fallback model.`;
        console.log('DeepseekService initialized with fallback model');
        return true;
      } catch (fallbackError) {
        // Both primary and fallback failed
        this.isInitialized = false;
        this.initializationError = `Primary error: ${error.message}. Fallback error: ${fallbackError.message}`;
        console.error('DeepseekService initialization failed completely:', this.initializationError);
        
        // Don't throw - let the service keep running with degraded functionality
        return false;
      }
    }
  }

  async generateResponse(message, personality = {}) {
    try {
      if (!this.isInitialized && !this.fallbackInitialized) {
        // Try initialization one more time
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            text: "I'm sorry, but the AI service is currently unavailable. Please try again later.",
            status: 'error',
            error: this.initializationError
          };
        }
      }

      if (!this.hf) {
        throw new Error('Service not properly initialized');
      }

      const formattedInput = this.formatInput(message, personality);
      const currentModel = this.fallbackInitialized ? FALLBACK_CONFIG.name : this.conversationModel;
      const parameters = this.fallbackInitialized ? 
        FALLBACK_CONFIG.apiConfig : 
        {
          max_new_tokens: 128,
          do_sample: true,
          temperature: this.getTemperatureFromPersonality(personality),
          top_p: 0.9,
          top_k: 50,
          repetition_penalty: 1.0
        };

      const response = await this.hf.textGeneration({
        model: currentModel,
        inputs: formattedInput,
        parameters: parameters
      });

      return {
        text: this.cleanResponse(response.generated_text),
        status: 'success',
        model: currentModel
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        text: "I'm sorry, but I encountered an error processing your request.",
        status: 'error',
        error: error.message
      };
    }
  }

  formatInput(message, personality) {
    return `Question: ${message}\nAnswer in a ${this.getPersonalityTone(personality)} tone:`;
  }

  getPersonalityTone(personality) {
    const { empathy = 70, patience = 80, confidence = 60 } = personality;
    if (empathy > 75) return 'empathetic and understanding';
    if (patience > 75) return 'patient and detailed';
    if (confidence > 75) return 'confident and direct';
    return 'balanced and professional';
  }

  getTemperatureFromPersonality(personality) {
    const { confidence = 60 } = personality;
    return 0.5 + (confidence / 200); 
  }

  cleanResponse(text) {
    return text
      .trim()
      .replace('Answer:', '')
      .replace('Response:', '')
      .trim();
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      fallbackInitialized: this.fallbackInitialized,
      error: this.initializationError,
      currentModel: this.fallbackInitialized ? FALLBACK_CONFIG.name : this.conversationModel
    };
  }
}

export default new DeepseekService();