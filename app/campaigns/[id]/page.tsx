"use client"

import { useState, useRef, useEffect } from "react"
import { useCampaigns } from "@/lib/campaign-store"
import { useViewHistory } from "@/lib/view-history-store"
import { useChatStore } from "@/lib/chat-store"
import { useApplicationStore } from "@/lib/application-store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, MoreVertical, MapPin, Home, Heart, Check, CheckCircle, PenTool, X } from "lucide-react"
import Link from "next/link"
import { notFound, usePathname } from "next/navigation"
import ProfileCard from "@/components/profile-card"

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { getCampaignById } = useCampaigns()
  const { addViewedCampaign } = useViewHistory()
  const { addChat } = useChatStore()
  const { addApplication } = useApplicationStore()
  const [currentImageSlide, setCurrentImageSlide] = useState(0)
  const imageScrollRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [proposalText, setProposalText] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const [influencerProfileData, setInfluencerProfileData] = useState({
    name: "밍밍 부인",
    avatar: "/korean-business-person.jpg",
    verified: true,
    category: "뷰티·화장품",
    followers: "125K",
    engagement: "4.2%",
    region: "서울시 강남구",
    trustScore: 4.8,
    hashtags: ["#뷰티", "#스킨케어", "#체험단"],
  })

  const campaignData = getCampaignById(Number.parseInt(params.id))

  const images =
    campaignData?.images && campaignData.images.length > 0
      ? campaignData.images
      : [campaignData?.thumbnail || "/campaign-image.jpg"]

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)
    console.log("[v0] Influencer mode:", influencerMode)

    if (influencerMode) {
      const avatar = localStorage.getItem("user_avatar")
      const name = localStorage.getItem("username")
      const bio = localStorage.getItem("influencer_bio")
      const instagram = localStorage.getItem("influencer_instagram_id")
      const category = localStorage.getItem("influencer_category")
      const hashtagsStr = localStorage.getItem("influencer_profile_hashtags")

      let hashtags: string[] = []
      try {
        hashtags = hashtagsStr ? JSON.parse(hashtagsStr) : []
      } catch (e) {
        hashtags = []
      }

      const profileData = {
        hasAvatar: avatar !== null && avatar !== "" && avatar !== "null",
        hasName: name !== null && name !== "" && name !== "null",
        hasBio: bio !== null && bio !== "" && bio !== "null",
        hasInstagram: instagram !== null && instagram !== "" && instagram !== "null",
        hasCategory: category !== null && category !== "" && category !== "null",
        hasHashtags: hashtags.length > 0,
      }

      const isComplete =
        profileData.hasAvatar &&
        profileData.hasName &&
        profileData.hasBio &&
        profileData.hasInstagram &&
        profileData.hasCategory &&
        profileData.hasHashtags
      setIsProfileComplete(isComplete)
      console.log("[v0] Profile complete:", isComplete)
    }
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      const influencerMode = localStorage.getItem("influencer_mode") === "true"
      if (influencerMode) {
        const avatar = localStorage.getItem("user_avatar")
        const name = localStorage.getItem("username")
        const bio = localStorage.getItem("influencer_bio")
        const instagram = localStorage.getItem("influencer_instagram_id")
        const category = localStorage.getItem("influencer_category")
        const hashtagsStr = localStorage.getItem("influencer_profile_hashtags")

        let hashtags: string[] = []
        try {
          hashtags = hashtagsStr ? JSON.parse(hashtagsStr) : []
        } catch (e) {
          hashtags = []
        }

        const profileData = {
          hasAvatar: avatar !== null && avatar !== "" && avatar !== "null",
          hasName: name !== null && name !== "" && name !== "null",
          hasBio: bio !== null && bio !== "" && bio !== "null",
          hasInstagram: instagram !== null && instagram !== "" && instagram !== "null",
          hasCategory: category !== null && category !== "" && category !== "null",
          hasHashtags: hashtags.length > 0,
        }

        const isComplete =
          profileData.hasAvatar &&
          profileData.hasName &&
          profileData.hasBio &&
          profileData.hasInstagram &&
          profileData.hasCategory &&
          profileData.hasHashtags
        setIsProfileComplete(isComplete)
        console.log("[v0] Profile complete (on focus):", isComplete)
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  useEffect(() => {
    const savedProposal = localStorage.getItem("influencer_proposal")
    console.log("[v0] Loading saved proposal from localStorage:", savedProposal)
    if (savedProposal) {
      setProposalText(savedProposal)
      console.log("[v0] Proposal loaded successfully")
    } else {
      console.log("[v0] No saved proposal found")
    }

    const savedCategory = localStorage.getItem("influencer_category")
    if (savedCategory) {
      setInfluencerProfileData((prev) => ({
        ...prev,
        category: savedCategory,
      }))
    }
  }, [])

  useEffect(() => {
    if (showProposalModal) {
      const savedProposal = localStorage.getItem("influencer_proposal")
      console.log("[v0] Reloading proposal when modal opens:", savedProposal)
      if (savedProposal) {
        setProposalText(savedProposal)
        console.log("[v0] Proposal reloaded successfully in modal")
      }
    }
  }, [showProposalModal])

  useEffect(() => {
    if (isInfluencerMode && campaignData) {
      addViewedCampaign({
        id: campaignData.id,
        title: campaignData.title,
        location: campaignData.location,
        reward: campaignData.reward,
        thumbnail: campaignData.thumbnail,
        category: campaignData.category,
        company: campaignData.company,
        visitType: campaignData.visitType,
      })
      console.log("[v0] Added campaign to view history:", campaignData.id)
    }
  }, [campaignData, addViewedCampaign])

  useEffect(() => {
    if (isInfluencerMode && campaignData) {
      const savedFavorites = localStorage.getItem("campaign-favorites")
      console.log("[v0] Loading saved favorites:", savedFavorites)
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        const isFav = favorites.includes(campaignData.id)
        setIsFavorite(isFav)
        console.log("[v0] Campaign", campaignData.id, "is favorite:", isFav)
      }
    }
  }, [isInfluencerMode, campaignData])

  useEffect(() => {
    const imageScrollContainer = imageScrollRef.current
    if (!imageScrollContainer) return

    const handleImageScroll = () => {
      const scrollLeft = imageScrollContainer.scrollLeft
      const imageWidth = imageScrollContainer.scrollWidth / images.length
      const currentIndex = Math.round(scrollLeft / imageWidth)
      setCurrentImageSlide(currentIndex)
    }

    imageScrollContainer.addEventListener("scroll", handleImageScroll)
    return () => imageScrollContainer.removeEventListener("scroll", handleImageScroll)
  }, [images.length])

  if (!campaignData) {
    notFound()
  }

  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem("campaign-favorites")
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : []

    let newFavorites
    if (favorites.includes(campaignData.id)) {
      newFavorites = favorites.filter((id: number) => id !== campaignData.id)
      setIsFavorite(false)
      console.log("[v0] Removed from favorites:", campaignData.id)
    } else {
      newFavorites = [...favorites, campaignData.id]
      setIsFavorite(true)
      console.log("[v0] Added to favorites:", campaignData.id)
    }

    localStorage.setItem("campaign-favorites", JSON.stringify(newFavorites))
    console.log("[v0] Updated favorites:", newFavorites)
  }

  const handleApply = () => {
    console.log("[v0] Apply button clicked for campaign:", campaignData.id)
    const savedProposal = localStorage.getItem("influencer_proposal")
    console.log("[v0] Reloading proposal for modal:", savedProposal)
    if (savedProposal) {
      setProposalText(savedProposal)
    }
    setShowProposalModal(true)
  }

  const handleSubmitProposal = () => {
    console.log("[v0] Submitting proposal for campaign:", campaignData.id)

    const chatId = addChat({
      campaignId: campaignData.id,
      campaignTitle: campaignData.title,
      influencerId: 1,
      influencerName: "나",
      influencerAvatar: "/placeholder.svg",
      advertiserId: campaignData.advertiserId || 1,
      advertiserName: campaignData.company || "광고주",
      advertiserAvatar: "/placeholder.svg",
      lastMessage: "제안서를 보냈습니다",
      time: "방금 전",
      unreadCount: 0,
      isUnread: false,
      isActiveCollaboration: false,
      initiatedBy: "influencer",
      status: "pending",
      messages: [
        {
          id: 1,
          senderId: 1,
          senderType: "influencer",
          content: proposalText,
          timestamp: new Date().toISOString(),
          type: "proposal",
        },
      ],
    })

    addApplication({
      campaignId: campaignData.id,
      applicationStatus: "지원 완료",
      campaignStatus: "구인 진행중",
      campaignStatusColor: "bg-[#03C75A]",
      title: campaignData.title,
      advertiser: campaignData.company || "광고주",
      appliedTime: "방금 전",
      proposalText: proposalText,
    })

    console.log("[v0] Created chat", chatId, "with status: pending (hidden from influencer until accepted)")
    alert("캠페인 지원이 완료되었습니다! 광고주가 수락하면 채팅방이 생성됩니다.")
    setShowProposalModal(false)
  }

  const handlePreview = () => {
    setShowProposalModal(false)
    setShowPreviewModal(true)
  }

  const handleBackToProposal = () => {
    setShowPreviewModal(false)
    setShowProposalModal(true)
  }

  const getNegotiationText = () => {
    if (campaignData.negotiationOption === "yes") {
      return "협의 가능"
    } else if (campaignData.negotiationOption === "no") {
      return "협의 불가"
    }
    return "딜 가능"
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-1.5">
          <Link href="/campaigns">
            <Button variant="ghost" className="flex items-center h-9 px-2">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
          </Link>

          <div></div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <main className="space-y-4">
        <div className="relative">
          <div
            ref={imageScrollRef}
            className="flex overflow-x-auto scrollbar-hide rounded-b-3xl overflow-hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full w-full h-64 flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <img
                  src={image || "/placeholder.svg?height=256&width=400&query=campaign image"}
                  alt={`캠페인 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageSlide ? "bg-white w-6" : "bg-white/50"
                  }`}
                  onClick={() => {
                    const imageScrollContainer = imageScrollRef.current
                    if (imageScrollContainer) {
                      const imageWidth = imageScrollContainer.scrollWidth / images.length
                      imageScrollContainer.scrollTo({
                        left: index * imageWidth,
                        behavior: "smooth",
                      })
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4">
          <div className="flex gap-2 flex-wrap">
            <span className="bg-gray-100 text-gray-600 font-medium text-xs px-2 py-1 rounded">
              {campaignData.visitType === "visit" ? "방문형" : "비방문형"}
            </span>

            <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
              {campaignData.category}
            </span>

            {campaignData.contentType && (
              <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
                {campaignData.contentType === "릴스+피드" ? "릴스+게시물" : campaignData.contentType}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-black leading-tight">{campaignData.title}</h2>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{campaignData.company || "브랜드"}</span>
              <span>•</span>
              <span>{campaignData.timeAgo}</span>
            </div>

            {campaignData.visitType === "visit" && campaignData.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-[#51a66f]" />
                <span>{campaignData.location}</span>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-black">{campaignData.reward}</span>
                <div className="px-2 py-1 bg-white rounded-full">
                  <span className="text-xs text-gray-600">{getNegotiationText()}</span>
                </div>
              </div>
              {campaignData.recruitCount && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    <span className="text-[#7b68ee] font-semibold">{campaignData.applicants || 0}</span>/
                    {campaignData.recruitCount} 명 모집중
                  </p>
                  {campaignData.confirmedApplicants &&
                    campaignData.recruitCount &&
                    campaignData.confirmedApplicants / campaignData.recruitCount >= 0.7 && (
                      <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium">
                        마감 임박
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">{campaignData.applicants || 0}명의 지원자가 있어요.</p>
            <p className="text-sm text-gray-500">이 중 {campaignData.viewedApplicants || 0}명의 지원서를 확인했어요.</p>
            {campaignData.recruitCount && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-[#7b68ee]">{campaignData.recruitCount}명 모집</span> 중{" "}
                    <span className="font-medium text-[#7b68ee]">{campaignData.confirmedApplicants || 0}명 확정</span>,{" "}
                    <span className="font-medium text-gray-900">
                      {campaignData.recruitCount - (campaignData.confirmedApplicants || 0)}명 남음
                    </span>
                  </p>
                  {campaignData.confirmedApplicants &&
                    campaignData.recruitCount &&
                    campaignData.confirmedApplicants / campaignData.recruitCount >= 0.7 && (
                      <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium">
                        마감 임박
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-lg font-semibold text-black">캠페인 상세</h3>

            {campaignData.visitType && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-3">캠페인 유형</h4>
                <div className="flex items-center gap-2">
                  {campaignData.visitType === "visit" ? (
                    <>
                      <MapPin className="w-4 h-4 text-[#51a66f]" />
                      <span className="text-sm text-gray-700">방문형 캠페인</span>
                    </>
                  ) : (
                    <>
                      <Home className="w-4 h-4 text-[#51a66f]" />
                      <span className="text-sm text-gray-700">비방문형 캠페인</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {(campaignData.contentType || campaignData.videoDuration) && (
              <div className="pb-6 border-b border-gray-200 space-y-4">
                {campaignData.contentType && (
                  <div>
                    <h4 className="font-medium text-black mb-2">콘텐츠 유형</h4>
                    <span className="inline-block px-3 py-1 bg-white text-[#7b68ee] rounded-full text-sm border border-[#7b68ee]">
                      {campaignData.contentType}
                    </span>
                    {campaignData.videoDuration &&
                      (campaignData.contentType === "릴스" || campaignData.contentType === "릴스+피드") && (
                        <span className="inline-block px-3 py-1 bg-white text-[#7b68ee] rounded-full text-sm ml-2 border border-[#7b68ee]">
                          릴스 {campaignData.videoDuration}
                        </span>
                      )}
                  </div>
                )}
              </div>
            )}

            {campaignData.rewardType && (
              <div className="pb-6 border-b border-gray-200 space-y-3">
                <h4 className="font-medium text-black mb-3">제공 내역</h4>

                {campaignData.rewardType === "payment" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {campaignData.paymentAmount === "인플루언서와 직접 협의"
                          ? "협의 후 결정"
                          : `${campaignData.paymentAmount}만원`}
                      </span>
                      {campaignData.isDealPossible && (
                        <span className="px-2 py-1 bg-white text-[#7b68ee] rounded-full text-xs border border-[#7b68ee]">
                          딜 가능
                        </span>
                      )}
                    </div>
                    {campaignData.additionalRewardInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">추가 정보</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.additionalRewardInfo}</p>
                      </div>
                    )}
                  </div>
                )}

                {campaignData.rewardType === "product" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">{campaignData.productName}</p>
                    {campaignData.additionalRewardInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">추가 정보</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.additionalRewardInfo}</p>
                      </div>
                    )}
                  </div>
                )}

                {campaignData.rewardType === "other" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">{campaignData.otherReward || campaignData.reward}</p>
                    {campaignData.additionalRewardInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">추가 정보</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.additionalRewardInfo}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pb-6 border-b border-gray-200">
              <h4 className="font-medium text-black mb-2">📄 캠페인 설명</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {campaignData.description || campaignData.campaignDetails || "캠페인 상세 정보가 없습니다."}
              </p>
            </div>

            {campaignData.requiredContent && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-2">📝 콘텐츠에 포함할 내용</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.requiredContent}</p>
              </div>
            )}

            {campaignData.requiredScenes && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-2">🎬 촬영 시 포함할 장면</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.requiredScenes}</p>
              </div>
            )}

            {campaignData.hashtags && campaignData.hashtags.length > 0 && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-3">해시태그</h4>
                <p className="text-xs text-gray-500 mb-3">캠페인에 필수로 들어가야할 해시태그에요.</p>
                <div className="flex flex-wrap gap-2">
                  {campaignData.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm border border-blue-200"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {campaignData.linkUrl && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-2">관련 링크</h4>
                <a
                  href={campaignData.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#7b68ee] text-white rounded-lg text-sm hover:bg-[#7b68ee]/90 transition-colors"
                >
                  링크 보기
                </a>
              </div>
            )}

            {campaignData.additionalMemo && campaignData.additionalMemo !== campaignData.description && (
              <div className="pb-6 border-b border-gray-200">
                <h4 className="font-medium text-black mb-2">추가 메모</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaignData.additionalMemo}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isInfluencerMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex gap-3 max-w-md mx-auto px-4 py-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-gray-200 hover:border-[#7b68ee] transition-colors bg-transparent"
              onClick={toggleFavorite}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"}`}
              />
            </Button>

            <Button
              size="lg"
              className="flex-1 h-14 rounded-2xl bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold text-base shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleApply}
              disabled={!isProfileComplete}
            >
              {isProfileComplete ? "캠페인 지원하기" : "프로필 완성 후 지원 가능"}
            </Button>
          </div>
        </div>
      )}

      <Drawer open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden max-h-[95vh] flex flex-col">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-left">제안서</h3>
                <p className="text-sm text-gray-500 mb-3">
                  지금이 바로 당신의 매력을 보여줄 순간이에요! 브랜드가 "이 사람이다" 하고 느낄 수 있게, 당신만의 콘텐츠
                  스타일과 협업 강점을 자유롭게 소개해보세요.
                </p>
                <Textarea
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="제안서 내용을 입력해주세요..."
                  className="min-h-[200px] resize-none focus-visible:ring-[#7b68ee]"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 pt-3 pb-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview} className="flex-[3] bg-transparent h-12">
                미리보기
              </Button>
              <Button onClick={handleSubmitProposal} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                제안하기
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md w-full h-[90vh] p-0 gap-0 bg-white rounded-2xl overflow-hidden flex flex-col"
        >
          <button
            onClick={() => {
              setShowPreviewModal(false)
              setShowProposalModal(true)
            }}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt="광고주 잇다" />
                  <AvatarFallback>광</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">광고주 잇다</h3>
                    <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    인플루언서님이 제안했을때, 광고주님 시점으로 보는 화면이에요.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{
                      color: "#7b68ee",
                      borderColor: "#7b68ee",
                      backgroundColor: "rgba(123,104,238,0.12)",
                    }}
                  >
                    {campaignData.status || "구인 진행중"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xs font-medium text-gray-900 leading-tight">{campaignData.title}</h2>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">{campaignData.reward}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 transition-all duration-150"
                  style={{ minHeight: "36px" }}
                  disabled
                >
                  <CheckCircle className="w-4 h-4 text-[#7b68ee] flex-shrink-0" />
                  <span className="text-xs font-semibold truncate">협업 확정 요청</span>
                </button>
                <button
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-black/10 text-[#7b68ee] flex items-center justify-center gap-1.5 hover:border-black/20 transition-all duration-150"
                  style={{ minHeight: "36px" }}
                  disabled
                >
                  <PenTool className="w-4 h-4 text-[#7b68ee] flex-shrink-0" />
                  <span className="text-xs font-semibold truncate">후기 작성하기</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-4">
              <div className="flex justify-start">
                <ProfileCard influencer={influencerProfileData} />
              </div>

              {proposalText && (
                <div className="flex justify-start items-end gap-2">
                  <div className="bg-white text-gray-900 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{proposalText}</p>
                  </div>
                  <p className="text-xs text-gray-400 pb-1">방금 전</p>
                </div>
              )}

              {!proposalText && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 shadow-sm rounded-2xl px-4 py-3 max-w-[75%]">
                    <p className="text-sm">제안서 내용을 입력하면 여기에 표시됩니다.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-white space-y-3 pb-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </Button>
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="w-full bg-transparent text-sm outline-none"
                    disabled
                  />
                </div>
                <Button size="icon" className="h-10 w-10 bg-[#7b68ee] hover:bg-[#7b68ee]/90 rounded-full flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
