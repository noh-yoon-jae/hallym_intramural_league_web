"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Mail, ArrowLeft, Check, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  const handleResendVerification = async (e: React.FormEvent) => {
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

    // 인증메일 재전송 시뮬레이션
    setTimeout(() => {
      setIsEmailSent(true)
      setIsLoading(false)

      // 60초 카운트다운 시작
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
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
              <CardTitle>인증메일이 재전송되었습니다</CardTitle>
              <CardDescription>이메일을 확인하여 계정을 인증해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>{email}</strong>로 인증메일을 다시 보냈습니다.
                </p>
                <p className="text-sm text-gray-600">이메일을 받지 못하셨다면 스팸 폴더를 확인해주세요.</p>
              </div>

              {countdown > 0 && (
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{countdown}초 후 재전송 가능</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                    setCountdown(0)
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={countdown > 0}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {countdown > 0 ? `${countdown}초 후 재전송` : "다른 이메일로 재전송"}
                </Button>
                <Button asChild className="w-full">
                  <Link href="/login">로그인 페이지로 이동</Link>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  인증링크는 24시간 동안 유효합니다.
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
          <p className="text-gray-600">인증메일을 다시 받아보세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>인증메일 재전송</CardTitle>
            <CardDescription>회원가입 시 사용한 이메일 주소를 입력하시면 인증메일을 다시 보내드립니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResendVerification} className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="가입 시 사용한 이메일을 입력하세요"
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

              {/* 안내 메시지 */}
              <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-medium mb-1">📧 인증메일 재전송 안내</p>
                <ul className="text-xs space-y-1">
                  <li>• 회원가입 시 사용한 이메일 주소를 정확히 입력해주세요</li>
                  <li>• 인증메일은 즉시 발송되며, 24시간 동안 유효합니다</li>
                  <li>• 스팸 폴더도 함께 확인해주세요</li>
                </ul>
              </div>

              {/* 재전송 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    인증메일 전송 중...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    인증메일 재전송
                  </>
                )}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
