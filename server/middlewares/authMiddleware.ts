// authMiddleware.ts
import e, { Request, Response, NextFunction } from 'express';
import { RowDataPacket, ResultSetHeader, Pool } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import logError from '../custom_modules/logError';

import { getDatabaseConnection } from '../db/index';

const { JWT_SECRET } = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "env.json"), 'utf-8'));

export function checkToken(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.cookies?.jwt || req.headers?.authorization?.split(' ')[1];

        if (!token) {
            res.locals.auth = {
                valid: false,
                reason: '토큰이 없습니다.'
            }
            return next();
        }

        jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
            if (err) {
                console.error(err);
                res.locals.auth = {
                    valid: false,
                    reason: '유효하지 않은 토큰입니다.'
                }
                return next();
            }

            const db = getDatabaseConnection();
            const { exp, id } = decoded;

            const query = 'SELECT * FROM re_sports.users WHERE id = ?';
            const [results] = await db.execute<RowDataPacket[]>(query, [id]);
            const user = results[0];
            if (!user) {
                res.locals.auth = {
                    valid: false,
                    reason: "회원정보가 없습니다."
                }
                return next();
            }
            if (!user.authentication) {
                res.locals.auth = {
                    valid: false,
                    reason: "이메일 인증을 완료해주세요."
                }
                return next();
            }
            res.locals.auth = { valid: true, user, expiresAt: exp*1000 }
            next();
        });
    } catch (e) {
        logError(e);
        res.locals.auth = {
            valid: false,
            reason: "인증 미들웨이 오류 | 개발자에게 문의해주세요."
        }
        next();
    }
};

export function checkRequirePower(minPower: number) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!res.locals.auth?.valid) {
            return res.status(403).json({
                status: false,
                reason: res.locals.auth?.reason || "인증이 필요합니다."
            });
        }

        const userPower = res.locals.auth?.user?.power || 0;
        if (userPower < minPower) {
            return res.status(403).json({
                status: false,
                reason: "권한이 부족합니다."
            });
        }
        next();
    };
};