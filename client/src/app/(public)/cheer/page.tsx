"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, MoreVertical, Flag, Heart, LogOut, Users, Clock, Settings } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useChatMessages } from "@/hooks/use-chat-messages"
import { useChatSocket } from "@/hooks/use-chat-socket"
import { useRouter } from "next/navigation"
import type { SportType, UserInfo, ChatMessage } from "@/lib/types"
import { SPORTS_CONFIG, ALL_TEAMS, CHEER_EMOJIS } from "@/lib/data"
import { useUser } from "@/hooks/use-user"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function CheerPage() {
    const [selectedSport, setSelectedSport] = useState<SportType>()
    const [newMessage, setNewMessage] = useState("")
    const { userInfo: fetchedUser } = useUser()
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<number>(0)
    const [sports] = useLocalStorage<{ id: number; name: string }[]>("table_data_sports", [])
    const [rooms] = useLocalStorage<{ id: number; sport_id: number; name: string }[]>("table_data_rooms", [])
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null)
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const [autoScroll, setAutoScroll] = useState(true)
    const router = useRouter()
    const [tempNickname, setTempNickname] = useState("")
    const [tempTeam, setTempTeam] = useState("")
    const [showProfileDialog, setShowProfileDialog] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [reportingMessageId, setReportingMessageId] = useState<string | null>(null)
    const prevScrollHeightRef = useRef(0)
    const prevScrollTopRef = useRef(0)

    const [stats, setStats] = useState({
        totalMessages: 0,
        totalLikes: 0,
        todayMessages: 0,
    })

    const userInfoRef = useRef<UserInfo | null>(null)
    const messagesRef = useRef<ChatMessage[]>([])

    const {
        messages,
        loading,
        hasMore,
        loadNext,
        addMessage,
        dispatch: messagesDispatch,
    } = useChatMessages(selectedRoomId, userInfo ? userInfo.id : null)

    useEffect(() => {
        userInfoRef.current = userInfo
    }, [userInfo])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    // 무한스크롤 이전 위치 저장
    const savePrevScrollPosition = () => {
        const container = messagesContainerRef.current
        if (container) {
            prevScrollHeightRef.current = container.scrollHeight
            prevScrollTopRef.current = container.scrollTop
        }
    }

    // 스크롤 이벤트
    const handleScroll = () => {
        const container = messagesContainerRef.current
        if (!container) return
        if (container.scrollTop === 0 && hasMore && !loading) {
            savePrevScrollPosition()
            loadNext()
            setAutoScroll(false)
        }
    }

    // messages 변화 시 스크롤 보정 (무한스크롤)
    useEffect(() => {
        if (!autoScroll) {
            requestAnimationFrame(() => {
                const container = messagesContainerRef.current
                if (container) {
                    const newScrollHeight = container.scrollHeight
                    const heightDiff = newScrollHeight - prevScrollHeightRef.current
                    container.scrollTop = prevScrollTopRef.current + heightDiff
                }
            })
        }
    }, [messages])

    // 자동 아래로 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom()
        }
    }, [messages, autoScroll])

    useEffect(() => {
        if (selectedRoomId === null) {
            setStats({
                totalMessages: 0,
                totalLikes: 0,
                todayMessages: 0,
            })
        }
    }, [selectedRoomId])

    useEffect(() => {
        const hasRoom = rooms.some(r => r.sport_id === selectedSportId)
        if (!hasRoom) {
            setStats({
                totalMessages: 0,
                totalLikes: 0,
                todayMessages: 0,
            })
        }
    }, [selectedSportId, rooms])

    useEffect(() => {
        if (!selectedRoomId || !userInfo) return
        fetch(`/api/chat/stats/${selectedRoomId}`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.status) {
                    setStats({
                        totalMessages: data.data.totalMessages,
                        totalLikes: data.data.totalLikes,
                        todayMessages: data.data.todayMessages,
                    })
                }
            })
    }, [selectedRoomId, userInfo])

    useEffect(() => {
        if (fetchedUser) {
            setUserInfo(fetchedUser)
        }
    }, [fetchedUser])

    useEffect(() => {
        if (sports.length > 0 && selectedSportId === null) {
            setSelectedSportId(sports[0].id)
        }
    }, [sports, selectedSportId])

    useEffect(() => {
        const s = sports.find((sp) => sp.id === selectedSportId)
        if (s) {
            setSelectedSport(s.name as SportType)
        }

        const firstRoom = rooms.find((r) => r.sport_id === selectedSportId)
        if (firstRoom) {
            if (selectedRoomId !== firstRoom.id) {
                setSelectedRoomId(firstRoom.id)
            }
        } else if (selectedRoomId !== null) {
            setSelectedRoomId(null)
        }
    }, [selectedSportId, sports, rooms])

    useChatSocket({
        roomId: selectedRoomId,
        onMessage: (msg) => {
            addMessage({ ...msg, timestamp: new Date(msg.timestamp) })
            setAutoScroll(true)
            // 통계 중복 더함 방지: onMessage만 남김
            if (
                msg.user === userInfoRef.current?.nickname &&
                !messagesRef.current.some((m) => m.id === msg.id)
            ) {
                setStats((prev) => ({
                    ...prev,
                    totalMessages: prev.totalMessages + 1,
                    todayMessages: prev.todayMessages + 1,
                }))
            }
        },
        onLike: (data) => {
            const oldMsg = messagesRef.current.find((m) => m.id === data.messageId)
            messagesDispatch({
                type: "UPDATE",
                id: data.messageId,
                update: {
                    likedBy: data.likedBy,
                    likes: data.likedBy.length,
                    isLiked: userInfoRef.current
                        ? data.likedBy.includes(userInfoRef.current.id)
                        : undefined,
                },
            })
            if (oldMsg && oldMsg.user === userInfoRef.current?.nickname) {
                const prevLikes = oldMsg.likedBy ? oldMsg.likedBy.length : 0
                const delta = data.likedBy.length - prevLikes
                if (delta !== 0) {
                    setStats((prev) => ({
                        ...prev,
                        totalLikes: prev.totalLikes + delta,
                    }))
                }
            }
        },
        onUserCount: setOnlineUsers,
    })

    // 프로필 저장
    const handleSaveProfile = () => {
        if (!userInfo || !tempNickname.trim()) return

        const updatedUserInfo = {
            ...userInfo,
            nickname: tempNickname.trim(),
            team: tempTeam,
        }

        fetch('/api/user/nickname', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: updatedUserInfo.nickname }),
        }).then(() => {
            setUserInfo(updatedUserInfo)
            setShowProfileDialog(false)
        })
    }

    // 로그아웃
    const handleLogout = () => {
        fetch('/api/user/logout', { method: 'POST', credentials: 'include' }).finally(() => {
            router.push('/login')
        })
    }

    // 선택된 채팅방의 메시지만 필터링
    const currentMessages = messages.filter((msg) => !msg.isReported)

    // 메시지 전송 (통계는 onMessage에서만)
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userInfo || !userInfo.nickname || !selectedRoomId) return
        const res = await fetch('/api/chat/send', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: selectedRoomId, message: newMessage })
        })

        const data = await res.json()
        if (!data.status) return

        const message: ChatMessage = {
            ...data.data,
            sport: selectedSport,
            isReported: false,
        }

        addMessage({ ...message, timestamp: new Date(message.timestamp) })
        setNewMessage("")
    }

    // 좋아요 토글 (통계는 onLike에서만)
    const handleLike = (messageId: string) => {
        if (!userInfo) return
        fetch('/api/chat/like', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.status) return
                const likedBy: number[] = data.likedBy || []
                messagesDispatch({
                    type: "UPDATE",
                    id: messageId,
                    update: {
                        likedBy,
                        likes: likedBy.length,
                        isLiked: likedBy.includes(userInfo.id),
                    },
                })
            })
    }

    // 메시지 신고
    const handleReport = async () => {
        if (!reportingMessageId || !reportReason.trim()) return

        const res = await fetch('/api/report/chat', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: reportingMessageId, reason: reportReason })
        })

        const data = await res.json()
        if (data.status) {
            messagesDispatch({
                type: "UPDATE",
                id: reportingMessageId,
                update: { isReported: true },
            })
            setReportingMessageId(null)
            setReportReason("")
        }
    }

    // 이모지 추가
    const addEmoji = (emoji: string) => {
        setNewMessage(newMessage + emoji)
    }

    // 시간 포맷팅
    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))

        if (minutes < 1) return "방금 전"
        if (minutes < 60) return `${minutes}분 전`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`
        return date.toLocaleDateString()
    }

    const allTeams = ALL_TEAMS

    const getTeamInfo = (teamName: string) => {
        if (!teamName) return null
        return allTeams.find((t) => t.name === teamName)
    }

    // 로그인하지 않은 경우 게스트 모드로 표시
    if (!userInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <MessageCircle className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">응원톡</h1>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 게스트 정보 */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">게스트 모드</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 게스트 안내 */}
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                                        ?
                                    </div>
                                    <h3 className="font-medium">게스트</h3>
                                    <p className="text-sm text-gray-600 mt-2">응원 채팅에 참여하려면 로그인이 필요합니다.</p>
                                    <Button className="mt-4 w-full" asChild>
                                        <Link href="/login">로그인하기</Link>
                                    </Button>
                                    <Button variant="outline" className="mt-2 w-full bg-transparent" asChild>
                                        <Link href="/register">회원가입</Link>
                                    </Button>
                                </div>

                                {/* 온라인 통계 */}
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-3">응원 통계</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-purple-500" />
                                                온라인 사용자
                                            </span>
                                            <span className="font-medium text-green-600">{onlineUsers}명</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 채팅 메인 영역 */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>종목별 응원 채팅</CardTitle>
                                <CardDescription>우리 팀을 응원하고 다른 팀과 소통해보세요!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* 종목 선택 탭 */}
                                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                                    {sports.map((sp) => {
                                        const config = SPORTS_CONFIG[sp.name as SportType]
                                        return (
                                            <button
                                                key={sp.id}
                                                onClick={() => setSelectedSportId(sp.id)}
                                                className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${selectedSportId === sp.id
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-900"}`}
                                            >
                                                {config?.icon} {config?.name || sp.name}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* 채팅방 선택 */}
                                <select
                                    className="mb-4 p-2 border rounded"
                                    value={selectedRoomId ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setSelectedRoomId(value ? Number(value) : null)
                                    }}
                                >
                                    <option value="">채팅방 선택</option>
                                    {rooms.filter((r) => r.sport_id === selectedSportId).map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>

                                {/* 게스트 모드 알림 */}
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 flex items-center">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        현재 게스트 모드로 채팅을 보고 있습니다. 채팅에 참여하려면 로그인해주세요.
                                    </p>
                                </div>

                                {/* 채팅 메시지 영역 */}
                                <div
                                    className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4"
                                    ref={messagesContainerRef}
                                    onScroll={handleScroll}
                                >
                                    {loading && (
                                        <div className="flex justify-center my-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {currentMessages.length === 0 ? (
                                            <div className="text-center text-gray-500 py-8">
                                                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>아직 선택한 채팅방의 메시지가 없습니다.</p>
                                                <p className="text-sm">첫 번째 응원 메시지를 남겨보세요!</p>
                                            </div>
                                        ) : (
                                            currentMessages.map((message) => {
                                                const teamInfo = getTeamInfo(message.team || "")
                                                return (
                                                    <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                {teamInfo && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {teamInfo.logo} {message.team}
                                                                    </Badge>
                                                                )}
                                                                <span className="font-medium text-sm">{message.user}</span>
                                                                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-800 mb-3">{message.message}</p>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (!userInfo) {
                                                                        router.push("/login")
                                                                    } else {
                                                                        handleLike(message.id)
                                                                    }
                                                                }}
                                                                className={message.isLiked ? "text-red-500" : "text-gray-500"}
                                                            >
                                                                <Heart className={`h-4 w-4 mr-1 ${message.isLiked ? "fill-current" : ""}`} />
                                                                {message.likes}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* 메시지 입력 */}
                                <div className="flex space-x-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="로그인 후 응원 메시지를 작성할 수 있습니다"
                                        className="flex-1"
                                        disabled={true}
                                    />
                                    <Button onClick={() => router.push("/login")} disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* 채팅 규칙 */}
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-1">채팅 규칙</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• 상대방을 존중하는 건전한 응원 문화를 만들어주세요</li>
                                        <li>• 욕설, 비방, 차별적 발언은 금지됩니다</li>
                                        <li>• 부적절한 메시지는 신고해주세요</li>
                                        <li>• 스포츠맨십을 지켜주세요</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        )
    }

    // 통계 데이터
    const myMessagesCount = stats.totalMessages
    const myLikesCount = stats.totalLikes
    const todayMessagesCount = stats.todayMessages

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-4 mb-8">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">응원톡</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 사용자 정보 및 통계 */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">내 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 사용자 프로필 */}
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                                    {(userInfo.nickname || userInfo.username).charAt(0)}
                                </div>
                                <h3 className="font-medium">{userInfo.nickname || userInfo.username}</h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowProfileDialog(true)} className="mt-2 text-xs">
                                    <Settings className="h-3 w-3 mr-1" />
                                    프로필 수정
                                </Button>
                            </div>

                            {/* 응원 통계 */}
                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3">응원 통계</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center">
                                            <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />총 메시지
                                        </span>
                                        <span className="font-medium">{myMessagesCount}개</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center">
                                            <Heart className="h-4 w-4 mr-2 text-red-500" />
                                            받은 좋아요
                                        </span>
                                        <span className="font-medium">{myLikesCount}개</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                                            오늘 메시지
                                        </span>
                                        <span className="font-medium">{todayMessagesCount}개</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center">
                                            <Users className="h-4 w-4 mr-2 text-purple-500" />
                                            온라인 사용자
                                        </span>
                                        <span className="font-medium text-green-600">{onlineUsers}명</span>
                                    </div>
                                </div>
                            </div>

                            {/* 로그아웃 버튼 */}
                            <div className="pt-4 border-t">
                                <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    로그아웃
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 채팅 메인 영역 */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>종목별 응원 채팅</CardTitle>
                            <CardDescription>우리 팀을 응원하고 다른 팀과 소통해보세요!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* 종목 선택 탭 */}
                            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                                {sports.map((sp) => {
                                    const config = SPORTS_CONFIG[sp.name as SportType]
                                    return (
                                        <button
                                            key={sp.id}
                                            onClick={() => setSelectedSportId(sp.id)}
                                            className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${selectedSportId === sp.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                                        >
                                            {config?.icon} {config?.name || sp.name}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* 채팅방 선택 */}
                            <select
                                className="mb-4 p-2 border rounded"
                                value={selectedRoomId ?? ''}
                                onChange={(e) => {
                                    setSelectedRoomId(Number(e.target.value))
                                }}
                            >
                                <option value="">채팅방 선택</option>
                                {rooms.filter((r) => r.sport_id === selectedSportId).map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>

                            {/* 프로필 미완성 경고 */}
                            {(!userInfo.nickname) && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        응원 채팅에 참여하려면 닉네임 설정해주세요.{" "}
                                        <button
                                            onClick={() => setShowProfileDialog(true)}
                                            className="text-yellow-900 underline font-medium"
                                        >
                                            지금 설정하기
                                        </button>
                                    </p>
                                </div>
                            )}

                            {/* 채팅 메시지 영역 */}
                            <div
                                className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4"
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                            >
                                {loading && (
                                    <div className="flex justify-center my-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {currentMessages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>아직 선택한 채팅방의 메시지가 없습니다.</p>
                                            <p className="text-sm">첫 번째 응원 메시지를 남겨보세요!</p>
                                        </div>
                                    ) : (
                                        currentMessages.map((message) => {
                                            const teamInfo = getTeamInfo(message.team || "")
                                            return (
                                                <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            {teamInfo && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {teamInfo.logo} {message.team}
                                                                </Badge>
                                                            )}
                                                            <span className="font-medium text-sm">{message.user}</span>
                                                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                                                        </div>
                                                        {message.user !== (userInfo?.nickname || "") && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <DropdownMenuItem
                                                                                onSelect={(e) => {
                                                                                    e.preventDefault()
                                                                                    setReportingMessageId(message.id)
                                                                                }}
                                                                            >
                                                                                <Flag className="h-4 w-4 mr-2" />
                                                                                신고하기
                                                                            </DropdownMenuItem>
                                                                        </DialogTrigger>
                                                                        <DialogContent>
                                                                            <DialogHeader>
                                                                                <DialogTitle>메시지 신고</DialogTitle>
                                                                                <DialogDescription>
                                                                                    부적절한 메시지를 신고해주세요. 신고된 메시지는 검토 후 처리됩니다.
                                                                                </DialogDescription>
                                                                            </DialogHeader>
                                                                            <div className="space-y-4">
                                                                                <div>
                                                                                    <Label htmlFor="reportReason">신고 사유</Label>
                                                                                    <Textarea
                                                                                        id="reportReason"
                                                                                        value={reportReason}
                                                                                        onChange={(e) => setReportReason(e.target.value)}
                                                                                        placeholder="신고 사유를 입력해주세요"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <Button variant="outline" onClick={() => setReportingMessageId(null)}>
                                                                                    취소
                                                                                </Button>
                                                                                <Button onClick={handleReport}>신고하기</Button>
                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-800 mb-3">{message.message}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleLike(message.id)}
                                                            className={message.isLiked ? "text-red-500" : "text-gray-500"}
                                                        >
                                                            <Heart className={`h-4 w-4 mr-1 ${message.isLiked ? "fill-current" : ""}`} />
                                                            {message.likes}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* 응원 이모지 */}
                            <div className="flex space-x-2 mb-4">
                                <span className="text-sm text-gray-600 self-center">빠른 응원:</span>
                                {CHEER_EMOJIS.map((emoji) => (
                                    <Button key={emoji} variant="outline" size="sm" onClick={() => addEmoji(emoji)} className="text-lg">
                                        {emoji}
                                    </Button>
                                ))}
                            </div>

                            {/* 메시지 입력 */}
                            <div className="flex space-x-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={
                                        userInfo.nickname
                                            ? "메시지를 입력하세요..."
                                            : "프로필을 설정한 후 메시지를 보낼 수 있습니다"
                                    }
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    className="flex-1"
                                    disabled={!userInfo.nickname}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || !userInfo.nickname}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* 채팅 규칙 */}
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-1">채팅 규칙</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• 상대방을 존중하는 건전한 응원 문화를 만들어주세요</li>
                                    <li>• 욕설, 비방, 차별적 발언은 금지됩니다</li>
                                    <li>• 부적절한 메시지는 신고해주세요</li>
                                    <li>• 스포츠맨십을 지켜주세요</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* 프로필 설정 다이얼로그 */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>프로필 설정</DialogTitle>
                        <DialogDescription>응원 채팅에 참여하기 위해 닉네임을 설정해주세요.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nickname">닉네임</Label>
                            <Input
                                id="nickname"
                                value={tempNickname}
                                onChange={(e) => setTempNickname(e.target.value)}
                                placeholder="사용할 닉네임을 입력하세요"
                            />
                        </div>
                        <div>
                            <Label htmlFor="team">소속 팀</Label>
                            <select
                                id="team"
                                value={tempTeam}
                                onChange={(e) => setTempTeam(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">팀을 선택하세요 (선택 사항)</option>
                                {allTeams.map((team) => (
                                    <option key={team.name} value={team.name}>
                                        {team.logo} {team.name} ({team.englishName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveProfile} disabled={!tempNickname.trim()}>
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
