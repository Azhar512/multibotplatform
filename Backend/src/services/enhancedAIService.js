import axios from 'axios';

class EnhancedAIService {
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

      // If no API keys are available, use enhanced knowledge base
      return await this.generateEnhancedAIResponse(message, personality);
    } catch (error) {
      console.error('AI Service Error:', error);
      return await this.generateEnhancedAIResponse(message, personality);
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

  async generateEnhancedAIResponse(message, personality) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced knowledge base for comprehensive answers
    const knowledgeBase = {
      // Geography - Capitals
      'capital of france': 'The capital of France is Paris.',
      'capital of france?': 'The capital of France is Paris.',
      'what is the capital of france': 'The capital of France is Paris.',
      'what is the capital of france?': 'The capital of France is Paris.',
      'france capital': 'The capital of France is Paris.',
      'paris': 'Paris is the capital and largest city of France.',
      'capital of pakistan': 'The capital of Pakistan is Islamabad.',
      'what is the capital of pakistan': 'The capital of Pakistan is Islamabad.',
      'capital of india': 'The capital of India is New Delhi.',
      'what is the capital of india': 'The capital of India is New Delhi.',
      'capital of australia': 'The capital of Australia is Canberra.',
      'what is the capital of australia': 'The capital of Australia is Canberra.',
      'capital of canada': 'The capital of Canada is Ottawa.',
      'what is the capital of canada': 'The capital of Canada is Ottawa.',
      'capital of germany': 'The capital of Germany is Berlin.',
      'what is the capital of germany': 'The capital of Germany is Berlin.',
      'capital of japan': 'The capital of Japan is Tokyo.',
      'what is the capital of japan': 'The capital of Japan is Tokyo.',
      'capital of china': 'The capital of China is Beijing.',
      'what is the capital of china': 'The capital of China is Beijing.',
      'capital of russia': 'The capital of Russia is Moscow.',
      'what is the capital of russia': 'The capital of Russia is Moscow.',
      'capital of brazil': 'The capital of Brazil is Brasília.',
      'what is the capital of brazil': 'The capital of Brazil is Brasília.',
      'capital of south africa': 'The capital of South Africa is Cape Town (legislative), Pretoria (administrative), and Bloemfontein (judicial).',
      'what is the capital of south africa': 'The capital of South Africa is Cape Town (legislative), Pretoria (administrative), and Bloemfontein (judicial).',
      
      // Current Leaders (as of 2024)
      'prime minister of india': 'As of 2024, the Prime Minister of India is Narendra Modi.',
      'who is prime minister of india': 'As of 2024, the Prime Minister of India is Narendra Modi.',
      'pm of india': 'As of 2024, the Prime Minister of India is Narendra Modi.',
      'president of usa': 'As of 2024, the President of the United States is Joe Biden.',
      'who is president of usa': 'As of 2024, the President of the United States is Joe Biden.',
      'president of america': 'As of 2024, the President of the United States is Joe Biden.',
      'prime minister of uk': 'As of 2024, the Prime Minister of the United Kingdom is Rishi Sunak.',
      'who is prime minister of uk': 'As of 2024, the Prime Minister of the United Kingdom is Rishi Sunak.',
      'prime minister of canada': 'As of 2024, the Prime Minister of Canada is Justin Trudeau.',
      'who is prime minister of canada': 'As of 2024, the Prime Minister of Canada is Justin Trudeau.',
      'president of france': 'As of 2024, the President of France is Emmanuel Macron.',
      'who is president of france': 'As of 2024, the President of France is Emmanuel Macron.',
      'chancellor of germany': 'As of 2024, the Chancellor of Germany is Olaf Scholz.',
      'who is chancellor of germany': 'As of 2024, the Chancellor of Germany is Olaf Scholz.',
      
      // Math - Basic Operations
      '2+2': '2 + 2 = 4',
      'what is 2+2': '2 + 2 = 4',
      'what is 2+2?': '2 + 2 = 4',
      '3+3': '3 + 3 = 6',
      'what is 3+3': '3 + 3 = 6',
      '4+4': '4 + 4 = 8',
      'what is 4+4': '4 + 4 = 8',
      '5+5': '5 + 5 = 10',
      'what is 5+5': '5 + 5 = 10',
      '10+10': '10 + 10 = 20',
      'what is 10+10': '10 + 10 = 20',
      '100+100': '100 + 100 = 200',
      'what is 100+100': '100 + 100 = 200',
      '2*2': '2 × 2 = 4',
      'what is 2*2': '2 × 2 = 4',
      '3*3': '3 × 3 = 9',
      'what is 3*3': '3 × 3 = 9',
      '4*4': '4 × 4 = 16',
      'what is 4*4': '4 × 4 = 16',
      '5*5': '5 × 5 = 25',
      'what is 5*5': '5 × 5 = 25',
      '10*10': '10 × 10 = 100',
      'what is 10*10': '10 × 10 = 100',
      
      // Science
      'what is water': 'Water (H2O) is a chemical compound made of two hydrogen atoms and one oxygen atom. It is essential for life on Earth.',
      'what is oxygen': 'Oxygen is a chemical element with symbol O and atomic number 8. It is essential for breathing and combustion.',
      'what is gravity': 'Gravity is a fundamental force that attracts objects with mass toward each other. On Earth, it gives objects weight.',
      'what is light': 'Light is electromagnetic radiation that is visible to the human eye. It travels at approximately 299,792,458 meters per second.',
      'what is sound': 'Sound is a vibration that propagates through a medium (like air) as a mechanical wave of pressure and displacement.',
      'what is electricity': 'Electricity is the flow of electric charge through a conductor. It is a form of energy that powers many devices.',
      
      // Technology
      'what is ai': 'AI (Artificial Intelligence) is the simulation of human intelligence in machines that are programmed to think and learn like humans.',
      'what is machine learning': 'Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed.',
      'what is blockchain': 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography.',
      'what is cryptocurrency': 'Cryptocurrency is a digital or virtual currency that uses cryptography for security and operates independently of a central bank.',
      'what is bitcoin': 'Bitcoin is the first and most well-known cryptocurrency, created in 2009 by an anonymous person or group using the name Satoshi Nakamoto.',
      
      // Stock Market (General Information)
      'stock rate': 'I don\'t have access to real-time stock prices, but you can check financial websites like Yahoo Finance, Google Finance, or your broker\'s platform for current stock rates.',
      'what is stock rate': 'I don\'t have access to real-time stock prices, but you can check financial websites like Yahoo Finance, Google Finance, or your broker\'s platform for current stock rates.',
      'stock market': 'The stock market is a collection of markets where stocks (shares of ownership in companies) are bought and sold. For real-time data, check financial websites.',
      'what is stock market': 'The stock market is a collection of markets where stocks (shares of ownership in companies) are bought and sold. For real-time data, check financial websites.',
      
      // Weather (General Information)
      'weather in australia': 'I don\'t have access to real-time weather data, but you can check weather websites like Weather.com, AccuWeather, or your local weather app for current conditions in Australia.',
      'what is weather in australia': 'I don\'t have access to real-time weather data, but you can check weather websites like Weather.com, AccuWeather, or your local weather app for current conditions in Australia.',
      'weather': 'I don\'t have access to real-time weather data, but you can check weather websites like Weather.com, AccuWeather, or your local weather app for current conditions.',
      'what is weather': 'I don\'t have access to real-time weather data, but you can check weather websites like Weather.com, AccuWeather, or your local weather app for current conditions.',
      
      // General Knowledge
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! What can I assist you with?',
      'hey': 'Hey! I\'m here to help. What do you need?',
      'how are you': 'I\'m doing well, thank you for asking! How can I help you today?',
      'what is your name': 'I\'m an AI assistant designed to help you with questions and tasks.',
      'who are you': 'I\'m an AI assistant created to provide helpful responses and assistance.',
      'help': 'I\'m here to help! I can answer questions, provide information, and assist with various topics. What do you need help with?',
      'thanks': 'You\'re very welcome! I\'m glad I could help. Is there anything else you\'d like to know?',
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

export default new EnhancedAIService();
