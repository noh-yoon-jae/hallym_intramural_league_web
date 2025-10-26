import { Router } from 'express';
import roomController from '../controllers/roomController';
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get('/list', roomController.list);
router.post('/create', checkToken, checkRequirePower(2), roomController.create);
router.post('/delete', checkToken, checkRequirePower(2), roomController.delete);
router.post('/update', checkToken, checkRequirePower(2), roomController.update);

export default router;