// lib/profile-utils.ts

/**
 * 인플루언서 프로필 완성도 계산
 * @param profile - 사용자 프로필 객체
 * @returns 0-100 사이의 완성도 퍼센트
 */
export function calculateInfluencerProgress(profile: any): number {
  if (!profile) return 0

  let progress = 0

  // 헬퍼 함수: 문자열이 비어있지 않은지 체크
  const hasValue = (value: any): boolean => {
    return value != null && String(value).trim() !== ""
  }

  // 1. 프로필 사진 (15점)
  if (hasValue(profile.image)) {
    progress += 15
  }

  // 2. 카테고리 (15점)
  if (hasValue(profile.category)) {
    progress += 15
  }

  // 3. 자기소개 (15점)
  if (hasValue(profile.bio)) {
    progress += 15
  }

  // 4. 인스타그램 인증 (20점) - verified 상태만
  if (profile.instagram_verification_status === 'verified') {
    progress += 20
  }

  // 5. 지역 (15점)
  if (hasValue(profile.broad_region)) {
    if (String(profile.broad_region) === "전체") {
      progress += 15
    } else if (hasValue(profile.narrow_region)) {
      progress += 15
    }
  }

  // 6. 활동 빈도 (10점)
  if (hasValue(profile.activity_rate)) {
    progress += 10
  }

  // 7. 해시태그 (10점)
  if (profile.profile_hashtags && Array.isArray(profile.profile_hashtags) && profile.profile_hashtags.length > 0) {
    progress += 10
  }

  return Math.min(100, progress)
}

/**
 * 광고주 프로필 완성도 계산
 * @param profile - 사용자 프로필 객체
 * @returns 0-100 사이의 완성도 퍼센트
 */
export function calculateAdvertiserProgress(profile: any): number {
  if (!profile) return 0

  let filledFields = 0
  let totalFields = 0

  const hasValue = (value: any): boolean => {
    return value != null && String(value).trim() !== ""
  }

  // 사업자번호 완성 여부 (xxx-xx-xxxxx 형식)
  const businessNumberComplete = hasValue(profile.business_number) && 
    profile.business_number.split('-').length === 3

  // ✅ 항상 필수: brandCategory, storeType, brandLink, businessNumber (총 4개)
  
  // 1. Brand category
  totalFields++
  if (hasValue(profile.brand_category)) filledFields++

  // 2. Store type
  totalFields++
  if (hasValue(profile.store_type)) filledFields++

  // 3. Brand link
  totalFields++
  if (hasValue(profile.brand_link)) filledFields++

  // 4. Business number
  totalFields++
  if (businessNumberComplete) filledFields++

  // ✅ 판매 형태별 조건부 필수
  if (profile.store_type === "online") {
    // 온라인: brandName만 필수
    totalFields++
    if (hasValue(profile.brand_name)) filledFields++
  } else if (profile.store_type === "offline") {
    // 오프라인: offlineLocation만 필수
    totalFields++
    if (hasValue(profile.offline_location)) filledFields++
  } else if (profile.store_type === "both") {
    // 둘다: brandName + offlineLocation 둘다 필수
    totalFields += 2
    if (hasValue(profile.brand_name)) filledFields++
    if (hasValue(profile.offline_location)) filledFields++
  }

  if (totalFields === 0) return 0
  return Math.round((filledFields / totalFields) * 100)
}

/**
 * 프로필 완성도가 충분한지 체크
 * @param profile - 사용자 프로필 객체
 * @param minProgress - 최소 요구 완성도 (기본값: 60)
 * @returns 완성도가 충분한지 여부
 */
export function isProfileComplete(profile: any, minProgress: number = 60): boolean {
  if (!profile) return false

  const progress = profile.user_type === 'INFLUENCER'
    ? calculateInfluencerProgress(profile)
    : calculateAdvertiserProgress(profile)

  return progress >= minProgress
}

/**
 * 프로필 완성도 정보 반환 (퍼센트 + 메시지)
 * @param profile - 사용자 프로필 객체
 * @returns 완성도와 상태 메시지
 */
export function getProfileCompletionInfo(profile: any): {
  progress: number
  message: string
  isComplete: boolean
} {
  const progress = profile?.user_type === 'INFLUENCER'
    ? calculateInfluencerProgress(profile)
    : calculateAdvertiserProgress(profile)

  let message = ''
  let isComplete = false

  if (progress === 100) {
    message = '🎉 프로필이 완성되었습니다!'
    isComplete = true
  } else if (progress >= 80) {
    message = '✨ 조금만 더 채워주세요!'
    isComplete = true
  } else if (progress >= 60) {
    message = '👍 프로필이 잘 구성되고 있어요'
    isComplete = true
  } else if (progress >= 40) {
    message = '📝 프로필을 조금 더 완성해주세요'
    isComplete = false
  } else {
    message = '🚀 프로필을 작성해주세요'
    isComplete = false
  }

  return { progress, message, isComplete }
}

/**
 * 부족한 필수 항목 리스트 반환 (인플루언서)
 * @param profile - 사용자 프로필 객체
 * @returns 부족한 항목 배열
 */
export function getMissingInfluencerFields(profile: any): string[] {
  if (!profile) return []

  const missing: string[] = []

  const hasValue = (value: any): boolean => {
    return value != null && String(value).trim() !== ""
  }

  if (!hasValue(profile.image)) missing.push('프로필 사진')
  if (!hasValue(profile.category)) missing.push('카테고리')
  if (!hasValue(profile.bio)) missing.push('자기소개')
  if (profile.instagram_verification_status !== 'verified') missing.push('인스타그램 인증')
  
  if (!hasValue(profile.broad_region) || (profile.broad_region !== '전체' && !hasValue(profile.narrow_region))) {
    missing.push('활동 지역')
  }
  
  if (!hasValue(profile.activity_rate)) missing.push('활동 빈도')
  if (!profile.profile_hashtags || !Array.isArray(profile.profile_hashtags) || profile.profile_hashtags.length === 0) {
    missing.push('해시태그')
  }

  return missing
}

/**
 * 부족한 필수 항목 리스트 반환 (광고주)
 * @param profile - 사용자 프로필 객체
 * @returns 부족한 항목 배열
 */
export function getMissingAdvertiserFields(profile: any): string[] {
  if (!profile) return []

  const missing: string[] = []

  const hasValue = (value: any): boolean => {
    return value != null && String(value).trim() !== ""
  }

  if (!hasValue(profile.brand_category)) missing.push('브랜드 카테고리')
  if (!hasValue(profile.store_type)) missing.push('매장 유형')
  if (!hasValue(profile.brand_link)) missing.push('브랜드 링크')
  
  const businessNumberComplete = hasValue(profile.business_number) && 
    profile.business_number.split('-').length === 3
  if (!businessNumberComplete) missing.push('사업자등록번호')

  if (profile.store_type === 'online' || profile.store_type === 'both') {
    if (!hasValue(profile.brand_name)) missing.push('브랜드 이름')
  }
  
  if (profile.store_type === 'offline' || profile.store_type === 'both') {
    if (!hasValue(profile.offline_location)) missing.push('매장 위치')
  }

  return missing
}