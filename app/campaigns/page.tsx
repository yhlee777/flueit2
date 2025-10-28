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
  const { campaigns } = useCampaigns()
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
          return campaign.visitType === "visit"
        } else if (selectedVisitType === "비방문형") {
          return campaign.visitType === "non-visit"
        }
        return true
      })
    }

    // Apply sorting
    switch (selectedSort) {
      case "최신순":
        return filteredCampaigns.sort((a, b) => {
          const aHours = Number.parseInt(a.timeAgo.replace(/[^0-9]/g, "")) || 0
          const bHours = Number.parseInt(b.timeAgo.replace(/[^0-9]/g, "")) || 0
          return aHours - bHours
        })
      case "인기순":
        return filteredCampaigns.sort((a, b) => {
          const aPopularity = a.likes + a.comments
          const bPopularity = b.likes + b.comments
          return bPopularity - aPopularity
        })
      case "추천순":
      default:
        return filteredCampaigns
    }
  }

  const sortedCampaigns = getSortedCampaigns()

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

  const getVisitTypeBadge = (campaign: any) => {
    if (campaign.visitType === "visit") {
      return {
        icon: MapPin,
        text: "방문형",
      }
    } else if (campaign.visitType === "non-visit") {
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
      <TopHeader title="캠페인" />

      <main className="px-2 py-2 space-y-2">
        <div className="px-1">
          <div className="relative">
            <Carousel
              setApi={setBannerApi}
              opts={{
                align: "start",
                loop: false,
                dragFree: false,
                containScroll: "trimSnaps",
                slidesToScroll: 1,
                skipSnaps: false,
                inViewThreshold: 1.0,
              }}
              className="w-full"
            >
              <CarouselContent className="ml-0">
                {bannerAds.map((banner, index) => (
                  <CarouselItem key={banner.id} className="pl-0 mr-3 last:mr-0">
                    <div
                      className={`w-full h-40 md:h-60 lg:h-72 ${banner.backgroundColor} ${banner.textColor} rounded-2xl p-4 flex flex-col justify-center`}
                    >
                      <h3 className="font-bold text-base leading-tight">{banner.title}</h3>
                      <p className="text-xs opacity-90 mt-1">{banner.subtitle}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {bannerAds.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentBannerSlide ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => bannerApi?.scrollTo(index)}
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </div>

        <div className="px-1">
          <div className="relative">
            <Input
              placeholder="원하는 키워드를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 rounded-full pl-4 pr-10 py-4 border-gray-200 placeholder:text-gray-400 text-gray-700 h-12"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-1">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="outline"
              className="rounded-full whitespace-nowrap bg-white h-8 px-2 text-xs flex-shrink-0"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-0.5" />
              필터
            </Button>
            <Button
              variant="outline"
              className="rounded-full whitespace-nowrap bg-white h-8 px-2 text-xs flex-shrink-0"
              onClick={() => setIsSortOpen(true)}
            >
              {selectedSort}
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </Button>
            <Button
              variant="outline"
              className={`rounded-full whitespace-nowrap h-8 px-2 text-xs flex-shrink-0 transition-colors ${
                selectedVisitType === "방문형"
                  ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => handleVisitTypeChange("방문형")}
            >
              <MapPin className="w-3.5 h-3.5 mr-0.5" />
              방문형 캠페인
            </Button>
            <Button
              variant="outline"
              className={`rounded-full whitespace-nowrap h-8 px-2 text-xs flex-shrink-0 transition-colors ${
                selectedVisitType === "비방문형"
                  ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => handleVisitTypeChange("비방문형")}
            >
              <Home className="w-3.5 h-3.5 mr-0.5" />
              비방문형 캠페인
            </Button>
          </div>
        </div>

        <div className="px-1">
          {sortedCampaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>조건에 맞는 캠페인이 없습니다.</p>
            </div>
          ) : (
            sortedCampaigns.map((campaign, index) => (
              <div key={campaign.id}>
                {index === 0 && <div className="border-b border-gray-100" />}
                <div className="py-6 pb-12 hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative">
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-black leading-tight truncate flex-1">
                            {campaign.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsReportOpen(true)
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 -mt-1"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        <div className="space-y-0.5 mt-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-black">{campaign.reward}</p>
                            {getNegotiationText(campaign) && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getNegotiationText(campaign).color}`}
                              >
                                {getNegotiationText(campaign).text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
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
                                {getVisitTypeBadge(campaign).text}
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
