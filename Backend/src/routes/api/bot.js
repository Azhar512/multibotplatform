const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { SpeechClient } = require('@google-cloud/speech');
const { OpenAI } = require('openai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const audioStorage = require('./audioStorage');

// Initialize clients
const speechClient = new SpeechClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const textToSpeechClient = new TextToSpeechClient();



// Initialize storage on startup
audioStorage.initialize().catch(console.error);

// Handle speech-to-text conversion
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
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

    res.json({
      text: transcription,
      success: true
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    res.status(500).json({ error: 'Speech to text conversion failed' });
  }
});

// Handle bot responses
router.post('/bot/response', async (req, res) => {
  try {
    const { message, personality, config } = req.body;

    // Adjust the system message based on personality settings
    const systemMessage = generateSystemMessage(personality);

    // Get response from language model
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      temperature: personality.creativity || 0.7
    });

    let botResponse = {
      text: completion.choices[0].message.content,
      audioUrl: null
    };

    // Handle text-to-speech if enabled
    if (config.enableTextToSpeech) {
      const [audioResponse] = await textToSpeechClient.synthesizeSpeech({
        input: { text: botResponse.text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      });

      // Here you would need to save the audio file and generate a URL
      // This is a simplified example - you'd need to implement file storage
      botResponse.audioUrl = await saveAudioAndGetUrl(audioResponse.audioContent);
    }

    res.json(botResponse);
  } catch (error) {
    console.error('Bot response error:', error);
    res.status(500).json({ error: 'Failed to generate bot response' });
  }
});

// Save bot settings
router.post('/bot/settings', async (req, res) => {
  try {
    const { personality, config } = req.body;
    
    // Validate settings
    if (!isValidPersonality(personality)) {
      return res.status(400).json({ error: 'Invalid personality settings' });
    }

    // Here you would typically save to a database
    // For now, we'll just validate and return success
    res.json({ 
      success: true,
      personality,
      config
    });
  } catch (error) {
    console.error('Settings save error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});
// Add cleanup route for old audio files (optional)
router.delete('/audio/:filename', async (req, res) => {
    try {
      const fileUrl = `/audio/${req.params.filename}`;
      await audioStorage.delete(fileUrl);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting audio file:', error);
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
  // Implement your file storage logic here
  // This could use local filesystem, cloud storage, etc.
  // Return the URL where the audio can be accessed
  // For now, returning a placeholder
  return '/api/audio/response.mp3';
}

module.exports = router;