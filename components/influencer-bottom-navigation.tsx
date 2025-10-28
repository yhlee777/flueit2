"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Briefcase, MessageCircle, User } from "lucide-react"

export function InfluencerBottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/influencer/dashboard") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        <Link
          href="/influencer/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/influencer/dashboard") ? "text-[#7b68ee]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">홈</span>
        </Link>

        <Link
          href="/influencers"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/influencers") ? "text-[#7b68ee]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">파트너</span>
        </Link>

        <Link
          href="/campaigns"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/campaigns") ? "text-[#7b68ee]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-xs mt-1">캠페인</span>
        </Link>

        <Link
          href="/chat"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/chat") ? "text-[#7b68ee]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">채팅</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/profile") ? "text-[#7b68ee]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">내 프로필</span>
        </Link>
      </div>
    </nav>
  )
}
