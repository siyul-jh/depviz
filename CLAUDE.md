# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**DepViz** — package.json을 업로드/URL/텍스트로 입력받아 의존성 그래프, 리스크 대시보드, 업데이트 우선순위 리포트를 보여주는 시각화 도구.

## Commands

```bash
yarn dev          # 개발 서버 (http://localhost:3000)
yarn build        # 프로덕션 빌드
yarn lint         # ESLint
npx tsc --noEmit  # 타입 체크

yarn vitest           # 테스트 (watch)
yarn vitest run       # 테스트 (CI)
yarn vitest run <file>  # 단일 파일
```

## Architecture

Next.js 16 App Router + **Feature-Sliced Design v2.1**.

```
app/                   # Next.js 라우팅만 (얇은 페이지, 위젯 조합)
src/
  features/
    package-input/     # upload · URL · text 입력 처리
    dependency-graph/  # D3.js 그래프 렌더링 및 인터랙션
    risk-dashboard/    # 패키지별 리스크 분석 및 표시
    update-report/     # 업데이트 우선순위 리포트
  entities/
    package/           # PackageJson, ResolvedPackage, RiskLevel 타입
    dependency/        # DependencyNode, DependencyEdge, DependencyGraph 타입
  widgets/             # features를 조합한 페이지 단위 블록
  shared/
    config/            # REGISTRY_URL, RISK_THRESHOLDS 상수
    lib/semver/        # calcVersionRisk, isOutdated 유틸
    types/             # InputMethod, AppError 공통 타입
    ui/                # 기본 UI 컴포넌트
```

**경로 alias**: `@/*` → 프로젝트 루트 (`@/src/...` 형태 사용)

**핵심 라이브러리**
| 목적 | 라이브러리 |
|------|-----------|
| 그래프 시각화 | d3, reactflow |
| 버전 파싱/비교 | semver |
| 클라이언트 상태 | zustand |
| 비동기 데이터 | @tanstack/react-query |
| 스키마 검증 | zod |

## Next.js 16 주의사항

- `middleware.ts` 대신 **`proxy.ts`** 사용
- Server Component 기본 — 인터랙티브한 곳에만 `'use client'`
- Tailwind CSS v4 — `tailwind.config` 없이 CSS에서 직접 설정

## 리스크 레벨 기준 (`src/shared/config`)

major 버전 차이 기준: 1→medium, 2→high, 3+→critical
