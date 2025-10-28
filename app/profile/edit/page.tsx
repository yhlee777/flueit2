"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { TopHeader } from "@/components/top-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Camera, X, Check, Search, CheckCircle2, Circle, Eye, ChevronLeft, MapPin, Lock, Instagram } from "lucide-react"

const CONTENT_CATEGORIES = [
  "뷰티·화장품",
  "패션·스타일",
  "푸드·맛집",
  "여행·숙박",
  "라이프스타일",
  "육아·키즈",
  "반려동물",
  "헬스·피트니스",
  "게임·테크",
  "일상·브이로그",
  "기타",
]

const BRAND_CATEGORIES = [
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

const STORE_TYPES = [
  { id: "offline", label: "오프라인" },
  { id: "online", label: "온라인" },
  { id: "both", label: "둘 다" },
]

const REGIONS: { [key: string]: string[] } = {
  서울시: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  경기도: [
    "수원시",
    "성남시",
    "고양시",
    "용인시",
    "부천시",
    "안산시",
    "안양시",
    "남양주시",
    "화성시",
    "평택시",
    "의정부시",
    "시흥시",
    "파주시",
    "김포시",
    "광명시",
    "광주시",
    "군포시",
    "하남시",
    "오산시",
    "양주시",
    "이천시",
    "구리시",
    "안성시",
    "포천시",
    "의왕시",
    "여주시",
    "양평군",
    "동두천시",
    "과천시",
    "가평군",
    "연천군",
  ],
  경상북도: [
    "포항시",
    "경주시",
    "김천시",
    "안동시",
    "구미시",
    "영주시",
    "영천시",
    "상주시",
    "문경시",
    "경산시",
    "군위군",
    "의성군",
    "청송군",
    "영양군",
    "영덕군",
    "청도군",
    "고령군",
    "성주군",
    "칠곡군",
    "예천군",
    "봉화군",
    "울진군",
    "울릉군",
  ],
  경상남도: [
    "창원시",
    "진주시",
    "통영시",
    "사천시",
    "김해시",
    "밀양시",
    "거제시",
    "양산시",
    "의령군",
    "함안군",
    "창녕군",
    "고성군",
    "남해군",
    "하동군",
    "산청군",
    "함양군",
    "거창군",
    "합천군",
  ],
  전라북도: [
    "전주시",
    "군산시",
    "익산시",
    "정읍시",
    "남원시",
    "김제시",
    "완주군",
    "진안군",
    "무주군",
    "장수군",
    "임실군",
    "순창군",
    "고창군",
    "부안군",
  ],
  전라남도: [
    "목포시",
    "여수시",
    "순천시",
    "나주시",
    "광양시",
    "담양군",
    "곡성군",
    "구례군",
    "고흥군",
    "보성군",
    "화순군",
    "장흥군",
    "강진군",
    "해남군",
    "영암군",
    "무안군",
    "함평군",
    "영광군",
    "장성군",
    "완도군",
    "진도군",
    "신안군",
  ],
  충청북도: [
    "청주시",
    "충주시",
    "제천시",
    "보은군",
    "옥천군",
    "영동군",
    "증평군",
    "진천군",
    "괴산군",
    "음성군",
    "단양군",
  ],
  충청남도: [
    "천안시",
    "공주시",
    "보령시",
    "아산시",
    "서산시",
    "논산시",
    "계룡시",
    "당진시",
    "금산군",
    "부여군",
    "서천군",
    "청양군",
    "홍성군",
    "예산군",
    "태안군",
  ],
  강원도: [
    "춘천시",
    "원주시",
    "강릉시",
    "동해시",
    "태백시",
    "속초시",
    "삼척시",
    "홍천군",
    "횡성군",
    "영월군",
    "평창군",
    "정선군",
    "철원군",
    "화천군",
    "양구군",
    "인제군",
    "고성군",
    "양양군",
  ],
  제주도: ["제주시", "서귀포시"],
}

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)
  const imageAdjustRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const businessNum1Ref = useRef<HTMLInputElement>(null)
  const businessNum2Ref = useRef<HTMLInputElement>(null)
  const businessNum3Ref = useRef<HTMLInputElement>(null)

  const [isInfluencerMode, setIsInfluencerMode] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewActiveTab, setPreviewActiveTab] = useState("소개")

  const [avatar, setAvatar] = useState("/placeholder.svg?height=400&width=400")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [portfolioFiles, setPortfolioFiles] = useState<{ url: string; type: string }[]>([])

  const [isAdjustingImage, setIsAdjustingImage] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1.0)
  const [savedImagePosition, setSavedImagePosition] = useState({ x: 0, y: 0 })
  const [savedImageScale, setSavedImageScale] = useState(1.0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState(1.0)
  const [isAvatarChangePopupOpen, setIsAvatarChangePopupOpen] = useState(false)

  // Influencer-specific fields
  const [category, setCategory] = useState("")
  const [instagramId, setInstagramId] = useState("")
  const [isInstagramVerified, setIsInstagramVerified] = useState(false)
  const [instagramVerificationStatus, setInstagramVerificationStatus] = useState<"idle" | "pending" | "verified">(
    "idle",
  )
  const [bio, setBio] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [activityRate, setActivityRate] = useState("")
  const [isActivityRatePrivate, setIsActivityRatePrivate] = useState(false)
  const [broadRegion, setBroadRegion] = useState("")
  const [narrowRegion, setNarrowRegion] = useState("")
  const [career, setCareer] = useState("")
  const [profileHashtags, setProfileHashtags] = useState<string[]>([])
  const [profileHashtagInput, setProfileHashtagInput] = useState("")

  // Advertiser-specific fields
  const [brandCategory, setBrandCategory] = useState("")
  const [storeType, setStoreType] = useState("")
  const [onlineDomain, setOnlineDomain] = useState("")
  const [offlineLocation, setOfflineLocation] = useState("")
  const [brandName, setBrandName] = useState("")
  const [brandLink, setBrandLink] = useState("") // Added brandLink state
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")

  const [businessNum1, setBusinessNum1] = useState("") // 3 digits
  const [businessNum2, setBusinessNum2] = useState("") // 2 digits
  const [businessNum3, setBusinessNum3] = useState("") // 5 digits
  const [businessNumberStatus, setBusinessNumberStatus] = useState<"idle" | "success" | "error">("idle")

  // Common fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const keysToRemove = [
      "user_avatar",
      "user_avatar_position_x",
      "user_avatar_position_y",
      "user_avatar_scale",
      "username",
      "user_email",
      "user_phone",
      "influencer_category",
      "influencer_instagram_id",
      "influencer_is_instagram_verified",
      "influencer_instagram_verification_status",
      "influencer_bio",
      "influencer_activity_rate",
      "influencer_activity_rate_private",
      "influencer_broad_region",
      "influencer_narrow_region",
      "influencer_career",
      "influencer_profile_hashtags",
      "advertiser_brand_category",
      "advertiser_store_type",
      "advertiser_brand_name",
      "advertiser_brand_link",
      "advertiser_business_num1",
      "advertiser_business_num2",
      "advertiser_business_num3",
      "advertiser_offline_location",
      "advertiser_broad_region",
      "advertiser_narrow_region",
      "advertiser_online_domain",
      "advertiser_website",
      "advertiser_location",
      "advertiser_company_description",
    ]

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)
    console.log("[v0] Profile Edit Page - Mode:", influencerMode ? "인플루언서 모드" : "광고주 모드")

    // Load saved avatar and its position/scale
    const savedAvatar = localStorage.getItem("user_avatar")
    const savedPosX = localStorage.getItem("user_avatar_position_x")
    const savedPosY = localStorage.getItem("user_avatar_position_y")
    const savedScale = localStorage.getItem("user_avatar_scale")

    if (savedAvatar) {
      setAvatar(savedAvatar)
      setPhotoPreview(savedAvatar) // Also set preview to show it's saved
    }
    if (savedPosX && savedPosY && savedScale) {
      setSavedImagePosition({ x: Number.parseFloat(savedPosX), y: Number.parseFloat(savedPosY) })
      setSavedImageScale(Number.parseFloat(savedScale))
    }

    if (influencerMode) {
      const savedCategory = localStorage.getItem("influencer_category")
      const savedInstagramId = localStorage.getItem("influencer_instagram_id")
      const savedIsInstagramVerified = localStorage.getItem("influencer_is_instagram_verified")
      const savedInstagramVerificationStatus = localStorage.getItem("influencer_instagram_verification_status")
      const savedBio = localStorage.getItem("influencer_bio")
      const savedActivityRate = localStorage.getItem("influencer_activity_rate")
      const savedActivityRatePrivacy = localStorage.getItem("influencer_activity_rate_private")
      const savedBroadRegion = localStorage.getItem("influencer_broad_region")
      const savedNarrowRegion = localStorage.getItem("influencer_narrow_region")
      const savedCareer = localStorage.getItem("influencer_career")
      const savedProfileHashtags = localStorage.getItem("influencer_profile_hashtags")

      if (savedCategory) setCategory(savedCategory)
      if (savedInstagramId) setInstagramId(savedInstagramId)
      if (savedIsInstagramVerified) setIsInstagramVerified(savedIsInstagramVerified === "true")
      if (savedInstagramVerificationStatus) {
        setInstagramVerificationStatus(savedInstagramVerificationStatus as "idle" | "pending" | "verified")
      }
      if (savedBio) setBio(savedBio)
      if (savedActivityRate) setActivityRate(savedActivityRate)
      if (savedActivityRatePrivacy) setIsActivityRatePrivate(savedActivityRatePrivacy === "true")
      if (savedBroadRegion) setBroadRegion(savedBroadRegion)
      if (savedNarrowRegion) setNarrowRegion(savedNarrowRegion)
      if (savedCareer) setCareer(savedCareer)
      if (savedProfileHashtags) setProfileHashtags(JSON.parse(savedProfileHashtags))
    }

    if (!influencerMode) {
      const savedBrandCategory = localStorage.getItem("advertiser_brand_category")
      const savedStoreType = localStorage.getItem("advertiser_store_type")
      const savedBrandName = localStorage.getItem("advertiser_brand_name")
      const savedBrandLink = localStorage.getItem("advertiser_brand_link") // Load brand link
      const savedBusinessNum1 = localStorage.getItem("advertiser_business_num1")
      const savedBusinessNum2 = localStorage.getItem("advertiser_business_num2")
      const savedBusinessNum3 = localStorage.getItem("advertiser_business_num3")
      const savedOfflineLocation = localStorage.getItem("advertiser_offline_location")
      const savedBroadRegion = localStorage.getItem("advertiser_broad_region")
      const savedNarrowRegion = localStorage.getItem("advertiser_narrow_region")

      if (savedBrandCategory) setBrandCategory(savedBrandCategory)
      if (savedStoreType) setStoreType(savedStoreType)
      if (savedBrandName) setBrandName(savedBrandName)
      if (savedBrandLink) setBrandLink(savedBrandLink) // Set brand link
      if (savedBusinessNum1) setBusinessNum1(savedBusinessNum1)
      if (savedBusinessNum2) setBusinessNum2(savedBusinessNum2)
      if (savedBusinessNum3) setBusinessNum3(savedBusinessNum3)
      if (savedOfflineLocation) setOfflineLocation(savedOfflineLocation)
      if (savedBroadRegion) setBroadRegion(savedBroadRegion)
      if (savedNarrowRegion) setNarrowRegion(savedNarrowRegion)
    }
  }, [])

  useEffect(() => {
    if (isInfluencerMode) {
      localStorage.setItem("influencer_activity_rate_private", isActivityRatePrivate.toString())
      localStorage.setItem("influencer_profile_hashtags", JSON.stringify(profileHashtags))
    } else {
      localStorage.setItem("advertiser_brand_category", brandCategory)
      localStorage.setItem("advertiser_store_type", storeType)
      localStorage.setItem("advertiser_brand_name", brandName)
      localStorage.setItem("advertiser_brand_link", brandLink) // Save brand link
      localStorage.setItem("advertiser_business_num1", businessNum1)
      localStorage.setItem("advertiser_business_num2", businessNum2)
      localStorage.setItem("advertiser_business_num3", businessNum3)
      localStorage.setItem("advertiser_offline_location", offlineLocation)
      localStorage.setItem("advertiser_broad_region", broadRegion)
      localStorage.setItem("advertiser_narrow_region", narrowRegion)
    }
  }, [
    isInfluencerMode,
    isActivityRatePrivate,
    profileHashtags,
    brandCategory,
    storeType,
    brandName,
    brandLink, // Include brandLink in dependencies
    businessNum1,
    businessNum2,
    businessNum3,
    offlineLocation,
    broadRegion,
    narrowRegion,
  ])

  const calculateInfluencerProgress = () => {
    let filledFields = 0
    const totalFields = 8 // Total important fields for influencer

    // Profile photo
    if (photoPreview) filledFields += 1

    // Category
    if (category && category.trim() !== "") filledFields += 1

    // Instagram ID (verified)
    if (instagramId && instagramId.trim() !== "" && isInstagramVerified) filledFields += 1

    // Instagram URL
    // Removed check for instagramUrl

    // Bio
    if (bio && bio.trim() !== "") filledFields += 1

    // Activity rate
    if (activityRate && activityRate.trim() !== "") filledFields += 1

    if (broadRegion && broadRegion.trim() !== "") {
      if (broadRegion === "전체") {
        // If broad region is "전체", count as complete without narrow region
        filledFields += 1
      } else if (narrowRegion && narrowRegion.trim() !== "") {
        // Otherwise, require both broad and narrow region
        filledFields += 1
      }
    }

    // Hashtags
    if (profileHashtags.length > 0) filledFields += 1

    return Math.round((filledFields / totalFields) * 100)
  }

  const calculateAdvertiserProgress = () => {
    let filledFields = 0
    let totalFields = 0

    const businessNumberComplete = businessNum1.length === 3 && businessNum2.length === 2 && businessNum3.length === 5

    // Required fields: brandCategory, storeType, brandName, brandLink
    const requiredFields = [brandCategory, storeType, brandName, brandLink]

    totalFields += requiredFields.length + 1 // +1 for business number
    filledFields += requiredFields.filter((field) => field && field.trim() !== "").length
    if (businessNumberComplete) filledFields += 1

    // Conditional required field: offlineLocation (only if offline or both)
    if (storeType === "offline" || storeType === "both") {
      totalFields += 1
      if (offlineLocation && offlineLocation.trim() !== "") filledFields += 1
    }

    // Conditional required field: broadRegion and narrowRegion (if storeType is not online)
    if (storeType === "offline" || storeType === "both") {
      totalFields += 2
      if (broadRegion && broadRegion.trim() !== "") filledFields += 1
      if (narrowRegion && narrowRegion.trim() !== "") filledFields += 1
    }

    return Math.round((filledFields / totalFields) * 100)
  }

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(category === selectedCategory ? "" : selectedCategory)
  }

  const handleSelectBrandCategory = (selectedCategory: string) => {
    setBrandCategory(brandCategory === selectedCategory ? "" : selectedCategory)
  }

  const handleSelectStoreType = (storeTypeId: string) => {
    if (storeType === storeTypeId) {
      setStoreType("")
      setOnlineDomain("")
      setOfflineLocation("")
    } else {
      setStoreType(storeTypeId)
      if (storeTypeId === "offline") {
        setOnlineDomain("")
      } else if (storeTypeId === "online") {
        setOfflineLocation("")
      }
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string)
        setImagePosition({ x: 0, y: 0 })
        setImageScale(1.0)
        setIsAdjustingImage(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setAvatar("/placeholder.svg?height=400&width=400")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Reset saved position and scale when photo is removed
    setSavedImagePosition({ x: 0, y: 0 })
    setSavedImageScale(1.0)
    // Also clear from localStorage
    localStorage.removeItem("user_avatar")
    localStorage.removeItem("user_avatar_position_x")
    localStorage.removeItem("user_avatar_position_y")
    localStorage.removeItem("user_avatar_scale")
  }

  const handleChangeToDefaultImage = () => {
    setPhotoPreview(null)
    setAvatar("/placeholder.svg?height=400&width=400")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setSavedImagePosition({ x: 0, y: 0 })
    setSavedImageScale(1.0)
    localStorage.removeItem("user_avatar")
    localStorage.removeItem("user_avatar_position_x")
    localStorage.removeItem("user_avatar_position_y")
    localStorage.removeItem("user_avatar_scale")
    setIsAvatarChangePopupOpen(false)
  }

  const handleChangeProfilePicture = () => {
    setIsAvatarChangePopupOpen(false)
    fileInputRef.current?.click()
  }

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles: { url: string; type: string }[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newFiles.push({
            url: reader.result as string,
            type: file.type.startsWith("video") ? "video" : "image",
          })
          if (newFiles.length === files.length) {
            setPortfolioFiles((prev) => [...prev, ...newFiles])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemovePortfolioFile = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInstagramVerify = () => {
    if (instagramId.trim()) {
      setInstagramVerificationStatus("pending")
      localStorage.setItem("influencer_instagram_verification_status", "pending")
    }
  }

  const handleSave = () => {
    if (photoPreview) {
      localStorage.setItem("user_avatar", photoPreview)
      localStorage.setItem("user_avatar_position_x", savedImagePosition.x.toString())
      localStorage.setItem("user_avatar_position_y", savedImagePosition.y.toString())
      localStorage.setItem("user_avatar_scale", savedImageScale.toString())
    }
    // Advertisers save common fields here too
    localStorage.setItem("username", username)
    localStorage.setItem("user_email", email)
    localStorage.setItem("user_phone", phone)

    if (isInfluencerMode) {
      localStorage.setItem("influencer_activity_rate_private", isActivityRatePrivate.toString())
      localStorage.setItem("influencer_profile_hashtags", JSON.stringify(profileHashtags))
      localStorage.setItem("influencer_category", category)
      localStorage.setItem("influencer_instagram_id", instagramId)
      localStorage.setItem("influencer_is_instagram_verified", isInstagramVerified.toString())
      localStorage.setItem("influencer_instagram_verification_status", instagramVerificationStatus)
      localStorage.setItem("influencer_bio", bio)
      localStorage.setItem("influencer_activity_rate", activityRate)
      localStorage.setItem("influencer_broad_region", broadRegion)
      localStorage.setItem("influencer_narrow_region", narrowRegion)
      localStorage.setItem("influencer_career", career)
    } else {
      localStorage.setItem("advertiser_brand_category", brandCategory)
      localStorage.setItem("advertiser_store_type", storeType)
      localStorage.setItem("advertiser_brand_name", brandName)
      localStorage.setItem("advertiser_brand_link", brandLink) // Save brand link
      localStorage.setItem("advertiser_business_num1", businessNum1)
      localStorage.setItem("advertiser_business_num2", businessNum2)
      localStorage.setItem("advertiser_business_num3", businessNum3)
      localStorage.setItem("advertiser_offline_location", offlineLocation)
      localStorage.setItem("advertiser_broad_region", broadRegion)
      localStorage.setItem("advertiser_narrow_region", narrowRegion)
      localStorage.setItem("advertiser_online_domain", onlineDomain)
      localStorage.setItem("advertiser_website", website)
      localStorage.setItem("advertiser_location", location)
      localStorage.setItem("advertiser_company_description", companyDescription)
    }

    router.back()
  }

  const handleCancel = () => {
    router.back()
  }

  const handleBusinessNum1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 3)
    setBusinessNum1(value)
    if (value.length === 3) {
      businessNum2Ref.current?.focus()
    }
  }

  const handleBusinessNum2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 2)
    setBusinessNum2(value)
    if (value.length === 2) {
      businessNum3Ref.current?.focus()
    }
  }

  const handleBusinessNum3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 5)
    setBusinessNum3(value)
  }

  const handleBusinessNumberLookup = () => {
    if (businessNum1.length === 3 && businessNum2.length === 2 && businessNum3.length === 5) {
      // Simulate lookup - in real app, this would call an API
      const isValid = Math.random() > 0.3 // 70% success rate for demo
      setBusinessNumberStatus(isValid ? "success" : "error")
    } else {
      setBusinessNumberStatus("error")
    }
  }

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const handleBroadRegionChange = (value: string) => {
    setBroadRegion(value)
    setNarrowRegion("") // Reset narrow region when broad region changes
  }

  const activityRegion = broadRegion && narrowRegion ? `${broadRegion} ${narrowRegion}` : broadRegion || ""

  const getCategoryTags = (category: string) => {
    const categoryMap: { [key: string]: string[] } = {
      뷰티·화장품: ["뷰티", "메이크업", "스킨케어"],
      패션·스타일: ["패션", "스타일링", "OOTD"],
      푸드·맛집: ["맛집", "요리", "레시피"],
      여행·숙박: ["여행", "맛집", "관광"],
      라이프스타일: ["라이프스타일", "일상", "브이로그"],
      육아·키즈: ["육아", "베이비", "맘스타그램"],
      반려동물: ["반려동물", "펫스타그램", "케어"],
      헬스·피트니스: ["헬스", "운동", "다이어트"],
      게임·테크: ["테크", "리뷰", "가젯"],
      일상·브이로그: ["일상", "브이로그", "데일리"],
      기타: ["라이프스타일", "일상", "콘텐츠"],
    }
    return categoryMap[category] || ["라이프스타일", "일상", "콘텐츠"]
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture started
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      setInitialPinchDistance(distance)
      setInitialScale(imageScale)
      setIsDragging(false)
    } else if (e.touches.length === 1) {
      // Single finger drag
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      // Pinch gesture in progress
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
      const scale = (currentDistance / initialPinchDistance) * initialScale
      // Clamp scale between 0.5 and 3.0
      setImageScale(Math.max(0.5, Math.min(3.0, scale)))
    } else if (e.touches.length === 1 && isDragging) {
      // Single finger drag
      const touch = e.touches[0]
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setInitialPinchDistance(null)
  }

  const handleSaveImagePosition = () => {
    if (tempImageUrl) {
      console.log("[v0] Saving image position:", imagePosition)
      console.log("[v0] Saving image scale:", imageScale)

      setPhotoPreview(tempImageUrl)
      setAvatar(tempImageUrl)
      setSavedImagePosition(imagePosition)
      setSavedImageScale(imageScale)

      console.log("[v0] Saved position:", imagePosition)
      console.log("[v0] Saved scale:", imageScale)

      setIsAdjustingImage(false)
      setTempImageUrl(null)
    }
  }

  const handleCancelImageAdjustment = () => {
    setIsAdjustingImage(false)
    setTempImageUrl(null)
    setImagePosition({ x: 0, y: 0 })
    setImageScale(1.0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProfileHashtagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Check if the input ends with a space
    if (value.endsWith(" ")) {
      const trimmedValue = value.trim()
      if (trimmedValue) {
        const tag = trimmedValue.startsWith("#") ? trimmedValue : `#${trimmedValue}`
        if (!profileHashtags.includes(tag)) {
          setProfileHashtags([...profileHashtags, tag])
        }
        setProfileHashtagInput("")
      } else {
        setProfileHashtagInput("")
      }
    } else {
      setProfileHashtagInput(value)
    }
  }

  const handleProfileHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = profileHashtagInput.trim()
      if (value) {
        const tag = value.startsWith("#") ? value : `#${value}`
        if (!profileHashtags.includes(tag)) {
          setProfileHashtags([...profileHashtags, tag])
        }
        setProfileHashtagInput("")
      }
    } else if (e.key === "Backspace" && profileHashtagInput === "" && profileHashtags.length > 0) {
      setProfileHashtags(profileHashtags.slice(0, -1))
    }
  }

  const removeProfileHashtagTag = (tagToRemove: string) => {
    setProfileHashtags(profileHashtags.filter((tag) => tag !== tagToRemove))
  }

  // ADVERTISER MODE UI
  const progressPercentage = calculateAdvertiserProgress()
  if (!isInfluencerMode) {
    return (
      <div className="min-h-screen bg-white">
        <TopHeader title="프로필 수정" showSearch={false} showNotifications={false} showHeart={false} showBack={true} />

        <div className="fixed top-[var(--gnb-height)] left-0 right-0 w-full bg-gray-100 h-1 z-30">
          <div
            className="bg-[#7b68ee] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <main className="px-4 py-6 space-y-12 pb-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {photoPreview ? (
                <>
                  <div className="w-32 h-[102px] rounded-2xl overflow-hidden border-2 border-gray-200 relative">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Profile preview"
                      className="absolute object-cover"
                      style={{
                        transform: `translate(${savedImagePosition.x * 0.4}px, ${savedImagePosition.y * 0.4}px) scale(${savedImageScale})`,
                        transformOrigin: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-32 h-[102px] rounded-2xl overflow-hidden border-2 border-gray-200">
                  <img src={avatar || "/placeholder.svg"} alt={username} className="w-full h-full object-cover" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAvatarChangePopupOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#7b68ee] rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <p className="text-sm text-gray-500">프로필 사진 변경</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              브랜드 카테고리 <span className="text-gray-400 text-xs font-normal">(필수)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectBrandCategory(cat)}
                  className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                    brandCategory === cat
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              매장 유형 <span className="text-gray-400 text-xs font-normal">(필수)</span>
            </Label>
            <div className="flex gap-2">
              {STORE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectStoreType(type.id)}
                  className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                    storeType === type.id
                      ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {(storeType === "offline" || storeType === "both") && (
            <div className="space-y-2">
              <Label htmlFor="offline-location" className="text-sm font-medium text-gray-700">
                매장 위치 <span className="text-gray-400 text-xs font-normal">(필수)</span>
              </Label>
              <Input
                id="offline-location"
                value={offlineLocation}
                onChange={(e) => setOfflineLocation(e.target.value)}
                className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
                placeholder="예: 서울시 강남구"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brand-name" className="text-sm font-medium text-gray-700">
              브랜드 이름 <span className="text-gray-400 text-xs font-normal">(필수)</span>
            </Label>
            <Input
              id="brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
              placeholder="브랜드 이름을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="business-number-1" className="text-sm font-medium text-gray-700">
                사업자등록번호 <span className="text-gray-400 text-xs font-normal">(필수)</span>
              </Label>
              <button
                type="button"
                onClick={handleBusinessNumberLookup}
                className="px-3 py-1 rounded-lg bg-[#7b68ee] text-white text-sm font-medium hover:bg-[#6a5acd] transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                조회하기
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                ref={businessNum1Ref}
                id="business-number-1"
                value={businessNum1}
                onChange={handleBusinessNum1Change}
                className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] flex-1 text-center"
                placeholder="123"
                maxLength={3}
                inputMode="numeric"
              />
              <span className="text-gray-400">-</span>
              <Input
                ref={businessNum2Ref}
                id="business-number-2"
                value={businessNum2}
                onChange={handleBusinessNum2Change}
                className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] flex-1 text-center"
                placeholder="45"
                maxLength={2}
                inputMode="numeric"
              />
              <span className="text-gray-400">-</span>
              <Input
                ref={businessNum3Ref}
                id="business-number-3"
                value={businessNum3}
                onChange={handleBusinessNum3Change}
                className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] flex-[1.5] text-center"
                placeholder="67890"
                maxLength={5}
                inputMode="numeric"
              />
            </div>
            {businessNumberStatus === "success" && (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-600">사업자 번호가 확인됐어요.</p>
              </div>
            )}
            {businessNumberStatus === "error" && (
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-500">조회되지 않는 사업자 번호에요</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-link" className="text-sm font-medium text-gray-700">
              브랜드 링크 <span className="text-gray-400 text-xs font-normal">(선택)</span>
            </Label>
            <Input
              id="brand-link"
              value={brandLink}
              onChange={(e) => setBrandLink(e.target.value)}
              className="h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
              placeholder="브랜드 웹사이트 또는 SNS 링크"
            />
            <button
              type="button"
              onClick={handleSave}
              className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors mt-6 mb-0"
            >
              저장하기
            </button>
          </div>

          {(storeType === "offline" || storeType === "both") && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                활동 지역 <span className="text-gray-400 text-xs font-normal">(필수)</span>
              </Label>
              <div className="flex gap-2">
                <select
                  value={broadRegion}
                  onChange={(e) => handleBroadRegionChange(e.target.value)}
                  className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
                >
                  <option value="">시/도 선택</option>
                  <option value="전체">전체</option>
                  {Object.keys(REGIONS).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <select
                  value={narrowRegion}
                  onChange={(e) => setNarrowRegion(e.target.value)}
                  className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
                  disabled={!broadRegion || broadRegion === "전체"}
                >
                  <option value="">구/군 선택</option>
                  <option value="전체">전체</option>
                  {broadRegion &&
                    broadRegion !== "전체" &&
                    REGIONS[broadRegion]?.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </main>

        {/* Image Position Adjustment Dialog */}
        {isAdjustingImage && tempImageUrl && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">사진 위치 조정</h3>
                <button
                  type="button"
                  onClick={handleCancelImageAdjustment}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 p-4">
                <div
                  ref={containerRef}
                  className="relative w-full max-w-[400px] aspect-square flex items-center justify-center"
                >
                  <img
                    ref={imageAdjustRef}
                    src={tempImageUrl || "/placeholder.svg"}
                    alt="Adjust position"
                    className="max-w-full max-h-full object-contain cursor-move select-none"
                    style={{
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: "center",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    draggable={false}
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Top overlay */}
                    <div
                      className="absolute top-0 left-0 right-0 bg-black/50"
                      style={{ height: "calc(50% - 128px)" }}
                    />

                    {/* Bottom overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/50"
                      style={{ height: "calc(50% - 128px)" }}
                    />

                    {/* Left overlay */}
                    <div
                      className="absolute left-0 bg-black/50"
                      style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                    />

                    {/* Right overlay */}
                    <div
                      className="absolute right-0 bg-black/50"
                      style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                    />

                    {/* Crop frame border with brand color */}
                    <div className="w-[320px] h-[256px] border-2 border-[#7b68ee] rounded-lg relative z-10" />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSaveImagePosition}
                  className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors"
                >
                  완료
                </button>
              </div>
            </div>
          </div>
        )}

        {isAvatarChangePopupOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden">
              <div className="p-4">
                <button
                  type="button"
                  onClick={handleChangeToDefaultImage}
                  className="w-full py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  기본이미지로 변경
                </button>
                <div className="border-t border-gray-200 my-2" />
                <button
                  type="button"
                  onClick={handleChangeProfilePicture}
                  className="w-full py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  프로필 사진 변경하기
                </button>
                <div className="border-t border-gray-200 my-2" />
                <button
                  type="button"
                  onClick={() => setIsAvatarChangePopupOpen(false)}
                  className="w-full py-3 text-center text-gray-500 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // INFLUENCER MODE UI
  const influencerProgressPercentage = calculateInfluencerProgress()
  return (
    <div className="min-h-screen bg-white">
      <TopHeader
        title="프로필 수정"
        showSearch={false}
        showNotifications={false}
        showHeart={false}
        showBack={true}
        customAction={
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        }
      />

      <div className="fixed top-[var(--gnb-height)] left-0 right-0 w-full bg-gray-100 h-1 z-30">
        <div
          className="bg-[#7b68ee] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${influencerProgressPercentage}%` }}
        />
      </div>

      <main className="px-4 py-6 space-y-12 pb-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-32 h-[102px] rounded-2xl overflow-hidden border-2 border-gray-200 relative">
              <img
                src={photoPreview || avatar || "/placeholder.svg"}
                alt="Profile preview"
                className="absolute object-cover"
                style={{
                  transform: `translate(${savedImagePosition.x * 0.4}px, ${savedImagePosition.y * 0.4}px) scale(${savedImageScale})`,
                  transformOrigin: "center",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAvatarChangePopupOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#7b68ee] rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <p className="text-sm text-gray-500">프로필 사진 변경</p>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">콘텐츠 카테고리</Label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                  category === cat
                    ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram-id" className="text-base font-semibold text-gray-700">
            인스타그램 아이디
          </Label>
          <div className="flex gap-2">
            <Input
              id="instagram-id"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
              placeholder="@username"
            />
            <button
              type="button"
              onClick={handleInstagramVerify}
              className={`px-4 h-12 rounded-xl font-medium transition-colors ${
                instagramVerificationStatus === "pending" || instagramVerificationStatus === "verified"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#7b68ee] text-white hover:bg-[#6a5acd]"
              }`}
              disabled={instagramVerificationStatus === "pending" || instagramVerificationStatus === "verified"}
            >
              {instagramVerificationStatus === "verified"
                ? "인증완료"
                : instagramVerificationStatus === "pending"
                  ? "승인 대기중"
                  : "인증하기"}
            </button>
          </div>
          {instagramVerificationStatus === "pending" && (
            <p className="text-sm text-gray-500 mt-2">
              인플루언서님의 아이디 도용 방지를 위해 플루잇에서 확인중이에요.
              <br />
              승인 후에는 인증마크를 달아드리고, 자유롭게 활동할 수 있어요!
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-base font-semibold text-gray-700">
            인플루언서 소개글
          </Label>
          <p className="text-sm text-gray-500">인플루언서님을 광고주분들에게 마음껏 소개해요</p>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] resize-none"
            placeholder="자신을 소개하는 글을 작성해주세요"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="activity-rate" className="text-base font-semibold text-gray-700">
              활동 단가
            </Label>
            <button
              type="button"
              onClick={() => setIsActivityRatePrivate(!isActivityRatePrivate)}
              className="flex items-center gap-1 focus:outline-none"
            >
              {isActivityRatePrivate ? (
                <CheckCircle2 className="w-6 h-6 text-[#7b68ee]" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">비공개</span>
            </button>
          </div>
          <textarea
            id="activity-rate"
            value={activityRate}
            onChange={(e) => setActivityRate(e.target.value)}
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] resize-none"
            placeholder="릴스 1회당 가격, 게시물 1회당 가격, 패키지로 구성된 가격등 자유롭게 입력하세요."
          />
          {isActivityRatePrivate && (
            <p className="text-sm text-gray-500">더 이상 인플루언서님의 프로필에 단가가 공개되지 않아요.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">포트폴리오</Label>
          <div className="space-y-3">
            {portfolioFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {portfolioFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-32 aspect-[9/16] rounded-lg overflow-hidden bg-gray-100"
                  >
                    {file.type === "video" ? (
                      <video src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => portfolioInputRef.current?.click()}
              className="w-32 aspect-[9/16] rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#7b68ee] hover:text-[#7b68ee] transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm">파일 업로드</span>
            </button>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handlePortfolioUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">활동 지역</Label>
          <div className="flex gap-2">
            <select
              value={broadRegion}
              onChange={(e) => handleBroadRegionChange(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
            >
              <option value="">시/도 선택</option>
              <option value="전체">전체</option>
              {Object.keys(REGIONS).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select
              value={narrowRegion}
              onChange={(e) => setNarrowRegion(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
              disabled={!broadRegion || broadRegion === "전체"}
            >
              <option value="">구/군 선택</option>
              <option value="전체">전체</option>
              {broadRegion &&
                broadRegion !== "전체" &&
                REGIONS[broadRegion]?.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="profile-hashtags" className="text-base font-semibold text-gray-700">
              해시태그
            </Label>
            <span className="text-sm text-gray-400">(최대 3개)</span>
          </div>
          <p className="text-sm text-gray-500">인플루언서님이 자주 사용하는 해시태그를 입력해주세요.</p>
          <div className="border border-gray-300 rounded-xl p-3 min-h-[48px] flex flex-wrap gap-2 items-center focus-within:border-[#7b68ee] focus-within:ring-1 focus-within:ring-[#7b68ee] transition-colors">
            {profileHashtags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-sm border border-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeProfileHashtagTag(tag)}
                  className="text-blue-400 hover:text-blue-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="profile-hashtags"
              type="text"
              placeholder={profileHashtags.length === 0 ? "#뷰티 #메이크업 #스킨케어" : ""}
              value={profileHashtagInput}
              onChange={handleProfileHashtagInputChange}
              onKeyDown={handleProfileHashtagKeyDown}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors mb-6"
        >
          저장하기
        </button>
      </main>

      {/* Image Position Adjustment Dialog - Same as advertiser mode */}
      {isAdjustingImage && tempImageUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">사진 위치 조정</h3>
              <button type="button" onClick={handleCancelImageAdjustment} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 p-4">
              <div
                ref={containerRef}
                className="relative w-full max-w-[400px] aspect-square flex items-center justify-center"
              >
                <img
                  ref={imageAdjustRef}
                  src={tempImageUrl || "/placeholder.svg"}
                  alt="Adjust position"
                  className="max-w-full max-h-full object-contain cursor-move select-none"
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                    transformOrigin: "center",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  draggable={false}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Top overlay */}
                  <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: "calc(50% - 128px)" }} />

                  {/* Bottom overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-black/50"
                    style={{ height: "calc(50% - 128px)" }}
                  />

                  {/* Left overlay */}
                  <div
                    className="absolute left-0 bg-black/50"
                    style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                  />

                  {/* Right overlay */}
                  <div
                    className="absolute right-0 bg-black/50"
                    style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                  />

                  {/* Crop frame border with brand color */}
                  <div className="w-[320px] h-[256px] border-2 border-[#7b68ee] rounded-lg relative z-10" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveImagePosition}
                className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {isAvatarChangePopupOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden">
            <div className="p-4">
              <button
                type="button"
                onClick={handleChangeToDefaultImage}
                className="w-full py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
              >
                기본이미지로 변경
              </button>
              <div className="border-t border-gray-200 my-2" />
              <button
                type="button"
                onClick={handleChangeProfilePicture}
                className="w-full py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
              >
                프로필 사진 변경하기
              </button>
              <div className="border-t border-gray-200 my-2" />
              <button
                type="button"
                onClick={() => setIsAvatarChangePopupOpen(false)}
                className="w-full py-3 text-center text-gray-500 hover:bg-gray-50 transition-colors rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Preview Dialog - Full Screen Profile Detail
  // The preview dialog is already defined in the existing code and doesn't need further modification.
  return (
    <div className="min-h-screen bg-white">
      <TopHeader
        title="프로필 수정"
        showSearch={false}
        showNotifications={false}
        showHeart={false}
        showBack={true}
        customAction={
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        }
      />

      <div className="fixed top-[var(--gnb-height)] left-0 right-0 w-full bg-gray-100 h-1 z-30">
        <div
          className="bg-[#7b68ee] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${influencerProgressPercentage}%` }}
        />
      </div>

      <main className="px-4 py-6 space-y-12 pb-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-32 h-[102px] rounded-2xl overflow-hidden border-2 border-gray-200 relative">
              <img
                src={photoPreview || avatar || "/placeholder.svg"}
                alt="Profile preview"
                className="absolute object-cover"
                style={{
                  transform: `translate(${savedImagePosition.x * 0.4}px, ${savedImagePosition.y * 0.4}px) scale(${savedImageScale})`,
                  transformOrigin: "center",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAvatarChangePopupOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#7b68ee] rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <p className="text-sm text-gray-500">프로필 사진 변경</p>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">콘텐츠 카테고리</Label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                  category === cat
                    ? "bg-[#7b68ee] text-white border-[#7b68ee]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram-id" className="text-base font-semibold text-gray-700">
            인스타그램 아이디
          </Label>
          <div className="flex gap-2">
            <Input
              id="instagram-id"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
              placeholder="@username"
            />
            <button
              type="button"
              onClick={handleInstagramVerify}
              className={`px-4 h-12 rounded-xl font-medium transition-colors ${
                instagramVerificationStatus === "pending" || instagramVerificationStatus === "verified"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#7b68ee] text-white hover:bg-[#6a5acd]"
              }`}
              disabled={instagramVerificationStatus === "pending" || instagramVerificationStatus === "verified"}
            >
              {instagramVerificationStatus === "verified"
                ? "인증완료"
                : instagramVerificationStatus === "pending"
                  ? "승인 대기중"
                  : "인증하기"}
            </button>
          </div>
          {instagramVerificationStatus === "pending" && (
            <p className="text-sm text-gray-500 mt-2">
              인플루언서님의 아이디 도용 방지를 위해 플루잇에서 확인중이에요.
              <br />
              승인 후에는 인증마크를 달아드리고, 자유롭게 활동할 수 있어요!
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-base font-semibold text-gray-700">
            인플루언서 소개글
          </Label>
          <p className="text-sm text-gray-500">인플루언서님을 광고주분들에게 마음껏 소개해요</p>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] resize-none"
            placeholder="자신을 소개하는 글을 작성해주세요"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="activity-rate" className="text-base font-semibold text-gray-700">
              활동 단가
            </Label>
            <button
              type="button"
              onClick={() => setIsActivityRatePrivate(!isActivityRatePrivate)}
              className="flex items-center gap-1 focus:outline-none"
            >
              {isActivityRatePrivate ? (
                <CheckCircle2 className="w-6 h-6 text-[#7b68ee]" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">비공개</span>
            </button>
          </div>
          <textarea
            id="activity-rate"
            value={activityRate}
            onChange={(e) => setActivityRate(e.target.value)}
            className="w-full h-24 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] resize-none"
            placeholder="릴스 1회당 가격, 게시물 1회당 가격, 패키지로 구성된 가격등 자유롭게 입력하세요."
          />
          {isActivityRatePrivate && (
            <p className="text-sm text-gray-500">더 이상 인플루언서님의 프로필에 단가가 공개되지 않아요.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">포트폴리오</Label>
          <div className="space-y-3">
            {portfolioFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {portfolioFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-32 aspect-[9/16] rounded-lg overflow-hidden bg-gray-100"
                  >
                    {file.type === "video" ? (
                      <video src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => portfolioInputRef.current?.click()}
              className="w-32 aspect-[9/16] rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#7b68ee] hover:text-[#7b68ee] transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm">파일 업로드</span>
            </button>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handlePortfolioUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">활동 지역</Label>
          <div className="flex gap-2">
            <select
              value={broadRegion}
              onChange={(e) => handleBroadRegionChange(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
            >
              <option value="">시/도 선택</option>
              <option value="전체">전체</option>
              {Object.keys(REGIONS).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select
              value={narrowRegion}
              onChange={(e) => setNarrowRegion(e.target.value)}
              className="flex-1 h-12 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] px-3"
              disabled={!broadRegion || broadRegion === "전체"}
            >
              <option value="">구/군 선택</option>
              <option value="전체">전체</option>
              {broadRegion &&
                broadRegion !== "전체" &&
                REGIONS[broadRegion]?.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="profile-hashtags" className="text-base font-semibold text-gray-700">
              해시태그
            </Label>
            <span className="text-sm text-gray-400">(최대 3개)</span>
          </div>
          <p className="text-sm text-gray-500">인플루언서님이 자주 사용하는 해시태그를 입력해주세요.</p>
          <div className="border border-gray-300 rounded-xl p-3 min-h-[48px] flex flex-wrap gap-2 items-center focus-within:border-[#7b68ee] focus-within:ring-1 focus-within:ring-[#7b68ee] transition-colors">
            {profileHashtags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-sm border border-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeProfileHashtagTag(tag)}
                  className="text-blue-400 hover:text-blue-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="profile-hashtags"
              type="text"
              placeholder={profileHashtags.length === 0 ? "#뷰티 #메이크업 #스킨케어" : ""}
              value={profileHashtagInput}
              onChange={handleProfileHashtagInputChange}
              onKeyDown={handleProfileHashtagKeyDown}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors mb-6"
        >
          저장하기
        </button>
      </main>

      {/* Image Position Adjustment Dialog - Same as advertiser mode */}
      {isAdjustingImage && tempImageUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">사진 위치 조정</h3>
              <button type="button" onClick={handleCancelImageAdjustment} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 p-4">
              <div
                ref={containerRef}
                className="relative w-full max-w-[400px] aspect-square flex items-center justify-center"
              >
                <img
                  ref={imageAdjustRef}
                  src={tempImageUrl || "/placeholder.svg"}
                  alt="Adjust position"
                  className="max-w-full max-h-full object-contain cursor-move select-none"
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                    transformOrigin: "center",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  draggable={false}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Top overlay */}
                  <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: "calc(50% - 128px)" }} />

                  {/* Bottom overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-black/50"
                    style={{ height: "calc(50% - 128px)" }}
                  />

                  {/* Left overlay */}
                  <div
                    className="absolute left-0 bg-black/50"
                    style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                  />

                  {/* Right overlay */}
                  <div
                    className="absolute right-0 bg-black/50"
                    style={{ top: "calc(50% - 128px)", bottom: "calc(50% - 128px)", width: "calc(50% - 160px)" }}
                  />

                  {/* Crop frame border with brand color */}
                  <div className="w-[320px] h-[256px] border-2 border-[#7b68ee] rounded-lg relative z-10" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveImagePosition}
                className="w-full h-12 rounded-xl bg-[#7b68ee] text-white font-medium hover:bg-[#6a5acd] transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog - Full Screen Profile Detail */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div
              className="flex items-center justify-between h-full"
              style={{
                height: "var(--gnb-height)",
                paddingLeft: "var(--gnb-padding-x)",
                paddingRight: "var(--gnb-padding-x)",
              }}
            >
              <div className="flex items-center gap-2">
                <button onClick={() => setIsPreviewOpen(false)} className="flex items-center h-9 px-1">
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                  <span className="text-base text-gray-600">미리보기</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <main className="px-4 py-3 space-y-6 pb-20">
            {/* Profile Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200 relative">
                  <img
                    src={photoPreview || avatar || "/placeholder.svg"}
                    alt="Profile preview"
                    className="absolute object-cover"
                    style={{
                      transform: `translate(${savedImagePosition.x * 0.4}px, ${savedImagePosition.y * 0.4}px) scale(${savedImageScale})`,
                      transformOrigin: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>

                <div className="flex-1 space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-black">{username}</h2>
                    {isInstagramVerified && (
                      <div className="w-5 h-5 bg-[#7b68ee] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{activityRegion || "활동 지역 미설정"}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {getCategoryTags(category).map((tag, index) => (
                      <div key={index} className="px-2 py-0 bg-gray-100 rounded-md">
                        <span className="text-xs text-gray-600">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mt-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#7b68ee]">팔로워 수</div>
                    <div className="text-xl font-bold text-black">-</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#7b68ee]">게시물 수</div>
                    <div className="text-xl font-bold text-black">-</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#7b68ee]">평균 참여율</div>
                    <div className="text-xl font-bold text-black">-</div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#7b68ee]">평균 좋아요</div>
                    <div className="text-xl font-bold text-black">-</div>
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-2 mt-5">
                <p className="text-sm text-gray-600">{username}님이 자주 사용하는 해시태그에요.</p>
                <div className="flex gap-2 flex-wrap">
                  {profileHashtags.map((tag, index) => (
                    <div key={index} className="px-3 py-1 bg-blue-50 rounded-full">
                      <span className="text-sm text-blue-500">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instagram Link */}
            <div className="-mx-4 px-4">
              <div className="block mb-4">
                <button className="w-full h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Instagram className="w-5 h-5 text-[#E4405F]" />
                  <span className="font-medium text-gray-700">인스타그램 바로가기</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky z-40 bg-white -mx-4 px-4" style={{ top: "var(--gnb-height)" }}>
              <div className="relative border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setPreviewActiveTab("소개")}
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                      previewActiveTab === "소개" ? "text-black" : "text-gray-400"
                    }`}
                  >
                    소개
                  </button>
                  <button
                    onClick={() => setPreviewActiveTab("경력")}
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                      previewActiveTab === "경력" ? "text-black" : "text-gray-400"
                    }`}
                  >
                    경력
                  </button>
                </div>
                <div
                  className="absolute bottom-0 h-0.5 bg-[#7b68ee] transition-transform duration-300 ease-out"
                  style={{
                    width: "50%",
                    transform: previewActiveTab === "소개" ? "translateX(0)" : "translateX(100%)",
                  }}
                />
              </div>
            </div>

            {/* Tab Content */}
            {previewActiveTab === "소개" && (
              <div className="space-y-6">
                {/* Introduction */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-black">인플루언서 소개</h3>
                  <div className="rounded-2xl border border-gray-100 px-5 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{bio || "소개글이 작성되지 않았습니다."}</p>
                  </div>
                </div>

                {/* Portfolio */}
                {portfolioFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-black">포트폴리오</h3>
                    <div className="relative">
                      <div
                        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        {portfolioFiles.map((file, index) => (
                          <div key={index} className="rounded-2xl overflow-hidden aspect-[9/16] flex-shrink-0 w-32">
                            {file.type === "video" ? (
                              <video src={file.url} className="w-full h-full object-cover" />
                            ) : (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Price */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-black">활동 단가</h3>
                  <div className="rounded-2xl border border-gray-100 px-5 py-3">
                    {isActivityRatePrivate ? (
                      <div className="relative py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Lock className="w-8 h-8 text-gray-600 mb-2" />
                          <p className="text-sm text-gray-600 text-center px-4">
                            단가를 비공개로 설정하셨어요.
                            <br />
                            인플루언서님에게 직접 문의해주세요.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {activityRate || "활동 단가가 설정되지 않았습니다."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Region */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-black">활동 지역</h3>
                  <div className="flex gap-2 flex-wrap">
                    {activityRegion ? (
                      <div className="px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-sm text-gray-700">{activityRegion}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-100 rounded-full">
                        <span className="text-sm text-gray-700">활동 지역 미설정</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {previewActiveTab === "경력" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">경력 정보는 실제 프로필에서 확인할 수 있습니다.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
