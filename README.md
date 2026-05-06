
# DepViz

`package.json`의 의존성을 시각화하고 업데이트 리스크를 분석하는 웹 도구입니다.

> 레거시 프로젝트에 투입될 때마다 수십 개의 패키지 버전을 일일이 확인하는 게 번거로웠습니다.
> "한눈에 보여주는 도구가 있으면 어떨까?" 에서 시작했습니다.

<img width="2518" height="1299" alt="의존성 그래프" src="https://github.com/user-attachments/assets/1be0d5b0-e338-420e-a32e-c2d21071bf3f" />

---

## Features

- **의존성 그래프** — D3.js 기반 Force / Tree 레이아웃으로 패키지 의존 관계 시각화
- **리스크 대시보드** — major 버전 차이를 기준으로 업데이트 위험도 자동 분류
- **업데이트 리포트** — 우선순위별 업데이트 목록과 패키지 매니저별 설치 명령어 자동 생성
- **다양한 입력 방식** — 파일 업로드 / npm 패키지 URL / 직접 입력 지원
- **SVG 내보내기** — 의존성 그래프를 SVG 파일로 저장

<img width="2518" height="1259" alt="리스크 대시보드" src="https://github.com/user-attachments/assets/7c007e33-bc94-48a7-b716-b115d7b715ef" />

<img width="2518" height="1988" alt="업데이트 리포트" src="https://github.com/user-attachments/assets/6dc4ae71-05eb-4594-be28-0b01b981f089" />

---

## Tech Stack

| 목적 | 선택 | 이유 |
|------|------|------|
| Framework | Next.js 15 (App Router) | 서버 컴포넌트로 초기 렌더링 최적화 |
| 그래프 시각화 | D3.js | 포스/트리 레이아웃 커스터마이징이 필요해 차트 라이브러리 대신 선택 |
| 클라이언트 상태 | Zustand | 그래프 필터 상태, 선택된 노드 전역 관리 |
| 비동기 데이터 | TanStack Query | npm registry API 호출 결과 캐싱 처리 |
| 스키마 검증 | Zod | package.json 입력값 런타임 검증으로 파싱 오류 방지 |
| 테스트 | Vitest | 리스크 분류 로직 단위 테스트 |
| 스타일 | Tailwind CSS v4 | — |

---

## 기술적 의사결정

**왜 D3.js를 직접 사용했나?**
recharts, nivo 같은 차트 라이브러리는 노드 간 충돌 회피, 드래그 인터랙션, 동적 레이아웃 전환(Force ↔ Tree)을 동시에 지원하지 않습니다. D3의 `forceSimulation`을 직접 제어해 패키지 수에 따라 레이아웃이 자연스럽게 분산되도록 했습니다.

**리스크 분류 기준**
SemVer의 major 버전 차이를 기준으로 삼았습니다. minor/patch는 하위 호환성이 보장되는 반면, major는 breaking change를 의미하기 때문입니다.

| 레벨 | 기준 | 의미 |
|------|------|------|
| 낮음 | patch / minor | 하위 호환성 유지 — 안전하게 업데이트 가능 |
| 보통 | major 1 차이 | API 변경 가능성 — 릴리스 노트 확인 권장 |
| 높음 | major 2 차이 | Breaking changes 예상 — 마이그레이션 가이드 검토 필요 |
| 위험 | major 3 이상 | 대규모 변경 — 충분한 검토 후 단계적 업데이트 권장 |

---

## Getting Started

```bash
yarn install
yarn dev
```

`http://localhost:3000` 에서 확인

---

## 사용 방법

1. `package.json` 파일을 업로드하거나 내용을 직접 붙여넣기
2. 의존성 그래프에서 패키지 노드를 클릭해 상세 정보 확인
3. 리스크 대시보드에서 업데이트 우선순위 확인
4. 업데이트 리포트에서 패키지 매니저별 설치 명령어 복사
