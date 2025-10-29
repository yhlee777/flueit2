import { NextRequest, NextResponse } from "next/server"

// 타이핑 상태 저장소 (메모리)
const typingStatuses = new Map<number, {
  userId: number
  isTyping: boolean
  timestamp: number
}>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, userId, isTyping } = body

    if (!chatId || !userId || typeof isTyping !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 타이핑 상태 저장
    typingStatuses.set(chatId, {
      userId,
      isTyping,
      timestamp: Date.now(),
    })

    // 3초 후 자동으로 타이핑 상태 제거
    setTimeout(() => {
      const status = typingStatuses.get(chatId)
      if (status && status.timestamp === Date.now()) {
        typingStatuses.delete(chatId)
      }
    }, 3000)

    // 실제 환경에서는 WebSocket으로 다른 사용자에게 브로드캐스트

    return NextResponse.json({
      success: true,
      message: "Typing status updated",
    })
  } catch (error) {
    console.error("[API] Error updating typing status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return NextResponse.json(
        { error: "Missing chatId parameter" },
        { status: 400 }
      )
    }

    const status = typingStatuses.get(parseInt(chatId))

    // 오래된 타이핑 상태는 무시 (3초 이상)
    if (status && Date.now() - status.timestamp > 3000) {
      typingStatuses.delete(parseInt(chatId))
      return NextResponse.json({ isTyping: false })
    }

    return NextResponse.json({
      isTyping: status?.isTyping || false,
      userId: status?.userId,
    })
  } catch (error) {
    console.error("[API] Error fetching typing status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
