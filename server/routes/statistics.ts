import { Router } from 'express';
import statisticsController from '../controllers/statisticsController';

const router = Router();

router.get('/summary', statisticsController.summary);

export default router;