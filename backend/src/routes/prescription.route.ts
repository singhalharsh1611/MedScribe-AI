import { Router } from 'express';
import { handleExtractDrugs, handleMapDrugs, handleGeneratePrescription, handleGetHistory, handleGetHistoryById } from '../controllers/prescription.controller';

const router = Router();

router.post('/extract', handleExtractDrugs);
router.post('/map', handleMapDrugs);
router.post('/generate', handleGeneratePrescription);
router.get('/history', handleGetHistory);
router.get('/history/:id', handleGetHistoryById);

export default router;
