"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { DialogDescription } from "@/components/ui/dialog"

import { DialogTitle } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Plus, Trash2, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { SPORTS_CONFIG, COLLEGES } from "@/lib/data"
import type { Game, SportType } from "@/lib/types"

// 모의 일정 데이터
const mockSchedules: Game[] = [
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
    date: "2024-01-22",
    time: "16:30",
    location: "체육관",
    status: "예정",
  },
  {
    id: 3,
    sport: "배구",
    team1: "간호대학",
    team2: "인문대학",
    date: "2024-01-25",
    time: "14:00",
    location: "체육관",
    status: "예정",
  },
  {
    id: 4,
    sport: "테니스",
    team1: "자연과학대학",
    team2: "경영대학",
    date: "2024-01-27",
    time: "13:30",
    location: "테니스장",
    status: "예정",
  },
]

export default function AdminSchedulesPage() {
  const { checkPermission } = useAdminAuth()
  const { success } = useToastContext()
  const [schedules, setSchedules] = useState<Game[]>(mockSchedules)
  const [selectedSchedule, setSelectedSchedule] = useState<Game | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // 권한 확인
  if (!checkPermission(ADMIN_PERMISSIONS.MANAGE_SCHEDULES)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">일정 관리 권한이 필요합니다.</p>
        </div>
      </AdminLayout>
    )
  }

  const handleAddSchedule = () => {
    setSelectedSchedule(null)
    setIsDialogOpen(true)
  }

  const handleEditSchedule = (schedule: Game) => {
    setSelectedSchedule(schedule)
    setIsDialogOpen(true)
  }

  const handleDeleteSchedule = (scheduleId: number) => {
    setSchedules(schedules.filter((s) => s.id !== scheduleId))
    success("일정이 삭제되었습니다.")
  }

  const handleSaveSchedule = (scheduleData: Partial<Game>) => {
    if (selectedSchedule) {
      // 수정
      setSchedules(schedules.map((s) => (s.id === selectedSchedule.id ? { ...s, ...scheduleData } : s)))
      success("일정이 수정되었습니다.")
    } else {
      // 추가
      const newSchedule: Game = {
        id: Math.max(...schedules.map((s) => s.id)) + 1,
        sport: "축구",
        team1: "공과대학",
        team2: "간호대학",
        date: new Date().toISOString().split("T")[0],
        status: "예정",
        ...scheduleData,
      }
      setSchedules([...schedules, newSchedule])
      success("새 일정이 등록되었습니다.")
    }
    setIsDialogOpen(false)
  }

  // 달력 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const renderCalendar = () => {
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // 빈 셀들 추가
  for (let i = 0; i < firstDay; i++) {
    days.push(
      <div
        key={`empty-${i}`}
        className="h-24 border border-gray-200 bg-gray-50"
      ></div>
    )
  }

  // 날짜 셀들 추가
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const daySchedules = schedules.filter((schedule) => schedule.date === dateStr)

    days.push(
      <div
        key={day}
        className="h-24 border border-gray-200 p-1 hover:bg-gray-50 transition-colors flex flex-col justify-between"
        onClick={() => {
          if (daySchedules.length > 0) {
            handleEditSchedule(daySchedules[0]) // 선택 시 첫 일정 수정으로 연결
          }
        }}
      >
        {/* 날짜 숫자 */}
        <div className="font-medium text-sm">{day}</div>

        {/* 경기 있음 표시 */}
        {daySchedules.length > 0 && (
          <div className="text-xs text-right text-blue-600 pr-1 pb-1">
            경기 있음 (+{daySchedules.length})
          </div>
        )}
      </div>
    )
  }

  return days
}

  const thisWeekSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date)
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    return scheduleDate >= weekStart && scheduleDate <= weekEnd
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
            <p className="text-gray-600 mt-2">경기 일정을 관리하고 달력으로 확인합니다</p>
          </div>
          <Button onClick={handleAddSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            일정 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 일정</p>
                  <p className="text-2xl font-bold">{schedules.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 주</p>
                  <p className="text-2xl font-bold">{thisWeekSchedules.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘</p>
                  <p className="text-2xl font-bold">
                    {schedules.filter((s) => s.date === new Date().toISOString().split("T")[0]).length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 달</p>
                  <p className="text-2xl font-bold">
                    {
                      schedules.filter((s) => {
                        const scheduleDate = new Date(s.date)
                        return (
                          scheduleDate.getMonth() === currentDate.getMonth() &&
                          scheduleDate.getFullYear() === currentDate.getFullYear()
                        )
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <CardDescription>일정을 클릭하여 수정할 수 있습니다</CardDescription>
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

          {/* 일정 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 달 일정</CardTitle>
              <CardDescription>{currentDate.getMonth() + 1}월 예정된 경기 일정</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto space-y-3">
                {schedules
                  .filter((schedule) => {
                    const scheduleDate = new Date(schedule.date)
                    return (
                      scheduleDate.getMonth() === currentDate.getMonth() &&
                      scheduleDate.getFullYear() === currentDate.getFullYear()
                    )
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{SPORTS_CONFIG[schedule.sport].icon}</span>
                            <Badge variant="outline" className="text-xs">
                              {schedule.sport}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">
                            {schedule.team1} vs {schedule.team2}
                          </h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(schedule.date).toLocaleDateString()} {schedule.time}
                            </div>
                            {schedule.location && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {schedule.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Badge variant="secondary" className="text-xs">
                            {schedule.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSchedule(schedule.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {schedules.filter((schedule) => {
                  const scheduleDate = new Date(schedule.date)
                  return (
                    scheduleDate.getMonth() === currentDate.getMonth() &&
                    scheduleDate.getFullYear() === currentDate.getFullYear()
                  )
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">이번 달 일정이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 일정 추가/수정 다이얼로그 */}
        <ScheduleDialog
          schedule={selectedSchedule}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveSchedule}
        />
      </div>
    </AdminLayout>
  )
}

// 일정 추가/수정 다이얼로그
function ScheduleDialog({
  schedule,
  open,
  onOpenChange,
  onSave,
}: {
  schedule: Game | null
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
      if (schedule) {
        setFormData(schedule)
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
          <DialogTitle>{schedule ? "일정 수정" : "일정 추가"}</DialogTitle>
          <DialogDescription>경기 일정 정보를 입력하세요</DialogDescription>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>{schedule ? "수정" : "추가"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
