"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"  // ✅ 추가
import { InfluencerBottomNavigation } from "./influencer-bottom-navigation"
import { AdvertiserBottomNavigation } from "./advertiser-bottom-navigation"

export function ConditionalBottomNavigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()  // ✅ 추가
  const [isInfluencerMode, setIsInfluencerMode] = useState(false)

  useEffect(() => {
    const influencerMode = localStorage.getItem("influencer_mode") === "true"
    setIsInfluencerMode(influencerMode)
  }, [pathname])

  const isCampaignDetailPage = /^\/campaigns\/\d+$/.test(pathname)
  const isInfluencerDetailPage = /^\/influencers\/\d+$/.test(pathname)
  const isChatDetailPage = /^\/chat\/\d+$/.test(pathname)
  const isLandingPage = pathname === "/"
  const isSignupPage = pathname.startsWith("/signup/")
  const isLoginPage = pathname === "/login"
  const isProfileEditPage = pathname === "/profile/edit"
  const isCampaignCreatePage = pathname === "/campaigns/create"
  const isCampaignEditPage = /^\/campaigns\/\d+\/edit$/.test(pathname)

  // ✅ 세션으로 로그인 상태 확인
  const isLoggedIn = status === "authenticated" && !!session?.user

  const shouldShow =
    isLoggedIn &&
    !isCampaignDetailPage &&
    !isInfluencerDetailPage &&
    !isChatDetailPage &&
    !isLandingPage &&
    !isSignupPage &&
    !isLoginPage &&
    !isProfileEditPage &&
    !isCampaignCreatePage &&
    !isCampaignEditPage

  console.log('🔍 하단바 조건:', {
    isLoggedIn,
    status,
    pathname,
    shouldShow,
    isInfluencerMode,
  })

  if (!shouldShow) {
    return null
  }

  return isInfluencerMode ? <InfluencerBottomNavigation /> : <AdvertiserBottomNavigation />
}