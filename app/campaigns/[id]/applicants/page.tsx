"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Users, TrendingUp, MapPin, Eye, Check, X, ChevronLeft } from "lucide-react"

interface Application {
  id: string
  campaign_id: string
  influencer_id: string
  status: string
  message: string
  created_at: string
  updated_at: string
  influencer: {
    id: string
    username: string
    email: string
    profile_image: string | null
  }
}

interface Campaign {
  id: string
  title: string
  category: string
  recruit_count: number
  applicants: number
  confirmed_applicants: number
  payment_amount: string | null
  user_id: string
}

export default function CampaignApplicantsPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ✅ 캠페인 및 신청자 목록 로드
  useEffect(() => {
    if (!campaignId || !session) return

    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("🔍 신청자 관리 페이지 - 데이터 로드:", campaignId)

        // 1. 캠페인 정보 조회
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`)
        const campaignData = await campaignResponse.json()

        if (!campaignResponse.ok) {
          console.error("❌ 캠페인 조회 오류:", campaignData)
          alert(campaignData.error || "캠페인을 불러오는데 실패했습니다.")
          router.push("/campaigns")
          return
        }

        // 권한 확인 - 본인의 캠페인만 접근 가능
        if (campaignData.campaign.user_id !== session.user.id) {
          alert("접근 권한이 없습니다.")
          router.push(`/campaigns/${campaignId}`)
          return
        }

        setCampaign(campaignData.campaign)

        // 2. 신청자 목록 조회
        const applicationsResponse = await fetch(`/api/campaigns/${campaignId}/applications`)
        const applicationsData = await applicationsResponse.json()

        if (!applicationsResponse.ok) {
          console.error("❌ 신청자 조회 오류:", applicationsData)
          alert(applicationsData.error || "신청자 목록을 불러오는데 실패했습니다.")
          return
        }

        console.log("✅ 신청자 데이터:", applicationsData.applications)
        setApplications(applicationsData.applications || [])
      } catch (error) {
        console.error("❌ 데이터 로드 오류:", error)
        alert("데이터를 불러오는데 실패했습니다.")
        router.push("/campaigns")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [campaignId, session, router])

  // ✅ 신청 상태 변경
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    if (!confirm(`정말 ${newStatus === "승인" ? "승인" : "거절"}하시겠습니까?`)) {
      return
    }

    try {
      setUpdatingId(applicationId)
      console.log("🔍 신청 상태 변경:", { applicationId, newStatus })

      const response = await fetch(`/api/campaigns/${campaignId}/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ 상태 변경 실패:", data)
        alert(data.error || "상태 변경에 실패했습니다.")
        return
      }

      console.log("✅ 상태 변경 성공:", data)
      alert(`${newStatus === "승인" ? "승인" : "거절"}되었습니다.`)

      // 목록 새로고침
      window.location.reload()
    } catch (error) {
      console.error("❌ 상태 변경 오류:", error)
      alert("상태 변경 중 오류가 발생했습니다.")
    } finally {
      setUpdatingId(null)
    }
  }

  // 프로필 보기
  const handleViewProfile = (influencerId: string) => {
    router.push(`/profile/${influencerId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "승인":
      case "협업 확정":
        return "bg-green-500"
      case "거절":
        return "bg-red-500"
      case "검토 중":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    return status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">캠페인을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/campaigns")}>목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  const pendingApplicants = applications.filter((a) => a.status === "검토 중")
  const selectedApplicants = applications.filter((a) => a.status === "승인" || a.status === "협업 확정")
  const rejectedApplicants = applications.filter((a) => a.status === "거절")

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" className="flex items-center h-9 px-1" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
            <span className="text-base text-gray-600">지원자 관리</span>
          </Button>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4">
        {/* Campaign Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-2">{campaign.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {campaign.payment_amount && <span>예산: {campaign.payment_amount}만원</span>}
              <Badge variant="outline">{campaign.category}</Badge>
              <span>
                총 {applications.length}명 지원 / 모집 {campaign.recruit_count}명
              </span>
            </div>
            {campaign.confirmed_applicants > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✅ 확정된 인원: {campaign.confirmed_applicants}명
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applicants Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">검토중 ({pendingApplicants.length})</TabsTrigger>
            <TabsTrigger value="selected">승인 ({selectedApplicants.length})</TabsTrigger>
            <TabsTrigger value="rejected">거절 ({rejectedApplicants.length})</TabsTrigger>
          </TabsList>

          {/* 검토 중 탭 */}
          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingApplicants.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={applicant.influencer.profile_image || "/placeholder.svg"}
                        alt={applicant.influencer.username}
                      />
                      <AvatarFallback>{applicant.influencer.username[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{applicant.influencer.username}</h3>
                        <Badge className={getStatusColor(applicant.status)} variant="secondary">
                          {getStatusText(applicant.status)}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">{applicant.influencer.email}</div>

                      {applicant.message && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-3 bg-gray-50 p-3 rounded-lg">
                          {applicant.message}
                        </p>
                      )}

                      <div className="text-xs text-gray-500 mb-3">
                        지원일: {new Date(applicant.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewProfile(applicant.influencer_id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      프로필 보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleStatusChange(applicant.id, "승인")}
                      disabled={updatingId === applicant.id}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      승인
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(applicant.id, "거절")}
                      disabled={updatingId === applicant.id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      거절
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingApplicants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">검토 중인 지원자가 없습니다.</p>
                <p className="text-sm text-gray-400">지원자가 있으면 여기에 표시됩니다.</p>
              </div>
            )}
          </TabsContent>

          {/* 승인 탭 */}
          <TabsContent value="selected" className="space-y-3 mt-4">
            {selectedApplicants.map((applicant) => (
              <Card key={applicant.id} className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={applicant.influencer.profile_image || "/placeholder.svg"}
                        alt={applicant.influencer.username}
                      />
                      <AvatarFallback>{applicant.influencer.username[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{applicant.influencer.username}</h3>
                        <Badge className={getStatusColor(applicant.status)}>{getStatusText(applicant.status)}</Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">{applicant.influencer.email}</div>

                      <div className="text-xs text-gray-500 mb-3">
                        승인일: {new Date(applicant.updated_at).toLocaleDateString("ko-KR")}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(applicant.influencer_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          프로필 보기
                        </Button>
                        {applicant.status === "승인" && (
                          <Button
                            size="sm"
                            className="bg-[#7b68ee] hover:bg-[#7b68ee]/90"
                            onClick={() => handleStatusChange(applicant.id, "협업 확정")}
                            disabled={updatingId === applicant.id}
                          >
                            협업 확정
                          </Button>
                        )}
                        {applicant.status === "협업 확정" && (
                          <Badge className="bg-green-600 text-white">✅ 협업 확정 완료</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedApplicants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">승인된 인플루언서가 없습니다.</p>
                <p className="text-sm text-gray-400">검토 중인 지원자를 승인해보세요.</p>
              </div>
            )}
          </TabsContent>

          {/* 거절 탭 */}
          <TabsContent value="rejected" className="space-y-3 mt-4">
            {rejectedApplicants.map((applicant) => (
              <Card key={applicant.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={applicant.influencer.profile_image || "/placeholder.svg"}
                        alt={applicant.influencer.username}
                      />
                      <AvatarFallback>{applicant.influencer.username[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{applicant.influencer.username}</h3>
                        <Badge className={getStatusColor(applicant.status)}>{getStatusText(applicant.status)}</Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">{applicant.influencer.email}</div>

                      <div className="text-xs text-gray-500">
                        거절일: {new Date(applicant.updated_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rejectedApplicants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">거절된 지원자가 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}