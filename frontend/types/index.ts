export interface Language {
  code: string;
  name: string;
  nativeName: string;
  sttSupported: boolean;
  translationSupported: boolean;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  detectedLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  translationTimeMs?: number;
}
