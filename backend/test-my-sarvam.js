const WebSocket = require('ws');
require('dotenv').config();
const apiKey = process.env.SARVAM_API_KEY;
const ws = new WebSocket('wss://api.sarvam.ai/speech-to-text-realtime/ws?language_code=hi-IN', { headers: { 'api-subscription-key': apiKey } });

ws.on('open', () => {
  console.log('Opened');
  ws.send(JSON.stringify({ type: 'config', data: { api_key: apiKey, model: 'saaras:v3', language_code: 'hi-IN', audio_format: { sample_rate: 16000, encoding: 'audio/wav' } } }));
  setInterval(() => {
     const buffer = Buffer.alloc(32000, 0); // 1 sec silence
     const wavHeader = Buffer.alloc(44);
     wavHeader.write('RIFF', 0);
     wavHeader.writeUInt32LE(36 + buffer.length, 4);
     wavHeader.write('WAVE', 8);
     wavHeader.write('fmt ', 12);
     wavHeader.writeUInt32LE(16, 16);
     wavHeader.writeUInt16LE(1, 20);
     wavHeader.writeUInt16LE(1, 22);
     wavHeader.writeUInt32LE(16000, 24);
     wavHeader.writeUInt32LE(16000 * 2, 28);
     wavHeader.writeUInt16LE(2, 32);
     wavHeader.writeUInt16LE(16, 34);
     wavHeader.write('data', 36);
     wavHeader.writeUInt32LE(buffer.length, 40);
     
     const wavBuffer = Buffer.concat([wavHeader, buffer]);
     const audioB64 = wavBuffer.toString('base64');
     
     ws.send(JSON.stringify({ audio: { data: audioB64, encoding: 'audio/wav', sample_rate: 16000 } }));
     // wait wait! The web search results said for some APIs `ws.transcribe(audio=audio_b64)`.
     // Let's also try `{ type: 'data', audio_b64: audioB64 }`?
     // Actually I'll test `{ audio: { data: audioB64, encoding: 'audio/wav', sample_rate: 16000 } }` as that passed PyDantic before.
  }, 1000);
});
ws.on('message', m => console.log('R:', m.toString()));
ws.on('close', () => process.exit());
