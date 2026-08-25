import { Router } from 'express';
import { handleTranslation } from '../controllers/translation.controller';

const router = Router();

router.post('/', handleTranslation);

export default router;
