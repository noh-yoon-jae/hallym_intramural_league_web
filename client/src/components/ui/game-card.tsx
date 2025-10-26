"use client"

import { Badge } from "@/components/ui/badge"
import { SPORTS_CONFIG } from "@/lib/data"
import type { Game } from "@/lib/types"

interface GameCardProps {
  game: Game
  showScore?: boolean
  className?: string
}

export function GameCard({ game, showScore = false, className }: GameCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="text-2xl">{SPORTS_CONFIG[game.sport]?.icon ?? ""}</div>
        <div className="flex flex-col">
          <div className="font-medium text-lg">
            {game.team1} vs {game.team2}
          </div>
          <div className="text-sm text-gray-600">{game.sport} 경기</div>
        </div>
      </div>
      <div className="flex flex-col items-end text-right">
        {showScore && game.score && (
          <>
            <div className="font-bold text-lg mb-1">{game.score}</div>
            {game.winner && (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-xs">
                  🏆 {game.winner} 승리
                </Badge>
              </div>
            )}
          </>
        )}
        {game.time && (
          <div className="text-sm text-gray-600">
            {game.date} {game.time}
          </div>
        )}
        {!game.time && <div className="text-sm text-muted-foreground">{game.date}</div>}
      </div>
    </div>
  )
}
