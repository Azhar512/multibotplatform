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
      
      // Simple rule-based responses for testing
      const responses = [
        "Hello! How can I help you today?",
        "That's interesting! Tell me more.",
        "I understand what you're saying.",
        "Thanks for sharing that with me!",
        "I'm here to help! What would you like to know?",
        "That's a great question!",
        "I appreciate your message.",
        "Let me think about that...",
        "That sounds exciting!",
        "I'm listening! Please continue."
      ];

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
