"use client"

import { getSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Send, CheckCircle, MoreVertical, Check, Paperclip, X, Users, BarChart3, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const chatId = parseInt(params.id)
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [chatData, setChatData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const [userType, setUserType] = useState<string>("")  // ✅ 추가
  const [isCollaborationComplete, setIsCollaborationComplete] = useState(false)
  
  // ✅ 새로운 상태
  const [showApprovalCard, setShowApprovalCard] = useState(false)
  const [hasPendingCollaborationRequest, setHasPendingCollaborationRequest] = useState(false)
  
  // ✅ Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const topCardRef = useRef<HTMLDivElement>(null)
  const approvalCardRef = useRef<HTMLDivElement>(null)

  console.log('🔍 [Chat] State:', { 
    chatId, 
    userId, 
    loading, 
    messagesCount: messages.length,
    showApprovalCard,
    hasPendingCollaborationRequest
  })

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ✅ 동적 높이 계산
  const updateTopCardHeight = () => {
    if (topCardRef.current) {
      const height = topCardRef.current.offsetHeight
      document.documentElement.style.setProperty("--topcard-h", `${height}px`)
    }
  }

  const updateApprovalCardHeight = () => {
    if (approvalCardRef.current && showApprovalCard) {
      const height = approvalCardRef.current.offsetHeight
      document.documentElement.style.setProperty("--approval-card-h", `${height}px`)
    } else {
      document.documentElement.style.setProperty("--approval-card-h", "0px")
    }
  }

  // ✅ ResizeObserver로 높이 자동 조정
  useEffect(() => {
    updateTopCardHeight()

    const resizeObserver = new ResizeObserver(updateTopCardHeight)
    if (topCardRef.current) {
      resizeObserver.observe(topCardRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    updateApprovalCardHeight()

    if (showApprovalCard && approvalCardRef.current) {
      const resizeObserver = new ResizeObserver(updateApprovalCardHeight)
      resizeObserver.observe(approvalCardRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [showApprovalCard])

  // ✅ 세션 로드
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession()
        console.log('🔍 [Chat] Session:', { hasSession: !!session, userId: session?.user?.id })

        if (session?.user?.id) {
          setUserId(session.user.id)
          setUserType((session.user as any).userType || '')  // ✅ userType 저장
          console.log('👤 [Chat] User:', { id: session.user.id, type: (session.user as any).userType })
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('❌ [Chat] Session error:', error)
        router.push('/login')
      }
    }

    loadSession()
  }, [router])

  // ✅ 채팅 데이터 로드
  useEffect(() => {
    if (!userId) return
    loadChatData()
  }, [userId, chatId])

  // ✅ 실시간 구독
  useEffect(() => {
    if (!userId || !chatId) return

    console.log('📡 [Chat] Setting up realtime subscription for chat:', chatId)

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('🔔 [Realtime] New message:', payload.new)
          
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) {
              return prev
            }
            return [...prev, payload.new]
          })
          
          if (payload.new.sender_id !== userId) {
            playNotificationSound()
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime] Subscription status:', status)
      })

    return () => {
      console.log('📡 [Chat] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, chatId])

  // ✅ 승인 카드 표시 조건
  useEffect(() => {
    if (!chatData) return

    const isInfluencerMode = localStorage.getItem("influencer_mode") === "true"
    
    // 광고주이고 + 인플루언서가 먼저 제안 + pending 상태
    const shouldShowApproval = 
      !isInfluencerMode && 
      chatData.initiated_by === 'influencer' && 
      chatData.status === 'pending'

    setShowApprovalCard(shouldShowApproval)
    console.log('🎯 [Chat] Approval card:', { shouldShowApproval, isInfluencerMode, initiatedBy: chatData.initiated_by, status: chatData.status })
  }, [chatData])

  // ✅ 협업 확정 요청 상태 확인
  useEffect(() => {
    if (messages.length === 0) return

    const hasRequest = messages.some(
      (msg) => msg.message_type === 'system' && msg.metadata?.system_type === 'completion_request'
    )
    
    const hasAccepted = messages.some(
      (msg) => msg.message_type === 'system' && msg.metadata?.system_type === 'completion_accepted'
    )

    setHasPendingCollaborationRequest(hasRequest && !hasAccepted)
    setIsCollaborationComplete(hasAccepted)

    console.log('🎯 [Chat] Collaboration status:', { hasRequest, hasAccepted, hasPendingCollaborationRequest })
  }, [messages])

  const loadChatData = async () => {
    try {
      setLoading(true)
      console.log('📥 [Chat] Loading via API:', chatId)

      const response = await fetch(`/api/chat/${chatId}`)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('❌ [Chat] API error:', error)
        alert('채팅을 불러올 수 없습니다: ' + error.error)
        router.push('/chat')
        return
      }

      const data = await response.json()
      console.log('✅ [Chat] Data loaded:', { chatId: data.chat?.id, messagesCount: data.messages?.length })

      setChatData(data.chat)
      setMessages(data.messages || [])

    } catch (error) {
      console.error('❌ [Chat] Load error:', error)
      alert('채팅 로드 실패')
      router.push('/chat')
    } finally {
      setLoading(false)
    }
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return

    if (chatData?.status === 'pending') {
      alert('제안이 수락되어야 메시지를 보낼 수 있습니다.')
      return
    }

    console.log('📤 [Chat] Sending:', message)

    try {
      const response = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.trim(),
          message_type: 'text',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '메시지 전송 실패')
      }

      const data = await response.json()
      console.log('✅ [Chat] Message sent:', data.message.id)
      
      setMessages(prev => {
        if (prev.some(m => m.id === data.message.id)) {
          return prev
        }
        return [...prev, data.message]
      })
      
      setMessage("")
      
    } catch (error: any) {
      console.error('❌ [Chat] Send error:', error)
      alert('메시지 전송 실패: ' + error.message)
    }
  }

  // 🎯 협업 완료 요청
  const handleCollaborationComplete = async () => {
    try {
      const isInfluencerMode = localStorage.getItem("influencer_mode") === "true"
      const senderName = isInfluencerMode ? chatData.influencer_name : chatData.advertiser_name
      const confirmMessage = `${senderName}님이 협업 확정을 요청했어요.`

      const response = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: confirmMessage,
          message_type: 'system',
          metadata: { system_type: 'completion_request' }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '협업 완료 요청 실패')
      }

      const data = await response.json()
      console.log('✅ [Chat] Completion request sent:', data.message.id)
      
      setMessages(prev => {
        if (prev.some(m => m.id === data.message.id)) {
          return prev
        }
        return [...prev, data.message]
      })
      
    } catch (error: any) {
      console.error('❌ [Chat] Completion request error:', error)
      alert('협업 완료 요청 실패: ' + error.message)
    }
  }

  // 🎯 협업 완료 수락
  const handleAcceptCompletion = async () => {
    try {
      const acceptMessage = "협업이 확정되었습니다. 캠페인이 자동으로 마감됩니다."

      // 1️⃣ 완료 메시지 전송
      const response = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: acceptMessage,
          message_type: 'system',
          metadata: { system_type: 'completion_accepted' }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '협업 완료 수락 실패')
      }

      const data = await response.json()
      console.log('✅ [Chat] Completion accepted:', data.message.id)
      
      setMessages(prev => {
        if (prev.some(m => m.id === data.message.id)) {
          return prev
        }
        return [...prev, data.message]
      })
      
      setIsCollaborationComplete(true)

      // 2️⃣ 캠페인 마감 처리
      if (chatData?.campaign_id) {
        try {
          console.log('🎯 [Chat] Closing campaign:', chatData.campaign_id)
          
          const closeResponse = await fetch(`/api/campaigns/${chatData.campaign_id}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (closeResponse.ok) {
            console.log('✅ [Chat] Campaign closed')
          } else {
            const closeError = await closeResponse.json()
            console.warn('⚠️ [Chat] Failed to close campaign:', closeError)
          }
        } catch (err) {
          console.error('❌ [Chat] Campaign close error:', err)
        }
      }

      // 2.5️⃣ 지원 내역 상태 업데이트
      if (chatData?.campaign_id && chatData?.influencer_id) {
        try {
          console.log('📝 [Chat] Updating application status:', { 
            campaignId: chatData.campaign_id, 
            influencerId: chatData.influencer_id 
          })
          
          const applicationResponse = await fetch('/api/applications/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaign_id: chatData.campaign_id,
              influencer_id: chatData.influencer_id,
              status: '승인됨',
            }),
          })

          if (applicationResponse.ok) {
            console.log('✅ [Chat] Application status updated')
          } else {
            const appError = await applicationResponse.json()
            console.warn('⚠️ [Chat] Failed to update application:', appError)
          }
        } catch (err) {
          console.error('❌ [Chat] Application update error:', err)
        }
      }

      // 3️⃣ 경력 레코드 생성 (인플루언서 프로필에 추가)
      if (chatData?.influencer_id && chatData?.campaign_id) {
        try {
          console.log('📝 [Chat] Adding career record for influencer:', chatData.influencer_id)
          
          const careerResponse = await fetch('/api/careers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              influencer_id: chatData.influencer_id,
              campaign_id: chatData.campaign_id,
              campaign_title: chatData.campaign_title,
              category: chatData.campaign_category || '기타',
            }),
          })

          if (careerResponse.ok) {
            console.log('✅ [Chat] Career record added')
          } else {
            console.warn('⚠️ [Chat] Failed to add career record')
          }
        } catch (err) {
          console.error('❌ [Chat] Career add error:', err)
        }
      }
      
    } catch (error: any) {
      console.error('❌ [Chat] Completion accept error:', error)
      alert('협업 완료 수락 실패: ' + error.message)
    }
  }

  // 🎯 후기 작성하기
  const handleWriteReview = () => {
    router.push(`/chat/${chatId}/review`)
  }

  // 🎯 승인 카드 - 수락
  const handleAcceptProposal = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error)
        return
      }

      console.log('✅ [Chat] Proposal accepted')
      setShowApprovalCard(false)
      loadChatData()
    } catch (error: any) {
      console.error('❌ Accept error:', error)
      alert('수락 실패')
    }
  }

  // 🎯 승인 카드 - 거절
  const handleRejectProposal = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error)
        return
      }

      console.log('✅ [Chat] Proposal rejected')
      router.replace('/chat')
    } catch (error: any) {
      console.error('❌ Reject error:', error)
      alert('거절 실패')
    }
  }

  // 알림음 재생
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/message.mp3')
      audio.volume = 0.3
      audio.play().catch(e => console.log('Sound play failed:', e))
    } catch (e) {
      console.log('Sound not available')
    }
  }

  // 로딩 중
  if (!userId || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-500">채팅 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 데이터 없음
  if (!chatData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-4">채팅방을 찾을 수 없습니다</p>
          <Button onClick={() => router.push('/chat')} className="bg-[#7b68ee]">
            채팅 목록으로
          </Button>
        </div>
      </div>
    )
  }

  const isInfluencerMode = localStorage.getItem("influencer_mode") === "true"
  const otherUserName = isInfluencerMode ? chatData.advertiser_name : chatData.influencer_name
  const otherUserAvatar = isInfluencerMode ? chatData.advertiser_avatar : chatData.influencer_avatar

  // 상태 뱃지 스타일
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return {
          textColor: "#7b68ee",
          backgroundColor: "rgba(123,104,238,0.12)",
        }
      case "completed":
        return {
          textColor: "#666",
          backgroundColor: "#F0F1F3",
        }
      default:
        return {
          textColor: "#888",
          backgroundColor: "#F4F5F7",
        }
    }
  }

  // 캠페인 클릭
  const handleCampaignClick = () => {
    if (chatData?.campaign_id) {
      router.push(`/campaigns/${chatData.campaign_id}`)
    }
  }

  // ✅ 메시지 렌더링 (협업확정 요청 메시지는 시스템 메시지로만 표시)
  const renderMessage = (msg: any) => {
    const isMine = msg.sender_id === userId

    // ✅ 협업 완료 요청 메시지 - 카드 형태로 표시 (방향 수정)
    if (msg.message_type === 'system' && msg.metadata?.system_type === 'completion_request') {
      // 보낸 사람 이름 확인
      const senderName = msg.sender_id === chatData?.influencer_id 
        ? chatData?.influencer_name 
        : chatData?.advertiser_name

      return (
        <div key={msg.id} className={`flex my-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-sm w-full">
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <CardContent className="py-3 px-4 space-y-3">
                <div className="text-left space-y-1">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">
                      {senderName}
                    </span>
                    님이 협업 확정을 요청했어요.
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    하단 협업 확정 버튼을 눌러 협업을 확정하세요. 캠페인이 자동으로 마감돼요.
                  </p>
                </div>

                {!isMine && !isCollaborationComplete && (
                  <Button
                    onClick={handleAcceptCompletion}
                    className="w-full font-semibold rounded-xl h-10 text-sm bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white"
                  >
                    협업 확정
                  </Button>
                )}

                {isCollaborationComplete && (
                  <Button
                    disabled
                    className="w-full font-semibold rounded-xl h-10 text-sm bg-white border border-[#7b68ee] text-[#7b68ee] cursor-not-allowed"
                  >
                    협업 완료
                  </Button>
                )}
              </CardContent>
            </Card>
            <span className={`text-xs text-gray-400 mt-1 block ${isMine ? 'text-right mr-3' : 'text-left ml-3'}`}>
              {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      )
    }

    // 협업 완료 확정 메시지
    if (msg.message_type === 'system' && msg.metadata?.system_type === 'completion_accepted') {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-green-50 text-green-700 text-xs px-4 py-2 rounded-full max-w-md text-center font-medium">
            ✅ {msg.content}
          </div>
        </div>
      )
    }

    // 시스템 메시지
    if (msg.message_type === 'system') {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full max-w-md text-center">
            {msg.content}
          </div>
        </div>
      )
    }

    // ✅ 프로필 카드 - 방향 수정
    if (msg.message_type === 'profile_card') {
      const metadata = msg.metadata || {}
      
      return (
        <div key={msg.id} className={`my-4 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
          <div className="w-[160px]">
            <Link href={`/influencers/${msg.sender_id}`} className="block">
              <div className="bg-transparent rounded-2xl overflow-hidden h-[230px]">
                <div className="h-full">
                  <div className="relative h-full flex flex-col">
                    {/* 👤 프로필 이미지 영역 */}
                    <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
                      <img
                        src={metadata.avatar || "/placeholder.svg"}
                        alt={metadata.name}
                        className="w-full h-full object-cover rounded-bl-lg rounded-br-lg"
                      />
                      {/* 카테고리 뱃지 */}
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-white/90 text-[#7b68ee] font-semibold text-xs rounded-full px-1.5 py-0.5">
                          {metadata.category || '인플루언서'}
                        </span>
                      </div>
                    </div>

                    {/* 📋 프로필 정보 영역 */}
                    <div className="h-[92px] p-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        {/* 이름 + 인증 뱃지 */}
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-sm leading-tight">
                            {metadata.name || '인플루언서'}
                          </h3>
                          <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                          </div>
                        </div>

                        {/* 인스타그램 아이디 */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 leading-tight">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            @{metadata.username || 'username'}
                          </span>
                        </div>

                        {/* 팔로워 & 참여율 */}
                        <div className="flex items-center gap-4 text-xs leading-tight">
                          <span className="flex items-center gap-2 text-black font-semibold">
                            <Users className="w-3 h-3 flex-shrink-0 text-gray-400" />
                            <span className="text-sm">
                              {metadata.follower_count 
                                ? `${(metadata.follower_count / 10000).toFixed(1)}만`
                                : '0'}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 text-black font-semibold">
                            <BarChart3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                            <span className="text-sm">
                              {metadata.engagement_rate || '0'}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* 해시태그 */}
                      {metadata.hashtags && metadata.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center mt-1 mb-1">
                          {metadata.hashtags.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs text-blue-500 leading-tight">
                              #{tag}
                            </span>
                          ))}
                          {metadata.hashtags.length > 2 && (
                            <span className="text-xs text-blue-500 leading-tight">
                              +{metadata.hashtags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 시간 표시 */}
            <span className={`text-xs text-gray-400 mt-2 inline-block ${isMine ? 'mr-2' : 'ml-2'}`}>
              {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      )
    }

    // 캠페인 카드
    if (msg.message_type === 'campaign_card') {
      const metadata = msg.metadata || {}
      return (
        <div key={msg.id} className={`my-4 ${isMine ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-4 py-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-2xl ${isMine ? 'text-left' : ''}`}>
            <div className="flex items-start gap-3">
              {metadata.thumbnail && (
                <img 
                  src={metadata.thumbnail} 
                  alt="Campaign" 
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-700 font-semibold mb-1">🎯 캠페인 제안</p>
                <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                  {metadata.title || '캠페인'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {metadata.category && (
                    <span className="text-xs bg-white text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {metadata.category}
                    </span>
                  )}
                  {metadata.paymentAmount && (
                    <span className="text-xs font-semibold text-purple-900">
                      💰 {typeof metadata.paymentAmount === 'number' 
                        ? metadata.paymentAmount.toLocaleString() + '원'
                        : metadata.paymentAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <span className={`text-xs text-gray-400 mt-2 inline-block ${isMine ? 'mr-4' : 'ml-4'}`}>
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )
    }

    // 제안서
    if (msg.message_type === 'proposal') {
      return (
        <div key={msg.id} className={`my-4 ${isMine ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-4 py-4 max-w-[75%]`}>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>

          <span className={`text-xs text-gray-400 mt-2 inline-block ${isMine ? 'mr-4' : 'ml-4'}`}>
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )
    }

    // 일반 메시지
    return (
      <div key={msg.id} className={`flex gap-2 mb-4 ${isMine ? "flex-row-reverse" : ""}`}>
        {!isMine && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
            <AvatarFallback>{otherUserName?.[0] || '?'}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%]`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isMine
                ? "bg-[#7b68ee] text-white rounded-tr-sm"
                : "bg-white border border-gray-200 rounded-tl-sm shadow-sm"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen bg-gray-50 flex flex-col overflow-x-hidden"
      style={{
        "--gnb-height": "56px",
        "--topcard-h": "180px",
        "--inputbar-h": "72px",
        "--approval-card-h": "0px",
        "--gap-top": "12px",
      } as React.CSSProperties}
    >
      {/* 헤더 (Fixed) */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100"
        style={{ height: "var(--gnb-height)" }}
      >
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Link 
            href={`/influencers/${chatData?.influencer_id || 'demo'}`}
            className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <h1 className="font-semibold text-[15px] text-gray-900 truncate">{otherUserName}</h1>
            <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* ✅ 상단 캠페인 카드 (Fixed, Sticky) */}
      <div
        ref={topCardRef}
        className="fixed inset-x-0 z-[95]"
        style={{ top: "var(--gnb-height)" }}
      >
        <div className="bg-white rounded-b-2xl px-3 py-2 pb-3 shadow-sm">
          {/* 캠페인 정보 */}
          <div
            className="space-y-1.5 cursor-pointer hover:bg-gray-50/50 rounded-lg p-1.5 -m-1.5 transition-colors duration-200"
            onClick={handleCampaignClick}
            tabIndex={0}
            role="button"
            aria-label="캠페인 상세보기"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  color: getStatusBadgeStyle(chatData.status).textColor,
                  backgroundColor: getStatusBadgeStyle(chatData.status).backgroundColor,
                }}
              >
                {chatData.status === 'active' ? '구인 진행중' : chatData.status === 'completed' ? '구인 마감' : '대기중'}
              </span>
            </div>

            <div>
              <h2 className="text-xs font-medium text-gray-900 leading-tight">
                {chatData.campaign_title || '캠페인'}
              </h2>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {(() => {
                  if (chatData.reward_type === "payment") {
                    if (chatData.payment_amount === "인플루언서와 직접 협의") {
                      return "협의 후 결정"
                    }
                    return `${chatData.payment_amount}만원`
                  } else if (chatData.reward_type === "product") {
                    return chatData.product_name || "제품 제공"
                  } else if (chatData.reward_type === "other") {
                    return chatData.other_reward || "기타 보상"
                  }
                  return "협의 후 결정"
                })()}
              </p>
            </div>
          </div>

          {/* 협업 확정 + 후기 작성 버튼 */}
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              className={`${userType === 'ADVERTISER' ? 'flex-1' : 'w-full'} px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 active:scale-98 transition-all duration-150 ${
                showApprovalCard || hasPendingCollaborationRequest || isCollaborationComplete 
                  ? "opacity-50 pointer-events-none" 
                  : ""
              }`}
              style={{ minHeight: "36px" }}
              disabled={showApprovalCard || hasPendingCollaborationRequest || isCollaborationComplete}
              onClick={(e) => {
                e.stopPropagation()
                handleCollaborationComplete()
              }}
            >
              <CheckCircle className="w-4 h-4 text-[#7b68ee] flex-shrink-0" />
              <span className="text-xs font-semibold truncate">
                {isCollaborationComplete ? "협업 완료" : "협업 확정 요청"}
              </span>
            </button>

            {/* ✅ 광고주만 후기 작성 버튼 표시 */}
            {userType === 'ADVERTISER' && (
              <Link
                href={`/chat/${params.id}/review`}
                className={`flex-1 ${showApprovalCard || !isCollaborationComplete ? "opacity-50 pointer-events-none" : ""}`}
                onClick={(e) => {
                  if (showApprovalCard || !isCollaborationComplete) {
                    e.preventDefault()
                  }
                }}
              >
                <button
                  className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 active:scale-98 transition-all duration-150"
                  style={{ minHeight: "36px" }}
                  disabled={showApprovalCard || !isCollaborationComplete}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 text-[#7b68ee] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs font-semibold truncate">후기 작성하기</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: "calc(var(--gnb-height) + var(--topcard-h) + var(--gap-top))",
          paddingBottom: showApprovalCard
            ? "calc(var(--approval-card-h) + env(safe-area-inset-bottom))"
            : "calc(var(--inputbar-h) + env(safe-area-inset-bottom))",
          transition: "padding-bottom 0.3s ease-in-out",
        }}
      >
        <div className="px-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">메시지가 없습니다</p>
                <p className="text-xs text-gray-300">첫 메시지를 보내보세요!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => renderMessage(msg))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* ✅ 하단 제안 승인 카드 (조건부) */}
      {showApprovalCard && (
        <div
          ref={approvalCardRef}
          className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#F2F3F5] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <div className="px-4 py-6" style={{ paddingTop: "28px", paddingBottom: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">
                {otherUserName}님이 협업을 제안했어요. 수락하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                수락을 선택하지 않는 이상 상대방은 요청을 확인했다는 사실을 알 수 없습니다. 거절 시, 채팅방에서 나가져요.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectProposal}
                className="flex-1 px-4 bg-white border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-all duration-150"
                style={{
                  height: "48px",
                  color: "#888888",
                  borderColor: "rgba(0,0,0,0.1)",
                }}
              >
                <X className="w-5 h-5" />
                <span>거절</span>
              </button>
              <button
                onClick={handleAcceptProposal}
                className="flex-1 px-4 bg-white border rounded-xl text-[#7b68ee] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-all duration-150"
                style={{
                  height: "48px",
                  borderColor: "rgba(0,0,0,0.1)",
                }}
              >
                <Check className="w-5 h-5" />
                <span>수락</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 입력창 (Fixed) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 transition-all duration-300 ${
          showApprovalCard ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{
          height: "var(--inputbar-h)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 h-full">
          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" disabled={showApprovalCard}>
            <Paperclip className="w-5 h-5 text-gray-600" />
          </Button>

          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                chatData.status === 'pending' 
                  ? "제안 수락 후 메시지를 보낼 수 있습니다..." 
                  : "메시지를 입력하세요..."
              }
              className="w-full h-10 px-4 bg-gray-100 rounded-xl border-0 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:bg-white"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={showApprovalCard || chatData.status === 'pending'}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || showApprovalCard || chatData.status === 'pending'}
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
          >
            <Send className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}