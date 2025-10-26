import { Router } from 'express';
import reportController from '../controllers/reportController';
import { checkToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/report', checkToken, reportController.reportChatMessage);

export default router;