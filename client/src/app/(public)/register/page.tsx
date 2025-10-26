"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  // 비밀번호 강도 검사
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)

  // 실시간 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!username) {
      newErrors.username = "아이디를 입력해주세요."
    } else if (username.length < 4) {
      newErrors.username = "아이디는 4자리 이상이어야 합니다."
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "아이디는 영문, 숫자, 언더스코어만 사용 가능합니다."
    }

    if (!email) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다."
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 8자리 이상이어야 합니다."
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    // 회원가입 시뮬레이션 (실제로는 서버 API 호출)
    setTimeout(() => {
      // 성공적으로 회원가입 완료
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.")
      setIsLoading(false)
      router.push("/login")
    }, 2000)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "약함"
    if (passwordStrength <= 3) return "보통"
    return "강함"
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
          <p className="text-gray-600">새 계정을 만들어 응원에 참여하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>계정 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                    required
                  />
                  {username && !errors.username && <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                  {errors.username && <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
                </div>
                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
              </div>

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
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    required
                  />
                  {email && !errors.email && <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                  {errors.email && <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
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
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
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
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

                {/* 비밀번호 강도 표시 */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getPasswordStrengthColor().replace("bg-", "text-")}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="flex items-center space-x-1">
                        {password.length >= 8 ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>8자리 이상</span>
                      </p>
                      <p className="flex items-center space-x-1">
                        {/[A-Z]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>대문자 포함</span>
                      </p>
                      <p className="flex items-center space-x-1">
                        {/[0-9]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>숫자 포함</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 입력 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    비밀번호가 일치합니다
                  </p>
                )}
              </div>

              {/* 회원가입 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "계정 생성 중..." : "회원가입"}
              </Button>
            </form>

            {/* 추가 링크 */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/resend-verification" className="text-sm text-blue-600 hover:underline">
                  인증메일을 못받으셨나요?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">또는</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    로그인
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  <Link href="/" className="text-blue-600 hover:underline">
                    홈페이지로 돌아가기
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
