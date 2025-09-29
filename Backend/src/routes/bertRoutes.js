import express from "express"
import cors from "cors"
import rateLimit from "express-rate-limit"
import bertService from "../services/bertService.js"

const router = express.Router()
const REQUEST_TIMEOUT = 30000 // 30 seconds

// CORS configuration
router.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(apiLimiter)

// Validation middleware
const validateRequest = (req, res, next) => {
  console.log("Received BERT request:", {
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.url,
  })

  const { message, personality, model } = req.body

  try {
    // Message validation
    if (!message?.trim()) {
      return res.status(400).json({
        error: "Message is required and cannot be empty",
        timestamp: new Date().toISOString(),
      })
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: "Message exceeds maximum length of 1000 characters",
        timestamp: new Date().toISOString(),
      })
    }

    // Model validation
    if (!model?.trim()) {
      return res.status(400).json({
        error: "Model name is required",
        timestamp: new Date().toISOString(),
      })
    }

    // Personality validation
    if (!personality || typeof personality !== "object") {
      return res.status(400).json({
        error: "Valid personality configuration is required",
        timestamp: new Date().toISOString(),
      })
    }

    const requiredTraits = ["Empathy", "Assertiveness", "Humour", "Patience", "Confidence"]
    for (const trait of requiredTraits) {
      const value = personality[trait]
      if (typeof value !== "number" || value < 0 || value > 100) {
        return res.status(400).json({
          error: `Invalid ${trait} value. Must be a number between 0 and 100`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    console.log("BERT request validation passed")
    next()
  } catch (error) {
    console.error("BERT validation error:", error)
    return res.status(400).json({
      error: "Invalid request format",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    })
  }
}

// Get available models
router.get("/models", async (req, res) => {
  try {
    console.log("Fetching available BERT models...")

    const models = bertService.getAvailableModels()

    res.json({
      success: true,
      models,
      count: models.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching BERT models:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch available models",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    })
  }
})

// Generate response
router.post("/response", validateRequest, async (req, res) => {
  console.log("Processing BERT response request")

  const { message, personality, model, config } = req.body
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    console.log(`Generating BERT response for message: "${message.substring(0, 50)}..."`)
    console.log(`Using model: ${model}`)
    console.log(`Personality settings:`, personality)

    // Initialize service if needed
    if (!bertService.initialized) {
      console.log("Initializing BERT service...")
      await bertService.initialize()
    }

    const response = await bertService.generateResponse(message, model, personality, { signal: controller.signal })

    clearTimeout(timeout)

    // Ensure consistent response format that matches frontend expectations
    const result = {
      success: true,
      botResponse:
        response.adjusted || response.original || "I apologize, but I encountered an issue generating a response.",
      original: response.original || "",
      adjusted: response.adjusted || response.original || "",
      confidence: response.confidence || 0.5,
      model: model,
      effectiveModel: response.effectiveModel,
      modelType: "bert",
      status: response.error ? "error" : "success",
      usedFallback: response.usedFallback || false,
      industry: response.industry,
      capabilities: response.capabilities || [],
      timestamp: new Date().toISOString(),
    }

    // Add error details if present
    if (response.error) {
      result.error = response.error
      result.details = process.env.NODE_ENV === "development" ? response.error : undefined
    }

    console.log("Sending BERT response successfully:", {
      model: result.model,
      effectiveModel: result.effectiveModel,
      confidence: result.confidence,
      usedFallback: result.usedFallback,
      responseLength: result.botResponse.length,
    })

    res.json(result)
  } catch (error) {
    clearTimeout(timeout)
    console.error("Error generating BERT response:", {
      message: error.message,
      stack: error.stack,
      model: model,
      messageLength: message?.length,
    })

    let statusCode = 500
    let errorMessage = "Failed to generate response"

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      statusCode = 504
      errorMessage = "Request timed out"
    } else if (error.message.includes("not configured")) {
      statusCode = 503
      errorMessage = "Service configuration error"
    } else if (error.message.includes("not found")) {
      statusCode = 404
      errorMessage = "Model not found"
    } else if (error.message.includes("Invalid message")) {
      statusCode = 400
      errorMessage = "Invalid message format"
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      model: model,
      timestamp: new Date().toISOString(),
    })
  }
})

// Health check endpoint
router.get("/health", async (req, res) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    console.log("Performing BERT service health check...")

    const status = bertService.getStatus()

    // Try to initialize if not already done
    if (!bertService.initialized) {
      await bertService.initialize()
    }

    clearTimeout(timeout)

    res.json({
      status: bertService.initialized ? "healthy" : "degraded",
      service: "BertService",
      details: {
        initialized: bertService.initialized,
        totalModels: status.totalModels,
        availableModels: status.availableModels,
        hasApiKey: status.hasApiKey,
        modelMappings: status.modelMappings,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    clearTimeout(timeout)
    console.error("BERT health check failed:", error)

    res.status(503).json({
      status: "unhealthy",
      service: "BertService",
      error: "Service health check failed",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              hasApiKey: !!process.env.HUGGINGFACE_API_KEY,
            }
          : undefined,
      timestamp: new Date().toISOString(),
    })
  }
})

// Get models by industry
router.get("/models/industry/:industry", async (req, res) => {
  try {
    const { industry } = req.params
    console.log(`Fetching models for industry: ${industry}`)

    const models = bertService.getModelByIndustry(industry)

    res.json({
      success: true,
      industry,
      models,
      count: models.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`Error fetching models for industry ${req.params.industry}:`, error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch models for industry",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    })
  }
})

// Get service status
router.get("/status", async (req, res) => {
  try {
    const status = bertService.getStatus()

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting BERT service status:", error)
    res.status(500).json({
      success: false,
      error: "Failed to get service status",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    })
  }
})

export default router
