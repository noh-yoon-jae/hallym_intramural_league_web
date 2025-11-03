# 프로젝트를 실행하고 싶다면?

최종 업데이트: 2025-11-03

## 프로젝트 개요

- 교내 리그(경기, 공지, 채팅, 통계)를 관리하는 풀스택 애플리케이션입니다.
- Next.js 15 기반의 클라이언트(`client/`)와 Express + Socket.IO 기반의 서버(`server/`)가 분리된 모노레포 구조입니다.
- 루트 스크립트는 `concurrently`를 이용해 두 애플리케이션을 동시에 실행합니다.

## 주요 폴더

- `client/`: Next.js(App Router) 관리자/이용자 UI, Tailwind CSS, Radix UI, Socket.IO 클라이언트 사용.
- `server/`: Express 5 API, JWT 인증, MySQL 연동, Nodemailer, Socket.IO 채팅 서버.
- `Dump20250730.sql`: MySQL 덤프. `re_sports` 스키마 생성 및 초기 데이터 포함.
- `z-linux/`, `z-windows/`: OS별 초기 설정 및 실행 보조 스크립트.
- `uploads/`: 서버 업로드 파일 저장소(런타임 생성/사용).
- `log/`: JSON 형태의 서버 로그(`log-YYYY-MM-DD.json`).

## 사전 준비

- Node.js 20 LTS (최소 18.18 이상 권장), npm 10 이상.
- MySQL 8.x (또는 호환 버전) 설치 및 접근 권한.
- 전역 `ts-node` 설치 필요: `npm install -g ts-node` (서버 `start` 스크립트에서 사용).
- 방화벽/프록시 환경에서는 3000(클라이언트), 3001(서버) 포트 허용.

## 의존성 설치

1. 루트 패키지 설치 (concurrently):

   ```bash
   npm install
   ```

2. 클라이언트/서버 종속성 일괄 설치:

   ```bash
   npm run install:all
   ```

   또는 필요 시 개별 설치:

   ```bash
   npm run install:client
   npm run install:server
   ```

3. Linux에서 제공 스크립트 사용 시:

   ```bash
   ./z-linux/start-on-linux.sh
   ```

   (상위 디렉터리에서 `npm install`, `ts-node` 전역 설치, `npm run install:all`, `npm run distribution` 순으로 실행.)

## 환경 변수 설정 (`server/.env`)

서버는 `dotenv`를 통해 `.env` 파일을 로드합니다. 아래 키가 존재하지 않으면 애플리케이션이 즉시 종료합니다.

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret
email=your_gmail_address
email_password=app_password_for_gmail
base_url=http://localhost:3000
```

## .env 설명 (변수별)

- DB_HOST
   - 역할: 애플리케이션이 접속할 MySQL 서버의 호스트(주소)입니다.
   - 사용처: 서버의 DB 연결 설정(server/db/index.ts)에서 호스트로 사용되어 DB에 접속합니다.
   - 예: 127.0.0.1 (로컬), db.example.com (원격)
   - 권장: 프로덕션에서는 내부 네트워크 호스트 또는 DB 전용 서브넷 주소를 사용하고, 퍼블릭 IP 노출을 피하세요.

- DB_PORT
   - 역할: MySQL이 수신 대기하는 포트 번호입니다.
   - 사용처: DB 커넥션 생성 시 포트 인자에 사용됩니다.
   - 예: 3306 (MySQL 기본 포트)
   - 권장: 기본 포트를 그대로 쓰는 경우가 많지만, 보안/네트워크 정책상 다르게 설정했다면 이 값을 맞춰야 합니다.

- DB_USER
   - 역할: 데이터베이스 접속에 사용할 계정명입니다.
   - 사용처: DB 연결 풀을 만들 때 인증(아이디)용으로 사용됩니다.
   - 예: app_user
   - 권장: 최소 권한 원칙(해당 애플리케이션에 필요한 권한만 부여)을 적용한 전용 DB 계정을 사용하세요. 루트 계정 사용 금지.

- DB_PASSWORD
   - 역할: DB_USER에 대한 비밀번호입니다.
   - 사용처: DB 연결 인증(비밀번호)으로 사용됩니다.
   - 예: 안전한 랜덤 문자열
   - 권장: 절대 리포지터리에 커밋하지 말고, 운영 환경에서는 비밀관리 서비스(Secrets Manager, Vault, GitHub Secrets 등)를 사용하세요.

- JWT_SECRET
   - 역할: JWT 토큰의 서명(발급 및 검증)에 사용하는 비밀키입니다.
   - 사용처: 인증/인가 로직(로그인 토큰 발급, 토큰 검증)에서 서명 키로 사용됩니다.
   - 권장: 충분히 긴 랜덤 문자열을 사용하고 주기적으로 키 교체 전략을 고려하세요. 노출 시 전체 세션이 위험해집니다.

- email
   - 역할: 애플리케이션에서 발송할 이메일의 발신자(로그인 계정) 주소입니다.
   - 사용처: 비밀번호 재설정 메일, 알림 메일 발송에 사용되는 SMTP 로그인(E.g., Nodemailer 설정).
   - 예: yourname@gmail.com
   - 권장: 전용 발신 전용 계정을 사용하는 것이 안전합니다.

- email_password
   - 역할: 이메일 발송용 계정의 비밀번호 또는 앱 비밀번호(서비스별).
   - 사용처: SMTP 인증(예: Gmail의 경우 앱 비밀번호)으로 사용됩니다.
   - 권장: Gmail을 쓴다면 일반 계정 비밀번호 대신 “앱 비밀번호”를 발급받아 사용하고, 운영환경에서는 시크릿 저장소를 사용하세요.

- base_url
   - 역할: 이메일(비밀번호 초기화 링크 등), 외부에 노출되는 링크 생성 시 사용되는 기본 URL입니다.
   - 사용처: 비밀번호 재설정 이메일이나 기타 외부 접근 링크 생성 시 삽입되는 베이스 경로로 사용됩니다.
   - 예: http://localhost:3000 (개발), https://yourdomain.com (프로덕션)
   - 권장: 실제 배포 도메인(프로토콜 포함)을 정확히 설정해야 링크가 올바르게 동작합니다.

## 데이터베이스 초기화

1. MySQL에 `re_sports` 스키마를 생성하거나 덤프 파일에 포함된 스크립트를 직접 적용합니다.
2. 루트의 `Dump20250730.sql`을 사용해 초기 데이터 로드:

   ```bash
   mysql -u <user> -p <database> < Dump20250730.sql
   ```

3. `server/db/index.ts`는 커넥션 풀을 5시간마다 재생성하므로 장시간 실행 시에도 커넥션 유지가 안정적입니다.

## 로컬 개발 실행

### 전체 실행 (권장)

```bash
npm run dev
```

- `client`: `http://localhost:3000`
- `server`: `http://localhost:3001`
- 두 프로세스는 `concurrently`로 병렬 실행되며 종료 시 Ctrl+C를 두 번 입력하여 모두 중지합니다.

### 개별 실행

```bash
npm run dev:client   # Next.js 개발 서버
npm run dev:server   # Express + Socket.IO 서버 (ts-node)
```

### CORS/Socket 도메인 주의 사항

- 기본적으로 `server/index.ts`는 `https://intramural-test-v1.kro.kr`만 허용합니다.
- 로컬 개발에서 클라이언트를 `http://localhost:3000`으로 사용하려면 `server/index.ts`의 `cors` 설정과 Socket.IO 옵션을 수정하거나, hosts 파일과 로컬 TLS 프록시를 이용해 동일 도메인을 매핑하세요.

## 빌드 및 배포

- 전체 빌드:
  
  ```bash
  npm run build
  ```
  
  - `client`: `next build`
  - `server`: 현재는 TypeScript를 컴파일하지 않고 바로 `ts-node`로 실행합니다. 프로덕션 환경에서는 `tsc`를 통한 사전 컴파일 또는 `ts-node` 런타임 의존 여부를 검토하세요.
- 프로덕션 실행:
  
  ```bash
  npm run start
  ```
  
  - 클라이언트: `next start` (빌드 결과 사용)
  - 서버: `ts-node index.ts`
- 서버를 Node.js 순수 실행으로 변환하려면 `tsconfig`에 `outDir`을 설정하고 `tsc` 빌드 후 생성된 JS 파일을 실행하도록 스크립트를 조정하세요.

## 테스트

- 클라이언트:
  
  ```bash
  npm test --prefix client
  ```
  
- 서버:
  
  ```bash
  npm test --prefix server
  ```
  
  (현재 두 프로젝트 모두 기본 Jest 설정만 포함되어 있으며 테스트 케이스는 마련되어 있지 않습니다.)

## 로그와 업로드 경로

- `server/log/`: `loggingMiddleware`가 요청/응답을 하루 단위 JSON 파일로 저장합니다. 디스크 용량을 주기적으로 점검하세요.
- `server/uploads/`: Multer 업로드 파일이 저장됩니다. 실제 배포 환경에서는 별도 스토리지나 백업 정책을 마련하세요.

## 기타 참고

- `server/middlewares/`에는 본문 정제(`sanitizeBodyMiddleware`), 요청 로깅(`loggingMiddleware`) 등이 포함되어 있어 보안/감사를 지원합니다.
- `server/sockets/`의 `chatSocket.ts`는 JWT 쿠키 기반 인증을 사용하며 익명 사용자 수를 IP 단위로 제한합니다.
- `client/src/hooks/use-data-sync.ts`는 테이블 업데이트 타임스탬프 API를 통해 로컬 스토리지를 동기화합니다. 서버 `/api/table-update/last-updated` 엔드포인트와 연동됩니다.

## 자주 묻는 설정 문제

- `Error: ts-node: command not found` → 전역 `ts-node` 설치 후 터미널 재시작.
- CORS 차단 → `server/index.ts`의 `origin` 값을 현재 프런트엔드 주소로 수정.
- 이메일 전송 실패 → Gmail 보안 설정에서 앱 비밀번호 발급 및 `email`, `email_password` 재확인.
- DB 접속 오류 → `.env`의 `DB_HOST`, `DB_PORT`, 사용자 권한을 확인하고 방화벽/도커 네트워크 설정을 점검하세요.
