const { OpenAI } = require('openai');
const PersonalityProcessor = require('../utils/personalityProcessor');
const axios = require('axios');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
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
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBlob,
        model: "whisper-1"
      });
      return transcription.text;
    } catch (error) {
      console.error('Speech to Text Error:', error);
      throw new Error('Transcription failed');
    }
  }

  async generateResponse(text, personalitySettings, modelType = 'gpt-4-turbo') {
    // Process personality traits
    const processedTraits = PersonalityProcessor.processPersonalityTraits(personalitySettings);

    try {
      const completion = await this.openai.chat.completions.create({
        model: modelType,
        messages: [
          { 
            role: "system", 
            content: processedTraits.systemPrompt
          },
          { role: "user", content: text }
        ],
        max_tokens: 300,
        temperature: processedTraits.temperature,
        top_p: processedTraits.topP
      });

      // Sentiment analysis
      const sentiment = await this.analyzeSentiment(text);

      return {
        text: completion.choices[0].message.content,
        confidence: this.calculateConfidence(completion),
        sentiment
      };
    } catch (error) {
      console.error('Response Generation Error:', error);
      throw new Error('Failed to generate AI response');
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

module.exports = new OpenAIService();