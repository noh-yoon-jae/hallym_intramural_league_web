"use client"

import { useDataSync } from "@/hooks/use-data-sync"
import type { ReactNode } from "react"

export function DataSyncProvider({ children }: { children: ReactNode }) {
    useDataSync(["categories", "sports", "teams", "matches", "notices", "standings", "rooms"])
    return <>{children}</>
}