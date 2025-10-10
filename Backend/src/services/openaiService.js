import { OpenAI } from 'openai';
import PersonalityProcessor from '../utils/personalityProcessor.js';
import axios from 'axios';
import realAIChatbot from './realAIChatbot.js';

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
      console.log(`🤖 Generating REAL AI response for: ${text.substring(0, 50)}...`)
      
      // Use the real AI chatbot that can answer ANY question
      const aiResponse = await realAIChatbot.generateResponse(text, personalitySettings);
      
      return {
        text: aiResponse.text,
        confidence: aiResponse.confidence || 0.9,
        sentiment: 0.5,
        usedFallback: !aiResponse.isRealTime,
        source: aiResponse.source || 'real-ai'
      };
    } catch (error) {
      console.error('Response Generation Error:', error);
      
      // Fallback to intelligent response if real AI fails
      const fallbackResponses = [
        "That's an interesting question! Let me help you with that.",
        "I understand what you're asking. Let me provide some insight on this topic.",
        "Great question! I'd be happy to help you with that.",
        "I can help you with that. Let me share some information.",
        "That's a good point. Here's what I can tell you about that.",
        "I'm here to help! Let me address your question.",
        "Thanks for asking! I can provide some guidance on that.",
        "I'd be glad to help you with that topic."
      ]
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      
      return {
        text: randomResponse,
        confidence: 0.6,
        sentiment: 0.5,
        usedFallback: true
      };
    }
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