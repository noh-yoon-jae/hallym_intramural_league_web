"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Plus, Edit, Trash2, Trophy, Calendar, MapPin } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { SPORTS_CONFIG, COLLEGES } from "@/lib/data"
import type { Game, SportType } from "@/lib/types"

// 모의 경기 데이터
const mockGames: Game[] = [
  {
    id: 1,
    sport: "축구",
    team1: "공과대학",
    team2: "간호대학",
    date: "2024-01-20",
    time: "15:00",
    location: "학교 운동장",
    status: "예정",
  },
  {
    id: 2,
    sport: "농구",
    team1: "자연과학대학",
    team2: "경영대학",
    date: "2024-01-18",
    time: "16:30",
    location: "체육관",
    status: "완료",
    score: "78-65",
    winner: "자연과학대학",
  },
  {
    id: 3,
    sport: "배구",
    team1: "간호대학",
    team2: "인문대학",
    date: "2024-01-22",
    time: "14:00",
    location: "체육관",
    status: "예정",
  },
  {
    id: 4,
    sport: "축구",
    team1: "인문대학",
    team2: "경영대학",
    date: "2023-12-15",
    time: "15:30",
    location: "학교 운동장",
    status: "완료",
    score: "2-1",
    winner: "인문대학",
  },
  {
    id: 5,
    sport: "농구",
    team1: "경영대학",
    team2: "공과대학",
    date: "2023-11-28",
    time: "16:00",
    location: "체육관",
    status: "완료",
    score: "85-79",
    winner: "경영대학",
  },
  {
    id: 6,
    sport: "배구",
    team1: "자연과학대학",
    team2: "간호대학",
    date: "2023-10-20",
    time: "14:30",
    location: "체육관",
    status: "완료",
    score: "3-1",
    winner: "자연과학대학",
  },
]

export default function AdminGamesPage() {
  const { checkPermission } = useAdminAuth()
  const { success } = useToastContext()
  const [games, setGames] = useState<Game[]>(mockGames)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("scheduled")
  const [selectedYear, setSelectedYear] = useState<string>("전체")

  // Get available years from games data
  const availableYears = [...new Set(games.map((game) => new Date(game.date).getFullYear()))].sort((a, b) => b - a)

  // 권한 확인
  if (!checkPermission(ADMIN_PERMISSIONS.MANAGE_GAMES)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">경기 관리 권한이 필요합니다.</p>
        </div>
      </AdminLayout>
    )
  }

  const handleAddGame = () => {
    setSelectedGame(null)
    setIsDialogOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setSelectedGame(game)
    setIsDialogOpen(true)
  }

  const handleDeleteGame = (gameId: number) => {
    setGames(games.filter((g) => g.id !== gameId))
    success("경기가 삭제되었습니다.")
  }

  const handleSaveGame = (gameData: Partial<Game>) => {
    if (selectedGame) {
      // 수정
      setGames(games.map((g) => (g.id === selectedGame.id ? { ...g, ...gameData } : g)))
      success("경기 정보가 수정되었습니다.")
    } else {
      // 추가
      const newGame: Game = {
        id: Math.max(...games.map((g) => g.id)) + 1,
        sport: "축구",
        team1: "공과대학",
        team2: "간호대학",
        date: new Date().toISOString().split("T")[0],
        status: "예정",
        ...gameData,
      }
      setGames([...games, newGame])
      success("새 경기가 등록되었습니다.")
    }
    setIsDialogOpen(false)
  }

  const filteredGames = games.filter((g) => {
    const gameYear = new Date(g.date).getFullYear().toString()
    return selectedYear === "전체" || gameYear === selectedYear
  })

  const scheduledGames = filteredGames.filter((g) => {
    const gameYear = new Date(g.date).getFullYear().toString()
    const matchesYear = selectedYear === "전체" || gameYear === selectedYear
    return g.status === "예정" && matchesYear
  })

  const completedGames = filteredGames.filter((g) => {
    const gameYear = new Date(g.date).getFullYear().toString()
    const matchesYear = selectedYear === "전체" || gameYear === selectedYear
    return g.status === "완료" && matchesYear
  })

  const liveGames = filteredGames.filter((g) => {
    const gameYear = new Date(g.date).getFullYear().toString()
    const matchesYear = selectedYear === "전체" || gameYear === selectedYear
    return g.status === "진행중" && matchesYear
  })

  const filteredScheduledGames = filteredGames.filter((g) => g.status === "예정")
  const filteredCompletedGames = filteredGames.filter((g) => g.status === "완료")
  const filteredLiveGames = filteredGames.filter((g) => g.status === "진행중")

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">경기 관리</h1>
            <p className="text-gray-600 mt-2">경기 일정과 결과를 관리합니다</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddGame}>
              <Plus className="h-4 w-4 mr-2" />
              경기 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 경기</p>
                  <p className="text-2xl font-bold">{filteredGames.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">예정 경기</p>
                  <p className="text-2xl font-bold">{filteredScheduledGames.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">완료 경기</p>
                  <p className="text-2xl font-bold">{filteredCompletedGames.length}</p>
                </div>
                <Badge className="bg-gray-500">{filteredCompletedGames.length}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">진행중</p>
                  <p className="text-2xl font-bold">{filteredLiveGames.length}</p>
                </div>
                <Badge className="bg-red-500">{filteredLiveGames.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 경기 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>경기 목록</CardTitle>
            <CardDescription>등록된 모든 경기를 확인하고 관리할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="scheduled">예정 경기 ({filteredScheduledGames.length})</TabsTrigger>
                <TabsTrigger value="live">진행중 ({filteredLiveGames.length})</TabsTrigger>
                <TabsTrigger value="completed">완료 경기 ({filteredCompletedGames.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled" className="mt-4">
                <GameList games={scheduledGames} onEdit={handleEditGame} onDelete={handleDeleteGame} />
              </TabsContent>

              <TabsContent value="live" className="mt-4">
                <GameList games={liveGames} onEdit={handleEditGame} onDelete={handleDeleteGame} />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <GameList games={completedGames} onEdit={handleEditGame} onDelete={handleDeleteGame} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 경기 추가/수정 다이얼로그 */}
        <GameDialog game={selectedGame} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveGame} />
      </div>
    </AdminLayout>
  )
}

// 경기 목록 컴포넌트
function GameList({
  games,
  onEdit,
  onDelete,
}: {
  games: Game[]
  onEdit: (game: Game) => void
  onDelete: (id: number) => void
}) {
  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>등록된 경기가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{SPORTS_CONFIG[game.sport].icon}</span>
                <div>
                  <h3 className="font-semibold">
                    {game.team1} vs {game.team2}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
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
              {game.score && (
                <div className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    {game.score}
                  </Badge>
                  {game.winner && <Badge className="bg-green-500">🏆 {game.winner} 승리</Badge>}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={game.status === "완료" ? "default" : game.status === "진행중" ? "destructive" : "secondary"}
              >
                {game.status}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => onEdit(game)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(game.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 경기 추가/수정 다이얼로그
function GameDialog({
  game,
  open,
  onOpenChange,
  onSave,
}: {
  game: Game | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Game>) => void
}) {
  const [formData, setFormData] = useState<Partial<Game>>({
    sport: "축구",
    team1: "공과대학",
    team2: "간호대학",
    date: new Date().toISOString().split("T")[0],
    time: "15:00",
    location: "학교 운동장",
    status: "예정",
  })

  // 다이얼로그가 열릴 때 폼 데이터 초기화
  useState(() => {
    if (open) {
      if (game) {
        setFormData(game)
      } else {
        setFormData({
          sport: "축구",
          team1: "공과대학",
          team2: "간호대학",
          date: new Date().toISOString().split("T")[0],
          time: "15:00",
          location: "학교 운동장",
          status: "예정",
        })
      }
    }
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{game ? "경기 수정" : "경기 추가"}</DialogTitle>
          <DialogDescription>경기 정보를 입력하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>종목</Label>
            <Select
              value={formData.sport}
              onValueChange={(value: SportType) =>
                setFormData({ ...formData, sport: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SPORTS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>팀 1</Label>
              <Select value={formData.team1} onValueChange={(value) => setFormData({ ...formData, team1: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLEGES).map(([key, college]) => (
                    <SelectItem key={key} value={key}>
                      {college.logo} {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>팀 2</Label>
              <Select value={formData.team2} onValueChange={(value) => setFormData({ ...formData, team2: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLEGES).map(([key, college]) => (
                    <SelectItem key={key} value={key}>
                      {college.logo} {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>날짜</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>시간</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>장소</Label>
            <Input
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="경기 장소"
            />
          </div>

          <div>
            <Label>상태</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="예정">예정</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="취소">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "완료" && (
            <div>
              <Label>경기 결과</Label>
              <Input
                value={formData.score || ""}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                placeholder="예: 3-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>{game ? "수정" : "추가"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
