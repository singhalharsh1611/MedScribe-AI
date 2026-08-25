import axios from 'axios';
import { Language, TranscriptionResponse, TranslationResponse } from '../types';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If running in the browser, construct the URL based on the current hostname
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
  }
  // Fallback for SSR or if environment variable is explicitly set
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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
