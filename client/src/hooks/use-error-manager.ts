"use client"

import { useState, useCallback } from "react"
import type { ErrorMessage, ErrorManagerState } from "@/lib/error-manager"
import { createErrorMessage } from "@/lib/error-manager"

export function useErrorManager() {
	const [state, setState] = useState<ErrorManagerState>({
		messages: [],
	})

	const removeError = useCallback((id: string) => {
		setState((prev) => ({
			messages: prev.messages.filter((msg) => msg.id !== id),
		}))
	}, [])


	const addError = useCallback(
		(
			message: string,
			type: ErrorMessage["type"] = "error",
			options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>,
		) => {
			const errorMessage = createErrorMessage(message, type, options)

			setState((prev) => ({
				messages: [...prev.messages, errorMessage],
			}))

			// 자동 제거 설정
			if (errorMessage.duration && errorMessage.duration > 0) {
				setTimeout(() => {
					removeError(errorMessage.id)
				}, errorMessage.duration)
			}

			return errorMessage.id
		},
		[removeError],
	)

	const clearAllErrors = useCallback(() => {
		setState({ messages: [] })
	}, [])

	// 편의 메서드들
	const addErrorMessage = useCallback(
		(message: string, options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>) => {
			return addError(message, "error", options)
		},
		[addError],
	)

	const addWarningMessage = useCallback(
		(message: string, options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>) => {
			return addError(message, "warning", options)
		},
		[addError],
	)

	const addInfoMessage = useCallback(
		(message: string, options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>) => {
			return addError(message, "info", options)
		},
		[addError],
	)

	const addSuccessMessage = useCallback(
		(message: string, options?: Partial<Omit<ErrorMessage, "id" | "message" | "type">>) => {
			return addError(message, "success", options)
		},
		[addError],
	)

	return {
		messages: state.messages,
		addError,
		addErrorMessage,
		addWarningMessage,
		addInfoMessage,
		addSuccessMessage,
		removeError,
		clearAllErrors,
		hasErrors: state.messages.length > 0,
	}
}
