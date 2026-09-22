import { Router } from 'express';
import multer from 'multer';
import * as os from 'os';
import * as path from 'path';
import { handleTranscription, handleAudioUpload } from '../controllers/transcription.controller';

const router = Router();

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname || '.webm'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.mp4'];
    
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
    }
  },
});

router.post('/', upload.single('audio'), handleTranscription);
router.post('/upload', upload.single('audio'), handleAudioUpload);

export default router;
