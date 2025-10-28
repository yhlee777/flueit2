"use client"

import type React from "react"

interface CenteredGridContainerProps {
  children: React.ReactNode
  gap?: number // gap in pixels, default 16
  className?: string
}

/**
 * 2열 그리드 컨테이너 - 항상 화면 가운데 정렬, 좌우 여백 동일
 *
 * 특징:
 * - 2열 그리드가 항상 중앙 정렬
 * - 좌우 바깥 여백 완전 대칭
 * - gap만 사용, 카드 margin 없음
 * - iPhone 안전영역 자동 대응
 * - subpixel 오차 없는 정확한 레이아웃
 */
export function CenteredGridContainer({ children, gap = 16, className = "" }: CenteredGridContainerProps) {
  return (
    <div
      className={`centered-grid-wrapper ${className}`}
      style={
        {
          "--grid-gap": `${gap}px`,
          paddingLeft: `calc(16px + env(safe-area-inset-left, 0px))`,
          paddingRight: `calc(16px + env(safe-area-inset-right, 0px))`,
        } as React.CSSProperties
      }
    >
      <div
        className="centered-grid"
        style={
          {
            display: "grid",
            gridTemplateColumns: `repeat(2, calc((100% - var(--grid-gap)) / 2))`,
            gap: `var(--grid-gap)`,
            justifyContent: "center",
            width: "100%",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  )
}

/**
 * 그리드 아이템 래퍼 (선택사항)
 * 카드에 추가 스타일이 필요한 경우 사용
 */
export function CenteredGridItem({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        margin: 0, // margin 명시적으로 제거
      }}
    >
      {children}
    </div>
  )
}
