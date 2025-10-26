export type AdminRole = "system" | "game" | "team" | "content"

export interface AdminUser {
    username: string
    role: AdminRole
    permissions: string[]
    college?: string
    displayName: string
    email: string
}

export const ADMIN_PERMISSIONS = {
    // 시스템 관리
    MANAGE_USERS: "manage_users",
    MANAGE_ADMINS: "manage_admins",
    SYSTEM_SETTINGS: "system_settings",

    // 경기 관리
    MANAGE_GAMES: "manage_games",
    MANAGE_SCHEDULES: "manage_schedules",
    MANAGE_RESULTS: "manage_results",

    // 콘텐츠 관리
    MANAGE_NOTICES: "manage_notices",
    MANAGE_TEAMS: "manage_teams",
    MODERATE_CHEER: "moderate_cheer",

    // 팀별 관리
    MANAGE_OWN_TEAM: "manage_own_team",
    VIEW_TEAM_STATS: "view_team_stats",
} as const

export const ADMIN_ROLES: Record<AdminRole, { name: string; permissions: string[] }> = {
    system: {
        name: "시스템 관리자",
        permissions: Object.values(ADMIN_PERMISSIONS),
    },
    game: {
        name: "경기 관리자",
        permissions: [
            ADMIN_PERMISSIONS.MANAGE_GAMES,
            ADMIN_PERMISSIONS.MANAGE_SCHEDULES,
            ADMIN_PERMISSIONS.MANAGE_RESULTS,
            ADMIN_PERMISSIONS.VIEW_TEAM_STATS,
        ],
    },
    content: {
        name: "콘텐츠 관리자",
        permissions: [ADMIN_PERMISSIONS.MANAGE_NOTICES, ADMIN_PERMISSIONS.MANAGE_TEAMS, ADMIN_PERMISSIONS.MODERATE_CHEER],
    },
    team: {
        name: "팀 관리자",
        permissions: [ADMIN_PERMISSIONS.MANAGE_OWN_TEAM, ADMIN_PERMISSIONS.VIEW_TEAM_STATS],
    },
}

// 데모 관리자 계정들
export const DEMO_ADMIN_ACCOUNTS: Record<string, AdminUser> = {
    admin: {
        username: "admin",
        role: "system",
        permissions: ADMIN_ROLES.system.permissions,
        displayName: "시스템 관리자",
        email: "admin@university.ac.kr",
    },
    gameadmin: {
        username: "gameadmin",
        role: "game",
        permissions: ADMIN_ROLES.game.permissions,
        displayName: "경기 관리자",
        email: "gameadmin@university.ac.kr",
    },
    contentadmin: {
        username: "contentadmin",
        role: "content",
        permissions: ADMIN_ROLES.content.permissions,
        displayName: "콘텐츠 관리자",
        email: "contentadmin@university.ac.kr",
    },
    teamadmin: {
        username: "teamadmin",
        role: "team",
        permissions: ADMIN_ROLES.team.permissions,
        college: "공과대학",
        displayName: "공과대학 팀 관리자",
        email: "teamadmin@engineering.ac.kr",
    },
}

export const authenticateAdmin = (username: string, password: string): AdminUser | null => {
    // 데모용 간단한 인증 (실제로는 서버에서 처리)
    if (password !== "admin") return null

    return DEMO_ADMIN_ACCOUNTS[username] || null
}

export const hasPermission = (admin: AdminUser, permission: string): boolean => {
    return admin.permissions.includes(permission)
}

export const canManageCollege = (admin: AdminUser, college: string): boolean => {
    if (admin.role === "system") return true
    if (admin.role === "team" && admin.college === college) return true
    return false
}

export const getAdminSession = (): AdminUser | null => {
    try {
        const adminData = localStorage.getItem("adminSession")
        if (!adminData) return null
        return JSON.parse(adminData)
    } catch {
        return null
    }
}

export const saveAdminSession = (admin: AdminUser) => {
    localStorage.setItem("adminSession", JSON.stringify(admin))
}

export const clearAdminSession = () => {
    localStorage.removeItem("adminSession")
}
