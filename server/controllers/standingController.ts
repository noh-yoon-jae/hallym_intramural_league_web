import { Request, Response } from "express";
import { getDatabaseConnection } from "../db/index";
import logError from "../custom_modules/logError";

const standingController = {
    // 랭킹 조회
    list: async (req: Request, res: Response) => {
        const { sport_id, season_year } = req.params;

        if (!sport_id) {
            return res.status(400).json({ status: false, reason: "sport_id는 필수입니다." });
        }

        try {
            const db = getDatabaseConnection();

            const [sportsRows]: [any[], any] = await db.query('SELECT id FROM re_sports.sports WHERE id = ?', [sport_id]);
            if (sportsRows.length === 0) {
                return res.status(400).json({ status: false, reason: "존재하지 않는 종목입니다." });
            }

            const [rows]: any = await db.query(
                `
                SELECT 
                t.id AS team_id,
                t.name AS team_name,
                t.logo_url,
                s.wins,
                s.draws,
                s.losses,
                s.points
                FROM re_sports.standings s
                JOIN re_sports.teams t ON s.team_id = t.id
                WHERE s.sport_id = ?
                ${season_year ? "AND s.season_year = ?" : ""}
                ORDER BY s.points DESC, s.wins DESC, s.draws DESC
                `,
                season_year ? [sport_id, season_year] : [sport_id]
            );

            // 랭킹 번호 추가
            const ranked = rows.map((row: any, idx: number) => ({
                rank: idx + 1,
                ...row
            }));

            res.json({ status: true, data: ranked });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "랭킹 정보를 불러오는 데 실패했습니다." });
        }
    },
    all: async (req: Request, res: Response) => {
        const { season_year } = req.params;
    
        try {
            const db = getDatabaseConnection();
    
            const [rows]: any = await db.query(
                `
                SELECT
                    s.sport_id,
                    sp.name AS sport_name,
                    t.id AS team_id,
                    t.name AS team_name,
                    t.logo_url,
                    s.wins,
                    s.draws,
                    s.losses,
                    s.points
                FROM re_sports.standings s
                JOIN re_sports.teams t ON s.team_id = t.id
                JOIN re_sports.sports sp ON s.sport_id = sp.id
                ${season_year ? "WHERE s.season_year = ?" : ""}
                ORDER BY s.sport_id, s.points DESC, s.wins DESC, s.draws DESC
                `,
                season_year ? [season_year] : []
            );
    
            const grouped: Record<string, any[]> = {};
            rows.forEach((row: any) => {
                if (!grouped[row.sport_name]) {
                    grouped[row.sport_name] = [];
                }
                grouped[row.sport_name].push(row);
            });
    
            Object.keys(grouped).forEach((sport) => {
                grouped[sport] = grouped[sport].map((r, idx) => ({ rank: idx + 1, ...r }));
            });
    
            res.json({ status: true, data: grouped });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: '랭킹 정보를 불러오는 데 실패했습니다.' });
        }
    },
    // 경기 결과를 기반으로 랭킹 갱신
    update: async (req: Request, res: Response) => {
        const { season_year } = req.body;
        const year = season_year || new Date().getFullYear();

        try {
            const db = getDatabaseConnection();

            // 해당 시즌 기존 기록 삭제
            await db.query(`DELETE FROM re_sports.standings WHERE season_year = ?`, [year]);

            // 경기 데이터를 집계하여 삽입
            await db.query(
                `
                INSERT INTO re_sports.standings (
                    sport_id, season_year, team_id,
                    wins, draws, losses, points,
                    created_at, updated_at
                )
                SELECT
                    sport_id,
                    season_year,
                    team_id,
                    SUM(wins) AS wins,
                    SUM(draws) AS draws,
                    SUM(losses) AS losses,
                    SUM(points) AS points,
                    NOW(), NOW()
                FROM (
                    SELECT
                        sport_id,
                        season_year,
                        team_a_id AS team_id,
                        CASE WHEN score_a > score_b THEN 1 ELSE 0 END AS wins,
                        CASE WHEN score_a = score_b THEN 1 ELSE 0 END AS draws,
                        CASE WHEN score_a < score_b THEN 1 ELSE 0 END AS losses,
                        CASE
                            WHEN score_a > score_b THEN 3
                            WHEN score_a = score_b THEN 1
                            ELSE 0
                        END AS points
                    FROM re_sports.matches
                    WHERE status = 'finished' AND season_year = ?
                    UNION ALL
                    SELECT
                        sport_id,
                        season_year,
                        team_b_id AS team_id,
                        CASE WHEN score_b > score_a THEN 1 ELSE 0 END AS wins,
                        CASE WHEN score_b = score_a THEN 1 ELSE 0 END AS draws,
                        CASE WHEN score_b < score_a THEN 1 ELSE 0 END AS losses,
                        CASE
                            WHEN score_b > score_a THEN 3
                            WHEN score_b = score_a THEN 1
                            ELSE 0
                        END AS points
                    FROM re_sports.matches
                    WHERE status = 'finished' AND season_year = ?
                ) AS results
                GROUP BY sport_id, season_year, team_id
                `,
                [year, year]
            );

            // table update 기록
            await db.query(
                `
                INSERT INTO re_sports.table_update_tracker (table_name, last_modified)
                VALUES ('standings', NOW())
                ON DUPLICATE KEY UPDATE last_modified = NOW()
                `
            );

            res.json({ status: true });
        } catch (e) {
            logError(e);
            res.status(500).json({ status: false, reason: "순위 갱신에 실패했습니다." });
        }
    }
};

export default standingController;