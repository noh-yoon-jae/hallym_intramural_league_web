"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getErrorIcon, getErrorStyles } from "@/lib/error-manager"
import type { ErrorMessage } from "@/lib/error-manager"
import { useEffect, useState } from "react"

interface ErrorMessageProps {
  message: ErrorMessage
  onDismiss?: (id: string) => void
}

export function ErrorMessageComponent({ message, onDismiss }: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const styles = getErrorStyles(message.type)
  const icon = getErrorIcon(message.type)

  useEffect(() => {
    // 컴포넌트가 마운트되면 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    if (!message.dismissible || !onDismiss) return

    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(message.id)
    }, 300) // 애니메이션 시간과 맞춤
  }

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all duration-300 ease-in-out transform
        ${styles.container}
        ${isVisible && !isLeaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        ${isLeaving ? "opacity-0 -translate-y-2" : ""}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 text-lg ${styles.icon}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          {message.title && <h4 className="font-medium text-sm mb-1">{message.title}</h4>}
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
        {message.dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={`flex-shrink-0 h-6 w-6 p-0 ${styles.button}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
