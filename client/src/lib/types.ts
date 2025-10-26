export type SportType = "축구" | "농구" | "배구" | "야구" | "테니스" | "탁구" | "수영" | "배드민턴"

export type Sports = {
    created_at: string
    description: string | null
    id: number
    name: string
    updated_at: string
}
export type CollegeType = "공과대학" | "간호대학" | "자연과학대학" | "경영대학" | "인문대학"

export interface UserInfo {
    id: number
    username: string
    nickname?: string
    college?: CollegeType
    team?: string
    email: string
    loginTime: string
}

export interface ChatMessage {
    id: string
    sport?: SportType
    roomId?: number
    user: string
    team?: string
    message: string
    timestamp: Date
    likes?: number
    isLiked?: boolean
    likedBy?: number[]
    isReported?: boolean
}

export interface Game {
    id: number
    sport: SportType
    team1: string
    team2: string
    date: string
    time?: string
    score?: string
    winner?: string
    status?: string
    location?: string
    minute?: number
    startTime?: Date
    endTime?: Date
}

export interface Notice {
    id: number
    title: string
    content: string
    date: string
    category: string
    important: boolean
    author: string
    views?: number
}

export interface Team {
    name: string
    englishName: string
    logo: string
    color?: string
    captain?: string
    members?: number
    record?: string
    specialty?: string
    keyPlayers?: string[]
}

export interface TeamMember {
    name: string
    studentId: string
    position: string
}

export interface TeamWithMembers extends Team {
    team_members: TeamMember[]
}

export interface SportTeams {
    [key: string]: {
        name: string
        icon: string
        teams: TeamWithMembers[]
    }
}


export interface College {
    name: string
    logo: string
    color: string
    bgColor?: string
    borderColor?: string
    slogan?: string
    description?: string
    founded?: string
    contact?: {
        phone: string
        email: string
        location: string
    }
    achievements?: string[]
}

export interface RankingTeam {
    rank: number
    prevRank?: number
    team: string
    played?: number
    wins: number
    draws?: number
    losses: number
    goalsFor?: number
    goalsAgainst?: number
    goalDiff?: number
    points: number
    form?: string[]
    logo: string
}