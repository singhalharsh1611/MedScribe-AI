import { SUPPORTED_LANGUAGES } from '../languages';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

export const transcribeAudio = async (audioPath: string, languageCode: string, mode: string = 'transcribe') => {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  
  if (!language && languageCode !== 'auto') {
    throw new Error('Language not supported by STT provider');
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is missing');
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(audioPath));
  form.append('model', 'saaras:v3');
  form.append('mode', mode);
  
  if (languageCode !== 'auto' && language?.providerCode) {
    form.append('language_code', language.providerCode);
  } else {
    // For auto-detect, try sending 'Unknown' or omit. We'll omit it or send a default if required.
    // Some providers support omitting language_code for auto-detection.
    form.append('language_code', 'Unknown');
  }

  try {
    const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
      headers: {
        'api-subscription-key': apiKey,
        ...form.getHeaders(),
      },
    });

    return {
      text: response.data.transcript,
      detectedLanguage: languageCode,
    };
  } catch (error: any) {
    console.error('Sarvam STT Error:', error.response?.data || error.message);
    throw new Error('Transcription failed with the AI provider');
  }
};
