import dotenv from "dotenv";

dotenv.config();

class SimpleChatService {
  constructor() {
    this.isInitialized = true;
    this.initializationError = null;
    this.currentModel = "simple-chat";
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.conversationHistory = [];
  }

  async initialize() {
    console.log("🚀 Initializing Simple Chat service...");
    console.log("✅ Simple Chat service ready!");
    return true;
  }

  async generateResponse(message, personality = {}, config = {}) {
    try {
      console.log(`💬 Processing message: "${message}"`);
      
      // Intelligent responses based on message content
      let response = "";
      
      const lowerMessage = message.toLowerCase();
      
      // Greeting responses
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
        response = "Hello! How can I help you today?";
      }
      // Question about capitals
      else if (lowerMessage.includes("capital") && lowerMessage.includes("france")) {
        response = "The capital of France is Paris! 🇫🇷";
      }
      else if (lowerMessage.includes("capital") && lowerMessage.includes("germany")) {
        response = "The capital of Germany is Berlin! 🇩🇪";
      }
      else if (lowerMessage.includes("capital") && lowerMessage.includes("spain")) {
        response = "The capital of Spain is Madrid! 🇪🇸";
      }
      // How are you questions
      else if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you do")) {
        response = "I'm doing great, thank you for asking! How are you doing today?";
      }
      // Weather questions
      else if (lowerMessage.includes("weather")) {
        response = "I'd love to help with weather information, but I don't have access to current weather data. You might want to check a weather app or website!";
      }
      // Time questions
      else if (lowerMessage.includes("time") || lowerMessage.includes("what time")) {
        response = `The current time is ${new Date().toLocaleTimeString()}.`;
      }
      // Help questions
      else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
        response = "I can help you with general questions, have conversations, answer basic facts, and provide assistance! What would you like to know?";
      }
      // Default intelligent responses
      else {
        const responses = [
          "That's a great question! Let me help you with that.",
          "I understand what you're asking. Here's what I think...",
          "That's interesting! I'd be happy to discuss this with you.",
          "Thanks for sharing that! I appreciate your message.",
          "I'm here to help! What specific information are you looking for?",
          "That sounds like something worth exploring further.",
          "I'm listening and ready to assist you!",
          "That's a thoughtful question. Let me provide some insight."
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }

      // Add personality-based responses
      if (personality.Humour > 60) {
        responses.push("Haha, that's funny! 😄", "You've got a great sense of humor!", "That made me smile! 😊");
      }
      
      if (personality.Empathy > 70) {
        responses.push("I really understand how you feel.", "That must be important to you.", "I'm here to listen and support you.");
      }

      // Random response selection
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate response delay
      if (config.responseDelay) {
        await new Promise(resolve => setTimeout(resolve, config.responseDelay));
      }

      console.log(`🤖 Generated response: "${randomResponse}"`);
      
      return {
        success: true,
        response: randomResponse,
        model: this.currentModel,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error("❌ Error generating response:", error);
      return {
        success: false,
        error: error.message,
        response: "I'm sorry, I'm having trouble responding right now. Please try again."
      };
    }
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

export default new SimpleChatService();
