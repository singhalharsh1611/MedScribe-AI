import { Request, Response, NextFunction } from 'express';
import { translateText } from '../services/translate.service';
import { logTranslation } from '../services/db.service';
import { sendServerError } from '../utils/http-error';

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

    try {
      await logTranslation(sourceLanguage, targetLanguage, text.length, translationTimeMs);
    } catch (usageError) {
      console.error('[TRANSLATION_USAGE_LOG_FAILED] Translation succeeded but usage logging failed:', usageError);
    }
    console.log(`[Translation] Success in ${translationTimeMs}ms`);

    res.json({
      translatedText: result.translatedText,
      translationTimeMs
    });
  } catch (error) {
    sendServerError(res, 'TRANSLATION_FAILED', 'Unable to translate the text.', error);
  }
};
