"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Check,
  MapPin,
  Users,
  BarChart3,
  Search,
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"

const recommendedInfluencers = [
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
]

const allInfluencers = [
  ...recommendedInfluencers,
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

const followerRanges = [
  { label: "1천 이하", min: 0, max: 1000 },
  { label: "1천 이상 1만 이하", min: 1000, max: 10000 },
  { label: "1만 이상 10만 이하", min: 10000, max: 100000 },
  { label: "10만 이상 100만 이하", min: 100000, max: 1000000 },
  { label: "100만 이상", min: 1000000, max: Number.POSITIVE_INFINITY },
]

export default function InfluencersPage() {
  const pathname = usePathname()
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFollowerRanges, setSelectedFollowerRanges] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [sortBy, setSortBy] = useState("추천 순")
  const [tempSortBy, setTempSortBy] = useState("추천 순")
  const [viewMode, setViewMode] = useState<"grid" | "horizontal">("grid")
  const [bannerApi, setBannerApi] = useState<CarouselApi>()
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  const sortOptions = [
    { label: "추천 순", value: "recommended" },
    { label: "팔로워 순", value: "followers" },
    { label: "참여도 순", value: "engagement" },
    { label: "평균 좋아요 순", value: "averageLikes" },
  ]

  const bannerAds = [
    {
      id: 1,
      title: "새로운 브랜드 캠페인",
      subtitle: "지금 참여하고 특별 혜택을 받아보세요",
      backgroundColor: "bg-[#7b68ee]",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "인플루언서 특별 할인",
      subtitle: "프리미엄 서비스 30% 할인 혜택",
      backgroundColor: "bg-[#7b68ee]",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "협업 기회 확대",
      subtitle: "더 많은 브랜드와 연결되세요",
      backgroundColor: "bg-[#7b68ee]",
      textColor: "text-white",
    },
  ]

  const filteredInfluencers = allInfluencers
    .filter((influencer) => {
      const hasAvatar = influencer.avatar && influencer.avatar !== "/placeholder.svg"
      const hasName = influencer.name && influencer.name.trim() !== ""
      const hasCategory = influencer.category && influencer.category.trim() !== ""
      const hasRegion = influencer.region && influencer.region.trim() !== ""
      const hasFollowers = influencer.followers && influencer.followers !== "0"

      // Only show profiles that are complete
      const isProfileComplete = hasAvatar && hasName && hasCategory && hasRegion && hasFollowers

      if (!isProfileComplete) {
        return false
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(influencer.category)) {
        return false
      }

      if (selectedFollowerRanges.length > 0) {
        const followerCount = Number.parseInt(influencer.followers)
        const matchesRange = selectedFollowerRanges.some((rangeLabel) => {
          const range = followerRanges.find((r) => r.label === rangeLabel)
          return range && followerCount >= range.min && followerCount < range.max
        })
        if (!matchesRange) return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        return (
          influencer.name.toLowerCase().includes(query) ||
          influencer.category.toLowerCase().includes(query) ||
          influencer.hashtags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "followers":
          return Number.parseInt(b.followers) - Number.parseInt(a.followers)
        case "engagement":
          return Number.parseFloat(b.engagement) - Number.parseFloat(a.engagement)
        case "averageLikes":
          return Number.parseInt(b.averageLikes || "0") - Number.parseInt(a.averageLikes || "0")
        case "recommended":
        default:
          return 0
      }
    })

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleFollowerRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setSelectedFollowerRanges([...selectedFollowerRanges, range])
    } else {
      setSelectedFollowerRanges(selectedFollowerRanges.filter((r) => r !== range))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedFollowerRanges([])
  }

  const handleSortApply = () => {
    setSortBy(tempSortBy)
    setIsSortOpen(false)
  }

  const toggleFavorite = (influencerId: number) => {
    const newFavorites = favoriteIds.includes(influencerId)
      ? favoriteIds.filter((id) => id !== influencerId)
      : [...favoriteIds, influencerId]

    setFavoriteIds(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const ProfileCard = ({
    influencer,
    isHorizontal = false,
    isRecommended = false,
    isGridMode = false,
  }: { influencer: any; isHorizontal?: boolean; isRecommended?: boolean; isGridMode?: boolean }) => {
    const displayHashtags = influencer.hashtags.slice(0, 2)
    const remainingCount = influencer.hashtags.length - 2

    if (isHorizontal && viewMode === "horizontal" && !isRecommended) {
      return (
        <div className="bg-transparent rounded-2xl overflow-hidden p-0 w-full h-32">
          <div className="p-0 h-full">
            <Link href={`/influencers/${influencer.id}`}>
              <div className="flex h-full">
                <div className="w-32 bg-white relative overflow-hidden rounded-l-2xl flex-shrink-0 p-3">
                  <img
                    src={influencer.avatar || "/placeholder.svg"}
                    alt={influencer.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between relative">
                  {!isInfluencerMode && (
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
                          favoriteIds.includes(influencer.id)
                            ? "text-[#7b68ee] fill-[#7b68ee]"
                            : "text-gray-600 fill-gray-600"
                        }`}
                      />
                    </Button>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm leading-tight">{influencer.name}</h3>
                      {influencer.verified && (
                        <div className="w-5 h-5 bg-[#7b68ee] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white stroke-[4]" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 leading-tight">
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

                    <div className="flex flex-wrap gap-2 items-center">
                      {displayHashtags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs text-blue-500 leading-tight">
                          {tag}
                        </span>
                      ))}
                      {influencer.hashtags.length > 2 && (
                        <span className="text-xs text-blue-500 leading-tight">+{remainingCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )
    }

    if (isRecommended) {
      return (
        <div className="bg-transparent rounded-2xl overflow-hidden p-0 min-w-[160px] w-[160px] h-[230px]">
          <div className="p-0 h-full">
            <Link href={`/influencers/${influencer.id}`}>
              <div className="relative h-full flex flex-col">
                <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
                  <img
                    src={influencer.avatar || "/placeholder.svg"}
                    alt={influencer.name}
                    className="w-full h-full object-cover rounded-bl-lg rounded-br-lg"
                  />
                  {!isInfluencerMode && (
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
                          favoriteIds.includes(influencer.id)
                            ? "text-[#7b68ee] fill-[#7b68ee]"
                            : "text-gray-600 fill-gray-600"
                        }`}
                      />
                    </Button>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-white/90 text-[#7b68ee] font-semibold text-xs px-2 py-1 rounded-full">
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
                    {remainingCount > 0 && (
                      <span className="text-xs text-blue-500 leading-tight">+{remainingCount}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div
        className={`bg-transparent rounded-2xl overflow-hidden p-0 h-[230px] ${
          isGridMode ? "w-full" : "min-w-[160px] w-[160px]"
        } ${isHorizontal ? "min-w-[200px] w-[200px]" : ""}`}
        style={{ boxSizing: "border-box", margin: 0 }}
      >
        <div className="p-0 h-full">
          <Link href={`/influencers/${influencer.id}`}>
            <div className="relative h-full flex flex-col">
              <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
                <img
                  src={influencer.avatar || "/placeholder.svg"}
                  alt={influencer.name}
                  className="w-full h-full object-cover rounded-bl-lg rounded-br-lg"
                />
                {!isInfluencerMode && (
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
                        favoriteIds.includes(influencer.id)
                          ? "text-[#7b68ee] fill-[#7b68ee]"
                          : "text-gray-600 fill-gray-600"
                      }`}
                    />
                  </Button>
                )}
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
        </div>
      </div>
    )
  }

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavoriteIds(JSON.parse(savedFavorites))
    }

    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)

    if (influencerMode) {
      setProfileCompletion(calculateProfileCompletion())
    }
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      const influencerMode = localStorage.getItem("influencer_mode") === "true"
      if (influencerMode) {
        const newCompletion = calculateProfileCompletion()
        setProfileCompletion(newCompletion)
        console.log("[v0] Profile completion updated on focus:", newCompletion)
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const calculateProfileCompletion = () => {
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

    console.log("[v0] Profile completion data:", profileData)

    if (profileData.hasAvatar) completion += 16.67
    if (profileData.hasName) completion += 16.67
    if (profileData.hasBio) completion += 16.67
    if (profileData.hasInstagram) completion += 16.67
    if (profileData.hasCategory) completion += 16.67
    if (profileData.hasHashtags) completion += 16.67

    // Round to nearest integer
    completion = Math.round(completion)

    console.log("[v0] Profile completion percentage:", completion)
    return completion
  }

  return (
    <div
      className="bg-white pb-20 scrollbar-hide"
      style={{
        minHeight: "100dvh",
        minHeight: "-webkit-fill-available",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <TopHeader title="파트너" />

      {isInfluencerMode && profileCompletion < 100 && (
        <div
          className="pt-0 pb-0"
          style={{
            paddingLeft: "calc(16px + env(safe-area-inset-left))",
            paddingRight: "calc(16px + env(safe-area-inset-right))",
          }}
        >
          <Link href="/profile/edit">
            <Card className="bg-transparent rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50/50 transition-all border-transparent shadow-none">
              <CardContent className="p-0">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 text-xs leading-none">
                      프로필을 완성하고 더 많은 협업 기회를 얻으세요.
                    </p>
                    <span className="text-gray-600 font-semibold text-xs ml-2 leading-none">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-1.5 bg-gray-200 [&>div]:bg-[#7b68ee]" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <main
        className="pt-2 pb-0 space-y-2"
        style={{
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
        }}
      >
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">잇다가 추천하는 파트너</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">광고</span>
            </div>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recommendedInfluencers.map((influencer) => (
              <ProfileCard
                key={`rec-${influencer.id}`}
                influencer={influencer}
                isHorizontal={true}
                isRecommended={true}
              />
            ))}
          </div>
        </div>

        <div className="-mt-0.5">
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
                      className={`w-full h-20 md:h-30 lg:h-36 ${banner.backgroundColor} ${banner.textColor} rounded-2xl p-4 flex flex-col justify-center`}
                    >
                      <h3 className="font-bold text-base leading-tight">{banner.title}</h3>
                      <p className="text-xs opacity-90 mt-1">{banner.subtitle}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

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
      </main>

      <main
        className="pt-6 pb-0 space-y-1"
        style={{
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
        }}
      >
        <div className="space-y-2">
          <div>
            <div className="relative">
              <Input
                placeholder="인플루언서 이름, 해시태그 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 rounded-full pl-4 pr-20 py-4 border-gray-200 placeholder:text-gray-400 text-gray-700 h-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                )}
                <button>
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-500 mt-2 ml-1">검색 결과: {filteredInfluencers.length}명</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center gap-1">
              <div className="flex gap-1 overflow-x-auto pb-2">
                <Button
                  variant="outline"
                  className="rounded-full whitespace-nowrap bg-white h-8 px-2 text-xs"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-0.5" />
                  필터
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full whitespace-nowrap bg-white h-8 px-2 text-xs"
                  onClick={() => setIsSortOpen(true)}
                >
                  추천 순
                  <ChevronDown className="w-3.5 h-3.5 -ml-0.5" />
                </Button>
              </div>

              <div className="flex-shrink-0">
                <div className="relative flex rounded-full border border-gray-200 bg-white overflow-hidden h-8 p-1">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#7b68ee] rounded-full transition-all duration-300 ease-in-out shadow-md ${viewMode === "grid" ? "left-1" : "left-[calc(50%+2px)]"}`}
                  />

                  <button
                    className={`relative z-10 rounded-full px-2 py-1 h-full flex-1 transition-all duration-200 flex items-center justify-center ${viewMode === "grid" ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    className={`relative z-10 rounded-full px-2 py-1 h-full flex-1 transition-all duration-200 flex items-center justify-center ${viewMode === "horizontal" ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                    onClick={() => setViewMode("horizontal")}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[-4px]">
            {filteredInfluencers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-xs mt-2">다른 키워드로 검색해보세요.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div
                style={
                  {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, calc((100% - var(--gap)) / 2))",
                    gap: "var(--gap)",
                    justifyContent: "center",
                    "--gap": "12px",
                  } as React.CSSProperties
                }
              >
                {filteredInfluencers.map((influencer) => (
                  <ProfileCard key={`all-${influencer.id}`} influencer={influencer} isGridMode={true} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInfluencers.map((influencer) => (
                  <ProfileCard key={`horizontal-${influencer.id}`} influencer={influencer} isHorizontal={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-2 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">카테고리</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category, !selectedCategories.includes(category))}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${selectedCategories.includes(category) ? "bg-[#7b68ee] text-white border-[#7b68ee]" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">팔로워 수</h3>
              <div className="flex flex-wrap gap-2">
                {followerRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() =>
                      handleFollowerRangeChange(range.label, !selectedFollowerRanges.includes(range.label))
                    }
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${selectedFollowerRanges.includes(range.label) ? "bg-[#7b68ee] text-white border-[#7b68ee]" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6">
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
          <div className="px-4 pt-2 pb-2 space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTempSortBy(option.label)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  tempSortBy === option.label
                    ? "bg-[#7b68ee] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <DrawerFooter className="pt-2 pb-6">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-[3] bg-transparent h-12">
                  취소
                </Button>
              </DrawerClose>
              <Button onClick={handleSortApply} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                적용
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
