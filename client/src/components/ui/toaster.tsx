"use client"

import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast-container"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />
}
