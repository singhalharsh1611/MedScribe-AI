import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { logUsage } from './db.service';
import { authenticateRequest } from '../middleware/auth.middleware';

export const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    try {
      const principal = await authenticateRequest(request as any);
      if (!principal || (principal.kind !== 'superadmin' && !['doctor', 'admin'].includes(principal.role))) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch {
      socket.write('HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] Client connected for live transcription');
    let sarvamWs: WebSocket | null = null;
    let finalizedText = '';
    let currentPartialText = '';
    let durationSeconds = 0;
    
    ws.on('message', (message: string | Buffer) => {
      try {
        const str = message.toString();
        const data = JSON.parse(str);
        
        if (data.type === 'start') {
          const apiKey = process.env.SARVAM_API_KEY || '';
          if (!apiKey) {
             console.error('[STREAMING_PROVIDER_NOT_CONFIGURED] SARVAM_API_KEY is missing');
             ws.send(JSON.stringify({
               type: 'error',
               code: 'STREAMING_UNAVAILABLE',
               message: 'Live transcription is unavailable.',
             }));
             return;
          }
          
          const mode = data.mode || 'transcribe';
          const languageCode = data.languageCode || 'hi-IN';
          // Use realtime API for both, but configure mode appropriately
          const urlParams = new URLSearchParams({
            language_code: languageCode,
            model: 'saaras:v3-realtime',
            mode: mode,
            stream_type: 'balanced'
          });
          const wsUrl = `wss://api.sarvam.ai/speech-to-text-realtime/ws?${urlParams.toString()}`;

          sarvamWs = new WebSocket(wsUrl, {
            headers: { 'api-subscription-key': apiKey }
          });
          
          sarvamWs.on('open', () => {
             console.log('[WS] Connected to Sarvam AI WebSocket');
             ws.send(JSON.stringify({ type: 'ready' }));
          });

          sarvamWs.on('message', (sarvamMsg: string | Buffer) => {
            try {
              const res = JSON.parse(sarvamMsg.toString());
              if (res.event === 'transcript.partial') {
                currentPartialText = res.text;
                const fullText = (finalizedText + ' ' + currentPartialText).trim();
                ws.send(JSON.stringify({ type: 'transcript', text: fullText }));
              } else if (res.event === 'transcript.final') {
                finalizedText = (finalizedText + ' ' + res.text).trim();
                currentPartialText = '';
                ws.send(JSON.stringify({ type: 'transcript', text: finalizedText }));
              } else if (res.event === 'error') {
                console.error(`[WS] Sarvam Error (${res.code}): ${res.message}`);
                ws.send(JSON.stringify({
                  type: 'error',
                  code: 'STREAMING_TRANSCRIPTION_FAILED',
                  message: 'Unable to continue live transcription.',
                }));
              }
            } catch(e) {
              console.error('[WS] Error parsing Sarvam response', e);
            }
          });

          sarvamWs.on('error', (err) => {
             console.error('[WS] Sarvam WebSocket Error:', err);
             ws.send(JSON.stringify({
               type: 'error',
               code: 'STREAMING_TRANSCRIPTION_FAILED',
               message: 'Unable to continue live transcription.',
             }));
          });
          
          sarvamWs.on('close', () => {
             console.log('[WS] Sarvam Connection Closed');
          });
        }
      } catch (e) {
        // If it's not JSON, it's binary audio chunks sent by frontend MediaRecorder
        if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
           const buffer = message as Buffer;
           
           // Based on Sarvam official JS code, raw PCM base64 is passed in `audio_input` event
           const audioB64 = buffer.toString('base64');
           
           sarvamWs.send(JSON.stringify({
             event: 'audio_input',
             audio: audioB64
           }));
           
           // Estimate duration: buffer is 16-bit 16kHz mono, so 32000 bytes per second
           durationSeconds += buffer.length / 32000;
        }
      }
    });

    ws.on('close', () => {
       console.log('[WS] Frontend Client disconnected');
       if (sarvamWs && sarvamWs.readyState === WebSocket.OPEN) {
          sarvamWs.send(JSON.stringify({ event: "end" }));
          sarvamWs.close();
       }
       
       if (durationSeconds > 0) {
           const finalFullText = (finalizedText + ' ' + currentPartialText).trim();
           logUsage(durationSeconds, finalFullText).then(log => {
               console.log(`[WS] Logged Live Streaming usage: ₹${log.costInr.toFixed(4)}`);
           }).catch(console.error);
       }
    });
  });
};
