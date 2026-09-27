import { Request, Response } from 'express';
import * as mm from 'music-metadata';
import { transcriptionQueue, transcriptionQueueEvents } from '../services/queue.service';
import { uploadAudioFile } from '../services/cloudinary.service';
import { sendServerError } from '../utils/http-error';
import { Job } from 'bullmq';

export const handleTranscription = async (req: Request, res: Response) => {
  const file = req.file;
  const language = req.body.language || 'en';
  const mode = req.body.mode || 'transcribe';

  if (!file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  let durationSeconds = 0;
  try {
    const metadata = await mm.parseFile(file.path);
    durationSeconds = metadata.format.duration || (file.size / 16000);
  } catch (metadataErr) {
    durationSeconds = (file.size / 16000);
  }

  const job = await transcriptionQueue.add('transcribe', {
    filePath: file.path,
    language,
    mode,
    durationSeconds
  });

  res.json({ jobId: job.id });
};

export const handleTranscriptionStatus = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const job = await Job.fromId(transcriptionQueue, jobId);
  if (!job) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Job not found' })}\n\n`);
    res.end();
    return;
  }

  const onCompleted = async (args: { jobId: string; returnvalue: any }) => {
    if (args.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'final', ...args.returnvalue })}\n\n`);
      cleanup();
    }
  };

  const onFailed = (args: { jobId: string; failedReason: string }) => {
    if (args.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: args.failedReason })}\n\n`);
      cleanup();
    }
  };

  const onProgress = (args: { jobId: string; data: any }) => {
    if (args.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'progress', data: args.data })}\n\n`);
    }
  };

  transcriptionQueueEvents.on('completed', onCompleted);
  transcriptionQueueEvents.on('failed', onFailed);
  transcriptionQueueEvents.on('progress', onProgress);

  const cleanup = () => {
    transcriptionQueueEvents.off('completed', onCompleted);
    transcriptionQueueEvents.off('failed', onFailed);
    transcriptionQueueEvents.off('progress', onProgress);
    res.end();
  };

  req.on('close', cleanup);

  // Check if already completed/failed
  const state = await job.getState();
  if (state === 'completed') {
    const result = await job.returnvalue;
    res.write(`data: ${JSON.stringify({ type: 'final', ...result })}\n\n`);
    cleanup();
  } else if (state === 'failed') {
    res.write(`data: ${JSON.stringify({ type: 'error', error: job.failedReason })}\n\n`);
    cleanup();
  } else {
    res.write(`data: ${JSON.stringify({ type: 'progress', data: 'Waiting in queue...' })}\n\n`);
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
