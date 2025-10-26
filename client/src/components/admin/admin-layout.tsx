"use client"

import type React from "react"

import { Shield, Home, Calendar, Trophy, Users, MessageCircle, Bell, Settings, LogOut, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "대시보드",
    href: "/admin",
    icon: BarChart3,
    permission: null,
  },
  {
    name: "경기 관리",
    href: "/admin/games",
    icon: Trophy,
    permission: ADMIN_PERMISSIONS.MANAGE_GAMES,
  },
  {
    name: "일정 관리",
    href: "/admin/schedules",
    icon: Calendar,
    permission: ADMIN_PERMISSIONS.MANAGE_SCHEDULES,
  },
  {
    name: "공지사항",
    href: "/admin/notices",
    icon: Bell,
    permission: ADMIN_PERMISSIONS.MANAGE_NOTICES,
  },
  {
    name: "팀 관리",
    href: "/admin/teams",
    icon: Users,
    permission: ADMIN_PERMISSIONS.MANAGE_TEAMS,
  },
  {
    name: "응원톡 관리",
    href: "/admin/cheer",
    icon: MessageCircle,
    permission: ADMIN_PERMISSIONS.MODERATE_CHEER,
  },
  {
    name: "사용자 관리",
    href: "/admin/users",
    icon: Settings,
    permission: ADMIN_PERMISSIONS.MANAGE_USERS,
  },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, isLoading, logout, checkPermission } = useAdminAuth()
  const { success } = useToastContext()

  const handleLogout = () => {
    logout()
    success("관리자 로그아웃이 완료되었습니다.")
    router.push("/admin/login")
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!admin) {
    router.push("/admin/login")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  const availableNavigation = navigation.filter((item) => !item.permission || checkPermission(item.permission))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* 로고 */}
          <div className="flex h-16 items-center justify-center border-b bg-red-600">
            <Shield className="h-8 w-8 text-white mr-2" />
            <span className="text-xl font-bold text-white">관리자</span>
          </div>

          {/* 관리자 정보 */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{admin.displayName}</div>
                <div className="text-xs text-gray-500 truncate">{admin.email}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {admin.role === "system" && "시스템"}
                  {admin.role === "game" && "경기"}
                  {admin.role === "content" && "콘텐츠"}
                  {admin.role === "team" && "팀"}
                </Badge>
              </div>
            </div>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 space-y-1 p-4">
            {availableNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-red-100 text-red-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 하단 버튼들 */}
          <div className="p-4 border-t space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                사이트로 돌아가기
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
