"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import type { ChatMessage } from "@/lib/types"

interface Params {
  roomId: number | null
  onMessage: (msg: ChatMessage) => void
  onLike: (data: { messageId: string; likedBy: number[] }) => void
  onUserCount?: (count: number) => void
}

export function useChatSocket({ roomId, onMessage, onLike, onUserCount }: Params) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io("https://intramural-api-v1.kro.kr", { withCredentials: true })
    const socket = socketRef.current

    socket.on("connect", () => {
      setConnected(true)
      if (roomId) socket.emit("joinRoom", roomId)
    })
    socket.on("disconnect", () => setConnected(false))
    socket.on("chat", onMessage)
    socket.on("like", onLike)
    if (onUserCount) {
      socket.on("userCount", (d: { anonymous: number; member: number }) => onUserCount(d.anonymous + d.member))
    }

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !connected) return
    socket.emit("leaveRoom")
    if (roomId) socket.emit("joinRoom", roomId)
  }, [roomId, connected])

  return { socketRef, connected }
}