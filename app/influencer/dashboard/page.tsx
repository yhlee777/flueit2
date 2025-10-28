"use client"

import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, ChevronRight, Check, MapPin, BarChart3, MoreVertical, Home, Eye } from "lucide-react"
import { useCampaigns } from "@/lib/campaign-store"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"

const hotInfluencers = [
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

const bannerSlides = [
  {
    id: 1,
    title: "새로운 캠페인을 시작하세요",
    subtitle: "더 많은 인플루언서와 함께하는 마케팅",
  },
  {
    id: 2,
    title: "완벽한 파트너를 찾아보세요",
    subtitle: "정확한 타겟팅으로 더 높은 성과를",
  },
  {
    id: 3,
    title: "실시간 분석으로 캠페인 성과 확인",
    subtitle: "데이터 기반의 스마트한 마케팅 전략",
  },
]

export default function InfluencerDashboard() {
  const { campaigns } = useCampaigns()
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [bannerApi, setBannerApi] = useState<CarouselApi>()
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0)
  const [canScrollBannerPrev, setCanScrollBannerPrev] = useState(false)
  const [canScrollBannerNext, setCanScrollBannerNext] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const featuredCampaigns = campaigns
    .filter((campaign) => campaign.status === "구인 진행 중")
    .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
    .slice(0, 3)

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

  const ProfileCard = ({ influencer }: { influencer: any }) => {
    const displayHashtags = influencer.hashtags.slice(0, 2)
    const remainingCount = influencer.hashtags.length - 2

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
    localStorage.setItem("influencer_mode", "true")
  }, [])

  useEffect(() => {
    if (!carouselApi) {
      return
    }

    const updateScrollState = () => {
      setCanScrollNext(carouselApi.canScrollNext())
    }

    updateScrollState()
    carouselApi.on("select", updateScrollState)

    return () => {
      carouselApi.off("select", updateScrollState)
    }
  }, [carouselApi])

  useEffect(() => {
    if (!bannerApi) {
      return
    }

    const updateBannerState = () => {
      setCurrentBannerSlide(bannerApi.selectedScrollSnap())
      setCanScrollBannerPrev(bannerApi.canScrollPrev())
      setCanScrollBannerNext(bannerApi.canScrollNext())
    }

    updateBannerState()
    bannerApi.on("select", updateBannerState)

    return () => {
      bannerApi.off("select", updateBannerState)
    }
  }, [bannerApi])

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader />

      <section className="w-full">
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
              {bannerSlides.map((slide, index) => (
                <CarouselItem key={slide.id} className="pl-0">
                  <div className="w-full h-56 md:h-80 lg:h-96 bg-gray-200" />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentBannerSlide ? "bg-gray-600" : "bg-gray-400"
                  }`}
                  onClick={() => bannerApi?.scrollTo(index)}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      <main className="px-4 py-6 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">지금 주목받는 캠페인</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 h-7 -mr-2 transition-colors duration-200"
            >
              더보기 <ChevronRight className="w-3 h-3 -ml-0.5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">인플루언서들의 관심을 많이 받은 캠페인이에요.</p>
          <div className="border-t border-gray-200">
            {featuredCampaigns.length > 0 ? (
              featuredCampaigns.map((campaign, index) => (
                <div key={campaign.id}>
                  <div className="py-6 pb-12 hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsReportOpen(true)
                      }}
                      className="absolute top-6 right-0 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    <Link href={`/campaigns/${campaign.id}`} className="block">
                      <div className="flex items-start gap-3">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 self-start">
                          <img
                            src={campaign.thumbnail || "/placeholder.svg?height=96&width=96&query=campaign"}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-black leading-tight truncate flex-1">
                              {campaign.title}
                            </h3>
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
                            {campaign.recruitCount && (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600">
                                  <span className="text-sm text-[#7b68ee] font-semibold">
                                    {campaign.applicants || 0}
                                  </span>
                                  <span className="text-sm">/{campaign.recruitCount}</span>{" "}
                                  <span className="text-xs text-gray-500">명 모집중</span>
                                </p>
                                {campaign.confirmedApplicants &&
                                  campaign.recruitCount &&
                                  campaign.confirmedApplicants / campaign.recruitCount >= 0.7 && (
                                    <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium">
                                      마감 임박
                                    </span>
                                  )}
                              </div>
                            )}
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
                  {index < featuredCampaigns.length - 1 && <div className="border-b border-gray-100" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">현재 주목받는 캠페인이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-foreground">지금 핫한 인플루언서</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 h-7 -mr-2 transition-colors duration-200"
            >
              더보기 <ChevronRight className="w-3 h-3 -ml-0.5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">잇다에서 협업을 진행한 인플루언서에요.</p>

          <div className="relative">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
                containScroll: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {hotInfluencers.map((influencer) => (
                  <CarouselItem key={influencer.id} className="pl-4 basis-auto">
                    <ProfileCard influencer={influencer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      </main>

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
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-transparent h-12">
                취소
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
