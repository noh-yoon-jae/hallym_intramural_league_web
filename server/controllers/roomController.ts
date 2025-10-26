import { Request, Response } from "express";
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const roomController = {
    // 채팅방 목록 조회
    list: async (_req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const [rows] = await db.query('SELECT id, sport_id, name FROM re_sports.chat_rooms ORDER BY id ASC');
            res.json({ status: true, data: rows });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '채팅방 목록 조회 실패' });
        }
    },
    // 새 채팅방 생성
    create: async (req: Request, res: Response) => {
        try {
            const { sportId, roomName } = req.body;
            if (!sportId) { return res.status(400).json({ status: false, reason: "sportId가 필요합니다." }); }
            if (!roomName) { return res.status(400).json({ status: false, reason: "roomName가 필요합니다." }); }

            const db = getDatabaseConnection();

            const [sportRows]: [any[], any] = await db.query('SELECT id FROM re_sports.sports WHERE id = ?', [sportId]);
            if (sportRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 스포츠입니다." });
            }

            const [roomRows]: [any[], any] = await db.query('SELECT id FROM re_sports.chat_rooms WHERE name = ?', [roomName]);
            if (roomRows.length !== 0) {
                return res.status(400).json({ status: false, reason: "이미 존재하는 이름의 채팅방입니다." });
            }

            await db.query(
                `INSERT INTO re_sports.chat_rooms (sport_id, room_name) VALUES (?, ?)`,
                [sportId, roomName]
            );

            return res.json({ status: true });

        } catch (e) {
            logError(e);
            res.status(500).json({
                status: false,
                reason: "메시지 전송 실패"
            });
        }
    },
    // 채팅방 삭제
    delete: async (req: Request, res: Response) => {
        try {
            const { roomId } = req.body;
            if (!roomId) { return res.status(400).json({ status: false, reason: "roomId가 필요합니다." }); }

            const db = getDatabaseConnection();

            await db.query('DELETE FROM re_sports.chat_rooms WHERE id = ?', [roomId]);

            return res.json({ status: true });

        } catch (e) {
            logError(e);
            res.status(500).json({
                status: false,
                reason: "채팅방 삭제 실패"
            });
        }
    },
    // 채팅방 이름 수정
    update: async (req: Request, res: Response) => {
        try {
            const { roomId, newName } = req.body;
            if (!roomId) { return res.status(400).json({ status: false, reason: "roomId가 필요합니다." }); }
            if (!newName) { return res.status(400).json({ status: false, reason: "newName가 필요합니다." }); }

            const db = getDatabaseConnection();

            await db.query('UPDATE re_sports.chat_rooms SET name = ? WHERE id = ?', [newName, roomId]);

            return res.json({ status: true });

        } catch (e) {
            logError(e);
            res.status(500).json({
                status: false,
                reason: "채팅방 이름 수정 실패"
            });
        }
    }
}
export default roomController;