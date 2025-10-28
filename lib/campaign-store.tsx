"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Applicant {
  id: number
  name: string
  avatar: string
  status: "컨택중" | "다음 기회에" | "협업 확정"
  followers?: string
  engagement?: number
  applied_at?: string  // ✅ snake_case
}

export interface Campaign {
  id: string  // UUID
  title: string
  location?: string
  time_ago?: string  // ✅ snake_case
  reward?: string
  thumbnail?: string
  comments?: number
  likes?: number
  category: string
  company?: string
  applicants?: number
  views?: number
  viewed_applicants?: number  // ✅ snake_case
  confirmed_applicants?: number  // ✅ snake_case
  images?: string[]
  tags?: string[]
  description?: string
  requirements?: string[]
  price_option?: "has-price" | "no-price"  // ✅ snake_case
  collaboration_fee?: string  // ✅ snake_case
  negotiation_option?: "yes" | "no"  // ✅ snake_case
  campaign_details?: string  // ✅ snake_case
  attached_files?: File[]  // ✅ snake_case
  created_at?: string  // ✅ snake_case
  status?: "구인 진행 중" | "구인 마감" | "비공개 글"
  is_user_created?: boolean  // ✅ snake_case
  recruit_count?: number  // ✅ snake_case (number로 변경)
  reward_type?: "payment" | "product" | "other"  // ✅ snake_case
  content_type?: string  // ✅ snake_case
  video_duration?: string  // ✅ snake_case
  required_content?: string  // ✅ snake_case
  required_scenes?: string  // ✅ snake_case
  hashtags?: string[]
  link_url?: string  // ✅ snake_case
  additional_memo?: string  // ✅ snake_case
  uploaded_photos?: string[]  // ✅ snake_case
  visit_type?: "visit" | "non-visit"  // ✅ snake_case
  applicant_list?: Applicant[]  // ✅ snake_case
  user_id?: string  // ✅ snake_case
  is_deal_possible?: boolean  // ✅ snake_case (새로 추가)
  payment_amount?: string  // ✅ snake_case (새로 추가)
  product_name?: string  // ✅ snake_case (새로 추가)
  other_reward?: string  // ✅ snake_case (새로 추가)
}

interface CampaignContextType {
  campaigns: Campaign[]
  loading: boolean
  addCampaign: (campaign: Omit<Campaign, "id" | "time_ago" | "comments" | "likes" | "views">) => void
  getCampaignById: (id: string) => Campaign | undefined
  updateCampaignStatus: (id: string, status: "구인 진행 중" | "구인 마감" | "비공개 글") => void
  getUserCreatedCampaigns: () => Campaign[]
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  refreshCampaigns: () => Promise<void>
  updateApplicantStatus: (
    campaignId: string,
    applicantId: number,
    status: "컨택중" | "다음 기회에" | "협업 확정",
  ) => void
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ DB에서 캠페인 불러오기
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns')
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      
      // ✅ DB 데이터를 프론트엔드 형식으로 변환 (이미 snake_case이므로 그대로 사용)
      const formattedCampaigns = data.campaigns.map((camp: any) => ({
        id: camp.id,
        title: camp.title,
        category: camp.category,
        location: '서울시', // 기본값 (추후 DB에 추가 가능)
        time_ago: getTimeAgo(camp.created_at),  // ✅ snake_case
        reward: getRewardString(camp),
        thumbnail: camp.thumbnail || '/campaign-image.jpg',
        comments: camp.comments || 0,
        likes: camp.likes || 0,
        views: camp.views || 0,
        status: camp.status || '구인 진행 중',
        is_user_created: true,  // ✅ snake_case
        recruit_count: camp.recruit_count || 0,  // ✅ snake_case (number)
        applicants: camp.applicants || 0,
        confirmed_applicants: camp.confirmed_applicants || 0,  // ✅ snake_case
        reward_type: camp.reward_type,  // ✅ snake_case
        content_type: camp.content_type,  // ✅ snake_case
        video_duration: camp.video_duration,  // ✅ snake_case
        required_content: camp.required_content,  // ✅ snake_case
        required_scenes: camp.required_scenes,  // ✅ snake_case
        hashtags: camp.hashtags || [],
        link_url: camp.link_url,  // ✅ snake_case
        additional_memo: camp.additional_memo,  // ✅ snake_case
        uploaded_photos: camp.uploaded_photos || [],  // ✅ snake_case
        visit_type: camp.visit_type,  // ✅ snake_case
        images: camp.uploaded_photos || [camp.thumbnail],
        tags: [camp.category, camp.content_type].filter(Boolean),
        description: camp.additional_memo,
        created_at: camp.created_at,  // ✅ snake_case
        user_id: camp.user_id,  // ✅ snake_case
        is_deal_possible: camp.is_deal_possible || false,  // ✅ snake_case
        negotiation_option: camp.negotiation_option,  // ✅ snake_case
        payment_amount: camp.payment_amount,  // ✅ snake_case
        product_name: camp.product_name,  // ✅ snake_case
        other_reward: camp.other_reward,  // ✅ snake_case
      }))

      setCampaigns(formattedCampaigns)
    } catch (error) {
      console.error('❌ 캠페인 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCampaigns()
  }, [])

  // 보상 문자열 생성
  const getRewardString = (camp: any): string => {
    if (camp.reward_type === 'payment' && camp.payment_amount) {
      return camp.payment_amount === '인플루언서와 직접 협의' 
        ? '협의 후 결정' 
        : `${camp.payment_amount}만원`
    } else if (camp.reward_type === 'product' && camp.product_name) {
      return '제품 제공'
    } else if (camp.reward_type === 'other' && camp.other_reward) {
      return camp.other_reward
    }
    return '협의 후 결정'
  }

  // 시간 계산
  const getTimeAgo = (created_at: string): string => {
    if (!created_at) return '방금'
    
    const now = new Date()
    const created = new Date(created_at)
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}일 전`
  }

  const addCampaign = (newCampaign: Omit<Campaign, "id" | "time_ago" | "comments" | "likes" | "views">) => {
    // 로컬 상태에만 추가 (실제 저장은 API에서 처리)
    const campaign: Campaign = {
      ...newCampaign,
      id: Date.now().toString(),
      time_ago: "방금",  // ✅ snake_case
      comments: 0,
      likes: 0,
      views: 0,
    }
    setCampaigns((prev) => [campaign, ...prev])
  }

  const getCampaignById = (id: string) => {
    return campaigns.find((campaign) => campaign.id === id)
  }

  const updateCampaignStatus = (id: string, status: "구인 진행 중" | "구인 마감" | "비공개 글") => {
    setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? { ...campaign, status } : campaign)))
  }

  const getUserCreatedCampaigns = () => {
    return campaigns.filter((campaign) => campaign.is_user_created)  // ✅ snake_case
  }

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              ...updates,
              thumbnail:
                updates.uploaded_photos && updates.uploaded_photos.length > 0  // ✅ snake_case
                  ? updates.uploaded_photos[0]
                  : campaign.thumbnail,
              images:
                updates.uploaded_photos && updates.uploaded_photos.length > 0  // ✅ snake_case
                  ? updates.uploaded_photos
                  : campaign.images,
            }
          : campaign,
      ),
    )
  }

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id))
  }

  const refreshCampaigns = async () => {
    await fetchCampaigns()
  }

  const updateApplicantStatus = (
    campaignId: string,
    applicantId: number,
    status: "컨택중" | "다음 기회에" | "협업 확정",
  ) => {
    setCampaigns((prev) =>
      prev.map((campaign) => {
        if (campaign.id === campaignId && campaign.applicant_list) {  // ✅ snake_case
          return {
            ...campaign,
            applicant_list: campaign.applicant_list.map((applicant) =>  // ✅ snake_case
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
        loading,
        addCampaign,
        getCampaignById,
        updateCampaignStatus,
        getUserCreatedCampaigns,
        updateCampaign,
        deleteCampaign,
        refreshCampaigns,
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