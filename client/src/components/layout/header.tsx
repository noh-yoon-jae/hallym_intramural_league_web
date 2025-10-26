"use client"

import { Trophy, User, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatSessionExpiry } from "@/lib/auth-storage"

const navigation = [
    { name: "홈", href: "/" },
    { name: "경기일정", href: "/schedule" },
    { name: "순위", href: "/rankings" },
    { name: "팀소개", href: "/teams" },
    { name: "응원톡", href: "/cheer" },
    { name: "공지사항", href: "/notices" },
]

export function Header() {
    const pathname = usePathname()
    const { session, isLoggedIn, logout } = useAuth()
    const { success } = useToastContext()

    const handleLogout = () => {
        logout()
        success("로그아웃이 완료되었습니다.", {
            title: "로그아웃 성공",
            duration: 3000,
        })
    }

    const [expiryText, setExpiryText] = useState<string>("")

    useEffect(() => {
        if (!session) return

        const update = () => {
            setExpiryText(formatSessionExpiry(session.expiresAt))
        }

        update()
        const timer = setInterval(update, 60 * 1000)
        return () => clearInterval(timer)
    }, [session])

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-4">
                        <Trophy className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">우리학교 스포츠</h1>
                    </Link>

                    <nav className="flex items-center">
                        <div className="flex items-center space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "hover:text-blue-600 transition-colors",
                                        pathname === item.href ? "text-blue-600 font-medium" : "text-gray-600",
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="border-l ml-4 pl-4 flex items-center h-5">
                            {isLoggedIn && session ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2">
                                            <User className="h-4 w-4" />
                                            <span>{session.nickname || session.username}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-1.5 text-sm text-gray-600">
                                            <div className="font-medium">{session.nickname || session.username}</div>
                                            <div className="text-xs text-gray-500">{session.email}</div>
                                            {session.college && <div className="text-xs text-gray-500">{session.college}</div>}
                                        </div>
                                        <DropdownMenuSeparator />
                                        <div className="px-2 py-1.5 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <Clock className="h-3 w-3" />
                                                <span>세션 정보</span>
                                            </div>
                                            <div className="ml-4">
                                                <div>유지 기간: {session.rememberMe ? "30일" : "24시간"}</div>
                                                <div>{expiryText}</div>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            로그아웃
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link
                                    href="/login"
                                    className={cn(
                                        "hover:text-blue-600 transition-colors",
                                        pathname === "/login" ? "text-blue-600 font-medium" : "text-gray-600",
                                    )}
                                >
                                    로그인
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}
