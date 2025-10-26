import express from "express";
import rankingsController from "../controllers/standingController";
// import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/list/:sport_id/:season_year", rankingsController.list);
router.get("/all/:season_year", rankingsController.all);
router.post("/update", /*checkToken, checkRequirePower(1),*/ rankingsController.update);

export default router;