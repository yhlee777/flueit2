"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Applicant {
  id: number
  name: string
  avatar: string
  status: "컨택중" | "다음 기회에" | "협업 확정"
  followers?: string
  engagement?: number
  appliedAt?: string
}

export interface Campaign {
  id: number
  title: string
  location: string
  timeAgo: string
  reward: string
  thumbnail: string
  comments: number
  likes: number
  category: string
  company?: string
  applicants?: number
  views?: number
  viewedApplicants?: number
  confirmedApplicants?: number
  images?: string[]
  tags?: string[]
  description?: string
  requirements?: string[]
  priceOption?: "has-price" | "no-price"
  collaborationFee?: string
  negotiationOption?: "yes" | "no"
  campaignDetails?: string
  attachedFiles?: File[]
  createdAt?: string
  status?: "구인 진행 중" | "구인 마감" | "비공개 글"
  isUserCreated?: boolean
  recruitCount?: string
  rewardType?: "payment" | "product" | "other"
  contentType?: string
  videoDuration?: string
  requiredContent?: string
  requiredScenes?: string
  hashtags?: string[]
  linkUrl?: string
  additionalMemo?: string
  uploadedPhotos?: string[]
  visitType?: "visit" | "non-visit"
  applicantList?: Applicant[]
}

interface CampaignContextType {
  campaigns: Campaign[]
  addCampaign: (campaign: Omit<Campaign, "id" | "timeAgo" | "comments" | "likes" | "views">) => void
  getCampaignById: (id: number) => Campaign | undefined
  updateCampaignStatus: (id: number, status: "구인 진행 중" | "구인 마감" | "비공개 글") => void
  getUserCreatedCampaigns: () => Campaign[]
  updateCampaign: (id: number, updates: Partial<Campaign>) => void
  deleteCampaign: (id: number) => void
  updateApplicantStatus: (
    campaignId: number,
    applicantId: number,
    status: "컨택중" | "다음 기회에" | "협업 확정",
  ) => void
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

// Initial campaigns data
const initialCampaigns: Campaign[] = [
  {
    id: 1,
    title: "수분크림 체험단 모집합니다.",
    location: "서울시 성내동",
    timeAgo: "1시간 전",
    reward: "제품 제공",
    thumbnail: "/skincare-products-display.png",
    comments: 12,
    likes: 24,
    category: "뷰티·화장품",
    company: "뷰티브랜드",
    applicants: 8,
    views: 156,
    viewedApplicants: 3,
    recruitCount: "10",
    confirmedApplicants: 8,
    images: ["/skincare-products-display.png", "/makeup-tutorial.png"],
    tags: ["뷰티", "스킨케어", "체험단"],
    description: "새로운 수분크림 제품의 체험단을 모집합니다. 건성 피부를 위한 특별한 포뮬러로 제작된 제품입니다.",
    requirements: ["건성 피부 소유자", "뷰티 콘텐츠 제작 경험", "서울 지역 거주자"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "product",
    contentType: "릴스+피드",
    videoDuration: "30초 이상",
    requiredContent:
      "제품명, 브랜드명, 사용 후기를 반드시 포함해주세요. 제품의 텍스처와 발림성을 강조해주시면 좋습니다.",
    requiredScenes: "제품 언박싱 장면, 제품을 바르는 장면, 사용 전후 피부 상태 비교, 만족스러운 표정",
    hashtags: ["#뷰티", "#스킨케어", "#수분크림", "#건성피부", "#체험단"],
    linkUrl: "https://example.com/skincare-product",
    additionalMemo: "건성 피부에 특화된 제품이므로, 건성 피부 고민을 가진 분들의 솔직한 후기를 기대합니다.",
    uploadedPhotos: ["/skincare-products-display.png", "/makeup-tutorial.png"],
    visitType: "visit",
    applicantList: [],
  },
  {
    id: 2,
    title: "신상 립스틱 리뷰어 모집",
    location: "서울시 강남구",
    timeAgo: "2시간 전",
    reward: "건당 15만원",
    thumbnail: "/makeup-tutorial.png",
    comments: 8,
    likes: 31,
    category: "뷰티·화장품",
    company: "메이크업브랜드",
    applicants: 12,
    views: 243,
    viewedApplicants: 5,
    recruitCount: "15",
    confirmedApplicants: 11,
    images: ["/makeup-tutorial.png", "/skincare-products-display.png"],
    tags: ["뷰티", "립스틱", "리뷰"],
    description: "신상 립스틱 제품의 리뷰어를 모집합니다. 다양한 컬러와 질감을 체험해보실 수 있습니다.",
    requirements: ["메이크업 콘텐츠 제작 경험", "립 제품 리뷰 경험", "SNS 팔로워 1만명 이상"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "payment",
    contentType: "릴스",
    videoDuration: "45초 이상",
    requiredContent: "립스틱 컬러명, 브랜드명, 발색력, 지속력에 대한 솔직한 리뷰를 포함해주세요.",
    requiredScenes:
      "립스틱 스와치 장면, 실제 입술에 발색하는 장면, 다양한 각도에서의 발색 확인, 시간 경과 후 지속력 테스트",
    hashtags: ["#립스틱", "#메이크업", "#뷰티리뷰", "#신상립스틱", "#립메이크업"],
    linkUrl: "https://example.com/lipstick-review",
    additionalMemo: "다양한 컬러를 체험하실 수 있으니, 본인에게 어울리는 컬러를 찾아 솔직한 리뷰 부탁드립니다.",
    uploadedPhotos: ["/makeup-tutorial.png", "/skincare-products-display.png"],
    visitType: "visit",
    applicantList: [],
  },
  {
    id: 3,
    title: "홈카페 원두 체험단 모집",
    location: "서울시 마포구",
    timeAgo: "3시간 전",
    reward: "제품 제공",
    thumbnail: "/pile-of-coffee-beans.png",
    comments: 15,
    likes: 18,
    category: "푸드·외식",
    company: "카페브랜드",
    applicants: 6,
    views: 89,
    viewedApplicants: 2,
    recruitCount: "8",
    confirmedApplicants: 4,
    images: ["/pile-of-coffee-beans.png"],
    tags: ["카페", "원두", "홈카페"],
    description: "프리미엄 원두의 체험단을 모집합니다. 홈카페 콘텐츠 제작에 관심있는 분들을 찾습니다.",
    requirements: ["홈카페 콘텐츠 제작 경험", "커피 관련 지식", "사진 촬영 가능"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "product",
    contentType: "피드",
    videoDuration: "",
    requiredContent: "원두 브랜드명, 원두 종류, 추출 방법, 맛과 향에 대한 상세한 설명을 포함해주세요.",
    requiredScenes: "원두 패키지 촬영, 원두를 갈아서 추출하는 과정, 완성된 커피 한 잔, 홈카페 분위기 연출",
    hashtags: ["#홈카페", "#원두", "#커피", "#카페스타그램", "#커피타임"],
    linkUrl: "https://example.com/coffee-beans",
    additionalMemo: "홈카페 분위기를 잘 살려서 감성적인 콘텐츠를 제작해주시면 감사하겠습니다.",
    uploadedPhotos: ["/pile-of-coffee-beans.png"],
    visitType: "visit",
    applicantList: [],
  },
  {
    id: 4,
    title: "운동복 브랜드 협업 인플루언서",
    location: "서울시 송파구",
    timeAgo: "4시간 전",
    reward: "건당 20만원",
    thumbnail: "/fitness-wear.png",
    comments: 22,
    likes: 45,
    category: "헬스·피트니스",
    company: "피트니스브랜드",
    applicants: 15,
    views: 387,
    viewedApplicants: 8,
    recruitCount: "20",
    confirmedApplicants: 15,
    images: ["/fitness-wear.png"],
    tags: ["운동복", "피트니스", "협업"],
    description: "새로운 운동복 라인의 협업 인플루언서를 모집합니다. 활동적인 라이프스타일을 가진 분들을 찾습니다.",
    requirements: ["피트니스 콘텐츠 제작 경험", "운동 관련 자격증", "건강한 라이프스타일"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "payment",
    contentType: "릴스+피드",
    videoDuration: "30초 이상",
    requiredContent: "브랜드명, 제품 라인명, 착용감, 기능성, 디자인에 대한 리뷰를 포함해주세요.",
    requiredScenes: "운동복 착용 장면, 실제 운동하는 장면, 다양한 각도에서의 핏 확인, 운동 후 만족스러운 표정",
    hashtags: ["#운동복", "#피트니스", "#헬스", "#운동", "#액티브웨어"],
    linkUrl: "https://example.com/fitness-wear",
    additionalMemo: "실제 운동하는 모습을 담아주시면 제품의 기능성을 더 잘 보여줄 수 있습니다.",
    uploadedPhotos: ["/fitness-wear.png"],
    visitType: "visit",
    applicantList: [],
  },
  {
    id: 5,
    title: "펫푸드 리뷰 체험단 모집",
    location: "서울시 용산구",
    timeAgo: "5시간 전",
    reward: "제품 제공",
    thumbnail: "/pet-food-variety.png",
    comments: 6,
    likes: 19,
    category: "반려동물",
    company: "펫푸드브랜드",
    applicants: 9,
    views: 134,
    viewedApplicants: 4,
    recruitCount: "12",
    confirmedApplicants: 6,
    images: ["/pet-food-variety.png"],
    tags: ["반려동물", "펫푸드", "리뷰"],
    description: "프리미엄 펫푸드의 체험단을 모집합니다. 반려동물과 함께하는 콘텐츠를 제작해주실 분들을 찾습니다.",
    requirements: ["반려동물 양육 경험", "펫 콘텐츠 제작 경험", "반려동물 건강 관리 지식"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "product",
    contentType: "릴스",
    videoDuration: "15초 이상",
    requiredContent: "제품명, 브랜드명, 반려동물의 반응, 제품의 특징과 장점을 포함해주세요.",
    requiredScenes: "제품 언박싱, 반려동물이 먹는 장면, 반려동물의 만족스러운 표정, 제품 패키지 클로즈업",
    hashtags: ["#펫푸드", "#반려동물", "#강아지", "#고양이", "#펫스타그램"],
    linkUrl: "https://example.com/pet-food",
    additionalMemo: "반려동물의 건강과 행복을 최우선으로 생각하는 제품이니, 솔직한 반응을 담아주세요.",
    uploadedPhotos: ["/pet-food-variety.png"],
    visitType: "visit",
    applicantList: [],
  },
  {
    id: 6,
    title: "스마트폰 액세서리 언박싱",
    location: "서울시 서초구",
    timeAgo: "6시간 전",
    reward: "건당 18만원",
    thumbnail: "/smartphone-accessories.png",
    comments: 9,
    likes: 27,
    category: "테크·가전",
    company: "테크브랜드",
    applicants: 7,
    views: 198,
    viewedApplicants: 3,
    recruitCount: "10",
    confirmedApplicants: 5,
    images: ["/smartphone-accessories.png"],
    tags: ["스마트폰", "액세서리", "언박싱"],
    description: "최신 스마트폰 액세서리의 언박싱 콘텐츠를 제작해주실 분들을 모집합니다.",
    requirements: ["테크 콘텐츠 제작 경험", "언박싱 영상 제작 경험", "제품 리뷰 경험"],
    status: "구인 진행 중",
    isUserCreated: false,
    rewardType: "payment",
    contentType: "릴스",
    videoDuration: "30초 이상",
    requiredContent: "제품명, 브랜드명, 제품의 특징과 기능, 사용 후기를 포함해주세요.",
    requiredScenes: "제품 언박싱 장면, 제품 디테일 클로즈업, 실제 사용하는 장면, 제품의 장점 설명",
    hashtags: ["#스마트폰", "#액세서리", "#언박싱", "#테크", "#가젯"],
    linkUrl: "https://example.com/smartphone-accessories",
    additionalMemo: "제품의 디자인과 기능성을 모두 잘 보여주는 콘텐츠를 기대합니다.",
    uploadedPhotos: ["/smartphone-accessories.png"],
    visitType: "visit",
    applicantList: [],
  },
]

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)

  const addCampaign = (newCampaign: Omit<Campaign, "id" | "timeAgo" | "comments" | "likes" | "views">) => {
    const campaign: Campaign = {
      ...newCampaign,
      id: Math.max(...campaigns.map((c) => c.id)) + 1,
      timeAgo: "방금 전",
      comments: 0,
      likes: 0,
      company: "사용자",
      applicants: 0,
      views: 0,
      viewedApplicants: 0,
      recruitCount: newCampaign.recruitCount || "1",
      createdAt: new Date().toISOString(),
      status: "구인 진행 중",
      isUserCreated: true,
      applicantList: [],
      thumbnail:
        newCampaign.uploadedPhotos && newCampaign.uploadedPhotos.length > 0
          ? newCampaign.uploadedPhotos[0]
          : "/campaign-image.jpg",
      images:
        newCampaign.uploadedPhotos && newCampaign.uploadedPhotos.length > 0
          ? newCampaign.uploadedPhotos
          : ["/campaign-image.jpg"],
      visitType: newCampaign.visitType || "visit",
    }
    setCampaigns((prev) => [campaign, ...prev])
  }

  const getCampaignById = (id: number) => {
    return campaigns.find((campaign) => campaign.id === id)
  }

  const updateCampaignStatus = (id: number, status: "구인 진행 중" | "구인 마감" | "비공개 글") => {
    setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? { ...campaign, status } : campaign)))
  }

  const getUserCreatedCampaigns = () => {
    return campaigns.filter((campaign) => campaign.isUserCreated)
  }

  const updateCampaign = (id: number, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              ...updates,
              thumbnail:
                updates.uploadedPhotos && updates.uploadedPhotos.length > 0
                  ? updates.uploadedPhotos[0]
                  : campaign.thumbnail,
              images:
                updates.uploadedPhotos && updates.uploadedPhotos.length > 0 ? updates.uploadedPhotos : campaign.images,
            }
          : campaign,
      ),
    )
  }

  const deleteCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id))
  }

  const updateApplicantStatus = (
    campaignId: number,
    applicantId: number,
    status: "컨택중" | "다음 기회에" | "협업 확정",
  ) => {
    setCampaigns((prev) =>
      prev.map((campaign) => {
        if (campaign.id === campaignId && campaign.applicantList) {
          return {
            ...campaign,
            applicantList: campaign.applicantList.map((applicant) =>
              applicant.id === applicantId ? { ...applicant, status } : applicant,
            ),
          }
        }
        return campaign
      }),
    )
  }

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        addCampaign,
        getCampaignById,
        updateCampaignStatus,
        getUserCreatedCampaigns,
        updateCampaign,
        deleteCampaign,
        updateApplicantStatus,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaigns() {
  const context = useContext(CampaignContext)
  if (context === undefined) {
    throw new Error("useCampaigns must be used within a CampaignProvider")
  }
  return context
}
