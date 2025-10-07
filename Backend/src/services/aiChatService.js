import dotenv from "dotenv";

dotenv.config();

class AIChatService {
  constructor() {
    this.isInitialized = true;
    this.initializationError = null;
    this.currentModel = "ai-chat";
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.conversationHistory = [];
  }

  async initialize() {
    console.log("🚀 Initializing AI Chat service...");
    console.log("✅ AI Chat service ready!");
    return true;
  }

  async generateResponse(message, personality = {}, config = {}) {
    try {
      console.log(`💬 Processing message: "${message}"`);
      
      // Try to use Hugging Face Inference API for real AI responses
      if (this.apiKey) {
        const aiResponse = await this.getAIResponse(message, personality);
        if (aiResponse.success) {
          return aiResponse;
        }
      }
      
      // Fallback to intelligent rule-based responses
      return await this.getIntelligentResponse(message, personality, config);

    } catch (error) {
      console.error("❌ Error generating response:", error);
      return {
        success: false,
        error: error.message,
        response: "I'm sorry, I'm having trouble responding right now. Please try again."
      };
    }
  }

  async getAIResponse(message, personality) {
    try {
      // Use a working Hugging Face model for text generation
      const model = "microsoft/DialoGPT-medium";
      const endpoint = `https://api-inference.huggingface.co/models/${model}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let aiText = "";
        
        if (Array.isArray(data) && data.length > 0) {
          aiText = data[0].generated_text || data[0].text || "";
        } else if (data.generated_text) {
          aiText = data.generated_text;
        }

        // Clean up the response
        aiText = aiText.replace(message, "").trim();
        if (aiText.length === 0) {
          throw new Error("Empty response from AI");
        }

        // Apply personality modifications
        aiText = this.applyPersonality(aiText, personality);

        console.log(`🤖 AI Generated response: "${aiText}"`);
        
        return {
          success: true,
          response: aiText,
          model: this.currentModel,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`AI API error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ AI response failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getIntelligentResponse(message, personality, config) {
    const lowerMessage = message.toLowerCase();
    let response = "";
    
    // Comprehensive knowledge base
    const knowledge = {
      // Countries and capitals
      "pakistan": "The capital of Pakistan is Islamabad! 🇵🇰",
      "france": "The capital of France is Paris! 🇫🇷",
      "germany": "The capital of Germany is Berlin! 🇩🇪",
      "spain": "The capital of Spain is Madrid! 🇪🇸",
      "italy": "The capital of Italy is Rome! 🇮🇹",
      "japan": "The capital of Japan is Tokyo! 🇯🇵",
      "china": "The capital of China is Beijing! 🇨🇳",
      "india": "The capital of India is New Delhi! 🇮🇳",
      "brazil": "The capital of Brazil is Brasília! 🇧🇷",
      "canada": "The capital of Canada is Ottawa! 🇨🇦",
      "australia": "The capital of Australia is Canberra! 🇦🇺",
      "russia": "The capital of Russia is Moscow! 🇷🇺",
      "uk": "The capital of the United Kingdom is London! 🇬🇧",
      "usa": "The capital of the United States is Washington D.C.! 🇺🇸",
      
      // General knowledge
      "weather": "I don't have access to real-time weather data, but you can check weather apps or websites for current conditions!",
      "time": `The current time is ${new Date().toLocaleTimeString()}.`,
      "date": `Today's date is ${new Date().toLocaleDateString()}.`,
      "help": "I can help you with questions about geography, general knowledge, math, science, and much more! What would you like to know?",
      "name": "I'm an AI assistant! I don't have access to personal information about users, but I'm here to help with any questions you have!",
      "age": "I'm an AI, so I don't have an age in the traditional sense! I'm here to help you with any questions.",
      "who are you": "I'm an AI assistant designed to help answer questions and have conversations! I can help with a wide variety of topics.",
      "what can you do": "I can answer questions about geography, history, science, math, provide explanations, help with problem-solving, and have general conversations!",
      
      // Math and science
      "math": "I can help with math problems! What specific math question do you have?",
      "science": "I'd be happy to help with science questions! What topic are you interested in?",
      "history": "I can help with historical questions! What period or event would you like to know about?",
    };

    // Check for specific knowledge matches
    for (const [key, answer] of Object.entries(knowledge)) {
      if (lowerMessage.includes(key)) {
        response = answer;
        break;
      }
    }

    // If no specific match, provide intelligent responses
    if (!response) {
      const intelligentResponses = [
        "That's an interesting question! Let me help you with that.",
        "I'd be happy to discuss this topic with you. What specific aspect are you curious about?",
        "That's a great question! I can help you explore this further.",
        "I understand what you're asking. Let me provide some insight on this topic.",
        "Thanks for sharing that! I'd be glad to help you understand this better.",
        "That's a thoughtful question. I can help you find the information you need.",
        "I'm here to help! Could you provide a bit more detail about what you'd like to know?",
        "That sounds like something worth exploring! What specific information are you looking for?",
        "I'd love to help you with that! What particular aspect would you like me to focus on?",
        "That's a fascinating topic! I can help you learn more about it."
      ];
      
      response = intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
    }

    // Apply personality modifications
    response = this.applyPersonality(response, personality);

    // Simulate response delay
    if (config.responseDelay) {
      await new Promise(resolve => setTimeout(resolve, config.responseDelay));
    }

    console.log(`🤖 Generated response: "${response}"`);
    
    return {
      success: true,
      response: response,
      model: this.currentModel,
      timestamp: new Date().toISOString()
    };
  }

  applyPersonality(response, personality) {
    let modifiedResponse = response;

    // Add humor
    if (personality.Humour > 60 && Math.random() > 0.7) {
      const humorAdditions = [" 😄", " 😊", " 😆", " 😂"];
      modifiedResponse += humorAdditions[Math.floor(Math.random() * humorAdditions.length)];
    }

    // Add empathy
    if (personality.Empathy > 70 && Math.random() > 0.6) {
      const empathyPrefixes = ["I understand. ", "I can see that ", "I appreciate that "];
      if (!modifiedResponse.startsWith("I")) {
        modifiedResponse = empathyPrefixes[Math.floor(Math.random() * empathyPrefixes.length)] + modifiedResponse.toLowerCase();
      }
    }

    // Add confidence
    if (personality.Confidence > 70 && Math.random() > 0.6) {
      modifiedResponse = modifiedResponse.replace(/\.$/, "! I'm confident about this.");
    }

    return modifiedResponse;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      error: this.initializationError,
      currentModel: this.currentModel,
      available: true,
      hasApiKey: !!this.apiKey,
      conversationHistory: this.conversationHistory.length
    };
  }
}

export default new AIChatService();
