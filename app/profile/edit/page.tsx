"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { TopHeader } from "@/components/top-header"
import { Input } from "@/components/ui/input"
import { calculateInfluencerProgress, calculateAdvertiserProgress } from '@/lib/profile-utils'
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
  const [placeSearchQuery, setPlaceSearchQuery] = useState("")
  const [placeSearchResults, setPlaceSearchResults] = useState<Array<{
    name: string
    address: string
    roadAddress: string
    x: string
    y: string
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isPlaceSelected, setIsPlaceSelected] = useState(false)
  const [businessNum1, setBusinessNum1] = useState("") // 3 digits
  const [businessNum2, setBusinessNum2] = useState("") // 2 digits
  const [businessNum3, setBusinessNum3] = useState("") // 5 digits
  const [businessNumberStatus, setBusinessNumberStatus] = useState<"idle" | "success" | "error">("idle")
  
  // Common fields
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
  // DB에서 프로필 데이터 불러오기
  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success && data.profile) {
        const profile = data.profile
        
        console.log('✅ DB에서 프로필 불러오기 성공:', profile)
        
        // 프로필 이미지 & 위치
        if (profile.image) {
          setAvatar(profile.image)
          setPhotoPreview(profile.image)
          setSavedImagePosition({ 
            x: profile.image_position_x || 0, 
            y: profile.image_position_y || 0 
          })
          setSavedImageScale(profile.image_scale || 1.0)
        }
        
        // 회원 유형 확인
        const influencerMode = profile.user_type === 'INFLUENCER'
        setIsInfluencerMode(influencerMode)
        console.log('[v0] Profile Edit Page - Mode:', influencerMode ? '인플루언서 모드' : '광고주 모드')
        
        if (influencerMode) {
          // 인플루언서 필드
          if (profile.category) setCategory(profile.category)
          if (profile.instagram_username) setInstagramId(profile.instagram_username)
          if (profile.instagram_verification_status) {
            setInstagramVerificationStatus(profile.instagram_verification_status as 'idle' | 'pending' | 'verified')
          }
          if (profile.bio) setBio(profile.bio)
          if (profile.activity_rate) setActivityRate(profile.activity_rate)
          if (profile.activity_rate_private !== null) {
            setIsActivityRatePrivate(profile.activity_rate_private)
          }
          if (profile.broad_region) setBroadRegion(profile.broad_region)
          if (profile.narrow_region) setNarrowRegion(profile.narrow_region)
          if (profile.career) setCareer(profile.career)
          if (profile.profile_hashtags && Array.isArray(profile.profile_hashtags)) {
            setProfileHashtags(profile.profile_hashtags)
          }
        } else {
          // 광고주 필드
          if (profile.brand_category) setBrandCategory(profile.brand_category)
          if (profile.store_type) setStoreType(profile.store_type)
          if (profile.brand_name) setBrandName(profile.brand_name)
          if (profile.brand_link) setBrandLink(profile.brand_link)
          
          // 사업자번호 분리 (123-45-67890 → 123, 45, 67890)
          if (profile.business_number) {
            const parts = profile.business_number.split('-')
            if (parts.length === 3) {
              setBusinessNum1(parts[0])
              setBusinessNum2(parts[1])
              setBusinessNum3(parts[2])
            }
          }
          
          if (profile.offline_location) setOfflineLocation(profile.offline_location)
          if (profile.broad_region) setBroadRegion(profile.broad_region)
          if (profile.narrow_region) setNarrowRegion(profile.narrow_region)
          if (profile.online_domain) setOnlineDomain(profile.online_domain)
        }
      } else {
        console.log('ℹ️ 저장된 프로필 없음 - 새 프로필 작성')
      }
    } catch (error) {
      console.error('❌ 프로필 불러오기 오류:', error)
      alert('프로필을 불러오는 중 오류가 발생했습니다.')
    }
  }
  
  loadProfile()
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
  // 네이버 장소 검색 (디바운싱 적용)
useEffect(() => {
  if (!placeSearchQuery.trim()) {
    setPlaceSearchResults([])
    setShowSearchResults(false)
    return
  }

  // 선택된 상태면 검색하지 않음!
  if (isPlaceSelected) {
    return
  }

  const timer = setTimeout(async () => {
    await searchNaverPlaces(placeSearchQuery)
  }, 300)

  return () => clearTimeout(timer)
}, [placeSearchQuery, isPlaceSelected])

const searchNaverPlaces = async (query: string) => {
  if (!query.trim()) return

  setIsSearching(true)
  
  try {
    const response = await fetch(`/api/naver-place-search?query=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (data.items) {
      const formattedResults = data.items.map((item: any) => ({
        name: item.title.replace(/<[^>]*>/g, ''),
        address: item.address,
        roadAddress: item.roadAddress || item.address,
        x: item.mapx,
        y: item.mapy
      }))
      
      setPlaceSearchResults(formattedResults)
      setShowSearchResults(true)
    }
  } catch (error) {
    console.error('장소 검색 오류:', error)
    setPlaceSearchResults([])
  } finally {
    setIsSearching(false)
  }
}

const handleSelectPlace = (place: { name: string; address: string; roadAddress: string }) => {
  // 1️⃣ 먼저 선택 완료 표시! (순서 중요)
  setIsPlaceSelected(true)
  
  // 2️⃣ 드롭다운 닫기
  setShowSearchResults(false)
  
  // 3️⃣ 값 설정 (이제 useEffect가 실행되어도 검색 안 함!)
  setOfflineLocation(`${place.name} - ${place.roadAddress || place.address}`)
  setPlaceSearchQuery(place.name)
}

const handleSearchBlur = () => {
  setTimeout(() => {
    setShowSearchResults(false)
  }, 200)
}

const handlePlaceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value
  setPlaceSearchQuery(newValue)
  
  // 수정 시작하면 선택 상태 해제
  if (isPlaceSelected) {
    setIsPlaceSelected(false)
  }
}

const handleClearPlace = () => {
  setOfflineLocation("")
  setPlaceSearchQuery("")
  setIsPlaceSelected(false)
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
    setPlaceSearchQuery("")
    setIsPlaceSelected(false) // 추가
  } else {
    setStoreType(storeTypeId)
    if (storeTypeId === "offline") {
      setOnlineDomain("")
      setBrandName("") // 추가: 오프라인 선택 시 브랜드 이름 초기화
    } else if (storeTypeId === "online") {
      setOfflineLocation("")
      setPlaceSearchQuery("") // 추가: 온라인 선택 시 검색어 초기화
      setIsPlaceSelected(false) // 추가
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

  // app/profile/edit/page.tsx 파일에 추가할 handleInstagramVerify 함수

const handleInstagramVerify = async () => {
  if (!instagramId.trim()) {
    alert('인스타그램 아이디를 입력해주세요.');
    return;
  }

  try {
    // 1단계: Business Discovery API로 계정 정보 가져오기
    setInstagramVerificationStatus('pending');

    const response = await fetch('/api/instagram/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instagramUsername: instagramId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.code === 'NOT_FOUND') {
        alert('해당 인스타그램 계정을 찾을 수 없습니다.\n비즈니스 계정인지 확인해주세요.');
      } else {
        alert(result.error || '인증에 실패했습니다. 다시 시도해주세요.');
      }
      setInstagramVerificationStatus('idle');
      return;
    }

    // 2단계: Instagram 정보 저장 + 팔로우 대기 상태로 설정
    if (result.success) {
      const { data } = result;
      
      // localStorage에 Instagram 정보 저장
      localStorage.setItem('influencer_instagram_id', instagramId);
      localStorage.setItem('influencer_instagram_verification_status', 'pending');
      localStorage.setItem('influencer_instagram_verification_requested_at', new Date().toISOString());
      localStorage.setItem('influencer_instagram_data', JSON.stringify({
        username: data.username,
        name: data.name,
        profilePicture: data.profilePicture,
        followersCount: data.followersCount,
        followsCount: data.followsCount,
        mediaCount: data.mediaCount,
        biography: data.biography,
        engagementRate: data.engagementRate,
        verifiedAt: new Date().toISOString(),
      }));

      // 상태 업데이트 - 팔로우 대기 상태
      setInstagramVerificationStatus('pending');
    }

  } catch (error) {
    console.error('Instagram verification error:', error);
    alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    setInstagramVerificationStatus('idle');
  }
};

 const handleSave = async () => {
  try {
    console.log('💾 프로필 저장 시작...')
    
    // 저장할 데이터 구성
    const profileData: any = {
      user_type: isInfluencerMode ? 'INFLUENCER' : 'ADVERTISER',
    }
    
    // 프로필 이미지
    if (photoPreview) {
      profileData.image = photoPreview
      profileData.image_position_x = savedImagePosition.x
      profileData.image_position_y = savedImagePosition.y
      profileData.image_scale = savedImageScale
    }
    
    if (isInfluencerMode) {
      // 인플루언서 데이터
      profileData.category = category
      profileData.instagram_username = instagramId
      profileData.bio = bio
      profileData.activity_rate = activityRate
      profileData.activity_rate_private = isActivityRatePrivate
      profileData.broad_region = broadRegion
      profileData.narrow_region = narrowRegion
      profileData.career = career
      profileData.profile_hashtags = profileHashtags
      
      console.log('📊 인플루언서 데이터:', profileData)
    } else {
      // 광고주 데이터
      profileData.brand_category = brandCategory
      profileData.store_type = storeType
      profileData.brand_name = brandName
      profileData.brand_link = brandLink
      
      // 사업자번호 합치기
      if (businessNum1 && businessNum2 && businessNum3) {
        profileData.business_number = `${businessNum1}-${businessNum2}-${businessNum3}`
      }
      
      profileData.offline_location = offlineLocation
      profileData.broad_region = broadRegion
      profileData.narrow_region = narrowRegion
      profileData.online_domain = onlineDomain
      
      console.log('📊 광고주 데이터:', profileData)
    }
    
    // DB에 저장
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ 프로필 저장 성공')
      
      // ✅ 광고주 프로필 완성도 체크
      if (!isInfluencerMode) {
        const completion = calculateAdvertiserProgress(profileData)  // ✅ profileData 전달!
        if (completion === 100) {
          alert('🎉 프로필이 100% 완성되었습니다!\n이제 캠페인을 작성할 수 있습니다.')
        } else {
          alert('프로필이 저장되었습니다.')
        }
      } else {
        alert('프로필이 저장되었습니다.')
      }
      
      router.back()
    } else {
      console.error('❌ 저장 실패:', data.error)
      alert(data.error || '프로필 저장에 실패했습니다.')
    }
    
  } catch (error) {
    console.error('❌ 프로필 저장 오류:', error)
    alert('프로필을 저장하는 중 오류가 발생했습니다.')
  }
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

  const handleBusinessNumberLookup = async () => {
    if (businessNum1.length === 3 && businessNum2.length === 2 && businessNum3.length === 5) {
      const businessNumber = `${businessNum1}${businessNum2}${businessNum3}`
      
      try {
        setBusinessNumberStatus("idle")
        
        // 홈택스 API 호출
        const response = await fetch('/api/hometax-business-lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ businessNumber }),
        })
        
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setBusinessNumberStatus("success")
        } else {
          setBusinessNumberStatus("error")
        }
      } catch (error) {
        console.error('사업자등록번호 조회 오류:', error)
        setBusinessNumberStatus("error")
      }
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
  // ADVERTISER MODE UI
// ✅ 현재 입력값으로 프로필 객체 생성
const getCurrentAdvertiserProfile = () => ({
  brand_category: brandCategory,
  store_type: storeType,
  brand_name: brandName,
  brand_link: brandLink,
  business_number: businessNum1 && businessNum2 && businessNum3 
    ? `${businessNum1}-${businessNum2}-${businessNum3}` 
    : '',
  offline_location: offlineLocation,
})

const progressPercentage = calculateAdvertiserProgress(getCurrentAdvertiserProfile())

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

          {/* 매장찾기 - 오프라인 또는 둘다 선택 시에만 표시 */}
{(storeType === "offline" || storeType === "both") && (
  <div className="space-y-2">
    <Label htmlFor="place-search" className="text-sm font-medium text-gray-700">
      매장 찾기 <span className="text-gray-400 text-xs font-normal">(필수)</span>
    </Label>
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          id="place-search"
          value={placeSearchQuery}
          onChange={handlePlaceSearchChange}
          onBlur={handleSearchBlur}
          className="h-12 pl-10 rounded-xl border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee]"
          placeholder="매장 이름 또는 주소를 검색하세요"
        />
      </div>
      
      {/* 검색 결과 드롭다운 */}
      {showSearchResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block w-5 h-5 border-2 border-[#7b68ee] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">검색 중...</span>
            </div>
          ) : placeSearchResults.length > 0 ? (
            <div className="py-2">
              {placeSearchResults.map((place, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{place.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {place.roadAddress || place.address}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
    
    {/* 선택된 매장 위치 표시 */}
    {offlineLocation && (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">선택된 매장</div>
            <div className="text-sm text-gray-900">{offlineLocation}</div>
          </div>
          <button
            type="button"
            onClick={handleClearPlace}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </div>
)}

{/* 브랜드 이름 - 온라인 또는 둘다 선택 시에만 표시 */}
{(storeType === "online" || storeType === "both") && (
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
)}

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
 // INFLUENCER MODE UI
// ✅ 현재 입력값으로 프로필 객체 생성
const getCurrentInfluencerProfile = () => ({
  image: photoPreview,
  category,
  bio,
  instagram_verification_status: instagramVerificationStatus,
  broad_region: broadRegion,
  narrow_region: narrowRegion,
  activity_rate: activityRate,
  profile_hashtags: profileHashtags,
})

const influencerProgressPercentage = calculateInfluencerProgress(getCurrentInfluencerProfile())

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
      disabled={instagramVerificationStatus === 'pending' || instagramVerificationStatus === 'verified'}
    />
    <button
      type="button"
      onClick={handleInstagramVerify}
      className={`px-4 h-12 rounded-xl font-medium transition-colors whitespace-nowrap ${
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

  {/* 인증 대기중 상태 - Business Discovery 정보 표시 + 팔로우 안내 */}
  {instagramVerificationStatus === "pending" && (() => {
    // localStorage에서 Instagram 정보 가져오기
    const instagramDataStr = localStorage.getItem('influencer_instagram_data');
    const instagramData = instagramDataStr ? JSON.parse(instagramDataStr) : null;

    return (
      <div className="mt-3 space-y-3">
        {/* 계정 정보 확인됨 */}
        {instagramData && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                   계정 정보 확인 완료!
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• 팔로워: <span className="font-semibold">{instagramData.followersCount.toLocaleString()}명</span></p>
                  <p>• 게시물: <span className="font-semibold">{instagramData.mediaCount}개</span></p>
                  <p>• 예상 참여율: <span className="font-semibold">{instagramData.engagementRate}%</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 팔로우 안내 */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                마지막 단계! 본인 인증만 하면 끝이에요 👇
              </p>
              
              <div className="space-y-3 text-sm">
                {/* Step 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-600 border-2 border-purple-200">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2">
                      <span className="font-semibold">@itda_korea</span> 팔로우하기
                    </p>
                    <a
                      href="https://www.instagram.com/itda_korea"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      인스타그램에서 팔로우하기
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-600 border-2 border-purple-200">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <span className="font-semibold">12시간 이내</span> 승인 완료
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      빠르면 몇 분 안에 승인돼요!
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-600 border-2 border-purple-200">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      승인 후 팔로우 <span className="font-semibold">취소 가능</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      본인 인증용이라 나중에 언팔해도 괜찮아요 
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100">
                <p className="text-xs text-gray-500">
                  💡 팔로우 확인 후 빠르게 승인해드릴게요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })()}

  {/* 인증 완료 상태 */}
  {instagramVerificationStatus === "verified" && (() => {
    const instagramDataStr = localStorage.getItem('influencer_instagram_data');
    const instagramData = instagramDataStr ? JSON.parse(instagramDataStr) : null;

    return (
      <div className="mt-3 p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 mb-1">
              인증 완료! 🎉
            </p>
            {instagramData && (
              <p className="text-sm text-green-700 mb-2">
                팔로워 {instagramData.followersCount.toLocaleString()}명 · 참여율 {instagramData.engagementRate}%
              </p>
            )}
            <p className="text-sm text-green-700">
              이제 모든 기능을 자유롭게 사용하실 수 있어요
            </p>
          </div>
        </div>
      </div>
    );
  })()}
</div>

        <div className="space-y-2">
  <Label htmlFor="career" className="text-base font-semibold text-gray-700">
    나의 활동 이력
  </Label>
  <p className="text-sm text-gray-500">
    어떤 콘텐츠로 활동해왔는지 자유롭게 적어주세요!
  </p>
  <textarea
    id="career"
    value={career}
    onChange={(e) => setCareer(e.target.value)}
    className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#7b68ee] focus:ring-[#7b68ee] resize-none"
    placeholder="예시:

맛집 탐방 3년차 / 지역 맛집 리뷰 전문 / 릴스가능"
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