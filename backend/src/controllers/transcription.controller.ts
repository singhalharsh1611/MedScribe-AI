import { Request, Response } from 'express';
import * as fs from 'fs';
import * as mm from 'music-metadata';
import { transcribeAudioModal } from '../services/modal.service';
import { logUsage } from '../services/db.service';
import { uploadAudioFile } from '../services/cloudinary.service';
import { sendServerError } from '../utils/http-error';

export const handleTranscription = async (req: Request, res: Response) => {
  const file = req.file;
  const language = req.body.language || 'en';
  const mode = req.body.mode || 'transcribe';

  if (!file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  console.log(`[Transcription] Request received for language: ${language}, mode: ${mode}`);
  
  try {
    console.log(`[Transcription] Calling Modal STT service with file: ${file.path}`);
    
    // Accurately measure audio duration for billing
    let durationSeconds = 0;
    try {
      const metadata = await mm.parseFile(file.path);
      durationSeconds = metadata.format.duration || (file.size / 16000); // fallback if metadata fails
    } catch (metadataErr) {
      console.warn(`[Transcription] Could not read audio metadata, falling back to file size:`, metadataErr);
      durationSeconds = (file.size / 16000);
    }

    const result = await transcribeAudioModal(file.path);
    console.log(`[Transcription] Success for language: ${language}, mode: ${mode}`);
    
    // Send response immediately so client isn't waiting for Cloudinary upload
    res.json({ text: result.text, detectedLanguage: result.detectedLanguage, audioUrl: null });

    // Background task: Upload to Cloudinary, log usage, and clean up file
    (async () => {
      let audioUrl = null;
      try {
        audioUrl = await uploadAudioFile(file.path);
      } catch(err) {
        console.error('[Cloudinary] Failed to upload audio:', err);
      }

      try {
        await logUsage(durationSeconds, result.text, audioUrl);
        // Costing log removed per user request
      } catch (usageError) {
        console.error('[USAGE_LOG_FAILED] Usage logging failed:', usageError);
      } finally {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.error('[Transcription] Error cleaning up file:', cleanupErr);
        }
      }
    })();

  } catch (error) {
    console.error('[Transcription] Error:', error);
    res.status(502).json({
      code: 'TRANSCRIPTION_FAILED',
      error: 'Unable to transcribe the audio recording.',
    });
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupErr) {
      console.error('[Transcription] Error cleaning up file:', cleanupErr);
    }
  }
};

export const handleAudioUpload = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No audio file provided' });
        
        console.log('[Cloudinary] Uploading raw audio Blob...');
        const audioUrl = await uploadAudioFile(file.path);
        res.json({ audioUrl });
    } catch (error) {
        sendServerError(res, 'AUDIO_UPLOAD_FAILED', 'Unable to upload the audio recording.', error);
    }
};
