import { TopHeader } from "@/components/top-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Users, TrendingUp, MapPin, Eye, Check, X } from "lucide-react"

// Mock data - in real app this would come from API
const campaignData = {
  id: 1,
  title: "뷰티 브랜드 신제품 리뷰",
  budget: "500만원",
  category: "뷰티",
}

const applicants = [
  {
    id: 1,
    name: "김뷰티",
    followers: "125K",
    engagement: 4.2,
    category: "뷰티",
    region: "서울",
    price: "50만원",
    avatar: "/korean-beauty-influencer.jpg",
    verified: true,
    trustScore: 4.8,
    appliedAt: "2024-01-02",
    status: "pending",
    message:
      "안녕하세요! 뷰티 제품 리뷰에 관심이 많아 지원하게 되었습니다. 5년간의 경험을 바탕으로 정직하고 신뢰할 수 있는 리뷰를 제공하겠습니다.",
  },
  {
    id: 2,
    name: "박뷰티",
    followers: "89K",
    engagement: 5.1,
    category: "뷰티",
    region: "부산",
    price: "35만원",
    avatar: "/korean-beauty-influencer-2.jpg",
    verified: true,
    trustScore: 4.6,
    appliedAt: "2024-01-03",
    status: "selected",
    message:
      "뷰티 브랜드와의 협업 경험이 풍부합니다. 특히 스킨케어 제품 리뷰를 전문으로 하고 있어 이번 캠페인에 적합하다고 생각합니다.",
  },
  {
    id: 3,
    name: "이뷰티",
    followers: "203K",
    engagement: 3.8,
    category: "뷰티",
    region: "서울",
    price: "80만원",
    avatar: "/korean-beauty-influencer-3.jpg",
    verified: false,
    trustScore: 4.3,
    appliedAt: "2024-01-04",
    status: "rejected",
    message: "대형 뷰티 브랜드들과 다수의 협업 경험이 있습니다. 전문적인 리뷰와 높은 퀄리티의 콘텐츠를 보장합니다.",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "selected":
      return "bg-green-500"
    case "rejected":
      return "bg-red-500"
    case "pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "selected":
      return "선정"
    case "rejected":
      return "거절"
    case "pending":
      return "검토중"
    default:
      return "알 수 없음"
  }
}

export default function CampaignApplicantsPage({ params }: { params: { id: string } }) {
  const pendingApplicants = applicants.filter((a) => a.status === "pending")
  const selectedApplicants = applicants.filter((a) => a.status === "selected")
  const rejectedApplicants = applicants.filter((a) => a.status === "rejected")

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader title="지원자 관리" showSearch={false} showNotifications={false} showBack={true} showHeart={false} />

      <main className="px-4 py-4 space-y-4">
        {/* Campaign Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-foreground mb-2">{campaignData.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>예산: {campaignData.budget}</span>
              <Badge variant="outline">{campaignData.category}</Badge>
              <span>총 {applicants.length}명 지원</span>
            </div>
          </CardContent>
        </Card>

        {/* Applicants Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">검토중 ({pendingApplicants.length})</TabsTrigger>
            <TabsTrigger value="selected">선정 ({selectedApplicants.length})</TabsTrigger>
            <TabsTrigger value="rejected">거절 ({rejectedApplicants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingApplicants.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                      <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{applicant.name}</h3>
                        {applicant.verified && (
                          <Badge variant="default" className="text-xs bg-[#7b68ee]">
                            인증
                          </Badge>
                        )}
                        <Badge className={getStatusColor(applicant.status)} variant="secondary">
                          {getStatusText(applicant.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{applicant.followers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{applicant.engagement}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{applicant.region}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{applicant.trustScore}</span>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-primary mb-2">협업비: {applicant.price}</div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{applicant.message}</p>

                      <div className="text-xs text-muted-foreground mb-3">지원일: {applicant.appliedAt}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      프로필 보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      선정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      거절
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingApplicants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">검토 중인 지원자가 없습니다.</div>
            )}
          </TabsContent>

          <TabsContent value="selected" className="space-y-3 mt-4">
            {selectedApplicants.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                      <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{applicant.name}</h3>
                        {applicant.verified && (
                          <Badge variant="default" className="text-xs bg-[#7b68ee]">
                            인증
                          </Badge>
                        )}
                        <Badge className={getStatusColor(applicant.status)}>{getStatusText(applicant.status)}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>협업비: {applicant.price}</span>
                        <span>선정일: {applicant.appliedAt}</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          프로필 보기
                        </Button>
                        <Button size="sm">협업 진행</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedApplicants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">선정된 인플루언서가 없습니다.</div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-3 mt-4">
            {rejectedApplicants.map((applicant) => (
              <Card key={applicant.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                      <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{applicant.name}</h3>
                        {applicant.verified && (
                          <Badge variant="default" className="text-xs bg-[#7b68ee]">
                            인증
                          </Badge>
                        )}
                        <Badge className={getStatusColor(applicant.status)}>{getStatusText(applicant.status)}</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">거절일: {applicant.appliedAt}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rejectedApplicants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">거절된 지원자가 없습니다.</div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  )
}
