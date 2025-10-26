import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

export function createImageHandler(subDir: string = '') {
    const uploadsDir = path.join(__dirname, '..', 'uploads', subDir);
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
            cb(null, uniqueName);
        }
    });

    const upload = multer({ storage });

    const uploadImage = (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ status: false, reason: '파일이 필요합니다.' });
        }
        const filename = req.file.filename;
        res.json({ status: true, filename });
    };

    const downloadImage = (req: Request, res: Response) => {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ status: false, reason: '파일을 찾을 수 없습니다.' });
        }
    };

    return { upload, uploadImage, downloadImage };
}