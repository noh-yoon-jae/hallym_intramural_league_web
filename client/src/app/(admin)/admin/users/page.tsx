"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Users, UserCheck, UserX, Shield, Search, MoreVertical, Ban, CheckCircle } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { COLLEGES } from "@/lib/data"
import type { UserInfo } from "@/lib/types"

// 확장된 사용자 정보 타입
interface ExtendedUser extends UserInfo {
  id: number
  status: "active" | "suspended" | "banned"
  joinDate: string
  lastLogin: string
  messageCount: number
  reportCount: number
  role: "user" | "moderator"
}

// 모의 사용자 데이터
const mockUsers: ExtendedUser[] = [
  {
    id: 1,
    username: "demo1",
    nickname: "축구왕김철수",
    college: "공과대학",
    team: "슈팅스타즈",
    email: "demo1@university.ac.kr",
    loginTime: "2024-01-19T10:30:00Z",
    status: "active",
    joinDate: "2023-03-15",
    lastLogin: "2024-01-19T10:30:00Z",
    messageCount: 156,
    reportCount: 0,
    role: "user",
  },
  {
    id: 2,
    username: "demo2",
    nickname: "농구매니아",
    college: "자연과학대학",
    team: "퀀텀점프",
    email: "demo2@university.ac.kr",
    loginTime: "2024-01-19T09:15:00Z",
    status: "active",
    joinDate: "2023-05-20",
    lastLogin: "2024-01-19T09:15:00Z",
    messageCount: 89,
    reportCount: 0,
    role: "user",
  },
  {
    id: 3,
    username: "troubleuser",
    nickname: "문제사용자",
    college: "경영대학",
    email: "trouble@university.ac.kr",
    loginTime: "2024-01-18T14:20:00Z",
    status: "suspended",
    joinDate: "2023-08-10",
    lastLogin: "2024-01-18T14:20:00Z",
    messageCount: 45,
    reportCount: 3,
    role: "user",
  },
  {
    id: 4,
    username: "moderator1",
    nickname: "응원톡관리자",
    college: "간호대학",
    email: "mod1@university.ac.kr",
    loginTime: "2024-01-19T08:00:00Z",
    status: "active",
    joinDate: "2023-01-01",
    lastLogin: "2024-01-19T08:00:00Z",
    messageCount: 234,
    reportCount: 0,
    role: "moderator",
  },
  {
    id: 5,
    username: "banneduser",
    nickname: "차단된사용자",
    college: "인문대학",
    email: "banned@university.ac.kr",
    loginTime: "2024-01-15T16:45:00Z",
    status: "banned",
    joinDate: "2023-11-05",
    lastLogin: "2024-01-15T16:45:00Z",
    messageCount: 12,
    reportCount: 5,
    role: "user",
  },
]

export default function AdminUsersPage() {
  const { checkPermission } = useAdminAuth()
  const { success, warning } = useToastContext()
  const [users, setUsers] = useState<ExtendedUser[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("전체")
  const [selectedCollege, setSelectedCollege] = useState<string>("전체")

  // 권한 확인
  if (!checkPermission(ADMIN_PERMISSIONS.MANAGE_USERS)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">사용자 관리 권한이 필요합니다.</p>
        </div>
      </AdminLayout>
    )
  }

  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const handleSuspendUser = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)))
    warning("사용자가 정지되었습니다.")
  }

  const handleBanUser = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "banned" } : u)))
    warning("사용자가 차단되었습니다.")
  }

  const handleActivateUser = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "active" } : u)))
    success("사용자가 활성화되었습니다.")
  }

  const handlePromoteToModerator = (userId: number) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: "moderator" } : u)))
    success("사용자가 모더레이터로 승격되었습니다.")
  }

  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "전체" || user.status === selectedStatus
    const matchesCollege = selectedCollege === "전체" || user.college === selectedCollege
    return matchesSearch && matchesStatus && matchesCollege
  })

  const activeUsers = users.filter((u) => u.status === "active")
  const suspendedUsers = users.filter((u) => u.status === "suspended")
  const bannedUsers = users.filter((u) => u.status === "banned")
  const moderators = users.filter((u) => u.role === "moderator")

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-2">등록된 사용자를 관리하고 모니터링합니다</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">정지/차단</p>
                  <p className="text-2xl font-bold text-red-600">{suspendedUsers.length + bannedUsers.length}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">모더레이터</p>
                  <p className="text-2xl font-bold text-purple-600">{moderators.length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="사용자명, 닉네임, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="전체">전체 상태</option>
                <option value="active">활성</option>
                <option value="suspended">정지</option>
                <option value="banned">차단</option>
              </select>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="전체">전체 단과대학</option>
                {Object.entries(COLLEGES).map(([key, college]) => (
                  <option key={key} value={key}>
                    {college.logo} {college.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">전체 사용자 ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="active">활성 ({activeUsers.length})</TabsTrigger>
            <TabsTrigger value="suspended">정지 ({suspendedUsers.length})</TabsTrigger>
            <TabsTrigger value="banned">차단 ({bannedUsers.length})</TabsTrigger>
            <TabsTrigger value="moderators">모더레이터 ({moderators.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <UserList users={filteredUsers} onView={handleViewUser} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <UserList
              users={activeUsers.filter((u) => selectedCollege === "전체" || u.college === selectedCollege)}
              onView={handleViewUser}
            />
          </TabsContent>

          <TabsContent value="suspended" className="mt-6">
            <UserList
              users={suspendedUsers.filter((u) => selectedCollege === "전체" || u.college === selectedCollege)}
              onView={handleViewUser}
            />
          </TabsContent>

          <TabsContent value="banned" className="mt-6">
            <UserList
              users={bannedUsers.filter((u) => selectedCollege === "전체" || u.college === selectedCollege)}
              onView={handleViewUser}
            />
          </TabsContent>

          <TabsContent value="moderators" className="mt-6">
            <UserList
              users={moderators.filter((u) => selectedCollege === "전체" || u.college === selectedCollege)}
              onView={handleViewUser}
            />
          </TabsContent>
        </Tabs>

        {/* 사용자 상세 다이얼로그 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>사용자 상세 정보</DialogTitle>
              <DialogDescription>사용자의 자세한 정보를 확인할 수 있습니다</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">사용자명</Label>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">닉네임</Label>
                    <p className="font-medium">{selectedUser.nickname || "없음"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">이메일</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">상태</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedUser.status === "active"
                            ? "default"
                            : selectedUser.status === "suspended"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {selectedUser.status === "active"
                          ? "활성"
                          : selectedUser.status === "suspended"
                            ? "정지"
                            : "차단"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">소속</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedUser.college && (
                        <Badge className={COLLEGES[selectedUser.college].color}>
                          {COLLEGES[selectedUser.college].logo} {COLLEGES[selectedUser.college].name}
                        </Badge>
                      )}
                      {selectedUser.team && <Badge variant="outline">{selectedUser.team}</Badge>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">역할</Label>
                    <div className="mt-1">
                      <Badge variant={selectedUser.role === "moderator" ? "default" : "secondary"}>
                        {selectedUser.role === "moderator" ? "모더레이터" : "일반 사용자"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">가입일</Label>
                    <p className="text-sm">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">마지막 로그인</Label>
                    <p className="text-sm">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">작성 메시지</Label>
                    <p className="text-sm font-medium">{selectedUser.messageCount}개</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">신고 받은 횟수</Label>
                    <p className={`text-sm font-medium ${selectedUser.reportCount > 0 ? "text-red-600" : ""}`}>
                      {selectedUser.reportCount}회
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  {selectedUser.status === "active" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(selectedUser.id)}
                        className="bg-transparent"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        정지
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleBanUser(selectedUser.id)}>
                        <UserX className="h-4 w-4 mr-1" />
                        차단
                      </Button>
                      {selectedUser.role === "user" && (
                        <Button variant="default" size="sm" onClick={() => handlePromoteToModerator(selectedUser.id)}>
                          <Shield className="h-4 w-4 mr-1" />
                          모더레이터 승격
                        </Button>
                      )}
                    </>
                  )}
                  {(selectedUser.status === "suspended" || selectedUser.status === "banned") && (
                    <Button variant="default" size="sm" onClick={() => handleActivateUser(selectedUser.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      활성화
                    </Button>
                  )}
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

// 사용자 목록 컴포넌트
function UserList({ users, onView }: { users: ExtendedUser[]; onView: (user: ExtendedUser) => void }) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>해당하는 사용자가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">사용자</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">소속</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">상태</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">역할</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">메시지</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">신고</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">마지막 로그인</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{user.nickname || user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {user.college && (
                        <Badge className={COLLEGES[user.college].color} variant="outline">
                          {COLLEGES[user.college].logo} {COLLEGES[user.college].name}
                        </Badge>
                      )}
                      {user.team && (
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {user.team}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <Badge
                      variant={
                        user.status === "active" ? "default" : user.status === "suspended" ? "secondary" : "destructive"
                      }
                    >
                      {user.status === "active" ? "활성" : user.status === "suspended" ? "정지" : "차단"}
                    </Badge>
                  </td>
                  <td className="text-center py-4 px-4">
                    <Badge variant={user.role === "moderator" ? "default" : "outline"}>
                      {user.role === "moderator" ? "모더레이터" : "사용자"}
                    </Badge>
                  </td>
                  <td className="text-center py-4 px-4 font-medium">{user.messageCount}</td>
                  <td className="text-center py-4 px-4">
                    <span className={user.reportCount > 0 ? "text-red-600 font-medium" : ""}>{user.reportCount}</span>
                  </td>
                  <td className="text-center py-4 px-4 text-sm text-gray-600">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="text-center py-4 px-4">
                    <Button variant="ghost" size="sm" onClick={() => onView(user)}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
