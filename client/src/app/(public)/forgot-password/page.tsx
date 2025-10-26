"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Mail, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 이메일 유효성 검사
    if (!email) {
      setError("이메일을 입력해주세요.")
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.")
      setIsLoading(false)
      return
    }

    // 비밀번호 재설정 이메일 전송 시뮬레이션
    setTimeout(() => {
      setIsEmailSent(true)
      setIsLoading(false)
    }, 2000)
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">우리학교 스포츠</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>이메일이 전송되었습니다</CardTitle>
              <CardDescription>비밀번호 재설정 링크를 확인해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
                </p>
                <p className="text-sm text-gray-600">이메일을 받지 못하셨다면 스팸 폴더를 확인해주세요.</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  다른 이메일로 재전송
                </Button>
                <Button asChild className="w-full">
                  <Link href="/login">로그인 페이지로 돌아가기</Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  링크는 24시간 동안 유효합니다.
                  <br />
                  문제가 지속되면 관리자에게 문의해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Trophy className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">우리학교 스포츠</h1>
          <p className="text-gray-600">비밀번호를 재설정하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>비밀번호 재설정</CardTitle>
            <CardDescription>가입 시 사용한 이메일 주소를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              {/* 재설정 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "이메일 전송 중..." : "비밀번호 재설정 링크 보내기"}
              </Button>
            </form>

            {/* 추가 링크 */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Button variant="ghost" asChild className="text-sm">
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    로그인으로 돌아가기
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    회원가입
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">도움이 필요하신가요?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 가입 시 사용한 이메일 주소를 정확히 입력해주세요</p>
              <p>• 이메일이 오지 않으면 스팸 폴더를 확인해주세요</p>
              <p>• 문제가 지속되면 관리자에게 문의해주세요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
