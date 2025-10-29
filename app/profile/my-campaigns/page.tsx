"use client"

import { TopHeader } from "@/components/top-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { checkAdvertiserProfileComplete } from "@/lib/profile-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, Eye, FileText, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const statusOptions = [
  { value: "구인 진행 중", label: "구인 진행 중", color: "bg-[#7b68ee] text-white" },
  { value: "구인 마감", label: "구인 마감", color: "bg-gray-500 text-white" },
  { value: "비공개 글", label: "비공개 글", color: "bg-gray-400 text-white" },
]

interface Campaign {
  id: string
  title: string
  category: string
  status: string
  applicants: number
  confirmed_applicants: number
  views: number
  created_at: string
}

export default function MyCampaignsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([])
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [tempStatus, setTempStatus] = useState("")

  // ✅ 캠페인 목록 로드
  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    if (!influencerMode) {
      setIsProfileComplete(checkAdvertiserProfileComplete())
    }

    if (session?.user?.id) {
      fetchUserCampaigns()
    }
  }, [session])

  const fetchUserCampaigns = async () => {
    try {
      setLoading(true)
      console.log("🔍 내 캠페인 목록 로드 중...")

      const response = await fetch(`/api/campaigns?user_id=${session?.user?.id}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 캠페인 조회 오류:", data)
        return
      }

      console.log("✅ 내 캠페인 목록:", data.campaigns)
      setUserCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("❌ 캠페인 목록 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleStatusChange = (campaignId: string, currentStatus: string) => {
    setSelectedCampaignId(campaignId)
    setTempStatus(currentStatus)
    setIsStatusModalOpen(true)
  }

  // ✅ DB에 상태 변경 요청
  const handleStatusApply = async () => {
    if (!selectedCampaignId || !tempStatus) return

    try {
      setUpdatingId(selectedCampaignId)
      console.log(`🔄 캠페인 ${selectedCampaignId} 상태 변경 시도: ${tempStatus}`)

      const response = await fetch(`/api/campaigns/${selectedCampaignId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: tempStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 상태 변경 오류:", data)
        alert(data.error || "상태 변경에 실패했습니다.")
        return
      }

      console.log("✅ 상태 변경 성공:", data)
      alert("캠페인 상태가 변경되었습니다.")

      // 목록 새로고침
      await fetchUserCampaigns()
    } catch (error) {
      console.error("❌ 상태 변경 오류:", error)
      alert("상태 변경 중 오류가 발생했습니다.")
    } finally {
      setUpdatingId(null)
      setIsStatusModalOpen(false)
      setSelectedCampaignId(null)
      setTempStatus("")
    }
  }

  // ✅ DB에서 캠페인 삭제
  const handleDelete = async (campaignId: string) => {
    if (!confirm("정말 이 캠페인을 삭제하시겠습니까?")) return

    try {
      console.log(`🗑️ 캠페인 ${campaignId} 삭제 시도`)

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 삭제 오류:", data)
        alert(data.error || "캠페인 삭제에 실패했습니다.")
        return
      }

      console.log("✅ 캠페인 삭제 성공")
      alert("캠페인이 삭제되었습니다.")

      // 목록 새로고침
      await fetchUserCampaigns()
    } catch (error) {
      console.error("❌ 삭제 오류:", error)
      alert("캠페인 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleCreateClick = () => {
    if (!isProfileComplete) {
      alert("캠페인을 작성하려면 프로필을 100% 완성해주세요.")
      router.push("/profile/edit")
      return
    }
    router.push("/campaigns/create")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopHeader title="내 캠페인" showBack={true} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7b68ee]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <TopHeader title="내 캠페인" showBack={true} />

      <main className="px-4 py-4">
        {userCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">아직 작성한 캠페인이 없습니다.</p>
            <Button onClick={handleCreateClick} className="bg-[#7b68ee] hover:bg-[#6a5acd]">
              첫 캠페인 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {userCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-500">{campaign.category}</p>
                  </Link>
                  <button
                    onClick={() => handleStatusChange(campaign.id, campaign.status)}
                    disabled={updatingId === campaign.id}
                    className={`${getStatusColor(campaign.status)} px-3 py-1 rounded-full text-xs font-medium shrink-0 ml-2 disabled:opacity-50`}
                  >
                    {updatingId === campaign.id ? "변경 중..." : campaign.status}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {campaign.applicants || 0}명 신청 / {campaign.confirmed_applicants || 0}명 확정
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{campaign.views || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/campaigns/${campaign.id}/applicants`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      지원자 보기
                    </Button>
                  </Link>
                  <Link href={`/campaigns/${campaign.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-20"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 상태 변경 Drawer */}
      <Drawer open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DrawerContent className="rounded-t-3xl [&>div:first-child]:hidden">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-4 pt-2 pb-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">캠페인 상태 변경</h3>
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
          <DrawerFooter className="pt-3 pb-6 gap-2">
            <Button onClick={handleStatusApply} className="w-full bg-[#7b68ee] hover:bg-[#6a5acd] h-12">
              변경하기
            </Button>
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