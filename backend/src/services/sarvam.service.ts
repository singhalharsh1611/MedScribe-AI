import { SUPPORTED_LANGUAGES } from '../languages';
import * as fs from 'fs';
import { WebSocket } from 'ws';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic as string);
}

const transcribeWebSocket = (
  audioPath: string, 
  languageProviderCode: string | undefined, 
  mode: string, 
  apiKey: string,
  onProgress?: (text: string) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const urlParams = new URLSearchParams({
      language_code: languageProviderCode || 'Unknown',
      model: 'saaras:v3-realtime',
      mode: mode,
      stream_type: 'balanced'
    });
    
    const wsUrl = `wss://api.sarvam.ai/speech-to-text-realtime/ws?${urlParams.toString()}`;
    const sarvamWs = new WebSocket(wsUrl, {
      headers: { 'api-subscription-key': apiKey }
    });
    
    let fullTranscript = '';
    let isError = false;

    sarvamWs.on('open', () => {
      // Decode audio to raw PCM (s16le, 1 channel, 16kHz) and stream it
      const audioStream = ffmpeg(audioPath)
        .format('s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .pipe();

      audioStream.on('data', (chunk: Buffer) => {
        if (sarvamWs.readyState === WebSocket.OPEN) {
          // Sarvam has a strict 32000 byte per-frame cap for balanced stream_type
          const maxChunkSize = 32000;
          for (let i = 0; i < chunk.length; i += maxChunkSize) {
            const subChunk = chunk.subarray(i, i + maxChunkSize);
            sarvamWs.send(JSON.stringify({
              event: 'audio_input',
              audio: subChunk.toString('base64')
            }));
          }
        }
      });

      audioStream.on('end', () => {
        if (sarvamWs.readyState === WebSocket.OPEN) {
          sarvamWs.send(JSON.stringify({ event: 'end' }));
        }
      });

      audioStream.on('error', (err: any) => {
        if (!isError) {
          isError = true;
          sarvamWs.close();
          reject(err);
        }
      });
    });

    sarvamWs.on('message', (msg: Buffer) => {
      try {
        const res = JSON.parse(msg.toString());
        if (res.event === 'transcript.partial') {
          if (onProgress) {
            onProgress((fullTranscript + ' ' + res.text).trim());
          }
        } else if (res.event === 'transcript.final') {
          fullTranscript += (fullTranscript ? ' ' : '') + res.text;
          if (onProgress) {
            onProgress(fullTranscript.trim());
          }
        } else if (res.event === 'session.end') {
          if (!isError) {
            sarvamWs.close();
            resolve(fullTranscript.trim());
          }
        } else if (res.event === 'error') {
          if (!isError) {
            isError = true;
            sarvamWs.close();
            reject(new Error(res.message));
          }
        }
      } catch (e) {
        console.error('Error parsing Sarvam WS message:', e);
      }
    });

    sarvamWs.on('close', () => {
      if (!isError) {
        resolve(fullTranscript.trim());
      }
    });

    sarvamWs.on('error', (err) => {
      if (!isError) {
        isError = true;
        reject(err);
      }
    });
  });
};

export const transcribeAudio = async (
  audioPath: string, 
  languageCode: string, 
  mode: string = 'transcribe',
  onProgress?: (text: string) => void
) => {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
  
  if (!language && languageCode !== 'auto') {
    throw new Error('Language not supported by STT provider');
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is missing');
  }

  // Retry logic for ETIMEDOUT network blips
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const providerCode = languageCode === 'auto' ? 'auto' : language?.providerCode;
      const transcript = await transcribeWebSocket(audioPath, providerCode, mode, apiKey, onProgress);
      return {
        text: transcript,
        detectedLanguage: languageCode,
      };
    } catch (error: any) {
      if (error.code === 'ETIMEDOUT' && attempt < maxAttempts) {
        console.warn(`[Retry] WebSocket ETIMEDOUT. Retrying attempt ${attempt + 1}/${maxAttempts}...`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      console.error('Sarvam STT Error:', error.message || error);
      throw new Error(`WebSocket STT Error: ${error.message || 'Unknown error'}`);
    }
  }
  throw new Error('Transcription failed after retries');
};
