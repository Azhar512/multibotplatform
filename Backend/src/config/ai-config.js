// AI configuration for personality settings

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  CUSTOM: 'custom'
};

export const AI_CONFIG = {
  provider: AI_PROVIDERS.OPENAI,
  baseConfig: {
    temperature: 0.7,
    presence_penalty: 0.6,
    frequency_penalty: 0.5,
    max_tokens: 150
  },
  async updateModel(userId, parameters) {
    // Implementation for updating AI model parameters
    console.log(`Updating AI model for user ${userId} with parameters:`, parameters);
  }
};

export default AI_CONFIG;