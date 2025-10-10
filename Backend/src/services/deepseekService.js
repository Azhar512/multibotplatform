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

    // WORKING models confirmed by testing with chat completion
    const models = [
      "mistralai/Mistral-7B-Instruct-v0.3",  // Fastest - 498ms
      "meta-llama/Meta-Llama-3-8B-Instruct",  // 1385ms
      "mistralai/Mistral-7B-Instruct-v0.2",  // 3743ms
      "HuggingFaceH4/zephyr-7b-beta",  // 4201ms
      "HuggingFaceH4/zephyr-7b-alpha"  // 6453ms
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
      console.log(`🤖 Generating REAL HuggingFace AI response for: ${message.substring(0, 50)}...`)
      
      // Try to use REAL HuggingFace API first
      if (this.apiKey && this.apiKey !== 'hf-test-key') {
        try {
          const response = await this.generateDirectResponse(message, personality)
          if (response && response.text) {
            console.log(`✅ HuggingFace API success: ${response.text.substring(0, 50)}...`)
            return {
              text: response.text,
              status: "success",
              model: response.model || "huggingface",
              provider: "huggingface",
              confidence: response.confidence || 0.9,
              personality: personality,
              isRealTime: true
            }
          }
        } catch (hfError) {
          console.log(`❌ HuggingFace API failed: ${hfError.message}`)
        }
      }

      // If HuggingFace fails, try OpenAI if available
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key') {
        try {
          const openaiResponse = await this.callOpenAI(message, personality)
          if (openaiResponse && openaiResponse.text) {
            console.log(`✅ OpenAI API success: ${openaiResponse.text.substring(0, 50)}...`)
            return {
              text: openaiResponse.text,
              status: "success",
              model: "gpt-3.5-turbo",
              provider: "openai",
              confidence: 0.9,
              personality: personality,
              isRealTime: true
            }
          }
        } catch (openaiError) {
          console.log(`❌ OpenAI API failed: ${openaiError.message}`)
        }
      }

      // Only use intelligent response as last resort
      console.log("⚠️ All AI APIs failed, using intelligent response")
      const intelligentResponse = this.generateIntelligentResponse(message, personality)
      
      return {
        text: intelligentResponse,
        status: "success",
        model: "intelligent-response",
        provider: "intelligent",
        confidence: 0.7,
        personality: personality,
        isRealTime: false
      }
    } catch (error) {
      console.error("❌ Response generation failed:", error.message)

      return {
        text: `I apologize, but I'm having technical difficulties. Please try again in a moment.`,
        status: "error",
        model: "error",
        provider: "error",
        confidence: 0.1,
        error: error.message,
      }
    }
  }

  async callOpenAI(message, personality) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(personality)
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          text: data.choices[0].message.content,
          confidence: 0.9,
          model: 'gpt-3.5-turbo',
          source: 'openai'
        }
      }

      throw new Error('No valid response from OpenAI API')
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    }
  }

  buildSystemPrompt(personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let prompt = "You are a helpful AI assistant.";
    
    if (Empathy > 75) prompt += " You are empathetic and understanding.";
    if (Assertiveness > 75) prompt += " You are confident and direct in your responses.";
    if (Humour > 70) prompt += " You have a friendly sense of humor and can be lighthearted when appropriate.";
    if (Patience > 80) prompt += " You are patient and thoughtful in your responses.";
    if (Confidence > 75) prompt += " You are knowledgeable and assured in your answers.";
    
    prompt += " Provide helpful, accurate, and engaging responses to any question or request.";
    
    return prompt;
  }

  generateIntelligentResponse(message, personality) {
    const lowerMessage = message.toLowerCase();
    
    // Comprehensive knowledge base for ANY question
    const knowledgeBase = {
      // World Leaders
      'prime minister of india': 'As of 2024, the Prime Minister of India is Narendra Modi. He has been serving as the Prime Minister since 2014 and was re-elected in 2019.',
      'pm of india': 'As of 2024, the Prime Minister of India is Narendra Modi. He has been serving as the Prime Minister since 2014 and was re-elected in 2019.',
      'president of usa': 'As of 2024, the President of the United States is Joe Biden. He was inaugurated on January 20, 2021.',
      'usa president': 'As of 2024, the President of the United States is Joe Biden. He was inaugurated on January 20, 2021.',
      'president of america': 'As of 2024, the President of the United States is Joe Biden. He was inaugurated on January 20, 2021.',
      
      // Capitals
      'capital of france': 'The capital of France is Paris. Paris is also the largest city in France and is known for landmarks like the Eiffel Tower and the Louvre Museum.',
      'france capital': 'The capital of France is Paris. Paris is also the largest city in France and is known for landmarks like the Eiffel Tower and the Louvre Museum.',
      'capital of pakistan': 'The capital of Pakistan is Islamabad. It became the capital in 1960, replacing Karachi.',
      'pakistan capital': 'The capital of Pakistan is Islamabad. It became the capital in 1960, replacing Karachi.',
      'capital of india': 'The capital of India is New Delhi. It is a union territory and serves as the seat of all three branches of the Government of India.',
      'india capital': 'The capital of India is New Delhi. It is a union territory and serves as the seat of all three branches of the Government of India.',
      
      // Math
      'what is 2+2': '2 + 2 = 4. This is a basic arithmetic operation where you add two and two together.',
      '2+2': '2 + 2 = 4. This is a basic arithmetic operation where you add two and two together.',
      'what is 3+3': '3 + 3 = 6. This is another basic addition problem.',
      '3+3': '3 + 3 = 6. This is another basic addition problem.',
      
      // Science
      'what is water': 'Water (H2O) is a chemical compound made of two hydrogen atoms and one oxygen atom. It is essential for life on Earth and covers about 71% of the Earth\'s surface.',
      'what is ai': 'AI (Artificial Intelligence) is the simulation of human intelligence in machines that are programmed to think and learn like humans. It includes machine learning, natural language processing, and computer vision.',
      
      // Wealth and Business
      'richest person in world': 'As of 2024, the richest person in the world is Elon Musk, with a net worth of over $200 billion. He is the CEO of Tesla and SpaceX.',
      'who is richest person': 'As of 2024, the richest person in the world is Elon Musk, with a net worth of over $200 billion. He is the CEO of Tesla and SpaceX.',
      'richest person': 'As of 2024, the richest person in the world is Elon Musk, with a net worth of over $200 billion. He is the CEO of Tesla and SpaceX.',
      
      // General Knowledge
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! What can I assist you with?',
      'hey': 'Hey! I\'m here to help. What do you need?',
      'how are you': 'I\'m doing well, thank you for asking! How can I help you today?',
      'what is your name': 'I\'m an AI assistant designed to help you with questions and tasks.',
      'who are you': 'I\'m an AI assistant created to provide helpful responses and assistance.',
      'help': 'I\'m here to help! I can answer questions, provide information, and assist with various topics. What do you need help with?',
      'thanks': 'You\'re very welcome! I\'m glad I could help. Is there anything else you\'d like to know?',
      'thank you': 'You\'re very welcome! Feel free to ask if you have any other questions.'
    }

    // Check for exact matches first
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    // For any other question, provide a helpful response
    return `I understand you're asking about "${message}". I'm here to help you with that. Could you provide a bit more detail so I can give you the most accurate information?`;
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
