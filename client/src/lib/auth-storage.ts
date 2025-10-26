export interface LoginOptions {
    rememberMe: boolean
}

export interface UserSession {
    id?: number
    username: string
    nickname?: string
    college?: string
    team?: string
    email: string
    loginTime: string
    expiresAt: string
    rememberMe: boolean
}

export const AUTH_STORAGE_KEY = "userInfo"
export const REMEMBER_ME_KEY = "rememberMe"

// 로그인 상태 유지 기간 설정
export const SESSION_DURATION = {
    DEFAULT: 24 * 60 * 60 * 1000, // 24시간 (밀리초)
    REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30일 (밀리초)
} as const

export const createUserSession = (
    userInfo: Omit<UserSession, "loginTime" | "expiresAt" | "rememberMe">,
    rememberMe = false,
): UserSession => {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (rememberMe ? SESSION_DURATION.REMEMBER_ME : SESSION_DURATION.DEFAULT))

    return {
        ...userInfo,
        loginTime: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        rememberMe,
    }
}

export const saveUserSession = (session: UserSession) => {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))

        // 로그인 상태 유지 선택 여부도 별도 저장
        localStorage.setItem(REMEMBER_ME_KEY, session.rememberMe.toString())

        // 쿠키에도 저장 (서버에서 확인할 수 있도록)
        const cookieExpires = new Date(session.expiresAt)
        document.cookie = `${AUTH_STORAGE_KEY}=${JSON.stringify(session)}; expires=${cookieExpires.toUTCString()}; path=/; SameSite=Strict`

        console.log(`로그인 세션 저장됨 - 만료일: ${session.expiresAt} (${session.rememberMe ? "30일" : "24시간"})`)
    } catch {
        console.error("사용자 세션 저장 실패")
    }
}

export const getUserSession = (): UserSession | null => {
    try {
        const sessionData = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!sessionData) return null

        const session: UserSession = JSON.parse(sessionData)

        // 세션 만료 확인
        const now = new Date()
        const expiresAt = new Date(session.expiresAt)

        if (now > expiresAt) {
            console.log("세션이 만료되었습니다.")
            clearUserSession()
            return null
        }

        return session
    } catch {
        console.error("사용자 세션 로드 실패")
        clearUserSession()
        return null
    }
}

export const clearUserSession = () => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(REMEMBER_ME_KEY)

        // 쿠키도 삭제
        document.cookie = `${AUTH_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

        console.log("사용자 세션이 삭제되었습니다.")
    } catch {
        console.error("사용자 세션 삭제 실패")
    }
}

export const isSessionValid = (session: UserSession | null): boolean => {
    if (!session) return false

    const now = new Date()
    const expiresAt = new Date(session.expiresAt)

    return now <= expiresAt
}

export const getRememberMePreference = (): boolean => {
    try {
        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY)
        return rememberMe === "true"
    } catch {
        return false
    }
}

export const formatSessionExpiry = (expiresAt: string): string => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()

    if (diffMs <= 0) return "만료됨"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffDays > 0) {
        return `${diffDays}일 ${diffHours}시간 후 만료`
    } else if (diffHours > 0) {
        return `${diffHours}시간 ${diffMinutes}분 후 만료`
    } else {
        return `${diffMinutes}분 후 만료`
    }
}
