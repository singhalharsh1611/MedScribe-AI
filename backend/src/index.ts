import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import languagesRoute from './routes/languages.route';
import transcriptionRoute from './routes/transcription.route';
import translationRoute from './routes/translation.route';
import prescriptionRoute from './routes/prescription.route';
import { initPrescriptionService } from './services/prescription.service';

import usageRoute from './routes/usage.route';
import http from 'http';
import { setupWebSocketServer } from './services/ws.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:7000' }));
app.use(express.json());
app.use(morgan('dev', {
    skip: (req) => req.url.includes('/api/prescription/search')
})); // Add request logging

app.use('/api/languages', languagesRoute);
app.use('/api/transcription', transcriptionRoute);
app.use('/api/translation', translationRoute);
app.use('/api/prescription', prescriptionRoute);
app.use('/api/usage', usageRoute);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const server = http.createServer(app);

// Setup WebSocket Server for Live Transcription
setupWebSocketServer(server);

// Initialize the Prescription Pipeline
initPrescriptionService().then(() => {
  server.listen(port, () => {
    console.log(`Express API and WebSocket is running on http://localhost:${port}`);
  });
}).catch(console.error);
