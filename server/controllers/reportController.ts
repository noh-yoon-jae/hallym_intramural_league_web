import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const reportController = {
    reportChatMessage: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.auth.user.id;
            const { messageId, reason } = req.body;

            if (!messageId) {
                return res.status(400).json({ status: false, reason: 'messageId가 필요합니다.' });
            }
            if (!reason) {
                return res.status(400).json({ status: false, reason: '신고 사유가 필요합니다.' });
            }

            const db = getDatabaseConnection();
            await db.query(
                'INSERT INTO re_sports.chat_message_reports (message_id, user_id, reason, created_at) VALUES (?, ?, ?, NOW())',
                [messageId, userId, reason]
            );
            await db.query('UPDATE re_sports.chat_messages SET is_reported = 1 WHERE id = ?', [messageId]);
            res.json({ status: true });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '신고 처리 실패' });
        }
    }
};

export default reportController;