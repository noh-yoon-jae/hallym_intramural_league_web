import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const { JWT_SECRET } = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "env.json"), 'utf-8'));

const verifyTokenController = {
    verifyToken: (req: Request, res: Response) => {
        const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
        if (!token) {
            // 토큰이 없으면 401 Unauthorized 응답을 보냄
            res.status(401).json({ status: false, reason: '토큰이 없습니다.' });
            return;
        }
        jwt.verify(token, JWT_SECRET, (err: any) => {
            if (err) {
                console.log(err)
                // 유효하지 않은 토큰일 경우 403 Forbidden 응답을 보냄
                res.status(403).json({ status: false, reason: '유효하지 않은 토큰입니다.' });
                return;
            } else {
                return res.json({ status: true });
            }
        })
    }
}

export default verifyTokenController;