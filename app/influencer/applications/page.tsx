"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, MessageCircle, MoreVertical, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"

const userData = {
  name: "밍밍 부인",
  avatar: "/korean-business-person.jpg",
}

// Mock application data
const applications = [
  {
    id: 1,
    status: "지원 완료",
    statusDate: "12.15",
    campaignStatus: "구인 진행중",
    campaignTitle: "강남 카페 신메뉴 릴스 캠페인",
    advertiser: "잇다커피",
    appliedTime: "2개월 전 지원",
    thumbnail: "/skincare-products-display.png",
  },
  {
    id: 2,
    status: "승인됨",
    statusDate: "12.10",
    campaignStatus: "구인 진행중",
    campaignTitle: "뷰티 제품 리뷰 캠페인",
    advertiser: "뷰티브랜드",
    appliedTime: "3개월 전 지원",
    thumbnail: "/makeup-tutorial.png",
  },
  {
    id: 3,
    status: "지원 대기",
    statusDate: "12.08",
    campaignStatus: "구인 마감",
    campaignTitle: "패션 브랜드 협찬 캠페인",
    advertiser: "패션하우스",
    appliedTime: "3개월 전 지원",
    thumbnail: "/korean-fashion-influencer.jpg",
  },
  {
    id: 4,
    status: "반려됨",
    statusDate: "12.01",
    campaignStatus: "다음에",
    campaignTitle: "맛집 탐방 콘텐츠 제작",
    advertiser: "푸드컴퍼니",
    appliedTime: "4개월 전 지원",
    thumbnail: "/korean-food-influencer.jpg",
  },
]

export default function ApplicationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"applications" | "interests">("applications")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCampaignFilterOpen, setIsCampaignFilterOpen] = useState(false)

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case "구인 진행중":
        return "bg-[#51a66f] text-white"
      case "구인 마감":
        return "bg-gray-500 text-white"
      case "다음에":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="text-base font-semibold text-gray-900">캠페인 지원 내역</h1>

          <Link href="/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
              <AvatarFallback className="text-sm">{userData.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "applications" ? "text-gray-900 font-semibold" : "text-gray-500"
            }`}
          >
            지원
            {activeTab === "applications" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
          </button>
          <button
            onClick={() => setActiveTab("interests")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "interests" ? "text-gray-900 font-semibold" : "text-gray-500"
            }`}
          >
            관심
            {activeTab === "interests" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-sm whitespace-nowrap relative bg-transparent"
          >
            후기 남기기
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-sm whitespace-nowrap bg-transparent"
            onClick={() => setIsFilterOpen(true)}
          >
            지원 상태 <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-sm whitespace-nowrap bg-transparent"
            onClick={() => setIsCampaignFilterOpen(true)}
          >
            캠페인 상태 <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 text-sm whitespace-nowrap bg-transparent"
          >
            관심
          </Button>
        </div>

        <div className="space-y-3">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              {/* Status line */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">{application.status}</span>
                <span className="text-xs text-gray-400">{application.statusDate} 확인</span>
              </div>

              {/* Campaign info */}
              <div className="mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <Badge
                    className={`text-xs px-2 py-1 rounded-full ${getCampaignStatusBadge(application.campaignStatus)}`}
                  >
                    {application.campaignStatus}
                  </Badge>
                  <h3 className="font-semibold text-sm text-gray-900 flex-1">{application.campaignTitle}</h3>
                </div>

                <p className="text-xs text-gray-500">
                  {application.advertiser} · {application.appliedTime}
                </p>
              </div>

              {/* View application link */}
              <Link href={`/influencer/applications/${application.id}`}>
                <div className="text-sm text-[#7b68ee] font-medium mb-3 flex items-center">
                  {" "}
                  {/* Updated brand color */}
                  지원서 보기 <span className="ml-1">›</span>
                </div>
              </Link>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm h-9 border-gray-300 rounded-lg bg-transparent"
                >
                  지원 취소
                </Button>
                <Button size="sm" className="flex-1 text-sm h-9 bg-[#7b68ee] hover:bg-[#7b68ee]/90 rounded-lg">
                  {" "}
                  {/* Updated brand color */}
                  <MessageCircle className="w-4 h-4 mr-1" />
                  채팅 하기
                </Button>
                <Button variant="outline" size="sm" className="w-9 h-9 border-gray-300 rounded-lg p-0 bg-transparent">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Application Status Filter Drawer */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">지원 상태</h3>
            {["전체", "지원 완료", "지원 대기", "승인됨", "반려됨"].map((status) => (
              <button
                key={status}
                className="w-full px-4 py-3 rounded-xl text-sm border transition-colors text-left bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              >
                {status}
              </button>
            ))}
          </div>
          <DrawerFooter className="pt-3 pb-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-transparent h-12">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Campaign Status Filter Drawer */}
      <Drawer open={isCampaignFilterOpen} onOpenChange={setIsCampaignFilterOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">캠페인 상태</h3>
            {["전체", "구인 진행중", "구인 마감", "다음에"].map((status) => (
              <button
                key={status}
                className="w-full px-4 py-3 rounded-xl text-sm border transition-colors text-left bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              >
                {status}
              </button>
            ))}
          </div>
          <DrawerFooter className="pt-3 pb-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-transparent h-12">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
