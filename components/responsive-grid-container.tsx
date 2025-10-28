"use client"

import type React from "react"

interface ResponsiveGridContainerProps {
  children: React.ReactNode
  gap?: number // gap in pixels (default: 16)
  columns?: number // number of columns (default: 2)
  className?: string
}

/**
 * 모든 스마트폰에서 좌우 동일한 여백을 유지하는 반응형 그리드 컨테이너
 *
 * 특징:
 * - 2열 그리드 (기본값, columns prop으로 변경 가능)
 * - gap 속성만 사용하여 카드 간격 제어
 * - clamp()를 사용한 반응형 좌우 padding
 * - iPhone 안전영역 자동 대응
 * - subpixel 차이 없이 정확한 간격 유지
 */
export function ResponsiveGridContainer({
  children,
  gap = 16,
  columns = 2,
  className = "",
}: ResponsiveGridContainerProps) {
  return (
    <div
      className={`responsive-grid-container ${className}`}
      style={{
        // 좌우 padding: clamp(12px, 4vw, 20px) + 안전영역
        paddingLeft: `calc(clamp(12px, 4vw, 20px) + env(safe-area-inset-left, 0px))`,
        paddingRight: `calc(clamp(12px, 4vw, 20px) + env(safe-area-inset-right, 0px))`,
        // 상하 padding은 필요에 따라 조정 가능
        paddingTop: "1rem",
        paddingBottom: "1rem",
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * 그리드 아이템 래퍼 (선택사항)
 * 카드 컴포넌트를 이것으로 감싸면 일관된 스타일 적용 가능
 */
export function ResponsiveGridItem({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`responsive-grid-item ${className}`}>{children}</div>
}
