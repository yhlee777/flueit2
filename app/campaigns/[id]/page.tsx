"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, Eye, Users, Calendar, Heart, Send, X } from "lucide-react"

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const campaignId = params.id
  
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // 제안서 모달
  const [proposalOpen, setProposalOpen] = useState(false)
  const [proposalMessage, setProposalMessage] = useState("")
  const [sending, setSending] = useState(false)

  // ✅ 추가: 프로필 완성도 상태
  const [profileProgress, setProfileProgress] = useState<number>(0)
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    // 인플루언서 모드 확인
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    loadCampaign()
    loadFavoriteStatus()
    
    // ✅ 추가: 인플루언서 모드일 때 프로필 완성도 체크
    if (influencerMode) {
      checkProfileCompleteness()
    }
  }, [campaignId])

  // ✅ 추가: 프로필 완성도 체크 함수
  const checkProfileCompleteness = async () => {
  try {
    const response = await fetch('/api/profile')  // ✅ 경로 수정
    const data = await response.json()

    if (!data.success || !data.profile) {
      setProfileProgress(0)
      setProfileChecked(true)
      return
    }

    const profile = data.profile
    let progress = 0
    
    // ✅ 프로필 편집 페이지와 동일한 로직 사용
    if (profile.image) progress += 15
    if (profile.category) progress += 15
    if (profile.bio) progress += 15
    
    // ✅ instagram_verification_status === 'verified'로 통일
    if (profile.instagram_verification_status === 'verified') progress += 20
    
    if (profile.broad_region) {
      if (profile.broad_region === "전체") {
        progress += 15
      } else if (profile.narrow_region) {
        progress += 15
      }
    }
    
    if (profile.activity_rate) progress += 10
    if (profile.profile_hashtags?.length > 0) progress += 10

    console.log('📊 프로필 완성도:', progress + '%')
    setProfileProgress(progress)
    setProfileChecked(true)
    
  } catch (error) {
    console.error('프로필 체크 오류:', error)
    setProfileProgress(0)
    setProfileChecked(true)
  }
}
  const loadCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 캠페인 조회 오류:", data)
        return
      }

      setCampaign(data.campaign)

      // 캠페인 소유자 확인
      if (session?.user?.id && data.campaign?.user_id === session.user.id) {
        setIsOwner(true)
      }
    } catch (error) {
      console.error("❌ 캠페인 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ 찜 상태 로드
  const loadFavoriteStatus = () => {
    try {
      const favorites = localStorage.getItem("favorite_campaigns")
      if (favorites) {
        const favList = JSON.parse(favorites)
        setIsFavorite(favList.includes(campaignId))
        console.log('💖 찜 상태:', favList.includes(campaignId))
      }
    } catch (error) {
      console.error('찜 상태 로드 오류:', error)
    }
  }

  // ✅ 찜하기 토글
  const toggleFavorite = () => {
    try {
      const favorites = localStorage.getItem("favorite_campaigns")
      let favList = favorites ? JSON.parse(favorites) : []
      
      if (isFavorite) {
        // 찜하기 취소
        favList = favList.filter((id: string) => id !== campaignId)
        setIsFavorite(false)
        console.log('💔 찜 취소')
      } else {
        // 찜하기 추가
        if (!favList.includes(campaignId)) {
          favList.push(campaignId)
        }
        setIsFavorite(true)
        console.log('💖 찜 추가')
      }
      
      localStorage.setItem("favorite_campaigns", JSON.stringify(favList))
    } catch (error) {
      console.error('찜 토글 오류:', error)
      alert('찜하기 처리 중 오류가 발생했습니다.')
    }
  }

  // ✅ 지원 가능 여부 체크
  const canApply = () => {
    if (!campaign) return false
    
    // 구인 마감 체크
    if (campaign.status === "구인 마감") return false
    
    // 모집 인원 초과 체크
    if (campaign.applicants >= campaign.recruit_count) return false
    
    // ✅ 추가: 프로필 완성도 체크 (60% 이상 필요)
    if (isInfluencerMode && profileProgress < 60) return false
    
    return true
  }

  // ✅ 제안서 모달 열기
  const openProposalModal = () => {
    if (!session?.user) {
      alert("로그인이 필요합니다.")
      router.push("/login")
      return
    }

    // ✅ 캠페인 상태 체크
    if (campaign.status === "구인 마감") {
      alert("마감된 캠페인입니다.")
      return
    }

    // ✅ 모집 인원 초과 체크
    if (campaign.applicants >= campaign.recruit_count) {
      alert("모집 인원이 마감되었습니다.")
      return
    }

    // 기본 메시지 설정
    setProposalMessage(`안녕하세요!\n\n"${campaign.title}" 캠페인에 협업 제안 드립니다.\n\n저의 콘텐츠와 잘 맞을 것 같아 지원하게 되었습니다.\n함께 멋진 콘텐츠를 만들고 싶습니다!\n\n감사합니다.`)
    setProposalOpen(true)
  }

  // ✅ 제안서 전송
  const handleSendProposal = async () => {
    if (!proposalMessage.trim()) {
      alert("제안 내용을 입력해주세요!")
      return
    }

    // 프로필 완성도 체크
    try {
      const profileResponse = await fetch('/api/user/profile')
      const profileData = await profileResponse.json()

      if (!profileResponse.ok || !profileData.profile) {
        alert("프로필을 먼저 완성해주세요!")
        setProposalOpen(false)
        router.push("/profile/setup")
        return
      }

      const profile = profileData.profile

      // 완성도 계산
      let progress = 0
      if (profile.image) progress += 15
      if (profile.bio) progress += 15
      if (profile.category || profile.categories?.length > 0) progress += 15
      if (profile.instagram_handle) progress += 15
      if (profile.main_platform) progress += 15
      if (profile.follower_count) progress += 10
      if (profile.name) progress += 5
      if (profile.interests?.length > 0) progress += 5
      if (profile.content_samples?.length > 0) progress += 5

      console.log('📊 프로필 완성도:', progress + '%')

      if (progress < 60) {
        alert(`프로필을 더 완성해주세요! (현재 ${progress}%, 최소 60% 필요)`)
        setProposalOpen(false)
        router.push("/profile/setup")
        return
      }
    } catch (error) {
      console.error('프로필 확인 오류:', error)
      console.warn('프로필 체크 실패, 제안서 전송 계속 진행')
    }

    setSending(true)

    try {
      console.log('📤 제안서 전송 시도')

      const response = await fetch('/api/chat/proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advertiserId: campaign.user_id,
          campaignId: campaignId,
          proposalMessage: proposalMessage.trim(),
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.chatId) {
          if (confirm('이미 제안서를 보냈습니다. 채팅방으로 이동하시겠습니까?')) {
            router.push(`/chat/${data.chatId}`)
          }
        } else {
          alert(data.error || '제안서 전송 실패')
        }
        return
      }

      console.log('✅ 제안서 전송 완료')

      setProposalOpen(false)
      alert('✅ 제안서가 전송되었습니다! 광고주의 수락을 기다려주세요.')
      router.push(`/chat/${data.chatId}`)
      
    } catch (error) {
      console.error('❌ 제안서 전송 오류:', error)
      alert('제안서 전송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  // 캠페인 수정
  const handleEdit = () => {
    router.push(`/campaigns/${campaignId}/edit`)
  }

  // 캠페인 삭제
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) {
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
      <div className="pb-40">
        {/* 이미지 갤러리 */}
        {campaign.uploaded_photos && campaign.uploaded_photos.length > 0 ? (
          <div className="relative h-64 bg-gray-100">
            <img
              src={campaign.uploaded_photos[0]}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">이미지 없음</p>
          </div>
        )}

        {/* 상태 배지 */}
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === "구인 진행 중"
                  ? "bg-[#7b68ee] text-white"
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
              <h3 className="text-sm font-semibold text-gray-900 mb-2">🎬 필수 촬영 장면</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.required_scenes}</p>
            </div>
          )}

          {/* 해시태그 */}
          {campaign.hashtags && campaign.hashtags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">#️⃣ 필수 해시태그</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.hashtags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 링크 URL */}
          {campaign.link_url && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">🔗 링크</h3>
              <a
                href={campaign.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#7b68ee] hover:underline break-all"
              >
                {campaign.link_url}
              </a>
            </div>
          )}

          {/* 추가 메모 */}
          {campaign.additional_memo && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">💬 추가 안내사항</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.additional_memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 인플루언서용 하단 고정 버튼 */}
      {isInfluencerMode && !isOwner && (
        <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 z-40" style={{ bottom: '60px' }}>
          <div className="flex gap-3 max-w-md mx-auto">
            {/* 찜하기 버튼 */}
            <Button
              variant="outline"
              size="lg"
              className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 ${
                isFavorite
                  ? "border-red-500 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 hover:border-red-500 hover:bg-red-50"
              }`}
              onClick={toggleFavorite}
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </Button>

            {/* ✅ 제안서 보내기 버튼 - 상태에 따라 비활성화 */}
            <Button
              size="lg"
              className={`flex-1 h-14 rounded-xl font-semibold text-base shadow-lg ${
                canApply()
                  ? "bg-[#7b68ee] hover:bg-[#6a5acd] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={openProposalModal}
              disabled={!canApply()}
            >
              <Send className="w-5 h-5 mr-2" />
              {campaign.status === "구인 마감" 
                ? "마감된 캠페인" 
                : campaign.applicants >= campaign.recruit_count
                  ? "모집 인원 초과"
                  : profileProgress < 60
                    ? `프로필 완성 필요 (${profileProgress}%)`
                    : "협업 제안하기"}
            </Button>
          </div>
        </div>
      )}

      {/* ✅ 광고주용 하단 고정 버튼 */}
      {isOwner && (
        <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 z-40" style={{ bottom: '60px' }}>
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              size="lg"
              className="flex-1 h-14 rounded-xl bg-[#7b68ee] hover:bg-[#6a5acd] text-white font-semibold"
              onClick={handleManageApplicants}
            >
              <Users className="w-5 h-5 mr-2" />
              지원자 관리 ({campaign.applicants || 0}명)
            </Button>
          </div>
        </div>
      )}

      {/* ✅ 제안서 작성 모달 */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold">협업 제안서 작성</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setProposalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 캠페인 미리보기 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">캠페인</p>
              <p className="text-sm font-semibold text-gray-900">{campaign.title}</p>
            </div>

            {/* 제안서 입력 */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                제안 메시지
              </label>
              <Textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="광고주에게 보낼 제안 내용을 작성하세요..."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 자기소개와 함께 왜 이 캠페인에 적합한지 어필해보세요!
              </p>
            </div>

            {/* 전송 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setProposalOpen(false)}
                className="flex-1"
                disabled={sending}
              >
                취소
              </Button>
              <Button
                onClick={handleSendProposal}
                disabled={!proposalMessage.trim() || sending}
                className="flex-1 bg-[#7b68ee] hover:bg-[#6a5acd] text-white"
              >
                {sending ? (
                  <>전송 중...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    제안서 보내기
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}