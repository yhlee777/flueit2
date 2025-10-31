"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ChevronLeft, MoreVertical, MapPin, Heart, Instagram, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useViewHistory } from "@/lib/view-history-store"
import { useCampaigns } from "@/lib/campaign-store"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

const categories = [
  "베이비·키즈",
  "뷰티·화장품",
  "패션·잡화",
  "푸드·외식",
  "간편식·배달",
  "리빙·인테리어",
  "반려동물",
  "숙박·여행",
  "헬스·피트니스",
  "취미·여가",
  "테크·가전",
  "기타",
]

// ===== 헬퍼 함수들 =====

// 팔로워 수 포맷팅
const formatFollowerCount = (count: number): string => {
  if (!count || count === 0) return "0"
  if (count < 1000) return count.toString()
  if (count < 10000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}천`
  if (count < 100000) return `${Math.floor(count / 10000)}만`
  if (count < 1000000) return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}만`
  return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}백만`
}

// 숫자 포맷팅 (콤마 추가)
const formatNumber = (num: number): string => {
  if (!num || num === 0) return "0"
  return num.toLocaleString('ko-KR')
}

// 참여율 포맷팅
const formatEngagementRate = (rate: number | string | null | undefined): string => {
  if (!rate) return "0.0%"
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate
  if (isNaN(numRate)) return "0.0%"
  return `${numRate.toFixed(1)}%`
}

const generateCareerData = (influencer: any) => {
  const careerTemplates = {
    "패션·잡화": [
      { projectName: "패션 브랜드 협업 스타일링", type: "포스팅", tags: ["패션·잡화"] },
      { projectName: "신상 의류 착용샷 촬영", type: "스토리", tags: ["패션·잡화"] },
      { projectName: "액세서리 브랜드 홍보", type: "릴스", tags: ["패션·잡화"] },
    ],
    "뷰티·화장품": [
      { projectName: "뷰티 브랜드 제품 리뷰", type: "릴스", tags: ["뷰티·화장품"] },
      { projectName: "메이크업 튜토리얼 콘텐츠", type: "포스팅", tags: ["뷰티·화장품"] },
      { projectName: "화장품 브랜드 협업", type: "스토리", tags: ["뷰티·화장품"] },
    ],
    "기타": [
      { projectName: "브랜드 콘텐츠 제작", type: "포스팅", tags: ["기타"] },
      { projectName: "협업 프로젝트", type: "스토리", tags: ["기타"] },
    ],
  }

  const category = influencer.category || "기타"
  const templates = careerTemplates[category as keyof typeof careerTemplates] || careerTemplates["기타"]
  
  const dates = [
    "25년 3월 14일",
    "25년 2월 28일",
    "25년 2월 15일",
  ]

  return templates.map((template, index) => ({
    id: index + 1,
    projectName: template.projectName,
    date: `${dates[index % dates.length]} 업로드`,
    type: template.type,
    tags: template.tags,
  }))
}

export default function InfluencerProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("소개")
  const [visibleCards, setVisibleCards] = useState(3)
  const [showMoreTags, setShowMoreTags] = useState(false)
  const [isInfluencerMode, setIsInfluencerMode] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [isActivityRatePrivate, setIsActivityRatePrivate] = useState(false)
  const [instagramUrl, setInstagramUrl] = useState("")
  
  // ✅ DB 연동 상태
  const [influencer, setInfluencer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ 계산된 통계 데이터
  const [displayData, setDisplayData] = useState({
    followersDisplay: "0",
    postsDisplay: "0",
    engagementDisplay: "0.0%",
    averageLikesDisplay: "0",
  })
  
  // ✅ 후기 데이터
  const [reviews, setReviews] = useState<any[]>([])
  const [recommendationTags, setRecommendationTags] = useState<{ text: string; count: number }[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  
  const router = useRouter()
  const { addViewedProfile } = useViewHistory()
  const { campaigns } = useCampaigns()

  // ✅ 인플루언서 정보 불러오기 및 통계 계산
  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        setLoading(true)
        console.log('📥 [Profile] Loading influencer:', params.id)
        
        const response = await fetch(`/api/influencers/${params.id}`)
        
        if (!response.ok) {
          throw new Error('인플루언서를 찾을 수 없습니다')
        }
        
        const data = await response.json()
        const influencerData = data.influencer
        
        // 🔍 전체 데이터 구조 확인
        console.log('✅ [Profile] Influencer loaded:', influencerData)
        console.log('🔍 [Profile] instagram_data 타입:', typeof influencerData.instagram_data)
        console.log('🔍 [Profile] instagram_data 내용:', JSON.stringify(influencerData.instagram_data, null, 2))
        console.log('🔍 [Profile] follower_count:', influencerData.follower_count)
        console.log('🔍 [Profile] engagement_rate:', influencerData.engagement_rate)
        
        setInfluencer(influencerData)
        
        // ===== instagram_data에서 직접 데이터 추출 =====
        const instagramData = influencerData.instagram_data || {}
        
        // 1. 팔로워 수 (DB 컬럼 우선, 없으면 instagram_data에서 - camelCase 필드명)
        const followerCount = influencerData.follower_count || 
                             instagramData.followersCount || 
                             instagramData.follower_count || 
                             instagramData.followers || 0
        const followersDisplay = formatFollowerCount(followerCount)
        
        // 2. 게시물 수 (instagram_data에서 직접 - camelCase 필드명)
        const postsCount = instagramData.mediaCount || 
                          instagramData.posts_count || 
                          instagramData.media_count || 
                          instagramData.posts || 0
        const postsDisplay = formatNumber(postsCount)
        
        // 3. 참여율 (DB 컬럼 우선, 없으면 instagram_data에서 - camelCase 필드명, 문자열 가능)
        let engagementRate = influencerData.engagement_rate || 
                            instagramData.engagementRate || 
                            instagramData.engagement_rate || 
                            0
        // 문자열인 경우 숫자로 변환
        if (typeof engagementRate === 'string') {
          engagementRate = parseFloat(engagementRate) || 0
        }
        const engagementDisplay = formatEngagementRate(engagementRate)
        
        // 4. 평균 좋아요 (instagram_data에서 직접 - camelCase 필드명)
        const avgLikes = instagramData.averageLikes || 
                        instagramData.average_likes || 
                        instagramData.avg_likes || 
                        instagramData.likes || 0
        const averageLikesDisplay = formatNumber(avgLikes)
        
        // 표시용 데이터 업데이트
        setDisplayData({
          followersDisplay,
          postsDisplay,
          engagementDisplay,
          averageLikesDisplay,
        })
        
        console.log('📊 [Profile] 추출된 통계:', {
          'DB follower_count': influencerData.follower_count,
          'DB engagement_rate': influencerData.engagement_rate,
          '최종 followerCount': followerCount,
          '최종 postsCount': postsCount,
          '최종 engagementRate': engagementRate,
          '최종 avgLikes': avgLikes
        })
        console.log('📊 [Profile] instagram_data 필드들:', Object.keys(instagramData))
        
        // 조회 기록 추가
        addViewedProfile({
          id: influencerData.id,
          name: influencerData.name || '익명',
          followers: followerCount,
          followersDisplay,
          engagement: engagementDisplay,
          category: influencerData.category || '기타',
          region: influencerData.narrow_region || influencerData.broad_region || '서울',
          avatar: influencerData.image || '/placeholder.svg',
          verified: influencerData.instagram_verification_status === 'verified',
          hashtags: influencerData.profile_hashtags || [],
        })
        
      } catch (error) {
        console.error('❌ [Profile] Load error:', error)
        alert('인플루언서 정보를 불러올 수 없습니다')
        router.push('/influencers')
      } finally {
        setLoading(false)
      }
    }

    fetchInfluencer()
  }, [params.id])

  // 모드 설정 및 개인 설정 로드
  useEffect(() => {
    const mode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(mode)

    if (!mode) {
      const favorites = JSON.parse(localStorage.getItem("favorited_influencers") || "[]")
      setIsFavorited(favorites.includes(params.id))
    }

    // 활동 단가 공개 설정
    if (influencer) {
      setIsActivityRatePrivate(influencer.activity_rate_private || false)
    } else {
      const activityRatePrivacy = localStorage.getItem("influencer_activity_rate_private")
      if (activityRatePrivacy) {
        setIsActivityRatePrivate(activityRatePrivacy === "true")
      }
    }
    
    // 인스타그램 URL
    const savedInstagramUrl = localStorage.getItem("influencer_instagram_url")
    if (savedInstagramUrl) {
      setInstagramUrl(savedInstagramUrl)
    }
  }, [params.id, influencer])

  // ✅ 후기 데이터 불러오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true)
        const response = await fetch(`/api/reviews?influencerId=${params.id}`)
        
        if (!response.ok) {
          throw new Error('후기를 불러올 수 없습니다.')
        }
        
        const data = await response.json()
        console.log('✅ [Profile] Reviews loaded:', data.reviews)
        
        setReviews(data.reviews || [])
        
        // 추천 태그 집계
        const tagCounts: { [key: string]: number } = {}
        data.reviews.forEach((review: any) => {
          if (review.tags && Array.isArray(review.tags)) {
            review.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        })
        
        const sortedTags = Object.entries(tagCounts)
          .map(([text, count]) => ({ text, count: count as number }))
          .sort((a, b) => b.count - a.count)
        
        setRecommendationTags(sortedTags)
        
      } catch (error) {
        console.error('❌ [Profile] Reviews load error:', error)
        setReviews([])
        setRecommendationTags([])
      } finally {
        setIsLoadingReviews(false)
      }
    }

    if (params.id) {
      fetchReviews()
    }
  }, [params.id])

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorited_influencers") || "[]")

    if (isFavorited) {
      const updated = favorites.filter((id: string) => id !== params.id)
      localStorage.setItem("favorited_influencers", JSON.stringify(updated))
      setIsFavorited(false)
    } else {
      favorites.push(params.id)
      localStorage.setItem("favorited_influencers", JSON.stringify(favorites))
      setIsFavorited(true)
    }
  }

  const handlePropose = () => {
    setIsProposalModalOpen(true)
  }

  const handleCampaignSelect = (campaign: any) => {
    setSelectedCampaign(campaign)
  }

  const handleSendProposal = () => {
    if (!selectedCampaign || !influencer) return

    const newChatId = Date.now()
    const newChat = {
      id: newChatId,
      name: influencer.name,
      lastMessage: `${selectedCampaign.title} 캠페인 제안을 보냈습니다.`,
      time: "방금",
      unreadCount: 0,
      isUnread: false,
      isActiveCollaboration: true,
      avatar: influencer.image,
      campaign: selectedCampaign,
    }

    const existingChats = JSON.parse(localStorage.getItem("chats") || "[]")
    existingChats.unshift(newChat)
    localStorage.setItem("chats", JSON.stringify(existingChats))

    setIsProposalModalOpen(false)
    setSelectedCampaign(null)

    router.push(`/chat/${newChatId}`)
  }

  const myCampaigns = campaigns.filter((c) => c.is_user_created)

  const getCategoryTags = (category: string) => {
    const categoryMap: { [key: string]: string[] } = {
      "패션·잡화": ["패션", "스타일링", "OOTD"],
      "뷰티·화장품": ["뷰티", "메이크업", "스킨케어"],
      "리빙·인테리어": ["인테리어", "홈데코", "라이프스타일"],
      "테크·가전": ["테크", "리뷰", "가젯"],
      "푸드·외식": ["맛집", "요리", "레시피"],
      "헬스·피트니스": ["헬스", "운동", "다이어트"],
      "반려동물": ["반려동물", "펫스타그램", "케어"],
      "숙박·여행": ["여행", "맛집", "관광"],
      "베이비·키즈": ["육아", "베이비", "맘스타그램"],
      "기타": ["라이프스타일", "일상", "콘텐츠"],
    }
    return categoryMap[category] || ["라이프스타일", "일상", "콘텐츠"]
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace("/influencers")
    }
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#7b68ee] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">프로필 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 데이터 없음
  if (!influencer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">프로필을 찾을 수 없습니다</h2>
          <Link href="/influencers">
            <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  const careerData = generateCareerData(influencer)
  const loadMoreCards = () => {
    setVisibleCards((prev) => Math.min(prev + 3, careerData.length))
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white" style={{ height: "var(--gnb-height)" }}>
        <div
          className="flex items-center justify-between h-full"
          style={{ paddingLeft: "var(--gnb-padding-x)", paddingRight: "var(--gnb-padding-x)" }}
        >
          <Button variant="ghost" className="flex items-center h-9 px-1" onClick={handleBack}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <span className="text-base text-gray-600">프로필 보기</span>
          </Button>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <main className="px-4 py-3 space-y-6">
        {/* 프로필 헤더 */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarImage src={influencer.image || '/placeholder.svg'} alt={influencer.name} />
              <AvatarFallback>{influencer.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-black">{influencer.name || '익명'}</h2>
                {influencer.instagram_verification_status === 'verified' && (
                  <div className="w-5 h-5 bg-[#7b68ee] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{influencer.narrow_region || influencer.broad_region || '서울'}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {getCategoryTags(influencer.category || '기타').map((tag, index) => (
                  <div key={index} className="px-2 py-0 bg-gray-100 rounded-md">
                    <span className="text-xs text-gray-600">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 통계 - DB 기반 계산된 값 표시 */}
          <div className="space-y-3 mt-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <div className="text-sm font-semibold text-[#7b68ee]">팔로워 수</div>
                <div className="text-xl font-bold text-black">{displayData.followersDisplay}</div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#7b68ee]">게시물 수</div>
                <div className="text-xl font-bold text-black">{displayData.postsDisplay}</div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#7b68ee]">평균 참여율</div>
                <div className="text-xl font-bold text-black">{displayData.engagementDisplay}</div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#7b68ee]">평균 좋아요</div>
                <div className="text-xl font-bold text-black">{displayData.averageLikesDisplay}</div>
              </div>
            </div>
          </div>

          {/* 해시태그 */}
          {influencer.profile_hashtags && influencer.profile_hashtags.length > 0 && (
            <div className="space-y-2 mt-5">
              <p className="text-sm text-gray-600">{influencer.name}님이 자주 사용하는 해시태그에요.</p>
              <div className="flex gap-2 flex-wrap">
                {influencer.profile_hashtags.map((hashtag: string, index: number) => (
                  <div key={index} className="px-3 py-1 bg-blue-50 rounded-full">
                    <span className="text-sm text-blue-500">#{hashtag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 인스타그램 버튼 */}
        <div className="-mx-4 px-4">
          <a
            href={instagramUrl || (influencer.instagram_username ? `https://instagram.com/${influencer.instagram_username}` : `https://instagram.com/${influencer.instagram_handle || influencer.username}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-4"
          >
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5 text-[#E4405F]" />
              <span className="font-medium text-gray-700">인스타그램 바로가기</span>
            </Button>
          </a>
        </div>

        {/* 탭 */}
        <div className="sticky z-40 bg-white -mx-4 px-4" style={{ top: "var(--gnb-height)" }}>
          <div className="relative border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("소개")}
                className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "소개" ? "text-black" : "text-gray-400"
                }`}
              >
                소개
              </button>
              <button
                onClick={() => setActiveTab("경력")}
                className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "경력" ? "text-black" : "text-gray-400"
                }`}
              >
                경력
              </button>
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-[#7b68ee] transition-transform duration-300 ease-out"
              style={{
                width: "50%",
                transform: activeTab === "소개" ? "translateX(0)" : "translateX(100%)",
              }}
            />
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="relative overflow-hidden">
          {/* 소개 탭 */}
          <div
            className={`space-y-6 transition-all duration-300 ease-out ${
              activeTab === "소개"
                ? "transform translate-x-0 opacity-100"
                : "transform -translate-x-full opacity-0 absolute top-0 left-0 w-full pointer-events-none"
            }`}
          >
            {/* 인플루언서 소개 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-black">인플루언서 소개</h3>
              <Card className="rounded-2xl shadow-none">
                <CardContent className="px-5 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {influencer.bio || influencer.introduction || '소개가 없습니다.'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 포트폴리오 */}
            {influencer.portfolio_images && influencer.portfolio_images.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-black">포트폴리오</h3>
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {influencer.portfolio_images.map((photo: string, index: number) => (
                      <Card
                        key={index}
                        className="rounded-2xl overflow-hidden aspect-[9/16] flex-shrink-0 w-32 shadow-none"
                      >
                        <img
                          src={photo}
                          alt={`포트폴리오 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 활동 단가 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-black">활동 단가</h3>
              <Card className="rounded-2xl shadow-none">
                <CardContent className="px-5 py-3">
                  {isActivityRatePrivate ? (
                    <div className="relative">
                      <div className="text-sm text-gray-700 whitespace-pre-line blur-sm select-none">
                        {influencer.activity_rate || '포스팅: 50만원\n스토리: 30만원\n릴스: 70만원'}
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-600 text-center px-4">
                          단가를 비공개로 설정하셨어요.
                          <br />
                          인플루언서님에게 직접 문의해주세요.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {influencer.activity_rate || '포스팅: 50만원\n스토리: 30만원\n릴스: 70만원'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 활동 지역 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-black">활동 지역</h3>
              <div className="flex gap-2 flex-wrap">
                {(influencer.activity_regions || [influencer.narrow_region || influencer.broad_region || '서울']).map((region: string, index: number) => (
                  <div key={index} className="px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-700">{region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 경력 탭 */}
          <div
            className={`transition-all duration-300 ease-out ${
              activeTab === "경력"
                ? "transform translate-x-0 opacity-100"
                : "transform translate-x-full opacity-0 absolute top-0 left-0 w-full pointer-events-none"
            }`}
          >
            <div className="space-y-2">
              {careerData.slice(0, visibleCards).map((career) => (
                <Card key={career.id} className="rounded-2xl bg-white border border-gray-100 shadow-none">
                  <CardContent className="pl-5 pr-2 py-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#7b68ee] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                        <span className="text-xs font-medium text-[#7b68ee]">잇다 경력 인증</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-black text-sm mb-1">{career.projectName}</h4>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{career.date}</span>
                      <span>•</span>
                      <span>{career.type}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {career.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {visibleCards < careerData.length && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreCards}
                  className="w-full max-w-xs px-12 py-2 rounded-2xl"
                >
                  더보기
                </Button>
              </div>
            )}

            {/* 추천 태그 */}
            <div className="space-y-4 pt-10">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-black">잇다에서 받은 추천</h3>
                <span className="font-semibold text-black">
                  {recommendationTags.reduce((sum, tag) => sum + tag.count, 0)}
                </span>
              </div>
              <div className="space-y-3">
                {isLoadingReviews ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 text-[#7b68ee] animate-spin" />
                  </div>
                ) : recommendationTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recommendationTags.slice(0, showMoreTags ? recommendationTags.length : 4).map((tag, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                        <span className="text-sm text-gray-700">{tag.text}</span>
                        <span className="text-sm font-medium text-[#7b68ee]">{tag.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">아직 추천이 없습니다.</p>
                )}
              </div>

              {/* 후기 */}
              <div className="flex items-center gap-2 pt-8">
                <h3 className="font-semibold text-black">잇다에서 받은 후기</h3>
                <span className="font-semibold text-black">{reviews.length}</span>
              </div>
              <div className="space-y-2">
                {isLoadingReviews ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 text-[#7b68ee] animate-spin" />
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="rounded-2xl bg-white border border-gray-100 shadow-none">
                      <CardContent className="pl-5 pr-2 py-4">
                        <div className="flex items-start mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={review.advertiser?.image || "/placeholder.svg"} 
                                alt={review.advertiser?.name || '익명'} 
                              />
                              <AvatarFallback>{review.advertiser?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-black">
                                  {review.advertiser?.name || '익명'}
                                </span>
                                <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">
                                  {new Date(review.created_at).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed pl-[52px]">
                          {review.content || '후기 내용이 없습니다.'}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">아직 후기가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 버튼 (광고주 모드) */}
      {!isInfluencerMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-shrink-0 w-14 h-14 rounded-2xl border-gray-300 bg-transparent hover:border-[#7b68ee]"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="lg"
              className="flex-1 h-12 rounded-2xl text-sm font-semibold bg-[#7b68ee] hover:bg-[#7b68ee]/90"
              onClick={handlePropose}
            >
              제안하기
            </Button>
          </div>
        </div>
      )}

      {/* 제안 모달 */}
      <Drawer open={isProposalModalOpen} onOpenChange={setIsProposalModalOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-left">제안할 캠페인 선택</DrawerTitle>
            <DrawerDescription className="text-left">
              {influencer.name}님에게 제안할 캠페인을 선택해주세요
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2 max-h-[60vh] overflow-y-auto">
            {myCampaigns.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-gray-500 mb-4">작성한 캠페인이 없습니다</p>
                <Button
                  onClick={() => {
                    setIsProposalModalOpen(false)
                    router.push("/campaigns/create")
                  }}
                  className="bg-[#7b68ee] hover:bg-[#7b68ee]/90"
                >
                  캠페인 작성하기
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {myCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className={`cursor-pointer transition-all ${
                      selectedCampaign?.id === campaign.id
                        ? "border-[#7b68ee] border-2 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={campaign.thumbnail || "/placeholder.svg"}
                          alt={campaign.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-black mb-1">{campaign.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{campaign.category}</span>
                            <span>•</span>
                            <span>{campaign.reward}</span>
                          </div>
                        </div>
                        {selectedCampaign?.id === campaign.id && (
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-[#7b68ee] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={handleSendProposal}
              disabled={!selectedCampaign}
              className="w-full h-12 rounded-full text-base font-semibold bg-[#7b68ee] hover:bg-[#7b68ee]/90"
            >
              제안 보내기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}