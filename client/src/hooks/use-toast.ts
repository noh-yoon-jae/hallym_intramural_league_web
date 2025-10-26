"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Toast, ToastState } from "@/lib/toast"
import { createToast } from "@/lib/toast"

export function useToast() {
    const [state, setState] = useState<ToastState>({
        toasts: [],
    })
    const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

    const removeToast = useCallback((id: string) => {
        // 타이머 정리
        const timeout = timeoutsRef.current.get(id)
        if (timeout) {
            clearTimeout(timeout)
            timeoutsRef.current.delete(id)
        }

        setState((prev) => ({
            toasts: prev.toasts.filter((toast) => toast.id !== id),
        }))
    }, [])

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        const timeouts = timeoutsRef.current
        return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout))
            timeouts.clear()
        }
    }, [])

    const addToast = useCallback(
        (message: string, type: Toast["type"] = "info", options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
            const toast = createToast(message, type, options)

            setState((prev) => ({
                toasts: [...prev.toasts, toast],
            }))

            // 자동 제거 설정
            if (toast.duration && toast.duration > 0) {
                const timeout = setTimeout(() => {
                    removeToast(toast.id)
                }, toast.duration)
                timeoutsRef.current.set(toast.id, timeout)
            }

            return toast.id
        },
        [removeToast],
    )

    const clearAllToasts = useCallback(() => {
        // 모든 타이머 정리
        timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
        timeoutsRef.current.clear()

        setState({ toasts: [] })
    }, [])

    // 편의 메서드들
    const success = useCallback(
        (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
            return addToast(message, "success", options)
        },
        [addToast],
    )

    const error = useCallback(
        (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
            return addToast(message, "error", options)
        },
        [addToast],
    )

    const warning = useCallback(
        (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
            return addToast(message, "warning", options)
        },
        [addToast],
    )

    const info = useCallback(
        (message: string, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
            return addToast(message, "info", options)
        },
        [addToast],
    )

    return {
        toasts: state.toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        hasToasts: state.toasts.length > 0,
    }
}
