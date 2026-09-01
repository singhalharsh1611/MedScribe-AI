import { Router } from 'express';
import { handleExtractDrugs, handleMapDrugs, handleGeneratePrescription, handleSavePrescription, handleGetHistory, handleGetHistoryById, handleSearchDrugs } from '../controllers/prescription.controller';

const router = Router();

router.get('/search', handleSearchDrugs);
router.post('/extract', handleExtractDrugs);
router.post('/map', handleMapDrugs);
router.post('/generate', handleGeneratePrescription);
router.post('/save', handleSavePrescription);
router.get('/history', handleGetHistory);
router.get('/history/:id', handleGetHistoryById);

export default router;
