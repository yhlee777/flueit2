# 🚀 채팅 기능 빠른 설치 가이드

## ⚡ 5분 안에 설치하기

### 1단계: 파일 복사 (1분)

```bash
# 메인 페이지들
cp chat-detail-complete.tsx app/chat/[id]/page.tsx
cp chat-list-complete.tsx app/chat/page.tsx

# 스토어 & 서비스
cp chat-store-enhanced.tsx lib/chat-store.tsx
cp realtime-chat-service.tsx lib/realtime-chat-service.tsx

# API 라우트 생성
mkdir -p app/api/chat/{messages,typing,upload}
cp api-chat-messages-route.ts app/api/chat/messages/route.ts
cp api-chat-typing-route.ts app/api/chat/typing/route.ts
cp api-chat-upload-route.ts app/api/chat/upload/route.ts

# 유틸리티
cp chat-setup-utils.tsx lib/chat-setup-utils.tsx
```

### 2단계: 패키지 설치 (1분)

```bash
# Zustand가 없다면 설치
npm install zustand

# WebSocket 서버용 (선택사항)
npm install ws
npm install -D @types/ws
```

### 3단계: 디렉토리 생성 (10초)

```bash
mkdir -p public/uploads/chat
mkdir -p public/sounds
```

### 4단계: 환경 변수 (30초)

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 5단계: 테스트 (2분)

개발 서버 실행:

```bash
npm run dev
```

브라우저에서:
1. `/chat` 접속
2. 개발자 콘솔 열기 (F12)
3. 다음 명령어 실행:

```javascript
chatDevTools.init()  // 테스트 데이터 로드
```

4. 페이지 새로고침
5. 채팅 목록 확인! ✅

---

## 📋 상세 체크리스트

### ✅ 필수 파일

- [ ] `app/chat/page.tsx` - 채팅 목록
- [ ] `app/chat/[id]/page.tsx` - 채팅 상세
- [ ] `lib/chat-store.tsx` - 상태 관리
- [ ] `lib/realtime-chat-service.tsx` - 실시간 서비스

### ✅ API 라우트 (필수)

- [ ] `app/api/chat/messages/route.ts`
- [ ] `app/api/chat/typing/route.ts`
- [ ] `app/api/chat/upload/route.ts`

### ✅ 선택사항

- [ ] `websocket-server.js` - 실시간 WebSocket
- [ ] `lib/chat-setup-utils.tsx` - 개발 도구
- [ ] `public/sounds/message.mp3` - 알림 소리

### ✅ 의존성

- [ ] zustand
- [ ] ws (WebSocket 서버용)

### ✅ 설정

- [ ] `.env.local` 파일
- [ ] 업로드 디렉토리 생성
- [ ] 소리 파일 (옵션)

---

## 🎯 빠른 테스트 시나리오

### 시나리오 1: 기본 채팅 (폴링 모드)

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저에서 /chat 접속

# 3. 개발자 콘솔에서
chatDevTools.init()

# 4. 페이지 새로고침

# 5. 채팅 클릭하여 메시지 보내기
```

### 시나리오 2: 실시간 채팅 (WebSocket)

```bash
# 터미널 1: WebSocket 서버
node websocket-server.js

# 터미널 2: Next.js 개발 서버
npm run dev

# 브라우저 1: 인플루언서 모드로 /chat 접속
# 브라우저 2: 광고주 모드로 /chat 접속

# 양쪽에서 메시지 전송 테스트!
```

### 시나리오 3: 파일 업로드

```bash
# 1. 채팅방 접속

# 2. 📎 아이콘 클릭

# 3. 이미지 또는 파일 선택

# 4. 전송 버튼 클릭

# 5. 업로드된 파일 확인
```

---

## 🐛 문제 해결

### 채팅이 안보여요
```javascript
// 콘솔에서 실행
chatDevTools.init()  // 테스트 데이터 로드
location.reload()     // 새로고침
```

### 메시지 전송이 안돼요
```javascript
// 스토어 상태 확인
useChatStore.getState().chats
```

### WebSocket 연결 안돼요
```bash
# WebSocket 서버 실행 확인
node websocket-server.js

# 또는 폴링 모드로 전환
useWebSocket: false
```

### 파일 업로드 실패
```bash
# 디렉토리 확인
ls -la public/uploads/chat

# 권한 확인
chmod 755 public/uploads
```

---

## 📦 package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "ws-server": "node websocket-server.js",
    "dev:full": "concurrently \"npm run dev\" \"npm run ws-server\"",
    "chat:reset": "node -e \"const fs = require('fs'); const path = require('path'); const file = path.join(process.cwd(), 'public', 'uploads', 'chat'); fs.rmSync(file, {recursive: true, force: true}); fs.mkdirSync(file, {recursive: true}); console.log('Chat reset complete!');\""
  }
}
```

사용법:
```bash
# 개발 서버만
npm run dev

# WebSocket 서버만
npm run ws-server

# 둘 다 실행 (concurrently 필요)
npm install -D concurrently
npm run dev:full

# 채팅 데이터 리셋
npm run chat:reset
```

---

## 🎨 커스터마이징 팁

### 테마 색상 변경

```tsx
// 보라색 (#7b68ee) 대신 다른 색상
className="bg-[#7b68ee]"  // 이 부분을 찾아서 변경

// 예: 파란색
className="bg-[#3b82f6]"

// 예: 초록색
className="bg-[#10b981]"
```

### 메시지 버블 스타일

```tsx
// 둥근 정도 조정
rounded-2xl  // 매우 둥글게
rounded-lg   // 조금 둥글게
rounded-md   // 약간 둥글게
```

### 아바타 크기

```tsx
// 채팅 목록
className="h-12 w-12"  // 기본

// 채팅방 내부
className="h-8 w-8"    // 작게
```

---

## 🚀 프로덕션 준비

### 체크리스트

1. **환경 변수 설정**
   - [ ] NEXT_PUBLIC_WS_URL
   - [ ] DATABASE_URL
   - [ ] STORAGE_BUCKET

2. **데이터베이스**
   - [ ] 채팅 테이블 생성
   - [ ] 메시지 테이블 생성
   - [ ] 인덱스 추가

3. **스토리지**
   - [ ] S3/Cloud Storage 설정
   - [ ] CDN 설정

4. **WebSocket**
   - [ ] 프로덕션 서버 배포
   - [ ] SSL 인증서 설정
   - [ ] 로드 밸런싱

5. **모니터링**
   - [ ] 에러 추적
   - [ ] 로그 수집
   - [ ] 성능 모니터링

---

## 💡 추가 리소스

- [Zustand 문서](https://zustand-demo.pmnd.rs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎉 완성!

모든 설정이 완료되었습니다!

```bash
npm run dev
```

브라우저에서 `/chat`을 열고 채팅을 시작하세요! 🚀

문제가 있다면:
1. 개발자 콘솔 확인
2. `chatDevTools` 사용
3. 로그 확인

Happy Chatting! 💬
