# DepViz

package.json을 업로드하거나 URL/텍스트로 입력하여 의존성 그래프, 리스크 대시보드, 업데이트 우선순위 리포트를 확인할 수 있는 시각화 도구입니다.

## Features

- **의존성 그래프**: D3.js 기반 포스/트리 레이아웃으로 패키지 의존성 시각화
- **리스크 대시보드**: major 버전 차이 기준으로 패키지별 업데이트 리스크 분석
- **업데이트 리포트**: 우선순위별 업데이트 목록과 설치 명령어 자동 생성
- **다양한 입력 방식**: 파일 업로드 / npm 패키지 URL / 직접 입력
- **패키지 매니저 지원**: npm, yarn, pnpm, bun 명령어 자동 생성
- **SVG 내보내기**: 의존성 그래프를 SVG 파일로 저장

## Tech Stack

| 목적 | 라이브러리 |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| 그래프 시각화 | D3.js |
| 클라이언트 상태 | Zustand |
| 비동기 데이터 | TanStack Query |
| 스키마 검증 | Zod |
| 테스트 | Vitest |
| 스타일 | Tailwind CSS v4 |

## Getting Started

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인

## Risk Levels

| 레벨 | 기준 | 설명 |
|------|------|------|
| 낮음 | 패치/마이너 업데이트 | 하위 호환성 유지 — 안전하게 업데이트 가능 |
| 보통 | Major 1버전 차이 | API 변경 가능성 있음 — 릴리스 노트 확인 권장 |
| 높음 | Major 2버전 차이 | Breaking changes 예상 — 마이그레이션 가이드 검토 필요 |
| 위험 | Major 3버전 이상 차이 | 대규모 변경 — 충분한 검토 후 단계적 업데이트 권장 |
