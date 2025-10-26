"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Users, Calendar, Trophy, MessageCircle, Bell, TrendingUp, Activity } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"

// 모의 통계 데이터
const stats = {
  totalUsers: 1247,
  activeUsers: 89,
  totalGames: 127,
  upcomingGames: 8,
  totalNotices: 23,
  unreadReports: 5,
  cheerMessages: 3456,
  todayMessages: 234,
}

const recentActivities = [
  {
    id: 1,
    type: "game",
    title: "공과대학 vs 간호대학 축구 경기 결과 등록",
    time: "10분 전",
    user: "경기 관리자",
  },
  {
    id: 2,
    type: "notice",
    title: "2024년 스포츠 리그 개막식 공지사항 발행",
    time: "1시간 전",
    user: "콘텐츠 관리자",
  },
  {
    id: 3,
    type: "report",
    title: "부적절한 응원 메시지 신고 처리",
    time: "2시간 전",
    user: "콘텐츠 관리자",
  },
  {
    id: 4,
    type: "team",
    title: "자연과학대학 팀 정보 업데이트",
    time: "3시간 전",
    user: "팀 관리자",
  },
]

export default function AdminDashboard() {
  const { admin, checkPermission } = useAdminAuth()

  if (!admin) return null

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">안녕하세요, {admin.displayName}님! 시스템 현황을 확인하세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {checkPermission(ADMIN_PERMISSIONS.MANAGE_USERS) && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> 지난 달 대비
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">현재 온라인</p>
                </CardContent>
              </Card>
            </>
          )}

          {checkPermission(ADMIN_PERMISSIONS.MANAGE_GAMES) && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 경기</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGames}</div>
                  <p className="text-xs text-muted-foreground">이번 시즌</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">예정 경기</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingGames}</div>
                  <p className="text-xs text-muted-foreground">이번 주</p>
                </CardContent>
              </Card>
            </>
          )}

          {checkPermission(ADMIN_PERMISSIONS.MANAGE_NOTICES) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">공지사항</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNotices}</div>
                <p className="text-xs text-muted-foreground">총 게시물</p>
              </CardContent>
            </Card>
          )}

          {checkPermission(ADMIN_PERMISSIONS.MODERATE_CHEER) && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">응원 메시지</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cheerMessages.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">총 메시지</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">신고 대기</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.unreadReports}</div>
                  <p className="text-xs text-muted-foreground">처리 필요</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>시스템에서 발생한 최근 활동들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.user}
                        </Badge>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 권한 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>내 권한</CardTitle>
              <CardDescription>현재 계정의 권한 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">계정 정보</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>이름: {admin.displayName}</div>
                    <div>이메일: {admin.email}</div>
                    <div>
                      역할:{" "}
                      {admin.role === "system"
                        ? "시스템 관리자"
                        : admin.role === "game"
                          ? "경기 관리자"
                          : admin.role === "content"
                            ? "콘텐츠 관리자"
                            : "팀 관리자"}
                    </div>
                    {admin.college && <div>담당: {admin.college}</div>}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">보유 권한</div>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.slice(0, 6).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.replace(/_/g, " ")}
                      </Badge>
                    ))}
                    {admin.permissions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{admin.permissions.length - 6}개 더
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 작업 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 관리 기능들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {checkPermission(ADMIN_PERMISSIONS.MANAGE_GAMES) && (
                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Trophy className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="font-medium text-sm">경기 결과 등록</div>
                  <div className="text-xs text-gray-500">새 경기 결과 추가</div>
                </button>
              )}

              {checkPermission(ADMIN_PERMISSIONS.MANAGE_NOTICES) && (
                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Bell className="h-6 w-6 text-green-600 mb-2" />
                  <div className="font-medium text-sm">공지사항 작성</div>
                  <div className="text-xs text-gray-500">새 공지사항 발행</div>
                </button>
              )}

              {checkPermission(ADMIN_PERMISSIONS.MODERATE_CHEER) && (
                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <MessageCircle className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="font-medium text-sm">신고 처리</div>
                  <div className="text-xs text-gray-500">응원톡 신고 확인</div>
                </button>
              )}

              {checkPermission(ADMIN_PERMISSIONS.MANAGE_TEAMS) && (
                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Users className="h-6 w-6 text-orange-600 mb-2" />
                  <div className="font-medium text-sm">팀 정보 수정</div>
                  <div className="text-xs text-gray-500">팀 프로필 업데이트</div>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
