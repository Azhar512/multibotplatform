import dotenv from "dotenv"

dotenv.config()

class DeepseekService {
  constructor() {
    this.isInitialized = false
    this.initializationError = null
    this.currentModel = null
    this.currentModelKey = null
    this.apiKey = process.env.HUGGINGFACE_API_KEY
    this.conversationHistory = []
    this.modelType = "text-generation"
    this.workingEndpoint = null
    this.useInferenceApi = true // Use new unified API
  }

  // Determine the correct API endpoint for different models
  getApiEndpoint(modelName) {
    // All models use the standard HF Inference API endpoint
    return `https://api-inference.huggingface.co/models/${modelName}`
  }

  async testModelAPI(modelName, testInput = "Hello") {
    console.log(`🧪 Testing model: ${modelName}`)

    const endpoint = this.getApiEndpoint(modelName)
    console.log(`🔗 Using endpoint: ${endpoint}`)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: testInput,
          parameters: {
            max_new_tokens: 30,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      })

      console.log(`📊 Response status: ${response.status}`)

      if (response.status === 200) {
        const data = await response.json()
        console.log(`📄 Raw response:`, data)

        let responseText = ""
        if (Array.isArray(data)) {
          responseText = data[0]?.generated_text || ""
        } else if (data.generated_text) {
          responseText = data.generated_text
        }

        if (responseText && responseText.length > 5) {
          console.log(`✅ Model ${modelName} works! Response: ${responseText.substring(0, 100)}...`)
          return {
            success: true,
            model: modelName,
            response: responseText,
            endpoint: endpoint,
            apiType: "inference",
          }
        } else {
          console.log(`❌ Model ${modelName} returned empty response`)
          return { success: false, error: "Empty response" }
        }
      } else if (response.status === 503) {
        console.log(`⏳ Model ${modelName} is loading...`)
        const errorData = await response.json().catch(() => ({}))
        console.log(`📄 Loading info:`, errorData)

        if (errorData.estimated_time) {
          console.log(`⏱️ Estimated loading time: ${errorData.estimated_time} seconds`)
          console.log(`🔄 Waiting for model to load...`)

          // Wait for the estimated time + buffer
          const waitTime = Math.min(errorData.estimated_time * 1000 + 10000, 60000) // Max 60 seconds
          await new Promise((resolve) => setTimeout(resolve, waitTime))

          // Retry once
          console.log(`🔄 Retrying ${modelName} after waiting...`)
          return await this.testModelAPI(modelName, testInput)
        }

        return { success: false, error: "Model loading" }
      } else {
        const errorText = await response.text()
        console.log(`❌ Model ${modelName} failed: ${response.status} - ${errorText}`)
        return { success: false, error: `HTTP ${response.status}: ${errorText}` }
      }
    } catch (error) {
      console.log(`❌ Model ${modelName} error: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async findWorkingModel() {
    console.log("🔍 Finding working AI model using Hugging Face Inference API...")

    if (!this.apiKey) {
      throw new Error("HUGGINGFACE_API_KEY not found in environment variables")
    }

    console.log(`🔑 Using API key: ${this.apiKey.substring(0, 10)}...`)

    // Updated list of models that actually work with HF Inference API
    const models = [
      // Working text generation models
      "microsoft/DialoGPT-small",
      "microsoft/DialoGPT-medium", 
      "microsoft/DialoGPT-large",
      
      // Working conversational models
      "facebook/blenderbot-400M-distill",
      "facebook/blenderbot-1B-distill",
      
      // Working GPT models
      "gpt2",
      "distilgpt2",
      
      // Working T5 models
      "google/flan-t5-small",
      "google/flan-t5-base",
      
      // Working OPT models
      "facebook/opt-125m",
      "facebook/opt-350m",
      
      // Working EleutherAI models
      "EleutherAI/gpt-neo-125M",
      "EleutherAI/gpt-neo-1.3B",
      
      // Working smaller models
      "distilbert-base-uncased",
      "bert-base-uncased"
    ]

    console.log("🎯 Testing Hugging Face Inference API models...")
    for (const modelName of models) {
      const result = await this.testModelAPI(modelName)

      if (result.success) {
        this.currentModel = result.model
        this.currentModelKey = result.model.split("/").pop() || result.model
        this.workingEndpoint = result.endpoint
        this.useInferenceApi = true
        this.apiType = "inference"
        console.log(`🎉 Successfully found working model: ${result.model}`)
        return result
      }

      // Small delay between tests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    throw new Error("No working models found. Please check your Hugging Face API key and permissions.")
  }

  async initialize() {
    try {
      if (this.isInitialized && this.currentModel) {
        console.log(`✅ Service already initialized with ${this.currentModel}`)
        return true
      }

      console.log("🚀 Initializing DeepSeek service...")
      console.log("📋 Testing models with Inference Providers...")

      const result = await this.findWorkingModel()

      if (result.success) {
        this.isInitialized = true
        this.initializationError = null
        console.log(`✅ Service initialized successfully!`)
        console.log(`🤖 Active model: ${this.currentModel}`)
        console.log(`🔗 API Type: ${this.apiType}`)
        console.log(`🔗 Endpoint: ${this.workingEndpoint}`)
        return true
      }

      throw new Error("Failed to initialize any model")
    } catch (error) {
      this.isInitialized = false
      this.initializationError = error.message
      console.error("❌ Service initialization failed:", error.message)

      // Provide setup instructions
      console.log("\n🔧 To fix this issue:")
      console.log("1. Visit: https://huggingface.co/settings/inference-providers")
      console.log("2. Enable 'Together AI' provider (for Llama/Mistral models)")
      console.log("3. Enable 'HF Inference API' provider")
      console.log("4. Make sure your token has 'Inference API' permissions")
      console.log("5. Wait a few minutes after enabling providers")
      console.log("6. Check if the models are available in your region")

      throw error
    }
  }

  async generateResponse(message, personality = {}) {
    try {
      if (!this.isInitialized) {
        console.log("🔄 Service not initialized, attempting initialization...")
        await this.initialize()
      }

      if (!this.currentModel || !this.workingEndpoint) {
        throw new Error("No working model available")
      }

      console.log(`🤖 Generating response with ${this.currentModel} (${this.apiType} API)`)
      console.log(`📝 Input: ${message.substring(0, 50)}...`)

      if (this.apiType === "inference") {
        return await this.generateInferenceResponse(message, personality)
      } else {
        return await this.generateDirectResponse(message, personality)
      }
    } catch (error) {
      console.error("❌ Response generation failed:", error.message)

      // Try to reinitialize if model failed
      if (error.message.includes("model") || error.message.includes("provider") || error.message.includes("503")) {
        console.log("🔄 Model issue detected, trying to reinitialize...")
        this.isInitialized = false
        this.currentModel = null

        try {
          await this.initialize()
          // Retry once with new model
          console.log("🔄 Retrying with new model...")
          return await this.generateResponse(message, personality)
        } catch (reinitError) {
          console.error("❌ Reinitialization failed:", reinitError.message)
        }
      }

      return {
        text: `I apologize, but I'm having technical difficulties connecting to the AI model. Error: ${error.message}. Please try again in a moment or check your Hugging Face setup.`,
        status: "error",
        model: this.currentModel || "none",
        provider: "error",
        confidence: 0.1,
        error: error.message,
      }
    }
  }

  async generateInferenceResponse(message, personality) {
    const formattedInput = this.formatInput(message, personality)
    const parameters = this.getParameters(personality)

    const response = await fetch(this.workingEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: formattedInput,
        parameters: parameters,
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`📄 Raw API response:`, data)

    let responseText = ""
    if (Array.isArray(data)) {
      responseText = data[0]?.generated_text || ""
    } else if (data.generated_text) {
      responseText = data.generated_text
    }

    const cleanedText = this.cleanResponse(responseText)

    if (!cleanedText || cleanedText.length < 3) {
      throw new Error("Generated response too short or empty")
    }

    // Update conversation history
    this.updateConversationHistory(message, cleanedText)

    console.log(`✅ Generated response: ${cleanedText.substring(0, 100)}...`)

    return {
      text: cleanedText,
      status: "success",
      model: this.currentModel,
      modelKey: this.currentModelKey,
      provider: "huggingface-inference",
      confidence: this.calculateConfidence(cleanedText),
      personality: personality,
      raw: responseText,
    }
  }

  async generateDirectResponse(message, personality) {
    const formattedInput = this.formatInput(message, personality)
    const parameters = this.getParameters(personality)

    const response = await fetch(this.workingEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: formattedInput,
        parameters: parameters,
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`📄 Raw API response:`, data)

    let responseText = ""
    if (Array.isArray(data)) {
      responseText = data[0]?.generated_text || ""
    } else if (data.generated_text) {
      responseText = data.generated_text
    }

    const cleanedText = this.cleanResponse(responseText)

    if (!cleanedText || cleanedText.length < 3) {
      throw new Error("Generated response too short or empty")
    }

    // Update conversation history
    this.updateConversationHistory(message, cleanedText)

    console.log(`✅ Generated response: ${cleanedText.substring(0, 100)}...`)

    return {
      text: cleanedText,
      status: "success",
      model: this.currentModel,
      modelKey: this.currentModelKey,
      provider: "huggingface-direct",
      confidence: this.calculateConfidence(cleanedText),
      personality: personality,
      raw: responseText,
    }
  }

  formatSystemMessage(personality) {
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

    return systemPrompt
  }

  formatInput(message, personality) {
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

    // Format based on model type
    if (this.currentModel.includes("deepseek")) {
      return `${systemPrompt}\n\nHuman: ${message}\nAssistant:`
    } else if (this.currentModel.includes("DialoGPT")) {
      return `${message}`
    } else if (this.currentModel.includes("flan")) {
      return `${systemPrompt} Question: ${message} Answer:`
    } else {
      return `${systemPrompt}\n\nUser: ${message}\nBot:`
    }
  }

  getParameters(personality) {
    const { maxTokens = 100, temperature = 0.7 } = personality

    return {
      max_new_tokens: Math.min(maxTokens, 150),
      temperature: Math.max(0.1, Math.min(1.0, temperature)),
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      stop: ["Human:", "User:", "\nHuman:", "\nUser:"], // Reduced from 5 to 4 stop sequences
    }
  }

  cleanResponse(text) {
    if (!text) return ""

    return text
      .trim()
      .replace(/^(Human:|User:|Bot:|Assistant:|Answer:)/i, "")
      .replace(/^\s*[-•]\s*/, "")
      .replace(/\n\n+/g, "\n")
      .replace(/\s+/g, " ")
      .trim()
  }

  updateConversationHistory(userMessage, botResponse) {
    // Add new conversation exchange
    this.conversationHistory.push({
      user: userMessage,
      bot: botResponse,
      timestamp: Date.now(),
      model: this.currentModel,
    })

    // Keep only last 10 exchanges to prevent memory leaks
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10)
    }

    // Clean up old conversations (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    this.conversationHistory = this.conversationHistory.filter(
      conv => conv.timestamp > oneHourAgo
    )
  }

  calculateConfidence(text) {
    if (!text) return 0.1

    let confidence = 0.7 // Base confidence

    // Higher confidence for longer responses
    if (text.length > 50) confidence += 0.1
    if (text.length > 100) confidence += 0.1

    // Lower confidence for very short responses
    if (text.length < 20) confidence -= 0.2

    // Higher confidence for well-structured responses
    if (text.includes(".") && text.length > 30) confidence += 0.1

    return Math.max(0.1, Math.min(0.95, confidence))
  }

  clearConversationHistory() {
    this.conversationHistory = []
    console.log("🧹 Conversation history cleared")
  }

  getConversationSummary() {
    return {
      totalExchanges: this.conversationHistory.length,
      recentTopics: this.conversationHistory.slice(-3).map((h) => h.user.substring(0, 30)),
      averageResponseLength:
        this.conversationHistory.length > 0
          ? this.conversationHistory.reduce((acc, h) => acc + h.bot.length, 0) / this.conversationHistory.length
          : 0,
      currentModel: this.currentModel,
    }
  }

  getDeepSeekFallbackResponse(message) {
    const responses = [
      "Hello! I'm here to help you. How can I assist you today?",
      "Hi there! I'm ready to answer your questions. What would you like to know?",
      "Greetings! I'm an AI assistant ready to help. What can I do for you?",
      "Hello! I'm here to provide information and assistance. How may I help you?",
      "Hi! I'm your AI assistant. What questions do you have for me today?",
      "Hello! I'm ready to help with any questions you might have. What's on your mind?",
      "Hi there! I'm here to assist you. What would you like to discuss?",
      "Greetings! I'm your AI helper. How can I be of service today?"
    ]

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      status: "fallback",
      model: "fallback",
      confidence: 0.7,
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      error: this.initializationError,
      currentModel: this.currentModel || "none",
      currentModelKey: this.currentModelKey || "none",
      workingEndpoint: this.workingEndpoint || "none",
      apiType: this.apiType || "none",
      provider: "huggingface",
      available: this.isInitialized,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      conversationHistory: this.conversationHistory.length,
      conversationSummary: this.getConversationSummary(),
    }
  }
}

export default new DeepseekService()
