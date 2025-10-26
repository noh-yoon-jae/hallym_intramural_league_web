"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getToastIcon, getToastStyles } from "@/lib/toast"
import type { Toast } from "@/lib/toast"
import { useEffect, useState } from "react"

interface ToastProps {
  toast: Toast
  onDismiss?: (id: string) => void
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [progress, setProgress] = useState(100)
  const styles = getToastStyles(toast.type)
  const icon = getToastIcon(toast.type)

  useEffect(() => {
    // 컴포넌트가 마운트되면 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // 진행률 바 애니메이션
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const decrement = 100 / (toast.duration! / 50)
          return Math.max(0, prev - decrement)
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [toast.duration])

  const handleDismiss = () => {
    if (!toast.dismissible || !onDismiss) return

    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300) // 애니메이션 시간과 맞춤
  }

  const handleActionClick = () => {
    if (toast.action) {
      toast.action.onClick()
      handleDismiss()
    }
  }

  return (
    <div
      className={`
        relative overflow-hidden border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out transform max-w-sm w-full
        ${styles.container}
        ${isVisible && !isLeaving ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-full scale-95"}
        ${isLeaving ? "opacity-0 translate-x-full scale-95" : ""}
      `}
    >
      {/* 진행률 바 */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full transition-all duration-75 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 text-lg ${styles.icon}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          {toast.title && <h4 className="font-medium text-sm mb-1">{toast.title}</h4>}
          <p className="text-sm leading-relaxed">{toast.message}</p>
          {toast.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleActionClick}
              className="mt-2 h-8 px-3 text-xs font-medium hover:bg-black/10"
            >
              {toast.action.label}
            </Button>
          )}
        </div>
        {toast.dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10 text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
