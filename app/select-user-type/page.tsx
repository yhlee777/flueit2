"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, Megaphone } from "lucide-react"

export default function SelectUserTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"INFLUENCER" | "ADVERTISER" | null>(null)

  const handleSubmit = () => {
    if (!selectedType) {
      alert("회원 유형을 선택해주세요.")
      return
    }

    // 선택한 타입에 따라 회원가입 페이지로 이동
    if (selectedType === "INFLUENCER") {
      router.push('/signup/influencer')
    } else if (selectedType === "ADVERTISER") {
      router.push('/signup/advertiser')
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
          disabled={!selectedType}
          className="w-full bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold py-6 rounded-2xl text-lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}