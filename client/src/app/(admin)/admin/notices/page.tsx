"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Edit, Trash2, Bell, Eye, Calendar, User } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import type { Notice } from "@/lib/types"

// Update mock notices data with different years
const mockNotices: Notice[] = [
  {
    id: 1,
    title: "🏆 2024년 단과대학 스포츠 리그 개막식 안내",
    content:
      "2024년 단과대학 스포츠 리그 개막식이 1월 25일(목) 오후 2시에 대강당에서 열립니다. 모든 학생들의 많은 참여 바랍니다. 개막식에서는 각 단과대학 대표팀 소개, 시즌 일정 발표, 그리고 특별 공연이 준비되어 있습니다.",
    date: "2024-01-18",
    category: "행사",
    important: true,
    author: "스포츠센터",
    views: 1247,
  },
  {
    id: 2,
    title: "⚽ 축구 경기장 보수공사로 인한 일정 변경",
    content:
      "축구 경기장 잔디 보수공사로 인해 1월 22일~24일 축구 경기가 연기됩니다. 자세한 일정은 추후 공지하겠습니다. 해당 기간 동안 예정된 경기는 모두 다음 주로 연기되며, 변경된 일정은 개별 통지해드리겠습니다.",
    date: "2024-01-17",
    category: "일정변경",
    important: false,
    author: "경기운영팀",
    views: 892,
  },
  {
    id: 3,
    title: "🏀 농구 경기 관람 시 주의사항",
    content:
      "농구 경기 관람 시 응원 도구 반입 제한 및 안전 수칙을 준수해주시기 바랍니다. 큰 소음을 발생시키는 응원 도구는 제한되며, 경기 중 코트 진입은 절대 금지입니다.",
    date: "2024-01-16",
    category: "안내",
    important: false,
    author: "안전관리팀",
    views: 634,
  },
  {
    id: 4,
    title: "🎉 2023년 시즌 시상식 개최 안내",
    content:
      "2023년 단과대학 스포츠 리그 시상식이 12월 20일(수) 오후 6시에 대강당에서 개최됩니다. 우수 선수 및 팀에 대한 시상이 있을 예정이니 많은 참석 바랍니다.",
    date: "2023-12-15",
    category: "행사",
    important: true,
    author: "스포츠센터",
    views: 2156,
  },
  {
    id: 5,
    title: "🏐 배구 경기 규칙 변경 안내",
    content: "2023년 하반기부터 배구 경기 규칙이 일부 변경됩니다. 자세한 내용은 첨부된 규정집을 참고해주시기 바랍니다.",
    date: "2023-08-10",
    category: "안내",
    important: false,
    author: "경기운영팀",
    views: 1543,
  },
  {
    id: 6,
    title: "🏆 2023년 춘계 리그 우승팀 발표",
    content:
      "2023년 춘계 리그가 성공적으로 마무리되었습니다. 각 종목별 우승팀을 발표합니다. 축구: 공과대학, 농구: 자연과학대학, 배구: 간호대학",
    date: "2023-06-30",
    category: "업데이트",
    important: true,
    author: "스포츠센터",
    views: 3421,
  },
]

const categories = ["행사", "일정변경", "안내", "업데이트", "모집", "기타"]

export default function AdminNoticesPage() {
  const { checkPermission } = useAdminAuth()
  const { success } = useToastContext()
  const [notices, setNotices] = useState<Notice[]>(mockNotices)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // Add selectedYear state after other states
  const [selectedYear, setSelectedYear] = useState<string>("전체")

  // Get available years from notices data
  const availableYears = [...new Set(notices.map((notice) => new Date(notice.date).getFullYear()))].sort(
    (a, b) => b - a,
  )

  // 권한 확인
  if (!checkPermission(ADMIN_PERMISSIONS.MANAGE_NOTICES)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">공지사항 관리 권한이 필요합니다.</p>
        </div>
      </AdminLayout>
    )
  }

  const handleAddNotice = () => {
    setSelectedNotice(null)
    setIsDialogOpen(true)
  }

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    setIsDialogOpen(true)
  }

  const handleDeleteNotice = (noticeId: number) => {
    setNotices(notices.filter((n) => n.id !== noticeId))
    success("공지사항이 삭제되었습니다.")
  }

  const handleSaveNotice = (noticeData: Partial<Notice>) => {
    if (selectedNotice) {
      // 수정
      setNotices(notices.map((n) => (n.id === selectedNotice.id ? { ...n, ...noticeData } : n)))
      success("공지사항이 수정되었습니다.")
    } else {
      // 추가
      const newNotice: Notice = {
        id: Math.max(...notices.map((n) => n.id)) + 1,
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        category: "안내",
        important: false,
        author: "관리자",
        views: 0,
        ...noticeData,
      }
      setNotices([newNotice, ...notices])
      success("새 공지사항이 등록되었습니다.")
    }
    setIsDialogOpen(false)
  }

  // Update filtering logic to include year
  const filteredNotices = notices.filter((notice) => {
    const noticeYear = new Date(notice.date).getFullYear().toString()
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "전체" || notice.category === selectedCategory
    const matchesYear = selectedYear === "전체" || noticeYear === selectedYear
    return matchesSearch && matchesCategory && matchesYear
  })

  // Update statistics to use filtered data
  const filteredImportantNotices = filteredNotices.filter((n) => n.important)
  const filteredThisWeekNotices = filteredNotices.filter((n) => {
    const noticeDate = new Date(n.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return noticeDate >= weekAgo
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
            <p className="text-gray-600 mt-2">공지사항을 작성하고 관리합니다</p>
          </div>
          <Button onClick={handleAddNotice}>
            <Plus className="h-4 w-4 mr-2" />
            공지사항 작성
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 공지사항</p>
                  <p className="text-2xl font-bold">{filteredNotices.length}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">중요 공지</p>
                  <p className="text-2xl font-bold">{filteredImportantNotices.length}</p>
                </div>
                <Badge className="bg-red-500">{filteredImportantNotices.length}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 주 작성</p>
                  <p className="text-2xl font-bold">{filteredThisWeekNotices.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 조회수</p>
                  <p className="text-2xl font-bold">
                    {filteredNotices.reduce((sum, n) => sum + (n.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="공지사항 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 년도</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 공지사항 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>공지사항 목록</CardTitle>
            <CardDescription>
              {selectedCategory === "전체" ? "전체" : selectedCategory} 공지사항 {filteredNotices.length}개
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredNotices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((notice) => (
                  <div key={notice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {notice.important && (
                            <Badge variant="destructive" className="text-xs">
                              중요
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {notice.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{notice.title}</h3>
                        <p className="text-gray-700 mb-3 line-clamp-2">{notice.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {notice.author}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {notice.date}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {notice.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEditNotice(notice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNotice(notice.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 공지사항 추가/수정 다이얼로그 */}
        <NoticeDialog
          notice={selectedNotice}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveNotice}
        />
      </div>
    </AdminLayout>
  )
}

// 공지사항 추가/수정 다이얼로그
function NoticeDialog({
  notice,
  open,
  onOpenChange,
  onSave,
}: {
  notice: Notice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Notice>) => void
}) {
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: "",
    content: "",
    category: "안내",
    important: false,
    author: "관리자",
  })

  // 다이얼로그가 열릴 때 폼 데이터 초기화
  useState(() => {
    if (open) {
      if (notice) {
        setFormData(notice)
      } else {
        setFormData({
          title: "",
          content: "",
          category: "안내",
          important: false,
          author: "관리자",
        })
      }
    }
  })

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{notice ? "공지사항 수정" : "공지사항 작성"}</DialogTitle>
          <DialogDescription>공지사항 정보를 입력하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>제목</Label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>작성자</Label>
              <Input
                value={formData.author || ""}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="작성자"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="important"
              checked={formData.important}
              onCheckedChange={(checked) => setFormData({ ...formData, important: !!checked })}
            />
            <Label htmlFor="important" className="text-sm font-medium cursor-pointer">
              중요 공지사항으로 설정
            </Label>
          </div>

          <div>
            <Label>내용</Label>
            <Textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요"
              rows={10}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!formData.title?.trim() || !formData.content?.trim()}>
            {notice ? "수정" : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
