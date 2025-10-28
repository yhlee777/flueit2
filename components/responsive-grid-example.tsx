"use client"

import { ResponsiveGridContainer, ResponsiveGridItem } from "./responsive-grid-container"

/**
 * ResponsiveGridContainer 사용 예시
 */
export default function ResponsiveGridExample() {
  // 예시 데이터
  const items = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `카드 ${i + 1}`,
    description: "설명 텍스트",
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-xl font-bold text-center py-6">반응형 그리드 예시</h1>

      {/* 기본 사용법: 2열 그리드, 16px gap */}
      <ResponsiveGridContainer>
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
          </div>
        ))}
      </ResponsiveGridContainer>

      {/* 커스텀 gap 사용 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-center mb-4">커스텀 Gap (12px)</h2>
        <ResponsiveGridContainer gap={12}>
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900">{item.title}</h3>
            </div>
          ))}
        </ResponsiveGridContainer>
      </div>

      {/* 3열 그리드 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-center mb-4">3열 그리드</h2>
        <ResponsiveGridContainer columns={3} gap={12}>
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="bg-green-50 rounded-lg p-3 border border-green-200">
              <h3 className="text-sm font-semibold text-green-900">{item.title}</h3>
            </div>
          ))}
        </ResponsiveGridContainer>
      </div>

      {/* ResponsiveGridItem 사용 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-center mb-4">GridItem 래퍼 사용</h2>
        <ResponsiveGridContainer gap={16}>
          {items.slice(0, 4).map((item) => (
            <ResponsiveGridItem key={item.id}>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 h-full">
                <h3 className="font-semibold text-purple-900">{item.title}</h3>
                <p className="text-sm text-purple-600 mt-2">{item.description}</p>
              </div>
            </ResponsiveGridItem>
          ))}
        </ResponsiveGridContainer>
      </div>
    </div>
  )
}
