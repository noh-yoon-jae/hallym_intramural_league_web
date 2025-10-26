"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ErrorManager } from "@/components/ui/error-manager"
import { Trophy, User, Lock, Eye, EyeOff, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useErrorManager } from "@/hooks/use-error-manager"
import { useAuth } from "@/hooks/use-auth"
import { useToastContext } from "@/components/providers/toast-provider"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const { messages, addErrorMessage, removeError, clearAllErrors } = useErrorManager()
    const { login, rememberMe, setRememberMe, isLoggedIn } = useAuth()
    const { success, error } = useToastContext()

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/")
        }
    }, [isLoggedIn, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        clearAllErrors()

        // 간단한 유효성 검사
        if (!username || !password) {
            addErrorMessage("아이디와 비밀번호를 입력해주세요.")
            setIsLoading(false)
            return
        }

        if (password.length < 4) {
            addErrorMessage("비밀번호는 4자리 이상이어야 합니다.")
            setIsLoading(false)
            return
        }

        // 실제 API 서버 연동
        try {
            const res = await fetch("/api/user/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 쿠키 포함
                body: JSON.stringify({
                    id: username,
                    password,
                    remember: rememberMe,
                }),
            })
            const data = await res.json()
            if (data.status) {
                // 서버에서 내려준 사용자 정보 저장
                login(data.data, { rememberMe })
                const sessionDuration = rememberMe ? "30일" : "24시간"
                success(`로그인에 성공했습니다! (${sessionDuration} 동안 유지)`, {
                    title: "로그인 성공",
                    duration: 3000,
                })
                setTimeout(() => {
                    setIsLoading(false)
                    window.history.go();
                }, 1000)
            } else {
                addErrorMessage(data.reason || "로그인에 실패했습니다.", {
                    title: "로그인 실패",
                    duration: 0,
                })
                error("로그인에 실패했습니다.", {
                    title: "로그인 실패",
                    duration: 4000,
                })
                setIsLoading(false)
            }
        } catch {
            addErrorMessage("서버 오류가 발생했습니다.")
            setIsLoading(false)
        }
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
                    <p className="text-gray-600">로그인하여 응원에 참여하세요</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>로그인</CardTitle>
                        <CardDescription>아이디와 비밀번호를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* 에러 메시지 매니저 */}
                        <ErrorManager messages={messages} onDismiss={removeError} className="mb-4" />

                        <form onSubmit={handleLogin} className="space-y-4">
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

                            {/* 로그인 상태 유지 */}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked === true)} className="border-2" />
                                <Label
                                    htmlFor="rememberMe"
                                    className="text-sm font-medium cursor-pointer select-none flex items-center space-x-2"
                                >
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    <span>로그인 상태 유지</span>
                                </Label>
                            </div>

                            {/* 로그인 상태 유지 안내 */}
                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">세션 유지 기간</span>
                                </div>
                                <div className="ml-5 space-y-1">
                                    <div className={`${!rememberMe ? "text-blue-600 font-medium" : ""}`}>• 일반 로그인: 24시간</div>
                                    <div className={`${rememberMe ? "text-blue-600 font-medium" : ""}`}>• 로그인 상태 유지: 30일</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">* 공용 컴퓨터에서는 로그인 상태 유지를 사용하지 마세요</div>
                            </div>

                            {/* 로그인 버튼 */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "로그인 중..." : "로그인"}
                            </Button>
                        </form>

                        {/* 추가 링크 */}
                        <div className="mt-6 space-y-4">
                            <div className="text-center">
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    비밀번호를 잊으셨나요?
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
                                    계정이 없으신가요?{" "}
                                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                                        회원가입
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

                {/* 데모 계정 안내
                <Card className="mt-4">
                    <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">데모 계정</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>아이디: demo1 / 비밀번호: demo</p>
                            <p>아이디: demo2 / 비밀번호: demo</p>
                            <p className="text-xs text-gray-500 mt-2">* 데모용 계정으로 테스트해보세요</p>
                            <p className="text-xs text-gray-500">* 다른 계정으로 로그인하면 에러 메시지를 확인할 수 있습니다</p>
                            <p className="text-xs text-gray-500">* 로그인 상태 유지 기능도 테스트해보세요</p>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}
