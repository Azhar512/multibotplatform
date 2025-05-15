const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');

class SpeechService {
  constructor() {
    this.ttsClient = new TextToSpeechClient();
    this.sttClient = new speech.SpeechClient();
  }

  async textToSpeech(text) {
    const request = {
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await this.ttsClient.synthesizeSpeech(request);
    // Save audio file and return URL
    return this.saveAudioFile(response.audioContent);
  }

  async speechToText(audioBlob) {
    const audio = {
      content: audioBlob.toString('base64'),
    };
    
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await this.sttClient.recognize(request);
    return response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
  }
}