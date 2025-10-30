"use client"

import { Button } from "@/components/ui/button"
import { Search, FileText, Zap, BarChart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AdvertiserOnboardingModal } from "@/components/advertiser-onboarding-modal"
import { InfluencerOnboardingModal } from "@/components/influencer-onboarding-modal"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"influencer" | "advertiser">("influencer")
  const [showAdvertiserOnboarding, setShowAdvertiserOnboarding] = useState(false)
  const [showInfluencerOnboarding, setShowInfluencerOnboarding] = useState(false)

  // ✅ 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('✅ 로그인 상태 확인됨, 캠페인 페이지로 이동')
      router.push('/campaigns')
    }
  }, [status, session, router])

  // ✅ 자동 온보딩 모달 제거 - 이 useEffect를 삭제했습니다

  const handleTabChange = (tab: "influencer" | "advertiser") => {
    console.log("[v0] Tab change requested:", tab)
    setActiveTab(tab)
  }

  const handleAdvertiserOnboardingClose = () => {
    console.log("[v0] Advertiser onboarding closed")
    setShowAdvertiserOnboarding(false)
    setActiveTab("advertiser")
  }

  const handleInfluencerOnboardingClose = () => {
    console.log("[v0] Influencer onboarding closed")
    setShowInfluencerOnboarding(false)
    setActiveTab("influencer")
  }

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(".fade-in-section")

    animatedElements.forEach((el) => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [activeTab])

  // ✅ 로딩 중일 때 보여줄 화면
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // ✅ 로그인된 사용자는 리다이렉트 중
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-600">리다이렉트 중...</p>
        </div>
      </div>
    )
  }

  // ✅ 비로그인 사용자만 랜딩 페이지 표시
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full px-4 border-b border-gray-200" style={{ height: "var(--gnb-height)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-full">
          <h1 className="text-xl md:text-2xl font-bold text-[#7b68ee]">잇다</h1>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabChange("influencer")}
              className={`px-4 md:px-6 py-2 rounded-md font-semibold text-xs md:text-sm transition-all duration-200 ${
                activeTab === "influencer" ? "bg-white text-[#7b68ee] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              인플루언서
            </button>
            <button
              onClick={() => handleTabChange("advertiser")}
              className={`px-4 md:px-6 py-2 rounded-md font-semibold text-xs md:text-sm transition-all duration-200 ${
                activeTab === "advertiser" ? "bg-white text-[#7b68ee] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              광고주
            </button>
          </div>
        </div>
      </header>

      <AdvertiserOnboardingModal isOpen={showAdvertiserOnboarding} onClose={handleAdvertiserOnboardingClose} />
      <InfluencerOnboardingModal isOpen={showInfluencerOnboarding} onClose={handleInfluencerOnboardingClose} />

      <main className="flex-1 px-4 py-8 md:py-12">
        {activeTab === "influencer" ? (
          <div className="max-w-6xl w-full mx-auto space-y-20 md:space-y-32">
            <div className="text-center space-y-4 md:space-y-6 min-h-[calc(100vh-var(--gnb-height)-4rem)] flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#7b68ee] leading-tight text-balance px-2">
                브랜드와 협업하고
                <br />
                수익을 창출하세요
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground/80 text-pretty px-4">
                당신의 영향력을 수익으로 전환하는 가장 쉬운 방법
              </p>

              <div className="pt-2 md:pt-4">
                <Link href="/signup/influencer">
                  <Button
                    className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold px-8 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-xl transition-all duration-200"
                    size="lg"
                  >
                    인플루언서로 시작하기
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground pt-3">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-[#7b68ee] font-semibold hover:underline">
                    로그인
                  </Link>
                </p>
              </div>
            </div>

            <div className="fade-in-section text-center py-32 md:py-48">
              <p className="text-lg md:text-xl lg:text-2xl text-foreground font-medium text-pretty">
                가장 편리하고 쉬운 협업 진행과정, 인플루언서와 광고주를 잇다.
              </p>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    여러분의 능력을 마음껏 어필하세요.
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  프로필 등록 한번으로 광고주님에게 연락이 올 수 있어요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/influencer-profile-showcase-interface.jpg"
                  alt="프로필 등록 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  0% 수수료로 협업을 진행해요.
                </h4>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  잇다는 인플루언서님과 광고주님을 자유롭게 이어주는 커뮤니티에요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/direct-communication-interface.jpg"
                  alt="직접적인 커뮤니케이션"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4 md:order-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    광고주님의 캠페인에 쉽게 지원
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  브랜드가 원하는 인플루언서님께 DM으로 먼저 연락이 올 수도 있고, 공고를 보고 캠페인에 직접 지원할 수 있어요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg md:order-1">
                <img
                  src="/campaign-participation-interface.jpg"
                  alt="캠페인 참여 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    빠른 협업 진행
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  인스타그램 DM으로 광고주님과 바로 소통하고, 협업 진행 상태를 한눈에 확인하세요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/fast-collaboration-process-tracking.jpg"
                  alt="빠른 협업 진행"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section text-center space-y-4 md:space-y-6 py-8 md:py-12 border-t border-gray-200">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">지금 바로 시작하세요</h3>
              <Link href="/signup/influencer">
                <Button
                  className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold px-8 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-xl transition-all duration-200"
                  size="lg"
                >
                  인플루언서로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl w-full mx-auto space-y-20 md:space-y-32">
            <div className="text-center space-y-4 md:space-y-6 min-h-[calc(100vh-var(--gnb-height)-4rem)] flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#7b68ee] leading-tight text-balance px-2">
                인플루언서 탐색,
                <br />
                한곳에서 빠르게 끝내세요
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground/80 text-pretty px-4">
                매칭 준비는 빠르게, 대화는 자유롭게.
                <br />
                잇다에서 시작해보세요.
              </p>

              <div className="pt-2 md:pt-4">
                <Link href="/signup/advertiser">
                  <Button
                    className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold px-8 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-xl transition-all duration-200"
                    size="lg"
                  >
                    광고주로 시작하기
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground pt-3">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-[#7b68ee] font-semibold hover:underline">
                    로그인
                  </Link>
                </p>
              </div>
            </div>

            <div className="fade-in-section text-center py-32 md:py-48">
              <p className="text-lg md:text-xl lg:text-2xl text-foreground font-medium text-pretty">
                가장 편리하고 쉬운 협업 진행과정, 인플루언서와 광고주를 잇다.
              </p>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    인플루언서 모아보기
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  카테고리, 팔로워 별 필터로 맞춤형 프로필 한눈에 탐색해요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/influencer-discovery-filter-interface.jpg"
                  alt="인플루언서 탐색 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4 md:order-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    캠페인 등록 & 지원
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  광고주님이 모집글을 올리면, 인플루언서님이 직접 지원할 수도 있어요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg md:order-1">
                <img
                  src="/campaign-registration-and-application-system.jpg"
                  alt="캠페인 등록 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    빠른 탐색 & 연결
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  프로필 카드를 클릭해 인스타그램 프로필을 직접 확인하고 DM으로 컨택해요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/quick-profile-connection-instagram-integration.jpg"
                  alt="빠른 연결 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
              <div className="space-y-3 md:space-y-4 md:order-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#7b68ee]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-5 h-5 md:w-6 md:h-6 text-[#7b68ee]" />
                  </div>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    간소화된 협업 과정
                  </h4>
                </div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  공고 등록부터 지원자 관리까지 한 번에, 필요한 정보만 보고, 모아서 보여드릴게요.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl md:rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-lg md:order-1">
                <img
                  src="/streamlined-collaboration-management-dashboard.jpg"
                  alt="협업 관리 화면"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="fade-in-section text-center space-y-4 md:space-y-6 py-8 md:py-12 border-t border-gray-200">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">지금 바로 시작하세요</h3>
              <Link href="/signup/advertiser">
                <Button
                  className="bg-[#7b68ee] hover:bg-[#7b68ee]/90 text-white font-semibold px-8 md:px-12 py-5 md:py-6 text-base md:text-lg rounded-xl transition-all duration-200"
                  size="lg"
                >
                  광고주로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-4 md:py-6 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 잇다. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-section {
          opacity: 0;
          transform: translateY(60px);
        }

        .fade-in-section.animate-in {
          animation: fadeInUp 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}