import { Request, Response, NextFunction } from 'express';
import { translateText } from '../services/translate.service';
import { logTranslation } from '../services/db.service';

export const handleTranslation = async (req: Request, res: Response, next: NextFunction) => {
  const { text, sourceLanguage, targetLanguage } = req.body;

  if (!text || !sourceLanguage || !targetLanguage) {
    return res.status(400).json({ message: 'text, sourceLanguage, and targetLanguage are required' });
  }

  console.log(`[Translation] Request received: ${sourceLanguage} -> ${targetLanguage}`);
  
  try {
    const startTime = Date.now();
    const result = await translateText(text, sourceLanguage, targetLanguage);
    const endTime = Date.now();
    const translationTimeMs = endTime - startTime;

    await logTranslation(sourceLanguage, targetLanguage, text.length, translationTimeMs);
    console.log(`[Translation] Success in ${translationTimeMs}ms`);

    res.json({
      translatedText: result.translatedText,
      translationTimeMs
    });
  } catch (error: any) {
    console.error(`[Translation] Error:`, error.message || error);
    res.status(500).json({ message: error.message || 'Translation failed' });
  }
};
