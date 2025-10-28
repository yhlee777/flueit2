"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Check, MapPin, Users, BarChart3, Heart, ChevronLeft } from "lucide-react"
import { useCampaigns } from "@/lib/campaign-store"

// Sample influencer data (same as in influencers page)
const allInfluencers = [
  {
    id: 1,
    name: "김소영",
    followers: "33000",
    followersDisplay: "3.3만",
    engagement: "3.3%",
    category: "패션·잡화",
    region: "서울시 성동구",
    avatar: "/korean-fashion-influencer-woman-stylish-outfit.jpg",
    verified: true,
    hashtags: ["#스타일링", "#패션", "#패션디자인"],
  },
  {
    id: 2,
    name: "박지민",
    followers: "52000",
    followersDisplay: "5.2만",
    engagement: "4.1%",
    category: "뷰티·화장품",
    region: "서울시 강남구",
    avatar: "/korean-beauty-influencer-woman-makeup-skincare.jpg",
    verified: true,
    hashtags: ["#뷰티", "#메이크업", "#스킨케어"],
  },
  {
    id: 3,
    name: "이준호",
    followers: "28000",
    followersDisplay: "2.8만",
    engagement: "5.2%",
    category: "리빙·인테리어",
    region: "서울시 마포구",
    avatar: "/korean-lifestyle-influencer-man-home-interior-desi.jpg",
    verified: true,
    hashtags: ["#홈카페", "#인테리어", "#플랜테리어"],
  },
  {
    id: 4,
    name: "최유진",
    followers: "81000",
    followersDisplay: "8.1만",
    engagement: "3.8%",
    category: "테크·가전",
    region: "서울시 서초구",
    avatar: "/korean-tech-influencer-woman-gadgets-technology.jpg",
    verified: true,
    hashtags: ["#테크", "#리뷰", "#가젯"],
  },
  {
    id: 5,
    name: "한서연",
    followers: "45000",
    followersDisplay: "4.5만",
    engagement: "3.9%",
    category: "패션·잡화",
    region: "서울시 홍대",
    avatar: "/korean-street-fashion-influencer-woman-vintage-sty.jpg",
    verified: true,
    hashtags: ["#스트릿패션", "#빈티지", "#코디"],
  },
  {
    id: 6,
    name: "정민아",
    followers: "63000",
    followersDisplay: "6.3만",
    engagement: "4.7%",
    category: "뷰티·화장품",
    region: "서울시 압구정",
    avatar: "/korean-beauty-guru-woman-cosmetics-review.jpg",
    verified: true,
    hashtags: ["#화장품", "#리뷰", "#뷰티팁"],
  },
  {
    id: 7,
    name: "김태현",
    followers: "31000",
    followersDisplay: "3.1만",
    engagement: "5.8%",
    category: "리빙·인테리어",
    region: "서울시 용산구",
    avatar: "/korean-home-lifestyle-influencer-man-minimalist-in.jpg",
    verified: false,
    hashtags: ["#미니멀", "#인테리어", "#홈데코"],
  },
  {
    id: 8,
    name: "송하늘",
    followers: "72000",
    followersDisplay: "7.2만",
    engagement: "4.3%",
    category: "푸드·외식",
    region: "서울시 종로구",
    avatar: "/korean-food-influencer-woman-cooking-restaurant-re.jpg",
    verified: true,
    hashtags: ["#맛집", "#요리", "#레시피"],
  },
  {
    id: 9,
    name: "윤도현",
    followers: "39000",
    followersDisplay: "3.9만",
    engagement: "6.1%",
    category: "헬스·피트니스",
    region: "서울시 강남구",
    avatar: "/korean-fitness-influencer-man-workout-gym-training.jpg",
    verified: true,
    hashtags: ["#헬스", "#운동", "#다이어트"],
  },
  {
    id: 10,
    name: "임수빈",
    followers: "24000",
    followersDisplay: "2.4만",
    engagement: "7.2%",
    category: "반려동물",
    region: "서울시 성북구",
    avatar: "/korean-pet-influencer-woman-cute-dog-cat.jpg",
    verified: false,
    hashtags: ["#반려견", "#펫스타그램", "#강아지"],
  },
  {
    id: 11,
    name: "조민석",
    followers: "58000",
    followersDisplay: "5.8만",
    engagement: "4.5%",
    category: "숙박·여행",
    region: "부산시 해운대구",
    avatar: "/korean-travel-influencer-man-backpack-adventure.jpg",
    verified: true,
    hashtags: ["#여행", "#부산", "#맛집투어"],
  },
  {
    id: 12,
    name: "강예린",
    followers: "41000",
    followersDisplay: "4.1만",
    engagement: "5.3%",
    category: "베이비·키즈",
    region: "서울시 송파구",
    avatar: "/korean-mom-influencer-woman-baby-kids-parenting.jpg",
    verified: true,
    hashtags: ["#육아", "#베이비", "#맘스타그램"],
  },
]

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favoriteCampaignIds, setFavoriteCampaignIds] = useState<number[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const { campaigns } = useCampaigns()

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)
    console.log("[v0] Influencer mode:", influencerMode)

    if (influencerMode) {
      const savedFavorites = localStorage.getItem("campaign-favorites")
      console.log("[v0] Loading saved campaign favorites:", savedFavorites)
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites)
        console.log("[v0] Parsed campaign favorites:", parsedFavorites)
        setFavoriteCampaignIds(parsedFavorites)
      }
    } else {
      const savedFavorites = localStorage.getItem("favorites")
      console.log("[v0] Loading saved favorites:", savedFavorites)
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites)
        console.log("[v0] Parsed favorites:", parsedFavorites)
        setFavoriteIds(parsedFavorites)
      }
    }
  }, [])

  const favoriteInfluencers = allInfluencers.filter((influencer) => favoriteIds.includes(influencer.id))
  const favoriteCampaigns = campaigns.filter((campaign) => favoriteCampaignIds.includes(campaign.id))

  const toggleFavorite = (influencerId: number) => {
    console.log("[v0] Toggling favorite for influencer:", influencerId)
    const newFavorites = favoriteIds.includes(influencerId)
      ? favoriteIds.filter((id) => id !== influencerId)
      : [...favoriteIds, influencerId]

    console.log("[v0] New favorites array:", newFavorites)
    setFavoriteIds(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const toggleCampaignFavorite = (campaignId: number) => {
    console.log("[v0] Toggling favorite for campaign:", campaignId)
    const newFavorites = favoriteCampaignIds.includes(campaignId)
      ? favoriteCampaignIds.filter((id) => id !== campaignId)
      : [...favoriteCampaignIds, campaignId]

    console.log("[v0] New campaign favorites array:", newFavorites)
    setFavoriteCampaignIds(newFavorites)
    localStorage.setItem("campaign-favorites", JSON.stringify(newFavorites))
  }

  const ProfileCard = ({ influencer }: { influencer: any }) => {
    const displayHashtags = influencer.hashtags.slice(0, 2)
    const remainingCount = influencer.hashtags.length - 2

    return (
      <Card className="bg-white rounded-2xl overflow-hidden shadow-sm p-0 h-[230px]">
        <CardContent className="p-0 h-full">
          <Link href={`/influencers/${influencer.id}`}>
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
                    toggleFavorite(influencer.id)
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favoriteIds.includes(influencer.id) ? "text-red-500 fill-red-500" : "text-gray-600 fill-gray-600"
                    }`}
                  />
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
          </Link>
        </CardContent>
      </Card>
    )
  }

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const getNegotiationText = (campaign: any) => {
      if (campaign.isDealPossible) {
        return { text: "딜 가능", color: "text-[#7b68ee] bg-[#7b68ee]/10" }
      }
      if (campaign.negotiationOption === "yes") {
        return { text: "협의 가능", color: "text-gray-400 bg-gray-100" }
      } else if (campaign.negotiationOption === "no") {
        return { text: "협의 불가", color: "text-gray-400 bg-gray-100" }
      }
      return null
    }

    return (
      <Card className="bg-white rounded-2xl overflow-hidden shadow-sm p-0">
        <CardContent className="p-0">
          <Link href={`/campaigns/${campaign.id}`}>
            <div className="py-4 px-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-3 h-8 w-8 bg-white hover:bg-gray-100 rounded-full z-10"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleCampaignFavorite(campaign.id)
                }}
              >
                <Heart
                  className={`w-4 h-4 ${
                    favoriteCampaignIds.includes(campaign.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-600 fill-gray-600"
                  }`}
                />
              </Button>

              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={campaign.thumbnail || "/placeholder.svg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between pr-8">
                  <div className="space-y-1">
                    <div className="mb-1">
                      <span className="bg-white/90 text-[#7b68ee] font-semibold text-xs px-2 py-1 rounded-full border border-gray-200">
                        {campaign.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-black leading-tight line-clamp-1">{campaign.title}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-black">{campaign.reward}</p>
                        {getNegotiationText(campaign) && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getNegotiationText(campaign).color}`}>
                            {getNegotiationText(campaign).text}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {campaign.recruitCount && (
                          <p className="text-sm text-gray-600">
                            <span className="text-sm text-[#7b68ee] font-semibold">{campaign.applicants || 0}</span>
                            <span className="text-sm">/{campaign.recruitCount}</span>{" "}
                            <span className="text-xs text-gray-500">명 모집중</span>
                          </p>
                        )}
                        {campaign.confirmedApplicants &&
                          campaign.recruitCount &&
                          campaign.confirmedApplicants / campaign.recruitCount >= 0.7 && (
                            <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium ml-2">
                              마감 임박
                            </span>
                          )}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{campaign.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-4 h-4 text-gray-400">💬</span>
                            <span className="text-xs text-gray-500">{campaign.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-border" style={{ height: "var(--gnb-height)" }}>
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 cursor-pointer">
              <ChevronLeft className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">뒤로 가기</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {isInfluencerMode ? (
          favoriteCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Heart className="w-16 h-16 text-gray-300" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-600">찜한 캠페인이 없습니다</h3>
                <p className="text-sm text-gray-500">마음에 드는 캠페인을 찜해보세요!</p>
              </div>
              <Link href="/campaigns">
                <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white px-6 py-2 rounded-full">
                  캠페인 찾아보기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">찜한 캠페인 ({favoriteCampaigns.length})</h2>
              </div>

              <div className="space-y-3">
                {favoriteCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )
        ) : favoriteInfluencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Heart className="w-16 h-16 text-gray-300" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-600">찜한 파트너가 없습니다</h3>
              <p className="text-sm text-gray-500">마음에 드는 파트너를 찜해보세요!</p>
            </div>
            <Link href="/influencers">
              <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white px-6 py-2 rounded-full">
                파트너 찾아보기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">찜한 파트너 ({favoriteInfluencers.length})</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              {favoriteInfluencers.map((influencer) => (
                <ProfileCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
