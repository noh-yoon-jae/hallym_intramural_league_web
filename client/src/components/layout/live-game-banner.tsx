"use client"

import { Button } from "@/components/ui/button"
import { SPORTS_CONFIG } from "@/lib/data"
import type { Game } from "@/lib/types"
import Link from "next/link"

interface LiveGameBannerProps {
  game: Game
}

export function LiveGameBanner({ game }: LiveGameBannerProps) {
  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold text-lg">🔴 LIVE</span>
            </div>
            <div className="text-lg font-semibold">
              {SPORTS_CONFIG[game.sport]?.icon ?? ""} {game.sport} 경기
            </div>
            <div className="text-xl font-bold">
              {game.team1} {game.score} {game.team2}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm opacity-90">{game.location}</div>
              {game.minute && (
                <div className="font-medium">{game.minute}&apos;</div>
              )}
            </div>
            <Button variant="secondary" size="sm" className="bg-white text-red-600 hover:bg-gray-100" asChild>
              <Link href="/cheer">실시간 응원하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
