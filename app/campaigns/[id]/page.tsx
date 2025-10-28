"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, MapPin, Calendar, Users, Eye, Heart, MessageCircle } from "lucide-react"
import Image from "next/image"

interface Campaign {
  id: string
  user_id: string
  title: string
  category: string
  status: string
  recruit_type: string
  recruit_count: number
  applicants: number
  confirmed_applicants: number
  visit_type: string
  reward_type: string
  payment_amount: string | null
  product_name: string | null
  other_reward: string | null
  additional_reward_info: string | null
  is_deal_possible: boolean
  negotiation_option: string | null
  content_type: string | null
  video_duration: string | null
  required_content: string | null
  required_scenes: string | null
  hashtags: string[]
  link_url: string | null
  additional_memo: string | null
  uploaded_photos: string[]
  thumbnail: string | null
  views: number
  likes: number
  comments: number
  created_at: string
  updated_at: string
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [hasApplied, setHasApplied] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  // 캠페인 데이터 로드
  useEffect(() => {
    if (!campaignId) return

    const fetchCampaign = async () => {
      try {
        setLoading(true)
        console.log("🔍 캠페인 조회 시작:", campaignId)

        const response = await fetch(`/api/campaigns/${campaignId}`)
        const data = await response.json()

        if (!response.ok) {
          console.error("❌ API 오류:", data)
          alert(data.error || "캠페인을 불러오는데 실패했습니다.")
          router.push("/campaigns")
          return
        }

        console.log("✅ 캠페인 데이터:", data.campaign)
        setCampaign(data.campaign)

        // 본인 캠페인 여부 확인
        if (session?.user?.id) {
          setIsOwner(data.campaign.user_id === session.user.id)
        }

        // 이미 지원했는지 확인
        if (data.applications && session?.user?.id) {
          const userApplication = data.applications.find(
            (app: any) => app.influencer_id === session.user.id
          )
          setHasApplied(!!userApplication)
        }
      } catch (error) {
        console.error("❌ 캠페인 조회 오류:", error)
        alert("캠페인을 불러오는데 실패했습니다.")
        router.push("/campaigns")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId, session, router])

  // 지원하기
  const handleApply = async () => {
    if (!session) {
      alert("로그인이 필요합니다.")
      router.push("/login")
      return
    }

    if (isOwner) {
      alert("본인의 캠페인에는 지원할 수 없습니다.")
      return
    }

    if (hasApplied) {
      alert("이미 지원한 캠페인입니다.")
      return
    }

    setShowApplyModal(true)
  }

  // 지원 제출
  const handleSubmitApplication = async () => {
    try {
      setIsApplying(true)
      console.log("🔍 캠페인 지원 시작:", campaignId)

      const response = await fetch(`/api/campaigns/${campaignId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: applicationMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 지원 실패:", data)
        alert(data.error || "지원에 실패했습니다.")
        return
      }

      console.log("✅ 지원 성공:", data)
      alert("캠페인에 성공적으로 지원되었습니다!")
      setShowApplyModal(false)
      setApplicationMessage("")
      setHasApplied(true)

      // 캠페인 데이터 다시 로드
      window.location.reload()
    } catch (error) {
      console.error("❌ 지원 오류:", error)
      alert("지원 중 오류가 발생했습니다.")
    } finally {
      setIsApplying(false)
    }
  }

  // 수정하기
  const handleEdit = () => {
    router.push(`/campaigns/${campaignId}/edit`)
  }

  // 삭제하기
  const handleDelete = async () => {
    if (!confirm("정말 이 캠페인을 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "삭제에 실패했습니다.")
        return
      }

      alert("캠페인이 삭제되었습니다.")
      router.push("/campaigns")
    } catch (error) {
      console.error("❌ 삭제 오류:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  // 신청자 관리
  const handleManageApplicants = () => {
    router.push(`/campaigns/${campaignId}/applicants`)
  }

  // 리워드 텍스트 생성
  const getRewardText = () => {
    if (!campaign) return ""

    if (campaign.reward_type === "payment") {
      if (campaign.payment_amount === "인플루언서와 직접 협의") {
        return "💰 협의 후 결정"
      }
      return `💰 ${campaign.payment_amount}만원`
    } else if (campaign.reward_type === "product") {
      return `🎁 ${campaign.product_name || "제품 제공"}`
    } else if (campaign.reward_type === "other") {
      return `✨ ${campaign.other_reward || "기타 보상"}`
    }
    return "협의 후 결정"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-500">캠페인을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">캠페인을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/campaigns")}>목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" className="flex items-center h-9 px-1" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <span className="text-base text-gray-600">캠페인 상세</span>
          </Button>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleEdit} className="text-sm">
                수정
              </Button>
              <Button variant="ghost" onClick={handleDelete} className="text-sm text-red-500">
                삭제
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24">
        {/* 이미지 갤러리 */}
        {campaign.uploaded_photos && campaign.uploaded_photos.length > 0 ? (
          <div className="relative aspect-video bg-gray-100">
            <Image
              src={campaign.uploaded_photos[0] || "/placeholder.svg"}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              <p className="text-sm">이미지 없음</p>
            </div>
          </div>
        )}

        {/* 상태 배지 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === "구인 진행 중"
                  ? "bg-green-100 text-green-700"
                  : campaign.status === "구인 마감"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {campaign.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {campaign.category}
            </span>
            {campaign.visit_type && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {campaign.visit_type === "visit" ? "방문형" : "배송형"}
              </span>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">{campaign.title}</h1>

          {/* 리워드 */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-[#7b68ee]">{getRewardText()}</p>
            {campaign.additional_reward_info && (
              <p className="text-sm text-gray-600 mt-1">{campaign.additional_reward_info}</p>
            )}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{campaign.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {campaign.applicants || 0}/{campaign.recruit_count}명
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 모집 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">📋 모집 정보</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">모집 인원</span>
                <span className="font-medium">{campaign.recruit_count}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">현재 신청자</span>
                <span className="font-medium text-[#7b68ee]">{campaign.applicants || 0}명</span>
              </div>
              {campaign.confirmed_applicants > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">확정된 인원</span>
                  <span className="font-medium text-green-600">{campaign.confirmed_applicants}명</span>
                </div>
              )}
            </div>
          </div>

          {/* 콘텐츠 요구사항 */}
          {(campaign.content_type || campaign.video_duration) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">🎥 콘텐츠 요구사항</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {campaign.content_type && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#7b68ee]">•</span>
                    <span>콘텐츠 유형: {campaign.content_type}</span>
                  </div>
                )}
                {campaign.video_duration && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#7b68ee]">•</span>
                    <span>영상 길이: {campaign.video_duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 필수 포함 내용 */}
          {campaign.required_content && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">📝 필수 포함 내용</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.required_content}</p>
            </div>
          )}

          {/* 필수 촬영 장면 */}
          {campaign.required_scenes && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">📸 필수 촬영 장면</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.required_scenes}</p>
            </div>
          )}

          {/* 추가 메모 */}
          {campaign.additional_memo && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">💬 추가 메모</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.additional_memo}</p>
            </div>
          )}

          {/* 해시태그 */}
          {campaign.hashtags && campaign.hashtags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">#️⃣ 해시태그</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.hashtags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-[#7b68ee]/10 text-[#7b68ee] rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 링크 */}
          {campaign.link_url && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">🔗 관련 링크</h3>
              <a
                href={campaign.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {campaign.link_url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        {isOwner ? (
          <div className="flex gap-3">
            <Button
              onClick={handleManageApplicants}
              className="flex-1 h-12 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium"
            >
              신청자 관리 ({campaign.applicants || 0}명)
            </Button>
            <Button onClick={handleEdit} variant="outline" className="h-12 px-6">
              수정
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleApply}
            disabled={hasApplied || campaign.status !== "구인 진행 중"}
            className="w-full h-12 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasApplied ? "이미 지원한 캠페인입니다" : campaign.status === "구인 진행 중" ? "지원하기" : "모집이 마감되었습니다"}
          </Button>
        )}
      </div>

      {/* 지원하기 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">캠페인 지원하기</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">지원 메시지 (선택)</label>
              <Textarea
                placeholder="자신을 소개하거나 지원 동기를 작성해주세요."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={5}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplyModal(false)
                  setApplicationMessage("")
                }}
                className="flex-1"
                disabled={isApplying}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={isApplying}
                className="flex-1 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white"
              >
                {isApplying ? "지원 중..." : "지원하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}