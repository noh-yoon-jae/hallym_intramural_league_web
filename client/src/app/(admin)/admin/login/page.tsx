"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, User, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { authenticateAdmin, DEMO_ADMIN_ACCOUNTS } from "@/lib/admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, admin } = useAdminAuth()
  const { success, error: showError } = useToastContext()
  const router = useRouter()

  // 이미 로그인된 관리자가 있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (admin) {
      router.push("/admin")
    }
  }, [admin, router])

  // 이미 로그인된 상태라면 로딩 표시
  if (admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.")
      setIsLoading(false)
      return
    }

    // 관리자 인증
    setTimeout(() => {
      const adminUser = authenticateAdmin(username, password)

      if (adminUser) {
        login(adminUser)
        success(`${adminUser.displayName}로 로그인되었습니다.`, {
          title: "관리자 로그인 성공",
          duration: 3000,
        })
        router.push("/admin")
      } else {
        setError("관리자 계정 정보가 올바르지 않습니다.")
        showError("로그인에 실패했습니다.", {
          title: "인증 실패",
          duration: 4000,
        })
      }

      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 로그인</h1>
          <p className="text-gray-600">관리자 계정으로 로그인하세요</p>
        </div>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">관리자 인증</CardTitle>
            <CardDescription>관리자 권한이 필요한 영역입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <Label htmlFor="username">관리자 아이디</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="관리자 아이디를 입력하세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? "인증 중..." : "관리자 로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 데모 계정 안내 */}
        <Card className="mt-4 border-orange-200">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3 text-orange-800 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              데모 관리자 계정
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              {Object.entries(DEMO_ADMIN_ACCOUNTS).map(([username, admin]) => (
                <div key={username} className="p-2 bg-gray-50 rounded border">
                  <div className="font-medium">{admin.displayName}</div>
                  <div className="text-xs text-gray-500">아이디: {username} / 비밀번호: admin</div>
                  <div className="text-xs text-blue-600">
                    {admin.role === "team" && admin.college ? `${admin.college} 전용` : "전체 권한"}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-3">* 각 계정마다 다른 권한을 가지고 있습니다</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
