"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { AdminLayout } from "@/components/admin/admin-layout"
import { MessageCircle, Flag, Trash2, Eye, EyeOff, Clock } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { SPORTS_CONFIG, COLLEGES } from "@/lib/data"
import type { ChatMessage } from "@/lib/types"

// 모의 응원톡 데이터
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sport: "축구",
    user: "축구왕김철수",
    roomId: 1,
    team: "슈팅스타즈",
    message: "슈팅스타즈 화이팅! 오늘 경기 꼭 이기자! ⭐⚽🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 12,
    isLiked: false,
    likedBy: [] as number[],
    isReported: false,
  },
  {
    id: "2",
    sport: "축구",
    user: "간호대응원단",
    roomId: 1,
    team: "화이트엔젤스",
    message: "화이트엔젤스도 화이팅!! 좋은 경기 만들어요~ 👼💪",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    likes: 8,
    isLiked: false,
    likedBy: [],
    isReported: false,
  },
  {
    id: "3",
    sport: "농구",
    user: "농구매니아",
    team: "퀀텀점프",
    roomId: 2,
    message: "퀀텀점프 3점슛 연습 많이 했다던데 기대된다! 🌌🏀",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    likes: 15,
    isLiked: false,
    likedBy: [] as number[],
    isReported: false,
  },
  {
    id: "4",
    sport: "축구",
    user: "문제사용자",
    roomId: 1,
    message: "상대팀 진짜 못한다 ㅋㅋㅋ 이길 수 있을까?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    likes: 2,
    isLiked: false,
    likedBy: [] as number[],
    isReported: true,
  },
]

// 모의 신고 데이터
const mockReports = [
  {
    id: "1",
    messageId: "4",
    reportedBy: "정의로운사용자",
    reason: "상대팀을 비하하는 발언",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: "대기중",
  },
  {
    id: "2",
    messageId: "5",
    reportedBy: "깨끗한응원",
    reason: "욕설 사용",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: "대기중",
  },
]

export default function AdminCheerPage() {
  const { checkPermission } = useAdminAuth()
  const { success, warning } = useToastContext()
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [reports, setReports] = useState(mockReports)
  const [selectedSport, setSelectedSport] = useState("전체")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 권한 확인
  if (!checkPermission(ADMIN_PERMISSIONS.MODERATE_CHEER)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">응원톡 관리 권한이 필요합니다.</p>
        </div>
      </AdminLayout>
    )
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId))
    success("메시지가 삭제되었습니다.")
  }

  const handleHideMessage = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, isReported: true } : m)))
    warning("메시지가 숨김 처리되었습니다.")
  }

  const handleProcessReport = (reportId: string, action: "approve" | "reject") => {
    setReports(reports.filter((r) => r.id !== reportId))
    if (action === "approve") {
      success("신고가 승인되어 메시지가 삭제되었습니다.")
    } else {
      success("신고가 반려되었습니다.")
    }
  }

  const handleViewMessage = (message: ChatMessage) => {
    setSelectedMessage(message)
    setIsDetailOpen(true)
  }

  // 필터링된 메시지
  const filteredMessages = messages.filter((message) => {
    const matchesSport = selectedSport === "전체" || message.sport === selectedSport
    const matchesSearch =
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.user.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSport && matchesSearch
  })

  const reportedMessages = messages.filter((m) => m.isReported)
  const totalMessages = messages.length
  const todayMessages = messages.filter((m) => {
    const today = new Date().toDateString()
    return m.timestamp.toDateString() === today
  }).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">응원톡 관리</h1>
          <p className="text-gray-600 mt-2">응원 메시지와 신고를 관리합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 메시지</p>
                  <p className="text-2xl font-bold">{totalMessages}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 메시지</p>
                  <p className="text-2xl font-bold">{todayMessages}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">신고 대기</p>
                  <p className="text-2xl font-bold text-red-600">{reports.length}</p>
                </div>
                <Flag className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">숨김 처리</p>
                  <p className="text-2xl font-bold">{reportedMessages.length}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="messages" className="w-full">
          <TabsList>
            <TabsTrigger value="messages">전체 메시지 ({filteredMessages.length})</TabsTrigger>
            <TabsTrigger value="reports">신고 대기 ({reports.length})</TabsTrigger>
            <TabsTrigger value="hidden">숨김 처리 ({reportedMessages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>응원 메시지 관리</CardTitle>
                <CardDescription>모든 응원 메시지를 확인하고 관리할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 검색 및 필터 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Input
                    placeholder="메시지 또는 사용자 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="전체">전체 종목</option>
                    {Object.entries(SPORTS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 메시지 목록 */}
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {message.team && (
                              <Badge variant="outline" className="text-xs">
                                {message.team}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {message.sport && SPORTS_CONFIG[message.sport] ? (
                                <>
                                  {SPORTS_CONFIG[message.sport].icon} {SPORTS_CONFIG[message.sport].name}
                                </>
                              ) : (
                                <span>종목 정보 없음</span>
                              )}
                            </Badge>
                            <span className="text-sm font-medium">{message.user}</span>
                          </div>
                          <p className="text-gray-800 mb-2">{message.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{message.timestamp.toLocaleString()}</span>
                            <span>좋아요 {message.likes}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewMessage(message)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleHideMessage(message.id)}>
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(message.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>신고 처리</CardTitle>
                <CardDescription>사용자가 신고한 메시지를 검토하고 처리합니다</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Flag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>처리할 신고가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const message = messages.find((m) => m.id === report.messageId)
                      return (
                        <div key={report.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="destructive">신고됨</Badge>
                                <span className="text-sm text-gray-600">신고자: {report.reportedBy}</span>
                                <span className="text-sm text-gray-600">{report.timestamp.toLocaleString()}</span>
                              </div>
                              <p className="font-medium text-red-800 mb-2">신고 사유: {report.reason}</p>
                              {message && (
                                <div className="bg-white p-3 rounded border">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium">{message.user}</span>
                                  </div>
                                  <p className="text-gray-800">{message.message}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleProcessReport(report.id, "approve")}
                              >
                                승인
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleProcessReport(report.id, "reject")}
                              >
                                반려
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hidden" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>숨김 처리된 메시지</CardTitle>
                <CardDescription>숨김 처리된 메시지들을 확인할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                {reportedMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>숨김 처리된 메시지가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportedMessages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4 bg-gray-50 opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary">숨김</Badge>
                              <span className="text-sm font-medium">{message.user}</span>
                            </div>
                            <p className="text-gray-600 mb-2">{message.message}</p>
                            <div className="text-sm text-gray-500">{message.timestamp.toLocaleString()}</div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(message.id)}>
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
          </TabsContent>
        </Tabs>

        {/* 메시지 상세 다이얼로그 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>메시지 상세 정보</DialogTitle>
              <DialogDescription>메시지의 자세한 정보를 확인할 수 있습니다</DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">작성자</Label>
                  <p className="font-medium">{selectedMessage.user}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">소속</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedMessage.team && <Badge variant="outline">{selectedMessage.team}</Badge>}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">종목</Label>
                  <Badge variant="outline" className="mt-1">
                    {selectedMessage.sport && SPORTS_CONFIG[selectedMessage.sport] ? (
                      <>
                        {SPORTS_CONFIG[selectedMessage.sport].icon} {SPORTS_CONFIG[selectedMessage.sport].name}
                      </>
                    ) : (
                      <span>종목 정보 없음</span>
                    )}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">메시지</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded border">{selectedMessage.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">작성 시간</Label>
                    <p className="text-sm">{selectedMessage.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">좋아요</Label>
                    <p className="text-sm">{selectedMessage.likes}개</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
