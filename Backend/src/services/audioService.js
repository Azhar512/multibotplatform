import { Readable } from 'stream';
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

class AudioService {
  constructor() {
    this.speechClient = new speech.SpeechClient();
    this.ttsClient = new textToSpeech.TextToSpeechClient();
  }

  async speechToText(audioBuffer) {
    const audio = {
      content: audioBuffer.toString('base64'),
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

    try {
      const [response] = await this.speechClient.recognize(request);
      return response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    } catch (error) {
      console.error('Speech to text error:', error);
      throw new Error('Speech to text conversion failed');
    }
  }

  async textToSpeech(text) {
    const request = {
      input: { text: text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    try {
      const [response] = await this.ttsClient.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error('Text to speech error:', error);
      throw new Error('Text to speech conversion failed');
    }
  }
}

// Export a single instance of the service
export default new AudioService();