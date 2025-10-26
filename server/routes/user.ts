import { Router } from 'express';
import userController from '../controllers/userController';
import { checkToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);
router.post('/info', checkToken, userController.getInfo);
router.post('/nickname', checkToken, userController.setNickname);
router.post('/logout', userController.logout);
router.post('/secession', userController.secession);
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);
router.post('/resend-verification', userController.resendVerification);
router.post('/email-verify', userController.emailVerify);

export default router;