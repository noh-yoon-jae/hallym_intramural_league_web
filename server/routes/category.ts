import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get('/list', categoryController.list);
router.post('/create', checkToken, checkRequirePower(1), categoryController.create);
router.post('/delete', checkToken, checkRequirePower(1), categoryController.delete);
router.post('/delete-with-notices', checkToken, checkRequirePower(2), categoryController.deleteWithNotices);

export default router;