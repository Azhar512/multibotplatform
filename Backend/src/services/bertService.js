import { HfInference } from "@huggingface/inference"
import dotenv from "dotenv"
import { BERT_MODELS, MODEL_CAPABILITIES, FALLBACK_CONFIG } from "../config/models.js"
import { serviceLogger as logger } from "../config/logger.js"

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
      "bert-base-uncased": "HuggingFaceH4/zephyr-7b-beta",
      "bert-large-uncased": "microsoft/DialoGPT-medium",
      "bert-base-cased": "google/flan-t5-base",
      "bert-large-cased": "HuggingFaceH4/zephyr-7b-beta",
      "distilbert-base-uncased": "distilgpt2",
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
      const testModel = "google/flan-t5-small"
      logger.info(`Testing connection with model: ${testModel}`)

      const testResponse = await this.hf.textGeneration({
        model: testModel,
        inputs: "Answer: What is 2+2?",
        parameters: {
          max_new_tokens: 10,
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
      logger.warn("Continuing despite connection test failure - will use fallback responses")
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
    const effectiveModel = this.modelMappings[modelName] || "HuggingFaceH4/zephyr-7b-beta"
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
        effectiveModel: "HuggingFaceH4/zephyr-7b-beta",
      }
    }
  }

  async generateResponse(message, modelName, personality = {}, options = {}) {
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message format")
    }

    try {
      const modelConfig = await this.loadModel(modelName)
      const processedInput = this.preprocessInput(message, personality, modelConfig)

      logger.info(`Generating response using model: ${modelConfig.effectiveModel || modelConfig.name}`)

      let result = await this.handleTextGeneration(processedInput, modelConfig, options.signal)

      if (!result || !result.answer) {
        logger.warn("Primary model failed, using fallback")
        const fallbackConfig = {
          ...FALLBACK_CONFIG,
          effectiveModel: "HuggingFaceH4/zephyr-7b-beta",
        }
        result = await this.handleTextGeneration(processedInput, fallbackConfig, options.signal)
      }

      if (!result || !result.answer) {
        // Final fallback - return a helpful response based on the message
        const fallbackResponses = [
          "Hello! I'm here to help you. How can I assist you today?",
          "Hi there! I'm ready to answer your questions. What would you like to know?",
          "Greetings! I'm an AI assistant ready to help. What can I do for you?",
          "Hello! I'm here to provide information and assistance. How may I help you?",
          "Hi! I'm your AI assistant. What questions do you have for me today?",
          "Hello! I'm ready to help with any questions you might have. What's on your mind?",
          "Hi there! I'm here to assist you. What would you like to discuss?",
          "Greetings! I'm your AI helper. How can I be of service today?"
        ]
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        
        result = {
          answer: randomResponse,
          confidence: 0.7,
          usedFallback: true,
        }
      }

      const adjustedResponse = this.adjustResponseByPersonality(result.answer, personality)

      return {
        original: result.answer,
        adjusted: adjustedResponse,
        confidence: result.confidence || 0.75,
        model: modelName,
        effectiveModel: modelConfig.effectiveModel,
        industry: modelConfig.industry,
        capabilities: MODEL_CAPABILITIES[modelName] || [],
        usedFallback: result.usedFallback || false,
      }
    } catch (error) {
      logger.error("Error generating response:", error)

      // Return a graceful error response instead of throwing
      return {
        original: "I apologize, but I'm experiencing technical difficulties right now.",
        adjusted: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment.",
        confidence: 0.3,
        model: modelName,
        error: error.message,
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

        // Return a fallback response
        return {
          answer:
            "I'm currently experiencing technical difficulties connecting to my knowledge base. Please try again in a moment.",
          confidence: 0.4,
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
