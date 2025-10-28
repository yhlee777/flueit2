"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCampaigns } from "@/lib/campaign-store"
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
  베이비·키즈: ["#육아", "#베이비용품", "#키즈패션", "#육아템", "#아기용품"],
  뷰티·화장품: ["#뷰티", "#화장품", "#스킨케어", "#메이크업", "#뷰티템"],
  패션·잡화: ["#패션", "#OOTD", "#스타일링", "#패션아이템", "#데일리룩"],
  푸드·외식: ["#맛집", "#음식", "#맛스타그램", "#푸드", "#외식"],
  간편식·배달: ["#간편식", "#배달음식", "#홈쿡", "#간단요리", "#배달"],
  리빙·인테리어: ["#인테리어", "#홈데코", "#리빙", "#홈스타일링", "#집꾸미기"],
  반려동물: ["#반려동물", "#펫", "#강아지", "#고양이", "#펫용품"],
  숙박·여행: ["#여행", "#숙박", "#호텔", "#펜션", "#여행스타그램"],
  헬스·피트니스: ["#헬스", "#운동", "#피트니스", "#다이어트", "#건강"],
  취미·여가: ["#취미", "#여가", "#문화", "#액티비티", "#체험"],
  테크·가전: ["#테크", "#가전", "#IT", "#디지털", "#전자제품"],
  기타: ["#추천", "#리뷰", "#체험", "#일상", "#라이프스타일"],
}

const contentTypes = ["릴스", "피드", "릴스+피드"]
const videoDurations = ["15초 이상", "30초 이상", "45초 이상"]

export default function CreateCampaignPage() {
  console.log("[v0] CreateCampaignPage component rendering")

  const router = useRouter()
  const { addCampaign } = useCampaigns()
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)
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
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomVideoInput, setShowCustomVideoInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([])

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    console.log("[v0] Campaign create - checking mode. influencer_mode value:", localStorage.getItem("influencer_mode"))
    console.log("[v0] Campaign create - isInfluencerMode:", influencerMode)
    setIsInfluencerMode(influencerMode)
  }, [])

  useEffect(() => {
    if (isInfluencerMode) {
      console.log("[v0] User is in influencer mode, redirecting...")
      alert("인플루언서는 캠페인을 작성할 수 없습니다.")
      router.push("/campaigns")
      return
    }
    console.log("[v0] User is in advertiser mode, showing create form")
  }, [router, isInfluencerMode])

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

  const handleHighlightToggle = (highlight: string) => {
    setSelectedHighlights((prev) =>
      prev.includes(highlight) ? prev.filter((h) => h !== highlight) : [...prev, highlight],
    )
  }

  const handleSubmit = () => {
    console.log("[v0] Campaign submit started")

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

    const finalRecruitCount = recruitType === "one" ? "1" : recruitCount

    const uploadedPhotoUrls = uploadedFiles.map((file) => URL.createObjectURL(file))

    const newCampaign: any = {
      title: title.trim(),
      category: selectedCategory,
      location: "서울시",
      reward: rewardString,
      thumbnail: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls[0] : "/campaign-image.jpg",
      description: additionalMemo,
      tags: [selectedCategory, selectedContentType].filter(Boolean),
      requirements: [
        selectedContentType && `${selectedContentType} 콘텐츠 제작`,
        selectedVideoDuration && `영상 길이 ${selectedVideoDuration}`,
        `모집 인원 ${finalRecruitCount}명`,
      ].filter(Boolean),
      images: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : ["/campaign-image.jpg"],
      recruitCount: finalRecruitCount,
      rewardType: selectedRewardType,
      contentType: selectedContentType,
      videoDuration: selectedVideoDuration || customVideoDuration,
      requiredContent,
      requiredScenes,
      hashtags: hashtagTags,
      linkUrl,
      additionalMemo,
      uploadedPhotos: uploadedPhotoUrls,
      isDealPossible,
    }

    if (selectedRewardType === "payment" && paymentAmount) {
      newCampaign.paymentAmount = paymentAmount
    }
    if (selectedRewardType === "product" && productName) {
      newCampaign.productName = productName
    }
    if (selectedRewardType === "other" && otherReward) {
      newCampaign.otherReward = otherReward
    }
    if (additionalRewardInfo) {
      newCampaign.additionalRewardInfo = additionalRewardInfo
    }
    if (visitType) {
      newCampaign.visitType = visitType
    }

    try {
      console.log("[v0] Adding campaign:", newCampaign)
      addCampaign(newCampaign)
      console.log("[v0] Campaign added successfully")
      alert("캠페인이 성공적으로 게시되었습니다!")
      router.push("/campaigns")
    } catch (error) {
      console.error("[v0] Campaign creation failed:", error)
      alert("게시에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const handleSaveDraft = () => {
    // TODO: Implement draft saving logic
    alert("임시저장 기능은 곧 추가될 예정입니다.")
  }

  const handleRecruitTypeToggle = (type: "one" | "multiple") => {
    if (recruitType === type) {
      setRecruitType("")
      setRecruitCount("")
    } else {
      setRecruitType(type)
      if (type === "one") {
        setRecruitCount("")
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

  return (
    <div className="min-h-screen bg-white">
      {isInfluencerMode ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">리다이렉트 중...</p>
        </div>
      ) : (
        <>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <main className="px-4 py-6 space-y-8 pb-32">
            {/* Category */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                캠페인 카테고리 <span className="text-sm text-gray-500 font-normal">(필수)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                      selectedCategory === category
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-base font-semibold text-gray-900">캠페인 제목</h2>
                <p className="text-xs text-gray-500">최대 노출 18자</p>
              </div>
              <Textarea
                placeholder="예) 잇다카페 멋있게 홍보릴스 올려주실 인플루언서분~"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                rows={2}
                className="w-full resize-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{ minHeight: "60px" }}
                maxLength={50}
              />
            </div>

            {/* Recruit Count */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">모집 인원</h2>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleRecruitTypeToggle("one")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                    recruitType === "one"
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>1명</span>
                </button>
                <button
                  onClick={() => handleRecruitTypeToggle("multiple")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                    recruitType === "multiple"
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>1명 이상</span>
                </button>
              </div>

              {recruitType === "multiple" && (
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="숫자를 입력하세요"
                    value={recruitCount}
                    onChange={(e) => setRecruitCount(e.target.value)}
                    className="w-full h-12 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="2"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">명</span>
                </div>
              )}
            </div>

            {/* Visit Type */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">캠페인 유형</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleVisitTypeToggle("visit")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                    visitType === "visit"
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>방문형 캠페인</span>
                </button>
                <button
                  onClick={() => handleVisitTypeToggle("non-visit")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                    visitType === "non-visit"
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>비방문형 캠페인</span>
                </button>
              </div>
              {visitType === "visit" && (
                <p className="mt-3 text-sm text-gray-600">
                  인플루언서가 직접 매장·현장을 방문해 제품과 서비스를 체험하고 콘텐츠를 제작하는 캠페인이에요.
                </p>
              )}
              {visitType === "non-visit" && (
                <p className="mt-3 text-sm text-gray-600">
                  인플루언서가 매장 방문 없이, 제품을 배송받아 직접 사용해 보고 콘텐츠를 제작하는 캠페인이에요.
                </p>
              )}
            </div>

            {/* Reward */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                제공 내역 <span className="text-sm text-gray-500 font-normal">(필수)</span>
              </h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleRewardTypeToggle("payment")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                      selectedRewardType === "payment"
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect
                        x="1"
                        y="4"
                        width="22"
                        height="16"
                        rx="2"
                        ry="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                      <line
                        x1="1"
                        y1="10"
                        x2="23"
                        y2="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <span>대금 지급</span>
                  </button>
                  <button
                    onClick={() => handleRewardTypeToggle("product")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                      selectedRewardType === "product"
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v10H4V12" />
                      <rect
                        x="2"
                        y="7"
                        width="20"
                        height="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                      <line
                        x1="12"
                        y1="22"
                        x2="12"
                        y2="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                      />
                    </svg>
                    <span>제품 제공</span>
                  </button>
                  <button
                    onClick={() => handleRewardTypeToggle("other")}
                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                      selectedRewardType === "other"
                        ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    기타
                  </button>
                </div>

                {selectedRewardType === "payment" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePaymentBudgetTypeToggle("fixed")}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                          paymentBudgetType === "fixed"
                            ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        생각한 금액이 있어요
                      </button>
                      <button
                        onClick={() => handlePaymentBudgetTypeToggle("negotiable")}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                          paymentBudgetType === "negotiable"
                            ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        금액을 안정했어요
                      </button>
                    </div>

                    {paymentBudgetType === "fixed" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder="금액을 입력하세요"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full h-10 pr-12 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              만원
                            </span>
                          </div>
                          <button
                            onClick={() => setIsDealPossible(!isDealPossible)}
                            className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition-colors ${
                              isDealPossible
                                ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            딜 가능
                          </button>
                        </div>
                        {isDealPossible && (
                          <p className="text-xs text-gray-500">
                            "딜 가능" 버튼은 광고주와 보상 조건이나 진행 방식에 대해 협의할 수 있음을 의미합니다. 클릭
                            시 인플루언서에게 '딜 가능' 상태가 표시됩니다.
                          </p>
                        )}
                      </div>
                    )}

                    {paymentBudgetType === "negotiable" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-3 py-2 rounded-full text-sm border bg-[#7b68ee] text-white border-[#7b68ee] cursor-default"
                          disabled
                        >
                          인플루언서와 직접 협의할게요.
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedRewardType === "product" && (
                  <Input
                    placeholder="제공할 제품명을 입력하세요"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                )}

                {selectedRewardType === "other" && (
                  <Input
                    placeholder="기타 보상 내용을 입력하세요"
                    value={otherReward}
                    onChange={(e) => setOtherReward(e.target.value)}
                    className="w-full h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                )}

                {selectedRewardType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      추가 입력 사항 <span className="text-xs text-gray-500 font-normal">(선택)</span>
                    </h3>
                    <Textarea
                      placeholder="제공 내역에 대한 추가 설명이나 조건을 입력하세요"
                      value={additionalRewardInfo}
                      onChange={(e) => setAdditionalRewardInfo(e.target.value)}
                      rows={3}
                      className="w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Details */}
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">콘텐츠 유형</h3>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleContentTypeToggle(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${
                        selectedContentType === type
                          ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(selectedContentType === "릴스" || selectedContentType === "릴스+피드") && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">릴스 길이</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {videoDurations.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleVideoDurationToggle(duration)}
                        className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                          selectedVideoDuration === duration
                            ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                    <button
                      onClick={handleCustomVideoToggle}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        showCustomVideoInput
                          ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      직접 입력
                    </button>
                  </div>
                  {showCustomVideoInput && (
                    <Input
                      placeholder="직접 입력 (예: 60초 이상)"
                      value={customVideoDuration}
                      onChange={(e) => {
                        setCustomVideoDuration(e.target.value)
                        setSelectedVideoDuration(e.target.value)
                      }}
                      className="w-full h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">📝 콘텐츠에 포함할 내용</h3>
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    💡 인플루언서가 콘텐츠에 반드시 포함해야 할 내용을 구체적으로 작성해주세요. (예: 매장명, 특정
                    메뉴명, 브랜드 로고, 제품 특징 등)
                  </p>
                </div>
                <Textarea
                  placeholder="예) 매장명, 메뉴명, 브랜드명 등"
                  value={requiredContent}
                  onChange={(e) => setRequiredContent(e.target.value)}
                  rows={4}
                  className="w-full resize-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "100px" }}
                />
              </div>

              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">🎬 촬영 시 포함할 장면</h3>
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    📸 콘텐츠에 꼭 담겨야 할 장면이나 상황을 설명해주세요. (예: 제품 언박싱, 사용 전후 비교, 만족스러운
                    표정, 특정 각도 촬영 등)
                  </p>
                </div>
                <Textarea
                  placeholder="예) 제품 언박싱 장면, 사용 전후 비교, 만족스러운 표정 등"
                  value={requiredScenes}
                  onChange={(e) => setRequiredScenes(e.target.value)}
                  rows={4}
                  className="w-full resize-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "100px" }}
                />
              </div>

              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">해시태그</h3>
                {selectedCategory && categoryHashtags[selectedCategory as keyof typeof categoryHashtags] && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categoryHashtags[selectedCategory as keyof typeof categoryHashtags].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addHashtagTag(tag)}
                        className="px-4 py-2 rounded-full text-sm bg-gray-100 text-blue-600 hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="border border-gray-300 rounded-lg p-3 min-h-[40px] flex flex-wrap gap-2 items-center focus-within:border-[#7b68ee] focus-within:ring-1 focus-within:ring-[#7b68ee] transition-colors">
                  {" "}
                  {/* Updated brand color */}
                  {hashtagTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm border border-blue-200"
                    >
                      {tag}
                      <button onClick={() => removeHashtagTag(tag)} className="text-blue-400 hover:text-blue-600 ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={hashtagTags.length === 0 ? "#성수맛집 #감성카페 #데이트코스" : ""}
                    value={hashtagInput}
                    onChange={handleHashtagInputChange}
                    onKeyDown={handleHashtagKeyDown}
                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                  />
                </div>
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
                  className="w-full h-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="flex-1 h-12 text-gray-700 font-medium border-gray-300 bg-transparent"
            >
              임시저장
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-medium"
            >
              게시하기
            </Button>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
        </>
      )}
    </div>
  )
}
