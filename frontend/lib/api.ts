import axios from 'axios';
import { Language, TranscriptionResponse, TranslationResponse } from '../types';

const getApiBaseUrl = () => {
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

export const transcribeAudio = (
  audioBlob: Blob,
  languageCode: string,
  mode: string = 'transcribe',
  onProgress?: (text: string) => void
): Promise<TranscriptionResponse> => {
  return new Promise(async (resolve, reject) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', languageCode);
    formData.append('mode', mode);

    try {
      const response = await fetch(`${API_BASE_URL}/transcription`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok && response.status !== 200) {
        throw new Error('Failed to start transcription');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'progress' && onProgress) {
                onProgress(data.text);
              } else if (data.type === 'done') {
                resolve({
                  text: data.text,
                  detectedLanguage: data.detectedLanguage,
                  costInr: data.costInr
                });
              } else if (data.type === 'error') {
                reject(new Error(data.message));
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (err) {
      reject(err);
    }
  });
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
