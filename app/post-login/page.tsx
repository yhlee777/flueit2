// app/post-login/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function PostLogin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const u = session.user as any

  // ✅ DB 값 그대로 사용 (대/소문자 DB 규칙에 맞춤)
  // user_type: 'INFLUENCER' | 'ADVERTISER' (대문자)
  // approval_status: 'pending' | 'approved' (소문자)
  const isAdmin: boolean = !!u?.is_admin
  const userType: string | undefined = u?.userType
  const approval: string | undefined = u?.approval_status

  // 1) 관리자
  if (isAdmin) {
    redirect("/admin/pending-users")
  }

  // 2) 승인 대기
  if (approval === "pending") {
    redirect("/pending")
  }

  // 3) 역할 미설정 - select-user-type으로 이동
  if (!userType) {
    redirect("/select-user-type")
  }

  // 4) 역할별 대시보드 (DB 대문자 그대로 비교)
  if (userType === "ADVERTISER") {
    redirect("/advertiser/dashboard")
  }
  if (userType === "INFLUENCER") {
    redirect("/influencer/dashboard")
  }

  // 5) 기본
  redirect("/campaigns")
}