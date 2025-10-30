// lib/profile-utils.ts

export const getAdvertiserProfileCompletion = (): number => {
  if (typeof window === "undefined") return 0

  const brandCategory = localStorage.getItem("advertiser_brand_category")
  const storeType = localStorage.getItem("advertiser_store_type")
  const brandName = localStorage.getItem("advertiser_brand_name")
  const brandLink = localStorage.getItem("advertiser_brand_link")
  const businessNum1 = localStorage.getItem("advertiser_business_num1")
  const businessNum2 = localStorage.getItem("advertiser_business_num2")
  const businessNum3 = localStorage.getItem("advertiser_business_num3")
  const offlineLocation = localStorage.getItem("advertiser_offline_location")

  console.log("[v0] Profile Completion Check:", {
    brandCategory,
    storeType,
    brandName,
    brandLink,
    businessNum1,
    businessNum2,
    businessNum3,
    offlineLocation,
  })

  let completed = 0
  let total = 0

  // ✅ 항상 필수: brandCategory, storeType, brandLink, businessNumber (총 4개)
  
  // 1. Brand category
  total++
  if (brandCategory && brandCategory.trim() !== "") completed++

  // 2. Store type
  total++
  if (storeType && storeType.trim() !== "") completed++

  // 3. Brand link
  total++
  if (brandLink && brandLink.trim() !== "") completed++

  // 4. Business number (all 3 parts)
  total++
  if (
    businessNum1 &&
    businessNum1.length === 3 &&
    businessNum2 &&
    businessNum2.length === 2 &&
    businessNum3 &&
    businessNum3.length === 5
  ) {
    completed++
  }

  // ✅ 판매 형태별 조건부 필수
  if (storeType === "online") {
    // 온라인: brandName만 필수
    total++
    if (brandName && brandName.trim() !== "") completed++
  } else if (storeType === "offline") {
    // 오프라인: offlineLocation만 필수
    total++
    if (offlineLocation && offlineLocation.trim() !== "") completed++
  } else if (storeType === "both") {
    // 둘다: brandName + offlineLocation 둘다 필수
    total += 2
    if (brandName && brandName.trim() !== "") completed++
    if (offlineLocation && offlineLocation.trim() !== "") completed++
  }

  const percentage = Math.round((completed / total) * 100)

  console.log("[v0] Profile Completion:", `${completed}/${total} = ${percentage}%`)

  return percentage
}

export const checkAdvertiserProfileComplete = (): boolean => {
  return getAdvertiserProfileCompletion() === 100
}