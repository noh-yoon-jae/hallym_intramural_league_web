"use client"

import { cn } from "@/lib/utils"
import { SPORTS_CONFIG } from "@/lib/data"
import type { SportType } from "@/lib/types"

interface SportTabsProps {
  sports: SportType[]
  selectedSport: SportType
  onSportChange: (sport: SportType) => void
  className?: string
}

export function SportTabs({ sports, selectedSport, onSportChange, className }: SportTabsProps) {
  return (
    <div className={cn("flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto", className)}>
      {sports.map((sport) => (
        <button
          key={sport}
          onClick={() => onSportChange(sport)}
          className={cn(
            "flex-shrink-0 py-2 px-3 rounded-md text-sm font-medium transition-colors",
            selectedSport === sport ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900",
          )}
        >
          {SPORTS_CONFIG[sport]?.icon ?? ""} {SPORTS_CONFIG[sport]?.name ?? sport}
        </button>
      ))}
    </div>
  )
}
