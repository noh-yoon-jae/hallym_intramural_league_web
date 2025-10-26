"use client"

import { ErrorMessageComponent } from "./error-message"
import type { ErrorMessage } from "@/lib/error-manager"

interface ErrorManagerProps {
  messages: ErrorMessage[]
  onDismiss?: (id: string) => void
  className?: string
  maxMessages?: number
}

export function ErrorManager({ messages, onDismiss, className = "", maxMessages = 5 }: ErrorManagerProps) {
  if (messages.length === 0) return null

  // 최대 메시지 수 제한
  const displayMessages = messages.slice(-maxMessages)

  return (
    <div className={`space-y-3 ${className}`}>
      {displayMessages.map((message) => (
        <ErrorMessageComponent key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
