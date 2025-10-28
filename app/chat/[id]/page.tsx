"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  Check,
  MapPin,
  Users,
  BarChart3,
  Heart,
  CheckCircle,
  PenTool,
  Flag,
  UserX,
  LogOut,
  X,
} from "lucide-react"
import Link from "next/link"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"
import { useRouter } from "next/navigation"
import { useCampaigns } from "@/lib/campaign-store"

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")
  const [showMoreModal, setShowMoreModal] = useState(false)
  const topCardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { getCampaignById } = useCampaigns()

  const [isFirstApplication, setIsFirstApplication] = useState(true) // Mock data - would come from API
  const [decisionStatus, setDecisionStatus] = useState<"pending" | "accepted" | "rejected">("pending") // Mock data
  const [showApprovalCard, setShowApprovalCard] = useState(false)
  const approvalCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowApprovalCard(isFirstApplication && decisionStatus === "pending")
  }, [isFirstApplication, decisionStatus])

  const campaignId = 1 // This would normally come from the chat data/API
  const campaignData = getCampaignById(campaignId)

  const chatData = {
    id: params.id,
    name: "김민지",
    status:
      campaignData?.status === "구인 진행 중"
        ? "구인 진행중"
        : campaignData?.status === "구인 마감"
          ? "구인 마감"
          : "비공개 글",
    title: campaignData?.title || "캠페인 제목을 불러올 수 없습니다",
    amount: campaignData?.reward || "금액 정보 없음",
    campaignId: campaignId,
    avatar: "/korean-beauty-influencer.jpg",
    category: campaignData?.category || "카테고리 없음",
    region: "서울시 성동구",
    followers: "33000",
    followersDisplay: "3.3만",
    engagement: "3.3%",
    verified: true,
    hashtags: ["#뷰티", "#스킨케어", "#체험단"],
  }

  const handleSendMessage = () => {
    if (message.trim() && !showApprovalCard) {
      setMessage("")
    }
  }

  const handleAcceptCollaboration = () => {
    setDecisionStatus("accepted")
    setShowApprovalCard(false)
  }

  const handleRejectCollaboration = () => {
    setDecisionStatus("rejected")
    setShowApprovalCard(false)
    router.replace("/chat")
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "구인 진행중":
        return {
          textColor: "#7b68ee",
          borderColor: "#7b68ee",
          backgroundColor: "rgba(123,104,238,0.12)",
        }
      case "구인 마감":
        return {
          textColor: "#666",
          borderColor: "#666",
          backgroundColor: "#F0F1F3",
        }
      case "비공개 글":
        return {
          textColor: "#888",
          borderColor: "#888",
          backgroundColor: "#F4F5F7",
        }
      default:
        return {
          textColor: "#666",
          borderColor: "#666",
          backgroundColor: "#F0F1F3",
        }
    }
  }

  const handleCampaignClick = () => {
    if (campaignData) {
      router.push(`/campaigns/${campaignData.id}`)
    }
  }

  const handleCloseModal = () => {
    setShowMoreModal(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMoreModal) {
        handleCloseModal()
      }
    }

    if (showMoreModal) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [showMoreModal])

  useEffect(() => {
    const updateTopCardHeight = () => {
      if (topCardRef.current) {
        const height = topCardRef.current.offsetHeight
        document.documentElement.style.setProperty("--topcard-h", `${height}px`)
      }
    }

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
    const updateApprovalCardHeight = () => {
      if (approvalCardRef.current && showApprovalCard) {
        const height = approvalCardRef.current.offsetHeight
        document.documentElement.style.setProperty("--approval-card-h", `${height}px`)
      } else {
        document.documentElement.style.setProperty("--approval-card-h", "0px")
      }
    }

    updateApprovalCardHeight()

    if (showApprovalCard && approvalCardRef.current) {
      const resizeObserver = new ResizeObserver(updateApprovalCardHeight)
      resizeObserver.observe(approvalCardRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [showApprovalCard])

  useEffect(() => {
    if (showApprovalCard) {
      const approvalCard = approvalCardRef.current
      if (approvalCard) {
        const focusableElements = approvalCard.querySelectorAll("button")
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault()
                lastElement?.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault()
                firstElement?.focus()
              }
            }
          }
        }

        document.addEventListener("keydown", handleTabKey)
        firstElement?.focus()

        return () => {
          document.removeEventListener("keydown", handleTabKey)
        }
      }
    }
  }, [showApprovalCard])

  const ProfileCard = ({ influencer }: { influencer: any }) => {
    const displayHashtags = influencer.hashtags.slice(0, 2)
    const remainingCount = influencer.hashtags.length - 2

    return (
      <Link href={`/influencers/${influencer.id || "demo"}`} className="block">
        <Card className="bg-white rounded-2xl overflow-hidden shadow-sm p-0 min-w-[160px] w-[160px] h-[230px] cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-0 h-full">
            <div className="relative h-full flex flex-col">
              <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
                <img
                  src={influencer.avatar || "/placeholder.svg"}
                  alt={influencer.name}
                  className="w-full h-full object-cover rounded-bl-lg rounded-br-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <Heart className="w-4 h-4 text-gray-600 fill-gray-600" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white/90 text-[#7b68ee] font-semibold text-xs rounded-full px-1.5 py-0.5">
                    {influencer.category}
                  </span>
                </div>
              </div>

              <div className="h-[92px] p-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-sm leading-tight">{influencer.name}</h3>
                    {influencer.verified && (
                      <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 leading-tight">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{influencer.region}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs leading-tight">
                    <span className="flex items-center gap-2 text-black font-semibold">
                      <Users className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{influencer.followersDisplay}</span>
                    </span>
                    <span className="flex items-center gap-2 text-black font-semibold">
                      <BarChart3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{influencer.engagement}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 items-center mt-1 mb-1">
                  {displayHashtags.map((tag, index) => (
                    <span key={index} className="text-xs text-blue-500 leading-tight">
                      {tag}
                    </span>
                  ))}
                  {remainingCount > 0 && <span className="text-xs text-blue-500 leading-tight">+{remainingCount}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden"
      style={
        {
          "--inputbar-h": "60px",
          "--topcard-h": "180px",
          "--gap-top": "12px",
          "--approval-card-h": "0px",
        } as React.CSSProperties
      }
    >
      <style jsx global>{`
        html {
          scroll-padding-top: calc(var(--gnb-height) + var(--topcard-h) + var(--gap-top));
        }
      `}</style>

      <header
        className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100"
        style={{ height: "var(--gnb-height)", borderBottomColor: "rgba(0,0,0,0.06)" }}
      >
        <div
          className="flex items-center h-full"
          style={{ paddingLeft: "var(--gnb-padding-x)", paddingRight: "var(--gnb-padding-x)" }}
        >
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="h-8 w-8" style={{ marginRight: "6px" }}>
              <ArrowLeft
                style={{
                  width: "var(--gnb-icon-size)",
                  height: "var(--gnb-icon-size)",
                  strokeWidth: "var(--gnb-icon-stroke)",
                }}
              />
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-1">
            <h1 className="font-semibold text-[15px] text-gray-900 truncate">{chatData.name}</h1>
            {chatData.verified && (
              <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowMoreModal(true)}>
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Drawer open={showMoreModal} onOpenChange={setShowMoreModal}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-6 space-y-0">
            <DrawerClose asChild>
              <button className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Flag className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-900">신고하기</span>
              </button>
            </DrawerClose>
            <DrawerClose asChild>
              <button className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <UserX className="w-5 h-5 text-[#D92D20]" />
                <span className="text-base font-medium text-[#D92D20]">차단하기</span>
              </button>
            </DrawerClose>
            <DrawerClose asChild>
              <button className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 text-[#D92D20]" />
                <span className="text-base font-medium text-[#D92D20]">나가기</span>
              </button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      <div
        ref={topCardRef}
        className="fixed inset-x-0 z-[95]"
        style={{
          top: "var(--gnb-height)",
          width: "100%",
        }}
      >
        <div className="bg-white rounded-b-2xl px-3 py-2 pb-2">
          <div
            className="space-y-1.5 cursor-pointer hover:bg-gray-50/50 rounded-lg p-1.5 -m-1.5 transition-colors duration-200"
            onClick={handleCampaignClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCampaignClick()
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`캠페인 상세보기: ${chatData.title}`}
            style={{
              outline: "none",
              boxShadow: "none",
              WebkitTapHighlightColor: "transparent",
              WebkitFocusRingColor: "transparent",
            }}
            onFocus={(e) => {
              if (e.target.matches(":focus-visible")) {
                e.target.style.outline = "2px solid rgba(123,104,238,0.5)"
                e.target.style.outlineOffset = "2px"
              }
            }}
            onBlur={(e) => {
              e.target.style.outline = "none"
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{
                  color: getStatusBadgeStyle(chatData.status).textColor,
                  borderColor: getStatusBadgeStyle(chatData.status).borderColor,
                  backgroundColor: getStatusBadgeStyle(chatData.status).backgroundColor,
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {chatData.status}
              </span>
            </div>

            <div style={{ marginBottom: "4px" }}>
              <h2 className="text-xs font-medium text-gray-900 leading-tight">{chatData.title}</h2>
              <p className="text-base font-semibold text-gray-900 mt-0.5">{chatData.amount}</p>
            </div>
          </div>

          <div className="flex gap-2" style={{ marginTop: "6px" }} onClick={(e) => e.stopPropagation()}>
            <button
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 hover:opacity-100 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:ring-offset-1 transition-all duration-150 ${showApprovalCard ? "opacity-50 pointer-events-none" : ""}`}
              style={{ minHeight: "36px" }}
              disabled={showApprovalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle className="w-4 h-4 text-[#7b68ee] flex-shrink-0" />
              <span className="text-xs font-semibold truncate">협업 확정 요청</span>
            </button>
            <Link
              href={`/chat/${params.id}/review`}
              className={`flex-1 ${showApprovalCard ? "opacity-50 pointer-events-none" : ""}`}
              onClick={(e) => {
                if (showApprovalCard) {
                  e.preventDefault()
                }
              }}
            >
              <button
                className="w-full px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 hover:opacity-100 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:ring-offset-1 transition-all duration-150"
                style={{ minHeight: "36px" }}
                disabled={showApprovalCard}
                onClick={(e) => e.stopPropagation()}
              >
                <PenTool className="w-4 h-4 text-[#7b68ee] flex-shrink-0" />
                <span className="text-xs font-semibold truncate">후기 작성하기</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div
        className="flex-1 min-h-screen overflow-y-auto"
        style={{
          paddingTop: "calc(var(--gnb-height) + var(--topcard-h) + var(--gap-top))",
          paddingBottom: showApprovalCard
            ? "calc(var(--approval-card-h) + env(safe-area-inset-bottom))"
            : "calc(var(--inputbar-h) + env(safe-area-inset-bottom))",
          transition: "padding-bottom 0.3s ease-in-out",
        }}
      >
        <div className="px-4">
          <ProfileCard influencer={chatData} />
        </div>

        <div className="px-4 space-y-3 mt-4">
          {[
            {
              id: 1,
              text: "안녕하세요! 수분크림 체험단 캠페인에 지원하고 싶어서 연락드렸습니다.",
              sender: "influencer",
              time: "10:30",
              isRead: true,
            },
            {
              id: 2,
              text: "안녕하세요 김민지님! 지원해주셔서 감사합니다. 프로필을 확인해보겠습니다.",
              sender: "advertiser",
              time: "10:32",
              isRead: true,
            },
            {
              id: 3,
              text: "건성 피부라서 수분크림에 관심이 많아요. 뷰티 콘텐츠 제작 경험도 있습니다!",
              sender: "influencer",
              time: "10:35",
              isRead: false,
            },
          ].map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "advertiser" ? "justify-end" : "justify-start"}`}>
              <div className="relative max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.sender === "advertiser" ? "bg-[#7b68ee] text-white" : "bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 block px-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showApprovalCard && (
        <div
          ref={approvalCardRef}
          className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#F2F3F5] shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
            overflow: "hidden",
            borderRadius: "16px 16px 0 0 !important",
          }}
        >
          <div className="px-4 py-6" style={{ paddingTop: "28px", paddingBottom: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3 className="text-base font-bold text-gray-900 leading-tight" style={{ marginBottom: "8px" }}>
                {chatData.name} 님이 협업을 제안했어요. 수락하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                수락을 선택하지 않는 이상 상대방은 요청을 확인했다는 사실을 알 수 없습니다. 거절 시, 채팅방에서
                나가져요.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectCollaboration}
                className="flex-1 px-4 bg-white border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-all duration-150"
                style={{
                  height: "48px",
                  color: "#888888",
                  borderColor: "rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  outline: "none",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none"
                  e.target.style.boxShadow = "none"
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none"
                  e.target.style.boxShadow = "none"
                }}
                aria-label="협업 제안 거절"
              >
                <X className="w-5 h-5" style={{ width: "18px", height: "18px", color: "#888888" }} />
                <span>거절</span>
              </button>
              <button
                onClick={handleAcceptCollaboration}
                className="flex-1 px-4 bg-white border rounded-xl text-[#7b68ee] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-all duration-150"
                style={{
                  height: "48px",
                  borderColor: "rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  outline: "none",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  e.target.style.outline = "none"
                  e.target.style.boxShadow = "none"
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none"
                  e.target.style.boxShadow = "none"
                }}
                aria-label="협업 제안 수락"
              >
                <Check className="w-5 h-5" style={{ width: "18px", height: "18px" }} />
                <span>수락</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 transition-all duration-300 ${showApprovalCard ? "opacity-50 pointer-events-none blur-sm" : ""}`}
        style={{
          height: "var(--inputbar-h)",
          paddingBottom: "env(safe-area-inset-bottom)",
          borderTopColor: "rgba(0,0,0,0.08)",
          display: showApprovalCard ? "none" : "block",
          overflow: "visible",
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
              placeholder="메시지를 입력하세요..."
              className="w-full h-10 px-4 bg-gray-100 rounded-xl border-0 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:bg-white"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={showApprovalCard}
              aria-disabled={showApprovalCard}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || showApprovalCard}
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
