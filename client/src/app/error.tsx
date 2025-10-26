"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ServerCrash } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "오류가 발생했습니다",
}

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-6 space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <ServerCrash className="h-12 w-12 text-red-600" />
                <h2 className="text-3xl font-bold">오류가 발생했습니다</h2>
                <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
            </div>
            <Button asChild>
                <Link href="/">메인 페이지로 이동</Link>
            </Button>
        </div>
    )
}