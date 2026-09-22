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
import authRoute from './routes/auth.route';
import clinicsRoute from './routes/clinics.route';
import patientsRoute from './routes/patients.route';
import appointmentsRoute from './routes/appointments.route';
import queueRoute from './routes/queue.route';
import joinRequestsRoute from './routes/joinrequests.route';
import staffRoute from './routes/staff.route';
import encountersRoute from './routes/encounters.route';
import superAdminRoute from './routes/superadmin.route';
import http from 'http';
import { setupWebSocketServer } from './services/ws.service';
import { requireAuth, requireClinicBoundary, requirePinResetComplete, requireRole } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7000';

const allowedOrigins = new Set([
  frontendUrl,
  'http://localhost:7000',
  'http://127.0.0.1:7000',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(morgan('dev', { skip: (req) => req.url.includes('/api/prescription/search') }));

// Help local users who open an auth page on the API origin.
app.get(['/login', '/register'], (req, res) => {
  const target = new URL(req.path, frontendUrl);
  const requestOrigin = `${req.protocol}://${req.get('host')}`;
  if (target.origin === requestOrigin) return res.status(404).send('Frontend route is not served by the API process');
  res.redirect(307, target.toString());
});

app.use('/api/languages', languagesRoute);
app.use('/api/auth', authRoute);
app.use('/api/superadmin', superAdminRoute);
app.use('/api/transcription', requireAuth, requirePinResetComplete, requireRole('doctor', 'admin'), transcriptionRoute);
app.use('/api/translation', requireAuth, requirePinResetComplete, translationRoute);
app.use('/api/prescription', requireAuth, requirePinResetComplete, prescriptionRoute);
app.use('/api/usage', requireAuth, requirePinResetComplete, requireRole('superadmin'), usageRoute);
app.use('/api/clinics', requireAuth, requirePinResetComplete, clinicsRoute);
app.use('/api/patients', requireAuth, requirePinResetComplete, requireClinicBoundary, patientsRoute);
app.use('/api/appointments', requireAuth, requirePinResetComplete, requireClinicBoundary, appointmentsRoute);
app.use('/api/queue', requireAuth, requirePinResetComplete, requireClinicBoundary, queueRoute);
app.use('/api/join-requests', requireAuth, requirePinResetComplete, joinRequestsRoute);
app.use('/api/staff', requireAuth, requirePinResetComplete, requireRole('admin'), requireClinicBoundary, staffRoute);
app.use('/api/encounters', requireAuth, requirePinResetComplete, requireRole('doctor', 'admin', 'nurse'), requireClinicBoundary, encountersRoute);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[UNHANDLED_SERVER_ERROR]', err);
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      code: 'REQUEST_BODY_TOO_LARGE',
      error: 'The request body is larger than the configured JSON body limit.',
    });
  }
  res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'An unexpected server error occurred.' });
});

const server = http.createServer(app);

// Setup WebSocket Server for Live Transcription
setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`Express API and WebSocket is running on http://localhost:${port}`);
  void initPrescriptionService().catch((error) => {
    console.error('[PRESCRIPTION_CACHE_INIT_FAILED]', error);
  });
});
