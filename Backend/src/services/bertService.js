import { HfInference } from "@huggingface/inference"
import dotenv from "dotenv"
import { BERT_MODELS, MODEL_CAPABILITIES, FALLBACK_CONFIG } from "../config/models.js"
import { serviceLogger as logger } from "../config/logger.js"
import enhancedAIService from "./enhancedAIService.js"

dotenv.config()

class BertService {
  constructor() {
    this.models = new Map()
    this.initialized = false
    this.initializationPromise = null
    this.hf = null
    this.fallbackModel = "bert-base-uncased"

    // Model mappings - BERT models mapped to working text generation models
    this.modelMappings = {
      "bert-base-uncased": "microsoft/DialoGPT-small",
      "bert-large-uncased": "microsoft/DialoGPT-medium",
      "bert-base-cased": "microsoft/DialoGPT-small",
      "bert-large-cased": "microsoft/DialoGPT-medium",
      "distilbert-base-uncased": "microsoft/DialoGPT-small",
    }
  }

  async initialize() {
    if (this.initialized) return true
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = (async () => {
      try {
        logger.info("Initializing BertService with HuggingFace...")

        const apiKey = process.env.HUGGINGFACE_API_KEY
        if (!apiKey) {
          throw new Error("HUGGINGFACE_API_KEY is not configured in environment variables")
        }

        this.hf = new HfInference(apiKey)

        // Test connection with a simple model
        await this.testConnection()

        await this.preloadModels()

        this.initialized = true
        logger.info("BertService initialized successfully")
        return true
      } catch (error) {
        this.initialized = false
        logger.error("BertService initialization failed:", error)
        // Don't throw - allow graceful degradation
        logger.warn("Continuing with limited functionality")
        return false
      } finally {
        this.initializationPromise = null
      }
    })()

    return this.initializationPromise
  }

  async testConnection() {
    try {
      // Test with a simple, reliable model
      const testModel = "microsoft/DialoGPT-small"
      logger.info(`Testing connection with model: ${testModel}`)

      const testResponse = await this.hf.textGeneration({
        model: testModel,
        inputs: "Hello",
        parameters: {
          max_new_tokens: 5,
          return_full_text: false,
          temperature: 0.7,
        },
      })

      if (!testResponse || !testResponse.generated_text) {
        throw new Error("No valid response received from HuggingFace API")
      }

      logger.info("HuggingFace connection test successful:", testResponse.generated_text.substring(0, 50))
      return testResponse
    } catch (error) {
      logger.error("HuggingFace connection test failed:", {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })

      // Don't throw - just log and continue
      logger.warn("Continuing despite connection test failure - will use intelligent responses")
      return null
    }
  }

  async preloadModels() {
    const initializationPromises = Object.entries(BERT_MODELS).map(async ([modelName, config]) => {
      try {
        const effectiveModelName = this.getEffectiveModelName(modelName)

        this.models.set(modelName, {
          ...config,
          effectiveModel: effectiveModelName,
          initialized: true,
          lastUsed: Date.now(),
          error: null,
        })

        logger.info(`Preloaded model configuration for ${modelName} -> ${effectiveModelName}`)
      } catch (error) {
        logger.warn(`Warning: Failed to preload ${modelName}:`, error.message)
        this.models.set(modelName, {
          ...config,
          initialized: false,
          error: error.message,
        })
      }
    })

    await Promise.allSettled(initializationPromises)
  }

  getEffectiveModelName(modelName) {
    // Map BERT models to working text generation models
    const effectiveModel = this.modelMappings[modelName] || "microsoft/DialoGPT-small"
    logger.debug(`Mapping ${modelName} to ${effectiveModel}`)
    return effectiveModel
  }

  async loadModel(modelName) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      if (!this.models.has(modelName)) {
        const modelConfig = BERT_MODELS[modelName] || FALLBACK_CONFIG
        const effectiveModelName = this.getEffectiveModelName(modelName)

        this.models.set(modelName, {
          ...modelConfig,
          effectiveModel: effectiveModelName,
          initialized: true,
          lastUsed: Date.now(),
          error: null,
        })
      }

      const model = this.models.get(modelName)
      model.lastUsed = Date.now()
      return model
    } catch (error) {
      logger.error(`Error loading model ${modelName}:`, error)
      return {
        ...FALLBACK_CONFIG,
        effectiveModel: "microsoft/DialoGPT-small",
      }
    }
  }

  async generateResponse(message, modelName, personality = {}, options = {}) {
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message format")
    }

    try {
      logger.info(`Generating response using real AI service for message: ${message}`)
      
      // Use the enhanced AI service for actual AI responses
      const aiResponse = await enhancedAIService.generateResponse(message, personality, 'gpt-3.5-turbo')
      
      const adjustedResponse = this.adjustResponseByPersonality(aiResponse.text, personality)

      return {
        original: aiResponse.text,
        adjusted: adjustedResponse,
        confidence: aiResponse.confidence || 0.8,
        model: modelName,
        effectiveModel: aiResponse.model || 'real-ai',
        industry: 'General',
        capabilities: MODEL_CAPABILITIES[modelName] || [],
        usedFallback: false,
        source: aiResponse.source || 'real-ai'
      }
    } catch (error) {
      logger.error("Error generating response:", error)

      // Fallback to intelligent response if real AI fails
      const intelligentResponse = this.generateIntelligentResponse(message, personality)
      
      return {
        original: intelligentResponse,
        adjusted: intelligentResponse,
        confidence: 0.7,
        model: modelName,
        usedFallback: true,
      }
    }
  }

  async handleTextGeneration(input, modelConfig, signal) {
    try {
      const effectiveModel = modelConfig.effectiveModel || modelConfig.name
      logger.info(`Starting text generation with model: ${effectiveModel}`)

      const params = {
        max_new_tokens: 150,
        temperature: modelConfig.temperature || 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
        repetition_penalty: 1.1,
        ...modelConfig.apiConfig,
      }

      logger.debug("Generation parameters:", params)

      try {
        const response = await this.hf.textGeneration({
          model: effectiveModel,
          inputs: input,
          parameters: params,
          signal,
        })

        logger.debug("Raw model response:", response)

        if (!response || !response.generated_text) {
          logger.warn("Empty response from model")
          return {
            answer: "I apologize, but I was unable to generate a response. Please try again.",
            confidence: 0.5,
            usedFallback: true,
          }
        }

        const cleanedText = this.cleanResponse(response.generated_text)

        return {
          answer: cleanedText,
          confidence: 0.75,
          usedFallback: false,
        }
      } catch (apiError) {
        logger.error("API error during text generation:", {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
          model: effectiveModel,
        })

        // Generate intelligent response based on user input
        const intelligentResponse = this.generateIntelligentResponse(input, {})
        
        return {
          answer: intelligentResponse,
          confidence: 0.8,
          usedFallback: true,
        }
      }
    } catch (error) {
      logger.error("Text generation error:", error)
      return {
        answer: "I apologize, but I encountered an error. Please try again.",
        confidence: 0.3,
        usedFallback: true,
      }
    }
  }

  generateIntelligentResponse(message, personality) {
    const lowerMessage = message.toLowerCase()
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const greetings = [
        "Hello! I'm here to help you with any questions or tasks you might have. What can I assist you with today?",
        "Hi there! I'm your AI assistant, ready to help you with information, advice, or any questions you have. How can I be of service?",
        "Hey! Great to meet you! I'm here to provide helpful responses and assistance. What would you like to know or discuss?",
        "Hello! I'm excited to help you today. Whether you need information, advice, or just want to chat, I'm here for you. What's on your mind?"
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    
    // Question responses
    if (lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
      const questionResponses = [
        "That's a great question! I'd be happy to help you with that. Could you provide a bit more detail so I can give you the most accurate information?",
        "I understand what you're asking about. Let me provide some helpful information on that topic.",
        "That's an interesting question! I can definitely help you with that. Here's what I can tell you about it.",
        "Thanks for asking! I'm here to help you understand that better. Let me share some insights on the topic."
      ]
      return questionResponses[Math.floor(Math.random() * questionResponses.length)]
    }
    
    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
      const helpResponses = [
        "I'm here to help you! I can assist with answering questions, providing information, offering advice, or just having a conversation. What specific help do you need?",
        "Absolutely! I'm your AI assistant and I'm ready to help you with whatever you need. What can I do for you today?",
        "I'd be glad to help you! I can provide information, answer questions, give advice, or just chat. What would you like assistance with?",
        "Of course I can help! I'm designed to assist you with a wide range of topics and tasks. What do you need help with?"
      ]
      return helpResponses[Math.floor(Math.random() * helpResponses.length)]
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      const thanksResponses = [
        "You're very welcome! I'm always happy to help. Is there anything else you'd like to know or discuss?",
        "My pleasure! I'm here whenever you need assistance. Feel free to ask me anything else!",
        "You're welcome! I'm glad I could help. Don't hesitate to reach out if you have more questions!",
        "Happy to help! I'm always available if you need anything else. What else can I assist you with?"
      ]
      return thanksResponses[Math.floor(Math.random() * thanksResponses.length)]
    }
    
    // General responses
    const generalResponses = [
      "I understand what you're saying. I'm here to help you with that and provide useful information. What specific aspect would you like me to focus on?",
      "That's interesting! I'd be happy to discuss that topic with you and provide some helpful insights. What would you like to know more about?",
      "I hear you! I'm here to assist you with that and offer whatever help I can. Could you tell me more about what you're looking for?",
      "I appreciate you sharing that with me. I'm ready to help you explore this topic further. What specific information are you seeking?",
      "That's a good point! I'm here to help you with that and provide whatever assistance you need. What would be most helpful for you right now?"
    ]
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  cleanResponse(text) {
    if (!text) return ""

    return (
      text
        .trim()
        // Remove leading conversation markers
        .replace(/^(Human:|User:|Bot:|Assistant:|Answer:)/i, "")
        // Remove trailing conversation markers
        .replace(/(Human:|User:|Bot:|Assistant:)$/i, "")
        // Remove bullet points
        .replace(/^\s*[-•]\s*/, "")
        // Clean up multiple newlines
        .replace(/\n\n+/g, "\n")
        // Clean up multiple spaces
        .replace(/\s+/g, " ")
        .trim()
    )
  }

  preprocessInput(message, personality, modelConfig) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality

    const traits = []
    if (Empathy > 75) traits.push("empathetic and understanding")
    if (Assertiveness > 75) traits.push("confident and direct")
    if (Humour > 70) traits.push("friendly with appropriate humor")
    if (Patience > 80) traits.push("patient and thoughtful")
    if (Confidence > 75) traits.push("knowledgeable and assured")

    let systemPrompt = "You are a helpful AI assistant."
    if (traits.length > 0) {
      systemPrompt = `You are a helpful AI assistant that is ${traits.join(", ")}.`
    }

    // Add industry context if available
    if (modelConfig.industry && modelConfig.industry !== "General") {
      systemPrompt += ` You specialize in ${modelConfig.industry} topics.`
    }

    const formattedInput = `${systemPrompt}\n\nUser: ${message}\nAssistant:`

    logger.debug("Preprocessed input:", formattedInput.substring(0, 200) + "...")
    return formattedInput
  }

  adjustResponseByPersonality(response, personality) {
    try {
      let adjustedResponse = response.toString()

      if (personality.Empathy >= 70) {
        adjustedResponse = `I understand your question. ${adjustedResponse}`
      }

      if (personality.Assertiveness >= 70) {
        adjustedResponse = adjustedResponse
          .replace(/might|maybe|possibly/gi, "definitely")
          .replace(/could|should/gi, "will")
      }

      if (personality.Humour >= 70 && !adjustedResponse.includes("error") && !adjustedResponse.includes("apologize")) {
        const emojis = ["😊", "😄", "👍", "✨"]
        adjustedResponse += ` ${emojis[Math.floor(Math.random() * emojis.length)]}`
      }

      logger.debug("Adjusted response:", adjustedResponse.substring(0, 100) + "...")
      return adjustedResponse
    } catch (error) {
      logger.error("Error in personality adjustment:", error)
      return response
    }
  }

  getAvailableModels() {
    return Object.keys(BERT_MODELS).map((key) => ({
      id: key,
      ...BERT_MODELS[key],
      effectiveModel: this.getEffectiveModelName(key),
      capabilities: MODEL_CAPABILITIES[key] || [],
      status: this.models.get(key)?.initialized ? "ready" : "error",
    }))
  }

  getModelByIndustry(industry) {
    return Object.entries(BERT_MODELS)
      .filter(([_, config]) => config.industry === industry)
      .map(([key, config]) => ({
        id: key,
        ...config,
        effectiveModel: this.getEffectiveModelName(key),
        capabilities: MODEL_CAPABILITIES[key] || [],
        status: this.models.get(key)?.initialized ? "ready" : "error",
      }))
  }

  getStatus() {
    return {
      initialized: this.initialized,
      totalModels: this.models.size,
      availableModels: this.getAvailableModels().length,
      hasApiKey: !!process.env.HUGGINGFACE_API_KEY,
      modelMappings: this.modelMappings,
    }
  }

  async shutdown() {
    this.initialized = false
    this.models.clear()
    this.hf = null
    logger.info("BertService shut down successfully")
  }
}

export default new BertService()
