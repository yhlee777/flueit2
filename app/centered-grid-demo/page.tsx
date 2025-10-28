import { CenteredGridExample } from "@/components/centered-grid-example"

export default function CenteredGridDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">중앙 정렬 그리드 데모</h1>
          <p className="text-sm text-gray-600 mt-1">모든 스마트폰에서 좌우 여백이 동일한 2열 그리드</p>
        </div>
      </div>

      <div className="py-6">
        <CenteredGridExample />
      </div>

      <div className="px-4 py-8 bg-white border-t mt-8">
        <h2 className="text-lg font-semibold mb-4">사용 방법</h2>
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">1. 컴포넌트 import</p>
            <code className="text-xs bg-white px-2 py-1 rounded block">
              import {"{"} CenteredGridContainer {"}"} from &quot;@/components/centered-grid-container&quot;
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">2. 카드를 감싸기</p>
            <code className="text-xs bg-white px-2 py-1 rounded block whitespace-pre">
              {`<CenteredGridContainer gap={16}>
  <Card>카드 1</Card>
  <Card>카드 2</Card>
</CenteredGridContainer>`}
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">3. 특징</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>좌우 여백 항상 동일</li>
              <li>iPhone 안전영역 자동 대응</li>
              <li>gap만 사용, margin 없음</li>
              <li>subpixel 오차 없음</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
