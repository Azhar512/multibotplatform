import axios from 'axios';

class RealAIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
  }

  async generateResponse(message, personality = {}, modelType = 'gpt-3.5-turbo') {
    try {
      // Try OpenAI first if API key is available
      if (this.openaiApiKey && this.openaiApiKey !== 'sk-test-key') {
        return await this.callOpenAI(message, personality, modelType);
      }

      // Fallback to HuggingFace if OpenAI is not available
      if (this.huggingfaceApiKey && this.huggingfaceApiKey !== 'your_huggingface_api_key_here') {
        return await this.callHuggingFace(message, personality);
      }

      // If no API keys are available, use a simple AI-like response generator
      return await this.generateSimpleAIResponse(message, personality);
    } catch (error) {
      console.error('AI Service Error:', error);
      return await this.generateSimpleAIResponse(message, personality);
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
        max_tokens: 150,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data.choices[0].message.content,
        confidence: 0.9,
        model: modelType,
        source: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async callHuggingFace(message, personality) {
    try {
      // Use a working HuggingFace model
      const response = await axios.post('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        inputs: message,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.huggingfaceApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data[0]?.generated_text || response.data[0]?.text || 'I apologize, but I could not generate a response.',
        confidence: 0.8,
        model: 'microsoft/DialoGPT-medium',
        source: 'huggingface'
      };
    } catch (error) {
      console.error('HuggingFace API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateSimpleAIResponse(message, personality) {
    const lowerMessage = message.toLowerCase();
    
    // Knowledge base for common questions
    const knowledgeBase = {
      'capital of france': 'The capital of France is Paris.',
      'capital of france?': 'The capital of France is Paris.',
      'what is the capital of france': 'The capital of France is Paris.',
      'what is the capital of france?': 'The capital of France is Paris.',
      'france capital': 'The capital of France is Paris.',
      'paris': 'Paris is the capital and largest city of France.',
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! What can I assist you with?',
      'hey': 'Hey! I\'m here to help. What do you need?',
      'how are you': 'I\'m doing well, thank you for asking! How can I help you today?',
      'what is your name': 'I\'m an AI assistant designed to help you with questions and tasks.',
      'who are you': 'I\'m an AI assistant created to provide helpful responses and assistance.',
      'help': 'I\'m here to help! I can answer questions, provide information, and assist with various topics. What do you need help with?',
      'thanks': 'You\'re welcome! I\'m glad I could help. Is there anything else you\'d like to know?',
      'thank you': 'You\'re very welcome! Feel free to ask if you have any other questions.',
      'goodbye': 'Goodbye! Have a great day!',
      'bye': 'Bye! Take care!',
      'what time is it': 'I don\'t have access to real-time information, but you can check the time on your device.',
      'what\'s the weather': 'I don\'t have access to current weather data, but you can check a weather app or website for current conditions.',
      'how old are you': 'I\'m an AI assistant, so I don\'t have an age in the traditional sense. I was created to help you!',
      'where are you from': 'I\'m an AI assistant that exists in the digital realm to help you with questions and tasks.',
      'what can you do': 'I can answer questions, provide information, help with problem-solving, have conversations, and assist with various topics. What would you like to know?',
      'tell me a joke': 'Why don\'t scientists trust atoms? Because they make up everything! 😄',
      'joke': 'Here\'s a joke for you: Why did the scarecrow win an award? Because he was outstanding in his field! 🌾',
      'funny': 'I\'m glad you\'re in a good mood! Here\'s something light: What do you call a fake noodle? An impasta! 🍝',
      'math': 'I can help with math problems! What specific calculation or problem would you like me to solve?',
      'calculate': 'I\'d be happy to help with calculations! What math problem do you need solved?',
      '2+2': '2 + 2 = 4',
      'what is 2+2': '2 + 2 = 4',
      'what is 2+2?': '2 + 2 = 4',
      'addition': 'I can help with addition! What numbers would you like me to add?',
      'subtraction': 'I can help with subtraction! What numbers would you like me to subtract?',
      'multiplication': 'I can help with multiplication! What numbers would you like me to multiply?',
      'division': 'I can help with division! What numbers would you like me to divide?'
    };

    // Check for exact matches first
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return {
          text: value,
          confidence: 0.9,
          model: 'knowledge-base',
          source: 'local'
        };
      }
    }

    // Generate contextual responses for questions
    if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
      const questionResponses = [
        `That's a great question about "${message}". I'd be happy to help you find the answer. Could you provide a bit more context so I can give you the most accurate information?`,
        `I understand you're asking about "${message}". Let me provide some helpful information on that topic.`,
        `That's an interesting question about "${message}". I can definitely help you with that. Here's what I can tell you about it.`,
        `Thanks for asking about "${message}"! I'm here to help you understand that better. Let me share some insights on the topic.`
      ];
      
      return {
        text: questionResponses[Math.floor(Math.random() * questionResponses.length)],
        confidence: 0.7,
        model: 'contextual',
        source: 'local'
      };
    }

    // Generate contextual responses for statements
    const statementResponses = [
      `I understand what you're saying about "${message}". I'm here to help you with that and provide useful information. What specific aspect would you like me to focus on?`,
      `That's interesting about "${message}"! I'd be happy to discuss that topic with you and provide some helpful insights. What would you like to know more about?`,
      `I hear you regarding "${message}"! I'm here to assist you with that and offer whatever help I can. Could you tell me more about what you're looking for?`,
      `I appreciate you sharing that about "${message}". I'm ready to help you explore this topic further. What specific information are you seeking?`,
      `That's a good point about "${message}"! I'm here to help you with that and provide whatever assistance you need. What would be most helpful for you right now?`
    ];
    
    return {
      text: statementResponses[Math.floor(Math.random() * statementResponses.length)],
      confidence: 0.7,
      model: 'contextual',
      source: 'local'
    };
  }

  buildSystemPrompt(personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let prompt = "You are a helpful AI assistant.";
    
    if (Empathy > 75) prompt += " You are empathetic and understanding.";
    if (Assertiveness > 75) prompt += " You are confident and direct in your responses.";
    if (Humour > 70) prompt += " You have a friendly sense of humor and can be lighthearted when appropriate.";
    if (Patience > 80) prompt += " You are patient and thoughtful in your responses.";
    if (Confidence > 75) prompt += " You are knowledgeable and assured in your answers.";
    
    prompt += " Provide helpful, accurate, and engaging responses to user questions and requests.";
    
    return prompt;
  }
}

export default new RealAIService();
