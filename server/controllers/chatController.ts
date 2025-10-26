import { Request, Response } from "express";
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';
import { getIO } from '../sockets/chatSocket';

const chatController = {
    // 채팅방 메시지 가져오기
    list: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const pageNumber = parseInt(req.params.pageNumber);

            const limit = 6;
            const offset = (pageNumber - 1) * limit;

            const db = getDatabaseConnection();
            if (!roomId) {
                return res.status(400).json({
                    status: false,
                    reason: "roomId가 필요합니다."
                });
            }
            const [rows] = await db.query(
                `SELECT cm.id,
                        IF(cm.is_hidden = 1, '관리자에 의해 가려진 메시지입니다', cm.message) AS message,
                        cm.created_at,
                        cm.is_reported AS is_reported,
                        cm.is_hidden AS is_hidden,
                        u.nickname,
                        GROUP_CONCAT(cl.user_id) AS liked_by
                 FROM re_sports.chat_messages cm
                 JOIN re_sports.users u ON cm.user_id = u.id
                 LEFT JOIN re_sports.chat_message_likes cl ON cm.id = cl.message_id
                 WHERE cm.room_id = ?
                 GROUP BY cm.id
                 ORDER BY cm.created_at DESC
                 LIMIT ? OFFSET ?`,
                [roomId, limit, offset]
            );
            res.status(200).json({
                status: true,
                data: rows
            });
        } catch (e) {
            logError(e);
            res.status(500).json({
                status: false,
                reason: "채팅 메시지 가져오기 실패"
            });
        }
    },

    // 채팅방에 메시지 추가
    send: async (req: Request, res: Response) => {
        try {
            if (!res.locals.auth.user?.nickname) {
                return res.status(403).json({
                    status: false,
                    reason: "먼저 닉네임을 정해주세요."
                });
            }

            const { roomId, message } = req.body;
            const userId = res.locals.auth.user.id;

            const db = getDatabaseConnection();

            if (!roomId) { return res.status(400).json({ status: false, reason: "roomId가 필요합니다." }); }
            if (!userId) { return res.status(400).json({ status: false, reason: "userId가 필요합니다." }); }
            if (!message) { return res.status(400).json({ status: false, reason: "message가 필요합니다." }); }

            const [roomRows]: [any[], any] = await db.query('SELECT id FROM re_sports.chat_rooms WHERE id = ?', [roomId]);
            if (roomRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 채팅방입니다." });
            }

            const [userRows]: [any[], any] = await db.query('SELECT id FROM re_sports.users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 사용자입니다." });
            }

            const [result] = await db.query(
                "INSERT INTO re_sports.chat_messages (room_id, user_id, message, created_at) VALUES (?, ?, ?, NOW())",
                [roomId, userId, message]
            );

            const insertId = (result as any).insertId;

            const responseMessage = {
                id: insertId.toString(),
                roomId,
                user: res.locals.auth.user.nickname,
                team: res.locals.auth.user.team,
                message,
                timestamp: new Date(),
                likes: 0,
                likedBy: [] as number[],
                isLiked: false,
            };

            try {
                const io = getIO();
                io.to(roomId.toString()).emit('chat', responseMessage);
            } catch (e) {
                // ignore if socket not initialized
            }

            res.status(201).json({
                status: true,
                data: responseMessage
            });
        } catch (e) {
            logError(e);
            res.status(500).json({
                status: false,
                reason: "메시지 전송 실패"
            });
        }
    },

    // 메시지 좋아요 토글
    toggleLike: async (req: Request, res: Response) => {
        try {
            const { messageId } = req.body;
            const userId = res.locals.auth.user.id;

            if (!messageId) {
                return res.status(400).json({ status: false, reason: 'messageId가 필요합니다.' });
            }

            const db = getDatabaseConnection();

            const [rows]: [any[], any] = await db.query(
                'SELECT id FROM re_sports.chat_message_likes WHERE message_id = ? AND user_id = ?',
                [messageId, userId]
            );

            if (rows.length > 0) {
                await db.query(
                    'DELETE FROM re_sports.chat_message_likes WHERE message_id = ? AND user_id = ?',
                    [messageId, userId]
                );
            } else {
                await db.query(
                    'INSERT INTO re_sports.chat_message_likes (message_id, user_id, created_at) VALUES (?, ?, NOW())',
                    [messageId, userId]
                );
            }

            const [likesRows]: [any[], any] = await db.query(
                'SELECT user_id FROM re_sports.chat_message_likes WHERE message_id = ?',
                [messageId]
            );

            const likedBy = likesRows.map((r: any) => r.user_id);

            const [roomRows]: [any[], any] = await db.query(
                'SELECT room_id FROM re_sports.chat_messages WHERE id = ?',
                [messageId]
            );

            if (roomRows.length > 0) {
                const roomId = roomRows[0].room_id;
                try {
                    const io = getIO();
                    io.to(roomId.toString()).emit('like', { messageId, likedBy });
                } catch (e) {
                    // ignore if socket not initialized
                }
            }

            res.json({ status: true, likedBy });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '좋아요 처리 실패' });
        }
    },
    // 사용자의 채팅 통계 조회
    stats: async (req: Request, res: Response) => {
        try {
            const roomId = req.params.roomId;
            const userId = res.locals.auth.user.id;

            if (!roomId) {
                return res.status(400).json({
                    status: false,
                    reason: "roomId가 필요합니다.",
                });
            }

            const db = getDatabaseConnection();

            const [totalMessagesRows]: any[] = await db.query(
                'SELECT COUNT(*) AS totalMessages FROM re_sports.chat_messages WHERE room_id = ? AND user_id = ?',
                [roomId, userId]
            );
            const totalMessages = totalMessagesRows[0]?.totalMessages ?? 0;

            const [totalLikesRows]: any[] = await db.query(
                `SELECT COUNT(*) AS totalLikes
                 FROM re_sports.chat_message_likes l
                 JOIN re_sports.chat_messages m ON l.message_id = m.id
                 WHERE m.room_id = ? AND m.user_id = ?`,
                [roomId, userId]
            );
            const totalLikes = totalLikesRows[0]?.totalLikes ?? 0;

            const [todayMessagesRows]: any[] = await db.query(
                `SELECT COUNT(*) AS todayMessages
                 FROM re_sports.chat_messages
                 WHERE room_id = ? AND user_id = ? AND DATE(created_at) = CURDATE()`,
                [roomId, userId]
            );
            const todayMessages = todayMessagesRows[0]?.todayMessages ?? 0;

            res.json({
                status: true,
                data: {
                    totalMessages,
                    totalLikes,
                    todayMessages,
                },
            });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '통계 조회 실패' });
        }
    },

    createChatBan: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const { user_id, reason } = req.body;
        const admin_id = res.locals.auth.user.id;
        if (!admin_id || !user_id) return res.status(400).json({ error: '필수값 누락' });

        try {
            const [existing] = await db.query(
                'SELECT * FROM admin_chat_ban WHERE user_id=? AND released_at IS NULL', [user_id]
            );
            if (Array.isArray(existing) && existing.length > 0)
                return res.status(400).json({ error: '이미 차단된 사용자입니다.' });

            await db.query(
                'INSERT INTO admin_chat_ban (user_id, admin_id, reason) VALUES (?, ?, ?)',
                [user_id, admin_id, reason || null]
            );
            res.json({ message: '채팅 금지 적용됨' });
        } catch (e) {
            res.status(500).json({ error: 'DB 오류' });
        }
    },

    releaseChatBan: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: '필수값 누락' });

        try {
            const [result] = await db.query(
                'UPDATE admin_chat_ban SET released_at=NOW() WHERE user_id=? AND released_at IS NULL', [user_id]
            );
            // @ts-ignore
            if (!result || result.affectedRows === 0)
                return res.status(400).json({ error: '해제할 차단이 없습니다.' });

            res.json({ message: '채팅 금지 해제됨' });
        } catch (e) {
            res.status(500).json({ error: 'DB 오류' });
        }
    },

    listChatBan: async (req: Request, res: Response) => {
        const db = getDatabaseConnection();
        try {
            // 현재 차단된 사용자 목록
            const [bans]: any[] = await db.query(
                `SELECT b.id, b.user_id, u.nickname, b.admin_id, a.nickname AS admin_nickname, b.reason, b.created_at
                 FROM admin_chat_ban b
                 JOIN re_sports.users u ON b.user_id = u.id
                 JOIN re_sports.users a ON b.admin_id = a.id
                 WHERE b.released_at IS NULL
                 ORDER BY b.created_at DESC`
            );
            res.json({ bans });
        } catch (e) {
            res.status(500).json({ error: 'DB 오류' });
        }
    },
    
    hideChatMessage: async (req: Request, res: Response) => {
        const { message_id } = req.body;
        if (!message_id) return res.status(400).json({ error: '필수값 누락' });

        const db = getDatabaseConnection();
        try {
            const [result]: any[] = await db.query(
                'UPDATE re_sports.chat_messages SET is_hidden=1 WHERE id=?',
                [message_id]
            );
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ error: '해당 메시지를 찾을 수 없습니다.' });
            }
            const [rows]: any[] = await db.query('SELECT room_id FROM re_sports.chat_messages WHERE id=?', [message_id]);
            res.json({ message: '메시지가 숨김 처리되었습니다.' });
        } catch (e) {
            res.status(500).json({ error: 'DB 오류' });
        }
    },
}
export default chatController; 