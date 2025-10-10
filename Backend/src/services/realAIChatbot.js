import axios from 'axios';

class RealAIChatbot {
  constructor() {
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api-inference.huggingface.co/models';
  }

  async generateResponse(message, personality = {}) {
    try {
      // Try HuggingFace API first with a working model
      const response = await this.callHuggingFaceAPI(message, personality);
      if (response && response.text) {
        return {
          text: response.text,
          confidence: response.confidence || 0.9,
          model: response.model || 'huggingface',
          source: 'huggingface',
          isRealTime: true
        };
      }
    } catch (error) {
      console.log('HuggingFace API failed, trying alternative approach:', error.message);
    }

    try {
      // Try OpenAI API if available
      if (this.openaiApiKey && this.openaiApiKey !== 'sk-test-key') {
        const response = await this.callOpenAI(message, personality);
        if (response && response.text) {
          return {
            text: response.text,
            confidence: response.confidence || 0.9,
            model: response.model || 'openai',
            source: 'openai',
            isRealTime: true
          };
        }
      }
    } catch (error) {
      console.log('OpenAI API failed:', error.message);
    }

    // If all APIs fail, use intelligent response generation
    return this.generateIntelligentResponse(message, personality);
  }

  async callHuggingFaceAPI(message, personality) {
    try {
      // Use a reliable model that works
      const models = [
        'microsoft/DialoGPT-medium',
        'microsoft/DialoGPT-small',
        'gpt2',
        'distilgpt2',
        'facebook/opt-125m'
      ];

      for (const model of models) {
        try {
          const response = await axios.post(`${this.baseURL}/${model}`, {
            inputs: this.formatMessage(message, personality),
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false,
              repetition_penalty: 1.1
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }, {
            headers: {
              'Authorization': `Bearer ${this.huggingfaceApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          if (response.data && response.data[0] && response.data[0].generated_text) {
            const cleanedText = this.cleanResponse(response.data[0].generated_text);
            if (cleanedText && cleanedText.length > 10) {
              return {
                text: cleanedText,
                confidence: 0.9,
                model: model,
                source: 'huggingface'
              };
            }
          }
        } catch (modelError) {
          console.log(`Model ${model} failed:`, modelError.message);
          continue;
        }
      }

      throw new Error('All HuggingFace models failed');
    } catch (error) {
      console.error('HuggingFace API Error:', error);
      throw error;
    }
  }

  async callOpenAI(message, personality) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
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
        timeout: 30000
      });

      return {
        text: response.data.choices[0].message.content,
        confidence: 0.95,
        model: 'gpt-3.5-turbo',
        source: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  formatMessage(message, personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let systemPrompt = "You are a helpful AI assistant.";
    
    if (Empathy > 75) systemPrompt += " You are empathetic and understanding.";
    if (Assertiveness > 75) systemPrompt += " You are confident and direct.";
    if (Humour > 70) systemPrompt += " You have a friendly sense of humor.";
    if (Patience > 80) systemPrompt += " You are patient and thoughtful.";
    if (Confidence > 75) systemPrompt += " You are knowledgeable and assured.";
    
    return `${systemPrompt}\n\nUser: ${message}\nAssistant:`;
  }

  buildSystemPrompt(personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let prompt = "You are a helpful AI assistant that can answer any question with accurate, real-time information.";
    
    if (Empathy > 75) prompt += " You are empathetic and understanding in your responses.";
    if (Assertiveness > 75) prompt += " You are confident and direct in your answers.";
    if (Humour > 70) prompt += " You have a friendly sense of humor and can be lighthearted when appropriate.";
    if (Patience > 80) prompt += " You are patient and thorough in your explanations.";
    if (Confidence > 75) prompt += " You are knowledgeable and assured in your responses.";
    
    prompt += " Provide helpful, accurate, and engaging responses to any question or request. Use real-time information when possible.";
    
    return prompt;
  }

  generateIntelligentResponse(message, personality) {
    // This is a fallback that should rarely be used if APIs are working
    const lowerMessage = message.toLowerCase();
    
    // Only provide basic responses as fallback
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm here to help you with any questions or tasks you might have. What can I assist you with today?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! I'm always happy to help. Is there anything else you'd like to know?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help you! I can answer questions, provide information, and assist with various topics. What do you need help with?";
    }
    
    // For any other question, provide a helpful response
    return `I understand you're asking about "${message}". I'm here to help you with that. Could you provide a bit more detail so I can give you the most accurate information?`;
  }

  cleanResponse(text) {
    if (!text) return "";
    
    return text
      .trim()
      .replace(/^(Human:|User:|Bot:|Assistant:|Answer:)/i, "")
      .replace(/(Human:|User:|Bot:|Assistant:)$/i, "")
      .replace(/^\s*[-•]\s*/, "")
      .replace(/\n\n+/g, "\n")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export default new RealAIChatbot();
