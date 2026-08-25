import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import { transcribeAudio } from '../services/sarvam.service';
import { logUsage } from '../services/db.service';

export const handleTranscription = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  const language = req.body.language;
  const mode = req.body.mode || 'transcribe'; // Added mode parameter

  if (!file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  if (!language) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: 'Language is required' });
  }

  console.log(`[Transcription] Request received for language: ${language}, mode: ${mode}`);
  
  try {
    console.log(`[Transcription] Calling Sarvam STT service with file: ${file.path}`);
    const result = await transcribeAudio(file.path, language, mode);
    console.log(`[Transcription] Success for language: ${language}, mode: ${mode}`);
    
    // Calculate approximate duration based on file size (assuming ~16kbps for webm/mp3)
    // 16kbps = 2KB/sec. duration = size / 2000
    // If it's a WAV (16kHz 16-bit PCM), it's 32KB/sec.
    // Let's estimate 16KB/sec on average for uploaded audio.
    const durationSeconds = file.size / 16000;
    const usage = logUsage(durationSeconds, `[${mode.toUpperCase()}] ` + result.text);
    console.log(`[Usage] Logged usage: ID ${usage.id}, Cost: ₹${usage.costInr.toFixed(4)}`);

    res.json({
      text: result.text,
      language: language,
      detectedLanguage: result.detectedLanguage,
      costInr: usage.costInr
    });
  } catch (error: any) {
    console.error(`[Transcription] Error:`, error.message || error);
    res.status(500).json({ message: error.message || 'Failed to transcribe' });
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up file:', cleanupErr);
    }
  }
};
