"use client"

import { useState, useEffect } from "react"
import type { UserInfo } from "@/lib/types"

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
          setUserInfo(data.data)
        } else {
          setUserInfo(null)
        }
      } catch {
        setUserInfo(null)
      }
      setIsLoading(false)
    }
    fetchUserInfo()
  }, [])

  const updateUser = (updatedInfo: Partial<UserInfo>) => {
    if (!userInfo) return
    setUserInfo({ ...userInfo, ...updatedInfo })
  }

  const logout = () => {
    setUserInfo(null)
  }

  const login = (user: UserInfo) => {
    setUserInfo(user)
  }

  return {
    userInfo,
    isLoading,
    updateUser,
    logout,
    login,
    isLoggedIn: !!userInfo,
  }
}
