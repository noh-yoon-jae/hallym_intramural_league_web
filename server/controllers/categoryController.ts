import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2';
import logError from '../custom_modules/logError';

const categoryController = {
    list: async(req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();

            const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(
                `SELECT id, name FROM re_sports.categories ORDER BY id ASC`
            );

            return res.json({
                status: true,
                data: rows
            });
        } catch(e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: '카테고리 목록 조회 실패'
            });
        }
    },

    create: async(req: Request, res: Response) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({
                    status: false,
                    reason: '카테고리 이름(name)이 필요합니다'
                });
            }

            const db = getDatabaseConnection();

            const [[exists]]: [RowDataPacket[], FieldPacket[]] = await db.execute(
                `SELECT id FROM re_sports.categories WHERE name = ?`,
                [name]
            );

            if (exists) {
                return res.status(409).json({
                    status: false,
                    reason: '이미 존재하는 카테고리입니다'
                });
            }

            const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(
                `INSERT INTO re_sports.categories (name) VALUES (?)`,
                [name]
            );

            return res.json({
                status: true,
                data: {
                    category_id: result.insertId,
                }
            });
        } catch(e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: '카테고리 생성 실패'
            });
        }
    },

    delete: async(req: Request, res: Response) => {
        try {
            const { category_id } = req.body;
            if (!category_id) {
                return res.status(400).json({
                    status: false,
                    reason: 'category_id가 필요합니다'
                });
            }

            const db = getDatabaseConnection();

            const [[inUse]]: [RowDataPacket[], FieldPacket[]] = await db.execute(
                `SELECT COUNT(*) AS cnt FROM re_sports.notice_categories WHERE category_id = ?`,
                [category_id]
            );

            if (inUse && inUse.cnt > 0) {
                return res.status(400).json({
                    status: false,
                    reason: '공지사항에 사용 중인 카테고리는 삭제할 수 없습니다'
                });
            }

            const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(
                `DELETE FROM re_sports.categories WHERE id = ?`,
                [category_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: false,
                    reason: '존재하지 않는 카테고리입니다'
                });
            }

            return res.json({ status: true });
        } catch(e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: '카테고리 삭제 실패'
            });
        }
    },
    // 카테고리와 연결된 공지사항 모두 삭제
    deleteWithNotices: async(req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const connection = await db.getConnection();
        try {
            const { category_id } = req.body;

            if (!category_id) {
                return res.status(400).json({
                    status: false,
                    reason: 'category_id가 필요합니다'
                });
            }

            await connection.beginTransaction();
            
            // 카테고리에 속한 공지사항 ID 목록 가져오기
            const [noticeRows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
                `SELECT DISTINCT n.id
                FROM notices n
                JOIN notice_categories nc ON n.id = nc.notice_id
                WHERE nc.category_id = ?`,
                [category_id]
            );

            const noticeIds = noticeRows.map((row: any) => row.id);

            // 공지사항 삭제 (연결 관계 포함)
            if (noticeIds.length > 0) {
                await connection.execute(
                    `DELETE FROM notice_categories WHERE notice_id IN (${noticeIds.map(() => '?').join(',')})`,
                    noticeIds
                );
                await connection.execute(
                    `DELETE FROM notices WHERE id IN (${noticeIds.map(() => '?').join(',')})`,
                    noticeIds
                );
            }

            // 카테고리 삭제
            const [deleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
                `DELETE FROM categories WHERE id = ?`,
                [category_id]
            );

            if (deleteResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    status: false,
                    reason: '존재하지 않는 카테고리입니다'
                });
            }

            await connection.commit();

            return res.json({
                status: true,
                data: {
                    deletedNotices: noticeIds,
                    message: `카테고리와 연결된 ${noticeIds.length}개의 공지사항이 삭제되었습니다`
                }
            });
        } catch(e) {
            logError(e);
            await connection.rollback();
            return res.status(500).json({
                status: false,
                reason: '카테고리 및 공지사항 삭제 실패'
            });
        } finally {
            connection.release();
        }
    }
};

export default categoryController;