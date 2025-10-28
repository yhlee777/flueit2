// DB snake_case ↔ Frontend 변환 유틸리티
// Campaign 타입은 campaign-store.tsx에서 import

import type { Campaign } from '@/lib/campaign-store'

/**
 * snake_case를 camelCase로 변환
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * camelCase를 snake_case로 변환
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * 객체의 모든 키를 snake_case에서 camelCase로 변환
 */
export function convertKeysToCamel<T = any>(obj: any): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamel(item)) as any
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key)
    acc[camelKey] = convertKeysToCamel(obj[key])
    return acc
  }, {} as any)
}

/**
 * 객체의 모든 키를 camelCase에서 snake_case로 변환
 */
export function convertKeysToSnake<T = any>(obj: any): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnake(item)) as any
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key)
    acc[snakeKey] = convertKeysToSnake(obj[key])
    return acc
  }, {} as any)
}

/**
 * Visit Type 값을 한글로 변환
 */
export function formatVisitType(visit_type: string | null | undefined): string {
  if (visit_type === 'visit') return '방문형'
  if (visit_type === 'non-visit') return '비방문형'
  return '미정'
}

/**
 * Negotiation Option 값을 한글로 변환
 */
export function formatNegotiationOption(
  negotiation_option: string | null | undefined,
  is_deal_possible: boolean = false
): string {
  if (is_deal_possible) return '딜 가능'
  if (negotiation_option === 'yes') return '협의 가능'
  if (negotiation_option === 'no') return '협의 불가'
  return '미정'
}

/**
 * 날짜를 상대적 시간으로 변환 (예: "2시간 전", "3일 전")
 */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return '방금 전'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  
  return date.toLocaleDateString('ko-KR')
}

/**
 * 날짜를 포맷팅 (예: "2024년 1월 15일")
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 숫자를 천 단위로 포맷팅 (예: 1234 -> "1,234")
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined) return '0'
  return num.toLocaleString('ko-KR')
}

/**
 * 모집률 계산 (신청자 수 / 모집 인원)
 */
export function calculateRecruitmentRate(
  applicants: number | undefined,
  recruit_count: number | undefined
): number {
  if (!recruit_count || recruit_count === 0) return 0
  const apps = applicants || 0
  return Math.round((apps / recruit_count) * 100)
}

/**
 * 마감 임박 여부 확인 (70% 이상)
 */
export function isClosingSoon(
  confirmed_applicants: number | undefined,
  recruit_count: number | undefined
): boolean {
  if (!recruit_count || recruit_count === 0) return false
  const confirmed = confirmed_applicants || 0
  return (confirmed / recruit_count) >= 0.7
}

/**
 * 보상 타입을 한글로 변환
 */
export function formatRewardType(reward_type: string | undefined): string {
  switch (reward_type) {
    case 'payment':
      return '금액 지급'
    case 'product':
      return '제품 제공'
    case 'other':
      return '기타'
    default:
      return '미정'
  }
}

/**
 * 콘텐츠 타입을 한글로 변환
 */
export function formatContentType(content_type: string | undefined): string {
  if (!content_type) return '미정'
  
  const contentTypeMap: Record<string, string> = {
    'instagram-post': '인스타그램 게시물',
    'instagram-story': '인스타그램 스토리',
    'instagram-reel': '인스타그램 릴스',
    'youtube-short': '유튜브 쇼츠',
    'youtube-video': '유튜브 영상',
    'blog-post': '블로그 포스팅',
    'tiktok': '틱톡',
  }
  
  return contentTypeMap[content_type] || content_type
}

/**
 * 캠페인 상태를 색상으로 변환
 */
export function getStatusColor(status: string | undefined): {
  text: string
  bg: string
  border: string
} {
  switch (status) {
    case '구인 진행 중':
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    case '구인 마감':
      return {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      }
    case '비공개 글':
      return {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      }
    default:
      return {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200'
      }
  }
}

/**
 * 보상 금액 포맷팅
 */
export function formatReward(campaign: Campaign): string {
  if (campaign.reward_type === 'payment' && campaign.payment_amount) {
    if (campaign.payment_amount === '인플루언서와 직접 협의') {
      return '협의 후 결정'
    }
    // 숫자인 경우 "만원" 추가
    const amount = campaign.payment_amount.replace(/[^0-9]/g, '')
    if (amount) {
      return `${formatNumber(parseInt(amount))}만원`
    }
    return campaign.payment_amount
  }
  
  if (campaign.reward_type === 'product' && campaign.product_name) {
    return `제품 제공: ${campaign.product_name}`
  }
  
  if (campaign.reward_type === 'other' && campaign.other_reward) {
    return campaign.other_reward
  }
  
  return '협의 후 결정'
}

/**
 * 캠페인이 활성 상태인지 확인
 */
export function isCampaignActive(campaign: Campaign): boolean {
  return campaign.status === '구인 진행 중'
}

/**
 * 캠페인이 사용자가 생성한 것인지 확인
 */
export function isUserCampaign(campaign: Campaign, userId: string | undefined): boolean {
  if (!userId) return false
  return campaign.user_id === userId
}

/**
 * 해시태그 포맷팅 (# 추가)
 */
export function formatHashtags(hashtags: string[] | undefined): string[] {
  if (!hashtags || hashtags.length === 0) return []
  return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
}

/**
 * 비디오 길이 포맷팅
 */
export function formatVideoDuration(duration: string | undefined): string {
  if (!duration) return ''
  
  // "30초", "1분", "1분 30초" 등의 형식으로 변환
  const match = duration.match(/(\d+)/)
  if (!match) return duration
  
  const seconds = parseInt(match[1])
  if (seconds < 60) {
    return `${seconds}초`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (remainingSeconds === 0) {
    return `${minutes}분`
  }
  
  return `${minutes}분 ${remainingSeconds}초`
}

/**
 * 캠페인 URL 생성
 */
export function getCampaignUrl(campaignId: string): string {
  return `/campaigns/${campaignId}`
}

/**
 * 캠페인 수정 URL 생성
 */
export function getCampaignEditUrl(campaignId: string): string {
  return `/campaigns/${campaignId}/edit`
}

/**
 * 썸네일 URL 검증 및 기본값 반환
 */
export function getThumbnailUrl(thumbnail: string | undefined): string {
  if (!thumbnail) return '/campaign-image.jpg'
  if (thumbnail.startsWith('http')) return thumbnail
  if (thumbnail.startsWith('/')) return thumbnail
  return `/uploads/${thumbnail}`
}

/**
 * 캠페인 통계 계산
 */
export function calculateCampaignStats(campaign: Campaign) {
  return {
    views: campaign.views || 0,
    likes: campaign.likes || 0,
    comments: campaign.comments || 0,
    applicants: campaign.applicants || 0,
    confirmed: campaign.confirmed_applicants || 0,
    recruit_count: campaign.recruit_count || 0,
    recruitment_rate: calculateRecruitmentRate(campaign.applicants, campaign.recruit_count),
    is_closing_soon: isClosingSoon(campaign.confirmed_applicants, campaign.recruit_count),
    engagement_rate: campaign.views ? Math.round(((campaign.likes || 0) + (campaign.comments || 0)) / campaign.views * 100) : 0
  }
}