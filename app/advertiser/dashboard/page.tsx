// app/advertiser/dashboard/page.tsx
"use client"

import { TopHeader } from "@/components/top-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Users,
  Heart,
  ChevronRight,
  PenTool,
  Search,
  Megaphone,
  Settings,
  Check,
  MapPin,
  BarChart3,
  Home,
  Eye,
} from "lucide-react"
import { useCampaigns } from "@/lib/campaign-store"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useState, useEffect } from "react"
import Link from "next/link"
import { isProfileComplete } from "@/lib/profile-utils"

// ✅ 스네이크/카멜 혼용 방지 헬퍼
const getRecruitCount = (c: any) => c.recruit_count ?? c.recruitCount ?? 0
const getConfirmedApplicants = (c: any) => c.confirmed_applicants ?? c.confirmedApplicants ?? 0
const getLikes = (c: any) => c.likes ?? 0
const getComments = (c: any) => c.comments ?? 0

// ✅ 광고주 프로필 로드
function loadAdvertiserProfileFromStorage(): any | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("advertiser_profile")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const getNegotiationText = (campaign: any) => {
  if (campaign.isDealPossible) {
    return { text: "딜 가능", color: "text-[#51a66f] bg-[#51a66f]/10" }
  }
  if (campaign.negotiationOption === "yes") {
    return { text: "협의 가능", color: "text-gray-400 bg-gray-100" }
  } else if (campaign.negotiationOption === "no") {
    return { text: "협의 불가", color: "text-gray-400 bg-gray-100" }
  }
  return null
}

const getVisitTypeBadge = (campaign: any) => {
  if (campaign.visitType === "visit") return { icon: MapPin, text: "방문형" }
  if (campaign.visitType === "non-visit") return { icon: Home, text: "비방문형" }
  return null
}

export default function AdvertiserDashboard() {
  const { campaigns } = useCampaigns()
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [isProfileCompleteState, setIsProfileCompleteState] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [bannerApi, setBannerApi] = useState<CarouselApi>()
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("influencer_mode", "false")
      const profile = loadAdvertiserProfileFromStorage()
      setIsProfileCompleteState(isProfileComplete(profile, 60))
    }
  }, [])

  const featuredCampaigns = campaigns
    .filter((c) => c.status === "구인 진행 중")
    .sort((a, b) => getLikes(b) + getComments(b) - (getLikes(a) + getComments(a)))
    .slice(0, 3)

  const toggleFavorite = (id: number) => {
    const updated = favoriteIds.includes(id)
      ? favoriteIds.filter((x) => x !== id)
      : [...favoriteIds, id]
    setFavoriteIds(updated)
    if (typeof window !== "undefined")
      localStorage.setItem("favorites", JSON.stringify(updated))
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("favorites")
    if (saved) setFavoriteIds(JSON.parse(saved))
  }, [])

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader />

      <main className="px-4 pt-10 pb-6 space-y-12">
        {/* 🔥 캠페인 목록 */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">지금 주목받는 캠페인</h2>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500">
              더보기 <ChevronRight className="w-3 h-3 -ml-0.5" />
            </Button>
          </div>

          {featuredCampaigns.length > 0 ? (
            featuredCampaigns.map((campaign, i) => (
              <div key={campaign.id} className="py-6 border-b border-gray-100">
                <Link href={`/campaigns/${campaign.id}`}>
                  <div className="flex gap-3 items-start">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={campaign.thumbnail || "/placeholder.svg"}
                        alt={campaign.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold truncate text-black">{campaign.title}</h3>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-bold text-black">
                          {campaign.reward || "협의"}
                        </span>
                        {getNegotiationText(campaign) && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getNegotiationText(campaign)!.color}`}
                          >
                            {getNegotiationText(campaign)!.text}
                          </span>
                        )}
                      </div>

                      {getRecruitCount(campaign) > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="text-[#03C75A] font-semibold">
                            {campaign.applicants || 0}
                          </span>
                          /{getRecruitCount(campaign)}명 모집중
                          {getConfirmedApplicants(campaign) / getRecruitCount(campaign) >= 0.7 && (
                            <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                              마감 임박
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="mx-auto mb-3 w-10 h-10" />
              현재 주목받는 캠페인이 없습니다.
            </div>
          )}
        </section>

        {/* 🔥 프로필 완성 여부 카드 */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {isProfileCompleteState ? (
              <Link href="/campaigns/create" className="block">
                <Card className="border rounded-xl shadow-sm hover:shadow-md">
                  <CardContent className="p-4 h-full flex flex-col justify-between relative">
                    <h3 className="font-bold text-[15px]">캠페인 작성하기</h3>
                    <PenTool className="absolute bottom-4 right-4 w-8 h-8 text-[#7b68ee]" />
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="bg-[#7b68ee]/10 border border-[#7b68ee]/20 rounded-xl h-[190px]">
                <CardContent className="p-4 h-full flex flex-col justify-between relative">
                  <h3 className="font-bold text-[15px] text-[#7b68ee]/60">캠페인 작성하기</h3>
                  <PenTool className="absolute bottom-4 right-4 w-8 h-8 text-[#7b68ee]/40" />
                </CardContent>
              </Card>
            )}

            <Link href="/influencers" className="block">
              <Card className="border rounded-xl shadow-sm hover:shadow-md">
                <CardContent className="p-4 h-full flex flex-col justify-between relative">
                  <h3 className="font-bold text-[15px]">파트너 찾기</h3>
                  <Search className="absolute bottom-4 right-4 w-8 h-8 text-[#7b68ee]" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
