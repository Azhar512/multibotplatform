//this is for personality settings

const AI_PROVIDERS = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    CUSTOM: 'custom'
  };
  
  module.exports = {
    provider: AI_PROVIDERS.OPENAI,
    baseConfig: {
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      max_tokens: 150
    },
    async updateModel(userId, parameters) {
      // Implementation for updating AI model parameters
    }
  };