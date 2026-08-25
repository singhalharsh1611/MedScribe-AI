import { SUPPORTED_LANGUAGES } from '../languages';
import translate from 'google-translate-api-x';

export const translateText = async (text: string, sourceLanguageCode: string, targetLanguageCode: string) => {
  const sourceLanguage = sourceLanguageCode === 'auto' ? null : SUPPORTED_LANGUAGES.find(l => l.code === sourceLanguageCode);
  const targetLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguageCode);
  
  if ((!sourceLanguage && sourceLanguageCode !== 'auto') || !targetLanguage) {
    throw new Error('Unsupported language code');
  }

  if (sourceLanguageCode === targetLanguageCode) {
    return { translatedText: text };
  }

  const fromCode = sourceLanguageCode === 'auto' ? 'auto' : (sourceLanguage?.providerCode?.split('-')[0] || sourceLanguage?.code || 'auto');
  const toCode = targetLanguage?.providerCode?.split('-')[0] || targetLanguage?.code;

  if (!toCode) {
    throw new Error('Target language not supported');
  }

  try {
    const response = await translate(text, { from: fromCode, to: toCode });
    return { translatedText: response.text };
  } catch (error: any) {
    console.error('Google Translate API Error:', error);
    throw new Error('Translation failed with the free Google Translate API');
  }
};
