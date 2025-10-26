"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, TrendingUp, TrendingDown, Minus, BarChart4, Target, Users, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { SPORTS_CONFIG } from "@/lib/data"
import type { RankingTeam, Game, SportType, Sports } from "@/lib/types"

export default function Rankings() {
    const [games] = useLocalStorage<Game[]>("table_data_matches", [])
    const [sportsData] = useLocalStorage<Sports[]>("table_data_sports", [])
    const [rankings] = useLocalStorage<Record<string, RankingTeam[]>>("table_data_standings", {})
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [loading] = useState(false)

    const availableYears = Array.from(new Set(games.map((g) => g.date.slice(0, 4)))).sort((a, b) => Number(b) - Number(a))

    const sports: SportType[] = sportsData.length > 0
        ? (sportsData.map((s) => s.name) as SportType[])
        : (Object.keys(SPORTS_CONFIG) as SportType[])

    // availableYears가 변경되면 첫 번째 년도로 기본값을 설정합니다.
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0])
        }
    }, [availableYears])

    const getCurrentYearData = () => {
        return rankings
    }

    const currentYearData = getCurrentYearData()

    const allRankingsEmpty =
        !loading &&
        sports.every((sport) => (currentYearData[sport] || []).length === 0)

    const getRankChange = (current: number, previous?: number) => {
        if (!previous) return <Minus className="h-4 w-4 text-gray-400" />
        if (current < previous) return <TrendingUp className="h-4 w-4 text-green-500" />
        if (current > previous) return <TrendingDown className="h-4 w-4 text-red-500" />
        return <Minus className="h-4 w-4 text-gray-400" />
    }

    const getFormBadge = (result: string) => {
        switch (result) {
            case "W":
                return <Badge className="w-6 h-6 p-0 bg-green-500 text-white text-xs">W</Badge>
            case "L":
                return <Badge className="w-6 h-6 p-0 bg-red-500 text-white text-xs">L</Badge>
            case "D":
                return <Badge className="w-6 h-6 p-0 bg-gray-500 text-white text-xs">D</Badge>
            default:
                return null
        }
    }

    // 종목별 통계 계산
    const getSportStats = (teams: any[], sportName: string) => {
        if (teams.length === 0) {
            return {
                totalTeams: 0,
                totalGames: 0,
                topTeam: "미정",
                topScorer: "미정",
            }
        }

        const totalTeams = teams.length
        const totalGames = games.filter((game) => game.date.startsWith(selectedYear) && game.sport === sportName).length / 2 // 각 경기가 두 팀에 중복되므로 나누기 2
        const topTeam = teams[0]?.team || "미정"
        const topScorer =
            teams.reduce((max, team) => ((team.goalsFor || 0) > (max.goalsFor || 0) ? team : max), teams[0])?.team || "미정"

        return {
            totalTeams,
            totalGames: Math.floor(totalGames),
            topTeam,
            topScorer,
        }
    }

    const SportStats = ({ teams, sport }: { teams: any[]; sport: string }) => {
        const stats = getSportStats(teams, sport)

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span>참여팀</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{stats.totalTeams}</div>
                        <p className="text-xs text-blue-600">개 팀 참여</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>총 경기수</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{stats.totalGames}</div>
                        <p className="text-xs text-blue-600">경기 진행</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-blue-600" />
                            <span>1위팀</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">🏆</div>
                        <p className="text-xs text-blue-600">{stats.topTeam}</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span>최다득점팀</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/*<div className="text-2xl font-bold text-blue-700">(팀로고)</div>*/}
                        <p className="text-xs text-blue-600">{stats.topScorer}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const RankingTable = ({ teams, sport }: { teams: any[]; sport: string }) => {
        if (teams.length === 0) {
            return (
                <div className="text-center py-16 text-gray-500">
                    <BarChart4 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">데이터가 없습니다</p>
                    <p className="text-sm">현재 이 종목에 대한 순위 정보가 없습니다.</p>
                </div>
            )
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-2">순위</th>
                            <th className="text-left py-3 px-2">팀명</th>
                            <th className="text-center py-3 px-2">경기</th>
                            <th className="text-center py-3 px-2">승</th>
                            <th className="text-center py-3 px-2">무</th>
                            <th className="text-center py-3 px-2">패</th>
                            <th className="text-center py-3 px-2">
                                {sport === "농구" ? "득점" : sport === "배구" ? "세트승" : "득점"}
                            </th>
                            <th className="text-center py-3 px-2">
                                {sport === "농구" ? "실점" : sport === "배구" ? "세트패" : "실점"}
                            </th>
                            <th className="text-center py-3 px-2">득실차</th>
                            <th className="text-center py-3 px-2">승점</th>
                            <th className="text-center py-3 px-2">최근 경기</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, index) => (
                            <tr key={team.rank} className={`border-b hover:bg-gray-50 ${index === 0 ? "bg-yellow-50" : ""}`}>
                                <td className="py-4 px-2">
                                    <div className="flex items-center space-x-2">
                                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                        <span className={`font-bold text-lg ${index === 0 ? "text-yellow-600" : ""}`}>{team.rank}</span>
                                        {getRankChange(team.rank, team.prevRank)}
                                    </div>
                                </td>
                                <td className="py-4 px-2">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{team.logo}</span>
                                        <div>
                                            <span className={`font-medium ${index === 0 ? "text-yellow-700" : ""}`}>{team.team}</span>
                                            {index === 0 && <div className="text-xs text-yellow-600">🏆 1위</div>}
                                            {index === 1 && <div className="text-xs text-gray-500">🥈 2위</div>}
                                            {index === 2 && <div className="text-xs text-orange-600">🥉 3위</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center py-4 px-2">{team.played}</td>
                                <td className="text-center py-4 px-2 text-green-600 font-medium">{team.wins}</td>
                                <td className="text-center py-4 px-2 text-gray-600">{team.draws}</td>
                                <td className="text-center py-4 px-2 text-red-600 font-medium">{team.losses}</td>
                                <td className="text-center py-4 px-2">{team.goalsFor}</td>
                                <td className="text-center py-4 px-2">{team.goalsAgainst}</td>
                                <td
                                    className={`text-center py-4 px-2 font-medium ${team.goalDiff > 0 ? "text-green-600" : team.goalDiff < 0 ? "text-red-600" : "text-gray-600"
                                        }`}
                                >
                                    {team.goalDiff > 0 ? "+" : ""}
                                    {team.goalDiff}
                                </td>
                                <td className="text-center py-4 px-2 font-bold text-blue-600">{team.points}</td>
                                <td className="text-center py-4 px-2">
                                    <div className="flex justify-center space-x-1">
                                        {team.form?.map((result: string, index: number) => (
                                            <div key={index}>{getFormBadge(result)}</div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Trophy className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">팀별 순위</h1>
                    </div>

                    {/* 년도 선택 드롭다운 */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">시즌:</span>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="년도 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}년
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-10 text-center text-gray-500">
                            <BarChart4 className="h-16 w-16 mx-auto mb-4 animate-spin" />
                            <h3 className="text-xl font-semibold text-gray-700">불러오는 중...</h3>
                        </CardContent>
                    </Card>
                ) : allRankingsEmpty ? (
                    <Card>
                        <CardContent className="p-10 text-center text-gray-500">
                            <BarChart4 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                            <h3 className="text-xl font-semibold text-gray-700">순위 정보 없음</h3>
                            <p className="mt-2">{selectedYear}년 시즌의 순위 정보가 없습니다. 리그가 시작되면 업데이트됩니다.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* 종목별 순위표 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedYear} 스포츠 리그 순위표</CardTitle>
                                <CardDescription>각 종목별 팀 순위 및 통계</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue={sports[0]} className="w-full">
                                    <TabsList
                                        className="grid w-full"
                                        style={{ gridTemplateColumns: `repeat(${sports.length}, minmax(0, 1fr))` }}
                                    >
                                        {sports.map((sport) => (
                                            <TabsTrigger key={sport} value={sport}>
                                                {SPORTS_CONFIG[sport]?.icon} {sport}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {sports.map((sport) => (
                                        <TabsContent key={sport} value={sport} className="mt-6">
                                            <SportStats teams={currentYearData[sport] || []} sport={sport} />
                                            <RankingTable teams={currentYearData[sport] || []} sport={sport} />
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* 시즌 정보 */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">{selectedYear} 시즌 정보</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{selectedYear}</div>
                                        <div className="text-sm text-blue-600">시즌</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {selectedYear === new Date().getFullYear().toString() ? "진행중" : "완료"}
                                        </div>
                                        <div className="text-sm text-green-600">상태</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{sports.length}</div>
                                        <div className="text-sm text-purple-600">종목</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 범례 */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">범례</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-2">순위 표시</h4>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                <span>1위 (우승)</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">🥈</span>
                                                <span>2위 (준우승)</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-orange-600">🥉</span>
                                                <span>3위</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">순위 변동</h4>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                <span>순위 상승</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                <span>순위 하락</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Minus className="h-4 w-4 text-gray-400" />
                                                <span>순위 변동 없음</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">최근 경기 결과</h4>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Badge className="w-6 h-6 p-0 bg-green-500 text-white text-xs">W</Badge>
                                                <span>승리</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className="w-6 h-6 p-0 bg-gray-500 text-white text-xs">D</Badge>
                                                <span>무승부</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className="w-6 h-6 p-0 bg-red-500 text-white text-xs">L</Badge>
                                                <span>패배</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">승점 계산</h4>
                                        <div className="space-y-1">
                                            <div>승리: 3점</div>
                                            <div>무승부: 1점</div>
                                            <div>패배: 0점</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </main>
        </div>
    )
}
