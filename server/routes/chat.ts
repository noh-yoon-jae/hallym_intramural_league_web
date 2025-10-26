import { Router } from 'express';
import chatController from "../controllers/chatController";
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get('/list/:roomId/:pageNumber', chatController.list);
router.get('/stats/:roomId', checkToken, chatController.stats);
router.post('/send', checkToken, chatController.send);
router.post('/like', checkToken, chatController.toggleLike);
router.post('/ban', checkToken, checkRequirePower(2), chatController.createChatBan);
router.post('/ban/release', checkToken, checkRequirePower(2), chatController.releaseChatBan);
router.post('/chat-hide', checkToken, checkRequirePower(2), chatController.hideChatMessage);

export default router;