import axios from 'axios';

class RealTimeAIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  }

  async generateResponse(message, personality = {}, modelType = 'gpt-3.5-turbo') {
    try {
      // Try OpenAI first if API key is available and valid
      if (this.openaiApiKey && this.openaiApiKey !== 'sk-test-key' && this.openaiApiKey !== 'your_openai_api_key_here') {
        console.log('Using OpenAI API for real-time response');
        return await this.callOpenAI(message, personality, modelType);
      }

      // Try DeepSeek if available
      if (this.deepseekApiKey && this.deepseekApiKey !== 'your_deepseek_api_key_here') {
        console.log('Using DeepSeek API for real-time response');
        return await this.callDeepSeek(message, personality);
      }

      // Try HuggingFace if available
      if (this.huggingfaceApiKey && this.huggingfaceApiKey !== 'your_huggingface_api_key_here') {
        console.log('Using HuggingFace API for real-time response');
        return await this.callHuggingFace(message, personality);
      }

      // If no API keys are available, return error
      throw new Error('No valid API keys configured for real-time AI responses');
    } catch (error) {
      console.error('Real-time AI Service Error:', error);
      throw error;
    }
  }

  async callOpenAI(message, personality, modelType) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: modelType,
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(personality)
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        text: response.data.choices[0].message.content,
        confidence: 0.95,
        model: modelType,
        source: 'openai',
        isRealTime: true
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`OpenAI API failed: ${error.response?.status || 'Unknown error'}`);
    }
  }

  async callDeepSeek(message, personality) {
    try {
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(personality)
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        text: response.data.choices[0].message.content,
        confidence: 0.9,
        model: 'deepseek-chat',
        source: 'deepseek',
        isRealTime: true
      };
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      throw new Error(`DeepSeek API failed: ${error.response?.status || 'Unknown error'}`);
    }
  }

  async callHuggingFace(message, personality) {
    try {
      // Use a reliable HuggingFace model
      const response = await axios.post('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        inputs: message,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.huggingfaceApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return {
        text: response.data[0]?.generated_text || response.data[0]?.text || 'I apologize, but I could not generate a response.',
        confidence: 0.85,
        model: 'microsoft/DialoGPT-medium',
        source: 'huggingface',
        isRealTime: true
      };
    } catch (error) {
      console.error('HuggingFace API Error:', error.response?.data || error.message);
      throw new Error(`HuggingFace API failed: ${error.response?.status || 'Unknown error'}`);
    }
  }

  buildSystemPrompt(personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let prompt = "You are a helpful AI assistant that provides accurate, real-time information.";
    
    if (Empathy > 75) prompt += " You are empathetic and understanding in your responses.";
    if (Assertiveness > 75) prompt += " You are confident and direct in your answers.";
    if (Humour > 70) prompt += " You have a friendly sense of humor and can be lighthearted when appropriate.";
    if (Patience > 80) prompt += " You are patient and thorough in your explanations.";
    if (Confidence > 75) prompt += " You are knowledgeable and assured in your responses.";
    
    prompt += " Always provide accurate, up-to-date information and real answers to questions.";
    
    return prompt;
  }

  // Test if any API is working
  async testAPIs() {
    const results = {
      openai: false,
      deepseek: false,
      huggingface: false
    };

    try {
      if (this.openaiApiKey && this.openaiApiKey !== 'sk-test-key' && this.openaiApiKey !== 'your_openai_api_key_here') {
        await this.callOpenAI('test', {}, 'gpt-3.5-turbo');
        results.openai = true;
      }
    } catch (error) {
      console.log('OpenAI test failed:', error.message);
    }

    try {
      if (this.deepseekApiKey && this.deepseekApiKey !== 'your_deepseek_api_key_here') {
        await this.callDeepSeek('test', {});
        results.deepseek = true;
      }
    } catch (error) {
      console.log('DeepSeek test failed:', error.message);
    }

    try {
      if (this.huggingfaceApiKey && this.huggingfaceApiKey !== 'your_huggingface_api_key_here') {
        await this.callHuggingFace('test', {});
        results.huggingface = true;
      }
    } catch (error) {
      console.log('HuggingFace test failed:', error.message);
    }

    return results;
  }
}

export default new RealTimeAIService();
