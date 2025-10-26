import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ToastProvider } from "@/components/providers/toast-provider"
import { DataSyncProvider } from "@/components/providers/data-sync-provider"
import { Header } from "@/components/layout/header"

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
})

export const metadata: Metadata = {
    title: "우리학교 스포츠",
    description: "단과대학 스포츠 리그",
    creator: "C-AERANG",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ko">
            <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
                <ToastProvider>
                    <DataSyncProvider>
                        <Header />
                        {children}
                    </DataSyncProvider>
                </ToastProvider>
            </body>
        </html>
    )
}