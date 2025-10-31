// app/campaigns/create/page.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCampaigns } from "@/lib/campaign-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"

// ✅ profile-utils.ts 최신 API로 교체
import {
  calculateAdvertiserProgress,
  getProfileCompletionInfo,
} from "@/lib/profile-utils"

const categories = [
  "베이비·키즈",
  "뷰티·화장품",
  "패션·잡화",
  "푸드·외식",
  "간편식·배달",
  "리빙·인테리어",
  "반려동물",
  "숙박·여행",
  "헬스·피트니스",
  "취미·여가",
  "테크·가전",
  "기타",
] as const

const categoryHashtags: Record<(typeof categories)[number], string[]> = {
  "베이비·키즈": ["#육아", "#베이비용품", "#키즈패션", "#육아템", "#아기용품"],
  "뷰티·화장품": ["#뷰티", "#화장품", "#스킨케어", "#메이크업", "#뷰티템"],
  "패션·잡화": ["#패션", "#OOTD", "#스타일링", "#패션아이템", "#데일리룩"],
  "푸드·외식": ["#맛집", "#음식", "#맛스타그램", "#푸드", "#외식"],
  "간편식·배달": ["#간편식", "#배달음식", "#홈쿡", "#간단요리", "#배달"],
  "리빙·인테리어": ["#인테리어", "#홈데코", "#리빙", "#홈스타일링", "#집꾸미기"],
  "반려동물": ["#반려동물", "#펫", "#강아지", "#고양이", "#펫용품"],
  "숙박·여행": ["#여행", "#숙박", "#호텔", "#펜션", "#여행스타그램"],
  "헬스·피트니스": ["#헬스", "#운동", "#피트니스", "#다이어트", "#건강"],
  "취미·여가": ["#취미", "#여가", "#문화", "#액티비티", "#체험"],
  "테크·가전": ["#테크", "#가전", "#IT", "#디지털", "#전자제품"],
  "기타": ["#추천", "#리뷰", "#체험", "#일상", "#라이프스타일"],
}

const contentTypes = ["릴스", "피드", "릴스+피드"] as const
const videoDurations = ["15초 이상", "30초 이상", "45초 이상"] as const

// ✅ DB에서 프로필 가져오기 (localStorage 대신)
async function fetchAdvertiserProfileFromDB(): Promise<any | null> {
  try {
    const response = await fetch('/api/profile')
    const data = await response.json()

    if (!response.ok || !data.success) {
      console.error('❌ 프로필 조회 실패:', data)
      return null
    }

    console.log('✅ DB에서 프로필 로드:', data.profile)
    return data.profile
  } catch (error) {
    console.error('❌ 프로필 조회 오류:', error)
    return null
  }
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { addCampaign } = useCampaigns()

  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [title, setTitle] = useState("")
  const [recruitType, setRecruitType] = useState<"one" | "multiple" | "">("")
  const [recruitCount, setRecruitCount] = useState("")
  const [visitType, setVisitType] = useState<"visit" | "non-visit" | "">("")
  const [selectedRewardType, setSelectedRewardType] = useState<"payment" | "product" | "other" | "">("")
  const [paymentBudgetType, setPaymentBudgetType] = useState<"fixed" | "negotiable" | "">("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isDealPossible, setIsDealPossible] = useState(false)
  const [productName, setProductName] = useState("")
  const [otherReward, setOtherReward] = useState("")
  const [additionalRewardInfo, setAdditionalRewardInfo] = useState("")
  const [selectedContentType, setSelectedContentType] = useState("")
  const [customVideoDuration, setCustomVideoDuration] = useState("")
  const [selectedVideoDuration, setSelectedVideoDuration] = useState("")
  const [requiredContent, setRequiredContent] = useState("")
  const [requiredScenes, setRequiredScenes] = useState("")
  const [hashtagTags, setHashtagTags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [additionalMemo, setAdditionalMemo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomVideoInput, setShowCustomVideoInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ 프로필 검증 상태 추가
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [advertiserProfile, setAdvertiserProfile] = useState<any>(null)
  const hasCheckedProfile = useRef(false)

  // ✅ 진입 가드: DB에서 프로필 완성도 검증
  useEffect(() => {
    const checkProfileCompletion = async () => {
      // 인플루언서 모드 체크
      const influencerMode = localStorage.getItem("influencer_mode") === "true"
      setIsInfluencerMode(influencerMode)

      if (influencerMode) {
        // 인플루언서는 캠페인 작성 불가
        alert("인플루언서는 캠페인을 작성할 수 없습니다.")
        router.push("/campaigns")
        return
      }

      if (hasCheckedProfile.current) return
      hasCheckedProfile.current = true

      try {
        setIsCheckingProfile(true)
        
        // ✅ DB에서 프로필 가져오기
        const profile = await fetchAdvertiserProfileFromDB()
        
        if (!profile) {
          alert('프로필 정보를 불러올 수 없습니다. 다시 시도해주세요.')
          router.back()
          return
        }

        setAdvertiserProfile(profile)

        // 광고주 프로필 완성도 계산
        const progress = calculateAdvertiserProgress(profile)
        const { message } = getProfileCompletionInfo({ ...profile, user_type: "ADVERTISER" })

        console.log('[create] DB 프로필 검증:', { progress, profile })

        // ✅ 100%가 아니면 작성 불가
        if (progress !== 100) {
          alert(
            `캠페인을 작성하려면 프로필을 100% 완성해주세요.\n현재 프로필 완성도: ${progress}%\n\n프로필 수정 페이지에서 정보를 입력해주세요.`
          )
          router.back()
          return
        }

        console.log('✅ 프로필 검증 통과 - 캠페인 작성 가능')
        
      } catch (error) {
        console.error('❌ 프로필 검증 오류:', error)
        alert('프로필 검증 중 오류가 발생했습니다.')
        router.back()
      } finally {
        setIsCheckingProfile(false)
      }
    }

    checkProfileCompletion()
  }, [router])

  const handleHashtagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHashtagInput(value)

    if (value.includes(" ") || (value.includes("#") && value.lastIndexOf("#") > 0)) {
      const tags = value.split(/[\s#]+/).filter((tag) => tag.trim() !== "")
      const newTags = tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      const uniqueTags = [...new Set([...hashtagTags, ...newTags])]
      setHashtagTags(uniqueTags)
      setHashtagInput("")
    }
  }

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault()
      const value = hashtagInput.trim()
      if (value) {
        const tag = value.startsWith("#") ? value : `#${value}`
        if (!hashtagTags.includes(tag)) {
          setHashtagTags([...hashtagTags, tag])
        }
        setHashtagInput("")
      }
    } else if (e.key === "Backspace" && hashtagInput === "" && hashtagTags.length > 0) {
      setHashtagTags(hashtagTags.slice(0, -1))
    }
  }

  const addHashtagTag = (tag: string) => {
    if (!hashtagTags.includes(tag)) {
      setHashtagTags([...hashtagTags, tag])
    }
  }

  const removeHashtagTag = (tagToRemove: string) => {
    setHashtagTags(hashtagTags.filter((tag) => tag !== tagToRemove))
  }

  const generatePreviewData = () => {
    let rewardString = ""
    if (selectedRewardType === "payment" && paymentAmount) {
      rewardString = paymentAmount === "인플루언서와 직접 협의" ? "협의 후 결정" : `${paymentAmount}만원`
    } else if (selectedRewardType === "product" && productName) {
      rewardString = `제품 제공`
    } else if (selectedRewardType === "other" && otherReward) {
      rewardString = otherReward
    } else {
      rewardString = "협의 후 결정"
    }

    const finalRecruitCount = recruitType === "one" ? "1" : recruitCount || "1"

    return {
      title: title || "캠페인 제목",
      category: selectedCategory || "카테고리",
      location: "서울시",
      reward: rewardString,
      thumbnail: "/campaign-image.jpg",
      description: additionalMemo || "캠페인 설명",
      tags: [selectedCategory, selectedContentType].filter(Boolean),
      requirements: [
        selectedContentType && `${selectedContentType} 콘텐츠 제작`,
        selectedVideoDuration && `영상 길이 ${selectedVideoDuration}`,
        `모집 인원 ${finalRecruitCount}명`,
      ].filter(Boolean),
      images: ["/campaign-image.jpg"],
    }
  }

  const handleRewardTypeToggle = (type: "payment" | "product" | "other") => {
    if (selectedRewardType === type) {
      setSelectedRewardType("")
      setPaymentBudgetType("")
      setPaymentAmount("")
      setProductName("")
      setOtherReward("")
      setIsDealPossible(false)
    } else {
      setSelectedRewardType(type)
      if (type !== "payment") {
        setPaymentBudgetType("")
        setPaymentAmount("")
        setIsDealPossible(false)
      }
      if (type !== "product") setProductName("")
      if (type !== "other") setOtherReward("")
    }
  }

  const handlePaymentBudgetTypeToggle = (type: "fixed" | "negotiable") => {
    if (paymentBudgetType === type) {
      setPaymentBudgetType("")
      setPaymentAmount("")
      setIsDealPossible(false)
    } else {
      setPaymentBudgetType(type)
      if (type === "negotiable") {
        setPaymentAmount("인플루언서와 직접 협의")
        setIsDealPossible(false)
      } else {
        setPaymentAmount("")
      }
    }
  }

  const handleHighlightToggle = (highlight: string) => {
    // (하이라이트 UI가 있다면 사용)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    // ✅ 작성 직전 DB에서 다시 한 번 100% 확인
    const profile = await fetchAdvertiserProfileFromDB()
    if (!profile) {
      alert('프로필 정보를 불러올 수 없습니다. 다시 시도해주세요.')
      return
    }

    const progress = calculateAdvertiserProgress(profile)
    if (progress !== 100) {
      alert(`캠페인을 작성하려면 프로필을 100% 완성해주세요.\n현재 프로필 완성도: ${progress}%`)
      router.push('/profile/edit')
      return
    }

    // 필수 검증
    if (!selectedCategory) return alert("카테고리를 선택해주세요.")
    if (!title.trim()) return alert("캠페인 제목을 입력해주세요.")
    if (!recruitType) return alert("모집 인원을 선택해주세요.")
    if (recruitType === "multiple" && !recruitCount) return alert("모집 인원 수를 입력해주세요.")
    if (!selectedRewardType) return alert("보상 방식을 선택해주세요.")

    const uploadedPhotoUrls = uploadedFiles.map((f) => URL.createObjectURL(f))

    const campaignData = {
      title: title.trim(),
      category: selectedCategory,
      recruitType,
      recruitCount: recruitType === "one" ? 1 : parseInt(recruitCount) || 1,
      visitType: visitType || "visit",
      rewardType: selectedRewardType,
      paymentAmount: selectedRewardType === "payment" ? paymentAmount : null,
      productName: selectedRewardType === "product" ? productName : null,
      otherReward: selectedRewardType === "other" ? otherReward : null,
      additionalRewardInfo: additionalRewardInfo || null,
      isDealPossible,
      negotiationOption: paymentBudgetType === "negotiable" ? "yes" : "no",
      contentType: selectedContentType || null,
      videoDuration: selectedVideoDuration || customVideoDuration || null,
      requiredContent: requiredContent || null,
      requiredScenes: requiredScenes || null,
      hashtags: hashtagTags,
      linkUrl: linkUrl || null,
      additionalMemo: additionalMemo || null,
      uploadedPhotos: uploadedPhotoUrls,
      thumbnail: uploadedPhotoUrls[0] || null,
    }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      })
      const result = await res.json()
      if (!res.ok) {
        console.error("❌ API 오류:", result)
        alert(result.error || "캠페인 생성에 실패했습니다.")
        return
      }
      alert("캠페인이 성공적으로 게시되었습니다!")
      if (result.campaign?.id) router.push(`/campaigns/${result.campaign.id}`)
      else router.push("/campaigns")
    } catch (e) {
      console.error("❌ Campaign creation failed:", e)
      alert("게시에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    alert("임시저장 기능은 곧 추가될 예정입니다.")
  }

  const handleRecruitTypeToggle = (type: "one" | "multiple") => {
    if (recruitType === type) {
      setRecruitType("")
      setRecruitCount("")
    } else {
      setRecruitType(type)
      if (type === "one") setRecruitCount("")
    }
  }

  const handleVisitTypeToggle = (type: "visit" | "non-visit") => {
    setVisitType(visitType === type ? "" : type)
  }

  const handleContentTypeToggle = (type: string) => {
    setSelectedContentType(selectedContentType === type ? "" : type)
  }

  const handleVideoDurationToggle = (duration: string) => {
    if (selectedVideoDuration === duration) {
      setSelectedVideoDuration("")
    } else {
      setSelectedVideoDuration(duration)
      setCustomVideoDuration("")
      setShowCustomVideoInput(false)
    }
  }

  const handleCustomVideoToggle = () => {
    if (showCustomVideoInput) {
      setShowCustomVideoInput(false)
      setCustomVideoDuration("")
      setSelectedVideoDuration("")
    } else {
      setShowCustomVideoInput(true)
      setSelectedVideoDuration("")
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) setUploadedFiles((prev) => [...prev, ...Array.from(files)])
  }

  // ✅ 로딩 중에는 로딩 화면 표시
  if (isCheckingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 확인 중...</p>
        </div>
      </div>
    )
  }

  // ✅ 인플루언서 모드면 리다이렉트
  if (isInfluencerMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">리다이렉트 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{ height: "var(--gnb-height)" }}>
        <div
          className="flex items-center justify-between h-full"
          style={{ paddingLeft: "var(--gnb-padding-x)", paddingRight: "var(--gnb-padding-x)" }}
        >
          <Button variant="ghost" className="flex items-center h-9 px-1" onClick={() => router.back()}>
            <ChevronLeft
              className="text-gray-600"
              style={{
                width: "var(--gnb-icon-size)",
                height: "var(--gnb-icon-size)",
                strokeWidth: "var(--gnb-icon-stroke)",
              }}
            />
            <span className="text-base text-gray-600">작성하기</span>
          </Button>
          <button onClick={() => setShowPreview(true)} className="p-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      <main
        className="pb-20"
        style={{
          paddingLeft: "var(--gnb-padding-x)",
          paddingRight: "var(--gnb-padding-x)",
          paddingTop: "var(--gnb-padding-y)",
        }}
      >
        {/* Category */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category ? "bg-[#7b68ee] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">캠페인 제목</h2>
          <Input
            placeholder="예) 신상 화장품 체험단 모집"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 text-sm"
          />
        </div>

        {/* Recruitment */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">모집 인원</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleRecruitTypeToggle("one")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                recruitType === "one" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">1명 모집</div>
            </button>
            <button
              onClick={() => handleRecruitTypeToggle("multiple")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                recruitType === "multiple" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">여러 명 모집</div>
            </button>
            {recruitType === "multiple" && (
              <Input
                type="number"
                placeholder="모집 인원 수를 입력하세요"
                value={recruitCount}
                onChange={(e) => setRecruitCount(e.target.value)}
                className="w-full h-11 text-sm mt-2"
              />
            )}
          </div>
        </div>

        {/* Visit Type */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">방문 여부</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleVisitTypeToggle("visit")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                visitType === "visit" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">방문형</div>
              <div className="text-xs text-gray-500 mt-1">매장 방문 후 체험</div>
            </button>
            <button
              onClick={() => handleVisitTypeToggle("non-visit")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                visitType === "non-visit" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">배송형</div>
              <div className="text-xs text-gray-500 mt-1">제품 수령 후 체험</div>
            </button>
          </div>
        </div>

        {/* Reward */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">보상 방식</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleRewardTypeToggle("payment")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                selectedRewardType === "payment" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">현금 지급</div>
            </button>

            {selectedRewardType === "payment" && (
              <div className="ml-4 space-y-3">
                <button
                  onClick={() => handlePaymentBudgetTypeToggle("fixed")}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                    paymentBudgetType === "fixed" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">예산 고정</div>
                </button>
                {paymentBudgetType === "fixed" && (
                  <div className="ml-4">
                    <Input
                      type="text"
                      placeholder="예) 10 (만원 단위)"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full h-11 text-sm"
                    />
                  </div>
                )}
                <button
                  onClick={() => handlePaymentBudgetTypeToggle("negotiable")}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                    paymentBudgetType === "negotiable"
                      ? "border-[#7b68ee] bg-[#7b68ee]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">인플루언서와 직접 협의</div>
                </button>
              </div>
            )}

            <button
              onClick={() => handleRewardTypeToggle("product")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                selectedRewardType === "product" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">제품 제공</div>
            </button>
            {selectedRewardType === "product" && (
              <Input
                placeholder="제품명을 입력하세요"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full h-11 text-sm ml-4"
              />
            )}

            <button
              onClick={() => handleRewardTypeToggle("other")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                selectedRewardType === "other" ? "border-[#7b68ee] bg-[#7b68ee]/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">기타</div>
            </button>
            {selectedRewardType === "other" && (
              <Input
                placeholder="기타 보상 내용을 입력하세요"
                value={otherReward}
                onChange={(e) => setOtherReward(e.target.value)}
                className="w-full h-11 text-sm ml-4"
              />
            )}
          </div>

          {selectedRewardType && (
            <div className="mt-4">
              <Textarea
                placeholder="추가 리워드 정보 (선택사항)"
                value={additionalRewardInfo}
                onChange={(e) => setAdditionalRewardInfo(e.target.value)}
                rows={3}
                className="w-full text-sm"
              />
            </div>
          )}
        </div>

        {/* Content Type */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">콘텐츠 유형</h2>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleContentTypeToggle(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedContentType === type ? "bg-[#7b68ee] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Video Duration */}
        {selectedContentType && selectedContentType !== "피드" && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">영상 길이</h2>
            <div className="flex flex-wrap gap-2">
              {videoDurations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => handleVideoDurationToggle(duration)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedVideoDuration === duration ? "bg-[#7b68ee] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {duration}
                </button>
              ))}
              <button
                onClick={handleCustomVideoToggle}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  showCustomVideoInput ? "bg-[#7b68ee] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                직접 입력
              </button>
            </div>
            {showCustomVideoInput && (
              <Input
                placeholder="예) 60초 이상"
                value={customVideoDuration}
                onChange={(e) => setCustomVideoDuration(e.target.value)}
                className="w-full h-11 text-sm mt-3"
              />
            )}
          </div>
        )}

        {/* Required Content */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">필수 포함 내용</h2>
          <Textarea
            placeholder="예) 제품 사용 전/후 비교, 제품 특징 3가지 이상 언급"
            value={requiredContent}
            onChange={(e) => setRequiredContent(e.target.value)}
            rows={4}
            className="w-full text-sm"
          />
        </div>

        {/* Required Scenes */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">필수 촬영 장면</h2>
          <Textarea
            placeholder="예) 제품 언박싱, 사용 모습, 제품 클로즈업"
            value={requiredScenes}
            onChange={(e) => setRequiredScenes(e.target.value)}
            rows={4}
            className="w-full text-sm"
          />
        </div>

        {/* Tags / Links / Files */}
        <div className="space-y-8">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">해시태그</h3>
            <div className="border border-gray-300 rounded-lg p-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {hashtagTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#7b68ee]/10 text-[#7b68ee] rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeHashtagTag(tag)}
                      className="hover:bg-[#7b68ee]/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={hashtagTags.length === 0 ? "#해시태그 입력 (스페이스/엔터 추가)" : ""}
                  value={hashtagInput}
                  onChange={handleHashtagInputChange}
                  onKeyDown={handleHashtagKeyDown}
                  className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                />
              </div>
            </div>
            {selectedCategory && categoryHashtags[selectedCategory as keyof typeof categoryHashtags] && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">추천 해시태그:</p>
                <div className="flex flex-wrap gap-2">
                  {categoryHashtags[selectedCategory as keyof typeof categoryHashtags].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addHashtagTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">사진 업로드</h3>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500 mt-1">사진</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">링크 업로드</h3>
            <Input
              placeholder="관련 링크 URL을 입력하세요"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full h-10 text-sm"
            />
          </div>
        </div>

        {/* Additional Memo */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">추가 메모</h2>
          <Textarea
            placeholder="추가로 전달하고 싶은 내용이 있다면 자유롭게 작성해주세요."
            value={additionalMemo}
            onChange={(e) => setAdditionalMemo(e.target.value)}
            rows={4}
            className="w-full text-sm"
          />
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        <Button
          onClick={handleSaveDraft}
          variant="outline"
          className="flex-1 h-12 text-gray-700 font-medium border-gray-300 bg-transparent"
          disabled={isSubmitting}
        >
          임시저장
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 h-12 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "게시 중..." : "게시하기"}
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">캠페인 미리보기</h3>
              <button onClick={() => setShowPreview(false)} className="p-1">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {(() => {
                const previewData = generatePreviewData()
                return (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{previewData.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{previewData.category}</span>
                        <span>{previewData.location}</span>
                      </div>
                      <p className="text-sm text-[#7b68ee] font-medium mb-3">{previewData.reward}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">📄 캠페인 설명</h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewData.description}</p>
                    </div>

                    {previewData.requirements.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">요구사항</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {previewData.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#7b68ee] mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {previewData.tags.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">태그</h5>
                        <div className="flex flex-wrap gap-2">
                          {previewData.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">업로드된 파일</h5>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}