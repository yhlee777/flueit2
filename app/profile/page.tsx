"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopHeader } from "@/components/top-header"
import { signOut } from "next-auth/react"
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
// ❌ 삭제: import { useApplicationStore } from "@/lib/application-store"
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
  Loader2,
} from "lucide-react"
import ProfileCard from "@/components/profile-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

// ✅ DB 스키마와 일치하는 Campaign 타입 (snake_case)
interface Campaign {
  id: string
  user_id: string | null
  title: string
  category: string
  status: string
  recruit_type: string | null
  recruit_count: number | null  // ✅ snake_case
  applicants: number
  confirmed_applicants: number  // ✅ snake_case
  visit_type: "visit" | "non-visit" | null
  reward_type: string | null
  payment_amount: string | null
  thumbnail: string | null
  views: number
  created_at: string
  updated_at: string
}

const userData = {
  name: "밍밍 부인",
  avatar: "",
  verified: true,
}

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
  ],
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  // ❌ 삭제: const { getApplications, removeApplication } = useApplicationStore()
  // ❌ 삭제: const applications = getApplications()
  
  const { getChatsForInfluencer } = useChatStore()

  // ✅ 추가: DB에서 지원 내역 가져오기
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  // ✅ DB에서 캠페인 목록 가져오기
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)

  const [isInfluencerMode, setIsInfluencerMode] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [influencerProfileCompletion, setInfluencerProfileCompletion] = useState(0)
  const [isInfluencerProfileComplete, setIsInfluencerProfileComplete] = useState(false)

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [tempStatus, setTempStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [proposalText, setProposalText] = useState("")

  const [isProposalPreviewOpen, setIsProposalPreviewOpen] = useState(false)

  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)

  const [isPromotionAlertOpen, setIsPromotionAlertOpen] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const [userAvatar, setUserAvatar] = useState("")
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

    if (profileData.hasAvatar) completion += 16.67
    if (profileData.hasName) completion += 16.67
    if (profileData.hasBio) completion += 16.67
    if (profileData.hasInstagram) completion += 16.67
    if (profileData.hasCategory) completion += 16.67
    if (profileData.hasHashtags) completion += 16.67

    return Math.round(completion)
  }

  // ✅ 추가: DB에서 지원 내역 로드
  const fetchMyApplications = async () => {
    if (!session?.user?.id) return

    try {
      setLoadingApplications(true)
      console.log("🔍 지원 내역 로드 중...")

      const response = await fetch(`/api/applications?influencer_id=${session.user.id}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 지원 내역 조회 오류:", data)
        return
      }

      console.log("✅ 지원 내역:", data.applications)
      setApplications(data.applications || [])
    } catch (error) {
      console.error("❌ 지원 내역 로드 오류:", error)
    } finally {
      setLoadingApplications(false)
    }
  }

  // ✅ DB에서 캠페인 목록 로드
  const fetchUserCampaigns = async () => {
    if (!session?.user?.id) return

    try {
      setLoadingCampaigns(true)
      console.log("🔍 사용자 캠페인 목록 로드 중...")

      const response = await fetch(`/api/campaigns?user_id=${session.user.id}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 캠페인 조회 오류:", data)
        return
      }

      console.log("✅ 캠페인 목록:", data.campaigns)
      setUserCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("❌ 캠페인 목록 로드 오류:", error)
    } finally {
      setLoadingCampaigns(false)
    }
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

    if (savedAvatar) setUserAvatar(savedAvatar)
    if (savedPosX && savedPosY) {
      setAvatarPosition({ x: Number.parseFloat(savedPosX), y: Number.parseFloat(savedPosY) })
    }
    if (savedScale) setAvatarScale(Number.parseFloat(savedScale))
    if (savedUsername) setUsername(savedUsername)
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

  // ✅ 인플루언서 모드일 때 지원 내역 로드
  useEffect(() => {
    if (isInfluencerMode && session?.user?.id) {
      fetchMyApplications()
    }
  }, [session, isInfluencerMode])

  // ✅ 광고주 모드일 때 캠페인 로드
  useEffect(() => {
    if (!isInfluencerMode && session?.user?.id) {
      fetchUserCampaigns()
    }
  }, [session, isInfluencerMode])

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
        // 포커스 시 캠페인 목록도 새로고침
        if (session?.user?.id) {
          fetchUserCampaigns()
        }
      } else {
        const influencerCompletion = calculateInfluencerProfileCompletion()
        setInfluencerProfileCompletion(influencerCompletion)
        setIsInfluencerProfileComplete(influencerCompletion === 100)
        // ✅ 추가: 포커스 시 지원 내역도 새로고침
        if (session?.user?.id) {
          fetchMyApplications()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isInfluencerMode, session])

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

  const handleStatusEdit = (jobId: string, currentStatus: string) => {
    setSelectedJobId(jobId)
    setTempStatus(currentStatus)
    setIsStatusModalOpen(true)
  }

  // ✅ DB에 상태 변경 요청
  const handleStatusApply = async () => {
    if (!selectedJobId || !tempStatus) return

    try {
      setUpdatingStatus(true)
      console.log(`🔄 캠페인 ${selectedJobId} 상태 변경 시도: ${tempStatus}`)

      const response = await fetch(`/api/campaigns/${selectedJobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: tempStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 상태 변경 오류:", data)
        alert(data.error || "상태 변경에 실패했습니다.")
        return
      }

      console.log("✅ 상태 변경 성공:", data)
      alert("캠페인 상태가 변경되었습니다.")

      // 목록 새로고침
      await fetchUserCampaigns()
    } catch (error) {
      console.error("❌ 상태 변경 오류:", error)
      alert("상태 변경 중 오류가 발생했습니다.")
    } finally {
      setUpdatingStatus(false)
      setIsStatusModalOpen(false)
      setSelectedJobId(null)
      setTempStatus("")
    }
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

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      })
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

  const handleApplicantManagement = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}/applicants`)
  }

  const handleApplicantClick = (applicantId: number) => {
    setIsApplicantModalOpen(false)
    router.push(`/chat/${applicantId}`)
  }

  const handlePromotionClick = () => {
    setIsPromotionAlertOpen(true)
  }

  const handleDeleteClick = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setIsDeleteModalOpen(true)
  }

  // ✅ 수정: DB API 호출로 지원 취소
  const handleDeleteConfirm = async () => {
    if (!selectedApplicationId) return

    try {
      console.log("🔍 지원 취소 시도:", selectedApplicationId)

      const response = await fetch(`/api/applications/${selectedApplicationId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 지원 취소 오류:", data)
        alert(data.error || "지원 취소에 실패했습니다.")
        return
      }

      console.log("✅ 지원 취소 성공")
      alert("지원이 취소되었습니다.")

      // 목록 새로고침
      await fetchMyApplications()
    } catch (error) {
      console.error("❌ 지원 취소 오류:", error)
      alert("지원 취소 중 오류가 발생했습니다.")
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedApplicationId(null)
    }
  }

  const isChatAccepted = (campaignId: number) => {
    const chats = getChatsForInfluencer(1)
    return chats.some(
      (chat) => chat.campaignId === campaignId && (chat.status === "accepted" || chat.status === "active"),
    )
  }

  const handleChatClick = (campaignId: number) => {
    const chats = getChatsForInfluencer(1)
    const chat = chats.find(
      (chat) => chat.campaignId === campaignId && (chat.status === "accepted" || chat.status === "active"),
    )
    if (chat) {
      router.push(`/chat/${chat.id}`)
    }
  }

  // ✅ 리워드 표시 함수 추가
  const getRewardDisplay = (campaign: Campaign) => {
    if (campaign.reward_type === "payment" && campaign.payment_amount) {
      return campaign.payment_amount
    }
    if (campaign.reward_type === "product") {
      return "제품 제공"
    }
    return "협의"
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
                    <h2 className={`text-xl font-bold ${username ? "text-gray-900" : "text-gray-400"}`}>
                      {isProfileComplete ? username || "프로필 변경하기" : "프로필을 완성하세요"}
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

            {loadingCampaigns ? (
              <div className="bg-gray-100 rounded-2xl p-8 text-center">
                <Loader2 className="h-12 w-12 text-[#7b68ee] mx-auto mb-3 animate-spin" />
                <p className="text-gray-600 text-sm">캠페인을 불러오는 중...</p>
              </div>
            ) : userCampaigns.length === 0 ? (
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
                                <p className="text-base font-bold text-black">{getRewardDisplay(campaign)}</p>
                              </div>
                              {/* ✅ snake_case 사용 */}
                              {campaign.recruit_count && (
                                <p className="text-sm text-gray-600">
                                  <span className="text-sm text-[#7b68ee] font-semibold">
                                    {campaign.applicants || 0}
                                  </span>
                                  <span className="text-sm">/{campaign.recruit_count}</span>{" "}
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
                      disabled={updatingStatus}
                      className={`w-full p-3 rounded-lg text-left transition-colors disabled:opacity-50 ${
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
                  <Button variant="outline" className="flex-[3] bg-transparent h-12" disabled={updatingStatus}>
                    취소
                  </Button>
                </DrawerClose>
                <Button
                  onClick={handleStatusApply}
                  className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    "적용"
                  )}
                </Button>
              </div>
            </DrawerFooter>
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
                  <h2 className={`text-xl font-bold ${username ? "text-gray-900" : "text-gray-400"}`}>
                    {isProfileComplete ? (username || "프로필 변경하기") : "프로필을 완성하세요"}
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

          {/* ✅ 추가: 로딩 상태 및 DB 데이터 표시 */}
          {loadingApplications ? (
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <Loader2 className="h-12 w-12 text-[#7b68ee] mx-auto mb-3 animate-spin" />
              <p className="text-gray-600 text-sm">지원 내역을 불러오는 중...</p>
            </div>
          ) : applications.length === 0 ? (
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