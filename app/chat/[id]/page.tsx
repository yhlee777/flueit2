"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  Check,
  X,
  Image as ImageIcon,
  File,
  CheckCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useChatRoom } from "@/lib/use-supabase-chat"
import { getChatById, updateChatStatus } from "@/lib/supabase-chat-service"
import Image from "next/image"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"
import type { Database } from "@/lib/supabase-client"

type Chat = Database['public']['Tables']['chats']['Row']

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const chatId = parseInt(params.id)
  
  const [message, setMessage] = useState("")
  const [chatData, setChatData] = useState<Chat | null>(null)
  const [showMoreModal, setShowMoreModal] = useState(false)
  const [showApprovalCard, setShowApprovalCard] = useState(false)
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // Supabase 훅
  const {
    messages,
    loading,
    isTyping,
    isSending,
    sendMessage: sendMessageService,
    sendFile,
    handleTyping,
    messagesEndRef,
  } = useChatRoom(chatId, userId)

  // 초기 데이터 로드
  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    // 실제 UUID 가져오기 (auth-helpers 사용)
    // 개발 중에는 테스트 UUID 사용
    const testUserId = influencerMode 
      ? '22222222-2222-2222-2222-222222222222'  // 테스트 인플루언서 UUID
      : '33333333-3333-3333-3333-333333333333'  // 테스트 광고주 UUID
    
    setUserId(testUserId)

    // 실제 인증 후에는 아래 코드 사용:
    // import { getCurrentUserId } from '@/lib/auth-helpers'
    // getCurrentUserId().then(id => {
    //   if (id) setUserId(id)
    // })

    // 채팅 정보 로드
    getChatById(chatId).then(({ data }) => {
      if (data) {
        setChatData(data)
        
        // 협업 승인 대기 카드 표시 조건
        if (data.status === "pending" && data.initiated_by === "influencer") {
          setShowApprovalCard(true)
        }
      }
    })
  }, [chatId])

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return

    // 텍스트 메시지 전송
    if (message.trim()) {
      await sendMessageService(message.trim())
      setMessage("")
    }

    // 파일 전송
    for (const file of selectedFiles) {
      await sendFile(file)
    }

    setSelectedFiles([])
  }

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  // 파일 제거
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 협업 승인
  const handleAcceptCollaboration = async () => {
    await updateChatStatus(chatId, "accepted")
    setShowApprovalCard(false)
    
    // 승인 메시지 전송
    await sendMessageService("협업 제안을 수락했습니다.")
  }

  // 협업 거절
  const handleRejectCollaboration = async () => {
    await updateChatStatus(chatId, "rejected")
    setShowApprovalCard(false)
    router.push("/chat")
  }

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "오후" : "오전"
    const displayHours = hours % 12 || 12
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`
  }

  // 날짜 구분선 표시 여부
  const shouldShowDateDivider = (currentMsg: any, previousMsg?: any) => {
    if (!previousMsg) return true
    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()
    return currentDate !== previousDate
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "오늘"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제"
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`
    }
  }

  if (loading || !chatData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">채팅을 불러오는 중...</p>
      </div>
    )
  }

  const otherUserName = isInfluencerMode ? chatData.advertiser_name : chatData.influencer_name
  const otherUserAvatar = isInfluencerMode ? chatData.advertiser_avatar : chatData.influencer_avatar

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
              <AvatarFallback>{otherUserName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-semibold">{otherUserName}</h1>
              {isTyping && <p className="text-xs text-gray-500">입력 중...</p>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMoreModal(true)}
            className="h-9 w-9 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 캠페인 정보 카드 */}
      {chatData.campaign_id && (
        <div className="bg-white border-b border-gray-200 p-4">
          <Link
            href={`/campaigns/${chatData.campaign_id}`}
            className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700">
                {chatData.status === "accepted" || chatData.status === "active" ? "진행중" : "대기중"}
              </span>
            </div>
            <h2 className="text-sm font-medium text-gray-900 mb-1">
              {chatData.campaign_title || "캠페인 제목"}
            </h2>
            <p className="text-base font-semibold text-gray-900">
              ₩ 300,000
            </p>
          </Link>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {messages.map((msg, index) => {
          const isMine = msg.sender_id === userId
          const showDate = shouldShowDateDivider(msg, messages[index - 1])

          return (
            <div key={msg.id}>
              {/* 날짜 구분선 */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(msg.created_at)}
                  </div>
                </div>
              )}

              {/* 메시지 */}
              <div className={`flex gap-2 mb-4 ${isMine ? "flex-row-reverse" : ""}`}>
                {!isMine && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
                    <AvatarFallback>{otherUserName[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%]`}>
                  {/* 텍스트 메시지 */}
                  {msg.message_type === "text" && (
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMine
                          ? "bg-[#7b68ee] text-white rounded-tr-sm"
                          : "bg-white border border-gray-200 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  )}

                  {/* 이미지 메시지 */}
                  {msg.message_type === "image" && msg.file_url && (
                    <div className="relative rounded-2xl overflow-hidden">
                      <Image
                        src={msg.file_url}
                        alt={msg.file_name || "이미지"}
                        width={250}
                        height={250}
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* 파일 메시지 */}
                  {msg.message_type === "file" && (
                    <div
                      className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
                        isMine
                          ? "bg-[#7b68ee] text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <File className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.file_name}</p>
                      </div>
                    </div>
                  )}

                  {/* 시간 및 읽음 표시 */}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                    {isMine && msg.is_read && (
                      <CheckCheck className="h-3 w-3 text-[#7b68ee]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 협업 승인 카드 (오버레이) */}
      {showApprovalCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-in slide-in-from-bottom">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                협업 제안을 수락하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600">
                수락을 선택하지 않는 이상 상대방은 요청을 확인했다는 사실을 알 수 없습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRejectCollaboration}
                className="flex-1 h-12 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                거절
              </Button>
              <Button
                onClick={handleAcceptCollaboration}
                className="flex-1 h-12 rounded-xl bg-[#7b68ee] hover:bg-[#6952d6]"
              >
                <Check className="w-4 h-4 mr-2" />
                수락
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 입력창 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {/* 선택된 파일 미리보기 */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                {file.type.startsWith("image/") ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center relative">
                    <File className="h-6 w-6 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1 truncate px-1 w-full text-center">
                      {file.name}
                    </p>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('file-input')?.click()}
            className="h-10 w-10 rounded-full flex-shrink-0"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="메시지를 입력하세요..."
              className="w-full resize-none rounded-full border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:border-transparent max-h-32"
              rows={1}
              style={{
                minHeight: "40px",
                maxHeight: "128px",
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedFiles.length === 0) || isSending}
              size="icon"
              className="absolute right-1 bottom-1 h-8 w-8 rounded-full bg-[#7b68ee] hover:bg-[#6952d6] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 더보기 메뉴 */}
      <Drawer open={showMoreModal} onOpenChange={setShowMoreModal}>
        <DrawerContent>
          <div className="p-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            <div className="space-y-2">
              <Link
                href={`/chat/${chatId}/review`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
              >
                리뷰 작성
              </Link>

              <button
                onClick={() => setShowMoreModal(false)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg text-left"
              >
                신고하기
              </button>

              <button
                onClick={() => {
                  setShowMoreModal(false)
                  router.push("/chat")
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg text-left text-red-600"
              >
                채팅방 나가기
              </button>
            </div>

            <DrawerClose asChild>
              <Button variant="outline" className="w-full mt-6 h-12 rounded-xl">
                취소
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}