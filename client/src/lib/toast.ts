export interface Toast {
    id: string
    type: "success" | "error" | "warning" | "info"
    title?: string
    message: string
    duration?: number
    dismissible?: boolean
    action?: {
        label: string
        onClick: () => void
    }
}

export interface ToastState {
    toasts: Toast[]
}

export const createToast = (
    message: string,
    type: Toast["type"] = "info",
    options?: Partial<Omit<Toast, "id" | "message" | "type">>,
): Toast => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    message,
    duration: 4000,
    dismissible: true,
    ...options,
})

export const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
        case "success":
            return "✅"
        case "error":
            return "❌"
        case "warning":
            return "⚠️"
        case "info":
            return "ℹ️"
        default:
            return "ℹ️"
    }
}

export const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
        case "success":
            return {
                container: "bg-green-50 border-green-200 text-green-800",
                icon: "text-green-500",
                progress: "bg-green-500",
            }
        case "error":
            return {
                container: "bg-red-50 border-red-200 text-red-800",
                icon: "text-red-500",
                progress: "bg-red-500",
            }
        case "warning":
            return {
                container: "bg-yellow-50 border-yellow-200 text-yellow-800",
                icon: "text-yellow-500",
                progress: "bg-yellow-500",
            }
        case "info":
            return {
                container: "bg-blue-50 border-blue-200 text-blue-800",
                icon: "text-blue-500",
                progress: "bg-blue-500",
            }
        default:
            return {
                container: "bg-gray-50 border-gray-200 text-gray-800",
                icon: "text-gray-500",
                progress: "bg-gray-500",
            }
    }
}
