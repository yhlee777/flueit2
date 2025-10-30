"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

export function AdminRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 로딩 중이거나 이미 관리자 페이지에 있으면 무시
    if (status === "loading" || pathname.startsWith("/admin")) {
      return
    }

    // 로그인했고 관리자이면 관리자 페이지로
    if (session?.user?.is_admin) {
      console.log("✅ 관리자 계정 감지, 관리자 페이지로 이동")
      router.push("/admin/pending-users")
    }
  }, [session, status, pathname, router])

  return null
}