"use client"

import { Input } from "@/components/ui/input"
import { checkAdvertiserProfileComplete } from "@/lib/profile-utils"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCampaigns } from "@/lib/campaign-store"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, ChevronDown, Pencil, MoreVertical, MapPin, Home, Eye } from "lucide-react"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

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

  const getSortedCampaigns = () => {
    let filteredCampaigns = [...campaigns]

    filteredCampaigns = filteredCampaigns.filter(
      (campaign) => campaign.status !== "구인 마감" && campaign.status !== "비공개 글",
    )

    // Apply search filter
    if (searchQuery.trim()) {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filteredCampaigns = filteredCampaigns.filter((campaign) => selectedCategories.includes(campaign.category))
    }

    // Apply visit type filter
    if (selectedVisitType) {
      filteredCampaigns = filteredCampaigns.filter((campaign) => {
        if (selectedVisitType === "방문형") {
          return campaign.visit_type === "visit"  // ✅ snake_case
        } else if (selectedVisitType === "비방문형") {
          return campaign.visit_type === "non-visit"  // ✅ snake_case
        }
        return true
      })
    }

    // Apply sorting
    switch (selectedSort) {
      case "최신순":
        // ✅ created_at 기준으로 정렬
        return filteredCampaigns.sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime()  // ✅ snake_case
          const bDate = new Date(b.created_at || 0).getTime()  // ✅ snake_case
          return bDate - aDate  // 최신이 먼저
        })
      case "인기순":
        // ✅ likes + comments 기준 (undefined 방지)
        return filteredCampaigns.sort((a, b) => {
          const aPopularity = (a.likes || 0) + (a.comments || 0)
          const bPopularity = (b.likes || 0) + (b.comments || 0)
          return bPopularity - aPopularity
        })
      case "추천순":
      default:
        // ✅ views 기준으로 추천순 정렬
        return filteredCampaigns.sort((a, b) => {
          return (b.views || 0) - (a.views || 0)
        })
    }
  }
  const sortedCampaigns = getSortedCampaigns()

  const getNegotiationText = (campaign: any) => {
    if (campaign.is_deal_possible) {  // ✅ snake_case
      return { text: "딜 가능", color: "text-[#7b68ee] bg-[#7b68ee]/10" }
    }
    if (campaign.negotiation_option === "yes") {  // ✅ snake_case
      return { text: "협의 가능", color: "text-gray-400 bg-gray-100" }
    } else if (campaign.negotiation_option === "no") {  // ✅ snake_case
      return { text: "협의 불가", color: "text-gray-400 bg-gray-100" }
    }
    return null
  }

  const getVisitTypeBadge = (campaign: any) => {
    if (campaign.visit_type === "visit") {  // ✅ snake_case
      return {
        icon: MapPin,
        text: "방문형",
      }
    } else if (campaign.visit_type === "non-visit") {  // ✅ snake_case
      return {
        icon: Home,
        text: "비방문형",
      }
    }
    return null
  }

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    if (!influencerMode) {
      const isComplete = checkAdvertiserProfileComplete()
      setIsProfileComplete(isComplete)
    }
  }, [])

  useEffect(() => {
    if (!bannerApi) {
      return
    }

    setCurrentBannerSlide(bannerApi.selectedScrollSnap())

    bannerApi.on("select", () => {
      setCurrentBannerSlide(bannerApi.selectedScrollSnap())
    })
  }, [bannerApi])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions([...selectedRegions, region])
    } else {
      setSelectedRegions(selectedRegions.filter((r) => r !== region))
    }
  }

  const handleVisitTypeChange = (visitType: string) => {
    setSelectedVisitType(selectedVisitType === visitType ? "" : visitType)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedRegions([])
    setSelectedVisitType("")
  }

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
  }

  const applySortFilter = () => {
    setIsSortOpen(false)
  }

  const cancelSortFilter = () => {
    setIsSortOpen(false)
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader />

      <main className="max-w-2xl mx-auto pt-16">
        <div className="px-4 pb-4 sticky top-16 bg-white z-20 border-b border-gray-100">
          <div className="relative mt-3 mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="캠페인 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 h-12 text-base border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-[#7b68ee] focus-visible:ring-offset-0"
            />
          </div>

          <Carousel className="w-full" setApi={setBannerApi}>
            <CarouselContent>
              {bannerAds.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div
                    className={`w-full h-32 ${banner.backgroundColor} rounded-2xl flex flex-col justify-center px-6 shadow-sm`}
                  >
                    <h3 className={`text-xl font-bold ${banner.textColor} mb-2`}>{banner.title}</h3>
                    <p className={`text-sm ${banner.textColor} opacity-90`}>{banner.subtitle}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-1.5 mt-3">
              {bannerAds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => bannerApi?.scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentBannerSlide ? "w-6 bg-[#7b68ee]" : "w-1.5 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">필터</span>
              {(selectedCategories.length > 0 || selectedRegions.length > 0 || selectedVisitType) && (
                <span className="bg-[#7b68ee] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedCategories.length + selectedRegions.length + (selectedVisitType ? 1 : 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsSortOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{selectedSort}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="py-20 text-center text-gray-500">로딩 중...</div>
          ) : sortedCampaigns.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              {searchQuery.trim() ? "검색 결과가 없습니다." : "등록된 캠페인이 없습니다."}
            </div>
          ) : (
            sortedCampaigns.map((campaign, index) => (
              <div key={campaign.id}>
                <div className="py-4 px-4 hover:bg-gray-50/50 transition-colors relative">
                  <Link href={`/campaigns/${campaign.id}`} className="block">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                        {campaign.thumbnail ? (
                          <img
                            src={campaign.thumbnail}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">이미지 없음</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base line-clamp-2 mb-1 pr-6">{campaign.title}</h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getNegotiationText(campaign) && (
                              <span
                                className={`${getNegotiationText(campaign)!.color} text-xs px-2 py-0.5 rounded font-medium`}
                              >
                                {getNegotiationText(campaign)!.text}
                              </span>
                            )}
                            {campaign.recruit_count && (  // ✅ snake_case
                              <p className="text-sm text-gray-600">
                                <span className="text-sm text-[#7b68ee] font-semibold">{campaign.applicants || 0}</span>
                                <span className="text-sm">/{campaign.recruit_count}</span>{" "}  {/* ✅ snake_case */}
                                <span className="text-xs text-gray-500">명 모집중</span>
                              </p>
                            )}
                            {campaign.confirmed_applicants &&  // ✅ snake_case
                              campaign.recruit_count &&  // ✅ snake_case
                              campaign.confirmed_applicants / campaign.recruit_count >= 0.7 && (  // ✅ snake_case
                                <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium">
                                  마감 임박
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="bg-[#7b68ee]/10 text-[#7b68ee] font-medium text-xs px-2 py-1 rounded">
                              {campaign.category}
                            </span>
                            {getVisitTypeBadge(campaign) && (
                              <span className="bg-gray-100 text-gray-600 font-medium text-xs px-2 py-1 rounded">
                                {getVisitTypeBadge(campaign)!.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-0 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400">{campaign.views || 0}</span>
                    </div>
                  </Link>
                </div>
                {index < sortedCampaigns.length - 1 && <div className="border-b border-gray-100" />}
              </div>
            ))
          )}
        </div>
      </main>

      {!isInfluencerMode && isProfileComplete && (
        <Link href="/campaigns/create">
          <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-200 hover:scale-105 active:scale-95 bg-[#7b68ee]">
            <Pencil className="w-6 h-6 text-white" />
          </button>
        </Link>
      )}

      {!isInfluencerMode && !isProfileComplete && (
        <button
          disabled
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 bg-[#7b68ee]/30 cursor-not-allowed"
        >
          <Pencil className="w-6 h-6 text-white" />
        </button>
      )}

      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden max-h-[85vh]">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-2 pb-4 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category, !selectedCategories.includes(category))}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">캠페인 유형</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleVisitTypeChange("방문형")}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors flex items-center gap-1 ${
                      selectedVisitType === "방문형"
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    방문형 캠페인
                  </button>
                  <button
                    onClick={() => handleVisitTypeChange("비방문형")}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors flex items-center gap-1 ${
                      selectedVisitType === "비방문형"
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    비방문형 캠페인
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">지역</h3>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => handleRegionChange(region, !selectedRegions.includes(region))}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        selectedRegions.includes(region)
                          ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6 border-t border-gray-100">
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-[3] bg-transparent h-12">
                초기화
              </Button>
              <DrawerClose asChild>
                <Button className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">적용</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4 space-y-6">
            <div>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-base transition-colors ${
                      selectedSort === option ? "bg-[#7b68ee] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6 border-t border-gray-100">
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelSortFilter} className="w-full bg-transparent h-12">
                취소
              </Button>
              <Button onClick={applySortFilter} className="w-full bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                적용
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4 space-y-6">
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Handle report action
                  setIsReportOpen(false)
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-base transition-colors bg-white text-red-500 hover:bg-red-50"
              >
                신고하기
              </button>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6 border-t border-gray-100">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full bg-transparent h-12">
                  취소
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}