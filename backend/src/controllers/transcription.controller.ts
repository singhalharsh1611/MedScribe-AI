import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as mm from 'music-metadata';
import { transcribeAudio } from '../services/sarvam.service';
import { logUsage } from '../services/db.service';

export const handleTranscription = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  const language = req.body.language;
  const mode = req.body.mode || 'transcribe';

  if (!file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  if (!language) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: 'Language is required' });
  }

  console.log(`[Transcription] Request received for language: ${language}, mode: ${mode}`);
  
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Flush headers to establish the stream immediately
  res.flushHeaders();

  try {
    console.log(`[Transcription] Calling Sarvam STT service with file: ${file.path}`);
    
    // Accurately measure audio duration for billing
    let durationSeconds = 0;
    try {
      const metadata = await mm.parseFile(file.path);
      durationSeconds = metadata.format.duration || (file.size / 16000); // fallback if metadata fails
    } catch (metadataErr) {
      console.warn(`[Transcription] Could not read audio metadata, falling back to file size:`, metadataErr);
      durationSeconds = file.size / 16000;
    }

    const onProgress = (partialText: string) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', text: partialText })}\n\n`);
    };

    const result = await transcribeAudio(file.path, language, mode, onProgress);
    console.log(`[Transcription] Success for language: ${language}, mode: ${mode}`);
    
    const usage = await logUsage(durationSeconds, `[${mode.toUpperCase()}] ` + result.text);
    console.log(`[Usage] Logged usage: ID ${usage.id}, Duration: ${durationSeconds.toFixed(2)}s, Cost: ₹${usage.costInr.toFixed(4)}`);

    res.write(`data: ${JSON.stringify({
      type: 'done',
      text: result.text,
      language: language,
      detectedLanguage: result.detectedLanguage,
      costInr: usage.costInr
    })}\n\n`);
    
    res.end();
  } catch (error: any) {
    console.error(`[Transcription] Error:`, error.message || error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Failed to transcribe' })}\n\n`);
    res.end();
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
