import { Router } from "express";
import sportController from "../controllers/sportController";
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = Router();

router.get("/list", sportController.list);
router.post("/create", checkToken, checkRequirePower(1), sportController.create);
router.post("/update", checkToken, checkRequirePower(1), sportController.update);
router.post("/delete", checkToken, checkRequirePower(1), sportController.delete);

export default router;