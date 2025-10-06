import express from 'express';
import multer from 'multer';
import { SpeechClient } from '@google-cloud/speech';
import { OpenAI } from 'openai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import audioStorage from './audioStorage.js';
import { serviceLogger as logger } from '../../config/logger.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize clients with error handling
let speechClient, openai, textToSpeechClient;

try {
  speechClient = new SpeechClient();
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  textToSpeechClient = new TextToSpeechClient();
} catch (error) {
  logger.error('Failed to initialize AI clients:', { error: error.message });
}

// Initialize storage on startup
audioStorage.initialize().catch((err) => {
  console.error('Audio storage initialization failed:', err.message);
});

// Handle speech-to-text conversion
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!speechClient) {
      return res.status(500).json({ error: 'Speech service not available' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioBytes = req.file.buffer.toString('base64');

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    logger.info('Speech to text conversion successful', { 
      transcriptionLength: transcription.length 
    });

    res.json({
      text: transcription,
      success: true
    });
  } catch (error) {
    logger.error('Speech to text error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Speech to text conversion failed' });
  }
});

// Handle bot responses
router.post('/bot/response', async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    const { message, personality, config } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const systemMessage = generateSystemMessage(personality || {});

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      temperature: personality?.creativity || 0.7,
      max_tokens: 500
    });

    let botResponse = {
      text: completion.choices[0].message.content,
      audioUrl: null
    };

    if (config?.enableTextToSpeech && textToSpeechClient) {
      try {
        const [audioResponse] = await textToSpeechClient.synthesizeSpeech({
          input: { text: botResponse.text },
          voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
          audioConfig: { audioEncoding: 'MP3' },
        });

        botResponse.audioUrl = await saveAudioAndGetUrl(audioResponse.audioContent);
      } catch (ttsError) {
        logger.warn('Text-to-speech failed, returning text only', { error: ttsError.message });
      }
    }

    logger.info('Bot response generated successfully', { 
      messageLength: message.length,
      responseLength: botResponse.text.length 
    });

    res.json(botResponse);
  } catch (error) {
    logger.error('Bot response error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to generate bot response' });
  }
});

// Save bot settings
router.post('/bot/settings', async (req, res) => {
  try {
    const { personality, config } = req.body;
    
    if (personality && !isValidPersonality(personality)) {
      return res.status(400).json({ error: 'Invalid personality settings' });
    }

    logger.info('Bot settings saved successfully', { 
      hasPersonality: !!personality,
      hasConfig: !!config 
    });

    res.json({ 
      success: true,
      personality: personality || {},
      config: config || {}
    });
  } catch (error) {
    logger.error('Settings save error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Delete old audio files
router.delete('/audio/:filename', async (req, res) => {
  try {
    const fileUrl = `/audio/${req.params.filename}`;
    await audioStorage.delete(fileUrl);
    
    logger.info('Audio file deleted successfully', { filename: req.params.filename });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting audio file:', { error: error.message, filename: req.params.filename });
    res.status(500).json({ error: 'Failed to delete audio file' });
  }
});

// Helper functions
function generateSystemMessage(personality) {
  const formality = personality.formality || 0.5;
  const friendliness = personality.friendliness || 0.7;
  
  return `You are a helpful assistant with the following characteristics:
    - Formality level: ${formality > 0.7 ? 'Very formal' : formality > 0.3 ? 'Casual' : 'Informal'}
    - Friendliness level: ${friendliness > 0.7 ? 'Very friendly' : friendliness > 0.3 ? 'Pleasant' : 'Professional'}
    Please adjust your responses accordingly.`;
}

function isValidPersonality(personality) {
  const requiredFields = ['formality', 'friendliness', 'creativity'];
  return requiredFields.every(field => 
    typeof personality[field] === 'number' && 
    personality[field] >= 0 && 
    personality[field] <= 1
  );
}

async function saveAudioAndGetUrl(audioContent) {
  return '/api/audio/response.mp3'; // Replace with actual logic
}

export default router;
