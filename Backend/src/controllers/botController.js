//this is for botinteraction

const speechService = require('../services/speechService');
const nlpService = require('../services/nlpService');
const botService = require('../services/botService');

exports.handleBotResponse = async (req, res) => {
  try {
    const { message, settings } = req.body;
    
    // Process message with NLP
    const processedMessage = await nlpService.processText(message);
    
    // Generate bot response
    const botResponse = await botService.generateResponse(processedMessage, settings);
    
    // Convert to speech if needed
    let audioUrl = null;
    if (settings.enableTextToSpeech) {
      audioUrl = await speechService.textToSpeech(botResponse);
    }
    
    res.json({ botResponse, audioUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleSpeechToText = async (req, res) => {
  try {
    const audioBlob = req.body;
    const text = await speechService.speechToText(audioBlob);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
