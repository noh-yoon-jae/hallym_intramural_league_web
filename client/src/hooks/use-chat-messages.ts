"use client"

import { useReducer, useEffect, useRef } from "react"
import type { ChatMessage } from "@/lib/types"

interface State {
    messages: ChatMessage[]
    loading: boolean
    hasMore: boolean
    page: number
}

const MESSAGE_PAGE_SIZE = 6

const initialState: State = { messages: [], loading: false, hasMore: true, page: 1 }

type Action =
    | { type: "RESET" }
    | { type: "LOAD_START" }
    | { type: "LOAD_SUCCESS"; messages: ChatMessage[]; hasMore: boolean }
    | { type: "SET_PAGE"; page: number }
    | { type: "APPEND"; message: ChatMessage }
    | { type: "UPDATE"; id: string; update: Partial<ChatMessage> }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "RESET":
            return { ...initialState }
        case "LOAD_START":
            return { ...state, loading: true }
        case "LOAD_SUCCESS":
            return {
                ...state,
                loading: false,
                hasMore: action.hasMore,
                messages:
                    state.page === 1 ? action.messages : [...action.messages, ...state.messages],
            }
        case "SET_PAGE":
            return { ...state, page: action.page }
        case "APPEND":
            if (state.messages.some((m) => m.id === action.message.id)) return state
            return { ...state, messages: [...state.messages, action.message] }
        case "UPDATE":
            return {
                ...state,
                messages: state.messages.map((m) =>
                    m.id === action.id ? { ...m, ...action.update } : m,
                ),
            }
        default:
            return state
    }
}

export function useChatMessages(roomId: number | null, userId: number | null) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const roomRef = useRef<number | null>(roomId)

    useEffect(() => {
        roomRef.current = roomId
        dispatch({ type: "RESET" })
    }, [roomId])

    useEffect(() => {
        if (!roomId) return
        const fetchRoomId = roomId
        dispatch({ type: "LOAD_START" })
        fetch(`/api/chat/list/${roomId}/${state.page}`)
            .then((res) => res.json())
            .then((data) => {
                if (roomRef.current !== fetchRoomId) return
                if (data.status) {
                    const msgs = data.data
                        .map((m: any) => {
                            const likedBy = m.liked_by
                                ? (m.liked_by as string)
                                    .split(',')
                                    .filter((v: string) => v)
                                    .map((v: string) => Number(v))
                                : []
                            return {
                                id: m.id.toString(),
                                roomId: fetchRoomId,
                                user: m.nickname,
                                message: m.message,
                                timestamp: new Date(m.created_at),
                                likes: likedBy.length,
                                likedBy,
                                isLiked: userId ? likedBy.includes(userId) : false,
                                isReported: m.is_reported === 1,
                            } as ChatMessage
                        })
                        .reverse()
                    dispatch({ type: "LOAD_SUCCESS", messages: msgs, hasMore: msgs.length === MESSAGE_PAGE_SIZE })
                } else {
                    dispatch({ type: "LOAD_SUCCESS", messages: [], hasMore: false })
                }
            })
            .catch(() => dispatch({ type: "LOAD_SUCCESS", messages: [], hasMore: false }))
    }, [roomId, state.page, userId])

    const loadNext = () => dispatch({ type: "SET_PAGE", page: state.page + 1 })
    const addMessage = (msg: ChatMessage) => dispatch({ type: "APPEND", message: msg })

    return { ...state, loadNext, addMessage, dispatch }
}