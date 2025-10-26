export interface ErrorMessage {
    id: string
    type: "error" | "warning" | "info" | "success"
    title?: string
    message: string
    duration?: number
    dismissible?: boolean
}

export interface ErrorManagerState {
    messages: ErrorMessage[]
}

export const createErrorMessage = (
    message: string,
    type: ErrorMessage["type"] = "error",
    options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>,
): ErrorMessage => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    message,
    duration: 5000,
    dismissible: true,
    ...options,
})

export const getErrorIcon = (type: ErrorMessage["type"]) => {
    switch (type) {
        case "error":
            return "❌"
        case "warning":
            return "⚠️"
        case "info":
            return "ℹ️"
        case "success":
            return "✅"
        default:
            return "ℹ️"
    }
}

export const getErrorStyles = (type: ErrorMessage["type"]) => {
    switch (type) {
        case "error":
            return {
                container: "bg-red-50 border-red-200 text-red-800",
                icon: "text-red-500",
                button: "text-red-400 hover:text-red-600",
            }
        case "warning":
            return {
                container: "bg-yellow-50 border-yellow-200 text-yellow-800",
                icon: "text-yellow-500",
                button: "text-yellow-400 hover:text-yellow-600",
            }
        case "info":
            return {
                container: "bg-blue-50 border-blue-200 text-blue-800",
                icon: "text-blue-500",
                button: "text-blue-400 hover:text-blue-600",
            }
        case "success":
            return {
                container: "bg-green-50 border-green-200 text-green-800",
                icon: "text-green-500",
                button: "text-green-400 hover:text-green-600",
            }
        default:
            return {
                container: "bg-gray-50 border-gray-200 text-gray-800",
                icon: "text-gray-500",
                button: "text-gray-400 hover:text-gray-600",
            }
    }
}
