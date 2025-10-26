import { Router } from 'express';
import noticeController from '../controllers/noticeController';
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get('/list', noticeController.list);
router.post('/get', noticeController.get);
router.post('/detail', noticeController.detail);
router.post('/create', checkToken, checkRequirePower(1), noticeController.create);
router.post('/update', checkToken, checkRequirePower(1), noticeController.update);
router.post('/delete', checkToken, checkRequirePower(1), noticeController.delete);

export default router;