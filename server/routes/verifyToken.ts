
import verifyTokenController from '../controllers/verifyTokenController';

import { Router } from 'express';

const router = Router();

router.post('/verify-token', verifyTokenController.verifyToken);

export default router; 