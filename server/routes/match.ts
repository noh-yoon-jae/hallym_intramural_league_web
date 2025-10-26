import { Router } from "express";
import matchController from "../controllers/matchController";
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get("/list", matchController.list);
router.post("/create", checkToken, checkRequirePower(1), matchController.create);
router.post("/update", checkToken, checkRequirePower(1), matchController.update);
router.post("/delete",checkToken, checkRequirePower(1), matchController.delete);

export default router;