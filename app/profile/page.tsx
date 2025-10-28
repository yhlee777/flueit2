"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useCampaigns } from "@/lib/campaign-store"
import { useApplicationStore } from "@/lib/application-store"
import { useChatStore } from "@/lib/chat-store"
import { checkAdvertiserProfileComplete, getAdvertiserProfileCompletion } from "@/lib/profile-utils"
import {
  Check,
  Heart,
  Megaphone,
  Clock,
  Users,
  User,
  ChevronRight,
  PenTool,
  Settings,
  HelpCircle,
  FileCheck,
  LogOut,
  TrendingUp,
  MessageCircle,
  Star,
  MapPin,
  MoreVertical,
} from "lucide-react"
import ProfileCard from "@/components/profile-card" // Import ProfileCard component
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

const userData = {
  name: "밍밍 부인",
  avatar: "", // Removed default avatar image
  verified: true,
}

const mockApplications = [
  {
    id: 1,
    applicationStatus: "지원 완료",
    campaignStatus: "구인 진행중",
    campaignStatusColor: "bg-[#7b68ee]",
    title: "서울 강남 뷰티 살롱 체험단 모집",
    advertiser: "뷰티살롱",
    appliedTime: "2시간 전",
  },
  {
    id: 2,
    applicationStatus: "지원 완료",
    campaignStatus: "구인 진행중",
    campaignStatusColor: "bg-[#7b68ee]",
    title: "홍대 카페 인플루언서 협업",
    advertiser: "카페오너",
    appliedTime: "1일 전",
  },
  {
    id: 3,
    applicationStatus: "다음기회에",
    campaignStatus: "구인 마감",
    campaignStatusColor: "bg-gray-500",
    title: "제주도 호텔 리뷰 이벤트",
    advertiser: "제주호텔",
    appliedTime: "2일 전",
  },
  {
    id: 4,
    applicationStatus: "다음기회에",
    campaignStatus: "구인 마감",
    campaignStatusColor: "bg-gray-500",
    title: "부산 맛집 탐방 프로젝트",
    advertiser: "맛집투어",
    appliedTime: "3일 전",
  },
]

const statusOptions = [
  { value: "구인 진행 중", color: "bg-[#7b68ee] text-white" },
  { value: "구인 마감", color: "bg-gray-500 text-white" },
  { value: "비공개 글", color: "bg-blue-500 text-white" },
]

const mockApplicantsData: Record<number, any[]> = {
  1: [
    {
      id: 1,
      name: "김뷰티",
      followers: "125K",
      engagement: 4.2,
      category: "뷰티·화장품",
      region: "서울",
      price: "50만원",
      avatar: "/korean-beauty-influencer.jpg",
      verified: true,
      trustScore: 4.8,
    },
    {
      id: 2,
      name: "박뷰티",
      followers: "89K",
      engagement: 5.1,
      category: "뷰티·화장품",
      region: "부산",
      price: "35만원",
      avatar: "/korean-beauty-influencer-2.jpg",
      verified: true,
      trustScore: 4.6,
    },
    {
      id: 3,
      name: "이뷰티",
      followers: "203K",
      engagement: 3.8,
      category: "뷰티·화장품",
      region: "서울",
      price: "80만원",
      avatar: "/korean-beauty-influencer-3.jpg",
      verified: false,
      trustScore: 4.3,
    },
  ],
}

export default function ProfilePage() {
  const router = useRouter()
  const { getUserCreatedCampaigns, updateCampaignStatus } = useCampaigns()
  const userCampaigns = getUserCreatedCampaigns()
  const { getApplications, removeApplication } = useApplicationStore()
  const applications = getApplications()
  const { getChatsForInfluencer } = useChatStore()

  const [isInfluencerMode, setIsInfluencerMode] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [influencerProfileCompletion, setInfluencerProfileCompletion] = useState(0)
  const [isInfluencerProfileComplete, setIsInfluencerProfileComplete] = useState(false)

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [tempStatus, setTempStatus] = useState("")

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalText, setProposalText] = useState("")

  const [isProposalPreviewOpen, setIsProposalPreviewOpen] = useState(false)

  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)

  const [isPromotionAlertOpen, setIsPromotionAlertOpen] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)

  const [userAvatar, setUserAvatar] = useState("") // Initialize with empty string instead of userData.avatar
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 })
  const [avatarScale, setAvatarScale] = useState(1.0)

  const [username, setUsername] = useState("")
  const [instagramVerificationStatus, setInstagramVerificationStatus] = useState<"idle" | "pending" | "verified">(
    "idle",
  )

  const [influencerProfileData, setInfluencerProfileData] = useState({
    category: "뷰티·화장품",
    followers: "125K",
    engagement: "4.2%",
    region: "서울시 강남구",
    trustScore: 4.8,
    hashtags: ["#뷰티", "#스킨케어", "#체험단"],
  })

  const calculateInfluencerProfileCompletion = () => {
    let completion = 0
    const avatar = localStorage.getItem("user_avatar")
    const name = localStorage.getItem("username")
    const bio = localStorage.getItem("influencer_bio")
    const instagram = localStorage.getItem("influencer_instagram_id")
    const category = localStorage.getItem("influencer_category")
    const hashtagsStr = localStorage.getItem("influencer_profile_hashtags")
    let hashtags: string[] = []
    try {
      hashtags = hashtagsStr ? JSON.parse(hashtagsStr) : []
    } catch {
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

    console.log("[v0] Influencer profile completion data:", profileData)

    if (profileData.hasAvatar) completion += 16.67
    if (profileData.hasName) completion += 16.67
    if (profileData.hasBio) completion += 16.67
    if (profileData.hasInstagram) completion += 16.67
    if (profileData.hasCategory) completion += 16.67
    if (profileData.hasHashtags) completion += 16.67

    // Round to nearest integer
    completion = Math.round(completion)

    console.log("[v0] Influencer profile completion percentage:", completion)
    return completion
  }

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    const savedAvatar = localStorage.getItem("user_avatar")
    const savedPosX = localStorage.getItem("user_avatar_position_x")
    const savedPosY = localStorage.getItem("user_avatar_position_y")
    const savedScale = localStorage.getItem("user_avatar_scale")
    const savedUsername = localStorage.getItem("username")
    const savedVerificationStatus = localStorage.getItem("influencer_instagram_verification_status")

    if (savedAvatar) {
      setUserAvatar(savedAvatar)
    }
    if (savedPosX && savedPosY) {
      setAvatarPosition({ x: Number.parseFloat(savedPosX), y: Number.parseFloat(savedPosY) })
    }
    if (savedScale) {
      setAvatarScale(Number.parseFloat(savedScale))
    }
    if (savedUsername) {
      setUsername(savedUsername)
    }
    if (savedVerificationStatus) {
      setInstagramVerificationStatus(savedVerificationStatus as "idle" | "pending" | "verified")
    }

    if (!influencerMode) {
      const completion = getAdvertiserProfileCompletion()
      const isComplete = checkAdvertiserProfileComplete()
      setProfileCompletion(completion)
      setIsProfileComplete(isComplete)
    } else {
      const influencerCompletion = calculateInfluencerProfileCompletion()
      setInfluencerProfileCompletion(influencerCompletion)
      setIsInfluencerProfileComplete(influencerCompletion === 100)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (!isInfluencerMode) {
          const completion = getAdvertiserProfileCompletion()
          const isComplete = checkAdvertiserProfileComplete()
          setProfileCompletion(completion)
          setIsProfileComplete(isComplete)
        } else {
          const influencerCompletion = calculateInfluencerProfileCompletion()
          setInfluencerProfileCompletion(influencerCompletion)
          setIsInfluencerProfileComplete(influencerCompletion === 100)
        }
      }
    }

    const handleFocus = () => {
      if (!isInfluencerMode) {
        const completion = getAdvertiserProfileCompletion()
        const isComplete = checkAdvertiserProfileComplete()
        setProfileCompletion(completion)
        setIsProfileComplete(isComplete)
      } else {
        const influencerCompletion = calculateInfluencerProfileCompletion()
        setInfluencerProfileCompletion(influencerCompletion)
        setIsInfluencerProfileComplete(influencerCompletion === 100)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isInfluencerMode])

  useEffect(() => {
    if (isInfluencerMode) {
      const savedProposal = localStorage.getItem("influencer_proposal")
      if (savedProposal) {
        setProposalText(savedProposal)
      }

      const savedCategory = localStorage.getItem("influencer_category")
      const savedInstagram = localStorage.getItem("influencer_instagram")
      if (savedCategory || savedInstagram) {
        setInfluencerProfileData((prev) => ({
          ...prev,
          category: savedCategory || prev.category,
        }))
      }
    }
  }, [isInfluencerMode])

  const handleStatusEdit = (jobId: number, currentStatus: string) => {
    setSelectedJobId(jobId)
    setTempStatus(currentStatus)
    setIsStatusModalOpen(true)
  }

  const handleStatusApply = () => {
    if (selectedJobId && tempStatus) {
      updateCampaignStatus(selectedJobId, tempStatus as "구인 진행 중" | "구인 마감" | "비공개 글")
    }
    setIsStatusModalOpen(false)
    setSelectedJobId(null)
    setTempStatus("")
  }

  const handleProposalEdit = () => {
    const savedProposal = localStorage.getItem("influencer_proposal")
    if (savedProposal) {
      setProposalText(savedProposal)
    }
    setIsProposalModalOpen(true)
  }

  const handleProposalSave = () => {
    localStorage.setItem("influencer_proposal", proposalText)
    setIsProposalModalOpen(false)
  }

  const handleProposalPreview = () => {
    setIsProposalModalOpen(false)
    setIsProposalPreviewOpen(true)
  }

  const handleBackToProposal = () => {
    setIsProposalPreviewOpen(false)
    setIsProposalModalOpen(true)
  }

  const handleProposalCancel = () => {
    setIsProposalModalOpen(false)
  }

  const getStatusColor = (status: string) => {
    return statusOptions.find((opt) => opt.value === status)?.color || "bg-[#7b68ee] text-white"
  }

  const handleLogout = () => {
    router.push("/")
  }

  const handleApplicantManagement = (campaignId: number) => {
    setSelectedCampaignId(campaignId)
    setIsApplicantModalOpen(true)
  }

  const handleApplicantClick = (applicantId: number) => {
    setIsApplicantModalOpen(false)
    router.push(`/chat/${applicantId}`)
  }

  const handlePromotionClick = () => {
    setIsPromotionAlertOpen(true)
  }

  const handleDeleteClick = (applicationId: number) => {
    setSelectedApplicationId(applicationId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedApplicationId) {
      removeApplication(selectedApplicationId)
      console.log("[v0] Deleted application:", selectedApplicationId)
    }
    setIsDeleteModalOpen(false)
    setSelectedApplicationId(null)
  }

  const isChatAccepted = (campaignId: number) => {
    const chats = getChatsForInfluencer(1) // Assuming influencer ID is 1
    return chats.some(
      (chat) => chat.campaignId === campaignId && (chat.status === "accepted" || chat.status === "active"),
    )
  }

  const handleChatClick = (campaignId: number) => {
    const chats = getChatsForInfluencer(1) // Assuming influencer ID is 1
    const chat = chats.find(
      (chat) => chat.campaignId === campaignId && (chat.status === "accepted" || chat.status === "active"),
    )
    if (chat) {
      router.push(`/chat/${chat.id}`)
    }
  }

  if (!isInfluencerMode) {
    // ADVERTISER MODE UI
    return (
      <div className="min-h-screen bg-white pb-20">
        <TopHeader title="내 프로필" showSearch={false} showNotifications={true} />

        <main className="px-4 py-6 space-4">
          <Link href="/profile/edit">
            <div className="bg-gray-100 rounded-2xl p-3 cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden relative bg-gray-200 flex items-center justify-center">
                    {userAvatar ? (
                      <img
                        src={userAvatar || "/placeholder.svg"}
                        alt={username || "프로필"}
                        className="absolute object-cover"
                        style={{
                          transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarScale})`,
                          transformOrigin: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    ) : (
                      <User className="w-7 h-7 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h2 className={`text-base font-semibold ${username ? "text-gray-900" : "text-gray-400"}`}>
                      {username || "프로필을 완성하세요"}
                    </h2>
                    {instagramVerificationStatus === "verified" && (
                      <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Link>

          {!isProfileComplete && (
            <div className="bg-gray-100 rounded-2xl p-4 mt-6">
              <p className="text-sm text-gray-500 mb-2">프로필 정보를 입력하고 협업을 진행해요.</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#7b68ee] h-full rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{profileCompletion}%</span>
              </div>
            </div>
          )}

          <div className="bg-gray-100 rounded-2xl mt-3">
            <div className="grid grid-cols-3 relative">
              <div>
                <Link href="/profile/favorites">
                  <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">찜 목록</span>
                  </div>
                </Link>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300"
                  style={{ left: `${(1 * 100) / 3}%` }}
                />
              </div>

              <div>
                <Link href="/profile/my-campaigns">
                  <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0">
                    <Megaphone className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">내 캠페인</span>
                  </div>
                </Link>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300"
                  style={{ left: `${(2 * 100) / 3}%` }}
                />
              </div>

              <div>
                <Link href="/profile/recent">
                  <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">최근 기록</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/campaigns/create">
            <div className="bg-[#7b68ee] rounded-2xl p-2 cursor-pointer hover:bg-[#7b68ee]/90 transition-colors mt-6">
              <div className="text-center flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-base font-medium text-white">캠페인 작성하러 가기</span>
              </div>
            </div>
          </Link>

          <div
            onClick={handlePromotionClick}
            className="bg-gray-100 rounded-2xl p-2 cursor-pointer hover:bg-gray-200 transition-colors mt-3"
          >
            <div className="text-center flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-700" />
              <span className="text-base font-medium text-gray-700">내 캠페인 홍보하기</span>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-gray-900">캠페인 관리</h3>

            {userCampaigns.length === 0 ? (
              <div className="bg-gray-100 rounded-2xl p-8 text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">작성한 캠페인이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-0">
                {userCampaigns.map((campaign, index) => (
                  <div key={campaign.id}>
                    {index === 0 && <div className="border-b border-gray-100" />}
                    <div className="py-6 pb-8">
                      <Link href={`/campaigns/${campaign.id}`} className="block">
                        <div className="flex items-start gap-3">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 self-start">
                            <img
                              src={campaign.thumbnail || "/placeholder.svg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`${getStatusColor(campaign.status)} text-xs px-3 py-1 rounded-full`}>
                                {campaign.status}
                              </span>
                            </div>

                            <h4 className="font-semibold text-sm text-black leading-tight mb-1">{campaign.title}</h4>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-black">{campaign.reward}</p>
                              </div>
                              {campaign.recruitCount && (
                                <p className="text-sm text-gray-600">
                                  <span className="text-sm text-[#7b68ee] font-semibold">
                                    {campaign.applicants || 0}
                                  </span>
                                  <span className="text-sm">/{campaign.recruitCount}</span>{" "}
                                  <span className="text-xs text-gray-500">명 모집중</span>
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
                                  {campaign.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusEdit(campaign.id, campaign.status)}
                          className="flex-1 text-sm h-10 border-gray-300 hover:border-gray-400 bg-white rounded-lg"
                        >
                          상태 변경
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplicantManagement(campaign.id)}
                          className="flex-1 text-sm h-10 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white rounded-lg"
                        >
                          지원자 관리
                        </Button>
                      </div>
                    </div>
                    {index < userCampaigns.length - 1 && <div className="border-b border-gray-100" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-8">고객 지원</h3>

          <div className="bg-gray-100 rounded-2xl p-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">설정</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">공지사항</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">고객센터</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">이용 약관</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>

              <div
                onClick={handleLogout}
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">로그아웃</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </main>

        <Drawer open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pt-2 pb-2 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">상태 변경</h3>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTempStatus(option.value)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        tempStatus === option.value
                          ? "bg-[#7b68ee] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DrawerFooter className="pt-3 pb-6">
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-[3] bg-transparent h-12">
                    취소
                  </Button>
                </DrawerClose>
                <Button onClick={handleStatusApply} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                  적용
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={isApplicantModalOpen} onOpenChange={setIsApplicantModalOpen}>
          <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden max-h-[80vh]">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pt-2 pb-4">
              <h3 className="font-semibold text-lg mb-4">지원자 목록</h3>
              <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                {selectedCampaignId &&
                  mockApplicantsData[selectedCampaignId]?.map((applicant) => (
                    <div
                      key={applicant.id}
                      onClick={() => handleApplicantClick(applicant.id)}
                      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                          <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-black">{applicant.name}</h4>
                            {applicant.verified && (
                              <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{applicant.followers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{applicant.engagement}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{applicant.trustScore}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
                              {applicant.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{applicant.region}</span>
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-[#7b68ee] mt-2">협업비: {applicant.price}</div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}

                {selectedCampaignId && !mockApplicantsData[selectedCampaignId] && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>아직 지원자가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <AlertDialog open={isPromotionAlertOpen} onOpenChange={setIsPromotionAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>알림</AlertDialogTitle>
              <AlertDialogDescription>해당 기능은 아직 준비중이에요</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-[#7b68ee] hover:bg-[#7b68ee]/90">확인</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // INFLUENCER MODE UI
  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader title="내 프로필" showSearch={false} showNotifications={true} />

      <main className="px-4 py-6 space-4">
        <Link href="/profile/edit">
          <div className="bg-gray-100 rounded-2xl p-3 cursor-pointer hover:bg-gray-200 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full overflow-hidden relative bg-gray-200 flex items-center justify-center">
                  {userAvatar ? (
                    <img
                      src={userAvatar || "/placeholder.svg"}
                      alt={username || "프로필"}
                      className="absolute object-cover"
                      style={{
                        transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px) scale(${avatarScale})`,
                        transformOrigin: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <User className="w-7 h-7 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-semibold ${username ? "text-gray-900" : "text-gray-400"}`}>
                    {username || "프로필을 완성하세요"}
                  </h2>
                  {instagramVerificationStatus === "verified" && (
                    <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>

        {!isInfluencerProfileComplete && (
          <div className="bg-gray-100 rounded-2xl p-4 mt-6">
            <p className="text-sm text-gray-500 mb-2">프로필 정보를 입력하고 협업을 진행해요.</p>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#7b68ee] h-full rounded-full transition-all duration-300"
                style={{ width: `${influencerProfileCompletion}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">{influencerProfileCompletion}%</span>
            </div>
          </div>
        )}

        <div className="bg-gray-100 rounded-2xl mt-6">
          <div className="grid grid-cols-3 relative">
            <div>
              <Link href="/profile/favorites">
                <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">찜 목록</span>
                </div>
              </Link>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300"
                style={{ left: `${(1 * 100) / 3}%` }}
              />
            </div>

            <div>
              <div
                onClick={handleProposalEdit}
                className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0"
              >
                <FileCheck className="h-5 w-5 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">내 제안서 관리</span>
              </div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-300"
                style={{ left: `${(2 * 100) / 3}%` }}
              />
            </div>

            <div>
              <Link href="/profile/recent">
                <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer py-5 min-w-0">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">최근 기록</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Link href="/campaigns" className="mt-6 block">
          <div className="bg-[#7b68ee] rounded-2xl p-2 cursor-pointer hover:bg-[#7b68ee]/90 transition-colors">
            <div className="text-center flex items-center justify-center gap-2">
              <PenTool className="h-4 w-4 text-white" />
              <span className="text-base font-medium text-white">캠페인 지원하러 가기</span>
            </div>
          </div>
        </Link>

        <div className="bg-gray-100 rounded-2xl p-2 cursor-pointer hover:bg-gray-200 transition-colors mt-3">
          <div className="text-center flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-700" />
            <span className="text-base font-medium text-gray-700">내 프로필 홍보하기</span>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold text-gray-900">지원 내역</h3>

          {applications.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">아직 지원한 캠페인이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="py-4 space-y-1">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{application.applicationStatus}</span>
                      <Badge className={`${application.campaignStatusColor} text-white text-xs px-3 py-1 rounded-full`}>
                        {application.campaignStatus}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(application.id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-gray-900 text-base">{application.title}</h4>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{application.advertiser}</span>
                    <span className="text-gray-400">· {application.appliedTime}</span>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/campaigns/${application.campaignId}`}
                      className="text-sm text-[#7b68ee] font-medium flex items-center gap-1 hover:underline w-fit"
                    >
                      캠페인 보기
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm h-8 border-gray-300 hover:border-gray-400 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                      disabled={application.applicationStatus === "다음기회에"}
                      onClick={() => handleDeleteClick(application.id)}
                    >
                      지원 취소
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-sm h-8 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7b68ee]"
                      disabled={!isChatAccepted(application.campaignId)}
                      onClick={() => handleChatClick(application.campaignId)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      채팅 하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-2 mt-8">
          <h3 className="text-lg font-semibold text-gray-900">고객 지원</h3>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 mt-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">설정</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">공지사항</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">고객센터</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">이용 약관</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">로그아웃</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </main>

      <Drawer open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-2 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">상태 변경</h3>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempStatus(option.value)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      tempStatus === option.value
                        ? "bg-[#7b68ee] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-[3] bg-transparent h-12">
                  취소
                </Button>
              </DrawerClose>
              <Button onClick={handleStatusApply} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                적용
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isProposalModalOpen} onOpenChange={setIsProposalModalOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden max-h-[95vh] flex flex-col">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-left">제안서 관리</h3>
                <p className="text-sm text-gray-500 mb-3">
                  지금이 바로 당신의 매력을 보여줄 순간이에요! 브랜드가 "이 사람이다" 하고 느낄 수 있게, 당신만의 콘텐츠
                  스타일과 협업 강점을 자유롭게 소개해보세요.
                </p>
                <Textarea
                  placeholder="제안서 내용을 입력해주세요..."
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="min-h-[200px] resize-none focus-visible:ring-[#7b68ee]"
                />
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6 border-t border-gray-100">
            <div className="flex gap-2">
              <Button onClick={handleProposalPreview} variant="outline" className="flex-[3] bg-transparent h-12">
                미리보기
              </Button>
              <Button onClick={handleProposalSave} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                저장하기
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={isProposalPreviewOpen} onOpenChange={setIsProposalPreviewOpen}>
        <DialogContent
          className="max-w-md w-full h-[90vh] p-0 gap-0 bg-white rounded-2xl overflow-hidden flex flex-col"
          showCloseButton={false}
        >
          <button
            onClick={handleBackToProposal}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div className="flex flex-col h-full">
            <div className="px-4 pt-6 pb-3 border-b border-gray-100">
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
                    구인 진행중
                  </span>
                </div>
                <div>
                  <h2 className="text-xs font-medium text-gray-900 leading-tight">예시 캠페인 제목</h2>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">50만원</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
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

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-4">
              <div className="flex justify-start">
                <ProfileCard
                  influencer={{
                    ...userData,
                    ...influencerProfileData,
                  }}
                />
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

      <Drawer open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4">
            <Button
              onClick={handleDeleteConfirm}
              className="w-full bg-white hover:bg-gray-50 text-red-500 h-12 rounded-lg text-left justify-start"
            >
              삭제하기
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
