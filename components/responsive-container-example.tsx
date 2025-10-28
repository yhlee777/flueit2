"use client"

import { ResponsiveContainer } from "./responsive-container"

/**
 * 사용 예시 컴포넌트
 *
 * 이 파일은 예시용이며, 실제 프로젝트에서는 필요하지 않습니다.
 * ResponsiveContainer 사용법을 보여주기 위한 참고용입니다.
 */
export function ResponsiveContainerExample() {
  return (
    <ResponsiveContainer aspectRatio="9/16" backgroundColor="#1a1a1a" className="your-custom-class">
      {/* 여기에 실제 콘텐츠를 넣으세요 */}
      <div className="w-full h-full flex flex-col">
        <header className="p-4 bg-blue-500 text-white">헤더 영역</header>

        <main className="flex-1 p-4 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">메인 콘텐츠</h1>
          <p>이 영역은 9:16 비율로 고정되며, 모든 기기에서 동일한 비율로 표시됩니다.</p>
        </main>

        <footer className="p-4 bg-gray-800 text-white">푸터 영역</footer>
      </div>
    </ResponsiveContainer>
  )
}
