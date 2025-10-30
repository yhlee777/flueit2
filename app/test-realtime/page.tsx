"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function RealtimeTestPage() {
  const [status, setStatus] = useState("연결 중...")
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    console.log('🔍 Realtime 테스트 시작')

    const channel = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('✅ Realtime 이벤트 수신:', payload)
          const eventText = `${new Date().toLocaleTimeString()}: ${payload.eventType} - ${JSON.stringify(payload.new)}`
          setEvents(prev => [...prev, eventText])
        }
      )
      .subscribe((status) => {
        console.log('📡 구독 상태:', status)
        setStatus(status)
      })

    return () => {
      console.log('🔌 구독 해제')
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Realtime 테스트</h1>
      
      <div className="mb-8">
        <h2 className="font-semibold mb-2">연결 상태:</h2>
        <div className={`inline-block px-4 py-2 rounded ${
          status === 'SUBSCRIBED' 
            ? 'bg-green-100 text-green-800' 
            : status === 'CHANNEL_ERROR'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </div>
      </div>

      {status === 'SUBSCRIBED' ? (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-8">
          <h3 className="font-semibold text-green-800 mb-2">✅ Realtime 작동 중!</h3>
          <p className="text-sm text-green-700">
            이제 다른 브라우저에서 메시지를 보내면 여기에 실시간으로 표시됩니다!
          </p>
        </div>
      ) : status === 'CHANNEL_ERROR' ? (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2">❌ Realtime 오류</h3>
          <p className="text-sm text-red-700 mb-2">
            Supabase Dashboard에서 Realtime을 활성화하지 않았거나, 설정에 문제가 있습니다.
          </p>
          <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
            <li>Supabase Dashboard 접속</li>
            <li>Database → Replication 클릭</li>
            <li>messages 테이블 찾기</li>
            <li>Realtime 토글 ON</li>
          </ol>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">⏳ 연결 중...</h3>
          <p className="text-sm text-yellow-700">잠시만 기다려주세요...</p>
        </div>
      )}

      <div className="bg-gray-50 rounded p-4">
        <h2 className="font-semibold mb-2">실시간 이벤트 로그:</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">아직 이벤트가 없습니다. 메시지를 보내보세요!</p>
          ) : (
            events.map((event, i) => (
              <div key={i} className="text-sm bg-white p-2 rounded border">
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">📝 테스트 방법:</h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>이 페이지를 열어둔 상태로</li>
          <li>다른 탭에서 /chat/5 접속</li>
          <li>메시지 전송</li>
          <li>이 페이지에서 실시간으로 이벤트 확인!</li>
        </ol>
      </div>
    </div>
  )
}