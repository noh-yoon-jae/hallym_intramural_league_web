import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import { RowDataPacket, ResultSetHeader, FieldPacket, Pool } from 'mysql2/promise';
import logError from '../custom_modules/logError';

const noticeController = {
    list: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();

            const query = `
            SELECT 
                n.id,
                n.title,
                n.content,
                n.created_at,
                n.updated_at,
                n.author_id,
                u.username AS author, -- 또는 u.nickname
                n.view_count,
                GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') AS category
            FROM 
                re_sports.notices n 
            LEFT JOIN 
                re_sports.users u ON n.author_id = u.id
            LEFT JOIN
                re_sports.notice_categories nc ON n.id = nc.notice_id
            LEFT JOIN 
                re_sports.categories c ON nc.category_id = c.id
            GROUP BY 
                n.id
            ORDER BY 
                n.created_at DESC;
            `
            let params: any[] = [];
            const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(query, params);
            return res.json({
                status: true,
                data: rows
            });
        } catch (e) {
            logError(e);
            res.json({
                status: false,
                reason: "공지 조회중 오류"
            })
        }
    },
    /**
     * 카테고리를 이용해서 공지사항 목록 조회
     */
    get: async (req: Request, res: Response) => {
        try {
            const { categories } = req.params;
            const db = getDatabaseConnection();

            let query = `
                SELECT DISTINCT n.*
                FROM re_sports.notices n
                JOIN re_sports.notice_categories nc ON n.id = nc.notice_id
                JOIN re_sports.categories c ON nc.category_id = c.id
            `;
            let params: any[] = [];

            // categories 처리
            if (categories && categories.length > 0) {
                const categoryList = Array.isArray(categories) ? categories : [categories]; // 단일 문자열 처리
                const placeholders = categoryList.map(() => '?').join(', ');
                query += ` WHERE c.name IN (${placeholders})`;
                params.push(...categoryList); // 배열 전개
            }

            query += ` ORDER BY n.created_at DESC`;

            const [rows]: [RowDataPacket[], FieldPacket[]] = await db.execute(query, params);

            return res.json({
                status: true,
                data: rows
            });
        } catch (e) {
            logError(e);
            return res.status(500).json({
                status: false,
                reason: '공지사항 목록 조회 실패'
            });
        }
    },

    /**
     * 공지사항 상세 조회
     */
    detail: async (req: Request, res: Response) => {
        try {
            const { notice_id } = req.body;

            if (!notice_id) {
                return res.status(400).json({ status: false, reason: 'notice_id가 필요합니다' });
            }

            const db = getDatabaseConnection();

            await db.execute(
                `UPDATE re_sports.notices SET view_count = view_count + 1 WHERE id = ?`,
                [notice_id]
            );

            const [rows] = await db.execute<RowDataPacket[]>(
                `SELECT * FROM re_sports.notices WHERE id = ?`, [notice_id]
            );
            const notice = rows[0];

            if (!notice) {
                return res.status(404).json({ status: false, reason: '공지사항을 찾을 수 없습니다' });
            }

            const [categories] = await db.execute<RowDataPacket[]>(
                `SELECT c.name FROM re_sports.categories c
                JOIN re_sports.notice_categories nc ON c.id = nc.category_id
                WHERE nc.notice_id = ?`, [notice_id]
            );
            notice.categories = categories.map((c: RowDataPacket) => c.name);

            return res.json({ status: true, data: notice });
        } catch (e) {
            logError(e);
            return res.status(500).json({ status: false, reason: '공지사항 상세 조회 실패' });
        }
    },

    /**
     * 공지사항 작성
     */
    create: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const conn = await db.getConnection(); // 트랜잭션용 커넥션 가져오기

        try {

            const { title, content, categories, author_id } = req.body;

            if (!title || !content || !categories?.length || !author_id) {
                return res.status(400).json({ status: false, reason: '필수 항목 누락' });
            }

            const [authorRows]: [any[], any] = await db.query('SELECT id FROM re_sports.users WHERE id = ?', [author_id]);
            if (authorRows.length === 0) {
                return res.status(400).json({ status: false, reason: "유저 정보를 찾을 수 없습니다." });
            }

            await conn.beginTransaction(); // 트랜잭션 시작

            // 공지사항 삽입
            const [result] = await conn.execute<ResultSetHeader>(
                `INSERT INTO re_sports.notices (title, content, author_id) VALUES (?, ?, ?)`,
                [title, content, author_id]
            );
            const noticeId = result.insertId;

            // 카테고리 처리
            let notInsertedCategory = true;
            for (const category of categories) {
                const [catRows] = await conn.execute<RowDataPacket[]>(
                    `SELECT id FROM re_sports.categories WHERE name = ?`,
                    [category]
                );
                const catRow = catRows[0];
                if (catRow) {
                    await conn.execute(
                        `INSERT INTO re_sports.notice_categories (notice_id, category_id) VALUES (?, ?)`,
                        [noticeId, catRow.id]
                    );
                    notInsertedCategory = false;
                }
            }

            if (notInsertedCategory) {
                await conn.rollback();
                return res.status(400).json({
                    status: false,
                    reason: "카테고리를 한 개 이상 선택해주세요."
                });
            }

            await conn.commit(); // 트랜잭션 커밋

            return res.json({
                status: true,
                data: { notice_id: noticeId }
            });
        } catch (e) {
            await conn.rollback(); // 에러 발생 시 롤백
            logError(e);
            return res.status(500).json({ status: false, reason: '공지사항 생성 실패' });
        } finally {
            conn.release(); // 커넥션 반환
        }
    },


    /**
     * 공지사항 수정
     */
    update: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const conn = await db.getConnection(); // 트랜잭션용 커넥션 가져오기

        try {
            const user = res.locals.auth.user;

            const { notice_id, title, content, categories } = req.body;

            if (!notice_id || typeof notice_id !== "number") {
                return res.status(400).json({ status: false, reason: '유효한 notice_id가 필요합니다.' });
            }

            if (!title || !content) {
                return res.status(400).json({ status: false, reason: '제목과 내용을 모두 입력하세요.' });
            }

            await conn.beginTransaction(); // 트랜잭션 시작

            // 공지사항 존재 여부 및 작성자 확인
            const [noticeRows] = await conn.execute<RowDataPacket[]>(
                `SELECT author_id FROM re_sports.notices WHERE id = ?`,
                [notice_id]
            );

            const notice = noticeRows[0];
            if (!notice) {
                await conn.rollback();
                return res.status(404).json({
                    status: false,
                    reason: "공지사항을 찾을 수 없습니다."
                });
            }

            // 작성자 본인 또는 관리자만 수정 가능
            if (user.power <= 1 && user.id !== notice.author_id) {
                await conn.rollback();
                return res.status(403).json({
                    status: false,
                    reason: "다른 사용자의 공지사항은 수정할 수 없습니다."
                });
            }

            // 공지사항 수정
            await conn.execute(
                `UPDATE re_sports.notices
                 SET title = ?, content = ?, updated_at = NOW()
                 WHERE id = ?`,
                [title, content, notice_id]
            );

            if (categories) {
                // 기존 카테고리 삭제
                await conn.execute(
                    `DELETE FROM re_sports.notice_categories WHERE notice_id = ?`,
                    [notice_id]
                );

                let notInsertedCategory = true;

                // 새 카테고리 추가
                for (const category of categories) {
                    const [catRows] = await conn.execute<RowDataPacket[]>(
                        `SELECT id FROM re_sports.categories WHERE name = ?`,
                        [category]
                    );
                    const catRow = catRows[0];
                    if (catRow) {
                        await conn.execute(
                            `INSERT INTO re_sports.notice_categories (notice_id, category_id) VALUES (?, ?)`,
                            [notice_id, catRow.id]
                        );
                        notInsertedCategory = false;
                    }
                }

                if (notInsertedCategory) {
                    await conn.rollback();
                    return res.status(400).json({
                        status: false,
                        reason: "카테고리를 한 개 이상 선택해주세요."
                    });
                }
            }

            await conn.commit(); // 커밋

            return res.json({ status: true });
        } catch (e) {
            await conn.rollback(); // 실패 시 롤백
            logError(e);
            return res.status(500).json({ status: false, reason: '공지사항 수정 실패' });
        } finally {
            conn.release(); // 커넥션 반환
        }
    },

    /**
     * 공지사항 삭제
     */
    delete: async (req: Request, res: Response) => {
        try {
            const { notice_id } = req.body;

            if (!notice_id) {
                return res.status(400).json({ status: false, reason: 'notice_id가 필요합니다' });
            }

            const db = getDatabaseConnection();

            await db.execute(
                `DELETE FROM re_sports.notices WHERE id = ?`, [notice_id]
            );

            return res.json({ status: true });
        } catch (e) {
            logError(e);
            return res.status(500).json({ status: false, reason: '공지사항 삭제 실패' });
        }
    }
};

export default noticeController;
