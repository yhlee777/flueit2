import { ResponsiveContainer } from "@/components/responsive-container"

/**
 * 데모 페이지 - 실제 사용 예시
 *
 * 이 페이지를 방문하여 ResponsiveContainer가 어떻게 작동하는지 확인할 수 있습니다.
 * URL: /responsive-demo
 */
export default function ResponsiveDemoPage() {
  return (
    <ResponsiveContainer aspectRatio="9/16" backgroundColor="#0f172a">
      <div className="w-full h-full flex flex-col bg-white">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold">반응형 컨테이너 데모</h1>
          <p className="text-sm mt-2 opacity-90">9:16 비율 고정</p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">✅ 비율 고정</h2>
              <p className="text-sm text-gray-600">모든 기기에서 9:16 비율로 표시됩니다</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">✅ 왜곡 없음</h2>
              <p className="text-sm text-gray-600">콘텐츠가 늘어나거나 찌그러지지 않습니다</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">✅ 안전영역 지원</h2>
              <p className="text-sm text-gray-600">노치, 홈 인디케이터 영역을 자동으로 피합니다</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h2 className="font-semibold text-lg mb-2">✅ 중앙 정렬</h2>
              <p className="text-sm text-gray-600">남는 공간은 배경색으로 채워지며 콘텐츠는 중앙에 위치합니다</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-gray-100 p-4 border-t">
          <p className="text-center text-sm text-gray-600">화면을 회전하거나 크기를 조절해보세요</p>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
