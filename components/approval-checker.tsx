"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

export function ApprovalChecker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showPendingMessage, setShowPendingMessage] = useState(false)

  useEffect(() => {
    // 로딩 중이거나 로그인하지 않은 경우 무시
    if (status === "loading" || status === "unauthenticated") {
      return
    }

    // 관리자 페이지, 로그인/회원가입 페이지는 무시
    const allowedPaths = [
      "/login",
      "/signup",
      "/select-user-type",
      "/api",
      "/admin", // 관리자는 접근 가능
    ]

    if (allowedPaths.some((path) => pathname.startsWith(path))) {
      return
    }

    // 승인 상태 확인
    if (session?.user) {
      const approvalStatus = (session.user as any).approval_status

      // pending 상태면 제한
      if (approvalStatus === "pending") {
        setShowPendingMessage(true)
      } else if (approvalStatus === "rejected") {
        alert("가입이 거절되었습니다. 자세한 내용은 고객센터에 문의해주세요.")
        router.push("/login")
      } else {
        setShowPendingMessage(false)
      }
    }
  }, [session, status, pathname, router])

  // 승인 대기 메시지 표시
  if (showPendingMessage) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">가입 승인 대기 중</h2>
            <p className="text-gray-600 mb-6">
              회원가입이 완료되었습니다!
              <br />
              관리자의 승인 후 서비스를 이용하실 수 있습니다.
            </p>
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>이메일:</strong> {session?.user?.email}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                승인은 보통 1-2 영업일 내에 완료됩니다.
                <br />
                승인 완료 시 이메일로 알림을 드립니다.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-[#7b68ee] text-white py-3 rounded-lg font-medium hover:bg-[#6a5acd] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}