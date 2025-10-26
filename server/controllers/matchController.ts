import { Request, Response } from "express";
import { getDatabaseConnection } from '../db/index';
import logError from '../custom_modules/logError';

const matchController = {
    // 경기 목록 조회
    list: async (req: Request, res: Response) => {
        try {
            const db = getDatabaseConnection();
            const [matches] = await db.query(
                `
                SELECT m.id, s.name AS sport_name, 
                    t1.name AS team_a, t2.name AS team_b,
                    m.match_time, m.location, m.score_a, m.score_b, m.status, m.season_year
                FROM re_sports.matches m
                JOIN re_sports.sports s ON m.sport_id = s.id
                JOIN re_sports.teams t1 ON m.team_a_id = t1.id
                JOIN re_sports.teams t2 ON m.team_b_id = t2.id
                ORDER BY m.match_time ASC
                `
            );
            res.json({ status: true, data: matches });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "경기 목록을 가져오지 못했습니다." });
        }
    },

    // 새 경기 등록
    create: async (req: Request, res: Response) => {
        try {
            const { sport_id, team_a_id, team_b_id, match_time, location } = req.body;
            if (!sport_id || !team_a_id || !team_b_id || !match_time || !location) {
                return res.status(400).json({ status: false, reason: "필수 값이 누락되었습니다." });
            }

            if (team_a_id === team_b_id) {
                return res.status(400).json({ status: false, reason: "같은팀 끼리는 매치 시킬 수 없습니다." })
            }

            const db = getDatabaseConnection();

            const [sportsRows]: [any[], any] = await db.query('SELECT id FROM re_sports.sports WHERE id = ?', [sport_id]);
            if (sportsRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 종목입니다." });
            }

            // 2. team_a_id, team_b_id 존재 확인
            const [teamARows]: [any[], any] = await db.query('SELECT id FROM re_sports.teams WHERE id = ?', [team_a_id]);
            const [teamBRows]: [any[], any] = await db.query('SELECT id FROM re_sports.teams WHERE id = ?', [team_b_id]);
            if (teamARows.length === 0 || teamBRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 팀입니다." });
            }

            const seasonYear = new Date(match_time).getFullYear();
            await db.query(
                `
                INSERT INTO re_sports.matches
                (sport_id, team_a_id, team_b_id, match_time, location, status, season_year, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'scheduled', ?, NOW(), NOW())
                `,
                [sport_id, team_a_id, team_b_id, match_time, location, seasonYear]
            );
            res.json({ status: true, message: "경기가 성공적으로 등록되었습니다." });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "경기 등록에 실패했습니다." });
        }
    },

    // 경기 수정 (결과 입력 포함)
    update: async (req: Request, res: Response) => {
        try {
            const { match_id, score_a, score_b, status, match_time, location } = req.body;
            if (!match_id) {
                return res.status(400).json({ status: false, reason: "match_id가 필요합니다." });
            }
            const db = getDatabaseConnection();
            let seasonYear: number | undefined;
            if (match_time) {
                seasonYear = new Date(match_time).getFullYear();
            }
            await db.query(
                `
                UPDATE re_sports.matches
                SET score_a = COALESCE(?, score_a),
                    score_b = COALESCE(?, score_b),
                    status = COALESCE(?, status),
                    match_time = COALESCE(?, match_time),
                    location = COALESCE(?, location),
                    season_year = COALESCE(?, season_year),
                    updated_at = NOW()
                WHERE id = ?
                `,
                [score_a, score_b, status, match_time, location, seasonYear, match_id]
            );
            if (status === "finished") {
                await updateStandings(match_id, score_a, score_b);
            }
            res.json({ status: true });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "경기 수정에 실패했습니다." });
        }
    },

    // 경기 삭제
    delete: async (req: Request, res: Response) => {
        try {
            const { match_id } = req.body;
            if (!match_id) {
                return res.status(400).json({ status: false, reason: "match_id가 필요합니다." });
            }
            const db = getDatabaseConnection();
            await db.query(`DELETE FROM re_sports.matches WHERE id = ?`, [match_id]);
            res.json({ status: true });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "경기 삭제에 실패했습니다." });
        }
    },
};

export default matchController;

// standings 업데이트 함수
async function updateStandings(matchId: number, scoreA: number, scoreB: number) {
    try {
        const db = getDatabaseConnection();
        const [[match]]: any = await db.query(
            `
            SELECT sport_id, team_a_id, team_b_id, season_year
            FROM re_sports.matches
            WHERE id = ?
            `,
            [matchId]
        );
        if (!match) return;
        const { sport_id, team_a_id, team_b_id, season_year } = match;
        if (scoreA > scoreB) {
            // 팀 A 승리
            await Promise.all([
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 1, 0, 0, 3, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    wins = wins + 1, points = points + 3, updated_at = NOW()
                    `,
                    [sport_id, team_a_id, season_year]
                ),
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 0, 0, 1, 0, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    losses = losses + 1, updated_at = NOW()
                    `,
                    [sport_id, team_b_id, season_year]
                )
            ]);
        } else if (scoreA < scoreB) {
            // 팀 B 승리
            await Promise.all([
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 0, 0, 1, 0, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    losses = losses + 1, updated_at = NOW()
                    `,
                    [sport_id, team_a_id, season_year]
                ),
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 1, 0, 0, 3, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    wins = wins + 1, points = points + 3, updated_at = NOW()
                    `,
                    [sport_id, team_b_id, season_year]
                )
            ]);
        } else {
            // 무승부
            await Promise.all([
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 0, 1, 0, 1, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    draws = draws + 1, points = points + 1, updated_at = NOW()
                    `,
                    [sport_id, team_a_id, season_year]
                ),
                db.query(
                    `
                    INSERT INTO re_sports.standings (sport_id, team_id, season_year, wins, draws, losses, points, created_at, updated_at)
                    VALUES (?, ?, ?, 0, 1, 0, 1, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE
                    draws = draws + 1, points = points + 1, updated_at = NOW()
                    `,
                    [sport_id, team_b_id, season_year]
                )
            ]);
        }
    } catch (e) {
        logError(e);
    }
}