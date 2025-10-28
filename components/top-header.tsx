"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Heart, Bell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TopHeaderProps {
  title?: string
  titleColor?: string
  showSearch?: boolean
  showNotifications?: boolean
  showHeart?: boolean
  showBack?: boolean
  customAction?: React.ReactNode
}

export function TopHeader({
  title,
  titleColor,
  showSearch = false,
  showNotifications = true,
  showHeart = true,
  showBack = false,
  customAction,
}: TopHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-white" style={{ height: "var(--gnb-height)" }}>
      <div
        className="flex items-center justify-between h-full"
        style={{ paddingLeft: "var(--gnb-padding-x)", paddingRight: "var(--gnb-padding-x)" }}
      >
        <div className="flex items-center">
          {showBack ? (
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 w-12 flex items-center justify-center -ml-2"
            >
              <ArrowLeft
                className="text-black"
                style={{
                  width: "var(--gnb-icon-size)",
                  height: "var(--gnb-icon-size)",
                  minWidth: "var(--gnb-icon-size)",
                  minHeight: "var(--gnb-icon-size)",
                  strokeWidth: "var(--gnb-icon-stroke)",
                }}
              />
            </Button>
          ) : null}
          {title ? (
            <h1 className={`text-xl font-semibold ${showBack ? "ml-2" : ""}`} style={{ color: titleColor || "black" }}>
              {title}
            </h1>
          ) : (
            <Image src="/itda-logo.png" alt="잇다 로고" width={80} height={32} className="h-8 w-auto" />
          )}
        </div>

        <div className="flex items-center -mr-2">
          {customAction ? (
            customAction
          ) : showHeart ? (
            <Link href="/profile/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 flex items-center justify-center overflow-visible"
              >
                <Heart
                  className="stroke-black fill-none"
                  style={{
                    width: "var(--gnb-icon-size)",
                    height: "var(--gnb-icon-size)",
                    minWidth: "var(--gnb-icon-size)",
                    minHeight: "var(--gnb-icon-size)",
                    strokeWidth: "var(--gnb-icon-stroke)",
                  }}
                />
              </Button>
            </Link>
          ) : null}
          {showNotifications && (
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 flex items-center justify-center overflow-visible"
              >
                <Bell
                  className="stroke-black fill-none"
                  style={{
                    width: "var(--gnb-icon-size)",
                    height: "var(--gnb-icon-size)",
                    minWidth: "var(--gnb-icon-size)",
                    minHeight: "var(--gnb-icon-size)",
                    strokeWidth: "var(--gnb-icon-stroke)",
                  }}
                />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
