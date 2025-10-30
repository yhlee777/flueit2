"use client"

import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Search, X, Archive, CheckCheck, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FilterType = "all" | "unread" | "active"

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  // API에서 가져온 데이터
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // 초기 설정 및 데이터 로드
  useEffect(() => {
    if (status === "loading") return
    
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    if (session?.user?.id) {
      loadChats()
    }
  }, [session, status, router])

  // ✅ 실시간 구독 (Supabase Realtime)
  useEffect(() => {
    if (!session?.user?.id) return

    console.log('📡 [ChatList] Setting up realtime subscription')

    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 [Realtime] New message in system:', payload.new)
          // 새 메시지가 있으면 채팅 목록 새로고침
          loadChats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          console.log('🔔 [Realtime] Chat updated:', payload.new)
          // 채팅 업데이트 시 새로고침
          loadChats()
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime] ChatList subscription status:', status)
      })

    return () => {
      console.log('📡 [ChatList] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id])

  // API로 채팅 목록 로드
  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chat/list')
      
      if (!response.ok) {
        throw new Error('Failed to load chats')
      }

      const data = await response.json()
      setChats(data.chats || [])
      
      // 안읽은 개수 계산
      const unread = (data.chats || []).reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0)
      setUnreadCount(unread)
      
    } catch (error) {
      console.error('채팅 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 표시할 채팅 목록 (검색 + 필터)
  const displayChats = useMemo(() => {
    let filtered = chats

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((chat) => {
        const otherUserName = isInfluencerMode ? chat.advertiser_name : chat.influencer_name
        return (
          otherUserName?.toLowerCase().includes(query) ||
          chat.campaign_title?.toLowerCase().includes(query) ||
          chat.last_message?.toLowerCase().includes(query)
        )
      })
    }

    // 필터 적용
    switch (activeFilter) {
      case "unread":
        return filtered.filter((chat) => chat.unread_count > 0)
      case "active":
        return filtered.filter((chat) => chat.is_active_collaboration)
      default:
        return filtered
    }
  }, [chats, searchQuery, activeFilter, isInfluencerMode])

  // 통계
  const activeCollaborationCount = chats.filter((chat) => chat.is_active_collaboration).length

  // 채팅 삭제
  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm("채팅을 삭제하시겠습니까?")) {
      // TODO: 삭제 API 구현
      alert("삭제 기능은 곧 구현됩니다")
    }
  }

  // 채팅 보관
  const handleArchiveChat = async (chatId: number, e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: 보관 API 구현
    alert("보관 기능은 곧 구현됩니다")
  }

  // 모두 읽음 처리
  const handleMarkAllAsRead = async () => {
    // TODO: 읽음 처리 API 구현
    alert("읽음 처리 기능은 곧 구현됩니다")
  }

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    if (!timestamp) return ""
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 로딩 중
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopHeader title="채팅" showNotifications={true} showHeart={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <RefreshCw className="h-8 w-8 text-[#7b68ee] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <TopHeader title="채팅" showNotifications={true} showHeart={false} />

      <main className="pt-0 pb-20">
        <div className="max-w-2xl mx-auto">
          {/* 검색 바 */}
          <div className="px-4 pt-3 pb-2">
            {showSearch ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="채팅 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-10 rounded-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {activeFilter === "all"
                      ? "전체 채팅"
                      : activeFilter === "unread"
                        ? "안읽은 메시지"
                        : "진행중인 협업"}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearch(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-8 px-2 text-xs"
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      모두 읽음
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadChats}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 필터 버튼 */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                onClick={() => setActiveFilter("all")}
                className={`rounded-full whitespace-nowrap h-9 px-4 flex-shrink-0 ${
                  activeFilter === "all"
                    ? "bg-[#7b68ee] text-white border-[#7b68ee] hover:bg-[#7b68ee]/90"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                전체
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveFilter("unread")}
                className={`rounded-full whitespace-nowrap h-9 px-4 flex-shrink-0 ${
                  activeFilter === "unread"
                    ? "bg-[#7b68ee] text-white border-[#7b68ee] hover:bg-[#7b68ee]/90"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                안읽음
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={`ml-1.5 ${
                      activeFilter === "unread"
                        ? "bg-white/20 text-white"
                        : "bg-[#7b68ee] text-white"
                    }`}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveFilter("active")}
                className={`rounded-full whitespace-nowrap h-9 px-4 flex-shrink-0 ${
                  activeFilter === "active"
                    ? "bg-[#7b68ee] text-white border-[#7b68ee] hover:bg-[#7b68ee]/90"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                진행중인 협업
                {activeCollaborationCount > 0 && (
                  <Badge
                    variant="secondary"
                    className={`ml-1.5 ${
                      activeFilter === "active"
                        ? "bg-white/20 text-white"
                        : "bg-[#7b68ee] text-white"
                    }`}
                  >
                    {activeCollaborationCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* 채팅 목록 */}
          <div className="pt-2">
            {displayChats.length > 0 ? (
              <div>
                {displayChats.map((chat, index) => {
                  const otherUserName = isInfluencerMode
                    ? chat.advertiser_name
                    : chat.influencer_name
                  const otherUserAvatar = isInfluencerMode
                    ? chat.advertiser_avatar
                    : chat.influencer_avatar

                  const hasUnread = chat.unread_count > 0

                  return (
                    <div key={chat.id}>
                      {index > 0 && (
                        <div className="mx-4 my-0 border-b border-black/5"></div>
                      )}
                      <Link
                        href={`/chat/${chat.id}`}
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          {/* 아바타 */}
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={otherUserAvatar || undefined}
                                alt={otherUserName}
                              />
                              <AvatarFallback>{otherUserName?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            {chat.is_active_collaboration && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>

                          {/* 채팅 내용 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[#111] truncate">
                                  {otherUserName}
                                </h3>
                                {chat.is_active_collaboration && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    진행중
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-[#999] flex-shrink-0">
                                {formatTime(chat.updated_at)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <p
                                className={`text-sm ${
                                  hasUnread
                                    ? "font-medium text-[#666]"
                                    : "text-[#999]"
                                } truncate pr-2 flex-1`}
                              >
                                {chat.last_message || "아직 메시지가 없습니다"}
                              </p>
                              {hasUnread && (
                                <div className="w-2 h-2 bg-[#7b68ee] rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>

                          {/* 더보기 메뉴 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 flex-shrink-0"
                                onClick={(e) => e.preventDefault()}
                              >
                                <MoreVertical className="w-4 h-4 text-[#666]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleMarkAllAsRead()
                                }}
                              >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                읽음 처리
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleArchiveChat(chat.id, e)}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                보관하기
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                삭제하기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-[#111] mb-2">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : activeFilter === "unread"
                      ? "안읽은 채팅이 없어요"
                      : activeFilter === "active"
                        ? "진행중인 협업 채팅이 없어요"
                        : "채팅이 없어요"}
                </h3>
                <p className="text-[#666] text-sm">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : activeFilter === "unread"
                      ? "모든 메시지를 확인했습니다"
                      : activeFilter === "active"
                        ? "현재 진행중인 협업이 없습니다"
                        : isInfluencerMode
                          ? "캠페인에 지원하거나 광고주의 제안을 기다려보세요"
                          : "인플루언서와 대화를 시작해보세요"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}