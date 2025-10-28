"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Check, Trash2, UserPlus, Eye, Heart, Megaphone, Clock, Users } from "lucide-react"

const initialNotifications = [
  {
    id: 1,
    title: "잇다 알림",
    content: "인플루언서가 캠페인에 지원했어요. 지금 확인해보세요!",
    type: "application",
    campaignTitle: "2025 봄 신상품 홍보 캠페인", // Campaign title for application notifications
  },
  {
    id: 2,
    title: "잇다 알림",
    content: "광고주가 인플루언서님의 지원서를 봤어요. 기대해보셔도 좋아요!",
    type: "viewed",
  },
  {
    id: 3,
    title: "잇다 알림",
    content: "인플루언서님의 프로필을 찜한 광고주가 있어요. 곧 좋은 제안이 올 수도 있어요!",
    type: "favorite",
  },
  {
    id: 4,
    title: "잇다 알림",
    content: "새 캠페인 공고가 올라왔어요. 지금 확인해보세요!",
    type: "campaign",
  },
  {
    id: 5,
    title: "잇다 알림",
    content: "지원하신 캠페인이 마감되었어요. 다른 캠페인에서 인플루언서님을 기다리고 있어요.",
    type: "closed",
  },
  {
    id: 6,
    title: "잇다 알림",
    content: "인플루언서님을 기다리는 캠페인이 생겼어요. 바로 확인해보세요!",
    type: "waiting",
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "application":
      return <UserPlus className="w-4 h-4 text-white stroke-[2.5]" />
    case "viewed":
      return <Eye className="w-4 h-4 text-white stroke-[2.5]" />
    case "favorite":
      return <Heart className="w-4 h-4 text-white stroke-[2.5]" />
    case "campaign":
      return <Megaphone className="w-4 h-4 text-white stroke-[2.5]" />
    case "closed":
      return <Clock className="w-4 h-4 text-white stroke-[2.5]" />
    case "waiting":
      return <Users className="w-4 h-4 text-white stroke-[2.5]" />
    default:
      return <Check className="w-4 h-4 text-white stroke-[2.5]" />
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "new">("activity")
  const [notifications, setNotifications] = useState(initialNotifications)
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const router = useRouter()

  const handleSwipeDelete = (notificationId: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const handleNotificationClick = (notificationId: number) => {
    // TODO: Navigate to specific pages based on notification type
    console.log(`Clicked notification ${notificationId}`)
    // router.push('/some-related-page')
  }

  const handleDeleteAll = () => {
    if (activeTab === "activity" && notifications.length > 0) {
      const allIds = notifications.map((n) => n.id)
      setDeletingIds(allIds)

      setTimeout(() => {
        setNotifications([])
        setDeletingIds([])
      }, 300) // Animation duration
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200" style={{ height: "var(--gnb-height)" }}>
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 cursor-pointer">
              <ChevronLeft className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">뒤로 가기</span>
            </button>
          </div>
          <button
            onClick={handleDeleteAll}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={activeTab === "new" || notifications.length === 0}
          >
            <Trash2
              className={`h-5 w-5 ${
                activeTab === "new" || notifications.length === 0 ? "text-gray-300" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
        </div>
      </header>

      <div className="sticky z-30 bg-white border-b border-border" style={{ top: "var(--gnb-height)" }}>
        <div className="flex h-12">
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 text-sm font-medium relative flex items-center justify-center ${
              activeTab === "activity" ? "text-[#7b68ee]" : "text-gray-500"
            }`}
          >
            활동
            {activeTab === "activity" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b68ee] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 text-sm font-medium relative flex items-center justify-center ${
              activeTab === "new" ? "text-[#7b68ee]" : "text-gray-500"
            }`}
          >
            새글
            {activeTab === "new" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7b68ee] rounded-full" />
            )}
          </button>
        </div>
      </div>

      <main className="px-2 py-6 space-y-4">
        {activeTab === "activity" && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-600">새로운 알림이 없습니다</h3>
                  <p className="text-sm text-gray-500">새로운 소식이 있으면 알려드릴게요!</p>
                </div>
              </div>
            ) : (
              notifications.map((notification) => (
                <SwipeableNotificationCard
                  key={notification.id}
                  notification={notification}
                  onSwipeDelete={handleSwipeDelete}
                  onClick={handleNotificationClick}
                  isDeleting={deletingIds.includes(notification.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "new" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-600">새로운 알림이 없습니다</h3>
              <p className="text-sm text-gray-500">새로운 소식이 있으면 알려드릴게요!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SwipeableNotificationCard({
  notification,
  onSwipeDelete,
  onClick,
  isDeleting = false,
}: {
  notification: { id: number; title: string; content: string; type: string; campaignTitle?: string }
  onSwipeDelete: (id: number) => void
  onClick: (id: number) => void
  isDeleting?: boolean
}) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - startX
    setCurrentX(deltaX)

    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px)`
      cardRef.current.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (Math.abs(currentX) > 100) {
      onSwipeDelete(notification.id)
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = "translateX(0px)"
        cardRef.current.style.opacity = "1"
      }
    }

    setCurrentX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    setCurrentX(deltaX)

    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px)`
      cardRef.current.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (Math.abs(currentX) > 100) {
      onSwipeDelete(notification.id)
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = "translateX(0px)"
        cardRef.current.style.opacity = "1"
      }
    }

    setCurrentX(0)
  }

  const handleClick = () => {
    if (!isDragging && Math.abs(currentX) < 10) {
      onClick(notification.id)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`bg-white cursor-pointer select-none transition-all duration-300 py-3 px-4 border-b border-gray-200 ${
        isDeleting ? "opacity-0 transform scale-95 translate-x-full" : "opacity-100 transform scale-100 translate-x-0"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="w-5 h-5 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
          {" "}
          {/* Updated brand color */}
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-sm text-gray-500">{notification.title}</h3>
          <p
            className="text-sm text-black leading-relaxed w-full"
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            {notification.content}
          </p>
          {notification.campaignTitle && (
            <p className="text-xs text-gray-400 leading-relaxed w-full mt-1">{notification.campaignTitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
