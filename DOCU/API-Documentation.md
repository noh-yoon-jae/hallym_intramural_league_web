# hallym_intramural_league_web 명세서

최종 업데이트: 2025-10-27

본 문서는 `server/routes`와 `server/controllers`에 정의된 Express API를 정리한 것입니다. 별도 안내가 없는 한 모든 라우터는 `server/index.ts`에서 `/api` 하위 경로로 마운트됩니다.

---

## 1. 개요
- **로컬 기본 URL**: `http://localhost:3001/api`
- **배포 기본 Origin**: `https://intramural-test-v1.kro.kr`
- **요청/응답 포맷**: 기본 `application/json` UTF-8. 파일 업로드 엔드포인트는 `multipart/form-data` 사용.
- **표준 응답 구조**:
  ```json
  {
    "status": true,
    "data": { ... },
    "reason": "필요 시 사람이 읽을 수 있는 메시지"
  }
  ```
  - 성공 시 `status: true`, 실패 시 `status: false`와 `reason`이 포함됩니다. 일부 관리자 엔드포인트는 `message` 키를 사용하기도 합니다.
- **보안/로그 처리**: `sanitizeBodyMiddleware`가 본문 내 잠재적 위험 HTML을 제거하고, `loggingMiddleware`가 모든 요청/응답을 `server/log/log-YYYY-MM-DD.json`에 기록합니다.

## 2. 인증 및 권한
- **JWT 검사**: `checkToken` 미들웨어는 우선 `jwt` 쿠키를, 없으면 `Authorization: Bearer <token>` 헤더를 읽습니다. 토큰은 `.env`의 `JWT_SECRET`으로 서명되며 `re_sports.users` 테이블에서 인증 완료된 사용자와 일치해야 합니다.
- **권한 레벨(`checkRequirePower`)**
  - `>= 1`: 운영 스태프. 종목/팀/경기/공지/카테고리 관리 가능.
  - `>= 2`: 상위 관리자. 채팅방 생성·차단·메시지 숨김 등 고급 관리 권한.
- **비인증 엔드포인트**: 일부 공개 API는 `checkToken`을 사용하지 않습니다. 단, `user.secession`처럼 컨트롤러에서 `res.locals.auth`를 기대하지만 라우터에 미들웨어가 누락된 경우가 있으므로 호출 전 주의가 필요합니다.

## 3. 사용자 및 인증 API (`/api/user`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/signin` | 없음 | 로그인 후 JWT 쿠키 발급 (도메인 `.kro.kr`). |
| POST | `/signup` | 없음 | 학교 이메일 기반 회원가입, 비밀번호 검증 포함. |
| POST | `/info` | 필요 | 로그인 사용자 프로필 조회. |
| POST | `/nickname` | 필요 | 닉네임 설정/수정. |
| POST | `/logout` | 없음 | JWT 쿠키 삭제. |
| POST | `/secession` | *(정상 동작 위해 인증 필요)* | 회원 탈퇴. 현재 라우터에 `checkToken` 누락. |
| POST | `/request-password-reset` | 없음 | 비밀번호 재설정 메일 발송 요청. |
| POST | `/reset-password` | 없음 | 재설정 토큰으로 비밀번호 변경. |
| POST | `/resend-verification` | 없음 | 인증 메일 재발송. |
| POST | `/email-verify` | 없음 | 이메일 인증 토큰 검증. |

### 3.1 POST `/api/user/signin`
- 요청 예시:
  ```json
  { "id": "username", "password": "PlainText123", "remember": true }
  ```
- 성공 시 `status: true`와 함께 `jwt` 쿠키를 발행합니다 (`httpOnly`, `secure`, `sameSite: strict`).
- 비밀번호는 `validatePassword` 정책(8자 이상, 대문자·숫자 포함)을 통과해야 하며 이메일 인증 완료 상태여야 합니다.

### 3.2 POST `/api/user/signup`
- 필수 파라미터: `username`, `email`, `password`, `recheck_password`.
- 검증 로직:
  - `validateUsername`: 20자 이하 & `<`, `>` 금지.
  - `validateEmail`: 학교 이메일만 허용.
  - 비밀번호 정책 및 재입력 일치 여부 검사.
- 회원 생성 후 Argon2 해시 저장 → 인증 코드 생성 → `custom_modules/mymailer`로 인증 메일 발송.

### 3.3 POST `/api/user/info`
- `checkToken` 필요.
- 응답 예시:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "username": "demo",
      "nickname": "닉네임",
      "email": "user@univ.ac.kr",
      "expiresAt": 1735308965123
    }
  }
  ```

### 3.4 POST `/api/user/nickname`
- 요청 본문: `{ "nickname": "응원단" }`
- 응답: `{ "status": true, "data": { "nickname": "응원단" } }`

### 3.5 POST `/api/user/logout`
- JWT 쿠키(`jwt`)를 제거합니다. 클라이언트에서는 `credentials: "include"` 옵션을 사용하세요.

### 3.6 POST `/api/user/secession`
- 요청 예시: `{ "password": "PlainText123" }`
- 현재 라우터에 `checkToken`이 없어 `res.locals.auth`를 참조하지 못합니다. 호출 전 미들웨어 추가 또는 프록시에서 사용자 정보를 주입해야 합니다.
- 운영자(`power >= 1`)는 탈퇴 불가하도록 제한되어 있습니다.

### 3.7 비밀번호/이메일 관련 보조 API
- `/request-password-reset`: `{ "email": "user@..." }`로 요청, 재설정 토큰 저장 후 메일 전송.
- `/reset-password`: `{ "token": "...", "newPassword": "..." }`, 토큰 유효성 검사 후 비밀번호 변경.
- `/resend-verification`: `{ "email": "user@..." }`로 인증 메일 재발송.
- `/email-verify`: `{ "token": "<id>.<인증코드>" }` 검증 후 `authentication` 플래그 갱신.

## 4. 토큰 검증 (`/api/verify-token`)
- 라우터: `server/routes/verifyToken.ts` → `POST /verify-token`.
- 현재 `server/index.ts`에 import 되어 있으나 `app.use`로 마운트되어 있지 않습니다. 사용하려면 `/api/verify-token`에 라우터를 연결해야 합니다.
- 쿠키 또는 헤더에서 JWT를 검사해 유효 여부를 반환합니다 (`status: true` 또는 HTTP 401/403).

## 5. 카테고리 (`/api/category`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 카테고리 목록 조회. |
| POST | `/create` | 필요 (권한 ≥1) | 카테고리 생성. |
| POST | `/delete` | 필요 (권한 ≥1) | 공지에서 사용 중이 아닌 카테고리 삭제. |
| POST | `/delete-with-notices` | 필요 (권한 ≥2) | 카테고리와 연결된 공지를 일괄 삭제. |

### 5.1 POST `/api/category/create`
- 요청 본문: `{ "name": "일반" }`
- 이름 중복 시 HTTP 409 반환.

### 5.2 POST `/api/category/delete`
- 요청 본문: `{ "category_id": 7 }`
- 공지에서 사용 중이면 삭제를 거부합니다 (`notice_categories` 연관 체크).

### 5.3 POST `/api/category/delete-with-notices`
- 트랜잭션으로 카테고리와 연관 공지를 모두 삭제합니다. 응답에 삭제된 공지 ID 목록을 포함합니다.

## 6. 공지사항 (`/api/notice`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 공지 목록 + 카테고리/작성자 정보.
| POST | `/get` | 없음 | 카테고리별 공지 필터링 (라우터와 파라미터 불일치 주의). |
| POST | `/detail` | 없음 | 공지 상세 + 조회수 증가. |
| POST | `/create` | 필요 (권한 ≥1) | 공지 생성. |
| POST | `/update` | 필요 (권한 ≥1) | 공지 수정 (작성자 또는 권한 2 이상). |
| POST | `/delete` | 필요 (권한 ≥1) | 공지 삭제. |

> ⚠️ `noticeController.get`은 `req.params.categories`를 기대하지만 현재 라우터는 파라미터 경로를 제공하지 않습니다. 실제 사용 시 경로를 `/get/:categories` 형태로 수정하거나 컨트롤러에서 `req.body.categories`를 읽도록 조정해야 합니다.

### 6.1 GET `/api/notice/list`
- `GROUP_CONCAT`로 카테고리 문자열을 함께 반환합니다.

### 6.2 POST `/api/notice/detail`
- 요청: `{ "notice_id": 12 }`
- 응답: 공지 정보 + `categories: string[]`.

### 6.3 POST `/api/notice/create`
- 요청 예시:
  ```json
  {
    "title": "공지 제목",
    "content": "HTML 허용",
    "categories": ["일반", "대회"],
    "author_id": 5
  }
  ```
- 작성자 존재 여부와 카테고리 존재 여부를 검증하고 트랜잭션으로 저장합니다.

### 6.4 POST `/api/notice/update`
- 필수: `notice_id`, `title`, `content`.
- `categories` 배열이 전달되면 관계를 재구성합니다. 작성자는 본인 또는 `power > 1`이어야 합니다.

### 6.5 POST `/api/notice/delete`
- 본문: `{ "notice_id": 12 }`

## 7. 종목 (`/api/sport`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 종목 목록 조회. |
| POST | `/create` | 필요 (권한 ≥1) | 종목 추가. |
| POST | `/update` | 필요 (권한 ≥1) | 종목 정보 수정. |
| POST | `/delete` | 필요 (권한 ≥1) | 종목 삭제. |

- `create`/`update` 요청 본문: `{ "name": "농구", "description": "설명" }` (`update`는 `sport_id` 필수).

## 8. 팀 (`/api/team`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 팀 목록 + 종목명.
| POST | `/create` | 필요 (권한 ≥1) | 팀 생성.
| POST | `/update` | 필요 (권한 ≥1) | 팀 정보 수정.
| POST | `/delete` | 필요 (권한 ≥1) | 팀 삭제.
| GET | `/logo/:filename` | 없음 | 업로드한 로고 이미지 다운로드.
| POST | `/upload-logo` | 필요 (권한 ≥1) | 팀 로고 업로드 (`multipart/form-data`, 필드 `image`).

### 8.1 팀 필드 설명
- 필수: `name`, `sport_id`.
- 선택: `logo_url`, `captain`, `members`, `record`, `specialty`, `team_members`(객체/배열 → JSON 문자열 저장).
- 수정 시 `team_id`와 `sport_id`가 필요합니다.

### 8.2 로고 업로드/다운로드
- 파일은 `server/uploads/team-logos/`에 저장되며 응답으로 랜덤 파일명이 반환됩니다. 이후 `/api/team/logo/<filename>`으로 접근할 수 있습니다.

## 9. 경기 (`/api/match`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 경기 목록 (팀/종목 정보 포함).
| POST | `/create` | 필요 (권한 ≥1) | 경기 등록.
| POST | `/update` | 필요 (권한 ≥1) | 경기 수정/결과 업데이트.
| POST | `/delete` | 필요 (권한 ≥1) | 경기 삭제.

### 9.1 POST `/api/match/create`
- 요청 예시:
  ```json
  {
    "sport_id": 1,
    "team_a_id": 10,
    "team_b_id": 11,
    "match_time": "2025-11-01T13:00:00+09:00",
    "location": "체육관"
  }
  ```
- 팀 존재 여부와 서로 다른지 검사하고, `status`는 `scheduled`, `season_year`는 경기 일시 기준 연도로 저장됩니다.

### 9.2 POST `/api/match/update`
- `match_id` 필수, 그 외는 선택(`score_a`, `score_b`, `status`, `match_time`, `location`).
- `status`가 `finished`로 변경되면 내부 `updateStandings`가 자동으로 순위를 갱신합니다.

### 9.3 POST `/api/match/delete`
- 본문: `{ "match_id": 42 }`

## 10. 순위 (`/api/standing`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list/:sport_id/:season_year` | 없음 | 특정 종목/시즌 순위.
| GET | `/all/:season_year` | 없음 | 시즌별 전체 종목 순위 묶음.
| POST | `/update` | 필요 (권한 ≥1) | 시즌 순위 재계산.

- 순위는 포인트 → 승수 → 무승부 순으로 정렬됩니다.
- `/update` 요청 본문: `{ "season_year": 2025 }` (생략 시 현재 연도). 완료 후 `table_update_tracker`에 타임스탬프가 기록됩니다.

## 11. 통계 (`/api/statistics`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/summary` | 없음 | 전체 경기/팀/메시지 등 요약 통계.

- 응답 예시:
  ```json
  {
    "status": true,
    "data": {
      "totalMatches": 120,
      "winRate": 67.5,
      "totalTeams": 24,
      "totalMessages": 1532
    }
  }
  ```

## 12. 채팅 (`/api/chat`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list/:roomId/:pageNumber` | 없음 | 채팅 메시지를 최신순/페이지 단위로 조회 (페이지당 6건).
| GET | `/stats/:roomId` | 필요 | 사용자의 개인 채팅 통계.
| POST | `/send` | 필요 | 메시지 전송. 닉네임이 설정되어 있어야 함.
| POST | `/like` | 필요 | 메시지 좋아요 토글.
| POST | `/ban` | 필요 (권한 ≥2) | 채팅 금지 등록.
| POST | `/ban/release` | 필요 (권한 ≥2) | 채팅 금지 해제.
| POST | `/chat-hide` | 필요 (권한 ≥2) | 메시지 숨김 처리.

### 12.1 페이징 응답
- 각 행엔 `id`, `message`, `created_at`, `is_reported`, `is_hidden`, `nickname`, `liked_by`가 포함됩니다.
- 숨김 처리된 메시지는 관리자 안내 문구로 대체됩니다.

### 12.2 POST `/api/chat/send`
- 요청: `{ "roomId": 3, "message": "응원합니다!" }`
- 성공 시 Socket.IO로 동일 채팅방(roomId) 참가자에게 `chat` 이벤트가 브로드캐스트됩니다.

### 12.3 POST `/api/chat/like`
- 요청: `{ "messageId": 123 }`
- 응답: `{ "status": true, "likedBy": [1, 5, 8] }` 및 `like` 이벤트 송출.

### 12.4 관리자 기능
- `/ban`: `{ "user_id": 25, "reason": "욕설" }`
- `/ban/release`: `{ "user_id": 25 }`
- `/chat-hide`: `{ "message_id": 321 }`

### 12.5 실시간 소켓 참고
- 기본 네임스페이스(`/`) 사용, 각 채팅방 ID를 룸으로 활용합니다.
- 세부 인증 로직과 익명 사용자 제한은 `server/sockets/chatSocket.ts` 참조.

## 13. 채팅방 (`/api/room`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/list` | 없음 | 채팅방 목록 조회.
| POST | `/create` | 필요 (권한 ≥2) | 채팅방 생성.
| POST | `/delete` | 필요 (권한 ≥2) | 채팅방 삭제.
| POST | `/update` | 필요 (권한 ≥2) | 채팅방 이름 변경.

- `/create`: `{ "sportId": 1, "roomName": "농구 A조" }`
- `/delete`: `{ "roomId": 4 }`
- `/update`: `{ "roomId": 4, "newName": "농구 결승" }`

## 14. 신고 (`/api/report`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/report` | 필요 | 채팅 메시지 신고.

- 요청: `{ "messageId": 123, "reason": "욕설" }`
- 효과: `chat_message_reports`에 레코드 작성, 해당 메시지 `is_reported = 1`로 업데이트.
- **전체 경로 주의**: 라우터가 `/api/report`에 마운트되고 내부 경로가 `/report`이므로 최종 호출 경로는 `/api/report/report`입니다. REST 스타일을 원하면 라우터 내부 경로를 `/`로 변경하는 것을 권장합니다.

## 15. 테이블 변경 이력 (`/api/table-update`)

| 메서드 | 경로 | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/last-updated` | 없음 | 지정 테이블들의 마지막 수정 시각 조회.

- 요청 예시: `{ "tables": ["standings", "notices"] }`
- 응답 예시: `{ "status": true, "data": { "standings": "2025-10-27T11:50:00.000Z" } }`
- 클라이언트의 `useDataSync` 훅에서 로컬 캐시 무효화에 활용됩니다.

## 16. 추가 참고사항
- **메일 전송**: Gmail SMTP(`nodemailer`) 사용. `.env`에 `email`, `email_password`(앱 비밀번호), `base_url`을 설정해야 비밀번호 재설정/인증 메일이 정상 발송됩니다.
- **데이터베이스 연결**: `server/db/index.ts`에서 MySQL 풀을 사용합니다. `.env` 내 `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`가 필수입니다. 필요 시 `database` 항목을 코드에서 주석 해제하세요.
- **업로드 디렉터리**: `server/uploads` 이하 경로가 존재하지 않으면 런타임에 생성됩니다. 배포 환경에서는 접근 권한과 백업 정책을 마련하세요.
- **CORS**: 기본적으로 `https://intramural-test-v1.kro.kr`만 허용합니다. 로컬 개발 시 `server/index.ts`의 `origin` 값을 `http://localhost:3000` 등으로 수정해야 합니다.
- **보완 필요 항목**
  - `/api/user/secession`에 `checkToken` 미들웨어 추가.
  - `verifyTokenRouter`를 `/api/verify-token` 경로로 마운트.
  - 공지 필터 API(`/api/notice/get`)의 경로/파라미터 불일치 해소.

---

이 문서를 수정할 때는 반드시 관련 컨트롤러와 라우터 구현도 함께 업데이트하여 최신 상태를 유지하세요.
