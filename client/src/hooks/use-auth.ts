"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserSession, LoginOptions } from "@/lib/auth-storage"

// 쿠키 기반 인증: 토큰은 서버가 httpOnly 쿠키로 관리하므로 프론트는 사용자 정보만 관리
// fetch/axios 사용 시 credentials: 'include' 옵션 필수

export function useAuth() {
    const [user, setUser] = useState<UserSession | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [rememberMe, setRememberMe] = useState(false)

    // 앱 시작 시 로그인 상태 확인 (서버에서 유저 정보 요청)
    useEffect(() => {
        const fetchUserInfo = async () => {
            setIsLoading(true)
            try {
                const res = await fetch("/api/user/info", {
                    method: "POST",
                    credentials: "include",
                })
                const data = await res.json()
                if (data.status && data.data) {
                    setUser(data.data)
                } else {
                    setUser(null)
                }
            } catch {
                setUser(null)
            }
            setIsLoading(false)
        }
        fetchUserInfo()
    }, [])

    // 로그인: 서버에서 받은 사용자 정보만 상태로 저장
    const login = useCallback(
        (userInfo: UserSession, options: LoginOptions = { rememberMe: false }) => {
            setUser(userInfo)
            setRememberMe(options.rememberMe)
        },
        [],
    )

    // 로그아웃: 서버에 요청 후 사용자 정보 삭제
    const logout = useCallback(async () => {
        try {
            await fetch("/api/user/logout", {
                method: "POST",
                credentials: "include",
            })
        } catch { }
        setUser(null)
        setRememberMe(false)
    }, [])

    // 사용자 정보 업데이트
    const updateSession = useCallback(
        (updates: Partial<UserSession>) => {
            if (!user) return
            const updatedUser = { ...user, ...updates }
            setUser(updatedUser)
        },
        [user],
    )

    return {
        session: user,
        isLoading,
        isLoggedIn: !!user,
        rememberMe,
        setRememberMe,
        login,
        logout,
        updateSession,
    }
}
