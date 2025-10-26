import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import mymailer from '../custom_modules/mymailer';
import { validateUsername, validatePassword, validateEmail, generateResetToken, generateRandomString } from '../custom_modules/utils';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader, Pool } from 'mysql2/promise';
import logError from '../custom_modules/logError';

import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const userController = {
    signin: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { id, password, remember } = req.body;

            if (!id) return res.json({ status: false, reason: '아이디 입력해주세요.' });
            if (!password) return res.json({ status: false, reason: '비밀번호를 입력해주세요.' });
            if (!validatePassword(password)) {
                return res.json({
                    status: false,
                    reason: '비밀번호는 최소 8자 이상이어야 하며, 대문자, 숫자를 포함해야 합니다.'
                });
            }
            const query = 'SELECT * FROM re_sports.users WHERE username = ?';
            const [results] = await db.execute<RowDataPacket[]>(query, [id]);
            if (results.length > 0) {
                const user = results[0];
                if (!user.authentication) {
                    return res.json({ status: false, reason: '이메일 인증을 완료해주세요.' });
                }
                if (await argon2.verify(user.password, password)) {
                    const tokenPayload = { id: user.id };
                    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: remember ? '30d' : '1d' });
                    res.cookie('jwt', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        domain: '.kro.kr',
                        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 1 * 24 * 60 * 60 * 1000,
                    });
                    return res.json({
                        status: true,
                        reason: '로그인 성공!',
                        data: {
                            username: user.username,
                            nickname: user.nickname,
                            college: user.college,
                            email: user.email
                        }
                    });
                } else {
                    return res.json({ status: false, reason: '이메일 또는 비밀번호가 잘못되었습니다.' });
                }
            } else {
                return res.json({ status: false, reason: '회원 정보가 없습니다.' });
            }
        } catch (e) {
            logError(e);
            return res.json({ status: false, reason: '로그인 중 오류 | 개발자에게 문의해주세요.' });
        }
    },

    signup: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { username, email, password, recheck_password } = req.body;
            if (!username) return res.json({ status: false, reason: '사용자 이름을 입력해야 합니다.' });
            if (!email) return res.json({ status: false, reason: '이메일을 입력해야 합니다.' });
            if (!password) return res.json({ status: false, reason: '비밀번호를 입력해야 합니다.' });
            if (!recheck_password) return res.json({ status: false, reason: '비밀번호 확인을 입력해야 합니다.' });
            if (!validateUsername(username)) {
                return res.json({ status: false, reason: '사용자 이름은 20자 이하이며, < > 문자를 포함할 수 없습니다.' });
            }
            if (!validatePassword(password)) {
                return res.json({ status: false, reason: '비밀번호는 최소 8자 이상이어야 하며, 대문자, 숫자를 포함해야 합니다.' });
            }
            if (!validateEmail(email)) {
                return res.json({ status: false, reason: '학교 이메일만 가능합니다.' });
            }
            if (password !== recheck_password) {
                return res.json({ status: false, reason: '비밀번호가 일치하지 않습니다.' });
            }
            const username_check_query = 'SELECT COUNT(*) AS count FROM re_sports.users WHERE username = ?';
            const [username_results] = await db.execute<RowDataPacket[]>(username_check_query, [username]);
            const username_exists = username_results[0].count > 0;
            const emailCheckQuery = 'SELECT COUNT(*) AS count FROM re_sports.users WHERE email = ?';
            const [email_results] = await db.execute<RowDataPacket[]>(emailCheckQuery, [email]);
            const email_exists = email_results[0].count > 0;
            if (username_exists && email_exists) {
                return res.json({ status: false, reason: '이미 등록된 사용자 이름과 이메일입니다.' });
            } else if (username_exists) {
                return res.json({ status: false, reason: '이미 등록된 사용자 이름입니다.' });
            } else if (email_exists) {
                return res.json({ status: false, reason: '이미 등록된 이메일입니다.' });
            }
            const hashed_password = await argon2.hash(password);
            const signup_query = 'INSERT INTO re_sports.users (username, email, password) VALUES (?, ?, ?)';
            await db.execute(signup_query, [username, email, hashed_password]);
            const get_id_query = 'SELECT * FROM re_sports.users WHERE username = ?';
            const [result] = await db.execute<RowDataPacket[]>(get_id_query, [username]);
            if (!result) {
                return res.json({ status: false, reason: '해당 유저를 찾을 수 없습니다.' });
            }
            const id = result[0].id;
            const ac = generateRandomString(20);
            const authentication_code = await argon2.hash(ac);
            const updateAuthCodeQuery = 'UPDATE re_sports.users SET authentication_code = ? WHERE id = ?';
            await db.execute(updateAuthCodeQuery, [authentication_code, id]);
            mymailer.send(email, 'authenticationCode', { verificationCode: `${id}.${ac}` }, (result: any) => {
                if (result.status) {
                    return res.json({ status: true, reason: '이메일 인증을 위해서 메일함을 확인해주세요.' });
                }
            });
        } catch (e) {
            logError(e);
            return res.json({
                status: false,
                reason: '회원가입 중 오류 | 개발자에게 문의해주세요.'
            });
        }
    },

    getInfo: async (req: Request, res: Response) => {
        try {
            const user = res.locals.auth?.user;
            if (!user) {
                return res.json({
                    status: false,
                    reason: "인증 정보가 없습니다."
                });
            }
            // 필요한 정보만 전달
            return res.json({
                status: true,
                data: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    email: user.email,
                    expiresAt: res.locals.auth?.expiresAt,
                }
            });
        } catch (e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: "유저 정보 조회 중 오류가 발생했습니다."
            });
        }
    },

    setNickname: async (req: Request, res: Response) => {
        try {
            const user = res.locals.auth?.user;
            const { nickname } = req.body;
            if (!user || !nickname) {
                return res.status(400).json({ status: false, reason: "닉네임이 필요합니다." });
            }
            const db = getDatabaseConnection();
            const [dup] = await db.query('SELECT id FROM re_sports.users WHERE nickname = ?', [nickname]);
            if (Array.isArray(dup) && dup.length > 0) {
                return res.status(400).json({ status: false, reason: "이미 사용 중인 닉네임입니다." });
            }
            await db.query('UPDATE re_sports.users SET nickname = ? WHERE id = ?', [nickname, user.id]);
            return res.json({ status: true, data: { nickname } });
        } catch (e) {
            logError(e);
            return res.status(500).json({ status: false, reason: "닉네임 설정 실패" });
        }
    },

    secession: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const conn = await db.getConnection(); // 트랜잭션용 커넥션

        try {
            const user = res.locals.auth.user;

            // 일반 유저만 탈퇴 가능 (관리자 탈퇴 막기)
            if (user?.power < 1) {
                return res.status(403).json({
                    status: false,
                    reason: "관리자는 탈퇴할 수 없습니다. | 개발자에게 문의해주세요."
                });
            }

            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    status: false,
                    reason: "비밀번호를 입력하세요."
                });
            }

            // 비밀번호 검증
            const passwordMatch = await argon2.verify(user.password, password);
            if (!passwordMatch) {
                return res.status(401).json({
                    status: false,
                    reason: "비밀번호가 잘못되었습니다."
                });
            }

            await conn.beginTransaction(); // 트랜잭션 시작

            const userId = user.id;

            // 1. 연관 데이터 정리 (필요시 작성)

            // 2. 회원 정보 삭제
            await conn.execute(
                `DELETE FROM re_sports.users WHERE id = ?`,
                [userId]
            );

            await conn.commit(); // 커밋

            // 토큰 삭제 (세션 만료 처리)
            res.clearCookie('token');

            return res.json({
                status: true,
                reason: "탈퇴가 완료되었습니다."
            });
        } catch (e) {
            await conn.rollback(); // 실패 시 롤백
            logError(e);
            return res.status(500).json({
                status: false,
                reason: "탈퇴 처리 중 오류가 발생했습니다."
            });
        } finally {
            conn.release(); // 커넥션 반환
        }
    },

    logout: (req: Request, res: Response) => {
        try {
            res.clearCookie('jwt', { domain: '.kro.kr' });
            res.json({ status: true });
        } catch (e) {
            logError(e);
            res.json({ status: false, reason: '서버 오류.' });
        }
    },

    requestPasswordReset: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { email } = req.body;
            if (!email) {
                return res.json({ status: false, reason: '이메일을 입력해주세요.' });
            }
            const query = 'SELECT id FROM re_sports.users WHERE email = ?';
            const [results] = await db.execute<RowDataPacket[]>(query, [email]);
            if (results.length === 0) {
                return res.json({ status: false, reason: '등록되지 않은 이메일입니다.' });
            }
            const userId = results[0].id;
            const resetToken = generateResetToken();
            const resetTokenExpiry = new Date(Date.now() + 36000000);
            const updateQuery = 'UPDATE re_sports.users SET reset_token = ?, reset_token_expiry = ?, reset_token_used = FALSE WHERE id = ?';
            await db.execute(updateQuery, [resetToken, resetTokenExpiry, userId]);
            mymailer.send(email, 'passwordReset', { token: resetToken }, (result: any) => {
                if (result.status) {
                    return res.json({ status: true, reason: '비밀번호 재설정 링크가 이메일로 전송되었습니다.' });
                } else {
                    return res.json({ status: false, reason: '이메일 전송 중 오류가 발생했습니다.' });
                }
            });
        } catch (e) {
            logError(e);
            return res.json({ status: false, reason: '전송 중 오류 | 개발자에게 문의해주세요.' });
        }
    },

    resetPassword: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.json({ status: false, reason: '필수 정보가 누락되었습니다.' });
            }
            if (!validatePassword(newPassword)) {
                return res.json({ status: false, reason: '비밀번호는 최소 8자 이상이어야 하며, 대문자, 숫자를 포함해야 합니다.' });
            }
            const verifyQuery = `SELECT id, reset_token_expiry, reset_token_used FROM re_sports.users WHERE reset_token = ?`;
            const [results] = await db.execute<RowDataPacket[]>(verifyQuery, [token]);
            if (results.length === 0) {
                return res.json({ status: false, reason: '유효하지 않은 토큰입니다.' });
            }
            const { id, reset_token_expiry, reset_token_used } = results[0];
            const now = new Date();
            const expiry = new Date(reset_token_expiry);
            if (now > expiry) {
                return res.json({ status: false, reason: '만료된 토큰입니다.' });
            }
            if (reset_token_used) {
                return res.json({ status: false, reason: '이미 사용된 토큰입니다.' });
            }
            const hashedPassword = await argon2.hash(newPassword);
            const updateQuery = `UPDATE re_sports.users SET password = ?, reset_token_used = TRUE WHERE id = ?`;
            await db.execute(updateQuery, [hashedPassword, id]);
            return res.json({ status: true, reason: '비밀번호가 성공적으로 변경되었습니다.' });
        } catch (e) {
            logError(e);
            return res.json({ status: false, reason: '비밀번호 변경 중 오류 | 개발자에게 문의해주세요.' });
        }
    },

    resendVerification: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { email } = req.body;
            if (!email) {
                return res.json({ status: false, reason: '이메일을 입력해주세요.' });
            }
            const query = 'SELECT id, authentication FROM re_sports.users WHERE email = ?';
            const [results] = await db.execute<RowDataPacket[]>(query, [email]);
            if (results.length === 0) {
                return res.json({ status: false, reason: '등록되지 않은 이메일입니다.' });
            }
            const user = results[0];
            if (user.authentication) {
                return res.json({ status: false, reason: '이미 인증이 완료된 계정입니다.' });
            }
            const ac = generateRandomString(20);
            const authentication_code = await argon2.hash(ac);
            const updateAuthCodeQuery = 'UPDATE re_sports.users SET authentication_code = ? WHERE id = ?';
            await db.execute(updateAuthCodeQuery, [authentication_code, user.id]);
            mymailer.send(email, 'authenticationCode', { verificationCode: `${user.id}.${ac}` }, (result: any) => {
                if (result.status) {
                    return res.json({ status: true, reason: '인증 메일이 재전송되었습니다. 메일함을 확인해주세요.' });
                } else {
                    return res.json({ status: false, reason: '메일 전송 중 오류가 발생했습니다.' });
                }
            });
        } catch (e) {
            logError(e);
            return res.json({ status: false, reason: '재전송 중 오류 | 개발자에게 문의해주세요.' });
        }
    },

    emailVerify: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            let id_token = req.body.token;
            if (!id_token) {
                return res.json({ status: false, reason: '토큰이 제공되지 않았습니다.' });
            }
            if (!id_token.includes('.')) {
                return res.json({ status: false, reason: '무언가 잘못되었습니다.' });
            }
            let [id, token] = id_token.split('.');
            const query = 'SELECT authentication, authentication_code FROM re_sports.users WHERE id = ?';
            const [results] = await db.execute<RowDataPacket[]>(query, [id]);
            if (results.length === 0) {
                return res.json({ status: false, reason: '해당 사용자를 찾지 못했습니다.' });
            }
            if (results[0].authentication) {
                return res.json({ status: false, reason: '이미 인증이 된 유저입니다.' });
            }
            if (await argon2.verify(results[0].authentication_code, token)) {
                const updateQuery = 'UPDATE re_sports.users SET authentication = ? WHERE id = ?';
                await db.execute(updateQuery, [true, id]);
                return res.json({ status: true });
            } else {
                return res.json({ status: false, reason: '토큰이 일치하지 않습니다.' });
            }
        } catch (e) {
            logError(e);
            return res.json({ status: true, reason: '인증 중 오류 | 개발자에게 문의해주세요.' });
        }
    },
};

export default userController;