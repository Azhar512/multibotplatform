import OpenAI from 'openai';
import TwilioClient from 'twilio';
import SentimentAnalyzer from 'sentiment';

class AICallService {
  constructor(config) {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    this.twilio = new TwilioClient(
      config.TWILIO_ACCOUNT_SID, 
      config.TWILIO_AUTH_TOKEN
    );
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  async transcribeSpeech(audioBlob) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBlob,
        model: 'whisper-1'
      });
      return transcription.text;
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw new Error('Failed to transcribe speech');
    }
  }

  async generateAIResponse(transcript, personalitySettings) {
    // Use personality-driven response generation
    const sentiment = this.analyzeSentiment(transcript);
    
    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system', 
          content: this.createPersonalityPrompt(personalitySettings, sentiment)
        },
        { 
          role: 'user', 
          content: transcript 
        }
      ]
    });

    return {
      text: aiResponse.choices[0].message.content,
      sentiment: sentiment.score,
      confidence: aiResponse.choices[0].confidence || 0.8
    };
  }

  analyzeSentiment(text) {
    return this.sentimentAnalyzer.analyze(text);
  }

  createPersonalityPrompt(personalitySettings, sentiment) {
    const { Empathy, Assertiveness, Humour, Patience, Confidence } = personalitySettings;
    
    return `You are an AI communication assistant with the following personality traits:
    - Empathy: ${Empathy}%
    - Assertiveness: ${Assertiveness}%
    - Humour: ${Humour}%
    - Patience: ${Patience}%
    - Confidence: ${Confidence}%

    Current conversation sentiment: ${sentiment.score > 0 ? 'Positive' : sentiment.score < 0 ? 'Negative' : 'Neutral'}

    Respond appropriately, adapting your communication style to these traits.`;
  }

  async textToSpeech(text, voiceOption = 'nova') {
    try {
      const speech = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceOption,
        input: text
      });
      
      return speech.buffer();
    } catch (error) {
      console.error('Text-to-speech conversion error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  async routeCall(callParams) {
    // Implement advanced call routing logic
    const { phoneNumber, personalitySettings, industry } = callParams;
    
    // Example routing logic based on industry and personality
    const routingDecision = this.determineCallRouting(
      phoneNumber, 
      personalitySettings, 
      industry
    );

    return routingDecision;
  }

  determineCallRouting(phoneNumber, personalitySettings, industry) {
    // Sophisticated routing logic
    const confidenceThreshold = personalitySettings.Confidence;
    const empathyLevel = personalitySettings.Empathy;

    // Example routing rules
    if (industry === 'finance' && confidenceThreshold > 80) {
      return {
        route: 'direct_senior_agent',
        priority: 'high'
      };
    } else if (industry === 'customer_service' && empathyLevel > 70) {
      return {
        route: 'empathy_trained_agent',
        priority: 'medium'
      };
    }

    return {
      route: 'standard_queue',
      priority: 'low'
    };
  }
}

export default AICallService;