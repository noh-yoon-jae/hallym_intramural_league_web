"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import Link from "next/link"
import type { Notice } from "@/lib/types"

export default function NoticeDetailPage() {
    const router = useRouter()
    const [notices, setNotices] = useLocalStorage<Notice[]>("table_data_notices", [])
    const [notice, setNotice] = useState<Notice | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const { id } = useParams<{ id: string }>()

    const currentIndex = notices.findIndex((n) => String(n.id) === id)
    const prevNotice = currentIndex > 0 ? notices[currentIndex - 1] : null
    const nextNotice =
        currentIndex !== -1 && currentIndex < notices.length - 1
            ? notices[currentIndex + 1]
            : null
    
     // API 호출로 공지 상세 조회
    useEffect(() => {
        if (!id) return

        const fetchNotice = async () => {
            setIsLoading(true)
            try {
                const res = await fetch('/api/notice/detail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ notice_id: id }),
                })
                const data = await res.json()
                if (data.status && data.data) {
                    const n = data.data
                    const mapped: Notice = {
                        id: n.id,
                        title: n.title,
                        content: n.content,
                        date: n.created_at ? n.created_at.slice(0, 10) : '',
                        category: n.categories?.[0] || '',
                        important: n.important || false,
                        author: n.author || '',
                        views: n.view_count,
                    }
                    setNotice(mapped)
                    setNotices((all) =>
                        all.map((o) =>
                            o.id === mapped.id ? { ...o, views: mapped.views } : o,
                        ),
                    )
                } else {
                    setNotice(null)
                }
            } catch {
                setNotice(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchNotice()
    }, [id])

    useEffect(() => {
        if (!isLoading && !notice) {
            router.push("/notices")
        }
    }, [isLoading, notice, router])

    if (isLoading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    if (!notice) {
        return null // useEffect에서 리디렉션 처리됨
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/notices">← 목록으로</a>
                    </Button>
                </div>
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-2xl">{notice.title}</CardTitle>
                            {notice.category && (
                                <Badge variant="outline">{notice.category}</Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{notice.author}</span>
                            <span>{notice.date}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap mb-4">{notice.content}</p>
                        <div className="text-right text-sm text-gray-500">조회 {notice.views}</div>
                    </CardContent>
                </Card>
                {(prevNotice || nextNotice) && (
                    <div className="flex justify-between max-w-3xl mx-auto mt-6 text-sm">
                        {prevNotice ? (
                            <a href={`/notices/${prevNotice.id}`} className="text-blue-600 hover:underline">
                                ← 이전 글: {prevNotice.title}
                            </a>
                        ) : <span />}
                        {nextNotice && (
                            <a href={`/notices/${nextNotice.id}`} className="text-blue-600 hover:underline text-right ml-auto">
                                다음 글: {nextNotice.title} →
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}