import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import { RowDataPacket, FieldPacket } from 'mysql2';
import logError from '../custom_modules/logError';

const tableUpdateController = {
    getLastModified: async(req: Request, res: Response) => {
        try {
            const { tables } = req.body;

            if (!Array.isArray(tables) || tables.length === 0) {
                return res.status(400).json({
                    status: false,
                    reason: 'tables 배열이 필요합니다'
                });
            }

            const db = getDatabaseConnection();

            const placeholders = tables.map(() => '?').join(', ');
            const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
                `
                SELECT table_name, last_modified
                FROM re_sports.table_update_tracker
                WHERE table_name IN (${placeholders})
                `,
                tables
            );

            const result: Record<string, string> = {};
            rows.forEach((row: any) => {
                result[row.table_name] = row.last_modified;
            });
            return res.json({
                status: true,
                data: result
            });
        } catch (e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: '최근 업데이트 정보 조회 실패'
            });
        }
    }
};

export default tableUpdateController;