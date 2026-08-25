const WebSocket = require('ws');
require('dotenv').config();

const apiKey = process.env.SARVAM_API_KEY;
if (!apiKey) {
  console.log('NO API KEY');
  process.exit(1);
}

const ws = new WebSocket('wss://api.sarvam.ai/speech-to-text-translate/ws?language_code=hi-IN&model=saaras:v3', {
  headers: { 'api-subscription-key': apiKey }
});

ws.on('open', () => {
  console.log('Connected to Sarvam WS');
  ws.send(JSON.stringify({
    type: 'config',
    data: {
      api_key: apiKey,
      model: 'saaras:v3', // try saaras:v3-realtime or saaras:v3
      language_code: 'hi-IN',
      audio_format: { sample_rate: 16000, encoding: 's16le' }
    }
  }));
  console.log('Sent config, waiting for response...');
  
  // Send some dummy silent audio
  setInterval(() => {
     const audioB64 = Buffer.alloc(32000, 0).toString('base64');
     // try different formats
     ws.send(JSON.stringify({ audio: { data: audioB64, encoding: 's16le', sample_rate: 16000 } }));
  }, 1000);
});

ws.on('message', (msg) => {
  console.log('Received:', msg.toString());
});

ws.on('close', (code, reason) => {
  console.log('Closed:', code, reason.toString());
  process.exit(0);
});

ws.on('error', (err) => {
  console.log('Error:', err);
});
