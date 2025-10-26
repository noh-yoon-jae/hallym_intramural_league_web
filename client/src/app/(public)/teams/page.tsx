"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Users, ShieldQuestion } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TeamWithMembers, Sports, SportType } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { SPORTS_CONFIG } from "@/lib/data"

// 스포츠 종목별 팀 데이터 (MOCK DATA)
// const SPORTS_TEAMS: Record<string, any> = {
//     축구: {
//         name: "축구",
//         icon: "⚽",
//         teams: [
//             {
//                 name: "슈팅스타즈",
//                 englishName: "Shooting Stars",
//                 logo: "⭐",
//                 color: "bg-yellow-100 text-yellow-800",
//                 captain: "김철수",
//                 members: 18,
//                 record: "15승 2무 3패",
//                 specialty: "강력한 공격력과 조직력",
//                 team_members: [
//                     { name: "최강민", studentId: "2104001", position: "주장, 가드" },
//                     { name: "박서진", studentId: "2104002", position: "포워드" },
//                     { name: "이도현", studentId: "2104003", position: "센터" },
//                     { name: "정우진", studentId: "2104004", position: "가드" },
//                     { name: "김윤호", studentId: "2104005", position: "포워드" },
//                 ],
//             },
//         ],
//     },
// }

export default function TeamsPage() {
    const [teams] = useLocalStorage<TeamWithMembers[]>("table_data_teams", [])
    const [sports] = useLocalStorage<Sports[]>("table_data_sports", [])
    const [selectedSport, setSelectedSport] = useState<string>("")

    const sportTeams = useMemo(() => {
        const map: Record<string, { name: string; icon: string; teams: TeamWithMembers[] }> = {}
        sports.forEach((sp) => {
            const icon = SPORTS_CONFIG[sp.name as SportType]?.icon || ""
            map[sp.name] = {
                name: sp.name,
                icon,
                teams: teams.filter((t) => (t as any).sport === sp.name || (t as any).sport_name === sp.name),
            }
        })
        return map
    }, [sports, teams])

    const sportsWithTeams = Object.keys(sportTeams).filter(
        (sportKey) => sportTeams[sportKey].teams && sportTeams[sportKey].teams.length > 0,
    )

    useEffect(() => {
        if (!selectedSport && sportsWithTeams.length > 0) {
            setSelectedSport(sportsWithTeams[0])
        } else if (selectedSport && !sportsWithTeams.includes(selectedSport) && sportsWithTeams.length > 0) {
            setSelectedSport(sportsWithTeams[0])
        }
    }, [sportsWithTeams, selectedSport])

    const selectedSportData = sportTeams[selectedSport] || { name: selectedSport, icon: "", teams: [] }

    // 데이터가 전혀 없는지 확인
    const isDataEmpty = sportsWithTeams.length === 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                            동아리별 팀 소개
                        </span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        우리 학교를 대표하는 다양한 종목의 팀들을 만나보세요.
                    </p>
                </div>

                {isDataEmpty ? (
                    <Card>
                        <CardContent className="p-10 text-center text-gray-500">
                            <ShieldQuestion className="h-16 w-16 mx-auto mb-4 opacity-40" />
                            <h3 className="text-xl font-semibold text-gray-700">등록된 팀 정보 없음</h3>
                            <p className="mt-2">현재 등록된 팀 정보가 없습니다. 곧 업데이트될 예정입니다.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 사이드바: 스포츠 선택 */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>종목 선택</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={selectedSport} onValueChange={setSelectedSport}>
                                        {sportsWithTeams.map((sportKey) => {
                                            const sportInfo = sportTeams[sportKey]
                                            return (
                                                <div key={sportKey} className="flex items-center space-x-2 py-2">
                                                    <RadioGroupItem value={sportKey} id={sportKey} />
                                                    <Label htmlFor={sportKey} className="flex items-center cursor-pointer">
                                                        <span className="mr-2">{sportInfo.icon}</span>
                                                        <span>{sportInfo.name}</span>
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 메인 콘텐츠: 팀 목록 */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center text-2xl">
                                        <span className="mr-3">{selectedSportData.icon}</span>
                                        {selectedSportData.name} 팀 목록
                                    </CardTitle>
                                    <CardDescription>{selectedSportData.name} 종목에 소속된 팀들입니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {selectedSportData.teams && selectedSportData.teams.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedSportData.teams.map((team: TeamWithMembers, index: number) => (
                                                <Card
                                                    key={`${team.name}-${index}`}
                                                    className="flex flex-col bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border group hover:-translate-y-1"
                                                >
                                                    <CardHeader className="p-4 bg-gray-50 border-b">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="text-4xl">{team.logo}</div>
                                                                <div>
                                                                    <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                                                                    <CardDescription>{team.englishName}</CardDescription>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 flex-grow space-y-4">
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="bg-gray-50 p-2 rounded-md">
                                                                <p className="text-gray-500">주장</p>
                                                                <p className="font-semibold text-gray-800">{team.captain}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-2 rounded-md">
                                                                <p className="text-gray-500">시즌 기록</p>
                                                                <p className="font-semibold text-gray-800">{team.record}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-blue-800 p-3 bg-blue-50 rounded-md border border-blue-100">
                                                            <p className="font-semibold">팀 특징</p>
                                                            <p>{team.specialty}</p>
                                                        </div>
                                                    </CardContent>
                                                    {team.team_members && team.team_members.length > 0 && (
                                                        <CardFooter>
                                                            <Accordion type="single" collapsible className="w-full">
                                                                <AccordionItem value="members">
                                                                    <AccordionTrigger className="hover:no-underline text-sm font-medium text-gray-600 hover:text-blue-600">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Users className="h-4 w-4" />
                                                                            <span>선수 명단 보기 ({team.team_members.length}명)</span>
                                                                        </div>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <ul className="space-y-2 pt-2">
                                                                            {team.team_members.map((member) => (
                                                                                <li
                                                                                    key={member.studentId}
                                                                                    className="p-2 bg-gray-50 rounded-md flex justify-between items-center"
                                                                                >
                                                                                    <div>
                                                                                        <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                                                                                        <p className="text-xs text-gray-500">학번: {member.studentId}</p>
                                                                                    </div>
                                                                                    <Badge variant="outline" className="font-mono text-xs">
                                                                                        {member.position}
                                                                                    </Badge>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        </CardFooter>
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-gray-500">
                                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-semibold">팀 정보가 없습니다</p>
                                            <p className="text-sm">현재 이 종목에 등록된 팀이 없습니다.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}