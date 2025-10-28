"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, MapPin, Users, BarChart3, Heart } from "lucide-react"
import Link from "next/link"

interface ProfileCardProps {
  influencer: {
    id?: number
    name: string
    avatar?: string
    verified?: boolean
    category: string
    region: string
    followers?: string
    followersDisplay?: string
    engagement?: string
    engagementRate?: string
    hashtags?: string[]
    trustScore?: number
  }
  showFavoriteButton?: boolean
  onFavoriteClick?: () => void
  isFavorite?: boolean
}

export default function ProfileCard({
  influencer,
  showFavoriteButton = false,
  onFavoriteClick,
  isFavorite = false,
}: ProfileCardProps) {
  const displayHashtags = influencer.hashtags?.slice(0, 2) || []
  const remainingCount = (influencer.hashtags?.length || 0) - 2
  const followersDisplay = influencer.followersDisplay || influencer.followers || "0"
  const engagementDisplay = influencer.engagementRate || influencer.engagement || "0%"

  const CardWrapper = influencer.id ? Link : "div"
  const cardProps = influencer.id ? { href: `/influencers/${influencer.id}` } : {}

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-sm p-0 min-w-[160px] w-[160px] h-[230px] cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
      <CardContent className="p-0 h-full">
        <CardWrapper {...cardProps} className="block h-full">
          <div className="relative h-full flex flex-col">
            <div className="w-full h-32 bg-white relative overflow-hidden rounded-t-2xl">
              <img
                src={influencer.avatar || "/placeholder.svg"}
                alt={influencer.name}
                className="w-full h-full object-cover rounded-bl-lg rounded-br-lg"
              />
              {showFavoriteButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onFavoriteClick?.()
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-600 fill-gray-600"}`}
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
                    <span className="text-sm">{followersDisplay}</span>
                  </span>
                  <span className="flex items-center gap-2 text-black font-semibold">
                    <BarChart3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span className="text-sm">{engagementDisplay}</span>
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
        </CardWrapper>
      </CardContent>
    </Card>
  )
}
