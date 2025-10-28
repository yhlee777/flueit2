"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function UserTypeChecker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMigrating, setIsMigrating] = useState(false)

  useEffect(() => {
    // 로딩 중이거나 로그인하지 않은 경우 무시
    if (status === "loading" || status === "unauthenticated") {
      return
    }

    // 이미 선택 페이지에 있으면 무시
    if (pathname === "/select-user-type") {
      return
    }

    // 로그인/회원가입 페이지에서는 무시
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      return
    }

    // 마이그레이션 중이면 무시
    if (isMigrating) {
      return
    }

    // 로그인했지만 user_type이 없는 경우
    if (session?.user && !session.user.userType) {
      console.log("🔍 user_type이 없습니다. localStorage 확인 중...")
      
      // localStorage에서 influencer_mode 확인
      const influencerMode = localStorage.getItem("influencer_mode")
      
      if (influencerMode !== null) {
        // localStorage에 값이 있으면 DB로 마이그레이션
        console.log("🔄 localStorage에서 user_type 마이그레이션 시작:", influencerMode)
        setIsMigrating(true)
        
        fetch('/api/auth/migrate-user-type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ influencerMode }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              console.log("✅ 마이그레이션 완료! 페이지 새로고침...")
              // 세션을 다시 불러오기 위해 새로고침
              window.location.reload()
            } else {
              console.error("❌ 마이그레이션 실패:", data.error)
              setIsMigrating(false)
              router.push("/select-user-type")
            }
          })
          .catch(error => {
            console.error("❌ 마이그레이션 오류:", error)
            setIsMigrating(false)
            router.push("/select-user-type")
          })
      } else {
        // localStorage에도 없으면 선택 페이지로
        console.log("❌ localStorage에도 없습니다. 선택 페이지로 이동합니다.")
        router.push("/select-user-type")
      }
    } else if (session?.user?.userType) {
      // user_type이 있으면 localStorage와 동기화
      const userType = session.user.userType
      const shouldBeInfluencer = userType === 'INFLUENCER'
      localStorage.setItem('influencer_mode', shouldBeInfluencer.toString())
      console.log("✅ user_type 확인:", userType)
    }
  }, [session, status, pathname, router, isMigrating])

  // 마이그레이션 중일 때 로딩 표시
  if (isMigrating) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-600">회원 정보를 동기화하는 중...</p>
        </div>
      </div>
    )
  }

  return null
}