import { Router } from 'express';
import { handleExtractDrugs, handleMapDrugs } from '../controllers/prescription.controller';

const router = Router();

router.post('/extract', handleExtractDrugs);
router.post('/map', handleMapDrugs);

export default router;
