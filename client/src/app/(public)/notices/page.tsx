"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Calendar, User, ChevronRight, FileText } from "lucide-react"
import { useState, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Notice } from "@/lib/types"
import Link from "next/link"

interface Category {
  id: number
  name: string
}

export default function NoticesPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const [notices] = useLocalStorage<Notice[]>("table_data_notices", [])
  const [categoryData] = useLocalStorage<Category[]>("table_data_categories", [])

  const categories = useMemo(
    () => ["전체", ...categoryData.map((c) => c.name)],
    [categoryData],
  )

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory = selectedCategory === "전체" || notice.category === selectedCategory
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage)
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredNotices.slice(start, end)
  }, [filteredNotices, currentPage])

  const importantNotices = notices.filter((notice) => notice.important)

  if (notices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
          </div>
          <Card>
            <CardContent className="p-10 text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-semibold text-gray-700">공지사항 없음</h3>
              <p className="mt-2">현재 등록된 공지사항이 없습니다. 새로운 소식을 기다려주세요.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
        </div>

        {/* 중요 공지사항 */}
        {importantNotices.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>중요 공지</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importantNotices.map((notice) => (
                  <Link href={`/notices/${notice.id}`} key={notice.id}>
                    <div
                      className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="destructive" className="text-xs">중요</Badge>
                          <Badge variant="outline" className="text-xs">{notice.category}</Badge>
                        </div>
                        <h4 className="font-semibold text-red-900 mb-1">{notice.title}</h4>
                        <p className="text-sm text-red-700 line-clamp-2">{notice.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-red-600">
                          <span>{notice.author}</span>
                          <span>{notice.date}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-600 ml-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category)
                        setCurrentPage(1) // 카테고리 바뀌면 페이지도 초기화
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === category
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {category}
                      <span className="float-right text-xs text-gray-500">
                        {category === "전체"
                          ? notices.length
                          : notices.filter((n) => n.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 통계 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{notices.length}</div>
                    <div className="text-sm text-gray-600">전체 공지</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{importantNotices.length}</div>
                    <div className="text-sm text-gray-600">중요 공지</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {
                        notices.filter((n) => {
                          const noticeDate = new Date(n.date)
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return noticeDate >= weekAgo
                        }).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">이번 주 공지</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>공지사항 목록</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="공지사항 검색..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1) // 검색 시 페이지 초기화
                      }}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <CardDescription>
                  {selectedCategory === "전체" ? "전체" : selectedCategory} 공지사항 {filteredNotices.length}개
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedNotices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>검색 결과가 없습니다.</p>
                    </div>
                  ) : (
                    paginatedNotices.map((notice) => (
                      <a href={`/notices/${notice.id}`} key={notice.id} className="block">
                        <div
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {notice.important && (
                                  <Badge variant="destructive" className="text-xs">중요</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{notice.category}</Badge>
                              </div>
                              <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                                {notice.title}
                              </h3>
                              <p className="text-gray-700 mb-3 line-clamp-2">{notice.content}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {notice.author}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {notice.date}
                                  </span>
                                </div>
                                <span>조회수 {notice.views}</span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>

                {/* 페이지네이션 */}
                {filteredNotices.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}