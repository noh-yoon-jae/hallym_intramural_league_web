import { Request, Response } from "express";
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const teamController = {
    /**
     * 모든 팀 목록 가져오기
     */
    list: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const [teams] = await db.query(`
                SELECT t.*, s.name AS sport_name
                FROM re_sports.teams t
                JOIN re_sports.sports s ON t.sport_id = s.id
                ORDER BY t.created_at DESC
            `);            
            res.json({status: true, data: teams});
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "팀 목록을 불러오는 데 실패했습니다." });
        }
    },

    /**
     * 팀 추가
     */
    create: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { name, sport_id, logo_url, captain, members, record, specialty, team_members } = req.body;

            if (!name || !sport_id) {
                return res.status(400).json({
                    status: false,
                    reason: "팀 이름(name)과 종목 ID(sport_id)는 필수입니다."
                });
            }
            
            await db.query(
                `INSERT INTO re_sports.teams (
                    name,
                    sport_id,
                    logo_url,
                    captain,
                    mambers,
                    record,
                    specialty,
                    team_members
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    sport_id,
                    logo_url || null,
                    captain || null,
                    members || null,
                    record || null,
                    specialty || null,
                    team_members ? JSON.stringify(team_members) : null
                ]
            );

            res.status(201).json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "팀 추가에 실패했습니다." });
        }
    },

    /**
     * 팀 수정
     */
    update: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const {
                team_id,
                name,
                sport_id,
                logo_url,
                captain,
                members,
                record,
                specialty,
                team_members
            } = req.body;

            if (!team_id || !sport_id) {
                return res.status(400).json({
                    status: false,
                    reason: "team_id와 sport_id는 필수입니다."
                });
            }
            
            await db.query(
                `UPDATE re_sports.teams SET
                    name = ?,
                    sport_id = ?,
                    logo_url = ?,
                    captain = ?,
                    mambers = ?,
                    record = ?,
                    specialty = ?,
                    team_members = ?
                WHERE id = ?`,
                [
                    name,
                    sport_id,
                    logo_url || null,
                    captain || null,
                    members || null,
                    record || null,
                    specialty || null,
                    team_members ? JSON.stringify(team_members) : null,
                    team_id
                ]
            );

            res.json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "팀 수정에 실패했습니다." });
        }
    },

    /**
     * 팀 삭제
     */
    delete: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const { team_id } = req.body;
            
            if (!team_id) {
                return res.status(400).json({ status: false, reason: "team_id는 필수입니다." });
            }

            await db.query(`DELETE FROM re_sports.teams WHERE id = ?`, [team_id]);
            res.json({ status: true });
        } catch (e) {
            logError(e)
            res.status(500).json({ status: false, reason: "팀 삭제에 실패했습니다." });
        }
    }
}

export default teamController;