"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast-container"
import type { Toast } from "@/lib/toast"

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: Toast["type"], options?: Partial<Omit<Toast, "id" | "message" | "type">>) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
  success: (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => string
  error: (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => string
  warning: (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => string
  info: (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => string
  hasToasts: boolean
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastManager = useToast()

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      <ToastContainer toasts={toastManager.toasts} onDismiss={toastManager.removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
