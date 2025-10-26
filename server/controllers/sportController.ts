import { Request, Response } from "express";
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const sportController = {
    /**
     * 모든 종목 목록 가져오기 (POST)
     */
    list: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const [sports] = await db.query(`SELECT * FROM re_sports.sports ORDER BY created_at DESC`);
            res.json({status: true, data: sports});
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "종목 목록을 불러오는 데 실패했습니다." });
        }
    },

    /**
     * 종목 추가 (POST)
     */
    create: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({ status: false, reason: "종목 이름(name)은 필수입니다." });
            }
            await db.query(`
            INSERT INTO re_sports.sports (name, description)
            VALUES (?, ?)
        `, [name, description || null]);

            res.status(201).json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "종목 추가에 실패했습니다." });
        }
    },

    /**
     * 종목 수정 (POST)
     */
    update: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { sport_id, name, description } = req.body;

            if (!sport_id) {
                return res.status(400).json({ status: false, reason: "sport_id는 필수입니다." });
            }

            await db.query(`
            UPDATE re_sports.sports
            SET name = ?, description = ?
            WHERE id = ?
        `, [name, description, sport_id]);

            res.json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "종목 수정에 실패했습니다." });
        }
    },

    /**
     * 종목 삭제 (POST)
     */
    delete: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { sport_id } = req.body;

            if (!sport_id) {
                return res.status(400).json({ status: false, reason: "sport_id는 필수입니다." });
            }
            await db.query(`DELETE FROM re_sports.sports WHERE id = ?`, [sport_id]);
            res.json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "종목 삭제에 실패했습니다." });
        }
    }
}

export default sportController;