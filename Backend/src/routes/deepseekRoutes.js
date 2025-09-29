import express from "express"
import deepseekService from "../services/deepseekService.js"
import bertService from "../services/bertService.js"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})

router.use(apiLimiter)

// Validation middleware with enhanced logging
const validateRequest = (req, res, next) => {
  console.log("Received request body:", req.body)
  const { message, personality } = req.body

  try {
    // Message validation
    if (!message || typeof message !== "string" || !message.trim()) {
      console.log("Message validation failed:", { receivedMessage: message })
      return res.status(400).json({
        error: "Message is required and must be a non-empty string",
        timestamp: new Date().toISOString(),
      })
    }

    // Personality validation
    if (!personality || typeof personality !== "object") {
      console.log("Personality validation failed:", { receivedPersonality: personality })
      return res.status(400).json({
        error: "Valid personality configuration is required",
        timestamp: new Date().toISOString(),
      })
    }

    const requiredTraits = ["Empathy", "Assertiveness", "Humour", "Patience", "Confidence"]
    for (const trait of requiredTraits) {
      const value = personality[trait]
      if (typeof value !== "number" || value < 0 || value > 100) {
        console.log(`Personality trait validation failed for ${trait}:`, { value })
        return res.status(400).json({
          error: `Invalid ${trait} value. Must be a number between 0 and 100`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    console.log("Request validation passed successfully")
    next()
  } catch (error) {
    console.error("Validation error:", error)
    return res.status(400).json({
      error: "Invalid request format",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    })
  }
}

router.post("/response", validateRequest, async (req, res) => {
  console.log("Processing request to /deepseek/response")
  const { message, personality, config } = req.body

  try {
    // Check DeepSeek service status
    const serviceStatus = deepseekService.getStatus()
    console.log("DeepSeek service status:", serviceStatus)

    if (!serviceStatus.initialized) {
      console.log("Service not initialized. Attempting to initialize...")
      await deepseekService.initialize()
    }

    console.log("Generating DeepSeek response for message:", message)
    const response = await deepseekService.generateResponse(message, personality)

    let sentiment = null
    if (config?.enableSentiment) {
      console.log("Analyzing sentiment...")
      sentiment = await bertService.analyzeSentiment(message)
    }

    const result = {
      botResponse:
        response.text || response.adjusted || "I apologize, but I encountered an issue generating a response.",
      originalResponse: response.original || response.raw || response.text,
      confidence: response.confidence || 0.5,
      sentiment,
      model: response.model || "fallback",
      modelType: response.modelType || "unknown",
      status: response.status || "success",
      timestamp: new Date().toISOString(),
    }

    console.log("Sending successful response")
    return res.json(result)
  } catch (error) {
    console.error("Error in route handler:", {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
    })

    return res.status(500).json({
      error: "Failed to process request",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              type: error.name,
              serviceStatus: deepseekService.getStatus(),
            }
          : undefined,
      timestamp: new Date().toISOString(),
    })
  }
})

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const status = deepseekService.getStatus()

    res.json({
      status: status.initialized ? "healthy" : "degraded",
      details: status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Models endpoint
router.get("/models", (req, res) => {
  try {
    const models = ["deepseek-r1"] // List available models
    res.json({
      models,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    res.status(500).json({
      error: "Failed to fetch available models",
      timestamp: new Date().toISOString(),
    })
  }
})

// New endpoint to clear conversation history
router.post("/clear-history", (req, res) => {
  try {
    deepseekService.clearConversationHistory()
    res.json({
      success: true,
      message: "Conversation history cleared",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error clearing history:", error)
    res.status(500).json({
      error: "Failed to clear conversation history",
      timestamp: new Date().toISOString(),
    })
  }
})

export default router
