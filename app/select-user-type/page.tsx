"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, Megaphone } from "lucide-react"

export default function SelectUserTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"INFLUENCER" | "ADVERTISER" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedType) {
      alert("회원 유형을 선택해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/update-user-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: selectedType }),
      })

      const data = await response.json()

      if (response.ok) {
        // localStorage에도 저장 (기존 코드와의 호환성)
        localStorage.setItem('influencer_mode', selectedType === 'INFLUENCER' ? 'true' : 'false')
        
        // ✅ 가입 완료 페이지로 리다이렉트
        router.push('/signup-complete')
      } else {
        alert(data.error || '회원 유형 저장에 실패했습니다.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('회원 유형 저장 오류:', error)
      alert('오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">환영합니다! 🎉</h1>
          <p className="text-gray-600">
            잇다를 어떻게 사용하실 건가요?
          </p>
        </div>

        <div className="space-y-4">
          {/* 인플루언서 카드 */}
          <button
            onClick={() => setSelectedType("INFLUENCER")}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
              selectedType === "INFLUENCER"
                ? "border-[#7b68ee] bg-[#7b68ee]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedType === "INFLUENCER" ? "bg-[#7b68ee]" : "bg-gray-100"
              }`}>
                <Users className={`w-6 h-6 ${
                  selectedType === "INFLUENCER" ? "text-white" : "text-gray-600"
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">인플루언서</h3>
                <p className="text-sm text-gray-600">
                  캠페인에 지원하고 브랜드와 협업하세요
                </p>
              </div>
            </div>
          </button>

          {/* 광고주 카드 */}
          <button
            onClick={() => setSelectedType("ADVERTISER")}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
              selectedType === "ADVERTISER"
                ? "border-[#7b68ee] bg-[#7b68ee]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedType === "ADVERTISER" ? "bg-[#7b68ee]" : "bg-gray-100"
              }`}>
                <Megaphone className={`w-6 h-6 ${
                  selectedType === "ADVERTISER" ? "text-white" : "text-gray-600"
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">광고주</h3>
                <p className="text-sm text-gray-600">
                  캠페인을 만들고 인플루언서를 찾아보세요
                </p>
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedType || isLoading}
          className="w-full bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold py-6 rounded-2xl text-lg"
        >
          {isLoading ? "저장 중..." : "시작하기"}
        </Button>
      </div>
    </div>
  )
}