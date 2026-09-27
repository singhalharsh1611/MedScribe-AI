import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { transcribeAudio } from './asr.service';
import { uploadAudioFile } from './cloudinary.service';
import { logUsage } from './db.service';
import * as fs from 'fs';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6380', { maxRetriesPerRequest: null });

export const transcriptionQueue = new Queue('transcription', { connection });
export const transcriptionQueueEvents = new QueueEvents('transcription', { connection });

const worker = new Worker('transcription', async (job: Job) => {
  const { filePath, language, mode, durationSeconds } = job.data;
  
  await job.updateProgress({ status: 'processing' });
  
  let result;
  try {
    result = await transcribeAudio(filePath, (progressText) => {
      // Could emit partial progress here if desired
    });
    
    let audioUrl = null;
    try {
      audioUrl = await uploadAudioFile(filePath);
    } catch(err) {
      console.error('[Cloudinary] Failed to upload audio:', err);
    }

    try {
      await logUsage(durationSeconds, result.text, audioUrl);
    } catch (usageError) {
      console.error('[USAGE_LOG_FAILED] Usage logging failed:', usageError);
    }

    return {
      text: result.text,
      detectedLanguage: result.detectedLanguage,
      audioUrl
    };
  } finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('[Transcription] Error cleaning up file:', cleanupErr);
    }
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

