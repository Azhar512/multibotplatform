// models.js
export const INDUSTRY_MODELS = {
  'General': {
    name: 'gpt2',  // Changed from microsoft/phi-2 to gpt2
    maxLength: 1024,
    temperature: 0.7,
    industry: 'General',
    description: 'General purpose language model',
    endpoint: 'text-generation',
    requiresContext: true,
    apiConfig: {
      max_new_tokens: 512,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false,
      temperature: 0.7,
      repetition_penalty: 1.1
    }
  },
  'Finance': {
    name: 'gpt2',  // Changed from microsoft/phi-2 to gpt2
    maxLength: 1024,
    temperature: 0.7,
    industry: 'Finance',
    description: 'Specialized for financial analysis and queries',
    endpoint: 'text-generation',
    requiresContext: true,
    apiConfig: {
      max_new_tokens: 512,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false,
      temperature: 0.7,
      repetition_penalty: 1.1
    }
  },
  'Legal': {
    name: 'gpt2',  // Changed from microsoft/phi-2 to gpt2
    maxLength: 1024,
    temperature: 0.7,
    industry: 'Legal',
    description: 'Specialized for legal analysis and queries',
    endpoint: 'text-generation',
    requiresContext: true,
    apiConfig: {
      max_new_tokens: 512,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false,
      temperature: 0.7,
      repetition_penalty: 1.1
    }
  }
};

export const BERT_MODELS = {
  'bert-base-uncased': {
    name: 'gpt2',  // Changed from microsoft/phi-2 to gpt2
    maxLength: 1024,
    temperature: 0.7,
    industry: 'General',
    description: 'General purpose text generation model',
    endpoint: 'text-generation',
    apiConfig: {
      max_new_tokens: 512,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false,
      temperature: 0.7,
      repetition_penalty: 1.1
    }
  },
  'deepseek-r1': {
    name: 'google/flan-t5-large',  // Changed from microsoft/phi-2 to distilgpt2
    maxLength: 2048,
    temperature: 0.7,
    industry: 'General',
    description: 'Advanced language model for code and text generation',
    endpoint: 'text-generation',
    apiConfig: {
      max_new_tokens: 1024,
      top_p: 0.95,
      do_sample: true,
      return_full_text: false,
      temperature: 0.7,
      repetition_penalty: 1.1
    }
  },
  ...INDUSTRY_MODELS
};

export const MODEL_CATEGORIES = {
  ADVANCED: ['deepseek-r1'],
  BERT: ['bert-base-uncased'],
  INDUSTRY_SPECIFIC: Object.keys(INDUSTRY_MODELS)
};

export const MODEL_CAPABILITIES = {
  'bert-base-uncased': [
    'text-generation',
    'question-answering',
    'conversation'
  ],
  'deepseek-r1': [
    'text-generation',
    'code-generation',
    'conversation',
    'question-answering'
  ],
  'General': [
    'text-generation',
    'conversation',
    'question-answering'
  ],
  'Finance': [
    'text-generation',
    'conversation',
    'question-answering',
    'financial-analysis'
  ],
  'Legal': [
    'text-generation',
    'conversation',
    'question-answering',
    'legal-analysis'
  ]
};

export const DEFAULT_PERSONALITY = {
  Empathy: 70,
  Patience: 80,
  Confidence: 60,
  Assertiveness: 60,
  Humour: 50
};

export const PERSONALITY_LIMITS = {
  min: 0,
  max: 100,
  default: 50
};

export const FALLBACK_CONFIG = {
  name: 'gpt2',  // Changed from microsoft/phi-2 to gpt2
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

export const MODEL_ENDPOINTS = {
  TEXT_GENERATION: 'text-generation',
  QUESTION_ANSWERING: 'question-answering',
  CONVERSATION: 'conversation'
};

export const validateModelConfig = (config) => {
  const requiredFields = ['name', 'maxLength', 'temperature', 'endpoint', 'apiConfig'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Invalid model configuration. Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
};

export const getModelConfig = (modelName) => {
  const config = BERT_MODELS[modelName] || FALLBACK_CONFIG;
  validateModelConfig(config);
  return config;
};

export const getDefaultConfig = () => ({
  ...FALLBACK_CONFIG,
  personality: DEFAULT_PERSONALITY
});