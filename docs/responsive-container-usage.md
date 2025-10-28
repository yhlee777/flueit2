# ResponsiveContainer 사용 가이드

## 개요
모든 스마트폰(iPhone/Android)에서 동일한 비율로 표시되는 반응형 컨테이너 컴포넌트입니다.

## 주요 기능
- ✅ 고정 비율 유지 (기본: 9:16)
- ✅ 콘텐츠 왜곡 없이 스케일 조정
- ✅ 레터박스 배경 처리
- ✅ 안전영역(Safe Area) 자동 처리
- ✅ iOS/Android 호환
- ✅ 100dvh 사용 (구버전 폴백 포함)

## 설치 방법

### 1. 메타 태그 추가
`app/layout.tsx`에 다음 메타데이터를 추가하세요:

\`\`\`tsx
export const metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}
\`\`\`

### 2. 컴포넌트 사용

\`\`\`tsx
import { ResponsiveContainer } from "@/components/responsive-container"

export default function MyPage() {
  return (
    <ResponsiveContainer
      aspectRatio="9/16"  // 선택사항, 기본값: "9/16"
      backgroundColor="#000000"  // 선택사항, 기본값: "#000000"
    >
      {/* 여기에 콘텐츠 추가 */}
      <div className="w-full h-full">
        내 콘텐츠
      </div>
    </ResponsiveContainer>
  )
}
\`\`\`

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | 필수 | 표시할 콘텐츠 |
| `aspectRatio` | string | "9/16" | 비율 (예: "9/16", "16/9", "4/3") |
| `backgroundColor` | string | "#000000" | 레터박스 배경색 |
| `className` | string | "" | 추가 CSS 클래스 |

## 다양한 비율 예시

### 세로형 (9:16) - 모바일 기본
\`\`\`tsx
<ResponsiveContainer aspectRatio="9/16">
  {/* 콘텐츠 */}
</ResponsiveContainer>
\`\`\`

### 가로형 (16:9) - 동영상
\`\`\`tsx
<ResponsiveContainer aspectRatio="16/9">
  {/* 콘텐츠 */}
</ResponsiveContainer>
\`\`\`

### 정사각형 (1:1) - 인스타그램
\`\`\`tsx
<ResponsiveContainer aspectRatio="1/1">
  {/* 콘텐츠 */}
</ResponsiveContainer>
\`\`\`

## 기존 페이지에 적용하기

기존 페이지를 ResponsiveContainer로 감싸기만 하면 됩니다:

\`\`\`tsx
// Before
export default function MyPage() {
  return (
    <div>
      내 콘텐츠
    </div>
  )
}

// After
import { ResponsiveContainer } from "@/components/responsive-container"

export default function MyPage() {
  return (
    <ResponsiveContainer>
      <div>
        내 콘텐츠
      </div>
    </ResponsiveContainer>
  )
}
\`\`\`

## 데모 페이지
`/responsive-demo` 페이지를 방문하여 실제 동작을 확인할 수 있습니다.

## 주의사항
- 기존 코드는 수정하지 않아도 됩니다
- 필요한 페이지에만 선택적으로 적용 가능
- 전체 화면을 차지하므로 페이지 레벨에서 사용 권장
