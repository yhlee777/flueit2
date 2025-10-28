"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"

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
]

const categoryHashtags = {
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

const contentTypes = ["릴스", "피드", "릴스+피드"]
const videoDurations = ["15초 이상", "30초 이상", "45초 이상"]

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
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
  const [showCustomVideoInput, setShowCustomVideoInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])

  // ✅ 캠페인 데이터 로드
  useEffect(() => {
    if (!campaignId || !session) return

    const fetchCampaign = async () => {
      try {
        setLoading(true)
        console.log("🔍 캠페인 수정 페이지 - 데이터 로드:", campaignId)

        const response = await fetch(`/api/campaigns/${campaignId}`)
        const data = await response.json()

        if (!response.ok) {
          console.error("❌ API 오류:", data)
          alert(data.error || "캠페인을 불러오는데 실패했습니다.")
          router.push("/campaigns")
          return
        }

        const campaign = data.campaign

        // 권한 확인 - 본인만 수정 가능
        if (campaign.user_id !== session.user.id) {
          alert("수정 권한이 없습니다.")
          router.push(`/campaigns/${campaignId}`)
          return
        }

        // ✅ 기존 데이터로 폼 채우기
        setSelectedCategory(campaign.category || "")
        setTitle(campaign.title || "")
        setRecruitType(campaign.recruit_count === 1 ? "one" : "multiple")
        setRecruitCount(String(campaign.recruit_count || 1))
        setVisitType(campaign.visit_type || "visit")
        setSelectedRewardType(campaign.reward_type || "")
        setSelectedContentType(campaign.content_type || "")
        setSelectedVideoDuration(campaign.video_duration || "")
        setRequiredContent(campaign.required_content || "")
        setRequiredScenes(campaign.required_scenes || "")
        setHashtagTags(campaign.hashtags || [])
        setLinkUrl(campaign.link_url || "")
        setAdditionalMemo(campaign.additional_memo || "")
        setIsDealPossible(campaign.is_deal_possible || false)
        setExistingPhotos(campaign.uploaded_photos || [])

        // 보상 정보
        if (campaign.reward_type === "payment" && campaign.payment_amount) {
          setPaymentAmount(campaign.payment_amount)
          setPaymentBudgetType(
            campaign.payment_amount === "인플루언서와 직접 협의" ? "negotiable" : "fixed"
          )
        }
        if (campaign.reward_type === "product" && campaign.product_name) {
          setProductName(campaign.product_name)
        }
        if (campaign.reward_type === "other" && campaign.other_reward) {
          setOtherReward(campaign.other_reward)
        }
        if (campaign.additional_reward_info) {
          setAdditionalRewardInfo(campaign.additional_reward_info)
        }

        console.log("✅ 캠페인 데이터 로드 완료")
      } catch (error) {
        console.error("❌ 캠페인 로드 오류:", error)
        alert("캠페인을 불러오는데 실패했습니다.")
        router.push("/campaigns")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId, session, router])

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
    if (e.key === "Enter" || e.key === " ") {
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
      if (type !== "product") {
        setProductName("")
      }
      if (type !== "other") {
        setOtherReward("")
      }
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

  const handleRecruitTypeToggle = (type: "one" | "multiple") => {
    if (recruitType === type) {
      setRecruitType("")
      setRecruitCount("")
    } else {
      setRecruitType(type)
      if (type === "one") {
        setRecruitCount("1")
      }
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
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files)])
    }
  }

  // ✅ API 연동된 handleSubmit
  const handleSubmit = async () => {
    console.log("🔍 캠페인 수정 시도")

    // 중복 제출 방지
    if (isSubmitting) {
      console.log("이미 제출 중...")
      return
    }

    // 필수 입력 검증
    if (!selectedCategory) {
      alert("카테고리를 선택해주세요.")
      return
    }
    if (!title.trim()) {
      alert("캠페인 제목을 입력해주세요.")
      return
    }
    if (!recruitType) {
      alert("모집 인원을 선택해주세요.")
      return
    }
    if (recruitType === "multiple" && !recruitCount) {
      alert("모집 인원 수를 입력해주세요.")
      return
    }
    if (!selectedRewardType) {
      alert("보상 방식을 선택해주세요.")
      return
    }

    // 새로 업로드한 파일 URL (실제로는 이미지 업로드 API 필요)
    const newPhotoUrls = uploadedFiles.map((file) => URL.createObjectURL(file))
    const allPhotos = [...existingPhotos, ...newPhotoUrls]

    // ✅ DB 스키마와 일치하는 데이터 구조
    const updateData = {
      title: title.trim(),
      category: selectedCategory,
      recruitType: recruitType,
      recruitCount: recruitType === "one" ? 1 : parseInt(recruitCount) || 1,
      visitType: visitType || "visit",
      rewardType: selectedRewardType,
      paymentAmount: selectedRewardType === "payment" ? paymentAmount : null,
      productName: selectedRewardType === "product" ? productName : null,
      otherReward: selectedRewardType === "other" ? otherReward : null,
      additionalRewardInfo: additionalRewardInfo || null,
      isDealPossible: isDealPossible,
      negotiationOption: paymentBudgetType === "negotiable" ? "yes" : "no",
      contentType: selectedContentType || null,
      videoDuration: selectedVideoDuration || customVideoDuration || null,
      requiredContent: requiredContent || null,
      requiredScenes: requiredScenes || null,
      hashtags: hashtagTags,
      linkUrl: linkUrl || null,
      additionalMemo: additionalMemo || null,
      uploadedPhotos: allPhotos,
      thumbnail: allPhotos.length > 0 ? allPhotos[0] : null,
    }

    try {
      setIsSubmitting(true)
      console.log("📤 API 호출 - 캠페인 수정:", updateData)

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("❌ 수정 실패:", result)
        alert(result.error || "캠페인 수정에 실패했습니다.")
        return
      }

      console.log("✅ 캠페인 수정 성공:", result)
      alert("캠페인이 성공적으로 수정되었습니다!")
      router.push(`/campaigns/${campaignId}`)
    } catch (error) {
      console.error("❌ 캠페인 수정 오류:", error)
      alert("수정 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-500">캠페인을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
            <span className="text-base text-gray-600">캠페인 수정</span>
          </Button>
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
        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#7b68ee] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Title */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">캠페인 제목</h2>
          <Input
            placeholder="예) 신상 화장품 체험단 모집"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Recruitment Info */}
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
                recruitType === "multiple"
                  ? "border-[#7b68ee] bg-[#7b68ee]/5"
                  : "border-gray-200 hover:border-gray-300"
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
                visitType === "non-visit"
                  ? "border-[#7b68ee] bg-[#7b68ee]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">배송형</div>
              <div className="text-xs text-gray-500 mt-1">제품 수령 후 체험</div>
            </button>
          </div>
        </div>

        {/* Reward Type */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">보상 방식</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleRewardTypeToggle("payment")}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                selectedRewardType === "payment"
                  ? "border-[#7b68ee] bg-[#7b68ee]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">현금 지급</div>
            </button>
            {selectedRewardType === "payment" && (
              <div className="ml-4 space-y-3">
                <button
                  onClick={() => handlePaymentBudgetTypeToggle("fixed")}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                    paymentBudgetType === "fixed"
                      ? "border-[#7b68ee] bg-[#7b68ee]/5"
                      : "border-gray-200 hover:border-gray-300"
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
                selectedRewardType === "product"
                  ? "border-[#7b68ee] bg-[#7b68ee]/5"
                  : "border-gray-200 hover:border-gray-300"
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
                selectedRewardType === "other"
                  ? "border-[#7b68ee] bg-[#7b68ee]/5"
                  : "border-gray-200 hover:border-gray-300"
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
                  selectedContentType === type
                    ? "bg-[#7b68ee] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                    selectedVideoDuration === duration
                      ? "bg-[#7b68ee] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {duration}
                </button>
              ))}
              <button
                onClick={handleCustomVideoToggle}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  showCustomVideoInput
                    ? "bg-[#7b68ee] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            className="w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Hashtags */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">해시태그</h2>
          <div className="border border-gray-300 rounded-lg p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtagTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#7b68ee]/10 text-[#7b68ee] rounded-full text-sm"
                >
                  {tag}
                  <button onClick={() => removeHashtagTag(tag)} className="hover:bg-[#7b68ee]/20 rounded-full p-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={hashtagTags.length === 0 ? "#해시태그 입력 (스페이스바 또는 엔터로 추가)" : ""}
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

        {/* Photos */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">사진 업로드</h2>
          <div className="flex flex-wrap gap-2">
            {/* 기존 사진 */}
            {existingPhotos.map((photo, index) => (
              <div key={`existing-${index}`} className="relative">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={photo || "/placeholder.svg"} alt={`기존 사진 ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => setExistingPhotos(existingPhotos.filter((_, i) => i !== index))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {/* 새로 업로드한 사진 */}
            {uploadedFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative">
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

        {/* Link */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">링크 업로드</h2>
          <Input
            placeholder="관련 링크 URL을 입력하세요"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Additional Memo */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">추가 메모</h2>
          <Textarea
            placeholder="추가로 전달하고 싶은 내용이 있다면 자유롭게 작성해주세요."
            value={additionalMemo}
            onChange={(e) => setAdditionalMemo(e.target.value)}
            rows={4}
            className="w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "수정 중..." : "수정하기"}
        </Button>
      </div>
    </div>
  )
}