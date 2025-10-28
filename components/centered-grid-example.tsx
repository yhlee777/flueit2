"use client"

import { CenteredGridContainer, CenteredGridItem } from "./centered-grid-container"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

/**
 * 파트너 프로필 카드 예시
 * CenteredGridContainer 사용법 데모
 */
export function CenteredGridExample() {
  // 예시 인플루언서 데이터
  const influencers = [
    {
      id: 1,
      name: "김지수",
      category: "뷰티",
      followers: "12.5만",
      image: "/korean-beauty-influencer.jpg",
      tags: ["스킨케어", "메이크업"],
    },
    {
      id: 2,
      name: "박민준",
      category: "패션",
      followers: "8.3만",
      image: "/korean-fashion-influencer.jpg",
      tags: ["스트릿", "캐주얼"],
    },
    {
      id: 3,
      name: "이서연",
      category: "라이프스타일",
      followers: "15.2만",
      image: "/korean-lifestyle-influencer.jpg",
      tags: ["일상", "브이로그"],
    },
    {
      id: 4,
      name: "최현우",
      category: "피트니스",
      followers: "9.7만",
      image: "/korean-fitness-influencer.jpg",
      tags: ["운동", "건강"],
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold px-4">파트너 프로필</h2>

      {/* 기본 사용 (gap 16px) */}
      <CenteredGridContainer>
        {influencers.map((influencer) => (
          <Card key={influencer.id} className="overflow-hidden">
            <div className="relative aspect-[3/4]">
              <img
                src={influencer.image || "/placeholder.svg"}
                alt={influencer.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={influencer.image || "/placeholder.svg"} />
                  <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{influencer.name}</p>
                  <p className="text-xs text-gray-500">{influencer.followers} 팔로워</p>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {influencer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </CenteredGridContainer>

      {/* 커스텀 gap 사용 (gap 12px) */}
      <div className="space-y-3">
        <h3 className="text-base font-medium px-4">좁은 간격 예시</h3>
        <CenteredGridContainer gap={12}>
          {influencers.slice(0, 2).map((influencer) => (
            <Card key={influencer.id} className="p-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={influencer.image || "/placeholder.svg"} />
                  <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{influencer.name}</p>
                  <p className="text-xs text-gray-500">{influencer.category}</p>
                </div>
              </div>
            </Card>
          ))}
        </CenteredGridContainer>
      </div>

      {/* CenteredGridItem 사용 예시 */}
      <div className="space-y-3">
        <h3 className="text-base font-medium px-4">GridItem 래퍼 사용</h3>
        <CenteredGridContainer gap={20}>
          {influencers.slice(0, 2).map((influencer) => (
            <CenteredGridItem key={influencer.id} className="bg-gray-50 rounded-lg">
              <Card className="border-0">
                <div className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarImage src={influencer.image || "/placeholder.svg"} />
                    <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{influencer.name}</p>
                  <p className="text-sm text-gray-500">{influencer.followers}</p>
                </div>
              </Card>
            </CenteredGridItem>
          ))}
        </CenteredGridContainer>
      </div>
    </div>
  )
}
