"use client"

import { useEffect } from "react"

interface SyncOptions {
    seasonYear?: number
    noticeCategories?: string
}

const TABLE_NAME_MAP: Record<string, string> = {
    rooms: "chat_rooms",
    // 필요시 확장: 'users': 'user_accounts', ...
}

function mapTableNames(tables: string[]): string[] {
    return tables.map((t) => TABLE_NAME_MAP[t] || t)
}

function unmapTableName(dbName: string): string {
    // 역매핑 필요시, dbName을 프론트에서 사용하는 이름으로
    const reverse = Object.entries(TABLE_NAME_MAP).reduce(
        (acc, [k, v]) => ({ ...acc, [v]: k }),
        {} as Record<string, string>
    )
    return reverse[dbName] || dbName
}

const TABLE_FETCHERS: Record<string, (param?: any) => Promise<any>> = {
    sports: async () => {
        const res = await fetch("/api/sport/list", { credentials: "include" })
        const json = await res.json()
        return json.status ? json.data : []
    },
    teams: async () => {
        const res = await fetch("/api/team/list", { credentials: "include" })
        const json = await res.json()
        return json.status ? json.data : []
    },
    categories: async () => {
        const res = await fetch("/api/category/list", { credentials: "include" })
        const json = await res.json()
        return json.status ? json.data : []
    },
    rooms: async () => {
        const res = await fetch("/api/room/list", { credentials: "include" })
        const json = await res.json()
        return json.status ? json.data : []
    },
    matches: async () => {
        const res = await fetch("/api/match/list", { credentials: "include" })
        const json = await res.json()
        if (!json.status) return []
        return json.data.map((m: any) => {
            const date = m.match_time ? new Date(m.match_time) : null
            return {
                id: m.id,
                sport: m.sport_name,
                team1: m.team_a,
                team2: m.team_b,
                date: date ? date.toISOString().slice(0, 10) : "",
                time: date ? date.toISOString().slice(11, 16) : "",
                score:
                    m.score_a != null && m.score_b != null
                        ? `${m.score_a}-${m.score_b}`
                        : undefined,
                winner:
                    m.score_a != null && m.score_b != null
                        ? m.score_a > m.score_b
                            ? m.team_a
                            : m.score_b > m.score_a
                                ? m.team_b
                                : undefined
                        : undefined,
                status: m.status,
                location: m.location,
            }
        })
    },
    standings: async (year?: number) => {
        const y = year || new Date().getFullYear()
        const res = await fetch(`/api/standing/all/${y}`, { credentials: "include" })
        const json = await res.json()
        if (!json.status) return {}
        const result: Record<string, any[]> = {}
        Object.keys(json.data).forEach((sport) => {
            result[sport] = json.data[sport].map((r: any) => ({
                rank: r.rank,
                team: r.team_name,
                wins: r.wins,
                draws: r.draws,
                losses: r.losses,
                points: r.points,
                logo: r.logo_url,
            }))
        })
        return result
    },
    notices: async (cats?: string) => {
        const categories = cats || ""
        const path = categories ? `/api/notice/list/${encodeURIComponent(categories)}` : "/api/notice/list"
        const res = await fetch(path, { credentials: "include" })
        const json = await res.json()
        if (!json.status) return []
        return json.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            date: n.created_at ? n.created_at.slice(0, 10) : "",
            category: n.category || "",
            important: n.important || false,
            author: n.author || "",
            views: n.view_count,
        }))
    },
}

export function useDataSync(tables: string[], options: SyncOptions = {}) {
    useEffect(() => {
        const sync = async () => {
            try {
                // 1. 매핑해서 실제 서버에 요청할 이름으로 변경
                const mappedTables = mapTableNames(tables)

                const res = await fetch("/api/table-update/last-updated", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tables: mappedTables }),
                    credentials: "include",
                })
                const result = await res.json()
                if (!result.status) return

                // 2. 응답받은 DB테이블명을 다시 프론트 명칭으로 unmap해서 처리
                for (const table of tables) {
                    const dbName = TABLE_NAME_MAP[table] || table;
                    const last = result.data?.[dbName]; // 서버 응답
                    const localLast = localStorage.getItem(`last_updated_${table}`);
                    let localData = localStorage.getItem(`table_data_${table}`);

                    let isDataValid = false;

                    if (last && localLast === last && localData) {
                        try {
                            JSON.parse(localData);  // 로컬 데이터 파싱 시도
                            isDataValid = true;     // 파싱 성공하면 데이터 유효
                        } catch (e) {
                            console.warn(`로컬 데이터 손상: table=${table}`, e);
                            localData = null;       // 손상된 데이터는 무효 처리
                        }
                    }

                    if (isDataValid) continue;  // 최신 데이터가 유효하면 fetch 건너뛰기

                    const fetcher = TABLE_FETCHERS[table];
                    if (fetcher) {
                        const data = await fetcher(
                            table === "standings"
                                ? options.seasonYear
                                : table === "notices"
                                    ? options.noticeCategories
                                    : undefined,
                        );

                        localStorage.setItem(`table_data_${table}`, JSON.stringify(data));
                        if (last) localStorage.setItem(`last_updated_${table}`, last);
                        window.dispatchEvent(new Event("local-storage"));
                    }
                }
            } catch (e) {
                console.error("데이터 동기화 실패", e)
            }
        }
        sync()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
