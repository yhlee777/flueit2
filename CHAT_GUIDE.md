# 🚀 채팅 기능 완성 가이드

완전한 실시간 채팅 시스템이 완성되었습니다! 아래 가이드를 따라 설치하고 사용하세요.

## 📋 완성된 기능 목록

### ✅ 핵심 기능
- [x] 실시간 메시지 전송/수신
- [x] 텍스트 메시지
- [x] 이미지 전송
- [x] 파일 첨부 (PDF, DOC, Excel 등)
- [x] 읽음 처리 (Read receipts)
- [x] 타이핑 인디케이터
- [x] 메시지 시간 표시
- [x] 날짜 구분선

### ✅ UI/UX 기능
- [x] 자동 스크롤
- [x] 메시지 검색
- [x] 채팅 필터링 (전체/안읽음/진행중)
- [x] 읽지 않은 메시지 배지
- [x] 온라인/오프라인 상태
- [x] 로딩 상태 표시
- [x] 반응형 디자인

### ✅ 고급 기능
- [x] 협업 승인/거절
- [x] 채팅 삭제
- [x] 채팅 보관
- [x] 사용자 차단
- [x] 신고 기능
- [x] 푸시 알림
- [x] 소리 알림
- [x] 더보기 메뉴

### ✅ 실시간 기능
- [x] WebSocket 지원
- [x] HTTP 폴링 (fallback)
- [x] 자동 재연결
- [x] 오프라인 감지

## 📁 파일 구조

```
프로젝트/
├── app/
│   ├── chat/
│   │   ├── page.tsx              # 채팅 목록 페이지 (완성)
│   │   ├── [id]/
│   │   │   └── page.tsx          # 채팅 상세 페이지 (완성)
│   │   └── review/
│   │       └── page.tsx          # 리뷰 작성 페이지
│   └── api/
│       └── chat/
│           ├── messages/
│           │   └── route.ts      # 메시지 API
│           ├── typing/
│           │   └── route.ts      # 타이핑 상태 API
│           └── upload/
│               └── route.ts      # 파일 업로드 API
├── lib/
│   ├── chat-store.tsx            # 채팅 상태 관리 (완성)
│   └── realtime-chat-service.tsx # 실시간 서비스 (완성)
├── components/
│   ├── top-header.tsx
│   ├── bottom-navigation.tsx
│   └── ui/                       # shadcn/ui 컴포넌트들
└── websocket-server.js           # WebSocket 서버

생성된 파일들:
- chat-detail-complete.tsx         # 완성된 채팅 상세 페이지
- chat-store-enhanced.tsx          # 향상된 채팅 스토어
- realtime-chat-service.tsx        # 실시간 서비스
- chat-list-complete.tsx           # 완성된 채팅 목록
- api-chat-messages-route.ts       # 메시지 API
- api-chat-typing-route.ts         # 타이핑 API
- api-chat-upload-route.ts         # 업로드 API
- websocket-server.js              # WebSocket 서버
```

## 🚀 설치 및 설정

### 1단계: 파일 복사

생성된 파일들을 프로젝트의 적절한 위치에 복사하세요:

```bash
# 채팅 페이지들
cp chat-detail-complete.tsx app/chat/[id]/page.tsx
cp chat-list-complete.tsx app/chat/page.tsx

# 라이브러리
cp chat-store-enhanced.tsx lib/chat-store.tsx
cp realtime-chat-service.tsx lib/realtime-chat-service.tsx

# API 라우트
mkdir -p app/api/chat/messages app/api/chat/typing app/api/chat/upload
cp api-chat-messages-route.ts app/api/chat/messages/route.ts
cp api-chat-typing-route.ts app/api/chat/typing/route.ts
cp api-chat-upload-route.ts app/api/chat/upload/route.ts

# WebSocket 서버
cp websocket-server.js .
```

### 2단계: 의존성 설치

필요한 패키지가 이미 설치되어 있는지 확인:

```bash
npm install zustand
# 또는
yarn add zustand
```

WebSocket 서버를 위한 패키지:

```bash
npm install ws
# 또는
yarn add ws
```

### 3단계: 환경 변수 설정

`.env.local` 파일에 다음을 추가:

```env
# WebSocket 서버 URL (옵션)
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# 파일 업로드 설정
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./public/uploads
```

### 4단계: 업로드 디렉토리 생성

```bash
mkdir -p public/uploads/chat
```

### 5단계: 사운드 파일 추가 (옵션)

알림 사운드를 위해 사운드 파일을 추가:

```bash
mkdir -p public/sounds
# message.mp3 파일을 public/sounds/ 에 추가
```

## 🎯 사용 방법

### 기본 사용법

1. **채팅 시작하기**
   ```typescript
   // 새 채팅 생성
   const { addChat } = useChatStore()
   
   const chatId = addChat({
     campaignId: 1,
     campaignTitle: "캠페인 제목",
     influencerId: 1,
     influencerName: "인플루언서",
     influencerAvatar: "/avatar.jpg",
     advertiserId: 2,
     advertiserName: "광고주",
     advertiserAvatar: "/avatar2.jpg",
     lastMessage: "",
     time: new Date().toISOString(),
     unreadCount: 0,
     isUnread: false,
     isActiveCollaboration: false,
     initiatedBy: "influencer",
     status: "pending",
     messages: [],
   })
   ```

2. **실시간 기능 사용**
   ```typescript
   // 컴포넌트에서 실시간 훅 사용
   const { sendMessage, sendTypingStatus, isConnected } = useRealtimeChat({
     userId: 1,
     userType: "influencer",
     onNewMessage: (chatId, message) => {
       console.log("새 메시지:", message)
     },
   })
   ```

3. **메시지 전송**
   ```typescript
   const handleSend = async () => {
     await sendMessage(chatId, {
       senderId: userId,
       senderType: "influencer",
       content: "안녕하세요!",
       timestamp: new Date().toISOString(),
       type: "text",
       isRead: false,
     })
   }
   ```

### WebSocket 서버 실행

실시간 기능을 사용하려면 WebSocket 서버를 실행하세요:

```bash
# 개발 환경
node websocket-server.js

# 또는 package.json에 스크립트 추가:
# "scripts": {
#   "ws-server": "node websocket-server.js"
# }
npm run ws-server
```

### 폴링 모드 사용

WebSocket 없이 HTTP 폴링만 사용하려면:

```typescript
const { sendMessage } = useRealtimeChat({
  userId: 1,
  userType: "influencer",
  useWebSocket: false,  // 폴링 모드
  pollingInterval: 3000, // 3초마다 폴링
})
```

## 🎨 커스터마이징

### 스타일 변경

채팅 버블 색상 변경:

```tsx
// 내 메시지 색상
className="bg-[#7b68ee] text-white"

// 상대방 메시지 색상
className="bg-white border border-gray-200"
```

### 알림 설정

```typescript
// 알림 비활성화
const { sendMessage } = useRealtimeChat({
  userId: 1,
  userType: "influencer",
  onNewMessage: undefined, // 알림 없음
})

// 소리 비활성화
const { playMessageSound } = useChatSounds({ enabled: false })
```

### 파일 타입 제한

`api-chat-upload-route.ts`에서 허용된 파일 타입 수정:

```typescript
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  // 추가 타입...
]
```

## 🔧 고급 설정

### WebSocket 재연결 설정

```typescript
// lib/realtime-chat-service.tsx 에서
ws.onclose = () => {
  setTimeout(() => {
    connectWebSocket()
  }, 5000) // 5초 후 재연결
}
```

### 메시지 캐싱

```typescript
// Zustand persist 설정
persist(
  (set, get) => ({
    // ...
  }),
  {
    name: "chat-storage",
    version: 2,
    // 커스텀 스토리지
    storage: createJSONStorage(() => sessionStorage),
  }
)
```

## 📱 모바일 최적화

- 반응형 디자인 적용됨
- 터치 제스처 지원
- 가상 키보드 대응
- 안전 영역 (Safe Area) 고려

## 🐛 트러블슈팅

### WebSocket 연결 안됨
```bash
# 방화벽 확인
# 포트 3001이 열려있는지 확인
netstat -an | grep 3001
```

### 파일 업로드 실패
```bash
# 디렉토리 권한 확인
chmod 755 public/uploads
```

### 읽음 처리 안됨
- 채팅방 진입 시 `markAsRead` 함수가 호출되는지 확인
- userId가 올바른지 확인

### 타이핑 인디케이터 안보임
- 3초 제한 확인
- WebSocket 연결 상태 확인

## 🚀 프로덕션 배포

### 체크리스트

- [ ] 환경 변수 설정
- [ ] WebSocket 서버 별도 배포
- [ ] 파일 스토리지 클라우드로 변경 (S3 등)
- [ ] 데이터베이스 연동
- [ ] 푸시 알림 서비스 연동
- [ ] CDN 설정
- [ ] 로그 모니터링
- [ ] 에러 추적 (Sentry 등)

### 성능 최적화

- 메시지 페이지네이션 구현
- 이미지 최적화 (Next.js Image)
- 코드 스플리팅
- 번들 사이즈 최적화

## 📚 추가 기능 아이디어

- [ ] 메시지 수정/삭제
- [ ] 답장 기능
- [ ] 이모지 반응
- [ ] 음성 메시지
- [ ] 비디오 통화
- [ ] 화면 공유
- [ ] 그룹 채팅
- [ ] 채팅방 검색
- [ ] 메시지 고정
- [ ] 자동 번역

## 💡 팁

1. **개발 환경에서는 폴링 모드 사용**
   - WebSocket 서버 별도 실행 불필요
   - 빠른 개발 가능

2. **프로덕션에서는 WebSocket 사용**
   - 더 낮은 지연시간
   - 서버 부하 감소

3. **오프라인 지원**
   - 메시지 큐 구현
   - 재연결 시 자동 전송

4. **보안**
   - JWT 토큰 검증
   - Rate limiting
   - XSS/CSRF 방어

## 🤝 기여

버그 리포트나 기능 제안은 언제든 환영합니다!

## 📄 라이선스

MIT License

---

**즐거운 채팅 개발 되세요! 🎉**
