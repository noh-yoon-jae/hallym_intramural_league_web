"use client"

import { Badge } from "@/components/ui/badge"
import type { Notice } from "@/lib/types"

interface NoticeCardProps {
  notice: Notice
  className?: string
}

export function NoticeCard({ notice, className }: NoticeCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${className}`}
    >
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          {notice.important && (
            <Badge variant="destructive" className="text-xs">
              중요
            </Badge>
          )}
          {notice.category && (
            <Badge variant="outline" className="text-xs">
              {notice.category}
            </Badge>
          )}
        </div>
        <h4 className="font-medium text-sm mb-1 line-clamp-1">{notice.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{notice.content}</p>
        <div className="flex items-center justify-between mt-2">
          {notice.author && (
            <span className="text-xs text-gray-500">{notice.author}</span>
          )}
          <span className="text-xs text-gray-500">{notice.date}</span>
        </div>
      </div>
    </div>
  )
}
