/**
 * WebSocket 서버
 * 
 * 사용 방법:
 * 1. 별도 터미널에서 실행: node websocket-server.js
 * 2. 또는 package.json에 스크립트 추가:
 *    "ws-server": "node websocket-server.js"
 * 
 * 포트: 3001 (변경 가능)
 */

const WebSocket = require('ws')

const PORT = process.env.WS_PORT || 3001

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: PORT })

// 연결된 클라이언트 저장
const clients = new Map()

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const userId = url.searchParams.get('userId')
  const userType = url.searchParams.get('userType')

  console.log(`[WebSocket] New connection: User ${userId} (${userType})`)

  // 클라이언트 정보 저장
  clients.set(ws, { userId: parseInt(userId), userType })

  // 연결 확인 메시지
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connected successfully',
  }))

  // 메시지 수신
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`[WebSocket] Received:`, message)

      switch (message.type) {
        case 'send_message':
          handleSendMessage(ws, message)
          break

        case 'typing_status':
          handleTypingStatus(ws, message)
          break

        case 'read_receipt':
          handleReadReceipt(ws, message)
          break

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }))
          break

        default:
          console.log(`[WebSocket] Unknown message type:`, message.type)
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error)
    }
  })

  // 연결 종료
  ws.on('close', () => {
    console.log(`[WebSocket] Connection closed: User ${userId}`)
    clients.delete(ws)
  })

  // 에러 처리
  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error)
  })
})

// 메시지 전송 처리
function handleSendMessage(senderWs, message) {
  const { chatId, message: messageData } = message
  const senderInfo = clients.get(senderWs)

  // 채팅방의 다른 참가자에게 메시지 브로드캐스트
  clients.forEach((clientInfo, clientWs) => {
    // 자신을 제외하고 전송
    if (clientWs !== senderWs) {
      // 실제로는 chatId를 기반으로 참가자 필터링
      clientWs.send(JSON.stringify({
        type: 'new_message',
        chatId,
        message: {
          ...messageData,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        },
      }))
    }
  })

  // 전송자에게 확인 메시지
  senderWs.send(JSON.stringify({
    type: 'message_sent',
    chatId,
    messageId: Date.now(),
  }))
}

// 타이핑 상태 처리
function handleTypingStatus(senderWs, message) {
  const { chatId, userId, isTyping } = message

  // 채팅방의 다른 참가자에게 타이핑 상태 브로드캐스트
  clients.forEach((clientInfo, clientWs) => {
    if (clientWs !== senderWs) {
      clientWs.send(JSON.stringify({
        type: 'typing_status',
        chatId,
        userId,
        isTyping,
      }))
    }
  })
}

// 읽음 처리
function handleReadReceipt(senderWs, message) {
  const { chatId, messageId } = message
  const senderInfo = clients.get(senderWs)

  // 메시지 발신자에게 읽음 알림 전송
  clients.forEach((clientInfo, clientWs) => {
    if (clientWs !== senderWs) {
      clientWs.send(JSON.stringify({
        type: 'message_read',
        chatId,
        messageId,
        readBy: senderInfo.userId,
        readAt: new Date().toISOString(),
      }))
    }
  })
}

// Heartbeat (연결 유지)
setInterval(() => {
  clients.forEach((clientInfo, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat' }))
    }
  })
}, 30000) // 30초마다

console.log(`[WebSocket] Server is running on port ${PORT}`)
console.log(`[WebSocket] Connect with: ws://localhost:${PORT}/chat?userId=<id>&userType=<type>`)
