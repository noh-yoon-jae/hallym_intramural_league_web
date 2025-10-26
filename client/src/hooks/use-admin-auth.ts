"use client"

import { useState, useEffect, useCallback } from "react"
import { getAdminSession, saveAdminSession, clearAdminSession, hasPermission, canManageCollege } from "@/lib/admin-auth"
import type { AdminUser } from "@/lib/admin-auth"

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAdminSession = () => {
      try {
        const savedAdmin = getAdminSession()
        setAdmin(savedAdmin)
      } catch (error) {
        console.error("관리자 세션 로드 실패:", error)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminSession()
  }, [])

  const login = useCallback((adminUser: AdminUser) => {
    try {
      saveAdminSession(adminUser)
      setAdmin(adminUser)
    } catch (error) {
      console.error("관리자 로그인 실패:", error)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      clearAdminSession()
      setAdmin(null)
    } catch (error) {
      console.error("관리자 로그아웃 실패:", error)
    }
  }, [])

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!admin) return false
      return hasPermission(admin, permission)
    },
    [admin],
  )

  const checkCollegeAccess = useCallback(
    (college: string): boolean => {
      if (!admin) return false
      return canManageCollege(admin, college)
    },
    [admin],
  )

  return {
    admin,
    isLoading,
    isLoggedIn: !!admin,
    login,
    logout,
    checkPermission,
    checkCollegeAccess,
  }
}
