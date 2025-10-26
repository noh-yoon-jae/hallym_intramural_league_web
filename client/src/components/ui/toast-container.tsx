"use client"

import { ToastComponent } from "./toast"
import type { Toast } from "@/lib/toast"

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss?: (id: string) => void
  className?: string
  maxToasts?: number
}

export function ToastContainer({ toasts, onDismiss, className = "", maxToasts = 5 }: ToastContainerProps) {
  if (toasts.length === 0) return null

  // 최대 토스트 수 제한 (최신 것부터 표시)
  const displayToasts = toasts.slice(-maxToasts)

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none
        ${className}
      `}
    >
      {displayToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
