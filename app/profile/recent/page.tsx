"use client"

import type React from "react"

import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { useViewHistory } from "@/lib/view-history-store"
import Link from "next/link"
import { MapPin, Users, Heart, BarChart3, Trash2, Check } from "lucide-react"
import { useState, useEffect } from "react"

export default function RecentHistoryPage() {
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const { getRecentProfiles, getRecentCampaigns, clearHistory, clearCampaignHistory } = useViewHistory()
  const recentProfiles = getRecentProfiles()
  const recentCampaigns = getRecentCampaigns()
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [campaignFavoriteIds, setCampaignFavoriteIds] = useState<number[]>([])

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)
  }, [])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavoriteIds(JSON.parse(savedFavorites))
    }

    const savedCampaignFavorites = localStorage.getItem("campaign-favorites")
    if (savedCampaignFavorites) {
      setCampaignFavoriteIds(JSON.parse(savedCampaignFavorites))
    }
  }, [])

  const toggleFavorite = (influencerId: number) => {
    const newFavorites = favoriteIds.includes(influencerId)
      ? favoriteIds.filter((id) => id !== influencerId)
      : [...favoriteIds, influencerId]

    setFavoriteIds(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const toggleCampaignFavorite = (campaignId: number) => {
    const newFavorites = campaignFavoriteIds.includes(campaignId)
      ? campaignFavoriteIds.filter((id) => id !== campaignId)
      : [...campaignFavoriteIds, campaignId]

    setCampaignFavoriteIds(newFavorites)
    localStorage.setItem("campaign-favorites", JSON.stringify(newFavorites))
  }

  const ProfileCard = ({ influencer }: { influencer: any }) => {
    const displayHashtags = influencer.hashtags?.slice(0, 2) || []
    const remainingCount = (influencer.hashtags?.length || 0) - 2

    return (
      <div className="bg-transparent rounded-2xl overflow-hidden p-0 w-full h-[230px]">
        <div className="p-0 h-full">
          <Link href={`/influencers/${influencer.id}`}>
            <div className="relative h-full flex flex-col">
              <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
                <img
                  src={influencer.image || influencer.avatar || "/placeholder.svg"}
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
                    <span className="truncate">{influencer.location || influencer.region}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs leading-tight">
                    <span className="flex items-center gap-2 text-black font-semibold">
                      <Users className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{influencer.followersDisplay || influencer.followers}</span>
                    </span>
                    <span className="flex items-center gap-2 text-black font-semibold">
                      <BarChart3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{influencer.engagementRate || influencer.engagement}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 items-center mt-1 mb-1">
                  {displayHashtags.map((tag: string, index: number) => (
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

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    return (
      <Link href={`/campaigns/${campaign.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-40">
            <img
              src={campaign.thumbnail || "/placeholder.svg"}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white rounded-full"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCampaignFavorite(campaign.id)
              }}
            >
              <Heart
                className={`w-4 h-4 ${
                  campaignFavoriteIds.includes(campaign.id)
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 fill-gray-600"
                }`}
              />
            </Button>
            <div className="absolute bottom-2 left-2">
              <span className="bg-white/90 text-[#7b68ee] font-semibold text-xs rounded-full px-2 py-1">
                {campaign.category}
              </span>
            </div>
          </div>

          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{campaign.title}</h3>

            {campaign.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{campaign.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#7b68ee]">{campaign.reward}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (isInfluencerMode) {
    // Influencer mode: Show campaigns
    return (
      <div className="min-h-screen bg-white pb-20">
        <TopHeader
          title="최근 기록"
          showBack={true}
          showSearch={false}
          showNotifications={false}
          showHeart={false}
          customAction={
            <button onClick={clearCampaignHistory} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Trash2
                className="stroke-black fill-none"
                style={{
                  width: "var(--gnb-icon-size)",
                  height: "var(--gnb-icon-size)",
                  minWidth: "var(--gnb-icon-size)",
                  minHeight: "var(--gnb-icon-size)",
                  strokeWidth: "var(--gnb-icon-stroke)",
                }}
              />
            </button>
          }
        />

        <main className="px-4 py-6">
          {recentCampaigns.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">최근 본 캠페인 {recentCampaigns.length}개</p>
              </div>

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
                {recentCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">최근 본 캠페인이 없습니다</h3>
              <p className="text-sm text-gray-500 mb-6">캠페인을 찾아보세요</p>
              <Link href="/campaigns">
                <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white px-6 py-2 rounded-full">
                  캠페인 찾기
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Advertiser mode: Show influencers (original behavior)
  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader
        title="최근 기록"
        showBack={true}
        showSearch={false}
        showNotifications={false}
        showHeart={false}
        customAction={
          <button onClick={clearHistory} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Trash2
              className="stroke-black fill-none"
              style={{
                width: "var(--gnb-icon-size)",
                height: "var(--gnb-icon-size)",
                minWidth: "var(--gnb-icon-size)",
                minHeight: "var(--gnb-icon-size)",
                strokeWidth: "var(--gnb-icon-stroke)",
              }}
            />
          </button>
        }
      />

      <main className="px-4 py-6">
        {recentProfiles.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">최근 본 인플루언서 {recentProfiles.length}명</p>
            </div>

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
              {recentProfiles.map((profile) => (
                <ProfileCard key={profile.id} influencer={profile} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">최근 본 인플루언서가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-6">파트너를 찾아보세요</p>
            <Link href="/influencers">
              <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white px-6 py-2 rounded-full">
                파트너 찾기
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
