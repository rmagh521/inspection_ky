# Change History

## 2026-05-13

### 배포 CSS 깨짐 수정 (Middleware → Layout 인증 전환)
- `src/middleware.ts` — 삭제: Edge Functions 의존성 제거 (Deno EBUSY 문제 근본 해결)
- `src/app/(dashboard)/layout.tsx` — 수정: `cookies()` + `redirect()` 기반 서버사이드 인증 체크 추가

### 검사 스펙 + 기술 상관관계 데이터 확장

**타입 정의**
- `src/types/data.ts` — 수정: InspectionPoint에 resolutionSpec/precisionSpec/speedSpec/fovSpec/keyEquipmentType 추가, TechRelation/TechSpec 인터페이스 신규, Technology에 relations/specs 추가

**XLSX 데이터 생성**
- `scripts/generate-xlsx.ts` — 수정: 
  - 검사포인트 122개에 5개 스펙 컬럼 데이터 추가 (inspSpecMap 룩업 방식)
  - HBM4/LPDDR5X/LPDDR6은 기반 제품 스펙 상속+오버라이드
  - `기술상관관계` 시트 신규 (~48개 관계: PREREQUISITE/SYNERGY/ENABLES)
  - `기술스펙` 시트 신규 (~68개 항목: 현재스펙 vs 요구스펙, 충족여부)
  - XLSX 시트 수: 10 → 12개

**데이터 레이어**
- `src/lib/xlsx-data.ts` — 수정:
  - getTechRelations() 함수 추가 (기술상관관계 시트 리더)
  - getTechSpecs() 함수 추가 (기술스펙 시트 리더)
  - getTechnologies() — 관계/스펙 데이터를 각 기술에 조인
  - REQUIRED_SHEETS에 "기술상관관계", "기술스펙" 추가

**검사포인트 UI**
- `src/app/(dashboard)/inspection-points/inspection-points-table.tsx` — 수정: "검사 스펙" 컬럼 추가 (해상도/정밀도/속도/장비유형 Badge)
- `src/app/(dashboard)/inspection-points/page.tsx` — 수정: 테이블 데이터에 5개 스펙 필드 매핑

**기술 페이지 UI**
- `src/app/(dashboard)/technologies/technologies-client.tsx` — 수정:
  - 기술 카드에 스펙 섹션 추가 (현재 vs 요구, CheckCircle2/XCircle 충족여부)
  - 기술 카드에 관계 섹션 추가 (최대 3개, 유형별 Badge)
  - 상단에 기술 의존성 그래프 차트 추가

**의존성 그래프 (신규)**
- `src/components/charts/tech-dependency-graph.tsx` — 생성:
  - SVG 기반 인터랙티브 네트워크 그래프
  - 카테고리별 3열 레이아웃 (광학/센서, 소프트웨어, 하드웨어)
  - 관계 유형별 엣지 스타일 (실선/점선/화살표)
  - 노드 호버 시 연결된 노드/엣지 강조
  - Gap 수준별 노드 색상 (NONE/SMALL/MEDIUM/LARGE)

**제품 상세 UI**
- `src/app/(dashboard)/products/[name]/page.tsx` — 수정: 검사포인트 상세에 스펙 라인 추가 (해상도/정밀도/속도/FOV), 장비유형 Badge

**데이터 파일**
- `data/inspection-data.xlsx` — 재생성: 12개 시트, 122개 검사포인트 스펙 포함

## 2026-05-12

### Netlify 이전 (Cloudflare Workers → Netlify)

**삭제된 파일 (Cloudflare 전용)**
- `wrangler.jsonc` — 삭제: Cloudflare Workers 설정 (R2 바인딩, 환경변수)
- `open-next.config.ts` — 삭제: @opennextjs/cloudflare 어댑터 설정
- `cloudflare-env.d.ts` — 삭제: CloudflareEnv 타입 정의 (R2Bucket)
- `scripts/patch-chunks.js` — 삭제: Cloudflare 청크 패치 스크립트
- `scripts/otel-noop.js` — 삭제: OpenTelemetry noop 심

**설정 파일**
- `next.config.ts` — 수정: `initOpenNextCloudflareForDev()` 임포트/호출 제거, `output: "standalone"` 제거
- `netlify.toml` — 생성: Netlify 빌드 설정 (command, publish, 환경변수)
- `package.json` — 수정: `@opennextjs/cloudflare`, `wrangler` devDeps 제거, `build:cf`/`deploy`/`preview` 스크립트 제거

**데이터 레이어**
- `src/lib/xlsx-data.ts` — 수정: R2 버킷 코드 완전 제거
  - `loadWorkbook()`: R2 production 분기 제거, fs 단일 모드
  - `getXlsxMetadata()`: R2 production 분기 제거, fs 단일 모드
  - `invalidateCache()`: `loadingPromise` 참조 제거
  - `loadingPromise` 변수 제거

**API 라우트**
- `src/app/api/upload-xlsx/route.ts` — 수정: R2 PUT/백업 코드 제거, fs 단일 모드

### 신규 5개 제품군 XLSX DB 확장 (Substrate, CPO, PLP, Power, Cooling)

**데이터 생성 스크립트**
- `scripts/generate-xlsx.ts` — 수정: 10개 시트에 신규 5개 제품 데이터 추가
  - products 배열: 5개 신규 제품 추가 (Substrate, Optic (CPO), Panel (PLP), Power, Cooling, sortOrder 11-15)
  - 공정단계 배열 5개 생성: substrateSteps(11), cpoSteps(10), plpSteps(10), powerSteps(10), coolingSteps(9)
  - productStepMap: 5개 신규 매핑 추가
  - inspectionPoints: ~48개 신규 검사포인트 추가 (Substrate 10, CPO 10, PLP 10, Power 10, Cooling 8)
  - technologies: 기존 23개 적용제품 확장 + 5개 신규 기술 추가
    - Fiber Optical Alignment Metrology (CPO)
    - Photonic IC Waveguide Inspection (CPO)
    - Large Panel Flatness Mapping >600mm (PLP, Substrate)
    - Sintered Joint Porosity Analysis (Power)
    - Thermal Interface Void Detection (Cooling)
  - kyCapabilities: 5개 신규 역량분석 추가 (LARGE 2, MEDIUM 3)
  - devProjects: 6개 신규 개발 프로젝트 추가
  - strategicActions: 7개 신규 전략액션 추가

**유틸리티**
- `src/lib/utils.ts` — 수정: inspectionTypeLabel()에 3개 신규 검사유형 추가
  - OPTICAL_ALIGNMENT_INSPECTION → "Optical Alignment"
  - TIM_INSPECTION → "TIM Inspection"
  - SINTER_JOINT_INSPECTION → "Sinter Joint"

**데이터 파일**
- `data/inspection-data.xlsx` — 재생성: 15개 제품, ~122개 검사포인트, 36개 기술

### 신규 4개 제품군 XLSX DB 확장

**데이터 생성 스크립트**
- `scripts/generate-xlsx.ts` — 수정: 10개 시트에 신규 4개 제품 데이터 추가
  - products 배열: 4개 신규 제품 추가 (ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer)
  - 공정단계 배열 4개 생성: gpuWaferSteps(10), cowosSteps(12), soicSteps(11), thinWaferSteps(9)
  - productStepMap: 4개 신규 매핑 추가
  - inspectionPoints: ~42개 신규 검사포인트 추가
  - technologies: 기존 27개 적용제품 확장 + 4개 신규 기술 추가
    - Hybrid Bonding Surface Metrology
    - Wafer Warpage Measurement
    - Large-area Stitching Inspection
    - Ultra-thin Die Handling (<30μm)
  - kyCapabilities: 4개 신규 역량분석 추가
  - devProjects: 5개 신규 개발 프로젝트 추가
  - strategicActions: 6개 신규 전략액션 추가

**유틸리티**
- `src/lib/utils.ts` — 수정: inspectionTypeLabel()에 4개 신규 검사유형 추가
  - SURFACE_ROUGHNESS_METROLOGY → "Surface Roughness"
  - CONTINUITY_TEST → "Electrical Continuity"
  - BOND_QUALITY_INSPECTION → "Bond Quality"
  - WARPAGE_METROLOGY → "Warpage Metrology"

**데이터 파일**
- `data/inspection-data.xlsx` — 재생성: 10개 제품, ~74개 검사포인트, 31개 기술

### Phase 1: Cloudflare Pages + R2 배포 인프라

**Cloudflare 설정 파일**
- `wrangler.jsonc` — 생성: Cloudflare Workers 설정 (R2 바인딩, 환경변수)
- `open-next.config.ts` — 생성: @opennextjs/cloudflare 어댑터 설정
- `cloudflare-env.d.ts` — 생성: CloudflareEnv 타입 (R2Bucket, SITE_PASSWORD)
- `next.config.ts` — 수정: initOpenNextCloudflareForDev() 추가

**데이터 레이어 비동기 전환**
- `src/lib/xlsx-data.ts` — 수정: 전체 함수 async 전환, R2/fs 이중 모드
  - Production: Cloudflare R2에서 XLSX 읽기 (getCloudflareContext)
  - Development: 로컬 fs + mtime 캐시 (기존 동작 유지)
  - loadWorkbook() 비동기 + loading promise (경쟁 조건 방지)

**페이지 컴포넌트 await 추가 (11개)**
- `src/app/(dashboard)/dashboard/page.tsx` — await 추가
- `src/app/(dashboard)/products/page.tsx` — await 추가
- `src/app/(dashboard)/products/[name]/page.tsx` — await 추가
- `src/app/(dashboard)/inspection-points/page.tsx` — await 추가
- `src/app/(dashboard)/equipment/page.tsx` — await 추가
- `src/app/(dashboard)/equipment/makers/page.tsx` — await 추가
- `src/app/(dashboard)/technologies/page.tsx` — await 추가
- `src/app/(dashboard)/ky-analysis/page.tsx` — await 추가
- `src/app/(dashboard)/roadmap/page.tsx` — await 추가
- `src/app/(dashboard)/reports/page.tsx` — await 추가
- `src/app/(dashboard)/admin/page.tsx` — await 추가

**API 라우트 R2 지원**
- `src/app/api/upload-xlsx/route.ts` — 수정: R2 PUT/백업 (prod) + fs (dev) 이중 모드
- `src/app/api/dashboard/route.ts` — 수정: await getDashboardStats()

**레이아웃 동적 렌더링**
- `src/app/(dashboard)/layout.tsx` — 수정: export const dynamic = "force-dynamic"

**패키지 업데이트**
- `package.json` — 수정: @opennextjs/cloudflare, wrangler 추가, build:cf/deploy/preview 스크립트 추가

### 인터랙티브 대시보드 업그레이드 (Phase 2~11)

**공통 인프라 (Phase 2~3)**
- `src/hooks/use-filter-params.ts` — 생성: URL searchParams 필터 훅
- `src/lib/filter-utils.ts` — 생성: filterByField, getUniqueValues 유틸
- `src/components/filters/filter-bar.tsx` — 생성: 재사용 필터바 (shadcn Select)
- `src/components/tables/data-table.tsx` — 수정: 페이지네이션, CSV 내보내기, 컬럼 표시/숨기기, 행 클릭
- `src/components/tables/data-table-pagination.tsx` — 생성: 페이지네이션 UI

**대시보드 인터랙티브 (Phase 4)**
- `src/app/(dashboard)/dashboard/page.tsx` — 수정: KPI 카드 Link 래핑
- `src/app/(dashboard)/dashboard/dashboard-client.tsx` — 생성: 차트 클릭→페이지 이동, 제품군 필터
- `src/components/charts/inspection-type-chart.tsx` — 수정: onBarClick prop
- `src/components/charts/gap-pie-chart.tsx` — 수정: onSliceClick prop
- `src/components/charts/coverage-bar-chart.tsx` — 수정: 그룹 바 차트 + 클릭
- `src/lib/xlsx-data.ts` — 수정: coverageByProduct 실데이터 계산
- `src/types/data.ts` — 수정: coverageByProduct 타입 변경

**각 페이지 클라이언트 컴포넌트 (Phase 5~10)**
- `src/app/(dashboard)/products/products-client.tsx` — 생성: 제품군/활성 필터
- `src/app/(dashboard)/inspection-points/inspection-points-table.tsx` — 수정: 4종 필터 + CSV 내보내기
- `src/app/(dashboard)/equipment/equipment-client.tsx` — 생성: 국가/검사유형 필터
- `src/app/(dashboard)/equipment/equipment-matrix.tsx` — 수정: 셀 클릭 Popover
- `src/app/(dashboard)/technologies/technologies-client.tsx` — 생성: 카테고리/Gap 필터 + 개선계획
- `src/app/(dashboard)/ky-analysis/ky-analysis-client.tsx` — 생성: 3탭 + 레이더/Gap 바 차트
- `src/app/(dashboard)/roadmap/roadmap-client.tsx` — 생성: 4종 필터 + 투자 요약

**신규 차트 (Phase 9)**
- `src/components/charts/ky-radar-chart.tsx` — 생성: 레이더 차트 (현재 vs 필요)
- `src/components/charts/ky-gap-bar-chart.tsx` — 생성: Gap 비교 수평 바 차트

**간트 차트 강화 (Phase 10)**
- `src/components/charts/gantt-chart.tsx` — 수정: 클릭→Dialog 상세, DevelopmentProject 타입

**보고서 (Phase 11)**
- `src/app/(dashboard)/reports/page.tsx` — 생성: 5섹션 통합 보고서
- `src/app/(dashboard)/reports/print-button.tsx` — 생성: 인쇄 버튼 클라이언트 컴포넌트
- `src/app/(dashboard)/reports/loading.tsx` — 생성: 로딩 스켈레톤
- `src/components/layout/nav-links.ts` — 수정: Reports 메뉴 추가

**기타**
- `tsconfig.json` — 수정: prisma 디렉토리 exclude 추가
- `prisma.config.ts` — 삭제: 레거시 Prisma 설정 파일

### Phase 6: XLSX 데이터 소스 전환
- `scripts/generate-xlsx.ts` — 생성: 10개 시트 XLSX 생성 스크립트
- `data/inspection-data.xlsx` — 생성: 메인 데이터 파일
- `src/types/data.ts` — 생성: XLSX용 TypeScript 인터페이스
- `src/lib/xlsx-data.ts` — 생성: SheetJS 데이터 레이어 (mtime 캐시, 12개 getter 함수)
- `src/app/(dashboard)/dashboard/page.tsx` — 수정: Prisma → getDashboardStats()
- `src/app/(dashboard)/products/page.tsx` — 수정: Prisma → getProducts()
- `src/app/(dashboard)/products/[name]/page.tsx` — 생성: 이름 기반 라우팅 (기존 [id] 대체)
- `src/app/(dashboard)/products/[id]/` — 삭제: ID 기반 라우트
- `src/app/(dashboard)/inspection-points/page.tsx` — 수정: Prisma → getInspectionPoints()
- `src/app/(dashboard)/equipment/page.tsx` — 수정: Prisma → getEquipmentMakers()
- `src/app/(dashboard)/equipment/makers/page.tsx` — 수정: Prisma → getEquipmentMakers()
- `src/app/(dashboard)/technologies/page.tsx` — 수정: Prisma → getTechnologies()
- `src/app/(dashboard)/ky-analysis/page.tsx` — 수정: Prisma → getKYProducts/Capabilities()
- `src/app/(dashboard)/roadmap/page.tsx` — 수정: Prisma → getDevelopmentProjects()
- `src/app/api/dashboard/route.ts` — 수정: Prisma → getDashboardStats()
- `src/components/charts/process-flow-diagram.tsx` — 수정: id → name 기반 키
- `src/components/charts/gantt-chart.tsx` — 수정: id → name 기반 키

### Phase 7: XLSX 업로드 + 관리 페이지
- `src/app/api/upload-xlsx/route.ts` — 생성: XLSX 업로드 API (검증, 백업, 캐시 무효화)
- `src/app/(dashboard)/admin/page.tsx` — 생성: 관리 페이지 (파일 메타정보 표시)
- `src/app/(dashboard)/admin/xlsx-uploader.tsx` — 생성: 업로드 클라이언트 컴포넌트
- `src/components/layout/nav-links.ts` — 수정: Admin 메뉴 추가

### Phase 8: Prisma 의존성 제거
- `src/lib/prisma.ts` — 삭제
- `src/types/index.ts` — 삭제 (Prisma 타입 re-export)
- `src/generated/prisma/` — 삭제 (생성된 Prisma 클라이언트)
- `package.json` — 수정: prisma, @prisma/client, @prisma/adapter-pg, @auth/prisma-adapter 제거, db:* 스크립트 제거, generate-xlsx 스크립트 추가

## 2026-05-11

### Phase 1: Foundation
- `prisma/schema.prisma` — 생성: 17 모델, 10 Enum 전체 스키마
- `prisma/seed.ts` + `prisma/seed-data/*.ts` — 7개 시드 모듈
- `prisma.config.ts` — Prisma 7.x 설정
- `src/lib/prisma.ts` — PrismaClient 싱글톤 (PrismaPg adapter)
- `src/lib/utils.ts` — 유틸리티 함수 (cn, formatCurrency, gapLevelToColor 등)

### Phase 2: Layout + Dashboard + Products + Inspection Points
- `src/app/layout.tsx` — 루트 레이아웃 (TooltipProvider)
- `src/app/page.tsx` — /dashboard 리디렉트
- `src/app/(dashboard)/layout.tsx` — 대시보드 셸 (Sidebar + Header)
- `src/components/layout/sidebar.tsx` — 접이식 사이드바
- `src/components/layout/header.tsx` — 페이지 타이틀 헤더
- `src/components/layout/nav-links.ts` — 네비게이션 설정
- `src/app/(dashboard)/dashboard/page.tsx` — KPI 카드 + 차트 홈
- `src/app/(dashboard)/products/page.tsx` — 제품 목록
- `src/app/(dashboard)/products/[id]/page.tsx` — 제품 상세 (공정 흐름도)
- `src/app/(dashboard)/inspection-points/page.tsx` — 검사 포인트 테이블

### Phase 3: Equipment + Technologies
- `src/app/(dashboard)/equipment/page.tsx` — 장비 비교 매트릭스
- `src/app/(dashboard)/equipment/equipment-matrix.tsx` — 매트릭스 컴포넌트
- `src/app/(dashboard)/equipment/makers/page.tsx` — 메이커 목록
- `src/app/(dashboard)/technologies/page.tsx` — 기술 + Gap 히트맵

### Phase 4: KY Analysis
- `src/app/(dashboard)/ky-analysis/page.tsx` — 3탭 분석 (제품/역량/커버리지)

### Phase 5: Roadmap
- `src/app/(dashboard)/roadmap/page.tsx` — 간트 차트 + 전략 타임라인

### Charts & Tables
- `src/components/charts/gap-pie-chart.tsx` — Gap 분포 파이 차트
- `src/components/charts/coverage-bar-chart.tsx` — 커버리지 바 차트
- `src/components/charts/inspection-type-chart.tsx` — 검사 유형 분포
- `src/components/charts/gap-heatmap.tsx` — 기술 Gap 히트맵
- `src/components/charts/process-flow-diagram.tsx` — 공정 흐름도
- `src/components/charts/gantt-chart.tsx` — 간트 차트
- `src/components/tables/data-table.tsx` — TanStack 범용 테이블

### Loading States
- 모든 대시보드 페이지에 `loading.tsx` 추가
