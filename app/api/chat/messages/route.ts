import { NextRequest, NextResponse } from "next/server"

// 실제 환경에서는 데이터베이스 사용
// 여기서는 메모리 저장소 사용 (데모용)
const messageQueue: any[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const userType = searchParams.get("userType")

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // 사용자에게 전달할 새 메시지 가져오기
    const messages = messageQueue.filter((msg) => {
      // 자신이 보낸 메시지가 아닌 것만 필터링
      return msg.message.senderId !== parseInt(userId)
    })

    // 전달한 메시지는 큐에서 제거
    messageQueue.length = 0

    return NextResponse.json({
      messages,
      typingStatuses: [], // 타이핑 상태도 반환
    })
  } catch (error) {
    console.error("[API] Error fetching messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, message } = body

    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 메시지를 큐에 추가 (실제로는 DB에 저장하고 WebSocket으로 전송)
    messageQueue.push({
      chatId,
      message: {
        ...message,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
    })

    // 실제 환경에서는:
    // 1. 데이터베이스에 메시지 저장
    // 2. 수신자에게 WebSocket으로 메시지 전송
    // 3. 푸시 알림 전송

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("[API] Error sending message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
