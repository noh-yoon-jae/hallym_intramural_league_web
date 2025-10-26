import { Router } from 'express';
import tableUpdateController from '../controllers/tableUpdateController';

const router = Router();

router.post('/last-updated', tableUpdateController.getLastModified);

export default router;