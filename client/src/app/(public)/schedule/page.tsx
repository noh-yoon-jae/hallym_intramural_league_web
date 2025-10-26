"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, CalendarX2 } from "lucide-react"
import { useState, useRef } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Game } from "@/lib/types"

export default function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const gameRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

    // 데이터를 비웁니다.
    const [games] = useLocalStorage<Game[]>("table_data_matches", [])

    const handleGameClick = (gameId: number) => {
        const gameElement = gameRefs.current[gameId]
        if (gameElement) {
            gameElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
            // 클릭된 경기를 하이라이트
            gameElement.style.backgroundColor = "#dbeafe"
            setTimeout(() => {
                gameElement.style.backgroundColor = ""
            }, 2000)
        }
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        // 빈 셀들 추가
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 border border-gray-200"></div>)
        }

        // 날짜 셀들 추가
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayGames = games.filter((game) => game.date === dateStr)
            const hasGames = dayGames.length > 0

            days.push(
                <div
                    key={day}
                    className={`h-20 border p-2 hover:bg-gray-50 transition-colors relative ${hasGames ? "bg-blue-50 border-blue-200" : "border-gray-200"
                        }`}
                >
                    {/* 날짜 숫자 */}
                    <div className={`font-medium text-sm mb-1 ${hasGames ? "text-blue-700" : "text-gray-900"}`}>{day}</div>

                    {/* 우측 상단 점 표시 */}
                    {hasGames && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}

                    {/* 경기 있음 표시 */}
                    {hasGames && (
                        <div className="absolute bottom-1 right-1 text-[11px] text-blue-600 font-medium">
                            경기 있음 (+{dayGames.length})
                        </div>
                    )}
                </div>
            )
        }

        return days
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-4 mb-8">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">경기 일정</h1>
                </div>
                {games.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center text-gray-500">
                            <CalendarX2 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                            <h3 className="text-xl font-semibold text-gray-700">경기 일정 없음</h3>
                            <p className="mt-2">현재 등록된 경기 일정이 없습니다. 곧 업데이트될 예정입니다.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 달력 */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                                    </CardTitle>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={prevMonth}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={nextMonth}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span>경기 있는 날</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                                        <span>경기 일정</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-0 mb-4">
                                    {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                                        <div
                                            key={day}
                                            className="h-10 flex items-center justify-center font-medium text-gray-600 border border-gray-200 bg-gray-50"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-0">{renderCalendar()}</div>
                            </CardContent>
                        </Card>

                        {/* 다가오는 경기 목록 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="pb-1.5 pt-1.5">이번 달 예정된 경기들</CardTitle>
                                <p className="text-sm text-gray-500 mb-4">
                                    팀을 응원하고 싶다면 <b>응원하기</b> 버튼을 눌러보세요.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
                                    {games.filter((game) => new Date(game.date) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)).length === 0 ? (
                                        <div className="p-10 text-center text-gray-500">
                                            <CalendarX2 className="h-16 w-16 mx-auto mb-4 opacity-40" />
                                            <h3 className="text-xl font-semibold text-gray-700">경기 일정 없음</h3>
                                            <p className="mt-2">이번 달에 예정된 경기가 없습니다.</p>
                                        </div>
                                    ) : (
                                        games
                                            .filter((game) => new Date(game.date) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
                                            .map((game) => (
                                                <div
                                                    key={game.id}
                                                    ref={(el) => { gameRefs.current[game.id] = el; }}
                                                    className="border rounded-lg p-4 bg-white transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold">
                                                            [{game.sport}] {game.team1} vs {game.team2}
                                                        </h3>
                                                        <Badge variant="outline">{game.status}</Badge>
                                                    </div>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            {game.date}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            {game.time}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            {game.location}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex space-x-2">
                                                        <Button size="sm" variant="outline">
                                                            응원하기
                                                        </Button>
                                                        <Button size="sm" variant="ghost">
                                                            상세보기
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
