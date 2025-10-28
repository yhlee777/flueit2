# CenteredGridContainer 사용 가이드

파트너 프로필 카드를 항상 화면 가운데 정렬하고 좌우 여백을 동일하게 유지하는 2열 그리드 컴포넌트입니다.

## 주요 특징

- ✅ 2열 그리드가 항상 화면 중앙에 정렬
- ✅ 좌우 바깥 여백 완전 대칭 (모든 스마트폰)
- ✅ `gap` 속성만 사용, 카드 `margin` 없음
- ✅ iPhone 안전영역 자동 대응
- ✅ subpixel 오차 없는 정확한 레이아웃
- ✅ `grid-template-columns: repeat(2, calc((100% - gap)/2))` 사용
- ✅ `justify-content: center`로 중앙 정렬

## 기본 사용법

### 1. 가장 간단한 사용

\`\`\`tsx
import { CenteredGridContainer } from "@/components/centered-grid-container"

export default function PartnersPage() {
  return (
    <CenteredGridContainer>
      <Card>카드 1</Card>
      <Card>카드 2</Card>
      <Card>카드 3</Card>
      <Card>카드 4</Card>
    </CenteredGridContainer>
  )
}
\`\`\`

### 2. 커스텀 gap 사용

\`\`\`tsx
// gap을 12px로 설정
<CenteredGridContainer gap={12}>
  <Card>카드 1</Card>
  <Card>카드 2</Card>
</CenteredGridContainer>

// gap을 20px로 설정
<CenteredGridContainer gap={20}>
  <Card>카드 1</Card>
  <Card>카드 2</Card>
</CenteredGridContainer>
\`\`\`

### 3. 추가 className 적용

\`\`\`tsx
<CenteredGridContainer className="my-8">
  <Card>카드 1</Card>
  <Card>카드 2</Card>
</CenteredGridContainer>
\`\`\`

### 4. CenteredGridItem 래퍼 사용 (선택사항)

카드에 추가 스타일이 필요한 경우:

\`\`\`tsx
import { CenteredGridContainer, CenteredGridItem } from "@/components/centered-grid-container"

<CenteredGridContainer>
  <CenteredGridItem className="bg-gray-50 rounded-lg">
    <Card>카드 1</Card>
  </CenteredGridItem>
  <CenteredGridItem className="bg-blue-50 rounded-lg">
    <Card>카드 2</Card>
  </CenteredGridItem>
</CenteredGridContainer>
\`\`\`

## 파트너 페이지에 적용하기

### 기존 코드 (수정 전)

\`\`\`tsx
// app/influencers/page.tsx
<div className="grid grid-cols-2 gap-x-4 gap-y-4">
  {filteredInfluencers.map((influencer) => (
    <Card key={influencer.id}>
      {/* 카드 내용 */}
    </Card>
  ))}
</div>
\`\`\`

### 새로운 코드 (적용 후)

\`\`\`tsx
// app/influencers/page.tsx
import { CenteredGridContainer } from "@/components/centered-grid-container"

<CenteredGridContainer gap={16}>
  {filteredInfluencers.map((influencer) => (
    <Card key={influencer.id}>
      {/* 카드 내용 */}
    </Card>
  ))}
</CenteredGridContainer>
\`\`\`

## Props

### CenteredGridContainer

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `React.ReactNode` | required | 그리드 아이템 (카드들) |
| `gap` | `number` | `16` | 카드 간 간격 (픽셀) |
| `className` | `string` | `""` | 추가 CSS 클래스 |

### CenteredGridItem

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `React.ReactNode` | required | 카드 내용 |
| `className` | `string` | `""` | 추가 CSS 클래스 |

## 기술 세부사항

### CSS 구조

\`\`\`css
/* 컨테이너 */
padding-left: calc(16px + env(safe-area-inset-left, 0px));
padding-right: calc(16px + env(safe-area-inset-right, 0px));

/* 그리드 */
display: grid;
grid-template-columns: repeat(2, calc((100% - var(--grid-gap)) / 2));
gap: var(--grid-gap);
justify-content: center;
width: 100%;
\`\`\`

### 왜 이 방식인가?

1. **`calc((100% - gap) / 2)`**: 각 카드가 정확히 절반 너비를 차지하도록 계산
2. **`justify-content: center`**: 그리드 자체를 중앙 정렬
3. **`gap`만 사용**: margin 없이 gap으로만 간격 제어하여 subpixel 오차 방지
4. **`env(safe-area-inset-*)`**: iPhone 노치/홈 인디케이터 영역 자동 대응
5. **`calc(16px + env(...))`**: 기본 여백 + 안전영역을 더해 완벽한 대칭

## 테스트 방법

1. iPhone (노치 있음): Safari에서 테스트
2. iPhone (홈 버튼): Safari에서 테스트
3. Android (다양한 화면 비율): Chrome에서 테스트
4. 개발자 도구에서 다양한 화면 크기 테스트

## 주의사항

- ❌ 카드에 `margin` 추가하지 말 것 (레이아웃 깨짐)
- ❌ 그리드 컨테이너에 추가 `padding` 넣지 말 것
- ✅ 카드 내부 `padding`은 자유롭게 사용 가능
- ✅ `gap` prop으로 간격 조절

## 데모 페이지

`/grid-demo` 페이지에서 실제 동작을 확인할 수 있습니다.

\`\`\`tsx
// app/grid-demo/page.tsx
import { CenteredGridExample } from "@/components/centered-grid-example"

export default function GridDemoPage() {
  return <CenteredGridExample />
}
