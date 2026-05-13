# Chat History

## 2026-05-13

### 요청: 배포 사이트 CSS 깨짐 수정
- **시간**: 오후
- **내용**: https://inspection-dashboard-ky.netlify.app 접속 시 CSS가 전혀 적용되지 않는 문제 수정 요청
- **원인**: `--no-build --dir=.next` 배포로 `@netlify/plugin-nextjs` 후처리가 생략되어, `_next/static/chunks/*.css` 파일이 Netlify CDN에 매핑되지 않음 (404 반환)
- **해결**: middleware.ts 삭제 → 대시보드 layout.tsx에서 서버사이드 쿠키 인증으로 대체 → Edge Functions(Deno) 불필요 → 정상 빌드+배포
- **주요 변경**:
  - `src/middleware.ts` — 삭제 (Edge Functions/Deno EBUSY 이슈 원인)
  - `src/app/(dashboard)/layout.tsx` — 수정: `cookies()` 기반 서버사이드 인증 체크 추가 (미인증 시 /login 리다이렉트)
- **배포**: `npx netlify deploy --prod` (정상 빌드+플러그인 처리+배포)

### 요청: 검사 스펙 + 기술 스택 상관관계 데이터 추가 및 UI 업데이트
- **시간**: 새벽
- **내용**: XLSX DB에 2가지 데이터 차원 추가 요청
  1. **요구 검사 스펙 및 기술 스펙** — 각 검사포인트의 정량적 검사 요구 사양 (해상도, 정밀도, 속도, FOV, 핵심장비유형)
  2. **기술 스택 간 상관관계 및 선행 기술** — 기술 간 의존성 그래프 (PREREQUISITE/SYNERGY/ENABLES)
- **결과**: 전체 구현 완료. XLSX 12개 시트 확장 → 빌드 성공 → Netlify 배포 완료
  - URL: https://inspection-dashboard-ky.netlify.app
- **주요 변경**:
  - `src/types/data.ts` — InspectionPoint에 5개 스펙 필드 추가, TechRelation/TechSpec 인터페이스 신규, Technology에 relations/specs 추가
  - `scripts/generate-xlsx.ts` — 검사포인트 122개에 5개 스펙 컬럼 데이터 추가, 기술상관관계 시트 (~48개 관계), 기술스펙 시트 (~68개 스펙) 신규
  - `src/lib/xlsx-data.ts` — getTechRelations(), getTechSpecs() 함수 추가, getTechnologies()에 관계/스펙 조인, REQUIRED_SHEETS 2개 추가
  - `src/app/(dashboard)/inspection-points/inspection-points-table.tsx` — "검사 스펙" 컬럼 추가 (해상도/정밀도/속도/장비유형)
  - `src/app/(dashboard)/inspection-points/page.tsx` — 테이블 데이터에 5개 스펙 필드 매핑
  - `src/app/(dashboard)/technologies/technologies-client.tsx` — 기술 카드에 스펙 표시(충족/미충족 아이콘), 관계 표시, 의존성 그래프 차트 추가
  - `src/components/charts/tech-dependency-graph.tsx` — 신규 생성: SVG 기반 인터랙티브 기술 의존성 그래프 (노드 호버 시 연결 강조)
  - `src/app/(dashboard)/products/[name]/page.tsx` — 검사포인트 상세에 스펙 표시 (해상도/정밀도/속도/FOV/장비유형)
- **배포**: `npx netlify deploy --prod --no-build` (로컬 빌드 후 직접 배포, Deno EBUSY 이슈 우회)

## 2026-05-12

### 요청: Netlify 이전 (Cloudflare Workers → Netlify)
- **시간**: 저녁
- **내용**: Cloudflare Workers 배포 시 Windows 환경에서 Turbopack 청크 인라이닝 실패 + 500 에러 지속. Netlify로 전체 이전
- **결과**: 전체 이전 완료. Netlify 배포 성공
  - URL: https://inspection-dashboard-ky.netlify.app
- **주요 변경**:
  - Cloudflare 파일 5개 삭제: `wrangler.jsonc`, `open-next.config.ts`, `cloudflare-env.d.ts`, `scripts/patch-chunks.js`, `scripts/otel-noop.js`
  - `next.config.ts` — `initOpenNextCloudflareForDev()` 제거, `output: "standalone"` 제거
  - `src/lib/xlsx-data.ts` — R2 버킷 코드 제거, fs 단일 모드로 단순화
  - `src/app/api/upload-xlsx/route.ts` — R2 코드 제거, fs 단일 모드
  - `package.json` — `@opennextjs/cloudflare`, `wrangler` 의존성 제거, `build:cf`/`deploy`/`preview` 스크립트 제거
  - `netlify.toml` — 생성 (빌드 설정, 환경변수)
- **배포**: Netlify CLI (`netlify-cli deploy --prod`) 사용
  - Deno Edge Functions 번들링 시 Windows EBUSY 이슈 해결 (수동 Deno 설치)
  - 프로덕션 모든 페이지 정상 동작 확인 (15개 제품, 122개 검사포인트, 36개 기술)

### 요청: 신규 5개 제품군 XLSX DB 추가 (Substrate, CPO, PLP, Power, Cooling)
- **시간**: 저녁
- **내용**: 기존 10개 제품과 동일한 분석 방식으로 5개 신규 제품/공정 카테고리 데이터를 XLSX DB 10개 시트에 추가
  - Substrate — Advanced Packaging 기판 (C4/C2 Bump, Glass Core TGV, 대형 기판 워피지/동일평면도)
  - Optic (CPO) — Co-Packaged Optics (TSMC COUPE, PIC-EIC Assembly, FAU, Fiber)
  - Panel (PLP) — Panel Level Packaging (600×600mm+ 대면적, 워피지, 핸들링)
  - Power — Power Semiconductor Packaging (SiC/GaN 소결 접합, 후막 Cu, 클립 본딩)
  - Cooling — Advanced Thermal Management (TIM 도포/보이드 검사, 히트스프레더, 베이퍼 챔버)
- **결과**: 전체 구현 완료. XLSX 재생성 → R2 업로드 → Cloudflare Workers 재배포 성공
- **주요 변경**:
  - `scripts/generate-xlsx.ts` — 10개 시트 전체에 신규 데이터 추가
    - products: 5개 신규 제품 (sortOrder 11-15)
    - 공정단계: 50개 신규 (Substrate 11, CPO 10, PLP 10, Power 10, Cooling 9)
    - 검사포인트: ~48개 신규 (제품별 8-10개)
    - 기술스택: 5개 신규 기술 + 기존 23개 적용제품 확장
    - KY역량분석: 5개 신규 (Gap: LARGE 2, MEDIUM 3)
    - 개발로드맵: 6개 신규 프로젝트
    - 전략액션: 7개 신규
  - `src/lib/utils.ts` — inspectionTypeLabel()에 3개 신규 검사유형 추가
    - OPTICAL_ALIGNMENT_INSPECTION, TIM_INSPECTION, SINTER_JOINT_INSPECTION
  - `data/inspection-data.xlsx` — XLSX 재생성 (15개 제품, ~122개 검사포인트, 36개 기술)
- **배포**: R2 업로드 + OpenNext 빌드 + Cloudflare Workers 배포 완료
  - URL: https://inspection-dashboard.geumho-seo.workers.dev

### 요청: 신규 4개 제품군 XLSX DB 추가
- **시간**: 오후
- **내용**: 기존 6개 제품(HBM3E, HBM4, SOCAMM, LPDDR5/5X/6)과 동일한 분석 방식으로 4개 신규 제품/공정 카테고리 데이터를 XLSX DB 10개 시트에 추가
  - ASIC/GPU Wafer (Bump, RDL)
  - 2.5D CoWoS (TC Bonding) & Interposer
  - 3D SoIC / V-Cache (Hybrid Bonding)
  - Thin Wafer (Handling, Process)
- **결과**: 전체 구현 완료. XLSX 재생성 → R2 업로드 → Cloudflare Workers 재배포 성공
- **주요 변경**:
  - `scripts/generate-xlsx.ts` — 10개 시트 전체에 신규 데이터 추가
    - products: 4개 신규 제품 (sortOrder 7-10)
    - 공정단계: 42개 신규 (GPU Wafer 10, CoWoS 12, SoIC 11, Thin Wafer 9)
    - 검사포인트: ~42개 신규 (제품별 9-12개)
    - 기술스택: 4개 신규 기술 + 기존 27개 적용제품 확장
    - KY역량분석: 4개 신규 (Gap: LARGE 2, MEDIUM 2)
    - 개발로드맵: 5개 신규 프로젝트 (CRITICAL 3, HIGH 2)
    - 전략액션: 6개 신규 (SHORT/MID/LONG_TERM)
  - `src/lib/utils.ts` — inspectionTypeLabel()에 4개 신규 검사유형 추가
    - SURFACE_ROUGHNESS_METROLOGY, CONTINUITY_TEST, BOND_QUALITY_INSPECTION, WARPAGE_METROLOGY
  - `data/inspection-data.xlsx` — XLSX 재생성
- **배포**: R2 업로드 + OpenNext 빌드 + Cloudflare Workers 배포 완료
  - URL: https://inspection-dashboard.geumho-seo.workers.dev

### 요청: Cloudflare Workers 런타임 오류 수정 (ChunkLoadError)
- **시간**: 오전
- **내용**: `.open-next` 디렉토리가 workerd 프로세스(PID 59948)에 의해 잠겨 webpack 재빌드 실패. ChunkLoadError 발생
- **결과**: workerd 프로세스 종료 → `.open-next` 삭제 → webpack 재빌드 → 재배포 성공
- **관련 파일**: `.open-next/`, `next.config.ts` (output: "standalone" 유지)

### 요청: Cloudflare Pages + R2 배포 (Phase 1)
- **내용**: 대시보드를 Cloudflare Pages에 배포하여 온라인 접속 가능하도록 전환. R2 스토리지에 XLSX 파일 저장, @opennextjs/cloudflare 어댑터 사용
- **결과**: 빌드 성공 (`npx opennextjs-cloudflare build` 통과). 배포 준비 완료
- **주요 변경**:
  - `wrangler.jsonc` — Cloudflare Workers 설정 (R2 `XLSX_BUCKET` 바인딩)
  - `open-next.config.ts` — OpenNext Cloudflare 어댑터 설정
  - `cloudflare-env.d.ts` — R2Bucket 타입 정의
  - `next.config.ts` — initOpenNextCloudflareForDev() 추가
  - `src/lib/xlsx-data.ts` — 전체 함수 async 전환, R2(prod)/fs(dev) 이중 모드
  - 11개 page.tsx — await 추가
  - `src/app/api/upload-xlsx/route.ts` — R2 PUT 지원
  - `src/app/(dashboard)/layout.tsx` — force-dynamic 설정
  - `package.json` — build:cf, deploy, preview 스크립트 추가

### 요청: 인터랙티브 대시보드 + 온라인 배포 (Phase 2~11)
- **내용**: 필터/보고서/상호작용이 포함된 인터랙티브 대시보드로 업그레이드. URL 기반 필터, 차트 클릭 드릴다운, CSV 내보내기, 페이지네이션, 레이더/Gap 바 차트, 인터랙티브 간트, 통합 보고서 페이지 추가
- **결과**: Phase 2~11 전체 구현 완료. 빌드 성공 (18 routes)
- **주요 변경**:
  - `src/hooks/use-filter-params.ts` — URL searchParams 기반 필터 상태 관리 훅
  - `src/lib/filter-utils.ts` — 클라이언트 필터링 유틸 함수
  - `src/components/filters/filter-bar.tsx` — 재사용 필터바 (shadcn Select)
  - `src/components/tables/data-table.tsx` — DataTable 강화 (페이지네이션, CSV 내보내기, 컬럼 표시/숨기기, 행 클릭)
  - `src/components/tables/data-table-pagination.tsx` — 페이지네이션 UI
  - `src/app/(dashboard)/dashboard/dashboard-client.tsx` — 대시보드 차트 클릭 핸들러 + 제품군 필터
  - `src/app/(dashboard)/products/products-client.tsx` — 제품 제품군/활성 필터
  - `src/app/(dashboard)/inspection-points/inspection-points-table.tsx` — 검사포인트 4종 필터 + CSV 내보내기
  - `src/app/(dashboard)/equipment/equipment-client.tsx` — 장비 국가/검사유형 필터
  - `src/app/(dashboard)/equipment/equipment-matrix.tsx` — 매트릭스 셀 클릭 Popover
  - `src/app/(dashboard)/technologies/technologies-client.tsx` — 기술 카테고리/Gap 필터 + 개선계획 접기
  - `src/app/(dashboard)/ky-analysis/ky-analysis-client.tsx` — KY 3탭 (제품/역량/시각화) + 필터
  - `src/components/charts/ky-radar-chart.tsx` — 레이더 차트 (현재 vs 필요)
  - `src/components/charts/ky-gap-bar-chart.tsx` — Gap 비교 수평 바 차트
  - `src/app/(dashboard)/roadmap/roadmap-client.tsx` — 로드맵 4종 필터 + 투자 요약 카드
  - `src/components/charts/gantt-chart.tsx` — 인터랙티브 간트 (클릭→Dialog 상세)
  - `src/app/(dashboard)/reports/` — 통합 보고서 (5섹션, 인쇄 최적화)
  - 차트 컴포넌트 3종에 클릭 핸들러 추가 (inspection-type, gap-pie, coverage-bar)
  - `src/components/layout/nav-links.ts` — Reports 메뉴 추가
  - `src/lib/xlsx-data.ts` — coverageByProduct 실데이터 계산
  - `tsconfig.json` — prisma 디렉토리 제외
  - `prisma.config.ts` 삭제 (레거시 잔여물)

### 요청: XLSX 기반 데이터 소스 전환 + 업로드 기능
- **내용**: PostgreSQL/Prisma → XLSX 파일 기반 데이터 아키텍처로 전환. XLSX를 유일한 데이터 소스로 사용하고, 웹에서 업로드 가능한 관리 페이지 추가
- **결과**: 10개 시트 XLSX 생성 스크립트, mtime 캐시 데이터 레이어, 전체 9개 페이지 마이그레이션, 관리자 업로드 페이지 완성
- **주요 변경**:
  - `scripts/generate-xlsx.ts` — XLSX 생성 스크립트 (10개 시트, ~200행)
  - `src/lib/xlsx-data.ts` — SheetJS 기반 데이터 레이어 (mtime 캐시)
  - `src/types/data.ts` — XLSX용 TypeScript 인터페이스
  - 전체 9개 대시보드 페이지 Prisma→XLSX 마이그레이션
  - `src/app/(dashboard)/admin/` — XLSX 업로드 관리 페이지
  - `src/app/api/upload-xlsx/route.ts` — 업로드 API (검증 + 백업)
  - Prisma 의존성 완전 제거 (패키지, 생성코드, lib)

## 2026-05-11

### 요청: 반도체/SMT 광학 검사 분석 대시보드 구축
- **내용**: HBM/SOCAMM/LPDDR 광학 검사 요구사항 분석 데이터를 DB화하여 웹 대시보드 구축
- **결과**: PostgreSQL + Next.js 16 + Prisma 7 + shadcn/ui 풀스택 대시보드 완성 (이후 XLSX로 전환)
- **주요 파일**:
  - `prisma/schema.prisma` — 17모델, 10 Enum DB 스키마
  - `prisma/seed-data/` — 7개 시드 모듈 (~200 레코드)
  - `src/app/(dashboard)/` — 7개 대시보드 페이지
  - `src/components/charts/` — 6개 시각화 컴포넌트
  - `src/components/tables/data-table.tsx` — 범용 DataTable
