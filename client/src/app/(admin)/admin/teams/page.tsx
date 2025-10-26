"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Plus, Edit, Trash2, Users, Trophy, Award } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToastContext } from "@/components/providers/toast-provider"
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth"
import { COLLEGES } from "@/lib/data"
import type { CollegeType } from "@/lib/types"

// 확장된 팀 정보 타입
interface ExtendedTeam {
    id: number
    name: string
    englishName: string
    logo: string
    college: CollegeType
    sport: string
    captain: string
    members: number
    record: string
    specialty: string
    contact: {
        phone: string
        email: string
        location: string
    }
    achievements: string[]
    description: string
    createdYear: number // Add this field
}

// 모의 팀 데이터
const mockTeams: ExtendedTeam[] = [
    {
        id: 1,
        name: "슈팅스타즈",
        englishName: "Shooting Stars",
        logo: "⭐",
        college: "공과대학",
        sport: "축구",
        captain: "김철수",
        members: 18,
        record: "15승 2무 3패",
        specialty: "강력한 공격력과 조직력",
        contact: {
            phone: "02-1234-5678",
            email: "shootingstars@engineering.ac.kr",
            location: "공과대학 학생회관 2층",
        },
        achievements: ["2023년 축구 우승", "최다 득점상", "페어플레이상"],
        description: "공과대학을 대표하는 축구팀으로, 체계적인 전술과 강력한 공격력을 바탕으로 한 경기 운영이 특징입니다.",
        createdYear: 2024,
    },
    {
        id: 2,
        name: "퀀텀점프",
        englishName: "Quantum Jump",
        logo: "🌌",
        college: "자연과학대학",
        sport: "농구",
        captain: "이과학",
        members: 12,
        record: "18승 2패",
        specialty: "차원이 다른 점프력",
        contact: {
            phone: "02-1234-5680",
            email: "quantumjump@science.ac.kr",
            location: "자연과학대학 학생회실",
        },
        achievements: ["2023년 농구 우승", "MVP 2명 배출", "최우수 팀워크상"],
        description: "과학적 분석과 데이터를 바탕으로 한 전략적 농구를 구사하는 자연과학대학의 대표팀입니다.",
        createdYear: 2024,
    },
    {
        id: 3,
        name: "하트비트",
        englishName: "Heartbeat",
        logo: "💓",
        college: "간호대학",
        sport: "배구",
        captain: "박케어",
        members: 14,
        record: "16승 4패",
        specialty: "심장 뛰는 랠리",
        contact: {
            phone: "02-1234-5679",
            email: "heartbeat@nursing.ac.kr",
            location: "간호대학 학생라운지",
        },
        achievements: ["2023년 배구 준우승", "최우수 세터상", "신인상"],
        description: "케어 정신과 팀워크를 바탕으로 한 간호대학의 강력한 배구팀입니다.",
        createdYear: 2024,
    },
    {
        id: 4,
        name: "레거시",
        englishName: "Legacy",
        logo: "🏛️",
        college: "인문대학",
        sport: "축구",
        captain: "최문학",
        members: 16,
        record: "12승 3무 5패",
        specialty: "전통과 혁신의 조화",
        contact: {
            phone: "02-1234-5681",
            email: "legacy@humanities.ac.kr",
            location: "인문대학 학생회실",
        },
        achievements: ["2022년 축구 3위", "베스트 일레븐"],
        description: "인문대학의 전통 있는 축구팀으로 오랜 역사를 자랑합니다.",
        createdYear: 2023,
    },
    {
        id: 5,
        name: "비즈니스킹",
        englishName: "Business King",
        logo: "👑",
        college: "경영대학",
        sport: "농구",
        captain: "박경영",
        members: 13,
        record: "14승 6패",
        specialty: "전략적 게임 운영",
        contact: {
            phone: "02-1234-5682",
            email: "businessking@business.ac.kr",
            location: "경영대학 학생라운지",
        },
        achievements: ["2022년 농구 준우승", "최우수 감독상"],
        description: "경영대학의 대표 농구팀으로 전략적 사고를 바탕으로 한 게임 운영이 특징입니다.",
        createdYear: 2023,
    },
]

export default function AdminTeamsPage() {
    const { checkPermission, admin } = useAdminAuth()
    const { success } = useToastContext()
    const [teams, setTeams] = useState<ExtendedTeam[]>(mockTeams)
    const [selectedTeam, setSelectedTeam] = useState<ExtendedTeam | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCollege, setSelectedCollege] = useState<string>("전체")
    const [selectedSport, setSelectedSport] = useState<string>("전체")
    const [searchTerm, setSearchTerm] = useState("")
    // Add selectedYear state
    const [selectedYear, setSelectedYear] = useState<string>("전체")

    // 권한 확인
    if (!checkPermission(ADMIN_PERMISSIONS.MANAGE_TEAMS)) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
                    <p className="text-gray-600">팀 관리 권한이 필요합니다.</p>
                </div>
            </AdminLayout>
        )
    }

    const handleAddTeam = () => {
        setSelectedTeam(null)
        setIsDialogOpen(true)
    }

    const handleEditTeam = (team: ExtendedTeam) => {
        // 팀 관리자는 자신의 단과대학 팀만 수정 가능
        if (admin?.role === "team" && admin.college !== team.college) {
            return
        }
        setSelectedTeam(team)
        setIsDialogOpen(true)
    }

    const handleDeleteTeam = (teamId: number) => {
        const team = teams.find((t) => t.id === teamId)
        if (team && admin?.role === "team" && admin.college !== team.college) {
            return
        }
        setTeams(teams.filter((t) => t.id !== teamId))
        success("팀이 삭제되었습니다.")
    }

    const handleSaveTeam = (teamData: Partial<ExtendedTeam>) => {
        if (selectedTeam) {
            // 수정
            setTeams(teams.map((t) => (t.id === selectedTeam.id ? { ...t, ...teamData } : t)))
            success("팀 정보가 수정되었습니다.")
        } else {
            // 추가
            const newTeam: ExtendedTeam = {
                id: Math.max(...teams.map((t) => t.id)) + 1,
                name: "",
                englishName: "",
                logo: "⚽",
                college: "공과대학",
                sport: "축구",
                captain: "",
                members: 0,
                record: "0승 0패",
                specialty: "",
                contact: {
                    phone: "",
                    email: "",
                    location: "",
                },
                achievements: [],
                description: "",
                createdYear: new Date().getFullYear(),
                ...teamData,
            }
            setTeams([...teams, newTeam])
            success("새 팀이 등록되었습니다.")
        }
        setIsDialogOpen(false)
    }

    // Update filtering logic to include year
    const filteredTeams = teams.filter((team) => {
        const matchesCollege = selectedCollege === "전체" || team.college === selectedCollege
        const matchesSport = selectedSport === "전체" || team.sport === selectedSport
        const matchesYear = selectedYear === "전체" || team.createdYear.toString() === selectedYear
        const matchesSearch =
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.captain.toLowerCase().includes(searchTerm.toLowerCase())

        // 팀 관리자는 자신의 단과대학 팀만 볼 수 있음
        const hasAccess = admin?.role !== "team" || admin.college === team.college

        return matchesCollege && matchesSport && matchesYear && matchesSearch && hasAccess
    })

    // Update statistics to use filtered data
    const totalMembers = filteredTeams.reduce((sum, team) => sum + team.members, 0)
    const sportsCount = new Set(filteredTeams.map((team) => team.sport)).size
    const collegesCount = new Set(filteredTeams.map((team) => team.college)).size

    // Get available years for the dropdown
    const availableYears = [...new Set(teams.map((team) => team.createdYear))].sort((a, b) => b - a)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
                        <p className="text-gray-600 mt-2">
                            {admin?.role === "team" ? `${admin.college} 팀을 관리합니다` : "모든 팀을 관리합니다"}
                        </p>
                    </div>
                    <Button onClick={handleAddTeam}>
                        <Plus className="h-4 w-4 mr-2" />팀 추가
                    </Button>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">총 팀 수</p>
                                    <p className="text-2xl font-bold">{filteredTeams.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">총 선수</p>
                                    <p className="text-2xl font-bold">{totalMembers}</p>
                                </div>
                                <Trophy className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">참여 종목</p>
                                    <p className="text-2xl font-bold">{sportsCount}</p>
                                </div>
                                <Award className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">참여 단과대학</p>
                  <p className="text-2xl font-bold">{collegesCount}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card> */}
                </div>

                {/* 검색 및 필터 */}
                <Card>
                    <CardContent className="p-4">
                        {/* Add year selector in the search/filter section */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="팀명, 주장명으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-full md:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="전체">전체 년도</SelectItem>
                                    {availableYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}년
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {admin?.role !== "team" && (
                                <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="전체">전체 팀</SelectItem>
                                        {Object.entries(COLLEGES).map(([key, college]) => (
                                            <SelectItem key={key} value={key}>
                                                {college.logo} {college.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={selectedSport} onValueChange={setSelectedSport}>
                                <SelectTrigger className="w-full md:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="전체">전체 종목</SelectItem>
                                    <SelectItem value="축구">축구</SelectItem>
                                    <SelectItem value="농구">농구</SelectItem>
                                    <SelectItem value="배구">배구</SelectItem>
                                    <SelectItem value="야구">야구</SelectItem>
                                    <SelectItem value="테니스">테니스</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 팀 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {filteredTeams.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        filteredTeams.map((team) => (
                            <Card key={team.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-3xl">{team.logo}</div>
                                            <div>
                                                <CardTitle className="text-lg">{team.name}</CardTitle>
                                                <CardDescription>{team.englishName}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* <Badge className={COLLEGES[team.college].color}>
                        {COLLEGES[team.college].logo} {COLLEGES[team.college].name}
                      </Badge> */}
                                            <Badge variant="outline">{team.sport}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">주장:</span>
                                            <div className="font-medium">{team.captain}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">팀원 수:</span>
                                            <div className="font-medium">{team.members}명</div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">시즌 기록:</span>
                                            <div className="font-medium">{team.record}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">팀 특징:</span>
                                            <div className="font-medium text-blue-600">{team.specialty}</div>
                                        </div>
                                    </div>

                                    {team.achievements.length > 0 && (
                                        <div>
                                            <span className="text-gray-600 text-sm">주요 성과:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {team.achievements.slice(0, 2).map((achievement, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {achievement}
                                                    </Badge>
                                                ))}
                                                {team.achievements.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{team.achievements.length - 2}개 더
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditTeam(team)}
                                            disabled={admin?.role === "team" && admin.college !== team.college}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            수정
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 bg-transparent"
                                            onClick={() => handleDeleteTeam(team.id)}
                                            disabled={admin?.role === "team" && admin.college !== team.college}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            삭제
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* 팀 추가/수정 다이얼로그 */}
                <TeamDialog team={selectedTeam} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveTeam} />
            </div>
        </AdminLayout>
    )
}

// 팀 추가/수정 다이얼로그
function TeamDialog({
    team,
    open,
    onOpenChange,
    onSave,
}: {
    team: ExtendedTeam | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: Partial<ExtendedTeam>) => void
}) {
    const { admin } = useAdminAuth()
    const [formData, setFormData] = useState<Partial<ExtendedTeam>>({
        name: "",
        englishName: "",
        logo: "⚽",
        sport: "축구",
        captain: "",
        members: 0,
        record: "0승 0패",
        specialty: "",
        contact: {
            phone: "",
            email: "",
            location: "",
        },
        achievements: [],
        description: "",
        // In the TeamDialog component, add createdYear to formData initialization
        createdYear: new Date().getFullYear(),
    })

    // 다이얼로그가 열릴 때 폼 데이터 초기화
    useState(() => {
        if (open) {
            if (team) {
                setFormData(team)
            } else {
                setFormData({
                    name: "",
                    englishName: "",
                    logo: "⚽",
                    sport: "축구",
                    captain: "",
                    members: 0,
                    record: "0승 0패",
                    specialty: "",
                    contact: {
                        phone: "",
                        email: "",
                        location: "",
                    },
                    achievements: [],
                    description: "",
                    createdYear: new Date().getFullYear(),
                })
            }
        }
    })

    const handleSave = () => {
        if (!formData.name?.trim() || !formData.captain?.trim()) {
            return
        }
        onSave(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{team ? "팀 정보 수정" : "새 팀 추가"}</DialogTitle>
                    <DialogDescription>팀 정보를 입력하세요</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">기본 정보</TabsTrigger>
                        <TabsTrigger value="contact">연락처</TabsTrigger>
                        <TabsTrigger value="details">상세 정보</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>팀명</Label>
                                <Input
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="팀명을 입력하세요"
                                />
                            </div>
                            <div>
                                <Label>영문명</Label>
                                <Input
                                    value={formData.englishName || ""}
                                    onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                                    placeholder="영문 팀명"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>로고</Label>
                                <Input
                                    value={formData.logo || ""}
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="🏆"
                                />
                            </div>
                            <div>
                                <Label>단과대학</Label>
                                <Select
                                    value={formData.college}
                                    onValueChange={(value) => setFormData({ ...formData, college: value as CollegeType })}
                                    disabled={admin?.role === "team"}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(COLLEGES).map(([key, college]) => (
                                            <SelectItem key={key} value={key}>
                                                {college.logo} {college.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>종목</Label>
                                <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="축구">축구</SelectItem>
                                        <SelectItem value="농구">농구</SelectItem>
                                        <SelectItem value="배구">배구</SelectItem>
                                        <SelectItem value="야구">야구</SelectItem>
                                        <SelectItem value="테니스">테니스</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>주장</Label>
                                <Input
                                    value={formData.captain || ""}
                                    onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
                                    placeholder="주장 이름"
                                />
                            </div>
                            <div>
                                <Label>팀원 수</Label>
                                <Input
                                    type="number"
                                    value={formData.members || 0}
                                    onChange={(e) => setFormData({ ...formData, members: Number.parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label>시즌 기록</Label>
                                <Input
                                    value={formData.record || ""}
                                    onChange={(e) => setFormData({ ...formData, record: e.target.value })}
                                    placeholder="0승 0패"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>팀 특징</Label>
                            <Input
                                value={formData.specialty || ""}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                placeholder="팀의 특징을 입력하세요"
                            />
                        </div>
                        {/* Add createdYear field in the basic info tab */}
                        <div>
                            <Label>등록 년도</Label>
                            <Select
                                value={formData.createdYear?.toString() || new Date().getFullYear().toString()}
                                onValueChange={(value) => setFormData({ ...formData, createdYear: Number.parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}년
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-4">
                        <div>
                            <Label>전화번호</Label>
                            <Input
                                value={formData.contact?.phone || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: { ...formData.contact!, phone: e.target.value },
                                    })
                                }
                                placeholder="02-1234-5678"
                            />
                        </div>
                        <div>
                            <Label>이메일</Label>
                            <Input
                                type="email"
                                value={formData.contact?.email || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: { ...formData.contact!, email: e.target.value },
                                    })
                                }
                                placeholder="team@university.ac.kr"
                            />
                        </div>
                        <div>
                            <Label>위치</Label>
                            <Input
                                value={formData.contact?.location || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact: { ...formData.contact!, location: e.target.value },
                                    })
                                }
                                placeholder="학생회관 2층"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <div>
                            <Label>팀 소개</Label>
                            <Textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="팀에 대한 자세한 소개를 입력하세요"
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label>주요 성과 (쉼표로 구분)</Label>
                            <Textarea
                                value={formData.achievements?.join(", ") || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        achievements: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter((s) => s),
                                    })
                                }
                                placeholder="2023년 우승, MVP 배출, 페어플레이상"
                                rows={3}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name?.trim() || !formData.captain?.trim()}>
                        {team ? "수정" : "추가"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
