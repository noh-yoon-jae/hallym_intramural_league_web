import Link from "next/link"
import { Frown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "페이지를 찾을 수 없습니다",
}

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <Frown className="h-12 w-12 text-blue-600" />
                <h2 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h2>
                <p className="text-gray-600">요청하신 페이지가 존재하지 않습니다.</p>
            </div>
            <Button asChild>
                <Link href="/">메인 페이지로 이동</Link>
            </Button>
        </div>
    )
}