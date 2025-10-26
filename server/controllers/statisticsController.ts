import { Request, Response } from 'express';
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const statisticsController = {
    summary: async (_req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();

            const [[matchRow]]: any = await db.query(
                'SELECT COUNT(*) AS total FROM re_sports.matches'
            );
            const totalMatches = matchRow?.total ?? 0;

            const [[teamRow]]: any = await db.query(
                'SELECT COUNT(*) AS total FROM re_sports.teams'
            );
            const totalTeams = teamRow?.total ?? 0;

            const [[winsRow]]: any = await db.query(
                "SELECT COUNT(*) AS wins FROM re_sports.matches WHERE status='finished' AND score_a IS NOT NULL AND score_b IS NOT NULL AND score_a <> score_b"
            );
            const wins = winsRow?.wins ?? 0;

            const [[finishedRow]]: any = await db.query(
                "SELECT COUNT(*) AS finished FROM re_sports.matches WHERE status='finished'"
            );
            const finished = finishedRow?.finished ?? 0;

            const winRate = finished > 0 ? (wins / finished) * 100 : 0;

            const [[messageRow]]: any = await db.query(
                'SELECT COUNT(*) AS total FROM re_sports.chat_messages'
            );
            const totalMessages = messageRow?.total ?? 0;

            res.json({
                status: true,
                data: {
                    totalMatches,
                    winRate,
                    totalTeams,
                    totalMessages,
                },
            });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '통계 조회 실패' });
        }
    },
};

export default statisticsController;