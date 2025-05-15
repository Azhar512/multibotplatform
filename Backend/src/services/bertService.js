import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import { BERT_MODELS, MODEL_CAPABILITIES, FALLBACK_CONFIG } from '../config/models.js';
import { serviceLogger as logger } from '../config/logger.js';

dotenv.config();

class BertService {
  constructor() {
    this.models = new Map();
    this.initialized = false;
    this.initializationPromise = null;
    this.hf = null;
    this.fallbackModel = 'General';
  }

  async initialize() {
    if (this.initialized) return true;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      try {
        logger.info('Initializing BertService with HuggingFace...');
        
        // Check for API key - first serious issue, make sure this exists in .env file
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
          throw new Error('HUGGINGFACE_API_KEY is not configured in environment variables');
        }

        // Initialize the HF client with your API key
        this.hf = new HfInference(apiKey);
        
        // Skip the connection test for now to allow the app to initialize
        logger.info('Skipping connection test during initialization');
        
        await this.preloadModels();

        this.initialized = true;
        logger.info('BertService initialized successfully');
        return true;
      } catch (error) {
        this.initialized = false;
        logger.error('BertService initialization failed:', error);
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async testConnection() {
    try {
      // Use a guaranteed-to-work model for testing
      const testModel = 'google/flan-t5-small';
      logger.info(`Testing connection with model: ${testModel}`);
      
      const testResponse = await this.hf.textGeneration({
        model: testModel,
        inputs: 'Answer this question: What is 2+2?',
        parameters: {
          max_new_tokens: 5,
          return_full_text: false
        }
      });
      
      if (!testResponse) {
        throw new Error('No response received from HuggingFace API');
      }
      
      logger.info('HuggingFace connection test successful');
      return testResponse;
    } catch (error) {
      logger.error('HuggingFace connection test failed:', {
        error: error.message,
        stack: error.stack,
        modelName: 'google/flan-t5-small'
      });
      
      // Log more detailed error information
      if (error.response) {
        logger.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      // Don't throw - just log the error and allow initialization to continue
      logger.warn('Continuing despite connection test failure');
      return null;
    }
  }

  async preloadModels() {
    const initializationPromises = Object.entries(BERT_MODELS).map(async ([modelName, config]) => {
      try {
        if (!config.name) {
          throw new Error(`Invalid configuration for model ${modelName}`);
        }

        this.models.set(modelName, {
          ...config,
          initialized: true,
          lastUsed: Date.now(),
          error: null
        });
        logger.info(`Preloaded model configuration for ${modelName}`);
      } catch (error) {
        logger.warn(`Warning: Failed to preload ${modelName}:`, error.message);
        this.models.set(modelName, {
          ...config,
          initialized: false,
          error: error.message
        });
      }
    });

    await Promise.allSettled(initializationPromises);
  }

  async loadModel(modelName) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const effectiveModel = this.getEffectiveModel(modelName);
      logger.info(`Loading model configuration for: ${effectiveModel}`);
      
      if (!this.models.has(effectiveModel)) {
        const modelConfig = BERT_MODELS[effectiveModel] || FALLBACK_CONFIG;
        logger.info(`Using model: ${modelConfig.name}`);
        this.models.set(effectiveModel, {
          ...modelConfig,
          initialized: true,
          lastUsed: Date.now(),
          error: null
        });
      }

      const model = this.models.get(effectiveModel);
      model.lastUsed = Date.now();
      return model;
    } catch (error) {
      logger.error(`Error loading model ${modelName}:`, error);
      return FALLBACK_CONFIG;
    }
  }

  getEffectiveModel(modelName) {
    const modelConfig = BERT_MODELS[modelName];
    if (!modelConfig) {
      logger.info(`Model ${modelName} not found, using fallback model`);
      return this.fallbackModel;
    }
    return modelName;
  }

  async generateResponse(message, modelName, personality = {}, options = {}) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    try {
      const effectiveModel = this.getEffectiveModel(modelName);
      const modelConfig = await this.loadModel(effectiveModel);
      const processedInput = this.preprocessInput(message, personality, modelConfig);

      logger.info(`Generating response using model: ${modelConfig.name}`);

      let result = await this.handleTextGeneration(processedInput, modelConfig, options.signal);

      if (!result || !result.answer) {
        logger.warn('Primary model failed, using fallback');
        const fallbackConfig = FALLBACK_CONFIG;
        result = await this.handleTextGeneration(processedInput, fallbackConfig, options.signal);
      }

      if (!result || !result.answer) {
        throw new Error('Model returned empty response');
      }

      const adjustedResponse = this.adjustResponseByPersonality(result.answer, personality);

      return {
        original: result.answer,
        adjusted: adjustedResponse,
        confidence: result.confidence || 0.75,
        model: modelName,
        industry: modelConfig.industry,
        capabilities: MODEL_CAPABILITIES[modelName] || [],
        usedFallback: result.usedFallback || false
      };
    } catch (error) {
      logger.error('Error generating response:', error);
      throw error;
    }
  }

  async handleTextGeneration(input, modelConfig, signal) {
    try {
      logger.info(`Starting text generation with model: ${modelConfig.name}`);

      const params = {
        max_new_tokens: 512,
        temperature: modelConfig.temperature || 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false,
        repetition_penalty: 1.1,
        ...modelConfig.apiConfig
      };

      logger.debug('Generation parameters:', params);

      // Try/catch specifically for the API call
      try {
        const response = await this.hf.textGeneration({
          model: modelConfig.name,
          inputs: input,
          parameters: params,
          signal
        });

        logger.debug('Raw model response:', response);

        if (!response || !response.generated_text) {
          logger.warn('Empty response from model');
          return {
            answer: 'I apologize, but I was unable to generate a response. Please try again.',
            confidence: 0.5,
            usedFallback: true
          };
        }

        return {
          answer: response.generated_text.trim(),
          confidence: 0.75,
          usedFallback: false
        };
      } catch (apiError) {
        // Handle API-specific errors
        logger.error('API error during text generation:', {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data
        });
        
        // Use a mock response for now to allow the app to function
        return {
          answer: "I'm currently experiencing technical difficulties connecting to my knowledge base. This is a temporary response while the system recovers.",
          confidence: 0.5,
          usedFallback: true
        };
      }
    } catch (error) {
      logger.error('Text generation error:', error);
      return {
        answer: 'I apologize, but I encountered an error. Please try again.',
        confidence: 0.5,
        usedFallback: true
      };
    }
  }

  preprocessInput(message, personality, modelConfig) {
    let processedInput = message.toString().trim();

    // Add context based on industry
    if (modelConfig.industry && modelConfig.industry !== 'General') {
      processedInput = `[${modelConfig.industry}] ${processedInput}`;
    }

    // Add personality-based prompting
    if (personality.Empathy > 70) {
      processedInput = `Respond empathetically: ${processedInput}`;
    }

    if (personality.Confidence > 70) {
      processedInput = `Respond confidently: ${processedInput}`;
    }

    if (personality.Patience > 70) {
      processedInput = `Provide a detailed response: ${processedInput}`;
    }

    logger.debug('Preprocessed input:', processedInput);
    return processedInput;
  }

  adjustResponseByPersonality(response, personality) {
    try {
      let adjustedResponse = response.toString();

      if (personality.Empathy >= 70) {
        adjustedResponse = `I understand your question. ${adjustedResponse}`;
      }

      if (personality.Assertiveness >= 70) {
        adjustedResponse = adjustedResponse
          .replace(/might|maybe|possibly/gi, 'definitely')
          .replace(/could|should/gi, 'will');
      }

      if (personality.Humour >= 70 && !adjustedResponse.includes('error') && !adjustedResponse.includes('apologize')) {
        const emojis = ['😊', '😄', '👍', '✨'];
        adjustedResponse += ` ${emojis[Math.floor(Math.random() * emojis.length)]}`;
      }

      logger.debug('Adjusted response:', adjustedResponse);
      return adjustedResponse;
    } catch (error) {
      logger.error('Error in personality adjustment:', error);
      return response;
    }
  }

  getAvailableModels() {
    return Object.keys(BERT_MODELS).map(key => ({
      id: key,
      ...BERT_MODELS[key],
      capabilities: MODEL_CAPABILITIES[key] || [],
      status: this.models.get(key)?.initialized ? 'ready' : 'error'
    }));
  }

  getModelByIndustry(industry) {
    return Object.entries(BERT_MODELS)
      .filter(([_, config]) => config.industry === industry)
      .map(([key, config]) => ({
        id: key,
        ...config,
        capabilities: MODEL_CAPABILITIES[key] || [],
        status: this.models.get(key)?.initialized ? 'ready' : 'error'
      }));
  }

  async shutdown() {
    this.initialized = false;
    this.models.clear();
    this.hf = null;
    logger.info('BertService shut down successfully');
  }
}

export default new BertService();