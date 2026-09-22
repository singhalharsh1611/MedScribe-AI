import { Router, Request, Response } from 'express';
import { getUsageStats } from '../services/db.service';
import { sendServerError } from '../utils/http-error';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await getUsageStats();
    res.json(stats);
  } catch (error) {
    sendServerError(res, 'USAGE_STATS_READ_FAILED', 'Unable to load usage statistics.', error);
  }
});

export default router;
