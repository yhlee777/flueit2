// DB 스키마와 일치하는 Campaign 타입 정의

export interface Campaign {
  // 기본 정보
  id: string
  user_id: string | null
  title: string
  category: string
  status: string
  
  // 모집 정보
  recruit_type: string | null
  recruit_count: number | null
  applicants: number
  confirmed_applicants: number
  
  // 방문 유형
  visit_type: "visit" | "non-visit" | null
  
  // 리워드 정보
  reward_type: string | null
  payment_amount: string | null
  product_name: string | null
  other_reward: string | null
  additional_reward_info: string | null
  
  // 협상 옵션
  is_deal_possible: boolean
  negotiation_option: "yes" | "no" | null
  
  // 콘텐츠 정보
  content_type: string | null
  video_duration: string | null
  required_content: string | null
  required_scenes: string | null
  
  // 메타 정보
  hashtags: string[] | null
  link_url: string | null
  additional_memo: string | null
  uploaded_photos: string[] | null
  thumbnail: string | null
  
  // 통계
  views: number
  likes: number
  comments: number
  
  // 타임스탬프
  created_at: string
  updated_at: string
}

// API 응답 타입
export interface CampaignsResponse {
  campaigns: Campaign[]
  total: number
  page: number
  per_page: number
}

// 캠페인 생성/수정을 위한 입력 타입
export interface CampaignInput {
  title: string
  category: string
  status?: string
  recruit_type?: string
  recruit_count?: number
  visit_type?: "visit" | "non-visit"
  reward_type?: string
  payment_amount?: string
  product_name?: string
  other_reward?: string
  additional_reward_info?: string
  is_deal_possible?: boolean
  negotiation_option?: "yes" | "no"
  content_type?: string
  video_duration?: string
  required_content?: string
  required_scenes?: string
  hashtags?: string[]
  link_url?: string
  additional_memo?: string
  uploaded_photos?: string[]
  thumbnail?: string
}

// 필터 옵션 타입
export interface CampaignFilters {
  categories?: string[]
  regions?: string[]
  visit_type?: "visit" | "non-visit"
  search_query?: string
  status?: string[]
}

// 정렬 옵션 타입
export type SortOption = "추천순" | "최신순" | "인기순"

// Visit Type 배지 정보
export interface VisitTypeBadge {
  icon: any
  text: string
}

// 협상 정보
export interface NegotiationInfo {
  text: string
  color: string
}