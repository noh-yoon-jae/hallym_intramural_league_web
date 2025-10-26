"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Calendar, MapPin, Search, Filter, TrendingUp, BarChart3, Target } from 'lucide-react'
import { useState } from "react"
import type { Game } from "@/lib/types"
import { SPORTS_CONFIG } from "@/lib/data"

// 모의 경기 결과 데이터
const mockResults: Game[] = [
  {
    id: 1,
    sport: "축구",
    team1: "레드 이글스",
    team2: "블루 타이거즈",
    date: "2024-01-18",
    time: "15:00",
    location: "메인 경기장",
    status: "완료",
    score: "3-1",
    winner: "레드 이글스",
  },
  {
    id: 2,
    sport: "농구",
    team1: "골든 호크스",
    team2: "실버 울브스",
    date: "2024-01-17",
    time: "16:30",
    location: "체육관 A",
    status: "완료",
    score: "78-65",
    winner: "골든 호크스",
  },
  {
    id: 3,
    sport: "배구",
    team1: "화이트 팬더스",
    team2: "그린 드래곤스",
    date: "2024-01-16",
    time: "14:00",
    location: "체육관 B",
    status: "완료",
    score: "3-2",
    winner: "화이트 팬더스",
  },
  {
    id: 4,
    sport: "축구",
    team1: "블랙 라이온스",
    team2: "옐로우 비즈",
    date: "2024-01-15",
    time: "15:30",
    location: "서브 경기장",
    status: "완료",
    score: "2-2",
    winner: "무승부",
  },
  {
    id: 5,
    sport: "농구",
    team1: "퍼플 나이츠",
    team2: "오렌지 피닉스",
    date: "2024-01-14",
    time: "16:00",
    location: "체육관 A",
    status: "완료",
    score: "85-79",
    winner: "퍼플 나이츠",
  },
  {
    id: 6,
    sport: "테니스",
    team1: "다이아몬드 에이스",
    team2: "루비 스매시",
    date: "2024-01-13",
    time: "13:00",
    location: "테니스 코트",
    status: "완료",
    score: "6-4, 6-2",
    winner: "다이아몬드 에이스",
  },
  {
    id: 7,
    sport: "배구",
    team1: "사파이어 스파이크",
    team2: "에메랄드 블록",
    date: "2024-01-12",
    time: "14:30",
    location: "체육관 B",
    status: "완료",
    score: "3-1",
    winner: "사파이어 스파이크",
  },
  {
    id: 8,
    sport: "야구",
    team1: "크림슨 배츠",
    team2: "네이비 글러브스",
    date: "2024-01-11",
    time: "15:00",
    location: "야구장",
    status: "완료",
    score: "7-4",
    winner: "크림슨 배츠",
  },
]

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState("전체")
  const [selectedMonth, setSelectedMonth] = useState("전체")
  const [selectedResult, setSelectedResult] = useState("전체")
  const [sortBy, setSortBy] = useState("최신순")

  // 필터링 로직
  const filteredResults = mockResults.filter((game) => {
    const matchesSearch = 
      game.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSport = selectedSport === "전체" || game.sport === selectedSport
    
    const gameMonth = new Date(game.date).getMonth() + 1
    const matchesMonth = selectedMonth === "전체" || gameMonth.toString() === selectedMonth
    
    const matchesResult = selectedResult === "전체" || 
      (selectedResult === "승부" && game.winner !== "무승부") ||
      (selectedResult === "무승부" && game.winner === "무승부")
    
    return matchesSearch && matchesSport && matchesMonth && matchesResult
  })

  // 정렬 로직
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "최신순":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "오래된순":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "종목순":
        return a.sport.localeCompare(b.sport)
      default:
        return 0
    }
  })

  // 통계 계산
  const totalGames = filteredResults.length
  const completedGames = filteredResults.filter(g => g.status === "완료").length
  const drawGames = filteredResults.filter(g => g.winner === "무승부").length
  const sportsCount = new Set(filteredResults.map(g => g.sport)).size

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">경기 결과</h1>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 경기수</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGames}</div>
              <p className="text-xs text-muted-foreground">필터링된 결과</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 경기</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGames}</div>
              <p className="text-xs text-muted-foreground">전체 경기 중</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">무승부</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drawGames}</div>
              <p className="text-xs text-muted-foreground">박빙의 승부</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">참여 종목</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sportsCount}</div>
              <p className="text-xs text-muted-foreground">다양한 스포츠</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>필터 및 검색</span>
            </CardTitle>
            <CardDescription>원하는 조건으로 경기 결과를 찾아보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* 검색 */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="팀명, 장소 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 종목 필터 */}
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="종목 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 종목</SelectItem>
                  {Object.entries(SPORTS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 월별 필터 */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 월</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 결과 필터 */}
              <Select value={selectedResult} onValueChange={setSelectedResult}>
                <SelectTrigger>
                  <SelectValue placeholder="결과 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 결과</SelectItem>
                  <SelectItem value="승부">승부 결정</SelectItem>
                  <SelectItem value="무승부">무승부</SelectItem>
                </SelectContent>
              </Select>

              {/* 정렬 */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="최신순">최신순</SelectItem>
                  <SelectItem value="오래된순">오래된순</SelectItem>
                  <SelectItem value="종목순">종목순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 경기 결과 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>경기 결과 목록</CardTitle>
            <CardDescription>
              {sortedResults.length}개의 경기 결과 ({selectedSport === "전체" ? "전체 종목" : SPORTS_CONFIG[selectedSport as keyof typeof SPORTS_CONFIG]?.name})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">검색 결과가 없습니다</h3>
                <p>다른 조건으로 검색해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedResults.map((game) => (
                  <div
                    key={game.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-3xl">{SPORTS_CONFIG[game.sport].icon}</span>
                          <div>
                            <h3 className="font-bold text-xl">
                              {game.team1} vs {game.team2}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {game.date} {game.time}
                              </span>
                              {game.location && (
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {game.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 경기 결과 */}
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {game.sport}
                          </Badge>
                          {game.score && (
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="text-lg px-4 py-2 font-bold">
                                {game.score}
                              </Badge>
                              {game.winner && game.winner !== "무승부" && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                                  🏆 {game.winner} 승리
                                </Badge>
                              )}
                              {game.winner === "무승부" && (
                                <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1">
                                  🤝 무승부
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant={game.status === "완료" ? "default" : "secondary"}
                          className="mb-2"
                        >
                          {game.status}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {new Date(game.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 페이지네이션 (추후 구현 가능) */}
        {sortedResults.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                이전
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                다음
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}