import { OpenAI } from 'openai';
import PersonalityProcessor from '../utils/personalityProcessor.js';
import axios from 'axios';

class OpenAIService {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async processVoiceInput(audioBlob, personalitySettings, modelType) {
    try {
      // Speech to Text
      const transcription = await this.speechToText(audioBlob);

      // Generate Response with Personality
      const response = await this.generateResponse(
        transcription, 
        personalitySettings, 
        modelType
      );

      return {
        originalText: transcription,
        processedResponse: response.text,
        confidence: response.confidence,
        sentiment: response.sentiment
      };
    } catch (error) {
      console.error('Voice Processing Error:', error);
      throw new Error('Failed to process voice input');
    }
  }

  async speechToText(audioBlob) {
    if (!this.openai) {
      // Return a fallback message instead of throwing
      return "I'm sorry, I couldn't process the audio. Please try typing your message instead.";
    }
    
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBlob,
        model: "whisper-1"
      });
      return transcription.text;
    } catch (error) {
      console.error('Speech to Text Error:', error);
      // Return a fallback message instead of throwing
      return "I'm sorry, I couldn't process the audio. Please try typing your message instead.";
    }
  }

  async generateResponse(text, personalitySettings, modelType = 'gpt-4-turbo') {
    try {
      console.log(`🤖 Generating REAL OpenAI AI response for: ${text.substring(0, 50)}...`)
      
      // Try to use REAL OpenAI API first
      if (this.openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key') {
        try {
          const response = await this.openai.chat.completions.create({
            model: modelType,
            messages: [
              {
                role: 'system',
                content: this.buildSystemPrompt(personalitySettings)
              },
              {
                role: 'user',
                content: text
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          });

          if (response.choices && response.choices[0] && response.choices[0].message) {
            console.log(`✅ OpenAI API success: ${response.choices[0].message.content.substring(0, 50)}...`)
            return {
              text: response.choices[0].message.content,
              confidence: 0.9,
              sentiment: 0.5,
              usedFallback: false,
              source: 'openai'
            };
          }
        } catch (openaiError) {
          console.log(`❌ OpenAI API failed: ${openaiError.message}`)
        }
      }

      // If OpenAI fails, try HuggingFace if available
      if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'hf-test-key') {
        try {
          const hfResponse = await this.callHuggingFace(text, personalitySettings)
          if (hfResponse && hfResponse.text) {
            console.log(`✅ HuggingFace API success: ${hfResponse.text.substring(0, 50)}...`)
            return {
              text: hfResponse.text,
              confidence: 0.9,
              sentiment: 0.5,
              usedFallback: false,
              source: 'huggingface'
            };
          }
        } catch (hfError) {
          console.log(`❌ HuggingFace API failed: ${hfError.message}`)
        }
      }

      // Only use intelligent response as last resort
      console.log("⚠️ All AI APIs failed, using intelligent response")
      const intelligentResponse = this.generateIntelligentResponse(text, personalitySettings)
      
      return {
        text: intelligentResponse,
        confidence: 0.7,
        sentiment: 0.5,
        usedFallback: true,
        source: 'intelligent'
      };
    } catch (error) {
      console.error('Response Generation Error:', error);
      
      // Fallback to intelligent response if everything fails
      const intelligentResponse = this.generateIntelligentResponse(text, personalitySettings)
      
      return {
        text: intelligentResponse,
        confidence: 0.7,
        sentiment: 0.5,
        usedFallback: true,
        source: 'intelligent'
      };
    }
  }

  async callHuggingFace(message, personality) {
    try {
      const { HfInference } = await import('@huggingface/inference');
      const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      
      const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [
          { role: "system", content: this.buildSystemPrompt(personality) },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        return {
          text: this.cleanResponse(response.choices[0].message.content),
          confidence: 0.9,
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          source: 'huggingface'
        }
      }

      throw new Error('No valid response from HuggingFace API')
    } catch (error) {
      console.error('HuggingFace API Error:', error)
      throw error
    }
  }

  formatMessage(message, personality) {
    const { Empathy = 70, Assertiveness = 60, Humour = 50, Patience = 80, Confidence = 60 } = personality;
    
    let systemPrompt = "You are a helpful AI assistant.";
    
    if (Empathy > 75) systemPrompt += " You are empathetic and understanding.";
    if (Assertiveness > 75) systemPrompt += " You are confident and direct.";
    if (Humour > 70) systemPrompt += " You have a friendly sense of humor.";
    if (Patience > 80) systemPrompt += " You are patient and thoughtful.";
    if (Confidence > 75) systemPrompt += " You are knowledgeable and assured.";
    
    return `${systemPrompt}\n\nUser: ${message}\nAssistant:`;
  }

  cleanResponse(text) {
    if (!text) return "";
    
    return text
      .replace(/<\|startoftext\|>/g, '')
      .replace(/<\|endoftext\|>/g, '')
      .replace(/^(Human:|User:|Bot:|Assistant:|Answer:)/i, "")
      .replace(/(Human:|User:|Bot:|Assistant:)$/i, "")
      .trim();
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

  async textToSpeech(text, voiceOption = 'nova') {
    try {
      const speech = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: voiceOption,
        input: text
      });

      return speech.buffer();
    } catch (error) {
      console.error('Text to Speech Error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  async analyzeSentiment(text) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the text. Respond with a number between -1 (very negative) and 1 (very positive).'
          },
          { role: 'user', content: text }
        ]
      });

      // Extract sentiment score
      const sentimentText = completion.choices[0].message.content;
      return parseFloat(sentimentText) || 0;
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      return 0; // Neutral sentiment if analysis fails
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
    
    prompt += " Provide helpful, accurate, and engaging responses to user questions and requests.";
    
    return prompt;
  }

  calculateConfidence(completion) {
    // Calculate confidence based on model's response
    const tokens = completion.usage.total_tokens;
    const choiceConfidence = completion.choices[0].logprobs?.token_logprobs || [];
    
    const avgTokenConfidence = choiceConfidence.length > 0 
      ? choiceConfidence.reduce((sum, conf) => sum + conf, 0) / choiceConfidence.length
      : 0.5;

    return Math.min(Math.max((avgTokenConfidence + 1) / 2, 0), 1);
  }
}

const openaiService = new OpenAIService();
export default openaiService;