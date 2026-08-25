import axios from 'axios';
import { Language, TranscriptionResponse, TranslationResponse } from '../types';

const getApiBaseUrl = () => {
  // If environment variable is explicitly set (e.g., Vercel), use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export const getLanguages = async (): Promise<Language[]> => {
  const response = await axios.get<Language[]>(`${API_BASE_URL}/languages`);
  return response.data;
};

export const transcribeAudio = async (
  audioBlob: Blob,
  languageCode: string,
  mode: string = 'transcribe',
): Promise<TranscriptionResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('language', languageCode);
  formData.append('mode', mode);

  const response = await axios.post<TranscriptionResponse>(
    `${API_BASE_URL}/transcription`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<TranslationResponse> => {
  const response = await axios.post<TranslationResponse>(
    `${API_BASE_URL}/translation`,
    {
      text,
      sourceLanguage,
      targetLanguage,
    }
  );

  return response.data;
};
