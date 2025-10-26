# hallym_intramural_league_web 개발 가이드

**API 명세서**는 [여기](https://github.com/noh-yoon-jae/hallym_intramural_league_web/blob/main/DOCS/API-Documentation.md) 를 참조해주세요

**DB 구조**는 [여기](https://github.com/noh-yoon-jae/hallym_intramural_league_web/blob/main/DOCS/DB-Structure.md) 를 참조해주세요

**실행 방법**은 [여기](https://github.com/noh-yoon-jae/hallym_intramural_league_web/blob/main/DOCS/Start.md) 를 참조해주세요

## 작품개요

- 한림대학교 교내 리그 운영을 위한 웹 서비스로, 경기 일정, 결과, 순위, 공지 등을 통합 관리합니다.
- 관리자 전용 백오피스와 일반 사용자용 포털을 분리하여 운영 효율성과 접근성을 높였습니다.
- 실시간 채팅 및 데이터 동기화 기능을 통해 경기 진행 상황을 빠르게 공유할 수 있습니다.

## 개발환경

- Node.js 20.x 이상, npm 10.x 이상을 권장합니다.
- 프론트엔드: Next.js 15, React 19, Tailwind CSS, Radix UI 기반 컴포넌트.
- 백엔드: Express 5, TypeScript, Socket.IO, MySQL2.
- 개발 편의를 위해 `npm run dev` 명령으로 프론트엔드와 백엔드를 동시에 실행할 수 있습니다.
- 환경 변수 설정은 `server/.env`를 통해 구성하며, 데이터베이스 및 메일링 설정이 필요합니다.

## 작품설명

- **사용자 포털**: 경기 일정 열람, 결과 확인, 팀/선수 정보 조회, 공지사항 확인, 회원가입 및 로그인 기능을 제공합니다.
- **관리자 기능**: 카테고리, 경기, 팀, 통계, 공지사항 등을 CRUD 방식으로 관리하고, 리그 운영 데이터를 일괄 업데이트할 수 있습니다.
- **실시간 기능**: 실시간 채팅과 경기 중계 정보를 Socket.IO 기반으로 제공하여 참가자와 관중 간 소통을 지원합니다.
- **보안/인증**: Argon2 기반 비밀번호 해시, JWT 인증, 토큰 검증 및 이메일 인증을 통한 안전한 사용자 관리 구조를 갖추고 있습니다.
- **데이터 처리**: MySQL을 사용하여 경기 및 팀 데이터를 저장하며, 통계/랭킹 계산 로직을 서버에서 처리합니다.

## 향후 확장 방향

- **모바일 최적화**: PWA 적용 및 반응형 UI 고도화를 통해 모바일 사용자 경험을 강화합니다.
- **데이터 분석 심화**: 경기 기록 기반의 고급 분석 및 추천 기능을 추가하여 코칭 스태프와 선수에게 인사이트를 제공합니다.
- **AI/자동화 연계**: 심판 판정 또는 경기 하이라이트 자동 생성 등 AI 서비스를 접목해 운영 효율을 높입니다.
- **멀티 리그 지원**: 여러 대회/시즌을 동시에 운영할 수 있는 구조로 확장하여 운영 범위를 넓힙니다.
- **외부 시스템 연동**: 학교 인증 시스템, 결제 모듈, SNS 공유 기능 등과 연동해 사용성을 향상시킵니다.

## 아키텍처 개요

- **프론트엔드 계층**: `client/src` 기준 Next.js App Router 구조로, `app/(public)`과 `app/(admin)` 레이아웃을 분리해 권한별 UI를 제공합니다.
- **백엔드 계층**: `server` 디렉터리의 Express + Socket.IO 서버가 REST API와 실시간 이벤트를 처리하며, 컨트롤러/서비스/미들웨어로 책임을 분리합니다.
- **주요 모듈 구성**: 공지/경기/팀/통계 등 도메인별 컨트롤러와 라우터가 존재하고, `custom_modules`에 이미지 처리, 메일 발송, 공통 유틸을 배치했습니다.
- **데이터 흐름**: 클라이언트가 Next.js API 호출 → Express 컨트롤러에서 비즈니스 로직 실행 → MySQL과 연동된 `db/index.ts`를 통해 데이터 입출력 → 결과를 JSON으로 반환하며, 실시간 이벤트는 Socket.IO 네임스페이스를 통해 양방향 스트리밍합니다.
- **예정 다이어그램**: 시스템 구성도(`docs/architecture.drawio`)를 추가해 팀 내 공유 예정이며, 핵심 흐름은 위 텍스트를 기준으로 유지합니다.

## 배포 파이프라인

- **브랜치 전략**: `main`은 배포용, `develop`은 통합 테스트용, 기능 개발은 `feature/*`, 핫픽스는 `hotfix/*` 브랜치를 따릅니다.
- **CI 구성**: GitHub Actions에서 설치 → 린트/빌드 → 단위 테스트 → Docker 이미지 빌드를 수행하고, PR 생성 시 자동 검증을 진행합니다.
- **CD 구성**: 배포 승인 후 `main`에 머지되면 프로덕션 환경으로 자동 배포되며, 스테이징 환경은 `develop` 기준으로 운영합니다.
- **운영 환경 설정**: `.env.production`, `.env.staging`으로 환경 변수를 분리 관리하고, Infra는 컨테이너 기반 배포(예: AWS ECS 또는 Azure Container Apps)를 기준으로 설정합니다.
- **모니터링**: 배포 파이프라인과 연계된 알림 채널(Slack/Teams)을 통해 빌드 실패 및 배포 완료 상태를 공유합니다.

## 기여 가이드

- **코드 스타일**: TypeScript/JavaScript는 ESLint + Prettier 기본 규칙을 따르며, 커밋 전 `npm run lint --prefix client`와 `npm run test --prefix server` 실행을 권장합니다.
- **PR 템플릿**: 기능 요약, 변경 상세, 테스트 결과, 스크린샷(필요 시), 체크리스트를 포함한 템플릿을 `.github/pull_request_template.md`로 관리합니다.
- **이슈 라벨링**: `feature`, `bug`, `enhancement`, `docs`, `infra`, `urgent` 등의 라벨을 사용하고, 우선순위는 `P0~P2`로 구분합니다.
- **커밋 메시지 규칙**: `type(scope): subject` 형식을 권장하며, type은 `feat`, `fix`, `docs`, `refactor`, `chore`, `test` 등을 사용합니다.
- **컨벤션 검증**: Husky 또는 Lefthook 기반 pre-commit 훅 추가를 검토 중이며, 적용 시 필수 스크립트는 README에 갱신됩니다.
