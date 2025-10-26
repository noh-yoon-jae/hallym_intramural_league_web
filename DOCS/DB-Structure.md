# re_sports 데이터베이스 구조

최종 검토: 2025-10-27

`Dump20250730.sql` 덤프를 기준으로 한 MySQL 8.x 테이블 구조 요약입니다. 외래 키, 기본값, 특이사항을 함께 정리했습니다. 실제 운영에 맞춰 컬럼 추가/변경이 있을 수 있으므로 덤프 재생성 시 이 문서도 업데이트하세요.

---

## 전체 개요

- 스키마 이름: `re_sports`
- 문자 집합: 대부분 `utf8mb4` (`notices`, `categories`는 `_0900_ai_ci` 콜레이트)
- 관계형 구조 중심, FK로 `users`, `sports`, `teams`, `chat_rooms` 등과 연결
- 채팅, 경기, 공지, 순위, 신고 기록과 관련된 테이블을 포함

---

## 테이블별 상세

### 1. `users`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 사용자 고유 ID |
| `username` | varchar(32) UNIQUE | | 로그인 ID |
| `password` | varchar(255) | | Argon2 해시 저장 |
| `power` | int | 0 | 권한 레벨 (0: 일반, 1 이상: 운영/관리) |
| `nickname` | varchar(32) | NULL | 채팅/표시용 닉네임 |
| `email` | varchar(64) UNIQUE | NULL | 학교 이메일 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |
| `authentication` | tinyint(1) | 0 | 이메일 인증 여부 |
| `authentication_code` | varchar(255) | NULL | 이메일 인증 토큰(해시) |
| `reset_token` | varchar(255) | NULL | 비밀번호 재설정 토큰 |
| `reset_token_expiry` | datetime | NULL | 재설정 토큰 만료 |
| `reset_token_used` | tinyint(1) | 0 | 재설정 사용 여부 |
| `college_id` | int | NULL | (FK 미정) 대학 ID. 실제 참조 테이블은 덤프에 없음 |

> **주의**: `college_id`는 인덱스만 존재하고 외래 키가 정의되어 있지 않습니다. 추후 참조 테이블을 추가하거나 FK 제약을 설정해야 합니다.

---

### 2. `sports`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 종목 ID |
| `name` | varchar(64) UNIQUE | | 종목명 |
| `description` | text | NULL | 종목 설명 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |

- FK 연관: `teams.sport_id`, `matches.sport_id`, `chat_rooms.sport_id`, `standings.sport_id`

---

### 3. `teams`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 팀 ID |
| `sport_id` | int FK | | 종목 참조 (`sports.id`, ON DELETE CASCADE) |
| `name` | varchar(64) | | 팀 이름 |
| `logo_url` | varchar(255) | NULL | 로고 파일 경로 |
| `captain` | varchar(45) | NULL | 주장/대표 |
| `mambers` | int | NULL | 팀 인원수 (`members` 오타 주의) |
| `record` | varchar(45) | NULL | 간단한 성적 표현 |
| `specialty` | varchar(45) | NULL | 특기/특징 |
| `team_members` | json | NULL | 상세 구성원 JSON |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |

- FK 연관: `matches.team_a_id`, `matches.team_b_id`, `standings.team_id`
- **오타**: `mambers` → 앱 코드에서도 동일 spelling 사용 여부 확인 필요

---

### 4. `chat_rooms`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 채팅방 ID |
| `sport_id` | int FK | | 종목 참조 (`sports.id`, ON DELETE CASCADE) |
| `name` | varchar(64) | | 채팅방 이름 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |

- 연관: `chat_messages.room_id`

---

### 5. `chat_messages`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 메시지 ID |
| `room_id` | int FK | | 채팅방 (`chat_rooms.id`) |
| `user_id` | int FK | | 작성자 (`users.id`) |
| `message` | text | | 메시지 본문 |
| `is_reported` | tinyint(1) | 0 | 신고 여부 |
| `is_hidden` | tinyint(1) | 0 | 숨김 처리 여부 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 작성 시각 |

- 연관: `chat_message_likes.message_id`, `chat_message_reports.message_id`
- 삭제 정책: 채팅방/사용자 삭제 시 CASCADE로 삭제

---

### 6. `chat_message_likes`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 좋아요 ID |
| `message_id` | int FK | | 대상 메시지 (`chat_messages.id`, ON DELETE CASCADE) |
| `user_id` | int FK | | 누른 사용자 (`users.id`, ON DELETE CASCADE) |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |

---

### 7. `chat_message_reports`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 신고 ID |
| `message_id` | int FK | | 신고 대상 메시지 (`chat_messages.id`, ON DELETE CASCADE) |
| `user_id` | int FK | | 신고자 (`users.id`, ON DELETE CASCADE) |
| `reason` | text | | 신고 사유 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 신고 시각 |

---

### 8. `admin_chat_ban`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 제재 기록 ID |
| `user_id` | int FK | | 제재 대상 (`users.id`) |
| `admin_id` | int FK | | 조치한 관리자 (`users.id`) |
| `reason` | varchar(255) | NULL | 사유 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 제재 등록 시각 |
| `released_at` | datetime | NULL | 해제 시각 |

- 해제되지 않은 기록(`released_at IS NULL`)을 기준으로 현재 제재 상태를 판단 가능

---

### 9. `matches`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 경기 ID |
| `sport_id` | int FK | | 종목 (`sports.id`, ON DELETE CASCADE) |
| `season_year` | int | | 시즌 연도 |
| `team_a_id` | int FK | | 홈/팀 A (`teams.id`, ON DELETE CASCADE) |
| `team_b_id` | int FK | | 어웨이/팀 B (`teams.id`, ON DELETE CASCADE) |
| `match_time` | datetime | | 경기 일시 |
| `location` | varchar(255) | NULL | 장소 |
| `score_a` | int | 0 | 팀 A 점수 |
| `score_b` | int | 0 | 팀 B 점수 |
| `status` | enum('scheduled','ongoing','finished') | 'scheduled' | 경기 진행 상태 |
| `mvp` | varchar(45) | NULL | 경기 MVP |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |

- 경기 완료(`status='finished'`) 시 `standings` 갱신 로직과 연동됨

---

### 10. `standings`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | int PK AUTO_INCREMENT | | 순위 레코드 ID |
| `sport_id` | int FK | | 종목 (`sports.id`, ON DELETE CASCADE) |
| `season_year` | int | | 시즌 연도 |
| `team_id` | int FK | | 팀 (`teams.id`, ON DELETE CASCADE) |
| `wins` | int | 0 | 승 |
| `losses` | int | 0 | 패 |
| `draws` | int | 0 | 무 |
| `points` | int | 0 | 승점 |
| `created_at` | datetime | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | datetime | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |

- `UNIQUE KEY (sport_id, team_id)`로 종목-팀 조합당 단일 레코드 보장
- 시즌별 데이터를 유지하려면 `season_year` 포함 UNIQUE 제약으로 조정 필요

---

### 11. `notices`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | bigint PK AUTO_INCREMENT | | 공지 ID |
| `title` | varchar(255) | | 제목 |
| `content` | longtext | | 본문 (HTML 허용) |
| `created_at` | timestamp | CURRENT_TIMESTAMP | 생성 시각 |
| `updated_at` | timestamp | CURRENT_TIMESTAMP ON UPDATE | 수정 시각 |
| `author_id` | bigint | | 작성자 ID (`users` FK 없음 → 필요 시 추가) |
| `view_count` | int | 0 | 조회수 |

- 현재 FK 제약이 없어 `author_id`는 애플리케이션에서 직접 검증 필요

---

### 12. `categories`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | bigint PK AUTO_INCREMENT | 카테고리 ID |
| `name` | varchar(50) UNIQUE | 카테고리명 |

---

### 13. `notice_categories`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `notice_id` | bigint FK | 공지 (`notices.id`, ON DELETE CASCADE) |
| `category_id` | bigint FK | 카테고리 (`categories.id`, ON DELETE CASCADE) |

- 복합 PK (`notice_id`, `category_id`)로 다대다 관계를 표현

---

### 14. `table_update_tracker`

| 컬럼 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `table_name` | varchar(50) PK | | 테이블 이름 |
| `last_modified` | timestamp | CURRENT_TIMESTAMP ON UPDATE | 마지막 수정 시각 |

- `/api/table-update/last-updated`에서 사용하는 메타 테이블

---

## 인덱스 및 제약 요약

- **Cascade 삭제**: `chat_messages`, `chat_message_likes`, `chat_message_reports`, `chat_rooms`, `matches`, `teams`, `standings` 등은 부모(종목/팀/사용자/채팅방) 삭제 시 함께 제거됩니다.
- **부족한 FK**: `users.college_id`, `notices.author_id`는 FK가 없어 무결성 보장되지 않음. 필요 시 스키마에 FK 추가 권장.
- **ENUM 사용**: `matches.status`는 세 가지 상태로 제한됩니다.
- **JSON 컬럼**: `teams.team_members`는 JSON 타입이므로 MySQL 8.x 이상에서만 지원.

---

## 운영 시 고려 사항

- **권한 모델**: `users.power` 값과 API 권한 매핑을 문서화하고, DB 차원에서 ENUM 등으로 제한할지 검토.
- **로그 및 감사**: 채팅 제재(`admin_chat_ban`)와 신고(`chat_message_reports`)는 타임스탬프 기록이 있으나 해제/처리 이력 추가를 고려할 수 있습니다.
- **데이터 종속성**: `standings`는 (sport, team) 유니크 키로 인해 시즌별 누적 저장 시 덮어쓰기 되므로 필요 시 (sport, team, season_year) 유니크 변경을 검토하세요.
- **타이포 정리**: `teams.mambers`를 `members`로 수정하려면 코드/쿼리 전체 수정이 동반되어야 합니다.

---

## 문서 업데이트 가이드

1. DB 스키마를 변경하거나 새로운 덤프를 배포하면 `DumpYYYYMMDD.sql`과 이 문서를 동시에 갱신하세요.
2. 새 테이블 추가 시: 컬럼 목록, FK, 제약, 용도를 위 테이블들과 동일한 포맷으로 기록합니다.
3. 기존 컬럼 삭제/변경 시: API/서버 로직 영향 범위와 마이그레이션 절차를 함께 메모하면 유지보수에 도움이 됩니다.
