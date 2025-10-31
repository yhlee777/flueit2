"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Heart, Eye, Users, Trash2 } from "lucide-react"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  category: string
  status: string
  thumbnail: string
  reward_type: string
  payment_amount: string | null
  product_name: string | null
  other_reward: string | null
  views: number
  applicants: number
  recruit_count: number
  created_at: string
}

export default function FavoriteCampaignsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<Campaign[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavoriteCampaigns()
  }, [session])

  // ✅ DB에서 찜 목록 가져오기
  const loadFavoriteCampaigns = async () => {
    try {
      setLoading(true)

      if (!session?.user?.id) {
        // 로그인 안 했으면 localStorage에서만 가져오기
        const savedFavorites = localStorage.getItem("campaign-favorites")
        if (savedFavorites) {
          const ids = JSON.parse(savedFavorites)
          setFavoriteIds(ids)
          await loadCampaignDetails(ids)
        }
        setLoading(false)
        return
      }

      // ✅ DB에서 찜 목록 조회
      const response = await fetch('/api/favorites/campaigns')
      const data = await response.json()

      if (response.ok && data.success) {
        const ids = data.campaignIds || []
        setFavoriteIds(ids)
        console.log('✅ DB에서 찜 목록 로드 성공:', ids)
        
        // localStorage와 동기화
        localStorage.setItem('campaign-favorites', JSON.stringify(ids))
        
        // 캠페인 상세 정보 가져오기
        await loadCampaignDetails(ids)
      } else {
        console.error('❌ 찜 목록 로드 실패:', data.error)
        
        // 실패 시 localStorage에서 로드
        const savedFavorites = localStorage.getItem("campaign-favorites")
        if (savedFavorites) {
          const ids = JSON.parse(savedFavorites)
          setFavoriteIds(ids)
          await loadCampaignDetails(ids)
        }
      }
    } catch (error) {
      console.error('❌ 찜 목록 로드 오류:', error)
      
      // 에러 시 localStorage에서 로드
      const savedFavorites = localStorage.getItem("campaign-favorites")
      if (savedFavorites) {
        const ids = JSON.parse(savedFavorites)
        setFavoriteIds(ids)
        await loadCampaignDetails(ids)
      }
    } finally {
      setLoading(false)
    }
  }

  // 캠페인 상세 정보 가져오기
  const loadCampaignDetails = async (ids: string[]) => {
    if (ids.length === 0) {
      setFavoriteCampaigns([])
      return
    }

    const campaigns = await Promise.all(
      ids.map(async (id: string) => {
        try {
          const response = await fetch(`/api/campaigns/${id}`)
          const data = await response.json()
          return data.campaign
        } catch (error) {
          console.error(`캠페인 ${id} 로드 오류:`, error)
          return null
        }
      })
    )

    // null이 아닌 캠페인만 필터링
    const validCampaigns = campaigns.filter((c) => c !== null)
    setFavoriteCampaigns(validCampaigns)
  }

  // ✅ DB와 연동된 찜하기 취소
  const removeFavorite = async (campaignId: string) => {
    // 낙관적 업데이트 (UI 먼저 변경)
    const newFavorites = favoriteIds.filter((id) => id !== campaignId)
    setFavoriteIds(newFavorites)
    setFavoriteCampaigns(favoriteCampaigns.filter((c) => c.id !== campaignId))
    localStorage.setItem("campaign-favorites", JSON.stringify(newFavorites))

    if (!session?.user?.id) {
      return // 로그인 안 했으면 localStorage만 업데이트
    }

    try {
      // DB에서 찜 해제
      console.log('💔 찜 해제 API 호출:', campaignId)
      const response = await fetch(`/api/favorites/campaigns?campaignId=${campaignId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '찜 해제에 실패했습니다.')
      }
      
      console.log('✅ 찜 해제 성공')
    } catch (error) {
      console.error('❌ 찜 해제 오류:', error)
      
      // 에러 발생 시 원래 상태로 롤백
      setFavoriteIds([...favoriteIds])
      loadFavoriteCampaigns()
      
      alert(error instanceof Error ? error.message : '찜 해제 중 오류가 발생했습니다.')
    }
  }

  // ✅ 모두 삭제 (DB 연동)
  const clearAllFavorites = async () => {
    if (!confirm("찜한 캠페인을 모두 삭제하시겠습니까?")) return

    // 낙관적 업데이트
    const previousIds = [...favoriteIds]
    const previousCampaigns = [...favoriteCampaigns]
    
    setFavoriteIds([])
    setFavoriteCampaigns([])
    localStorage.setItem("campaign-favorites", JSON.stringify([]))

    if (!session?.user?.id) {
      return
    }

    try {
      // 모든 찜 해제 요청
      await Promise.all(
        previousIds.map((id) =>
          fetch(`/api/favorites/campaigns?campaignId=${id}`, {
            method: 'DELETE',
          })
        )
      )
      console.log('✅ 전체 찜 해제 성공')
    } catch (error) {
      console.error('❌ 전체 찜 해제 오류:', error)
      
      // 에러 발생 시 롤백
      setFavoriteIds(previousIds)
      setFavoriteCampaigns(previousCampaigns)
      localStorage.setItem("campaign-favorites", JSON.stringify(previousIds))
      
      alert('전체 삭제 중 오류가 발생했습니다.')
    }
  }

  // ✅ 페이지 포커스 시 다시 로드
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFavoriteCampaigns()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session])

  // 리워드 텍스트 생성
  const getRewardText = (campaign: Campaign) => {
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
      <div className="min-h-screen bg-white">
        <TopHeader title="찜한 캠페인" showBack={true} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
            <p className="text-gray-500">불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader title="찜한 캠페인" showBack={true} />

      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">찜한 캠페인</h2>
            <p className="text-sm text-gray-500 mt-1">총 {favoriteCampaigns.length}개</p>
          </div>
          {favoriteCampaigns.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFavorites}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              전체 삭제
            </Button>
          )}
        </div>
      </div>

      {/* 캠페인 목록 */}
      {favoriteCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-900 font-medium text-lg mb-2">찜한 캠페인이 없습니다</p>
          <p className="text-gray-500 text-sm text-center mb-6">
            마음에 드는 캠페인을 찜해보세요.
            <br />
            나중에 다시 확인할 수 있습니다.
          </p>
          <Button
            onClick={() => router.push("/campaigns")}
            className="bg-[#7b68ee] hover:bg-[#6a5acd] text-white"
          >
            캠페인 둘러보기
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {favoriteCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative"
            >
              <Link href={`/campaigns/${campaign.id}`}>
                {/* 썸네일 */}
                <div className="relative h-48">
                  <img
                    src={campaign.thumbnail || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  {/* 상태 배지 */}
                  <div className="absolute top-2 left-2">
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
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  {/* 카테고리 */}
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded mb-2">
                    {campaign.category}
                  </span>

                  {/* 제목 */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>

                  {/* 리워드 */}
                  <p className="text-[#7b68ee] font-semibold mb-3">{getRewardText(campaign)}</p>

                  {/* 통계 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  </div>
                </div>
              </Link>

              {/* 찜하기 취소 버튼 */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeFavorite(campaign.id)
                }}
                className="absolute top-2 right-2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}