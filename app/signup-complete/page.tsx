"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function SignupCompletePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      const type = (session.user as any).userType
      setUserType(type)
    }
  }, [session])

  const handleStart = () => {
    // 역할별 대시보드로 이동
    if (userType === 'INFLUENCER') {
      router.push('/influencer/dashboard')
    } else if (userType === 'ADVERTISER') {
      router.push('/advertiser/dashboard')
    } else {
      router.push('/campaigns')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* 체크 아이콘 */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#7b68ee]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-[#7b68ee]" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-black">
            가입이 완료되었습니다! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            {userType === 'INFLUENCER' 
              ? '이제 다양한 캠페인에 지원하고 브랜드와 협업할 수 있어요.'
              : userType === 'ADVERTISER'
              ? '이제 캠페인을 만들고 인플루언서를 찾아볼 수 있어요.'
              : '잇다에서 인플루언서와 광고주를 연결해보세요.'}
          </p>
        </div>

        {/* 시작 버튼 */}
        <div className="space-y-3">
          <Button
            onClick={handleStart}
            className="w-full bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold py-6 rounded-2xl text-lg"
          >
            시작하기
          </Button>
          
          <p className="text-sm text-gray-500">
            언제든지 설정에서 회원 정보를 수정할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}