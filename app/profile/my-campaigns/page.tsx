"use client"

import { TopHeader } from "@/components/top-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { useCampaigns } from "@/lib/campaign-store"
import { checkAdvertiserProfileComplete } from "@/lib/profile-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, Eye, FileText } from "lucide-react"
import { useState, useEffect } from "react"

const statusOptions = [
  { value: "구인 진행 중", label: "구인 진행 중", color: "bg-[#7b68ee] text-white" },
  { value: "구인 마감", label: "구인 마감", color: "bg-gray-500 text-white" },
  { value: "비공개 글", label: "비공개 글", color: "bg-gray-400 text-white" },
]

export default function MyCampaignsPage() {
  const router = useRouter()
  const { getUserCreatedCampaigns, updateCampaignStatus, deleteCampaign, updateApplicantStatus } = useCampaigns()
  const userCampaigns = getUserCreatedCampaigns()
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)
  const [tempStatus, setTempStatus] = useState("")

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    if (!influencerMode) {
      setIsProfileComplete(checkAdvertiserProfileComplete())
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "구인 진행 중":
        return "bg-[#7b68ee] text-white"
      case "구인 마감":
        return "bg-gray-500 text-white"
      case "비공개 글":
        return "bg-gray-400 text-white"
      default:
        return "bg-[#7b68ee] text-white"
    }
  }

  const getApplicantStatusColor = (status: string) => {
    switch (status) {
      case "협업 확정":
        return "bg-[#7b68ee] text-white"
      case "컨택중":
        return "bg-blue-500 text-white"
      case "다음 기회에":
        return "bg-gray-400 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleStatusChange = (campaignId: number, currentStatus: string) => {
    setSelectedCampaignId(campaignId)
    setTempStatus(currentStatus)
    setIsStatusModalOpen(true)
  }

  const handleStatusApply = () => {
    if (selectedCampaignId && tempStatus) {
      updateCampaignStatus(selectedCampaignId, tempStatus as "구인 진행 중" | "구인 마감" | "비공개 글")
    }
    setIsStatusModalOpen(false)
    setSelectedCampaignId(null)
    setTempStatus("")
  }

  const handleDelete = (campaignId: number) => {
    if (confirm("정말 이 캠페인을 삭제하시겠습니까?")) {
      deleteCampaign(campaignId)
    }
  }

  const handleApplicantStatusChange = (campaignId: number, applicantId: number, currentStatus: string) => {
    const statuses: Array<"컨택중" | "다음 기회에" | "협업 확정"> = ["컨택중", "다음 기회에", "협업 확정"]
    const currentIndex = statuses.indexOf(currentStatus as any)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    updateApplicantStatus(campaignId, applicantId, nextStatus)
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader title="내 캠페인" showBack={true} showSearch={false} showNotifications={false} showHeart={false} />

      <main className="px-4 py-6">
        {userCampaigns.length > 0 ? (
          <div className="space-y-0">
            {userCampaigns.map((campaign, index) => (
              <div key={campaign.id}>
                <div className="py-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        src={campaign.thumbnail || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.createdAt
                            ? new Date(campaign.createdAt).toLocaleDateString("ko-KR", {
                                year: "2-digit",
                                month: "long",
                                day: "numeric",
                              })
                            : campaign.timeAgo}{" "}
                          게시
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status || "구인 진행 중")}`}
                        >
                          {campaign.status || "구인 진행 중"}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-full border-gray-300">
                          {campaign.category}
                        </Badge>
                        {campaign.confirmedApplicants &&
                          campaign.recruitCount &&
                          campaign.confirmedApplicants / campaign.recruitCount >= 0.7 && (
                            <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-1 rounded font-medium">
                              마감 임박
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{campaign.applicants || 0}명 지원</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{campaign.viewedApplicants || 0}명 조회</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 bg-transparent"
                      onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                    >
                      내용 수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 bg-transparent"
                      onClick={() => handleStatusChange(campaign.id, campaign.status || "구인 진행 중")}
                    >
                      상태 변경
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      삭제하기
                    </Button>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">지원자 목록</h4>
                    {campaign.applicantList && campaign.applicantList.length > 0 ? (
                      <div className="space-y-0">
                        {campaign.applicantList.map((applicant, applicantIndex) => (
                          <div key={applicant.id}>
                            <div className="py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                                  <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-900">{applicant.name}</span>
                              </div>
                              <Badge
                                className={`text-xs px-3 py-1 rounded-full cursor-pointer ${getApplicantStatusColor(applicant.status)}`}
                                onClick={() => handleApplicantStatusChange(campaign.id, applicant.id, applicant.status)}
                              >
                                {applicant.status}
                              </Badge>
                            </div>
                            {applicantIndex < campaign.applicantList!.length - 1 && (
                              <div className="border-b border-gray-100" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-gray-400">지원자가 아직 없어요.</p>
                      </div>
                    )}
                  </div>
                </div>

                {index < userCampaigns.length - 1 && <div className="border-b border-gray-200" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <FileText className="w-16 h-16 text-gray-300" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-600">작성한 캠페인이 없습니다</h3>
              <p className="text-sm text-gray-500">캠페인을 작성하고 파트너를 찾아보세요!</p>
            </div>
            {isProfileComplete ? (
              <Link href="/campaigns/create">
                <Button className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white px-6 py-2 rounded-full">
                  캠페인 만들기
                </Button>
              </Link>
            ) : (
              <Button disabled className="bg-[#7b68ee]/30 text-white px-6 py-2 rounded-full cursor-not-allowed">
                캠페인 만들기
              </Button>
            )}
          </div>
        )}
      </main>

      <Drawer open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-2 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">상태 변경</h3>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempStatus(option.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border transition-colors text-left ${
                      tempStatus === option.value
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-3 pb-6">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-[3] bg-transparent h-12">
                  취소
                </Button>
              </DrawerClose>
              <Button onClick={handleStatusApply} className="flex-[7] bg-[#7b68ee] hover:bg-[#7b68ee]/90 h-12">
                적용
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
