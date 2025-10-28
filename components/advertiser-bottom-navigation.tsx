"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Search, Briefcase, User, MessageCircle } from "lucide-react"

const navItems = [
  { href: "/advertiser/dashboard", icon: Home, label: "홈" },
  { href: "/influencers", icon: Search, label: "파트너" },
  { href: "/campaigns", icon: Briefcase, label: "캠페인" },
  { href: "/chat", icon: MessageCircle, label: "채팅" },
  { href: "/profile", icon: User, label: "프로필" },
]

export function AdvertiserBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 rounded-t-2xl">
      <div className="flex items-center justify-around py-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || (href === "/advertiser/dashboard" && pathname === "/advertiser/dashboard")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-h-[44px] justify-center",
                isActive ? "text-[#7b68ee]" : "text-[#999] hover:text-foreground",
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
