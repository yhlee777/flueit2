"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react" // ✅ 추가
import { useCampaigns } from "@/lib/campaign-store"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, ChevronDown, Pencil, MoreVertical, MapPin, Home, Eye, Heart } from "lucide-react"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"

const bannerAds = [
  {
    id: 1,
    title: "새로운 캠페인 기회",
    subtitle: "지금 참여하고 특별 혜택을 받아보세요",
    backgroundColor: "bg-gray-400",
    textColor: "text-white",
  },
  {
    id: 2,
    title: "브랜드 협업 특가",
    subtitle: "프리미엄 캠페인 30% 할인 혜택",
    backgroundColor: "bg-gray-500",
    textColor: "text-white",
  },
  {
    id: 3,
    title: "수익 기회 확대",
    subtitle: "더 많은 브랜드와 연결되세요",
    backgroundColor: "bg-gray-600",
    textColor: "text-white",
  },
]

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

const regions = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "경기도",
  "강원도",
  "충청도",
  "전라도",
  "경상도",
  "제주도",
]

const sortOptions = ["추천순", "최신순", "인기순"]

export default function CampaignsPage() {
  const { data: session, status } = useSession() // ✅ 세션 가져오기
  const { campaigns, loading } = useCampaigns()
  
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [bannerApi, setBannerApi] = useState<CarouselApi>()
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState("추천순")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedVisitType, setSelectedVisitType] = useState<string>("")
  const [favoriteCampaignIds, setFavoriteCampaignIds] = useState<string[]>([])

  // ✅ 세션에서 user_type 가져와서 설정
  useEffect(() => {
    if (status === "loading") return

    console.log("🔍 세션 상태:", status)
    console.log("🔍 세션 데이터:", session)

    if (session?.user?.userType) {
      // DB에 user_type이 있으면 이걸 사용
      const isInfluencer = session.user.userType === 'INFLUENCER'
      setIsInfluencerMode(isInfluencer)
      
      // localStorage와 동기화
      localStorage.setItem('influencer_mode', isInfluencer.toString())
      
      console.log('✅ user_type에서 모드 설정:', session.user.userType, '→', isInfluencer)
    } else {
      // DB에 없으면 localStorage 확인
      const savedMode = localStorage.getItem("influencer_mode")
      if (savedMode !== null) {
        const isInfluencer = savedMode === "true"
        setIsInfluencerMode(isInfluencer)
        console.log('⚠️ localStorage에서 모드 설정:', savedMode, '→', isInfluencer)
      } else {
        console.log('⚠️ user_type과 localStorage 모두 없음')
      }
    }
  }, [session, status])

  // ✅ 즐겨찾기 로드
  useEffect(() => {
    if (isInfluencerMode) {
      const savedFavorites = localStorage.getItem("campaign-favorites")
      if (savedFavorites) {
        setFavoriteCampaignIds(JSON.parse(savedFavorites))
      }
    }
  }, [isInfluencerMode])

  // ✅ 배너 설정
  useEffect(() => {
    if (!bannerApi) return

    const updateSlide = () => {
      setCurrentBannerSlide(bannerApi.selectedScrollSnap())
    }

    bannerApi.on("select", updateSlide)
    return () => {
      bannerApi.off("select", updateSlide)
    }
  }, [bannerApi])

  const getSortedCampaigns = () => {
    let filteredCampaigns = [...campaigns]

    // 마감/비공개 제외
    filteredCampaigns = filteredCampaigns.filter(
      (campaign) => campaign.status !== "비공개 글",
    )

    // 검색 필터
    if (searchQuery.trim()) {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filteredCampaigns = filteredCampaigns.filter((campaign) => 
        selectedCategories.includes(campaign.category)
      )
    }

    // 지역 필터
    if (selectedRegions.length > 0) {
      filteredCampaigns = filteredCampaigns.filter((campaign) =>
        selectedRegions.some((region) => (campaign as any).region?.includes(region))
      )
    }

    // 방문 유형 필터
    if (selectedVisitType) {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) => campaign.visit_type === selectedVisitType
      )
    }

    // 정렬
    if (selectedSort === "최신순") {
      filteredCampaigns.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
    } else if (selectedSort === "인기순") {
      filteredCampaigns.sort((a, b) => {
        const scoreA = (a.views || 0) + (a.likes || 0) * 2 + (a.comments || 0) * 3
        const scoreB = (b.views || 0) + (b.likes || 0) * 2 + (b.comments || 0) * 3
        return scoreB - scoreA
      })
    }

    return filteredCampaigns
  }

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const toggleRegionFilter = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  const toggleVisitTypeFilter = (type: string) => {
    setSelectedVisitType((prev) => (prev === type ? "" : type))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedRegions([])
    setSelectedVisitType("")
  }

  const toggleFavorite = (campaignId: string) => { // string 타입
  const newFavorites = favoriteCampaignIds.includes(campaignId)
    ? favoriteCampaignIds.filter((id) => id !== campaignId)
    : [...favoriteCampaignIds, campaignId]
  
  setFavoriteCampaignIds(newFavorites)
  localStorage.setItem("campaign-favorites", JSON.stringify(newFavorites))
}

  const getVisitTypeBadge = (campaign: any) => {
    if (campaign.visit_type === "visit") {
      return { icon: MapPin, text: "방문형" }
    } else if (campaign.visit_type === "non-visit") {
      return { icon: Home, text: "비방문형" }
    }
    return null
  }

  const sortedCampaigns = getSortedCampaigns()

  console.log("📊 캠페인 데이터:", {
    전체: campaigns.length,
    필터링됨: sortedCampaigns.length,
    로딩중: loading,
    모드: isInfluencerMode ? "인플루언서" : "광고주"
  })

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader title="캠페인" showSearch={false} showNotifications={true} />

      <main className="px-4 py-6">
        {/* 검색 + 필터 */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="캠페인 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-none h-11"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* 정렬 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {sortedCampaigns.length}개의 캠페인
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm h-8"
            onClick={() => setIsSortOpen(true)}
          >
            {selectedSort}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* 배너 */}
        <div className="mb-6">
          <Carousel setApi={setBannerApi} className="w-full">
            <CarouselContent>
              {bannerAds.map((ad) => (
                <CarouselItem key={ad.id}>
                  <div className={`${ad.backgroundColor} ${ad.textColor} rounded-2xl p-6`}>
                    <h3 className="text-lg font-bold mb-1">{ad.title}</h3>
                    <p className="text-sm opacity-90">{ad.subtitle}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-center gap-2 mt-3">
            {bannerAds.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentBannerSlide ? "w-6 bg-[#7b68ee]" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 캠페인 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
            <p className="text-gray-500">캠페인을 불러오는 중...</p>
          </div>
        ) : sortedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 캠페인이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={campaign.thumbnail || "/placeholder.svg"}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    {isInfluencerMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-9 w-9 bg-white/90 hover:bg-white rounded-full"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(campaign.id)
                        }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favoriteCampaignIds.includes(campaign.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </Button>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
                        {campaign.category}
                      </span>
                      {getVisitTypeBadge(campaign) && (
                        <span className="bg-gray-100 text-gray-600 font-medium text-xs px-2 py-1 rounded flex items-center gap-1">
                          {(() => {
  const badge = getVisitTypeBadge(campaign)
  const Icon = badge?.icon
  return Icon && <Icon className="w-3 h-3" />
})()}
{getVisitTypeBadge(campaign)?.text}
                          {getVisitTypeBadge(campaign)!.text}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-base mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#7b68ee]">
                        {campaign.reward}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {campaign.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 필터 Drawer */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">필터</h3>

            <div className="space-y-6">
              {/* 카테고리 */}
              <div>
                <h4 className="font-medium mb-3">카테고리</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategoryFilter(category)}
                      />
                      <label className="ml-2 text-sm">{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 방문 유형 */}
              <div>
                <h4 className="font-medium mb-3">방문 유형</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedVisitType === "visit"}
                      onCheckedChange={() => toggleVisitTypeFilter("visit")}
                    />
                    <label className="ml-2 text-sm">방문형</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedVisitType === "non-visit"}
                      onCheckedChange={() => toggleVisitTypeFilter("non-visit")}
                    />
                    <label className="ml-2 text-sm">비방문형</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                초기화
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 bg-[#7b68ee]">적용</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 정렬 Drawer */}
      <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
        <DrawerContent>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4">정렬</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedSort(option)
                    setIsSortOpen(false)
                  }}
                  className={`w-full p-3 rounded-lg text-left ${
                    selectedSort === option
                      ? "bg-[#7b68ee] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}