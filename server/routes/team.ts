import { Router } from "express";
import teamController from "../controllers/teamController";
import { checkToken, checkRequirePower } from "../middlewares/authMiddleware";
import { createImageHandler } from '../custom_modules/imageHandler';

const { upload, uploadImage, downloadImage } = createImageHandler('team-logos');

const router = Router();

router.get("/list", teamController.list);
router.post("/create", checkToken, checkRequirePower(1), teamController.create);
router.post("/update", checkToken, checkRequirePower(1), teamController.update);
router.post("/delete", checkToken, checkRequirePower(1), teamController.delete);
router.get("/logo/:filename", downloadImage);   
router.post("/upload-logo", checkToken, checkRequirePower(1), upload.single('image'), uploadImage);

export default router;