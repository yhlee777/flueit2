# ResponsiveGridContainer 사용 가이드

모든 스마트폰(iPhone, Android)에서 좌우 동일한 여백을 유지하는 반응형 그리드 컨테이너입니다.

## 주요 특징

- ✅ 2열 그리드 (기본값, 변경 가능)
- ✅ `gap` 속성만 사용하여 카드 간격 제어 (margin 사용 안 함)
- ✅ `clamp(12px, 4vw, 20px)`를 사용한 반응형 좌우 padding
- ✅ iPhone 안전영역 자동 대응 (`env(safe-area-inset-*)`)
- ✅ subpixel 차이 없이 정확한 간격 유지
- ✅ 기존 코드 수정 없이 독립적으로 사용 가능

## 기본 사용법

\`\`\`tsx
import { ResponsiveGridContainer } from "@/components/responsive-grid-container"

export default function MyPage() {
  return (
    <ResponsiveGridContainer>
      <div className="bg-white p-4 rounded-lg">카드 1</div>
      <div className="bg-white p-4 rounded-lg">카드 2</div>
      <div className="bg-white p-4 rounded-lg">카드 3</div>
      <div className="bg-white p-4 rounded-lg">카드 4</div>
    </ResponsiveGridContainer>
  )
}
\`\`\`

## Props

### ResponsiveGridContainer

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `React.ReactNode` | required | 그리드 아이템들 |
| `gap` | `number` | `16` | 카드 간 간격 (픽셀) |
| `columns` | `number` | `2` | 열 개수 |
| `className` | `string` | `""` | 추가 CSS 클래스 |

## 사용 예시

### 1. 기본 2열 그리드 (16px gap)

\`\`\`tsx
<ResponsiveGridContainer>
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</ResponsiveGridContainer>
\`\`\`

### 2. 커스텀 gap 사용

\`\`\`tsx
<ResponsiveGridContainer gap={12}>
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</ResponsiveGridContainer>
\`\`\`

### 3. 3열 그리드

\`\`\`tsx
<ResponsiveGridContainer columns={3} gap={12}>
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</ResponsiveGridContainer>
\`\`\`

### 4. 추가 스타일 적용

\`\`\`tsx
<ResponsiveGridContainer className="bg-gray-50">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</ResponsiveGridContainer>
\`\`\`

## 기존 페이지에 적용하기

### 파트너 페이지 예시

기존 코드를 수정하지 않고, 그리드 부분만 컴포넌트로 감싸면 됩니다:

\`\`\`tsx
// app/influencers/page.tsx

import { ResponsiveGridContainer } from "@/components/responsive-grid-container"

export default function InfluencersPage() {
  return (
    <main>
      {/* 기존 헤더, 필터 등 */}
      
      {/* 기존 그리드를 ResponsiveGridContainer로 감싸기 */}
      <ResponsiveGridContainer gap={16}>
        {influencers.map(influencer => (
          <InfluencerCard key={influencer.id} {...influencer} />
        ))}
      </ResponsiveGridContainer>
    </main>
  )
}
\`\`\`

## 기술 세부사항

### 좌우 여백 계산

\`\`\`css
padding-left: calc(clamp(12px, 4vw, 20px) + env(safe-area-inset-left, 0px));
padding-right: calc(clamp(12px, 4vw, 20px) + env(safe-area-inset-right, 0px));
\`\`\`

- `clamp(12px, 4vw, 20px)`: 화면 크기에 따라 12px~20px 사이로 자동 조정
- `env(safe-area-inset-*)`: iPhone 노치/홈 인디케이터 영역 자동 대응
- `calc()`: 두 값을 더해 정확한 여백 계산

### 그리드 레이아웃

\`\`\`css
grid-template-columns: repeat(2, 1fr);
gap: 16px;
\`\`\`

- `1fr`: 각 열이 동일한 너비를 가짐
- `gap`: 카드 간 간격을 정확하게 제어 (margin 사용 안 함)
- subpixel 차이 없이 정확한 레이아웃 유지

## 브라우저 호환성

- ✅ iOS Safari (모든 버전)
- ✅ Android Chrome
- ✅ Samsung Internet
- ✅ 기타 모던 브라우저

## 주의사항

1. **카드 컴포넌트에 margin 추가 금지**: 간격은 `gap`으로만 제어됩니다.
2. **안전영역 메타 태그 필요**: `<meta name="viewport" content="viewport-fit=cover">`를 HTML에 추가해야 합니다.
3. **카드 너비**: 카드는 자동으로 그리드 셀 크기에 맞춰집니다. 고정 너비를 설정하지 마세요.

## 문제 해결

### 좌우 여백이 여전히 다르게 보이는 경우

1. 브라우저 개발자 도구에서 실제 padding 값 확인
2. 부모 요소에 추가 padding/margin이 있는지 확인
3. 카드 컴포넌트에 margin이 설정되어 있는지 확인

### 안전영역이 적용되지 않는 경우

HTML `<head>`에 다음 메타 태그를 추가하세요:

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
