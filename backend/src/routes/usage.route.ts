import { Router, Request, Response } from 'express';
import { getUsageStats } from '../services/db.service';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const stats = getUsageStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch usage stats' });
  }
});

export default router;
