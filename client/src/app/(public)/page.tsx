"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MessageCircle, TrendingUp, Bell, Trophy, Gamepad2, Newspaper, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

import { LiveGameBanner } from "@/components/layout/live-game-banner"
import { SportTabs } from "@/components/ui/sport-tabs"
import { GameCard } from "@/components/ui/game-card"
import { NoticeCard } from "@/components/ui/notice-card"

import { useLocalStorage } from "@/hooks/use-local-storage"
import type { SportType, Game, Notice, RankingTeam, Sports, Team } from "@/lib/types"

export default function Dashboard() {
    const [games] = useLocalStorage<Game[]>("table_data_matches", [])
    const [notices] = useLocalStorage<Notice[]>("table_data_notices", [])
    const [rankings] = useLocalStorage<Record<string, RankingTeam[]>>("table_data_standings", {})
    const [sports] = useLocalStorage<Sports[]>("table_data_sports", [])
    const [teams] = useLocalStorage<Team[]>("table_data_teams", [])

    const [stats, setStats] = useState({
        totalMatches: 0,
        winRate: 0,
        totalTeams: 0,
        totalMessages: 0,
    })

    useEffect(() => {
        fetch('/api/statistics/summary', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.status) setStats(data.data)
            })
            .catch(() => {})
    }, [])

    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentLiveGame, setCurrentLiveGame] = useState<Game | null>(null)
    const [showNoticePopup, setShowNoticePopup] = useState(false)
    const [dontShowToday, setDontShowToday] = useState(false)
    const [selectedSport, setSelectedSport] = useState<SportType | undefined>(undefined)

    const popupNotice = notices.find((n) => n.important)
    const upcomingGames = games.filter((g) => g.status === "scheduled")
    const liveGames = games.filter((g) => g.startTime && g.endTime)

    const recentGames = [...games]
        .sort((a, b) => {
            const aDate = new Date(`${a.date}${a.time ? ` ${a.time}` : ""}`)
            const bDate = new Date(`${b.date}${b.time ? ` ${b.time}` : ""}`)
            return bDate.getTime() - aDate.getTime()
        })

    useEffect(() => {
        if (sports.length > 0 && !selectedSport) {
            setSelectedSport(sports[0]?.name as SportType)
        }
    }, [sports])

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const now = currentTime
        const liveGame = liveGames.find(
            (game) => game.startTime && game.endTime && now >= game.startTime && now <= game.endTime,
        )
        setCurrentLiveGame(liveGame || null)
    }, [currentTime, liveGames])

    useEffect(() => {
        const today = new Date().toDateString()
        const hideNoticeToday = localStorage.getItem(`hideNotice_${today}`)

        if (!hideNoticeToday && popupNotice) {
            setShowNoticePopup(true)
        }
    }, [popupNotice])

    const handleCloseNoticePopup = () => {
        if (dontShowToday) {
            const today = new Date().toDateString()
            localStorage.setItem(`hideNotice_${today}`, "true")
        }
        setShowNoticePopup(false)
    }

    const getCurrentRankings = () => {
        return rankings[selectedSport as SportType] || []
    }

    const currentRankings = getCurrentRankings()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {currentLiveGame && <LiveGameBanner game={currentLiveGame} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 경기수</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMatches}</div>
                            <p className="text-xs text-muted-foreground">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">승률</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">활동 팀수</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTeams}</div>
                            <p className="text-xs text-muted-foreground">축구, 농구, 배구 등</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">응원 메시지</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMessages}</div>
                            <p className="text-xs text-muted-foreground">+1 today</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 최근 경기 결과 */}
                    <Card className="lg:col-span-2 flex flex-col">
                        <CardHeader>
                            <CardTitle>최근 경기 결과</CardTitle>
                            <CardDescription>지난 주 우리 팀들의 경기 결과입니다</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {recentGames.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Gamepad2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">경기 결과가 없습니다</p>
                                    <p className="text-sm">최근 진행된 경기가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentGames.slice(0, 3).map((game) => (
                                        <GameCard key={game.id} game={game} showScore />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full bg-transparent">
                                <Link href="/results">모든 경기 결과 보기</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* 팀 순위 */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>종목별 팀 순위</CardTitle>
                            <CardDescription>각 종목별 현재 시즌 순위</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <SportTabs
                                sports={sports.map((sport: Sports) => sport?.name as SportType)}
                                selectedSport={selectedSport as SportType}
                                onSportChange={setSelectedSport}
                                className="mb-4"
                            />

                            {currentRankings.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">순위 정보가 없습니다</p>
                                    <p className="text-sm">현재 선택된 종목의 순위가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentRankings.slice(0, 4).map((team: RankingTeam) => (
                                        <div
                                            key={team.rank}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                                                    {team.rank}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg">{team.logo}</span>
                                                    <div>
                                                        <div className="font-medium text-sm">{team.team}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {team.wins}승 {team.losses}패
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-blue-600">{team.points}점</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full bg-transparent">
                                <Link href="/rankings">전체 순위 보기</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* 공지사항 */}
                <Card className="mt-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                <CardTitle>공지사항</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/notices">전체보기</Link>
                            </Button>
                        </div>
                        <CardDescription>최신 공지사항을 확인하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {notices.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Newspaper className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="font-semibold">공지사항이 없습니다</p>
                                <p className="text-sm">최신 공지사항이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notices.slice(0, 3).map((notice) => (
                                    <NoticeCard key={notice.id} notice={notice} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 다가오는 경기 */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>다가오는 경기</CardTitle>
                        <CardDescription>이번 주 예정된 경기 일정</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingGames.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Info className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="font-semibold">예정된 경기가 없습니다</p>
                                <p className="text-sm">다가오는 경기 일정이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingGames.map((game) => (
                                    <div key={game.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <GameCard game={game} className="border-0 bg-transparent p-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* 팝업 공지사항 */}
            {showNoticePopup && (
                <Dialog open={showNoticePopup} onOpenChange={setShowNoticePopup}>
                    <DialogContent className="max-w-lg border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="relative">
                            <div className="absolute top-4 right-4 w-12 h-12 bg-blue-200 rounded-full opacity-30"></div>
                            <div className="absolute bottom-6 left-6 w-8 h-8 bg-indigo-300 rounded-full opacity-40"></div>
                            <div className="absolute top-1/2 right-8 w-6 h-6 bg-purple-200 rounded-full opacity-25"></div>
                            <div className="absolute top-8 left-4 w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-20"></div>

                            <DialogHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Bell className="h-8 w-8 text-white" />
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">📢 중요 공지사항</DialogTitle>
                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm">
                                    <h3 className="font-semibold text-lg text-blue-900 mb-2">{popupNotice?.title}</h3>
                                    <DialogDescription className="text-gray-700 leading-relaxed">
                                        {popupNotice?.content}
                                    </DialogDescription>
                                </div>
                            </DialogHeader>

                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/50">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="dont-show-today"
                                        checked={dontShowToday}
                                        onCheckedChange={(checked) => setDontShowToday(Boolean(checked))}
                                        className="border-2 border-blue-400"
                                    />
                                    <label
                                        htmlFor="dont-show-today"
                                        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                                    >
                                        오늘 하루 더 이상 표시하지 않기
                                    </label>
                                </div>
                            </div>

                            <DialogFooter className="flex justify-center">
                                <Button
                                    onClick={handleCloseNoticePopup}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 px-8"
                                >
                                    확인
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
