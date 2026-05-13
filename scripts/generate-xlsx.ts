import * as XLSX from "xlsx";
import * as path from "path";

const OUTPUT_PATH = path.join(__dirname, "..", "data", "inspection-data.xlsx");

// ===== PRODUCTS =====
const products = [
  { 제품명: "HBM3E", 제품군: "HBM", 세대: "3E", 설명: "High Bandwidth Memory 3E. 8~12Hi 다이 적층, TSV 기반 수직 연결, ~27μm 범프 피치. AI/HPC GPU 메모리로 사용.", 활성: true, 정렬순서: 1 },
  { 제품명: "HBM4", 제품군: "HBM", 세대: "4", 설명: "High Bandwidth Memory 4세대. 12~16Hi 적층, ~9μm 범프 피치 목표. 하이브리드 본딩 전환 가능성. 차세대 AI 가속기용.", 활성: true, 정렬순서: 2 },
  { 제품명: "SOCAMM", 제품군: "SOCAMM", 세대: "", 설명: "System on Chip Advanced Memory Module. NVIDIA 주도 신규 폼팩터. SoC + LPDDR 메모리를 하나의 고밀도 모듈에 통합. AI/Edge 컴퓨팅 타겟.", 활성: true, 정렬순서: 3 },
  { 제품명: "LPDDR5", 제품군: "LPDDR", 세대: "5", 설명: "Low Power DDR5. 모바일/노트북용 저전력 메모리. 6400Mbps, PoP(Package on Package) 또는 독립 패키지.", 활성: true, 정렬순서: 4 },
  { 제품명: "LPDDR5X", 제품군: "LPDDR", 세대: "5X", 설명: "Low Power DDR5X. LPDDR5 확장 버전, 8533Mbps. AI 온디바이스 처리를 위한 고대역 저전력 메모리.", 활성: true, 정렬순서: 5 },
  { 제품명: "LPDDR6", 제품군: "LPDDR", 세대: "6", 설명: "Low Power DDR6 (차세대). 14400Mbps 목표. FOWLP 적용 확대 예상. 2026-2027 양산 목표.", 활성: true, 정렬순서: 6 },
  { 제품명: "ASIC/GPU Wafer", 제품군: "GPU/ASIC", 세대: "", 설명: "ASIC/GPU용 웨이퍼 레벨 Advanced Packaging. Bump(Cu Pillar/μBump) 및 RDL 형성 공정. NVIDIA/AMD/Intel GPU, AI 가속기 SoC 기판.", 활성: true, 정렬순서: 7 },
  { 제품명: "2.5D CoWoS", 제품군: "CoWoS", 세대: "", 설명: "TSMC Chip-on-Wafer-on-Substrate. 실리콘 인터포저 위에 GPU+HBM 다이를 TC 본딩으로 집적. NVIDIA H100/B200, AMD MI300X 등 대면적 패키지.", 활성: true, 정렬순서: 8 },
  { 제품명: "3D SoIC", 제품군: "SoIC", 세대: "", 설명: "TSMC 3D System-on-Integrated-Chips. Cu-Cu 하이브리드 본딩(Bump-less). AMD V-Cache(3D 적층 L3 캐시), 차세대 chiplet 통합. <1μm 접합 피치.", 활성: true, 정렬순서: 9 },
  { 제품명: "Thin Wafer", 제품군: "Wafer Process", 세대: "", 설명: "극박 웨이퍼(<50μm) 핸들링 및 가공 공정. 캐리어 접합/분리, 박형화, 검사. HBM/CoWoS/SoIC 공통 요소 기술.", 활성: true, 정렬순서: 10 },
  { 제품명: "Substrate", 제품군: "Substrate", 세대: "", 설명: "Advanced Packaging 기판. ABF/Glass Core 기판 위 C4/C2 솔더 범프 형성, 대형 기판 워피지/동일평면도 관리. 차세대 Glass Core TGV(Through Glass Via) 포함.", 활성: true, 정렬순서: 11 },
  { 제품명: "Optic (CPO)", 제품군: "CPO", 세대: "", 설명: "Co-Packaged Optics. TSMC COUPE(Compact Universal Photonic Engine) 플랫폼 기반 Photonic IC-Electronic IC 통합. PIC-EIC Assembly, FAU 부착, 광섬유 커넥터. 데이터센터 고대역 인터커넥트.", 활성: true, 정렬순서: 12 },
  { 제품명: "Panel (PLP)", 제품군: "PLP", 세대: "", 설명: "Panel Level Packaging. 600×600mm+ 대면적 사각 패널 기반 패키징. 웨이퍼 대비 3배 이상 생산성. 워피지 관리, 대면적 검사, 핸들링이 핵심 과제.", 활성: true, 정렬순서: 13 },
  { 제품명: "Power", 제품군: "Power", 세대: "", 설명: "Power Semiconductor Packaging. SiC/GaN 광대역 반도체 파워 모듈. 소결(Sinter) 접합, 후막 Cu, 클립 본딩, 열 비아. 전기차/산업용 전력 변환.", 활성: true, 정렬순서: 14 },
  { 제품명: "Cooling", 제품군: "Cooling", 세대: "", 설명: "Advanced Thermal Management. AI GPU/HBM 스택용 TIM(열전도 소재) 도포, 히트스프레더/리드 부착, 베이퍼 챔버 통합. 열 인터페이스 보이드 검출 핵심.", 활성: true, 정렬순서: 15 },
];

// ===== PROCESS STEPS =====
interface StepRow {
  제품명: string;
  단계순서: number;
  단계명: string;
  설명: string;
  검사필요: boolean;
}

const hbmSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Wafer Fabrication", 설명: "DRAM 회로 형성 (Front-end)", 검사필요: true },
  { 단계순서: 2, 단계명: "TSV Etch", 설명: "Via 홀 식각 (Deep RIE). Via 깊이 50~100μm, 직경 5~10μm", 검사필요: true },
  { 단계순서: 3, 단계명: "TSV Insulation & Barrier", 설명: "절연막/배리어 증착 (SiO2, TiN, Ta 등)", 검사필요: true },
  { 단계순서: 4, 단계명: "TSV Cu Fill & CMP", 설명: "Cu 전기도금(ECD) 충전 + CMP 평탄화. Cu Void 검사 필수", 검사필요: true },
  { 단계순서: 5, 단계명: "RDL Formation", 설명: "재배선층(Redistribution Layer) 형성. 미세 패턴 검사 필요", 검사필요: true },
  { 단계순서: 6, 단계명: "Micro-Bump Formation", 설명: "Cu Pillar + Solder Cap 형성. HBM3E: ~27μm pitch, HBM4: ~9μm pitch", 검사필요: true },
  { 단계순서: 7, 단계명: "Wafer Thinning", 설명: "배면 연삭(Backgrinding)으로 ~30-50μm 두께 박형화", 검사필요: true },
  { 단계순서: 8, 단계명: "Wafer Dicing", 설명: "다이 개편화. Chipping 검사 필요", 검사필요: true },
  { 단계순서: 9, 단계명: "Die Stacking (TC Bonding)", 설명: "Thermo-Compression 본딩으로 다이 적층 (8Hi~16Hi). 정렬 정확도 ±0.5μm 이내 필요", 검사필요: true },
  { 단계순서: 10, 단계명: "MUF (Molded Underfill)", 설명: "몰드 언더필 충전. Void가 열적/기계적 신뢰성 저하 유발", 검사필요: true },
  { 단계순서: 11, 단계명: "Stack Singulation", 설명: "스택 개편화. Edge defect 검사", 검사필요: true },
  { 단계순서: 12, 단계명: "Interposer/Base Die Attach", 설명: "로직 다이(base) 또는 인터포저에 HBM 스택 접합", 검사필요: true },
  { 단계순서: 13, 단계명: "Ball Attach", 설명: "BGA 솔더볼 부착. 3D Ball Height/Missing/Coplanarity 검사", 검사필요: true },
  { 단계순서: 14, 단계명: "Final Visual Inspection", 설명: "외관 최종 검사. Surface Defect, Marking 확인", 검사필요: true },
];

const socammSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "PCB/Substrate 수입검사", 설명: "기판 품질 확인. Pattern Defect, Via Integrity 검사", 검사필요: true },
  { 단계순서: 2, 단계명: "Solder Paste Printing", 설명: "솔더 페이스트 스텐실 인쇄. 체적/높이/면적 정밀 제어 필요", 검사필요: true },
  { 단계순서: 3, 단계명: "Component Placement", 설명: "SoC + LPDDR PoP 등 고밀도 부품 실장. Fine-pitch BGA 정확도 중요", 검사필요: true },
  { 단계순서: 4, 단계명: "Reflow Soldering", 설명: "리플로우 납땜. 온도 프로파일 관리 및 솔더 조인트 품질 확보", 검사필요: true },
  { 단계순서: 5, 단계명: "Underfill/Encapsulation", 설명: "언더필 도포 및 경화. 커버리지 확인 필요", 검사필요: true },
  { 단계순서: 6, 단계명: "BGA Under-package Inspection", 설명: "패키지 하부 숨겨진 솔더 조인트 검사. X-ray 필수", 검사필요: true },
  { 단계순서: 7, 단계명: "Connector/Shield Assembly", 설명: "커넥터, 쉴드캔 조립 및 검증", 검사필요: true },
  { 단계순서: 8, 단계명: "ICT/FCT", 설명: "In-Circuit Test / Functional Test. 전기적 기능 검증", 검사필요: false },
  { 단계순서: 9, 단계명: "Final Visual Inspection", 설명: "외관 최종 검사. Surface/Marking AOI", 검사필요: true },
];

const lpddrSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Wafer Fabrication", 설명: "DRAM 회로 형성. LPDDR5/5X/6 셀 어레이 및 주변 회로", 검사필요: true },
  { 단계순서: 2, 단계명: "WLP/FOWLP Formation", 설명: "웨이퍼 레벨 패키징 또는 Fan-Out WLP. RDL/Bump 형성", 검사필요: true },
  { 단계순서: 3, 단계명: "Wafer Test & Dicing", 설명: "웨이퍼 테스트 후 다이싱. Crack/Chipping 검출", 검사필요: true },
  { 단계순서: 4, 단계명: "Die Attach", 설명: "다이 접착. 위치 정확도 및 접착제 도포 상태 확인", 검사필요: true },
  { 단계순서: 5, 단계명: "Wire Bonding", 설명: "와이어 본딩 (해당 패키지 타입). Loop Height, Bond Alignment", 검사필요: true },
  { 단계순서: 6, 단계명: "Flip Chip Bonding", 설명: "플립칩 접합 (해당 패키지 타입). Bump Contact, Alignment 검사", 검사필요: true },
  { 단계순서: 7, 단계명: "Molding", 설명: "EMC 몰딩. Void, Flash, Incomplete Fill 검사", 검사필요: true },
  { 단계순서: 8, 단계명: "Ball Attach", 설명: "BGA 솔더볼 부착. 3D Ball Height/Missing/Coplanarity", 검사필요: true },
  { 단계순서: 9, 단계명: "Laser Marking", 설명: "패키지 레이저 마킹. OCR/OCV로 마킹 품질 검증", 검사필요: true },
  { 단계순서: 10, 단계명: "Final Visual Inspection", 설명: "외관 최종 검사. Surface Defect, Contamination", 검사필요: true },
];

const gpuWaferSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Wafer Incoming Inspection", 설명: "베어 웨이퍼 표면/패턴 결함 검사. 후속 공정 영향 최소화", 검사필요: true },
  { 단계순서: 2, 단계명: "Passivation & Pad Open", 설명: "패시베이션 형성 및 Al/Cu 패드 오픈. 패드 노출 품질 확인", 검사필요: true },
  { 단계순서: 3, 단계명: "RDL Seed Layer Deposition", 설명: "RDL 시드층(Ti/Cu) 스퍼터링 증착. 막질/두께 균일성 관리", 검사필요: true },
  { 단계순서: 4, 단계명: "RDL Patterning (Litho + Etch)", 설명: "포토리소 + 식각으로 RDL 패턴 형성. L/S 2~5μm급", 검사필요: true },
  { 단계순서: 5, 단계명: "RDL Plating & CMP", 설명: "Cu 전기도금 후 CMP 평탄화. Void/Dishing 제어 중요", 검사필요: true },
  { 단계순서: 6, 단계명: "UBM (Under Bump Metallization)", 설명: "UBM 형성 (Ti/Ni/Cu 스택). 범프 접착/배리어 기능", 검사필요: true },
  { 단계순서: 7, 단계명: "Bump Plating (Cu Pillar + Solder Cap)", 설명: "Cu Pillar 전기도금 + 솔더 캡 형성. 높이/직경 균일성 핵심", 검사필요: true },
  { 단계순서: 8, 단계명: "Bump Reflow", 설명: "솔더 캡 리플로우 및 셀프 얼라인먼트. 범프 형상 최종 확정", 검사필요: true },
  { 단계순서: 9, 단계명: "Wafer Probe & Dicing", 설명: "웨이퍼 프로브 테스트 후 다이싱. KGD 선별 + Chipping 검사", 검사필요: true },
  { 단계순서: 10, 단계명: "Final Bump/RDL Inspection", 설명: "최종 범프/RDL 품질 확인. 전수 3D 검사 + 외관 확인", 검사필요: true },
];

const cowosSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Interposer Fabrication", 설명: "실리콘 인터포저 제조 (TSV + RDL 형성). 대면적 65×79mm급", 검사필요: true },
  { 단계순서: 2, 단계명: "Interposer TSV Etch & Fill", 설명: "인터포저 TSV 식각 및 Cu 충전. TSV 깊이 ~100μm", 검사필요: true },
  { 단계순서: 3, 단계명: "Interposer RDL Formation", 설명: "인터포저 미세 RDL(L/S ~2μm) 형성. 다층 Cu 배선", 검사필요: true },
  { 단계순서: 4, 단계명: "Interposer μBump Formation", 설명: "인터포저 상면 μBump 형성. ~40μm pitch 이하", 검사필요: true },
  { 단계순서: 5, 단계명: "Chip-on-Wafer (CoW) TC Bonding", 설명: "GPU/HBM 다이를 인터포저에 Thermo-Compression 본딩. 정렬 ±1μm", 검사필요: true },
  { 단계순서: 6, 단계명: "CoW Underfill (CUF/MUF)", 설명: "칩-인터포저 간 Capillary 또는 Molded Underfill 충전", 검사필요: true },
  { 단계순서: 7, 단계명: "CoW Inspection", 설명: "본딩 후 다이 정렬/접합 상태 검사. X-ray + Optical 병행", 검사필요: true },
  { 단계순서: 8, 단계명: "Interposer Thinning", 설명: "인터포저 배면 박형화 (~100μm). TSV 노출 준비", 검사필요: true },
  { 단계순서: 9, 단계명: "Interposer Backside Bumping", 설명: "인터포저 배면 C4 솔더 범프 형성. 유기기판 접합용", 검사필요: true },
  { 단계순서: 10, 단계명: "Wafer-on-Substrate (WoS) Bonding", 설명: "인터포저를 유기기판에 Mass Reflow 또는 TC 본딩", 검사필요: true },
  { 단계순서: 11, 단계명: "Package Molding & Lid Attach", 설명: "EMC 몰딩 및 히트스프레더/리드 부착. 열 방출 경로 확보", 검사필요: true },
  { 단계순서: 12, 단계명: "Final Package Inspection", 설명: "BGA 볼 검사, 외관 최종 검사. 대면적 패키지 전수 확인", 검사필요: true },
];

const soicSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Wafer Surface Preparation", 설명: "본딩면 CMP 초정밀 평탄화 (Ra <0.5nm). 하이브리드 본딩 핵심 전처리", 검사필요: true },
  { 단계순서: 2, 단계명: "Cu Pad / Oxide Hybrid Surface", 설명: "Cu 패드 + SiO2 유전체 하이브리드 표면 형성. Cu Dishing/Protrusion <5nm 제어", 검사필요: true },
  { 단계순서: 3, 단계명: "Wafer Dicing (Known Good Die)", 설명: "다이싱 + KGD(Known Good Die) 선별. Stealth Dicing으로 에지 품질 확보", 검사필요: true },
  { 단계순서: 4, 단계명: "Die-to-Wafer Alignment", 설명: "다이를 웨이퍼에 서브μm 정밀 정렬 배치. <0.2μm overlay 목표", 검사필요: true },
  { 단계순서: 5, 단계명: "Hybrid Bonding (Cu-Cu Direct)", 설명: "Cu-Cu 직접 접합. 상온 SiO2 접합 후 열처리로 Cu 확산 접합 완성 (300-400°C)", 검사필요: true },
  { 단계순서: 6, 단계명: "Post-Bond Anneal", 설명: "본딩 후 열처리 (300-400°C). Cu 확산 접합 완성, 인터페이스 강도 확보", 검사필요: true },
  { 단계순서: 7, 단계명: "Post-Bond Interface Inspection", 설명: "본딩 인터페이스 무결성 검사. Void, Delamination 검출. SAT + IR 병행", 검사필요: true },
  { 단계순서: 8, 단계명: "Thinning (Top Die)", 설명: "상부 다이 배면 박형화. 극박 연삭 + CMP", 검사필요: true },
  { 단계순서: 9, 단계명: "TSV Reveal & Via-last Process", 설명: "TSV 노출 + Via-last 공정 (필요 시). Cu 패드 노출 및 재배선", 검사필요: true },
  { 단계순서: 10, 단계명: "RDL & Bumping", 설명: "최상위 RDL 및 외부 연결 범프 형성. 최종 I/O 인터페이스", 검사필요: true },
  { 단계순서: 11, 단계명: "Final Inspection & Test", 설명: "최종 전기/광학 검사. 3D 적층 전체 무결성 확인", 검사필요: true },
];

const thinWaferSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Carrier Wafer Bonding", 설명: "캐리어 웨이퍼 임시 접합 (TBDB: Temporary Bonding/Debonding). 접착제/열 릴리즈 테이프", 검사필요: true },
  { 단계순서: 2, 단계명: "Backgrinding", 설명: "배면 연삭으로 ~30-50μm 두께 박형화. 연삭 스크래치, TTV 관리", 검사필요: true },
  { 단계순서: 3, 단계명: "Post-Grind Stress Relief", 설명: "연삭 후 응력 제거 (CMP/Dry Polish/Plasma Etch). 크랙 방지", 검사필요: true },
  { 단계순서: 4, 단계명: "Backside Processing", 설명: "배면 공정 (TSV Reveal, Metallization, RDL 등). 박형 상태 공정 진행", 검사필요: true },
  { 단계순서: 5, 단계명: "Thin Wafer Inspection", 설명: "박형 웨이퍼 두께/크랙/워피지 전수 검사. 후속 공정 투입 판정", 검사필요: true },
  { 단계순서: 6, 단계명: "Dicing (Thin Wafer)", 설명: "극박 웨이퍼 다이싱 (Stealth Dicing/Plasma Dicing). Chipping 최소화", 검사필요: true },
  { 단계순서: 7, 단계명: "Carrier Debonding", 설명: "캐리어 분리 (레이저/열/UV 릴리즈). 다이/웨이퍼 손상 방지 핵심", 검사필요: true },
  { 단계순서: 8, 단계명: "Post-Debond Cleaning & Inspection", 설명: "분리 후 접착제 잔류물 세정 + 표면 검사", 검사필요: true },
  { 단계순서: 9, 단계명: "Thin Die Handling & Pickup", 설명: "극박 다이 핸들링/픽업/이송. 비접촉 또는 저응력 척 사용", 검사필요: true },
];

const substrateSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Core Material Preparation", 설명: "ABF(Ajinomoto Build-up Film) 또는 Glass Core 기판 소재 준비. 소재별 특성 검사", 검사필요: true },
  { 단계순서: 2, 단계명: "Via Formation (Laser/Mechanical Drill)", 설명: "레이저 또는 기계적 드릴로 비아홀 형성. Glass Core: TGV(Through Glass Via)", 검사필요: true },
  { 단계순서: 3, 단계명: "Via Metallization (Cu Plating)", 설명: "비아 Cu 전기도금 충전. Void-free 충전 필수", 검사필요: true },
  { 단계순서: 4, 단계명: "RDL/Circuit Patterning", 설명: "재배선층 및 회로 패턴 형성. Fine pitch L/S 8~15μm급", 검사필요: true },
  { 단계순서: 5, 단계명: "Solder Mask Application", 설명: "솔더 마스크 도포 및 패터닝. 개구부 정밀도 관리", 검사필요: true },
  { 단계순서: 6, 단계명: "Pad Surface Finish (ENIG/OSP)", 설명: "패드 표면 처리 (ENIG, OSP, ENEPIG). 솔더 접합성 확보", 검사필요: true },
  { 단계순서: 7, 단계명: "C4/C2 Bump Formation", 설명: "솔더 범프 형성. C4(~130μm pitch), C2(~40μm pitch)", 검사필요: true },
  { 단계순서: 8, 단계명: "Bump Reflow", 설명: "범프 리플로우 및 셀프 얼라인먼트. 범프 형상 확정", 검사필요: true },
  { 단계순서: 9, 단계명: "Large Body Warpage Measurement", 설명: "대형 기판(~100mm+) 워피지/보우 전면 측정. 실장 가능 여부 판정", 검사필요: true },
  { 단계순서: 10, 단계명: "Coplanarity Measurement", 설명: "범프 동일평면도 전수 측정. 실장 시 접합 균일성 확보", 검사필요: true },
  { 단계순서: 11, 단계명: "Final Inspection & Singulation", 설명: "최종 외관 검사 + 개편화(스트립→유닛). 출하 전 게이트", 검사필요: true },
];

const cpoSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "PIC (Photonic IC) Fabrication", 설명: "실리콘 포토닉스 IC 제조. 도파관, 변조기, 광검출기 집적", 검사필요: true },
  { 단계순서: 2, 단계명: "EIC (Electronic IC) Fabrication", 설명: "전자 IC 제조. PIC 구동/제어 회로 (TIA, Driver)", 검사필요: true },
  { 단계순서: 3, 단계명: "PIC Waveguide Quality Inspection", 설명: "PIC 도파관 품질 검사. 손실, 결함, 패턴 정확도", 검사필요: true },
  { 단계순서: 4, 단계명: "PIC-EIC Hybrid Bonding/Assembly", 설명: "PIC-EIC 접합. TSMC COUPE 플랫폼 또는 OSAT 마이크로범프 본딩", 검사필요: true },
  { 단계순서: 5, 단계명: "Optical Alignment Verification", 설명: "광학 축 정렬 검증. PIC-EIC 간 광경로 정렬 확인", 검사필요: true },
  { 단계순서: 6, 단계명: "FAU (Fiber Array Unit) Attachment", 설명: "FAU 정밀 부착. Sub-μm 광학 정렬. 능동/수동 정렬 방식", 검사필요: true },
  { 단계순서: 7, 단계명: "Fiber Connector Assembly", 설명: "광섬유 커넥터 조립. MT/MPO 커넥터 정렬 및 고정", 검사필요: true },
  { 단계순서: 8, 단계명: "Optical Coupling Loss Test", 설명: "광 결합 손실 측정. PIC-Fiber 간 삽입 손실(IL) <1dB 목표", 검사필요: true },
  { 단계순서: 9, 단계명: "Package Assembly & Underfill", 설명: "패키지 조립 및 언더필 도포. 열 관리 + 기계적 보호", 검사필요: true },
  { 단계순서: 10, 단계명: "Final Optical/Electrical Test", 설명: "최종 광학/전기 통합 검사. BER, 대역폭, 소비 전력 검증", 검사필요: true },
];

const plpSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Panel Preparation (600×600mm+)", 설명: "대면적 사각 패널 소재 준비. 유리/유기 기판. 초기 평탄도 확인", 검사필요: true },
  { 단계순서: 2, 단계명: "RDL Formation (Panel-level)", 설명: "패널 레벨 재배선층 형성. 대면적 리소그래피 + Cu 도금", 검사필요: true },
  { 단계순서: 3, 단계명: "Panel Warpage Measurement (Pre-Die)", 설명: "다이 배치 전 패널 워피지/보우 전면 측정", 검사필요: true },
  { 단계순서: 4, 단계명: "Die Placement (Panel-level)", 설명: "대면적 패널 위 다수 다이 고속 배치. 정렬 정확도 관리", 검사필요: true },
  { 단계순서: 5, 단계명: "Molding/Encapsulation (Panel-level)", 설명: "패널 레벨 몰딩. 대면적 균일 충전 필수", 검사필요: true },
  { 단계순서: 6, 단계명: "Post-Mold Warpage Measurement", 설명: "몰딩 후 워피지 재측정. 열 수축에 의한 워피지 변화 관리", 검사필요: true },
  { 단계순서: 7, 단계명: "Backside Processing (RDL/Bump)", 설명: "배면 RDL 및 범프 형성. 패널 핸들링 중 파손 방지", 검사필요: true },
  { 단계순서: 8, 단계명: "Panel-level Electrical Test", 설명: "패널 상태에서 전기적 테스트. 불량 유닛 사전 선별", 검사필요: false },
  { 단계순서: 9, 단계명: "Singulation (Panel to Unit)", 설명: "대면적 패널 → 개별 유닛 분리. 다이싱/소잉", 검사필요: true },
  { 단계순서: 10, 단계명: "Final Unit Inspection", 설명: "개편화 후 유닛별 최종 검사. 외관, 범프, 마킹", 검사필요: true },
];

const powerSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Power Die Preparation (SiC/GaN)", 설명: "SiC/GaN 파워 다이 준비. 백 메탈(Back Metal) 상태 확인", 검사필요: true },
  { 단계순서: 2, 단계명: "DBC/AMB Substrate Preparation", 설명: "DBC(Direct Bonded Copper)/AMB(Active Metal Brazing) 세라믹 기판 준비", 검사필요: true },
  { 단계순서: 3, 단계명: "Die Attach (Sintered Ag/Cu)", 설명: "소결 접합(Sintered Silver/Copper) 다이 어태치. 260°C+ 고온 동작 대응", 검사필요: true },
  { 단계순서: 4, 단계명: "Sinter Joint Quality Inspection", 설명: "소결 조인트 보이드율, 두께, 균일성 검사. 열 저항 직결", 검사필요: true },
  { 단계순서: 5, 단계명: "Wire Bonding / Clip Bonding", 설명: "Al/Cu 와이어 본딩 또는 Cu 클립 본딩. 고전류(>100A) 경로 형성", 검사필요: true },
  { 단계순서: 6, 단계명: "Thick Cu Layer Inspection", 설명: "후막 Cu(>100μm) 레이어 패턴 및 두께 검사", 검사필요: true },
  { 단계순서: 7, 단계명: "Thermal Via Formation & Inspection", 설명: "열 비아 형성 및 충전 상태 검사. 열 방출 경로 확보", 검사필요: true },
  { 단계순서: 8, 단계명: "Molding/Encapsulation", 설명: "Transfer Mold 또는 Gel Fill. 고전압 절연 확보", 검사필요: true },
  { 단계순서: 9, 단계명: "Terminal/Lead Formation", 설명: "외부 단자(리드프레임/Cu Bar) 형성. 솔더 접합 품질", 검사필요: true },
  { 단계순서: 10, 단계명: "Final Electrical & Thermal Test", 설명: "내전압(HTRB), 열 저항(Rth), 온도 사이클 검사", 검사필요: true },
];

const coolingSteps: Omit<StepRow, "제품명">[] = [
  { 단계순서: 1, 단계명: "Heat Spreader/Lid Fabrication", 설명: "Cu/Ni 히트스프레더 또는 리드 제작. 평탄도 및 표면 처리", 검사필요: true },
  { 단계순서: 2, 단계명: "Vapor Chamber Fabrication", 설명: "베이퍼 챔버(VC) 제작. 내부 윅 구조(Wick), 작동 유체 충전", 검사필요: true },
  { 단계순서: 3, 단계명: "TIM1 Dispensing (Die-to-Lid)", 설명: "TIM1(열전도 소재) 디스펜싱. 다이와 리드 사이. 두께 20~50μm 균일 도포", 검사필요: true },
  { 단계순서: 4, 단계명: "TIM1 Void/Coverage Inspection", 설명: "TIM1 보이드/커버리지 검사. 보이드율 <5% 목표. 열 저항 직결", 검사필요: true },
  { 단계순서: 5, 단계명: "Lid/Heat Spreader Attach", 설명: "리드/히트스프레더 부착. 접착제(Epoxy/Solder) 경화", 검사필요: true },
  { 단계순서: 6, 단계명: "TIM2 Application (Lid-to-Heatsink)", 설명: "TIM2 도포. 리드와 히트싱크 사이. 열 전도 경로 완성", 검사필요: true },
  { 단계순서: 7, 단계명: "Vapor Chamber Integration", 설명: "베이퍼 챔버를 패키지에 통합. 열 확산 효과 극대화", 검사필요: true },
  { 단계순서: 8, 단계명: "Thermal Interface Integrity Test", 설명: "열 인터페이스 무결성 비파괴 검사. SAT 또는 IR 열화상", 검사필요: true },
  { 단계순서: 9, 단계명: "Final Assembly & Thermal Performance", 설명: "최종 조립 + 열 성능 검증(Rth 측정). 방열 사양 충족 확인", 검사필요: true },
];

const productStepMap: Record<string, Omit<StepRow, "제품명">[]> = {
  HBM3E: hbmSteps, HBM4: hbmSteps,
  SOCAMM: socammSteps,
  LPDDR5: lpddrSteps, LPDDR5X: lpddrSteps, LPDDR6: lpddrSteps,
  "ASIC/GPU Wafer": gpuWaferSteps,
  "2.5D CoWoS": cowosSteps,
  "3D SoIC": soicSteps,
  "Thin Wafer": thinWaferSteps,
  "Substrate": substrateSteps,
  "Optic (CPO)": cpoSteps,
  "Panel (PLP)": plpSteps,
  "Power": powerSteps,
  "Cooling": coolingSteps,
};

const processSteps: StepRow[] = [];
for (const [productName, steps] of Object.entries(productStepMap)) {
  for (const step of steps) {
    processSteps.push({ 제품명: productName, ...step });
  }
}

// ===== INSPECTION POINTS =====
const inspectionPoints = [
  { 제품명: "HBM3E", 공정단계: "Wafer Fabrication", 검사포인트: "Wafer Defect Inspection", 목적: "웨이퍼 표면 결함 및 패턴 결함 검출", 검사유형: "WAFER_INSPECTION", 난이도: 5, 불량영향: "Die 수율 저하", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "TSV Etch", 검사포인트: "TSV Depth/Profile Inspection", 목적: "TSV 식각 깊이(50-100μm), 직경(5-10μm), 프로파일 검증", 검사유형: "TSV_INSPECTION", 난이도: 5, 불량영향: "전기적 Open → 메모리 셀 불량", 중요도메모: "HBM 핵심 검사. Confocal/IR 기반" },
  { 제품명: "HBM3E", 공정단계: "TSV Insulation & Barrier", 검사포인트: "Film Thickness Metrology", 목적: "절연막/배리어 두께 균일성 측정", 검사유형: "THICKNESS_METROLOGY", 난이도: 4, 불량영향: "절연 불량 → 누설 전류", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "TSV Cu Fill & CMP", 검사포인트: "Cu Fill Void Inspection", 목적: "Cu 충전 후 Void, Surface 결함 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 5, 불량영향: "전기적 단선 → TSV 연결 실패", 중요도메모: "CMP 후 검사 필수" },
  { 제품명: "HBM3E", 공정단계: "RDL Formation", 검사포인트: "RDL Pattern Inspection", 목적: "재배선층 패턴 결함, 오버레이 정렬 검사", 검사유형: "CD_METROLOGY", 난이도: 5, 불량영향: "배선 Short/Open", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "Micro-Bump Formation", 검사포인트: "Micro-Bump 3D Inspection", 목적: "수만 개 범프의 높이/직경/동일평면도 전수 검사. HBM3E ~27μm pitch", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "Die Stack 접합 불량 → 전체 스택 폐기", 중요도메모: "HBM 최핵심 검사. 전수 3D 측정 필수" },
  { 제품명: "HBM3E", 공정단계: "Wafer Thinning", 검사포인트: "Wafer Thickness Uniformity", 목적: "박형화 후 두께 균일성 및 크랙 검출", 검사유형: "THICKNESS_METROLOGY", 난이도: 4, 불량영향: "크랙 → 다이 파손", 중요도메모: "30-50μm 박형 웨이퍼" },
  { 제품명: "HBM3E", 공정단계: "Wafer Dicing", 검사포인트: "Dicing Chipping Inspection", 목적: "다이싱 후 에지 칩핑 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "크랙 전파 → 신뢰성 저하", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "Die Stacking (TC Bonding)", 검사포인트: "Die Stack Alignment Inspection", 목적: "8-12Hi 적층 시 각 다이 간 정렬 오차 ±0.5μm 이내 검증", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "정렬 불량 → TSV 연결 실패", 중요도메모: "HBM 핵심 검사. Sub-μm 정밀도" },
  { 제품명: "HBM3E", 공정단계: "MUF (Molded Underfill)", 검사포인트: "Post-MUF Void Inspection", 목적: "몰드 언더필 내부 Void 검출. SAT+Optical 병행", 검사유형: "SAT_INSPECTION", 난이도: 4, 불량영향: "열 방출 불량 → 필드 불량", 중요도메모: "SAT 필수" },
  { 제품명: "HBM3E", 공정단계: "Stack Singulation", 검사포인트: "Stack Edge Defect Inspection", 목적: "스택 개편화 후 에지 결함 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "에지 결함 → 신뢰성 문제", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "Interposer/Base Die Attach", 검사포인트: "Interposer Placement Accuracy", 목적: "인터포저/베이스 다이 접합 위치 정확도 검사", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 4, 불량영향: "배치 오차 → 연결 불량", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "Ball Attach", 검사포인트: "Ball Attach 3D Inspection", 목적: "BGA 솔더볼 높이/누락/동일평면도 3D 검사", 검사유형: "BALL_ATTACH_INSPECTION", 난이도: 3, 불량영향: "볼 불량 → 실장 불량", 중요도메모: "" },
  { 제품명: "HBM3E", 공정단계: "Final Visual Inspection", 검사포인트: "Final Surface/Marking Inspection", 목적: "외관 결함 및 마킹 품질(OCR/OCV) 검사", 검사유형: "MARKING_INSPECTION", 난이도: 2, 불량영향: "외관 불량 → 고객 반품", 중요도메모: "" },
  // SOCAMM
  { 제품명: "SOCAMM", 공정단계: "PCB/Substrate 수입검사", 검사포인트: "Substrate Pattern Inspection", 목적: "기판 패턴 결함, Via 무결성 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "기판 불량 유입 → 모듈 불량", 중요도메모: "" },
  { 제품명: "SOCAMM", 공정단계: "Solder Paste Printing", 검사포인트: "3D SPI (Solder Paste)", 목적: "솔더 페이스트 체적/높이/면적 정밀 측정. 고밀도 패드 대응", 검사유형: "SPI", 난이도: 4, 불량영향: "인쇄 불량 → 리플로우 후 쇼트/오픈", 중요도메모: "SOCAMM 핵심 검사. SPI 시장 1위 고영 대응" },
  { 제품명: "SOCAMM", 공정단계: "Component Placement", 검사포인트: "Pre-Reflow AOI", 목적: "SoC BGA, LPDDR PoP 등 부품 배치 정확도 검증", 검사유형: "PRE_REFLOW_AOI", 난이도: 4, 불량영향: "배치 오류 → 리워크 비용 증가", 중요도메모: "수천 핀 BGA 정확도" },
  { 제품명: "SOCAMM", 공정단계: "Reflow Soldering", 검사포인트: "Post-Reflow 3D AOI", 목적: "리플로우 후 솔더 조인트 3D 품질 검사. 필렛 형상, 높이, 습윤", 검사유형: "POST_REFLOW_AOI", 난이도: 5, 불량영향: "솔더 조인트 불량 → 모듈 기능 불량", 중요도메모: "SOCAMM 최핵심 검사" },
  { 제품명: "SOCAMM", 공정단계: "Underfill/Encapsulation", 검사포인트: "Underfill Coverage Inspection", 목적: "언더필 도포 범위 및 균일성 검사", 검사유형: "UNDERFILL_INSPECTION", 난이도: 3, 불량영향: "언더필 부족 → 기계적 신뢰성 저하", 중요도메모: "" },
  { 제품명: "SOCAMM", 공정단계: "BGA Under-package Inspection", 검사포인트: "BGA X-ray (AXI)", 목적: "BGA 하부 숨겨진 솔더 조인트 X-ray 검사. HoP, Void, Open 검출", 검사유형: "XRAY_2D", 난이도: 5, 불량영향: "잠재 불량 유출 → 필드 리턴", 중요도메모: "숨겨진 조인트 검사 필수. X-ray만 가능" },
  { 제품명: "SOCAMM", 공정단계: "Connector/Shield Assembly", 검사포인트: "Assembly Verification AOI", 목적: "커넥터, 쉴드캔 조립 상태 확인", 검사유형: "POST_REFLOW_AOI", 난이도: 2, 불량영향: "조립 누락 → 기능 불량", 중요도메모: "" },
  { 제품명: "SOCAMM", 공정단계: "Final Visual Inspection", 검사포인트: "Final Surface/Marking AOI", 목적: "외관 최종 검사. 표면 결함, 마킹 확인", 검사유형: "MARKING_INSPECTION", 난이도: 2, 불량영향: "외관 불량", 중요도메모: "" },
  // LPDDR5
  { 제품명: "LPDDR5", 공정단계: "Wafer Fabrication", 검사포인트: "Wafer Defect Inspection", 목적: "DRAM 웨이퍼 표면/패턴 결함 검출", 검사유형: "WAFER_INSPECTION", 난이도: 5, 불량영향: "수율 저하", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "WLP/FOWLP Formation", 검사포인트: "WLP RDL/Bump Inspection", 목적: "WLP 재배선층 패턴 및 범프 형성 검사", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "패키징 불량", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Wafer Test & Dicing", 검사포인트: "Dicing Crack/Chipping", 목적: "다이싱 후 크랙 및 칩핑 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "크랙 전파", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Die Attach", 검사포인트: "Die Attach Inspection", 목적: "다이 배치 정확도, 접착제 도포 상태 검사", 검사유형: "DIE_ATTACH_INSPECTION", 난이도: 3, 불량영향: "다이 시프트 → 와이어 본딩 불량 유발", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Wire Bonding", 검사포인트: "Wire Bond Inspection", 목적: "Loop 높이, 본드 위치, 네킹(necking) 검사", 검사유형: "WIRE_BOND_INSPECTION", 난이도: 3, 불량영향: "본드 단선 → Open 불량", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Flip Chip Bonding", 검사포인트: "Flip Chip Bond Inspection", 목적: "플립칩 범프 접촉, 정렬 검사", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "접합 불량 → 전기적 Open", 중요도메모: "Fine-pitch 플립칩 대응" },
  { 제품명: "LPDDR5", 공정단계: "Molding", 검사포인트: "Mold Inspection", 목적: "몰딩 Void, Flash, Incomplete Fill 검사", 검사유형: "MOLD_INSPECTION", 난이도: 3, 불량영향: "몰딩 불량 → 신뢰성 저하", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Ball Attach", 검사포인트: "Ball Attach 3D Inspection", 목적: "솔더볼 높이/누락/동일평면도 3D 검사", 검사유형: "BALL_ATTACH_INSPECTION", 난이도: 3, 불량영향: "볼 불량 → PoP 적층 실패", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Laser Marking", 검사포인트: "Laser Marking OCR/OCV", 목적: "레이저 마킹 품질 OCR/OCV 검증", 검사유형: "MARKING_INSPECTION", 난이도: 2, 불량영향: "마킹 불량 → 추적성 상실", 중요도메모: "" },
  { 제품명: "LPDDR5", 공정단계: "Final Visual Inspection", 검사포인트: "Final Surface Inspection", 목적: "표면 결함, 오염 최종 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 2, 불량영향: "외관 불량", 중요도메모: "" },
  // ASIC/GPU Wafer
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Wafer Incoming Inspection", 검사포인트: "Wafer Surface Defect Scan", 목적: "베어 웨이퍼 표면 결함(Particle, Scratch, Crystal Defect) 전면 스캔", 검사유형: "WAFER_INSPECTION", 난이도: 5, 불량영향: "후공정 수율 저하", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "RDL Patterning (Litho + Etch)", 검사포인트: "RDL CD/Overlay Metrology", 목적: "RDL 패턴 CD(Critical Dimension) 및 오버레이 정렬 정밀 측정. L/S 2~5μm", 검사유형: "CD_METROLOGY", 난이도: 5, 불량영향: "배선 Short/Open → 칩 기능 불량", 중요도메모: "GPU/ASIC 핵심 검사" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "RDL Plating & CMP", 검사포인트: "RDL Cu Void/Defect Inspection", 목적: "Cu 도금 후 Void, CMP Dishing, Scratch 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "배선 저항 증가 → 성능 열화", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "UBM (Under Bump Metallization)", 검사포인트: "UBM Profile Inspection", 목적: "UBM 막질 프로파일 및 패턴 정확도 확인", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "범프 접착 불량", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Bump Plating (Cu Pillar + Solder Cap)", 검사포인트: "Cu Pillar Height/Diameter 3D", 목적: "수만 개 Cu Pillar의 높이/직경/동일평면도 전수 3D 측정", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "Pillar 불량 → 접합 실패 → 칩 폐기", 중요도메모: "GPU Wafer 최핵심 검사. 전수 3D 측정 필수" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Bump Plating (Cu Pillar + Solder Cap)", 검사포인트: "Solder Cap Coplanarity", 목적: "솔더 캡 동일평면도(Coplanarity) 측정. 접합 시 틸트 방지", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "접합 불균일 → 전기적 Open", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Bump Reflow", 검사포인트: "Post-Reflow Bump Profile", 목적: "리플로우 후 범프 형상(구형화, 높이) 확인", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "범프 형상 이상 → 접합 품질 저하", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Wafer Probe & Dicing", 검사포인트: "Dicing Chipping/Crack", 목적: "다이싱 후 에지 칩핑/크랙 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "크랙 전파 → 다이 파손", 중요도메모: "" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "Final Bump/RDL Inspection", 검사포인트: "Final Bump 3D Full Inspection", 목적: "최종 범프 전수 3D 검사 (높이/직경/위치/Coplanarity)", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "불량 다이 유출 → 패키지 수율 저하", 중요도메모: "출하 전 최종 게이트 검사" },
  { 제품명: "ASIC/GPU Wafer", 공정단계: "RDL Patterning (Litho + Etch)", 검사포인트: "RDL Pattern Defect Map", 목적: "RDL 패턴 전면 결함 맵핑. Bridge, Open, Particle 검출", 검사유형: "CD_METROLOGY", 난이도: 4, 불량영향: "배선 결함 → 칩 기능 불량", 중요도메모: "" },
  // 2.5D CoWoS
  { 제품명: "2.5D CoWoS", 공정단계: "Interposer TSV Etch & Fill", 검사포인트: "Interposer TSV Depth/Profile", 목적: "인터포저 TSV 식각 깊이(~100μm), 프로파일, Cu 충전 Void 검사", 검사유형: "TSV_INSPECTION", 난이도: 5, 불량영향: "TSV 불량 → 인터포저 전체 폐기", 중요도메모: "CoWoS 핵심 검사. Confocal/IR 기반" },
  { 제품명: "2.5D CoWoS", 공정단계: "Interposer RDL Formation", 검사포인트: "Interposer RDL Pattern Inspection", 목적: "인터포저 미세 RDL(L/S ~2μm) 패턴 결함, CD, 오버레이 검사", 검사유형: "CD_METROLOGY", 난이도: 5, 불량영향: "배선 Short/Open → 칩 간 연결 실패", 중요도메모: "대면적 인터포저 전면 검사 필요" },
  { 제품명: "2.5D CoWoS", 공정단계: "Interposer μBump Formation", 검사포인트: "Interposer μBump 3D Inspection", 목적: "인터포저 상면 μBump 높이/직경/Coplanarity 전수 3D 검사", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "μBump 불량 → CoW 본딩 실패", 중요도메모: "CoWoS 최핵심 검사. 수십만 개 범프 전수 측정" },
  { 제품명: "2.5D CoWoS", 공정단계: "Chip-on-Wafer (CoW) TC Bonding", 검사포인트: "TC Bonding Alignment", 목적: "TC 본딩 시 GPU/HBM 다이 정렬 정확도 검증. ±1μm 이내", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "정렬 불량 → 다이 간 연결 실패", 중요도메모: "CoWoS 핵심 검사. Multi-die 동시 정렬" },
  { 제품명: "2.5D CoWoS", 공정단계: "Chip-on-Wafer (CoW) TC Bonding", 검사포인트: "Post-TC Bond Joint Inspection", 목적: "TC 본딩 후 접합 조인트 품질. Non-wet, Open 검출", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "접합 불량 → 칩 간 통신 불가", 중요도메모: "" },
  { 제품명: "2.5D CoWoS", 공정단계: "CoW Underfill (CUF/MUF)", 검사포인트: "CUF/MUF Void Inspection", 목적: "언더필 내부 Void 검출. SAT + X-ray 병행", 검사유형: "SAT_INSPECTION", 난이도: 4, 불량영향: "Void → 열 방출 불량 + 기계적 약점", 중요도메모: "SAT 필수" },
  { 제품명: "2.5D CoWoS", 공정단계: "CoW Inspection", 검사포인트: "CoW Die Tilt/Shift Measurement", 목적: "본딩 후 다이 Tilt(기울기) 및 Shift(이동) 정밀 측정", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 4, 불량영향: "기울기/이동 → 접합 불균일", 중요도메모: "" },
  { 제품명: "2.5D CoWoS", 공정단계: "Interposer Thinning", 검사포인트: "Interposer Thickness Uniformity", 목적: "인터포저 박형화 후 두께 균일성(TTV) 및 크랙 검사", 검사유형: "THICKNESS_METROLOGY", 난이도: 4, 불량영향: "두께 불균일 → TSV 노출 불량", 중요도메모: "" },
  { 제품명: "2.5D CoWoS", 공정단계: "Interposer Backside Bumping", 검사포인트: "C4 Bump 3D Inspection", 목적: "인터포저 배면 C4 솔더 범프 높이/Coplanarity 검사", 검사유형: "BALL_ATTACH_INSPECTION", 난이도: 3, 불량영향: "C4 범프 불량 → 기판 접합 불량", 중요도메모: "" },
  { 제품명: "2.5D CoWoS", 공정단계: "Wafer-on-Substrate (WoS) Bonding", 검사포인트: "WoS Bond Quality", 목적: "인터포저-기판 접합 품질 X-ray 검사. Void, Open, Short 검출", 검사유형: "XRAY_2D", 난이도: 4, 불량영향: "접합 불량 → 패키지 불량", 중요도메모: "숨겨진 조인트 X-ray 필수" },
  { 제품명: "2.5D CoWoS", 공정단계: "Package Molding & Lid Attach", 검사포인트: "Package Mold Inspection", 목적: "몰딩 Void, Flash, 리드 접착 상태 검사", 검사유형: "MOLD_INSPECTION", 난이도: 3, 불량영향: "몰딩 불량 → 신뢰성 저하", 중요도메모: "" },
  { 제품명: "2.5D CoWoS", 공정단계: "Final Package Inspection", 검사포인트: "Final BGA/Surface Inspection", 목적: "BGA 솔더볼 높이/누락 + 외관 최종 검사", 검사유형: "BALL_ATTACH_INSPECTION", 난이도: 3, 불량영향: "BGA 불량 → 실장 불량", 중요도메모: "" },
  // 3D SoIC
  { 제품명: "3D SoIC", 공정단계: "Wafer Surface Preparation", 검사포인트: "Bonding Surface Roughness", 목적: "본딩면 표면 거칠기(Ra <0.5nm) 정밀 측정. 하이브리드 본딩 성패 좌우", 검사유형: "SURFACE_ROUGHNESS_METROLOGY", 난이도: 5, 불량영향: "거칠기 초과 → 본딩 실패 → 전체 폐기", 중요도메모: "SoIC 최핵심 검사. AFM/WLI급 정밀도 필요" },
  { 제품명: "3D SoIC", 공정단계: "Cu Pad / Oxide Hybrid Surface", 검사포인트: "Cu Pad Dishing/Protrusion", 목적: "Cu 패드 Dishing(<5nm)/Protrusion 정밀 계측. 본딩 접합 균일성 결정", 검사유형: "BUMP_INSPECTION", 난이도: 5, 불량영향: "Dishing 과다 → Cu 접합 불량", 중요도메모: "SoIC 핵심 검사. nm급 정밀 계측" },
  { 제품명: "3D SoIC", 공정단계: "Wafer Dicing (Known Good Die)", 검사포인트: "KGD Die Sorting Inspection", 목적: "다이싱 후 KGD 선별을 위한 외관/전기적 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "불량 다이 투입 → 적층 스택 전체 폐기", 중요도메모: "V-Cache Die 수율 직결" },
  { 제품명: "3D SoIC", 공정단계: "Die-to-Wafer Alignment", 검사포인트: "Die-to-Wafer Overlay", 목적: "다이-웨이퍼 오버레이 정렬 정밀도 측정. <0.2μm 목표", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "정렬 불량 → Cu 패드 미접촉 → Open", 중요도메모: "SoIC 핵심 검사. Sub-0.2μm 정밀도" },
  { 제품명: "3D SoIC", 공정단계: "Post-Bond Interface Inspection", 검사포인트: "Post-Bond Interface Void", 목적: "본딩 인터페이스 Void/Delamination 비파괴 검사. SAT + IR 투과", 검사유형: "SAT_INSPECTION", 난이도: 5, 불량영향: "인터페이스 결함 → 전기적/기계적 불량", 중요도메모: "SoIC 핵심 검사. 비파괴 검사 필수" },
  { 제품명: "3D SoIC", 공정단계: "Post-Bond Anneal", 검사포인트: "Post-Bond Electrical Continuity", 목적: "어닐링 후 Cu 접합부 전기적 연속성(Daisy Chain) 검증", 검사유형: "CONTINUITY_TEST", 난이도: 4, 불량영향: "Cu 확산 불량 → 전기적 Open", 중요도메모: "" },
  { 제품명: "3D SoIC", 공정단계: "Post-Bond Interface Inspection", 검사포인트: "Post-Anneal Delamination Check", 목적: "어닐링 후 열응력에 의한 Delamination 추가 검사", 검사유형: "SAT_INSPECTION", 난이도: 4, 불량영향: "열응력 Delamination → 신뢰성 불량", 중요도메모: "" },
  { 제품명: "3D SoIC", 공정단계: "Thinning (Top Die)", 검사포인트: "Thinned Die Thickness", 목적: "상부 다이 박형화 후 두께 균일성 및 크랙 검사", 검사유형: "THICKNESS_METROLOGY", 난이도: 4, 불량영향: "두께 불균일/크랙 → 다이 파손", 중요도메모: "" },
  { 제품명: "3D SoIC", 공정단계: "TSV Reveal & Via-last Process", 검사포인트: "TSV Reveal Inspection", 목적: "TSV 노출 후 Cu 패드 상태 및 프로파일 검사", 검사유형: "TSV_INSPECTION", 난이도: 4, 불량영향: "TSV 노출 불량 → 상위 배선 연결 실패", 중요도메모: "" },
  { 제품명: "3D SoIC", 공정단계: "RDL & Bumping", 검사포인트: "Top RDL/Bump Inspection", 목적: "최상위 RDL 패턴 및 외부 연결 범프 3D 검사", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "최종 I/O 불량", 중요도메모: "" },
  { 제품명: "3D SoIC", 공정단계: "Final Inspection & Test", 검사포인트: "Final Integrated Inspection", 목적: "3D 적층 전체 외관/전기 최종 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "출하 전 불량 유출", 중요도메모: "" },
  // Thin Wafer
  { 제품명: "Thin Wafer", 공정단계: "Carrier Wafer Bonding", 검사포인트: "Carrier Bond Quality", 목적: "캐리어-웨이퍼 접합 균일성 및 기포/Void 검사", 검사유형: "BOND_QUALITY_INSPECTION", 난이도: 3, 불량영향: "접합 불균일 → 연삭 두께 편차 → 크랙", 중요도메모: "" },
  { 제품명: "Thin Wafer", 공정단계: "Backgrinding", 검사포인트: "Post-Grind TTV", 목적: "연삭 후 TTV(Total Thickness Variation) 전면 측정. 목표 TTV <2μm", 검사유형: "THICKNESS_METROLOGY", 난이도: 5, 불량영향: "TTV 초과 → 후속 공정 불량 + 크랙", 중요도메모: "Thin Wafer 최핵심 검사. 전면 두께 맵핑 필수" },
  { 제품명: "Thin Wafer", 공정단계: "Backgrinding", 검사포인트: "Post-Grind Crack Detection", 목적: "연삭 후 미세 크랙(Sub-surface crack) 검출. IR 투과 또는 PL(광발광)", 검사유형: "SURFACE_INSPECTION", 난이도: 5, 불량영향: "미세 크랙 전파 → 웨이퍼 파손", 중요도메모: "Thin Wafer 핵심 검사. Sub-surface 검출" },
  { 제품명: "Thin Wafer", 공정단계: "Post-Grind Stress Relief", 검사포인트: "Stress-Relief Surface Check", 목적: "응력 제거 후 표면 상태 확인", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "잔류 응력 → 워피지 악화", 중요도메모: "" },
  { 제품명: "Thin Wafer", 공정단계: "Backside Processing", 검사포인트: "Backside Metallization Inspection", 목적: "배면 금속화(BSM) 패턴/두께 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "BSM 불량 → 전기적 접촉 실패", 중요도메모: "" },
  { 제품명: "Thin Wafer", 공정단계: "Thin Wafer Inspection", 검사포인트: "Thin Wafer Warpage Measurement", 목적: "극박 웨이퍼 워피지/보우 전면 측정. 후속 본딩/실장 가능 여부 판정", 검사유형: "WARPAGE_METROLOGY", 난이도: 5, 불량영향: "워피지 초과 → 본딩 불량 + 핸들링 파손", 중요도메모: "Thin Wafer 핵심 검사. 전면 3D 형상 측정" },
  { 제품명: "Thin Wafer", 공정단계: "Dicing (Thin Wafer)", 검사포인트: "Thin Die Chipping/Crack", 목적: "극박 다이 다이싱 후 에지 칩핑/크랙 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "칩핑 → 적층 시 파손", 중요도메모: "" },
  { 제품명: "Thin Wafer", 공정단계: "Post-Debond Cleaning & Inspection", 검사포인트: "Post-Debond Residue Inspection", 목적: "캐리어 분리 후 접착제 잔류물 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "잔류물 → 오염/접합 방해", 중요도메모: "" },
  { 제품명: "Thin Wafer", 공정단계: "Thin Die Handling & Pickup", 검사포인트: "Thin Die Handling Damage Check", 목적: "극박 다이 핸들링 후 손상(크랙, 스크래치) 확인", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "핸들링 손상 → 다이 폐기", 중요도메모: "" },
  // Substrate
  { 제품명: "Substrate", 공정단계: "Via Formation (Laser/Mechanical Drill)", 검사포인트: "Via Hole Quality Inspection", 목적: "비아홀 직경/깊이/벽면 품질 검사. Glass Core TGV 포함", 검사유형: "TSV_INSPECTION", 난이도: 4, 불량영향: "비아 불량 → 전기적 Open/Short", 중요도메모: "Glass Core TGV는 IR 투과 검사 필수" },
  { 제품명: "Substrate", 공정단계: "Via Metallization (Cu Plating)", 검사포인트: "Via Cu Fill Void Inspection", 목적: "비아 Cu 충전 Void/결함 검출", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "Cu Void → 전기적 단선", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "RDL/Circuit Patterning", 검사포인트: "Substrate RDL Pattern Inspection", 목적: "기판 RDL 패턴 CD/Short/Open 검사. L/S 8~15μm", 검사유형: "CD_METROLOGY", 난이도: 4, 불량영향: "배선 결함 → 기판 폐기", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "Solder Mask Application", 검사포인트: "Solder Mask Opening Inspection", 목적: "솔더 마스크 개구부 위치/크기 정확도 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "개구부 불량 → 범프 접합 불량", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "C4/C2 Bump Formation", 검사포인트: "C4/C2 Bump 3D Inspection", 목적: "C4(~130μm)/C2(~40μm pitch) 범프 높이/직경/동일평면도 전수 3D 측정", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "범프 불량 → 칩-기판 접합 실패", 중요도메모: "Substrate 핵심 검사. Meister 즉시 대응 가능" },
  { 제품명: "Substrate", 공정단계: "Bump Reflow", 검사포인트: "Post-Reflow Bump Profile", 목적: "리플로우 후 범프 형상(구형화, 높이 균일성) 확인", 검사유형: "BUMP_INSPECTION", 난이도: 3, 불량영향: "범프 형상 이상 → 접합 불균일", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "Large Body Warpage Measurement", 검사포인트: "Large Body Warpage/Bow Mapping", 목적: "대형 기판 전면 워피지/보우 3D 맵핑. 실장 규격 ±150μm 이내", 검사유형: "WARPAGE_METROLOGY", 난이도: 4, 불량영향: "워피지 초과 → 실장 불량/SMT 불가", 중요도메모: "Substrate 핵심 검사. Shadow Moiré 활용" },
  { 제품명: "Substrate", 공정단계: "Coplanarity Measurement", 검사포인트: "Bump Coplanarity Full Inspection", 목적: "전수 범프 동일평면도 측정. 접합 균일성 확보", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "Coplanarity 불량 → 접합 Open", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "Final Inspection & Singulation", 검사포인트: "Final Visual/Pattern Inspection", 목적: "최종 외관, 패턴 결함, 마킹 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 2, 불량영향: "외관 불량 → 고객 반품", 중요도메모: "" },
  { 제품명: "Substrate", 공정단계: "Pad Surface Finish (ENIG/OSP)", 검사포인트: "Surface Finish Thickness Metrology", 목적: "표면 처리(Au/Ni/Cu) 두께 측정. 솔더 접합 신뢰성", 검사유형: "THICKNESS_METROLOGY", 난이도: 3, 불량영향: "두께 부적합 → 접합 신뢰성 저하", 중요도메모: "" },
  // Optic (CPO)
  { 제품명: "Optic (CPO)", 공정단계: "PIC (Photonic IC) Fabrication", 검사포인트: "PIC Surface/Pattern Defect Inspection", 목적: "PIC 칩 표면 결함, 도파관 패턴 정확도 검사", 검사유형: "WAFER_INSPECTION", 난이도: 5, 불량영향: "도파관 결함 → 광 손실 증가 → 대역폭 저하", 중요도메모: "CPO 핵심 검사. 신규 검사 역량 필요" },
  { 제품명: "Optic (CPO)", 공정단계: "PIC Waveguide Quality Inspection", 검사포인트: "Waveguide Loss/Defect Mapping", 목적: "PIC 도파관 산란 손실, 결함 맵핑. 광학 현미경 + 근적외선", 검사유형: "SURFACE_INSPECTION", 난이도: 5, 불량영향: "도파관 결함 → 채널당 손실 증가", 중요도메모: "" },
  { 제품명: "Optic (CPO)", 공정단계: "PIC-EIC Hybrid Bonding/Assembly", 검사포인트: "PIC-EIC Bond Alignment", 목적: "PIC-EIC 본딩 정렬 정확도 검증. 광학 경로 연속성 확보", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "PIC-EIC 정렬 불량 → 광-전 인터페이스 단절", 중요도메모: "CPO 핵심 검사. Sub-μm 정밀 정렬" },
  { 제품명: "Optic (CPO)", 공정단계: "Optical Alignment Verification", 검사포인트: "Optical Axis Alignment Metrology", 목적: "광학 축 정렬 정밀 계측. 광 결합 효율 검증", 검사유형: "OPTICAL_ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "정렬 불량 → 광 결합 효율 급락(>3dB 손실)", 중요도메모: "CPO 최핵심 검사. 완전 신규 역량 필요" },
  { 제품명: "Optic (CPO)", 공정단계: "FAU (Fiber Array Unit) Attachment", 검사포인트: "FAU Placement Accuracy", 목적: "FAU 배치 정확도 측정. 다채널 광섬유 동시 정렬", 검사유형: "OPTICAL_ALIGNMENT_INSPECTION", 난이도: 5, 불량영향: "FAU 정렬 불량 → 다채널 동시 불량", 중요도메모: "CPO 핵심 검사" },
  { 제품명: "Optic (CPO)", 공정단계: "Fiber Connector Assembly", 검사포인트: "Fiber Connector Alignment Inspection", 목적: "MT/MPO 커넥터 광섬유 정렬 및 단면 품질 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "커넥터 불량 → 현장 연결 시 손실", 중요도메모: "" },
  { 제품명: "Optic (CPO)", 공정단계: "Optical Coupling Loss Test", 검사포인트: "Insertion Loss Measurement", 목적: "채널별 삽입 손실(IL) 측정. <1dB 목표. 자동화 계측", 검사유형: "OPTICAL_ALIGNMENT_INSPECTION", 난이도: 4, 불량영향: "삽입 손실 초과 → 링크 버짓 초과", 중요도메모: "" },
  { 제품명: "Optic (CPO)", 공정단계: "Package Assembly & Underfill", 검사포인트: "CPO Package Underfill Inspection", 목적: "언더필 도포 균일성/보이드 검사", 검사유형: "UNDERFILL_INSPECTION", 난이도: 3, 불량영향: "언더필 불량 → PIC-EIC 접합 신뢰성 저하", 중요도메모: "" },
  { 제품명: "Optic (CPO)", 공정단계: "PIC-EIC Hybrid Bonding/Assembly", 검사포인트: "PIC-EIC μBump Joint Inspection", 목적: "PIC-EIC 접합 마이크로범프 품질 검사", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "범프 접합 불량 → 전기적 Open", 중요도메모: "" },
  { 제품명: "Optic (CPO)", 공정단계: "Final Optical/Electrical Test", 검사포인트: "Final Optical/Electrical Integrated Test", 목적: "최종 BER, 대역폭, 소비전력, 외관 통합 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "최종 불량 유출 → 고객 반품", 중요도메모: "" },
  // Panel (PLP)
  { 제품명: "Panel (PLP)", 공정단계: "Panel Preparation (600×600mm+)", 검사포인트: "Panel Initial Flatness Measurement", 목적: "대면적 패널 초기 평탄도/보우 측정. 600×600mm+", 검사유형: "WARPAGE_METROLOGY", 난이도: 4, 불량영향: "초기 워피지 과다 → 후속 공정 전체 불량", 중요도메모: "PLP 핵심 검사. 대면적 전면 측정" },
  { 제품명: "Panel (PLP)", 공정단계: "RDL Formation (Panel-level)", 검사포인트: "Panel RDL Pattern Inspection", 목적: "패널 레벨 RDL 패턴 CD/결함 전면 검사. 대면적 스티칭 필수", 검사유형: "CD_METROLOGY", 난이도: 5, 불량영향: "RDL 결함 → 해당 유닛 폐기", 중요도메모: "PLP 핵심 검사. 대면적 스티칭 검사 기술 필수" },
  { 제품명: "Panel (PLP)", 공정단계: "Panel Warpage Measurement (Pre-Die)", 검사포인트: "Pre-Die Placement Warpage", 목적: "다이 배치 전 패널 워피지/보우 재측정. 다이 본딩 가능 여부 판정", 검사유형: "WARPAGE_METROLOGY", 난이도: 4, 불량영향: "워피지 초과 → 다이 정렬/본딩 실패", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Die Placement (Panel-level)", 검사포인트: "Panel Die Placement Accuracy", 목적: "대면적 패널 위 다수 다이 배치 정확도 검사. ±5μm 목표", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 4, 불량영향: "다이 배치 오차 → 전기적 연결 불량", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Molding/Encapsulation (Panel-level)", 검사포인트: "Panel Mold Quality Inspection", 목적: "패널 레벨 몰딩 균일성, Void, Flash 검사. 대면적 전수", 검사유형: "MOLD_INSPECTION", 난이도: 4, 불량영향: "몰딩 불균일 → 유닛별 품질 편차", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Post-Mold Warpage Measurement", 검사포인트: "Post-Mold Warpage Mapping", 목적: "몰딩 후 패널 워피지 변화 측정. 열 수축 영향 관리", 검사유형: "WARPAGE_METROLOGY", 난이도: 5, 불량영향: "워피지 급변 → 후공정(RDL/범프) 불가", 중요도메모: "PLP 최핵심 검사. 공정 중 워피지 관리 핵심" },
  { 제품명: "Panel (PLP)", 공정단계: "Backside Processing (RDL/Bump)", 검사포인트: "Backside RDL/Bump Inspection", 목적: "배면 RDL 패턴 및 범프 3D 검사", 검사유형: "BUMP_INSPECTION", 난이도: 4, 불량영향: "배면 결함 → 실장 불량", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Singulation (Panel to Unit)", 검사포인트: "Post-Singulation Edge Inspection", 목적: "개편화 후 유닛 에지 칩핑/크랙 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "에지 결함 → 신뢰성 저하", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Final Unit Inspection", 검사포인트: "Final Unit Surface/Marking", 목적: "개편화 후 유닛별 외관, 범프, 마킹 최종 검사", 검사유형: "MARKING_INSPECTION", 난이도: 2, 불량영향: "외관 불량 → 고객 반품", 중요도메모: "" },
  { 제품명: "Panel (PLP)", 공정단계: "Die Placement (Panel-level)", 검사포인트: "Panel Die Tilt/Height Inspection", 목적: "다이 배치 후 틸트/높이 편차 측정", 검사유형: "DIE_ATTACH_INSPECTION", 난이도: 3, 불량영향: "다이 기울기 → 접합 불균일", 중요도메모: "" },
  // Power
  { 제품명: "Power", 공정단계: "Power Die Preparation (SiC/GaN)", 검사포인트: "Power Die Back Metal Inspection", 목적: "SiC/GaN 다이 배면 금속층(Au/Ag) 두께/균일성 검사", 검사유형: "THICKNESS_METROLOGY", 난이도: 3, 불량영향: "Back Metal 불량 → 소결 접합 불량", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "DBC/AMB Substrate Preparation", 검사포인트: "DBC/AMB Pattern Inspection", 목적: "세라믹 기판(DBC/AMB) Cu 패턴 검사. 에칭 품질 확인", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "기판 패턴 불량 → 전기적 Short", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "Die Attach (Sintered Ag/Cu)", 검사포인트: "Sinter Die Attach Position", 목적: "소결 접합 다이 배치 정확도 검사", 검사유형: "DIE_ATTACH_INSPECTION", 난이도: 3, 불량영향: "다이 시프트 → 와이어/클립 본딩 불가", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "Sinter Joint Quality Inspection", 검사포인트: "Sinter Joint Void/Porosity", 목적: "소결 조인트 보이드율/다공성 검사. SAT 또는 X-ray. 보이드율 <5% 목표", 검사유형: "SINTER_JOINT_INSPECTION", 난이도: 5, 불량영향: "보이드 과다 → 열 저항 증가 → 파워 디바이스 열폭주", 중요도메모: "Power 최핵심 검사. 열 신뢰성 직결" },
  { 제품명: "Power", 공정단계: "Sinter Joint Quality Inspection", 검사포인트: "Sinter Joint Thickness Uniformity", 목적: "소결층 두께(20-50μm) 균일성 측정", 검사유형: "THICKNESS_METROLOGY", 난이도: 4, 불량영향: "두께 불균일 → 열 전달 불균일", 중요도메모: "Power 핵심 검사" },
  { 제품명: "Power", 공정단계: "Wire Bonding / Clip Bonding", 검사포인트: "Power Wire/Clip Bond 3D Inspection", 목적: "Al/Cu 와이어 루프 높이 또는 Cu 클립 접합 상태 3D 검사. 고전류 경로", 검사유형: "WIRE_BOND_INSPECTION", 난이도: 4, 불량영향: "와이어/클립 불량 → 고전류 경로 단선", 중요도메모: "Power 핵심 검사. 고전류 경로" },
  { 제품명: "Power", 공정단계: "Thick Cu Layer Inspection", 검사포인트: "Thick Cu Pattern/Thickness", 목적: "후막 Cu(>100μm) 패턴 정확도 및 두께 검사", 검사유형: "THICKNESS_METROLOGY", 난이도: 3, 불량영향: "Cu 두께 부족 → 전류 용량 부족", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "Thermal Via Formation & Inspection", 검사포인트: "Thermal Via Fill Inspection", 목적: "열 비아 Cu 충전 상태 검사. Void 검출", 검사유형: "TSV_INSPECTION", 난이도: 3, 불량영향: "열 비아 Void → 열 저항 증가", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "Molding/Encapsulation", 검사포인트: "Power Mold/Gel Fill Inspection", 목적: "몰딩 또는 실리콘 겔 충전 검사. 기포/미충전 검출", 검사유형: "MOLD_INSPECTION", 난이도: 3, 불량영향: "절연 결함 → 고전압 절연 파괴", 중요도메모: "" },
  { 제품명: "Power", 공정단계: "Terminal/Lead Formation", 검사포인트: "Terminal Solder Joint Inspection", 목적: "외부 단자(리드/Cu Bar) 솔더 접합 품질 검사", 검사유형: "BALL_ATTACH_INSPECTION", 난이도: 3, 불량영향: "단자 접합 불량 → 실장 후 단선", 중요도메모: "" },
  // Cooling
  { 제품명: "Cooling", 공정단계: "Heat Spreader/Lid Fabrication", 검사포인트: "Lid Flatness/Surface Inspection", 목적: "히트스프레더/리드 평탄도 및 표면 결함 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 3, 불량영향: "평탄도 불량 → TIM 두께 불균일 → 열 저항 증가", 중요도메모: "" },
  { 제품명: "Cooling", 공정단계: "Vapor Chamber Fabrication", 검사포인트: "Vapor Chamber Leak/Integrity Test", 목적: "베이퍼 챔버 기밀성 및 내부 윅 구조 검사", 검사유형: "SURFACE_INSPECTION", 난이도: 4, 불량영향: "VC 누설 → 열 확산 기능 상실", 중요도메모: "" },
  { 제품명: "Cooling", 공정단계: "TIM1 Dispensing (Die-to-Lid)", 검사포인트: "TIM1 Dispensing Volume/Pattern", 목적: "TIM1 디스펜싱 체적/패턴 3D 측정. SPI 기술 적용 가능", 검사유형: "TIM_INSPECTION", 난이도: 4, 불량영향: "TIM 도포 불량 → 열 접촉 불량", 중요도메모: "Cooling 핵심 검사. SPI 기술 활용" },
  { 제품명: "Cooling", 공정단계: "TIM1 Void/Coverage Inspection", 검사포인트: "TIM1 Void Detection", 목적: "TIM1 층 내부 보이드 비파괴 검사. SAT 또는 IR 열화상", 검사유형: "TIM_INSPECTION", 난이도: 5, 불량영향: "보이드 >5% → 열 저항 급증 → 칩 스로틀링/파손", 중요도메모: "Cooling 최핵심 검사. 열 신뢰성 직결" },
  { 제품명: "Cooling", 공정단계: "Lid/Heat Spreader Attach", 검사포인트: "Lid Attach Gap/Tilt Measurement", 목적: "리드 부착 후 갭/기울기 측정. TIM 두께 균일성 검증", 검사유형: "ALIGNMENT_INSPECTION", 난이도: 3, 불량영향: "리드 기울기 → TIM 두께 편차 → 핫스팟 발생", 중요도메모: "" },
  { 제품명: "Cooling", 공정단계: "TIM2 Application (Lid-to-Heatsink)", 검사포인트: "TIM2 Coverage Inspection", 목적: "TIM2 도포 커버리지/패턴 검사", 검사유형: "TIM_INSPECTION", 난이도: 3, 불량영향: "TIM2 부족 → 히트싱크 열 전달 저하", 중요도메모: "" },
  { 제품명: "Cooling", 공정단계: "Thermal Interface Integrity Test", 검사포인트: "Thermal Interface SAT/IR Inspection", 목적: "열 인터페이스 전체 비파괴 검사. SAT + IR 열화상 병행", 검사유형: "SAT_INSPECTION", 난이도: 4, 불량영향: "Delamination → 갑작스러운 열 저항 증가", 중요도메모: "SAT 필수" },
  { 제품명: "Cooling", 공정단계: "Final Assembly & Thermal Performance", 검사포인트: "Final Thermal Resistance (Rth) Test", 목적: "최종 열 저항(Rth) 측정. 방열 사양 충족 확인", 검사유형: "OTHER", 난이도: 3, 불량영향: "Rth 초과 → 방열 부적합 → 고객 반품", 중요도메모: "" },
];

// ===== INSPECTION SPEC DATA (augment inspectionPoints) =====
type InspSpec = { 해상도요구: string; 정밀도요구: string; 속도요구: string; FOV요구: string; 핵심장비유형: string };
const inspSpecMap: Record<string, InspSpec> = {
  // HBM3E
  "HBM3E::Wafer Defect Inspection": { 해상도요구: "≤0.1μm", 정밀도요구: "Capture rate ≥95%", 속도요구: "≥20 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Wafer Inspector" },
  "HBM3E::TSV Depth/Profile Inspection": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "3σ ≤0.3μm", 속도요구: "≥10 WPH", FOV요구: "5-10μm via diameter", 핵심장비유형: "Confocal / IR Microscope" },
  "HBM3E::Film Thickness Metrology": { 해상도요구: "≤1nm", 정밀도요구: "3σ ≤0.5nm", 속도요구: "≥30 pts/min", FOV요구: "300mm wafer 9-point", 핵심장비유형: "Ellipsometer / OCD" },
  "HBM3E::Cu Fill Void Inspection": { 해상도요구: "≤0.5μm", 정밀도요구: "Void detect ≥2μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Inspector + SAT" },
  "HBM3E::RDL Pattern Inspection": { 해상도요구: "≤0.3μm", 정밀도요구: "CD 3σ ≤10nm", 속도요구: "≥8 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical CD Metrology" },
  "HBM3E::Micro-Bump 3D Inspection": { 해상도요구: "≤0.5μm (XY), ≤0.05μm (Z)", 정밀도요구: "3σ ≤0.1μm (Height)", 속도요구: "≥6 WPH", FOV요구: "27μm pitch, 300mm wafer", 핵심장비유형: "3D Profilometer" },
  "HBM3E::Wafer Thickness Uniformity": { 해상도요구: "≤0.1μm (Z)", 정밀도요구: "TTV 3σ ≤0.5μm", 속도요구: "≥15 WPH", FOV요구: "300mm wafer full map", 핵심장비유형: "IR Thickness Gauge" },
  "HBM3E::Dicing Chipping Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Chipping detect ≥5μm", 속도요구: "≥20 UPH", FOV요구: "Die edge perimeter", 핵심장비유형: "Optical Edge Inspector" },
  "HBM3E::Die Stack Alignment Inspection": { 해상도요구: "≤0.2μm", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥5 UPH", FOV요구: "12Hi stack, all layers", 핵심장비유형: "IR Overlay Metrology" },
  "HBM3E::Post-MUF Void Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Void ≥50μm detect", 속도요구: "≥10 UPH", FOV요구: "Full stack area", 핵심장비유형: "SAT (C-SAM)" },
  "HBM3E::Stack Edge Defect Inspection": { 해상도요구: "≤2μm", 정밀도요구: "Chipping ≥10μm detect", 속도요구: "≥30 UPH", FOV요구: "Stack edge", 핵심장비유형: "Optical Edge Inspector" },
  "HBM3E::Interposer Placement Accuracy": { 해상도요구: "≤1μm", 정밀도요구: "3σ ≤0.5μm", 속도요구: "≥8 UPH", FOV요구: "Interposer area", 핵심장비유형: "Optical Alignment System" },
  "HBM3E::Ball Attach 3D Inspection": { 해상도요구: "≤1μm (Z)", 정밀도요구: "3σ ≤2μm (Height)", 속도요구: "≥15 UPH", FOV요구: "BGA full array", 핵심장비유형: "3D Ball Inspector" },
  "HBM3E::Final Surface/Marking Inspection": { 해상도요구: "≤5μm", 정밀도요구: "OCR/OCV ≥99.5%", 속도요구: "≥30 UPH", FOV요구: "Package top surface", 핵심장비유형: "AOI + OCR System" },
  // SOCAMM
  "SOCAMM::Substrate Pattern Inspection": { 해상도요구: "≤3μm", 정밀도요구: "Defect detect ≥10μm", 속도요구: "≥20 UPH", FOV요구: "Full substrate", 핵심장비유형: "Optical Pattern Inspector" },
  "SOCAMM::3D SPI (Solder Paste)": { 해상도요구: "≤10μm (XY), ≤0.1μm (Z)", 정밀도요구: "Volume 3σ ≤5%", 속도요구: "≥30 sec/board", FOV요구: "Full board area", 핵심장비유형: "3D SPI (Moiré)" },
  "SOCAMM::Pre-Reflow AOI": { 해상도요구: "≤10μm", 정밀도요구: "Placement ±25μm", 속도요구: "≥20 sec/board", FOV요구: "Full board", 핵심장비유형: "3D AOI" },
  "SOCAMM::Post-Reflow 3D AOI": { 해상도요구: "≤10μm (XY), ≤1μm (Z)", 정밀도요구: "Fillet 3σ ≤5%", 속도요구: "≥25 sec/board", FOV요구: "Full board area", 핵심장비유형: "3D AOI (Shadow-free)" },
  "SOCAMM::Underfill Coverage Inspection": { 해상도요구: "≤20μm", 정밀도요구: "Coverage ≥95%", 속도요구: "≥30 UPH", FOV요구: "Underfill area", 핵심장비유형: "2D AOI" },
  "SOCAMM::BGA X-ray (AXI)": { 해상도요구: "≤5μm", 정밀도요구: "Void detect ≥30μm", 속도요구: "≥10 UPH", FOV요구: "BGA array", 핵심장비유형: "2D/2.5D X-ray (AXI)" },
  "SOCAMM::Assembly Verification AOI": { 해상도요구: "≤15μm", 정밀도요구: "Presence/Absence", 속도요구: "≥40 UPH", FOV요구: "Full board", 핵심장비유형: "2D AOI" },
  "SOCAMM::Final Surface/Marking AOI": { 해상도요구: "≤10μm", 정밀도요구: "OCR ≥99%", 속도요구: "≥40 UPH", FOV요구: "Package surface", 핵심장비유형: "AOI + OCR" },
  // LPDDR5
  "LPDDR5::Wafer Defect Inspection": { 해상도요구: "≤0.1μm", 정밀도요구: "Capture rate ≥95%", 속도요구: "≥20 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Wafer Inspector" },
  "LPDDR5::WLP RDL/Bump Inspection": { 해상도요구: "≤1μm (XY), ≤0.1μm (Z)", 정밀도요구: "3σ ≤0.3μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer", 핵심장비유형: "3D Profilometer" },
  "LPDDR5::Dicing Crack/Chipping": { 해상도요구: "≤2μm", 정밀도요구: "Chipping ≥5μm detect", 속도요구: "≥25 UPH", FOV요구: "Die edge", 핵심장비유형: "Optical Edge Inspector" },
  "LPDDR5::Die Attach Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Placement ±10μm", 속도요구: "≥30 UPH", FOV요구: "Die area", 핵심장비유형: "2D/3D AOI" },
  "LPDDR5::Wire Bond Inspection": { 해상도요구: "≤3μm", 정밀도요구: "Loop height 3σ ≤3μm", 속도요구: "≥20 UPH", FOV요구: "Bond pad area", 핵심장비유형: "Wire Bond Inspector" },
  "LPDDR5::Flip Chip Bond Inspection": { 해상도요구: "≤1μm (XY), ≤0.1μm (Z)", 정밀도요구: "3σ ≤0.5μm", 속도요구: "≥10 UPH", FOV요구: "Bump array", 핵심장비유형: "3D Profilometer" },
  "LPDDR5::Mold Inspection": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥100μm detect", 속도요구: "≥30 UPH", FOV요구: "Package area", 핵심장비유형: "2D AOI + SAT" },
  "LPDDR5::Ball Attach 3D Inspection": { 해상도요구: "≤2μm (Z)", 정밀도요구: "3σ ≤3μm (Height)", 속도요구: "≥20 UPH", FOV요구: "BGA array", 핵심장비유형: "3D Ball Inspector" },
  "LPDDR5::Laser Marking OCR/OCV": { 해상도요구: "≤10μm", 정밀도요구: "OCR ≥99.5%", 속도요구: "≥60 UPH", FOV요구: "Marking area", 핵심장비유형: "OCR Camera" },
  "LPDDR5::Final Surface Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Defect ≥10μm detect", 속도요구: "≥40 UPH", FOV요구: "Package surface", 핵심장비유형: "2D AOI" },
  // ASIC/GPU Wafer
  "ASIC/GPU Wafer::Wafer Surface Defect Scan": { 해상도요구: "≤0.05μm", 정밀도요구: "Capture rate ≥98%", 속도요구: "≥15 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Wafer Inspector" },
  "ASIC/GPU Wafer::RDL CD/Overlay Metrology": { 해상도요구: "≤0.2μm", 정밀도요구: "CD 3σ ≤5nm, Overlay <1nm", 속도요구: "≥5 WPH", FOV요구: "300mm wafer", 핵심장비유형: "CD-SEM / Overlay Tool" },
  "ASIC/GPU Wafer::RDL Cu Void/Defect Inspection": { 해상도요구: "≤0.3μm", 정밀도요구: "Void detect ≥1μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Inspector" },
  "ASIC/GPU Wafer::UBM Profile Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Profile 3σ ≤0.5μm", 속도요구: "≥15 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Profiler" },
  "ASIC/GPU Wafer::Cu Pillar Height/Diameter 3D": { 해상도요구: "≤0.5μm (XY), ≤0.05μm (Z)", 정밀도요구: "3σ ≤0.1μm (Height)", 속도요구: "≥5 WPH", FOV요구: "40μm pitch, 300mm wafer", 핵심장비유형: "3D Profilometer" },
  "ASIC/GPU Wafer::Solder Cap Coplanarity": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "COP 3σ ≤1μm", 속도요구: "≥8 WPH", FOV요구: "300mm wafer", 핵심장비유형: "3D Profilometer" },
  "ASIC/GPU Wafer::Post-Reflow Bump Profile": { 해상도요구: "≤1μm (XY), ≤0.1μm (Z)", 정밀도요구: "3σ ≤0.3μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer", 핵심장비유형: "3D Profilometer" },
  "ASIC/GPU Wafer::Dicing Chipping/Crack": { 해상도요구: "≤2μm", 정밀도요구: "Chipping ≥5μm detect", 속도요구: "≥25 UPH", FOV요구: "Die edge", 핵심장비유형: "Optical Edge Inspector" },
  "ASIC/GPU Wafer::Final Bump 3D Full Inspection": { 해상도요구: "≤0.5μm (XY), ≤0.05μm (Z)", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥5 WPH", FOV요구: "300mm wafer full", 핵심장비유형: "3D Profilometer" },
  "ASIC/GPU Wafer::RDL Pattern Defect Map": { 해상도요구: "≤0.3μm", 정밀도요구: "Bridge/Open ≥0.5μm detect", 속도요구: "≥8 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Pattern Inspector" },
  // 2.5D CoWoS
  "2.5D CoWoS::Interposer TSV Depth/Profile": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "3σ ≤0.3μm", 속도요구: "≥8 WPH", FOV요구: "~100μm TSV depth", 핵심장비유형: "Confocal / IR Microscope" },
  "2.5D CoWoS::Interposer RDL Pattern Inspection": { 해상도요구: "≤0.2μm", 정밀도요구: "CD 3σ ≤5nm", 속도요구: "≥5 WPH", FOV요구: "Large interposer (~1500mm²)", 핵심장비유형: "Optical CD Metrology" },
  "2.5D CoWoS::Interposer μBump 3D Inspection": { 해상도요구: "≤0.3μm (XY), ≤0.03μm (Z)", 정밀도요구: "3σ ≤0.08μm (Height)", 속도요구: "≥3 WPH", FOV요구: "~40μm pitch, 100k+ bumps", 핵심장비유형: "3D Profilometer" },
  "2.5D CoWoS::TC Bonding Alignment": { 해상도요구: "≤0.2μm", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥3 UPH", FOV요구: "Multi-die on interposer", 핵심장비유형: "IR Overlay Metrology" },
  "2.5D CoWoS::Post-TC Bond Joint Inspection": { 해상도요구: "≤0.5μm", 정밀도요구: "Non-wet detect ≥1μm", 속도요구: "≥5 UPH", FOV요구: "Bond joint array", 핵심장비유형: "3D Profilometer + SAT" },
  "2.5D CoWoS::CUF/MUF Void Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Void ≥30μm detect", 속도요구: "≥8 UPH", FOV요구: "Full package area", 핵심장비유형: "SAT (C-SAM)" },
  "2.5D CoWoS::CoW Die Tilt/Shift Measurement": { 해상도요구: "≤0.5μm", 정밀도요구: "Tilt 3σ ≤0.1°", 속도요구: "≥10 UPH", FOV요구: "Multi-die package", 핵심장비유형: "3D Profilometer" },
  "2.5D CoWoS::Interposer Thickness Uniformity": { 해상도요구: "≤0.1μm (Z)", 정밀도요구: "TTV 3σ ≤0.5μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer full map", 핵심장비유형: "IR Thickness Gauge" },
  "2.5D CoWoS::C4 Bump 3D Inspection": { 해상도요구: "≤1μm (Z)", 정밀도요구: "3σ ≤2μm (Height)", 속도요구: "≥10 UPH", FOV요구: "C4 bump array (~130μm pitch)", 핵심장비유형: "3D Ball Inspector" },
  "2.5D CoWoS::WoS Bond Quality": { 해상도요구: "≤5μm", 정밀도요구: "Void ≥30μm detect", 속도요구: "≥8 UPH", FOV요구: "Full substrate", 핵심장비유형: "2D/2.5D X-ray" },
  "2.5D CoWoS::Package Mold Inspection": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥100μm detect", 속도요구: "≥20 UPH", FOV요구: "Package area", 핵심장비유형: "2D AOI + SAT" },
  "2.5D CoWoS::Final BGA/Surface Inspection": { 해상도요구: "≤2μm (Z)", 정밀도요구: "3σ ≤3μm", 속도요구: "≥15 UPH", FOV요구: "BGA full array", 핵심장비유형: "3D Ball Inspector + AOI" },
  // 3D SoIC
  "3D SoIC::Bonding Surface Roughness": { 해상도요구: "≤0.01nm (Z)", 정밀도요구: "Ra repeatability ≤0.05nm", 속도요구: "≥5 pts/wafer", FOV요구: "50×50μm scan area", 핵심장비유형: "AFM / WLI" },
  "3D SoIC::Cu Pad Dishing/Protrusion": { 해상도요구: "≤0.1nm (Z)", 정밀도요구: "3σ ≤0.5nm", 속도요구: "≥10 WPH (sampling)", FOV요구: "Cu pad array", 핵심장비유형: "WLI / AFM" },
  "3D SoIC::KGD Die Sorting Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Defect ≥2μm detect", 속도요구: "≥20 UPH", FOV요구: "Die surface", 핵심장비유형: "Optical Inspector" },
  "3D SoIC::Die-to-Wafer Overlay": { 해상도요구: "≤0.05μm", 정밀도요구: "3σ ≤0.05μm", 속도요구: "≥3 WPH", FOV요구: "300mm wafer", 핵심장비유형: "IR Overlay Metrology" },
  "3D SoIC::Post-Bond Interface Void": { 해상도요구: "≤3μm", 정밀도요구: "Void ≥10μm detect", 속도요구: "≥5 WPH", FOV요구: "Full bonding interface", 핵심장비유형: "SAT + IR Transmission" },
  "3D SoIC::Post-Bond Electrical Continuity": { 해상도요구: "-", 정밀도요구: "Contact resistance <10mΩ", 속도요구: "≥10 WPH", FOV요구: "Daisy chain test sites", 핵심장비유형: "Probe Station" },
  "3D SoIC::Post-Anneal Delamination Check": { 해상도요구: "≤5μm", 정밀도요구: "Delamination ≥20μm detect", 속도요구: "≥8 WPH", FOV요구: "Full bonding area", 핵심장비유형: "SAT (C-SAM)" },
  "3D SoIC::Thinned Die Thickness": { 해상도요구: "≤0.1μm (Z)", 정밀도요구: "TTV 3σ ≤0.3μm", 속도요구: "≥15 WPH", FOV요구: "300mm wafer full map", 핵심장비유형: "IR Thickness Gauge" },
  "3D SoIC::TSV Reveal Inspection": { 해상도요구: "≤0.3μm", 정밀도요구: "Cu protrusion 3σ ≤0.5μm", 속도요구: "≥10 WPH", FOV요구: "TSV array", 핵심장비유형: "Confocal Microscope" },
  "3D SoIC::Top RDL/Bump Inspection": { 해상도요구: "≤0.5μm (XY), ≤0.05μm (Z)", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥8 WPH", FOV요구: "300mm wafer", 핵심장비유형: "3D Profilometer" },
  "3D SoIC::Final Integrated Inspection": { 해상도요구: "≤2μm", 정밀도요구: "Defect ≥5μm detect", 속도요구: "≥15 UPH", FOV요구: "Package surface", 핵심장비유형: "Optical Inspector" },
  // Thin Wafer
  "Thin Wafer::Carrier Bond Quality": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥50μm detect", 속도요구: "≥20 WPH", FOV요구: "300mm wafer", 핵심장비유형: "SAT / IR Transmission" },
  "Thin Wafer::Post-Grind TTV": { 해상도요구: "≤0.05μm (Z)", 정밀도요구: "TTV 3σ ≤0.2μm", 속도요구: "≥15 WPH", FOV요구: "300mm wafer full map", 핵심장비유형: "IR Thickness Gauge" },
  "Thin Wafer::Post-Grind Crack Detection": { 해상도요구: "≤1μm", 정밀도요구: "Sub-surface crack ≥10μm detect", 속도요구: "≥10 WPH", FOV요구: "300mm wafer", 핵심장비유형: "IR / PL Inspector" },
  "Thin Wafer::Stress-Relief Surface Check": { 해상도요구: "≤2μm", 정밀도요구: "Defect ≥5μm detect", 속도요구: "≥20 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Inspector" },
  "Thin Wafer::Backside Metallization Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Pattern 3σ ≤0.5μm", 속도요구: "≥12 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Pattern Inspector" },
  "Thin Wafer::Thin Wafer Warpage Measurement": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "Warpage 3σ ≤1μm", 속도요구: "≥10 WPH", FOV요구: "300mm wafer full", 핵심장비유형: "Shadow Moiré / Laser" },
  "Thin Wafer::Thin Die Chipping/Crack": { 해상도요구: "≤2μm", 정밀도요구: "Chipping ≥5μm detect", 속도요구: "≥25 UPH", FOV요구: "Die edge", 핵심장비유형: "Optical Edge Inspector" },
  "Thin Wafer::Post-Debond Residue Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Residue ≥10μm detect", 속도요구: "≥20 WPH", FOV요구: "300mm wafer", 핵심장비유형: "Optical Inspector" },
  "Thin Wafer::Thin Die Handling Damage Check": { 해상도요구: "≤2μm", 정밀도요구: "Crack ≥5μm detect", 속도요구: "≥30 UPH", FOV요구: "Die surface", 핵심장비유형: "Optical Inspector" },
  // Substrate
  "Substrate::Via Hole Quality Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Diameter 3σ ≤2μm", 속도요구: "≥10 UPH", FOV요구: "Via array (TGV/Laser via)", 핵심장비유형: "Confocal / IR Microscope" },
  "Substrate::Via Cu Fill Void Inspection": { 해상도요구: "≤2μm", 정밀도요구: "Void detect ≥5μm", 속도요구: "≥10 UPH", FOV요구: "Via array", 핵심장비유형: "X-ray / Optical Inspector" },
  "Substrate::Substrate RDL Pattern Inspection": { 해상도요구: "≤1μm", 정밀도요구: "CD 3σ ≤0.5μm", 속도요구: "≥8 UPH", FOV요구: "Full substrate (L/S 8-15μm)", 핵심장비유형: "Optical CD Metrology" },
  "Substrate::Solder Mask Opening Inspection": { 해상도요구: "≤3μm", 정밀도요구: "Opening 3σ ≤5μm", 속도요구: "≥15 UPH", FOV요구: "Full substrate", 핵심장비유형: "2D AOI" },
  "Substrate::C4/C2 Bump 3D Inspection": { 해상도요구: "≤1μm (XY), ≤0.1μm (Z)", 정밀도요구: "3σ ≤0.3μm (Height)", 속도요구: "≥8 UPH", FOV요구: "C4(130μm)/C2(40μm) pitch", 핵심장비유형: "3D Profilometer" },
  "Substrate::Post-Reflow Bump Profile": { 해상도요구: "≤2μm (Z)", 정밀도요구: "3σ ≤1μm", 속도요구: "≥12 UPH", FOV요구: "Bump array", 핵심장비유형: "3D Profilometer" },
  "Substrate::Large Body Warpage/Bow Mapping": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Warpage 3σ ≤5μm", 속도요구: "≥10 UPH", FOV요구: "Large substrate (≥65×79mm)", 핵심장비유형: "Shadow Moiré" },
  "Substrate::Bump Coplanarity Full Inspection": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "COP 3σ ≤1μm", 속도요구: "≥10 UPH", FOV요구: "Full bump array", 핵심장비유형: "3D Profilometer" },
  "Substrate::Final Visual/Pattern Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Defect ≥10μm detect", 속도요구: "≥20 UPH", FOV요구: "Full substrate", 핵심장비유형: "2D AOI" },
  "Substrate::Surface Finish Thickness Metrology": { 해상도요구: "≤0.01μm", 정밀도요구: "3σ ≤0.05μm", 속도요구: "≥30 pts/unit", FOV요구: "Sampling points", 핵심장비유형: "XRF / Ellipsometer" },
  // Optic (CPO)
  "Optic (CPO)::PIC Surface/Pattern Defect Inspection": { 해상도요구: "≤0.1μm", 정밀도요구: "Waveguide defect ≥0.5μm detect", 속도요구: "≥5 WPH", FOV요구: "PIC die area", 핵심장비유형: "Optical Wafer Inspector" },
  "Optic (CPO)::Waveguide Loss/Defect Mapping": { 해상도요구: "≤0.2μm", 정밀도요구: "Scatter loss detect", 속도요구: "≥3 WPH", FOV요구: "PIC die waveguide map", 핵심장비유형: "NIR Microscope" },
  "Optic (CPO)::PIC-EIC Bond Alignment": { 해상도요구: "≤0.1μm", 정밀도요구: "3σ ≤0.05μm", 속도요구: "≥3 UPH", FOV요구: "PIC-EIC interface", 핵심장비유형: "IR Overlay Metrology" },
  "Optic (CPO)::Optical Axis Alignment Metrology": { 해상도요구: "≤0.05μm", 정밀도요구: "3σ ≤0.03μm", 속도요구: "≥2 UPH", FOV요구: "Optical coupling zone", 핵심장비유형: "Active Alignment System" },
  "Optic (CPO)::FAU Placement Accuracy": { 해상도요구: "≤0.1μm", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥3 UPH", FOV요구: "Multi-channel FAU", 핵심장비유형: "Active Alignment System" },
  "Optic (CPO)::Fiber Connector Alignment Inspection": { 해상도요구: "≤1μm", 정밀도요구: "Endface geometry spec", 속도요구: "≥10 UPH", FOV요구: "MT/MPO connector face", 핵심장비유형: "Interferometric Connector Inspector" },
  "Optic (CPO)::Insertion Loss Measurement": { 해상도요구: "-", 정밀도요구: "IL accuracy ±0.05dB", 속도요구: "≥5 UPH", FOV요구: "Per-channel measurement", 핵심장비유형: "Optical Power Meter" },
  "Optic (CPO)::CPO Package Underfill Inspection": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥50μm detect", 속도요구: "≥15 UPH", FOV요구: "Underfill area", 핵심장비유형: "SAT / 2D AOI" },
  "Optic (CPO)::PIC-EIC μBump Joint Inspection": { 해상도요구: "≤0.5μm (XY), ≤0.05μm (Z)", 정밀도요구: "3σ ≤0.1μm", 속도요구: "≥5 UPH", FOV요구: "μBump array", 핵심장비유형: "3D Profilometer" },
  "Optic (CPO)::Final Optical/Electrical Integrated Test": { 해상도요구: "≤5μm", 정밀도요구: "BER ≤1E-12", 속도요구: "≥5 UPH", FOV요구: "Package surface", 핵심장비유형: "Integrated Test System" },
  // Panel (PLP)
  "Panel (PLP)::Panel Initial Flatness Measurement": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Flatness 3σ ≤5μm", 속도요구: "≥5 panels/hr", FOV요구: "600×600mm+ panel", 핵심장비유형: "Large-area Moiré / Laser" },
  "Panel (PLP)::Panel RDL Pattern Inspection": { 해상도요구: "≤0.5μm", 정밀도요구: "CD 3σ ≤0.2μm", 속도요구: "≥2 panels/hr", FOV요구: "600×600mm+ panel (stitching)", 핵심장비유형: "Large-area Pattern Inspector" },
  "Panel (PLP)::Pre-Die Placement Warpage": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Warpage 3σ ≤5μm", 속도요구: "≥5 panels/hr", FOV요구: "600×600mm+ panel", 핵심장비유형: "Shadow Moiré / Laser" },
  "Panel (PLP)::Panel Die Placement Accuracy": { 해상도요구: "≤1μm", 정밀도요구: "Placement 3σ ≤3μm", 속도요구: "≥3 panels/hr", FOV요구: "Panel area (multi-die)", 핵심장비유형: "Large-area AOI" },
  "Panel (PLP)::Panel Mold Quality Inspection": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥100μm detect", 속도요구: "≥5 panels/hr", FOV요구: "600×600mm+ panel", 핵심장비유형: "2D AOI + SAT" },
  "Panel (PLP)::Post-Mold Warpage Mapping": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "Warpage 3σ ≤3μm", 속도요구: "≥3 panels/hr", FOV요구: "600×600mm+ panel full map", 핵심장비유형: "Shadow Moiré" },
  "Panel (PLP)::Backside RDL/Bump Inspection": { 해상도요구: "≤1μm (XY), ≤0.1μm (Z)", 정밀도요구: "3σ ≤0.3μm", 속도요구: "≥3 panels/hr", FOV요구: "Panel backside", 핵심장비유형: "3D Profilometer" },
  "Panel (PLP)::Post-Singulation Edge Inspection": { 해상도요구: "≤2μm", 정밀도요구: "Chipping ≥5μm detect", 속도요구: "≥30 UPH", FOV요구: "Unit edge", 핵심장비유형: "Optical Edge Inspector" },
  "Panel (PLP)::Final Unit Surface/Marking": { 해상도요구: "≤5μm", 정밀도요구: "OCR ≥99%", 속도요구: "≥40 UPH", FOV요구: "Unit surface", 핵심장비유형: "2D AOI + OCR" },
  "Panel (PLP)::Panel Die Tilt/Height Inspection": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Tilt 3σ ≤0.1°", 속도요구: "≥3 panels/hr", FOV요구: "Multi-die on panel", 핵심장비유형: "3D Profilometer" },
  // Power
  "Power::Power Die Back Metal Inspection": { 해상도요구: "≤0.5μm", 정밀도요구: "Thickness 3σ ≤0.1μm", 속도요구: "≥20 UPH", FOV요구: "Die backside", 핵심장비유형: "XRF / Optical Profiler" },
  "Power::DBC/AMB Pattern Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Pattern defect ≥20μm detect", 속도요구: "≥15 UPH", FOV요구: "DBC/AMB substrate", 핵심장비유형: "2D AOI" },
  "Power::Sinter Die Attach Position": { 해상도요구: "≤5μm", 정밀도요구: "Placement ±20μm", 속도요구: "≥20 UPH", FOV요구: "Die area", 핵심장비유형: "2D/3D AOI" },
  "Power::Sinter Joint Void/Porosity": { 해상도요구: "≤5μm", 정밀도요구: "Void rate <5%", 속도요구: "≥10 UPH", FOV요구: "Die attach area", 핵심장비유형: "SAT / X-ray" },
  "Power::Sinter Joint Thickness Uniformity": { 해상도요구: "≤0.5μm (Z)", 정밀도요구: "3σ ≤1μm", 속도요구: "≥15 UPH", FOV요구: "Sinter layer (20-50μm)", 핵심장비유형: "SAT / Cross-section" },
  "Power::Power Wire/Clip Bond 3D Inspection": { 해상도요구: "≤3μm (Z)", 정밀도요구: "Loop/Clip 3σ ≤5μm", 속도요구: "≥15 UPH", FOV요구: "Wire/Clip bond area", 핵심장비유형: "3D Wire/Clip Inspector" },
  "Power::Thick Cu Pattern/Thickness": { 해상도요구: "≤2μm (Z)", 정밀도요구: "Thickness 3σ ≤3μm", 속도요구: "≥15 UPH", FOV요구: "Cu pattern area", 핵심장비유형: "Optical Profiler" },
  "Power::Thermal Via Fill Inspection": { 해상도요구: "≤3μm", 정밀도요구: "Void detect ≥10μm", 속도요구: "≥15 UPH", FOV요구: "Thermal via array", 핵심장비유형: "X-ray / SAT" },
  "Power::Power Mold/Gel Fill Inspection": { 해상도요구: "≤10μm", 정밀도요구: "Void ≥100μm detect", 속도요구: "≥20 UPH", FOV요구: "Module area", 핵심장비유형: "SAT / 2D AOI" },
  "Power::Terminal Solder Joint Inspection": { 해상도요구: "≤5μm (Z)", 정밀도요구: "3σ ≤5μm", 속도요구: "≥20 UPH", FOV요구: "Terminal area", 핵심장비유형: "3D AOI / X-ray" },
  // Cooling
  "Cooling::Lid Flatness/Surface Inspection": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Flatness 3σ ≤3μm", 속도요구: "≥20 UPH", FOV요구: "Lid surface", 핵심장비유형: "3D Profilometer" },
  "Cooling::Vapor Chamber Leak/Integrity Test": { 해상도요구: "≤10μm", 정밀도요구: "Leak rate <1E-6 mbar·L/s", 속도요구: "≥10 UPH", FOV요구: "VC full area", 핵심장비유형: "Helium Leak Tester + SAT" },
  "Cooling::TIM1 Dispensing Volume/Pattern": { 해상도요구: "≤10μm (XY), ≤1μm (Z)", 정밀도요구: "Volume 3σ ≤5%", 속도요구: "≥20 UPH", FOV요구: "TIM dispense area", 핵심장비유형: "3D SPI / Profilometer" },
  "Cooling::TIM1 Void Detection": { 해상도요구: "≤5μm", 정밀도요구: "Void rate <5%", 속도요구: "≥10 UPH", FOV요구: "TIM1 layer", 핵심장비유형: "SAT / IR Thermal" },
  "Cooling::Lid Attach Gap/Tilt Measurement": { 해상도요구: "≤1μm (Z)", 정밀도요구: "Gap 3σ ≤3μm", 속도요구: "≥20 UPH", FOV요구: "Lid perimeter", 핵심장비유형: "3D Profilometer" },
  "Cooling::TIM2 Coverage Inspection": { 해상도요구: "≤20μm", 정밀도요구: "Coverage ≥95%", 속도요구: "≥30 UPH", FOV요구: "TIM2 area", 핵심장비유형: "2D AOI" },
  "Cooling::Thermal Interface SAT/IR Inspection": { 해상도요구: "≤5μm", 정밀도요구: "Delamination ≥50μm detect", 속도요구: "≥8 UPH", FOV요구: "Full thermal interface", 핵심장비유형: "SAT (C-SAM) + IR" },
  "Cooling::Final Thermal Resistance (Rth) Test": { 해상도요구: "-", 정밀도요구: "Rth accuracy ±5%", 속도요구: "≥10 UPH", FOV요구: "Junction-to-case", 핵심장비유형: "Thermal Transient Tester" },
};

// HBM4/LPDDR5X/LPDDR6 reuse similar specs as their base products
const hbm4Specs: Record<string, InspSpec> = {};
for (const [key, val] of Object.entries(inspSpecMap)) {
  if (key.startsWith("HBM3E::")) {
    hbm4Specs[key.replace("HBM3E::", "HBM4::")] = { ...val };
  }
}
hbm4Specs["HBM4::Micro-Bump 3D Inspection"] = { ...inspSpecMap["HBM3E::Micro-Bump 3D Inspection"], FOV요구: "~9μm pitch, 300mm wafer", 정밀도요구: "3σ ≤0.05μm (Height)" };
Object.assign(inspSpecMap, hbm4Specs);

const lpddr5xSpecs: Record<string, InspSpec> = {};
for (const [key, val] of Object.entries(inspSpecMap)) {
  if (key.startsWith("LPDDR5::")) {
    lpddr5xSpecs[key.replace("LPDDR5::", "LPDDR5X::")] = { ...val };
  }
}
Object.assign(inspSpecMap, lpddr5xSpecs);

const lpddr6Specs: Record<string, InspSpec> = {};
for (const [key, val] of Object.entries(inspSpecMap)) {
  if (key.startsWith("LPDDR5::")) {
    lpddr6Specs[key.replace("LPDDR5::", "LPDDR6::")] = { ...val };
  }
}
Object.assign(inspSpecMap, lpddr6Specs);

const inspectionPointsWithSpecs = inspectionPoints.map((ip) => {
  const spec = inspSpecMap[`${ip.제품명}::${ip.검사포인트}`];
  return {
    ...ip,
    해상도요구: spec?.해상도요구 ?? "",
    정밀도요구: spec?.정밀도요구 ?? "",
    속도요구: spec?.속도요구 ?? "",
    FOV요구: spec?.FOV요구 ?? "",
    핵심장비유형: spec?.핵심장비유형 ?? "",
  };
});

// ===== TECH RELATIONS =====
const techRelations = [
  { 기술명: "Telecentric Optics Design", 선행기술: "High-resolution Imaging (>25MP)", 관계유형: "ENABLES", 설명: "텔레센트릭 광학계가 고해상도 이미징의 왜곡 없는 측정 기반 제공" },
  { 기술명: "Telecentric Optics Design", 선행기술: "Phase-Shifting Profilometry (PSP)", 관계유형: "ENABLES", 설명: "텔레센트릭 광학계가 위상 측정 정밀도 확보의 기반" },
  { 기술명: "Telecentric Optics Design", 선행기술: "Moiré Interferometry", 관계유형: "ENABLES", 설명: "텔레센트릭 광학계가 Moiré 간섭 패턴 정확도의 기반" },
  { 기술명: "High-NA Objective Lens", 선행기술: "High-resolution Imaging (>25MP)", 관계유형: "ENABLES", 설명: "고 NA 렌즈가 Sub-μm 해상도 달성에 필수" },
  { 기술명: "High-NA Objective Lens", 선행기술: "Confocal Microscopy", 관계유형: "PREREQUISITE", 설명: "공초점 현미경에 고 NA 대물렌즈 필수" },
  { 기술명: "Moiré Interferometry", 선행기술: "Phase-Shifting Profilometry (PSP)", 관계유형: "PREREQUISITE", 설명: "PSP는 Moiré 간섭 원리에 기반한 확장 기술" },
  { 기술명: "Moiré Interferometry", 선행기술: "Wafer Warpage Measurement", 관계유형: "ENABLES", 설명: "Moiré 기술이 대면적 워피지 측정의 기반" },
  { 기술명: "Moiré Interferometry", 선행기술: "Large Panel Flatness Mapping", 관계유형: "ENABLES", 설명: "Moiré 기술이 패널 레벨 평탄도 측정 기반" },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 선행기술: "3D Point Cloud Processing", 관계유형: "ENABLES", 설명: "PSP 측정 데이터가 3D 포인트 클라우드 생성의 입력" },
  { 기술명: "Confocal Microscopy", 선행기술: "3D Point Cloud Processing", 관계유형: "ENABLES", 설명: "공초점 측정 데이터가 3D 재구성의 입력" },
  { 기술명: "White Light Interferometry (WLI)", 선행기술: "3D Point Cloud Processing", 관계유형: "ENABLES", 설명: "WLI nm급 데이터가 고정밀 3D 포인트 클라우드 생성" },
  { 기술명: "High-resolution Imaging (>25MP)", 선행기술: "Sub-pixel Edge Detection", 관계유형: "ENABLES", 설명: "고해상도 영상이 서브픽셀 에지 검출의 입력" },
  { 기술명: "Multi-wavelength Illumination", 선행기술: "High-resolution Imaging (>25MP)", 관계유형: "SYNERGY", 설명: "다파장 조명이 고해상도 이미징 결함 검출률 향상" },
  { 기술명: "IR Transmission Imaging", 선행기술: "Confocal Microscopy", 관계유형: "SYNERGY", 설명: "IR 투과와 공초점이 결합하여 TSV 내부+표면 동시 검사 가능" },
  { 기술명: "Micro-focus X-ray Source", 선행기술: "CT Reconstruction Algorithm", 관계유형: "PREREQUISITE", 설명: "CT 재구성에 마이크로포커스 X-ray 소스 필수" },
  { 기술명: "CT Reconstruction Algorithm", 선행기술: "GPU Parallel Processing", 관계유형: "PREREQUISITE", 설명: "CT 볼륨 재구성에 GPU 병렬 처리 필수" },
  { 기술명: "Scanning Acoustic Tomography (SAT)", 선행기술: "CT Reconstruction Algorithm", 관계유형: "SYNERGY", 설명: "SAT + X-ray CT 병행 시 Void 검출 신뢰도 향상" },
  { 기술명: "GPU Parallel Processing", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "PREREQUISITE", 설명: "딥러닝 학습 및 추론에 GPU 필수" },
  { 기술명: "GPU Parallel Processing", 선행기술: "Real-time 3D Rendering", 관계유형: "ENABLES", 설명: "GPU가 실시간 3D 데이터 렌더링 기반 제공" },
  { 기술명: "FPGA Real-time Processing", 선행기술: "GPU Parallel Processing", 관계유형: "SYNERGY", 설명: "FPGA 전처리 + GPU 후처리 파이프라인 시너지" },
  { 기술명: "FPGA Real-time Processing", 선행기술: "High-speed Image Acquisition", 관계유형: "PREREQUISITE", 설명: "고속 영상 획득에 FPGA 실시간 처리 필수" },
  { 기술명: "High-speed Image Acquisition", 선행기술: "High-resolution Imaging (>25MP)", 관계유형: "SYNERGY", 설명: "고속 획득 + 고해상도 이미징 결합으로 고속 전수 검사 실현" },
  { 기술명: "Sub-pixel Edge Detection", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "SYNERGY", 설명: "서브픽셀 에지 + DL 결합으로 미세 결함 검출 성능 극대화" },
  { 기술명: "Deep Learning (CNN/Transformer)", 선행기술: "Anomaly Detection (Unsupervised)", 관계유형: "ENABLES", 설명: "DL 기반 특징 추출이 비지도 이상 탐지의 기반" },
  { 기술명: "Deep Learning (CNN/Transformer)", 선행기술: "Adaptive Threshold Optimization", 관계유형: "ENABLES", 설명: "DL이 제품/공정별 자동 임계값 최적화 기반" },
  { 기술명: "Deep Learning (CNN/Transformer)", 선행기술: "Auto-Classification (AI)", 관계유형: "PREREQUISITE", 설명: "AI 자동 분류에 딥러닝 모델 필수" },
  { 기술명: "Anomaly Detection (Unsupervised)", 선행기술: "Auto-Classification (AI)", 관계유형: "SYNERGY", 설명: "이상 탐지 + AI 분류 결합으로 미지 결함 자동 검출+분류" },
  { 기술명: "Big Data Analytics Platform", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "SYNERGY", 설명: "빅데이터 분석과 딥러닝의 결합으로 데이터 기반 품질 최적화" },
  { 기술명: "Big Data Analytics Platform", 선행기술: "SPC/APC Integration", 관계유형: "ENABLES", 설명: "빅데이터 플랫폼이 SPC/APC 통합의 데이터 인프라" },
  { 기술명: "SPC/APC Integration", 선행기술: "Adaptive Threshold Optimization", 관계유형: "SYNERGY", 설명: "SPC 데이터 + 적응형 임계값이 결합하여 공정 제어 정밀도 향상" },
  { 기술명: "3D Point Cloud Processing", 선행기술: "Real-time 3D Rendering", 관계유형: "ENABLES", 설명: "포인트 클라우드가 실시간 3D 렌더링의 입력" },
  { 기술명: "3D Point Cloud Processing", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "SYNERGY", 설명: "3D 포인트 클라우드 + DL 결합으로 3D 결함 자동 인식" },
  { 기술명: "Wafer Warpage Measurement", 선행기술: "Large Panel Flatness Mapping", 관계유형: "ENABLES", 설명: "웨이퍼 워피지 기술이 패널 레벨 확장의 기반" },
  { 기술명: "Large Panel Flatness Mapping", 선행기술: "Stitching Algorithm (Large FOV)", 관계유형: "PREREQUISITE", 설명: "대면적 패널 측정에 스티칭 알고리즘 필수" },
  { 기술명: "Stitching Algorithm (Large FOV)", 선행기술: "FPGA Real-time Processing", 관계유형: "SYNERGY", 설명: "FPGA가 스티칭 연산 실시간 처리에 기여" },
  { 기술명: "Precision Motion Control (nm-level)", 선행기술: "High-resolution Imaging (>25MP)", 관계유형: "PREREQUISITE", 설명: "nm급 모션 제어가 고해상도 이미징의 기계적 기반" },
  { 기술명: "Precision Motion Control (nm-level)", 선행기술: "Confocal Microscopy", 관계유형: "PREREQUISITE", 설명: "공초점 현미경 스캔에 nm급 모션 제어 필수" },
  { 기술명: "Vibration Isolation / Environmental Control", 선행기술: "White Light Interferometry (WLI)", 관계유형: "PREREQUISITE", 설명: "WLI nm급 측정에 진동 차단 필수" },
  { 기술명: "Vibration Isolation / Environmental Control", 선행기술: "Precision Motion Control (nm-level)", 관계유형: "SYNERGY", 설명: "진동 차단 + 정밀 모션이 결합하여 측정 안정성 극대화" },
  { 기술명: "Vacuum / Clean Environment Handling", 선행기술: "Thin Wafer Handling (<50μm)", 관계유형: "ENABLES", 설명: "진공/클린 환경이 극박 웨이퍼 핸들링 기반" },
  { 기술명: "Thin Wafer Handling (<50μm)", 선행기술: "Precision Motion Control (nm-level)", 관계유형: "PREREQUISITE", 설명: "극박 웨이퍼 핸들링에 정밀 모션 제어 필수" },
  { 기술명: "Edge Computing Architecture", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "SYNERGY", 설명: "엣지 컴퓨팅에서의 DL 추론으로 실시간 인라인 AI 검사" },
  { 기술명: "Edge Computing Architecture", 선행기술: "FPGA Real-time Processing", 관계유형: "SYNERGY", 설명: "엣지 + FPGA 결합으로 저지연 처리" },
  { 기술명: "SECS/GEM (SEMI E30/E37)", 선행기술: "SPC/APC Integration", 관계유형: "PREREQUISITE", 설명: "SECS/GEM 장비 통신이 SPC/APC 통합의 전제" },
  { 기술명: "SECS/GEM (SEMI E30/E37)", 선행기술: "Big Data Analytics Platform", 관계유형: "ENABLES", 설명: "SECS/GEM이 빅데이터 수집의 장비 인터페이스" },
  { 기술명: "Multi-sensor Fusion", 선행기술: "Deep Learning (CNN/Transformer)", 관계유형: "SYNERGY", 설명: "멀티센서 데이터 + DL 결합으로 복합 결함 검출" },
  { 기술명: "Multi-sensor Fusion", 선행기술: "Scanning Acoustic Tomography (SAT)", 관계유형: "SYNERGY", 설명: "SAT + 광학 센서 융합으로 다층 구조 종합 검사" },
  { 기술명: "Multi-sensor Fusion", 선행기술: "Micro-focus X-ray Source", 관계유형: "SYNERGY", 설명: "X-ray + 광학 센서 융합으로 비파괴 종합 검사" },
];

// ===== TECH SPECS =====
const techSpecs = [
  { 기술명: "Moiré Interferometry", 스펙항목: "높이 분해능", 현재스펙: "0.1μm", 요구스펙: "0.05μm", 단위: "μm", 충족여부: false },
  { 기술명: "Moiré Interferometry", 스펙항목: "측정 속도", 현재스펙: "15", 요구스펙: "20", 단위: "fps", 충족여부: false },
  { 기술명: "Moiré Interferometry", 스펙항목: "측정 범위 (Z)", 현재스펙: "5000", 요구스펙: "5000", 단위: "μm", 충족여부: true },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 스펙항목: "높이 반복성 (3σ)", 현재스펙: "0.1", 요구스펙: "0.08", 단위: "μm", 충족여부: false },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 스펙항목: "Coplanarity 정밀도", 현재스펙: "0.5", 요구스펙: "0.3", 단위: "μm", 충족여부: false },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 스펙항목: "FOV", 현재스펙: "30×30", 요구스펙: "50×50", 단위: "mm", 충족여부: false },
  { 기술명: "Confocal Microscopy", 스펙항목: "축 분해능 (Z)", 현재스펙: "0.5", 요구스펙: "0.3", 단위: "μm", 충족여부: false },
  { 기술명: "Confocal Microscopy", 스펙항목: "측정 깊이", 현재스펙: "100", 요구스펙: "150", 단위: "μm", 충족여부: false },
  { 기술명: "Confocal Microscopy", 스펙항목: "측정 속도", 현재스펙: "5", 요구스펙: "10", 단위: "WPH", 충족여부: false },
  { 기술명: "White Light Interferometry (WLI)", 스펙항목: "높이 분해능", 현재스펙: "0.1", 요구스펙: "0.05", 단위: "nm", 충족여부: false },
  { 기술명: "White Light Interferometry (WLI)", 스펙항목: "측정 범위 (Z)", 현재스펙: "100", 요구스펙: "100", 단위: "μm", 충족여부: true },
  { 기술명: "High-resolution Imaging (>25MP)", 스펙항목: "해상도", 현재스펙: "25", 요구스펙: "50", 단위: "MP", 충족여부: false },
  { 기술명: "High-resolution Imaging (>25MP)", 스펙항목: "픽셀 크기", 현재스펙: "0.5", 요구스펙: "0.3", 단위: "μm/px", 충족여부: false },
  { 기술명: "High-resolution Imaging (>25MP)", 스펙항목: "프레임레이트", 현재스펙: "30", 요구스펙: "60", 단위: "fps", 충족여부: false },
  { 기술명: "Multi-wavelength Illumination", 스펙항목: "파장 대역 수", 현재스펙: "5", 요구스펙: "5", 단위: "bands", 충족여부: true },
  { 기술명: "Multi-wavelength Illumination", 스펙항목: "전환 속도", 현재스펙: "10", 요구스펙: "5", 단위: "ms", 충족여부: false },
  { 기술명: "IR Transmission Imaging", 스펙항목: "투과 파장", 현재스펙: "1100", 요구스펙: "1100", 단위: "nm", 충족여부: true },
  { 기술명: "IR Transmission Imaging", 스펙항목: "공간 분해능", 현재스펙: "2", 요구스펙: "1", 단위: "μm", 충족여부: false },
  { 기술명: "Telecentric Optics Design", 스펙항목: "텔레센트리시티 오차", 현재스펙: "0.05", 요구스펙: "0.02", 단위: "°", 충족여부: false },
  { 기술명: "Telecentric Optics Design", 스펙항목: "디스토션", 현재스펙: "0.03", 요구스펙: "0.01", 단위: "%", 충족여부: false },
  { 기술명: "High-NA Objective Lens", 스펙항목: "개구수 (NA)", 현재스펙: "0.5", 요구스펙: "0.7", 단위: "", 충족여부: false },
  { 기술명: "High-NA Objective Lens", 스펙항목: "작동 거리", 현재스펙: "10", 요구스펙: "15", 단위: "mm", 충족여부: false },
  { 기술명: "Micro-focus X-ray Source", 스펙항목: "Focal Spot", 현재스펙: "1", 요구스펙: "0.5", 단위: "μm", 충족여부: false },
  { 기술명: "Micro-focus X-ray Source", 스펙항목: "관전압", 현재스펙: "160", 요구스펙: "160", 단위: "kV", 충족여부: true },
  { 기술명: "CT Reconstruction Algorithm", 스펙항목: "복셀 분해능", 현재스펙: "1", 요구스펙: "0.5", 단위: "μm", 충족여부: false },
  { 기술명: "CT Reconstruction Algorithm", 스펙항목: "재구성 속도", 현재스펙: "30", 요구스펙: "10", 단위: "sec/slice", 충족여부: false },
  { 기술명: "Scanning Acoustic Tomography (SAT)", 스펙항목: "분해능", 현재스펙: "3", 요구스펙: "1", 단위: "μm", 충족여부: false },
  { 기술명: "Scanning Acoustic Tomography (SAT)", 스펙항목: "스캔 속도", 현재스펙: "10", 요구스펙: "20", 단위: "mm²/s", 충족여부: false },
  { 기술명: "Deep Learning (CNN/Transformer)", 스펙항목: "결함 검출률", 현재스펙: "95", 요구스펙: "99", 단위: "%", 충족여부: false },
  { 기술명: "Deep Learning (CNN/Transformer)", 스펙항목: "오검출률 (False Call)", 현재스펙: "3", 요구스펙: "0.5", 단위: "%", 충족여부: false },
  { 기술명: "Deep Learning (CNN/Transformer)", 스펙항목: "추론 속도", 현재스펙: "50", 요구스펙: "10", 단위: "ms/image", 충족여부: false },
  { 기술명: "Sub-pixel Edge Detection", 스펙항목: "에지 정밀도", 현재스펙: "0.1", 요구스펙: "0.05", 단위: "px", 충족여부: false },
  { 기술명: "Sub-pixel Edge Detection", 스펙항목: "처리 속도", 현재스펙: "30", 요구스펙: "60", 단위: "fps", 충족여부: false },
  { 기술명: "Anomaly Detection (Unsupervised)", 스펙항목: "미지 결함 검출률", 현재스펙: "80", 요구스펙: "95", 단위: "%", 충족여부: false },
  { 기술명: "Anomaly Detection (Unsupervised)", 스펙항목: "학습 데이터 필요량", 현재스펙: "1000", 요구스펙: "100", 단위: "samples", 충족여부: false },
  { 기술명: "Adaptive Threshold Optimization", 스펙항목: "수렴 속도", 현재스펙: "100", 요구스펙: "50", 단위: "iterations", 충족여부: false },
  { 기술명: "Auto-Classification (AI)", 스펙항목: "분류 정확도", 현재스펙: "92", 요구스펙: "98", 단위: "%", 충족여부: false },
  { 기술명: "Auto-Classification (AI)", 스펙항목: "분류 카테고리 수", 현재스펙: "20", 요구스펙: "50", 단위: "classes", 충족여부: false },
  { 기술명: "3D Point Cloud Processing", 스펙항목: "처리 포인트 수", 현재스펙: "10M", 요구스펙: "50M", 단위: "points/sec", 충족여부: false },
  { 기술명: "3D Point Cloud Processing", 스펙항목: "정합 정밀도", 현재스펙: "0.5", 요구스펙: "0.1", 단위: "μm", 충족여부: false },
  { 기술명: "Real-time 3D Rendering", 스펙항목: "렌더링 FPS", 현재스펙: "30", 요구스펙: "60", 단위: "fps", 충족여부: false },
  { 기술명: "GPU Parallel Processing", 스펙항목: "처리 성능", 현재스펙: "20", 요구스펙: "50", 단위: "TFLOPS", 충족여부: false },
  { 기술명: "GPU Parallel Processing", 스펙항목: "메모리", 현재스펙: "24", 요구스펙: "48", 단위: "GB", 충족여부: false },
  { 기술명: "FPGA Real-time Processing", 스펙항목: "처리 지연", 현재스펙: "1", 요구스펙: "0.5", 단위: "ms", 충족여부: false },
  { 기술명: "FPGA Real-time Processing", 스펙항목: "데이터 대역폭", 현재스펙: "100", 요구스펙: "200", 단위: "Gbps", 충족여부: false },
  { 기술명: "High-speed Image Acquisition", 스펙항목: "획득 속도", 현재스펙: "500", 요구스펙: "1000", 단위: "fps", 충족여부: false },
  { 기술명: "High-speed Image Acquisition", 스펙항목: "데이터 전송", 현재스펙: "25", 요구스펙: "100", 단위: "Gbps", 충족여부: false },
  { 기술명: "Wafer Warpage Measurement", 스펙항목: "측정 범위", 현재스펙: "300", 요구스펙: "300", 단위: "mm", 충족여부: true },
  { 기술명: "Wafer Warpage Measurement", 스펙항목: "높이 분해능", 현재스펙: "0.5", 요구스펙: "0.1", 단위: "μm", 충족여부: false },
  { 기술명: "Large Panel Flatness Mapping", 스펙항목: "패널 크기", 현재스펙: "510×515", 요구스펙: "600×600", 단위: "mm", 충족여부: false },
  { 기술명: "Large Panel Flatness Mapping", 스펙항목: "측정 속도", 현재스펙: "3", 요구스펙: "5", 단위: "panels/hr", 충족여부: false },
  { 기술명: "Stitching Algorithm (Large FOV)", 스펙항목: "정합 정밀도", 현재스펙: "0.5", 요구스펙: "0.1", 단위: "μm", 충족여부: false },
  { 기술명: "Stitching Algorithm (Large FOV)", 스펙항목: "스티칭 속도", 현재스펙: "1", 요구스펙: "3", 단위: "m²/hr", 충족여부: false },
  { 기술명: "Big Data Analytics Platform", 스펙항목: "데이터 처리량", 현재스펙: "1", 요구스펙: "10", 단위: "TB/day", 충족여부: false },
  { 기술명: "Big Data Analytics Platform", 스펙항목: "실시간 분석 지연", 현재스펙: "5", 요구스펙: "1", 단위: "sec", 충족여부: false },
  { 기술명: "SPC/APC Integration", 스펙항목: "APC 제어 주기", 현재스펙: "60", 요구스펙: "10", 단위: "sec", 충족여부: false },
  { 기술명: "SPC/APC Integration", 스펙항목: "SPC Rule 적용 수", 현재스펙: "8", 요구스펙: "15", 단위: "rules", 충족여부: false },
  { 기술명: "Precision Motion Control (nm-level)", 스펙항목: "위치 정밀도", 현재스펙: "50", 요구스펙: "10", 단위: "nm", 충족여부: false },
  { 기술명: "Precision Motion Control (nm-level)", 스펙항목: "스테이지 속도", 현재스펙: "300", 요구스펙: "500", 단위: "mm/s", 충족여부: false },
  { 기술명: "Vibration Isolation / Environmental Control", 스펙항목: "진동 차단", 현재스펙: "-60", 요구스펙: "-80", 단위: "dB", 충족여부: false },
  { 기술명: "Vibration Isolation / Environmental Control", 스펙항목: "온도 제어", 현재스펙: "±0.5", 요구스펙: "±0.1", 단위: "°C", 충족여부: false },
  { 기술명: "Thin Wafer Handling (<50μm)", 스펙항목: "핸들링 두께", 현재스펙: "50", 요구스펙: "30", 단위: "μm", 충족여부: false },
  { 기술명: "Thin Wafer Handling (<50μm)", 스펙항목: "파손율", 현재스펙: "0.1", 요구스펙: "0.01", 단위: "%", 충족여부: false },
  { 기술명: "Vacuum / Clean Environment Handling", 스펙항목: "파티클 제어", 현재스펙: "Class 100", 요구스펙: "Class 10", 단위: "", 충족여부: false },
  { 기술명: "Edge Computing Architecture", 스펙항목: "추론 지연", 현재스펙: "20", 요구스펙: "5", 단위: "ms", 충족여부: false },
  { 기술명: "Edge Computing Architecture", 스펙항목: "소비 전력", 현재스펙: "200", 요구스펙: "100", 단위: "W", 충족여부: false },
  { 기술명: "SECS/GEM (SEMI E30/E37)", 스펙항목: "통신 프로토콜", 현재스펙: "E30/E37", 요구스펙: "E30/E37/E40/E87/E90", 단위: "", 충족여부: false },
  { 기술명: "Multi-sensor Fusion", 스펙항목: "센서 동기화", 현재스펙: "1", 요구스펙: "0.1", 단위: "ms", 충족여부: false },
  { 기술명: "Multi-sensor Fusion", 스펙항목: "융합 센서 수", 현재스펙: "3", 요구스펙: "5", 단위: "types", 충족여부: false },
];

// ===== EQUIPMENT MAKERS =====
const equipmentMakers = [
  { 제조사명: "KLA", 국가: "USA", 웹사이트: "https://www.kla.com", 설명: "반도체 공정 제어 및 웨이퍼 검사 시장 1위. Surfscan, Puma, ICOS 브랜드 보유" },
  { 제조사명: "KLA (ICOS)", 국가: "Belgium", 웹사이트: "https://www.kla.com", 설명: "KLA의 반도체 후공정 검사 사업부. Die/Bump/Wire Bond 검사 전문" },
  { 제조사명: "Camtek", 국가: "Israel", 웹사이트: "https://www.camtek.com", 설명: "Advanced Packaging 전용 검사장비. Eagle, Falcon, Gryphon 시리즈" },
  { 제조사명: "Onto Innovation", 국가: "USA", 웹사이트: "https://www.ontoinnovation.com", 설명: "계측(Metrology) 및 검사. OCD, Overlay, TSV Inspection. 구 Nanometrics+Rudolph 합병" },
  { 제조사명: "CyberOptics (Nordson)", 국가: "USA", 웹사이트: "https://www.nordson.com", 설명: "MRS(Multi-Reflection Suppression) 기술 기반 3D 검사. 2022년 Nordson에 인수" },
  { 제조사명: "Koh Young", 국가: "Korea", 웹사이트: "https://www.kohyoung.com", 설명: "3D SPI/AOI 세계 시장점유율 1위. Moiré 기반 True 3D 측정 기술. 반도체 검사로 확장 중" },
  { 제조사명: "Mirtec", 국가: "Korea", 웹사이트: "https://www.mirtec.com", 설명: "SMT AOI/SPI 전문. MV-6 OMNI, MS-15 시리즈. 가성비 강점" },
  { 제조사명: "Viscom", 국가: "Germany", 웹사이트: "https://www.viscom.com", 설명: "독일 AOI/AXI 전문. S3088 시리즈. 3D+X-ray 하이브리드 옵션" },
  { 제조사명: "Nordson DAGE", 국가: "UK", 웹사이트: "https://www.nordson.com", 설명: "X-ray 검사 및 본드 테스트 전문. XD7800, Quadra 시리즈" },
  { 제조사명: "YXLON (Comet)", 국가: "Germany/Switzerland", 웹사이트: "https://www.yxlon.com", 설명: "산업용 X-ray/CT 시스템. 인라인 CT 검사 솔루션" },
  { 제조사명: "Nikon", 국가: "Japan", 웹사이트: "https://www.nikon.com", 설명: "X-ray CT 시스템. XT V 시리즈로 고분해능 오프라인 CT 검사" },
  { 제조사명: "SCREEN Semiconductor", 국가: "Japan", 웹사이트: "https://www.screen.co.jp", 설명: "반도체 제조장비 및 검사. 웨이퍼 세정, 코팅, 검사 장비" },
];

// ===== EQUIPMENT MODELS =====
const equipmentModels = [
  { 제조사명: "KLA", 모델명: "Surfscan 39xx", 시리즈: "Surfscan", 주요사양: '{"type":"광산란 방식","sensitivity":"<10nm","target":"웨이퍼 표면 결함"}', 검사유형: "WAFER_INSPECTION, SURFACE_INSPECTION" },
  { 제조사명: "KLA", 모델명: "Puma 9xxx", 시리즈: "Puma", 주요사양: '{"type":"Broadband 광학","method":"Die-to-Die 비교","target":"패턴 결함"}', 검사유형: "WAFER_INSPECTION" },
  { 제조사명: "KLA", 모델명: "Archer/ATL Series", 시리즈: "Archer", 주요사양: '{"accuracy":"<1nm overlay","type":"오버레이/CD 계측"}', 검사유형: "CD_METROLOGY, OVERLAY_METROLOGY" },
  { 제조사명: "KLA", 모델명: "Kronos Series", 시리즈: "Kronos", 주요사양: '{"type":"Confocal","target":"TSV 깊이 측정","depthRange":"50-100μm"}', 검사유형: "TSV_INSPECTION" },
  { 제조사명: "KLA (ICOS)", 모델명: "WI-2280", 시리즈: "WI", 주요사양: '{"heightResolution":"<1μm","speed":"고속 전수 검사","target":"Micro-bump 3D"}', 검사유형: "BUMP_INSPECTION" },
  { 제조사명: "KLA (ICOS)", 모델명: "T3/T7 Series", 시리즈: "T-Series", 주요사양: '{"accuracy":"<±2μm placement","target":"Die placement"}', 검사유형: "DIE_ATTACH_INSPECTION, ALIGNMENT_INSPECTION" },
  { 제조사명: "KLA (ICOS)", 모델명: "WI Series (Wire)", 시리즈: "WI", 주요사양: '{"target":"Wire loop, bond position","type":"Wire Bond 전용"}', 검사유형: "WIRE_BOND_INSPECTION" },
  { 제조사명: "Camtek", 모델명: "Eagle-i", 시리즈: "Eagle", 주요사양: '{"type":"Multi-modal","target":"Adv. Packaging RDL/Bump","resolution":"Sub-μm"}', 검사유형: "BUMP_INSPECTION, SURFACE_INSPECTION" },
  { 제조사명: "Camtek", 모델명: "Gryphon", 시리즈: "Gryphon", 주요사양: '{"type":"Advanced Packaging 특화","target":"Heterogeneous Integration"}', 검사유형: "BUMP_INSPECTION, SURFACE_INSPECTION" },
  { 제조사명: "Camtek", 모델명: "Falcon Series", 시리즈: "Falcon", 주요사양: '{"target":"몰드 표면/Flash","type":"Package 외관 검사"}', 검사유형: "MOLD_INSPECTION, SURFACE_INSPECTION" },
  { 제조사명: "Onto Innovation", 모델명: "Aspect System", 시리즈: "Aspect", 주요사양: '{"type":"IR 투과","target":"TSV 깊이/Profile","method":"적외선 투과 방식"}', 검사유형: "TSV_INSPECTION" },
  { 제조사명: "Onto Innovation", 모델명: "Firefly Series", 시리즈: "Firefly", 주요사양: '{"type":"3D 계측","target":"Bump coplanarity","resolution":"Sub-μm"}', 검사유형: "BUMP_INSPECTION, THICKNESS_METROLOGY" },
  { 제조사명: "Onto Innovation", 모델명: "Atlas/IMPULSE", 시리즈: "Atlas", 주요사양: '{"type":"OCD 방식","target":"Film/CD 복합 측정"}', 검사유형: "CD_METROLOGY, THICKNESS_METROLOGY" },
  { 제조사명: "CyberOptics (Nordson)", 모델명: "SQ3000+", 시리즈: "SQ3000", 주요사양: '{"technology":"MRS (Multi-Reflection Suppression)","type":"3D AOI","speed":"고속"}', 검사유형: "POST_REFLOW_AOI, BUMP_INSPECTION, BALL_ATTACH_INSPECTION" },
  { 제조사명: "CyberOptics (Nordson)", 모델명: "WX3000", 시리즈: "WX3000", 주요사양: '{"technology":"MRS","target":"3D bump/ball","type":"반도체 패키지 검사"}', 검사유형: "BUMP_INSPECTION, BALL_ATTACH_INSPECTION" },
  { 제조사명: "CyberOptics (Nordson)", 모델명: "SE600", 시리즈: "SE", 주요사양: '{"technology":"MRS 센서","type":"3D SPI","speed":"고속"}', 검사유형: "SPI" },
  { 제조사명: "Koh Young", 모델명: "KY8030-3", 시리즈: "KY8030", 주요사양: '{"technology":"Moiré 기반 True 3D","type":"3D SPI","marketPosition":"시장점유율 1위"}', 검사유형: "SPI" },
  { 제조사명: "Koh Young", 모델명: "KY8080", 시리즈: "KY8080", 주요사양: '{"technology":"Moiré Phase Shifting","type":"고속 3D SPI"}', 검사유형: "SPI" },
  { 제조사명: "Koh Young", 모델명: "Zenith 2", 시리즈: "Zenith", 주요사양: '{"technology":"Shadow-free 3D","type":"3D AOI","ai":"AI 불량 분류"}', 검사유형: "POST_REFLOW_AOI, PRE_REFLOW_AOI" },
  { 제조사명: "Koh Young", 모델명: "Zenith Alpha", 시리즈: "Zenith", 주요사양: '{"technology":"Shadow-free 3D","type":"Advanced 3D AOI"}', 검사유형: "POST_REFLOW_AOI, PRE_REFLOW_AOI" },
  { 제조사명: "Koh Young", 모델명: "Meister S", 시리즈: "Meister", 주요사양: '{"target":"반도체 패키징 검사","type":"Semiconductor 3D Inspection"}', 검사유형: "BUMP_INSPECTION, BALL_ATTACH_INSPECTION, DIE_ATTACH_INSPECTION" },
  { 제조사명: "Koh Young", 모델명: "Meister D", 시리즈: "Meister", 주요사양: '{"target":"Die-level 검사","type":"Die/Wire Bond Inspection"}', 검사유형: "DIE_ATTACH_INSPECTION, WIRE_BOND_INSPECTION" },
  { 제조사명: "Koh Young", 모델명: "Neptune Series", 시리즈: "Neptune", 주요사양: '{"target":"Advanced Packaging","type":"차세대 반도체 검사"}', 검사유형: "BUMP_INSPECTION, SURFACE_INSPECTION" },
  { 제조사명: "Mirtec", 모델명: "MV-6 OMNI", 시리즈: "MV-6", 주요사양: '{"camera":"15MP","type":"Omni-vision 3D AOI"}', 검사유형: "POST_REFLOW_AOI" },
  { 제조사명: "Mirtec", 모델명: "MS-15", 시리즈: "MS", 주요사양: '{"type":"고속 3D SPI","strength":"가성비"}', 검사유형: "SPI" },
  { 제조사명: "Viscom", 모델명: "S3088 Ultra Gold", 시리즈: "S3088", 주요사양: '{"type":"3D AOI + X-ray 하이브리드","hybrid":"Optical+X-ray 옵션"}', 검사유형: "POST_REFLOW_AOI, XRAY_2D" },
  { 제조사명: "Nordson DAGE", 모델명: "XD7800", 시리즈: "XD", 주요사양: '{"type":"마이크로포커스 X-ray","focalSpot":"<1μm","ct":"CT 기능 포함"}', 검사유형: "XRAY_2D, XRAY_3D, SAT_INSPECTION" },
  { 제조사명: "Nordson DAGE", 모델명: "Quadra 7", 시리즈: "Quadra", 주요사양: '{"type":"초음파(SAT)+X-ray","target":"Void/Delamination"}', 검사유형: "SAT_INSPECTION, XRAY_2D" },
  { 제조사명: "YXLON (Comet)", 모델명: "Cheetah EVO", 시리즈: "Cheetah", 주요사양: '{"type":"인라인 X-ray CT","speed":"인라인 대응"}', 검사유형: "XRAY_3D" },
  { 제조사명: "Nikon", 모델명: "XT V 160", 시리즈: "XT V", 주요사양: '{"type":"고분해능 CT","mode":"Offline","resolution":"Sub-μm"}', 검사유형: "XRAY_3D" },
];

// ===== TECHNOLOGIES =====
const technologies = [
  { 기술명: "Moiré Interferometry", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "Moiré 패턴 기반 위상 측정으로 3D 형상 계측", 필요숙련도: 5, 비고: "Koh Young 핵심 기술", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Substrate, Panel (PLP)" },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "위상 시프트 프로파일로메트리. 범프 동일평면도 측정에 필수. 정밀도 <0.1μm", 필요숙련도: 5, 비고: "Bump coplanarity 핵심", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, Substrate" },
  { 기술명: "Confocal Microscopy", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "공초점 현미경. High Aspect Ratio(HAR) 구조인 TSV 깊이 측정에 필수", 필요숙련도: 5, 비고: "TSV depth 측정 핵심", 적용제품: "HBM3E, HBM4, 2.5D CoWoS" },
  { 기술명: "White Light Interferometry (WLI)", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "백색광 간섭계. nm급 분해능의 표면 거칠기, Step Height 측정", 필요숙련도: 4, 비고: "nm급 분해능", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, 3D SoIC, Cooling" },
  { 기술명: "High-resolution Imaging (>25MP)", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "2D 영상", 설명: "고해상도 이미징. Sub-μm 해상도 카메라 시스템", 필요숙련도: 5, 비고: "전 제품 검사 기본", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Multi-wavelength Illumination", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "2D 영상", 설명: "다파장 조명 시스템. UV/Vis/IR 복합 조명으로 다양한 결함 검출", 필요숙련도: 4, 비고: "결함 유형별 최적 파장 적용", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "IR Transmission Imaging", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "2D 영상", 설명: "적외선 투과 이미징. Si 투과 특성을 이용한 TSV/적층 내부 검사", 필요숙련도: 4, 비고: "Si 투과 검사 핵심", 적용제품: "HBM3E, HBM4, 2.5D CoWoS, 3D SoIC" },
  { 기술명: "Telecentric Optics Design", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "광학계", 설명: "텔레센트릭 광학계 설계. 측정 왜곡 최소화", 필요숙련도: 5, 비고: "정밀 측정 기본 요소", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "High-NA Objective Lens", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "광학계", 설명: "고개구수(NA>0.5) 대물렌즈. μm 이하 미세 피치 검사에 필수", 필요숙련도: 5, 비고: "Micro-bump, Fine-pitch 검사", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Optic (CPO)" },
  { 기술명: "Micro-focus X-ray Source", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "X-ray", 설명: "마이크로포커스 X-ray 소스. <1μm focal spot. BGA Void, Crack 검사", 필요숙련도: 5, 비고: "X-ray/CT 검사 핵심", 적용제품: "HBM3E, HBM4, SOCAMM, 2.5D CoWoS" },
  { 기술명: "CT Reconstruction Algorithm", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "X-ray", 설명: "CT(Computed Tomography) 3D 재구성 알고리즘. 볼류메트릭 Void 분석", 필요숙련도: 4, 비고: "HBM MUF, SOCAMM BGA", 적용제품: "HBM3E, HBM4, SOCAMM, 2.5D CoWoS" },
  { 기술명: "Scanning Acoustic Tomography (SAT)", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "초음파", 설명: "주사 초음파 단층촬영. Delamination, Void 검출", 필요숙련도: 4, 비고: "적층 검사 필수", 적용제품: "HBM3E, HBM4, 2.5D CoWoS, 3D SoIC" },
  { 기술명: "GPU-accelerated Real-time Processing", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Image Processing", 설명: "GPU(CUDA/OpenCL) 기반 실시간 영상 처리. >30fps 3D 재구성", 필요숙련도: 5, 비고: "생산성 확보 핵심", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Sub-pixel Edge Detection", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Image Processing", 설명: "서브픽셀 에지 검출. 정밀도 0.01px 수준. 정렬/CD 측정에 필수", 필요숙련도: 5, 비고: "Alignment, CD 측정", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Substrate, Optic (CPO), Panel (PLP)" },
  { 기술명: "3D Point Cloud Reconstruction", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Image Processing", 설명: "3D 포인트 클라우드 실시간 재구성. Bump, Ball 3D 측정", 필요숙련도: 5, 비고: "실시간 3D 재구성", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Panel (PLP), Power, Cooling" },
  { 기술명: "Deep Learning Defect Classification", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "AI/ML", 설명: "딥러닝 기반 불량 자동 분류. CNN/Vision Transformer 활용", 필요숙련도: 5, 비고: "AI 불량 분류 핵심", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Anomaly Detection (Unsupervised)", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "AI/ML", 설명: "비지도 학습 기반 이상 탐지. AutoEncoder, GAN 활용. 신규 결함 유형 대응", 필요숙련도: 4, 비고: "Novel Defect Detection", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Adaptive Threshold Learning", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "AI/ML", 설명: "공정 변동 자동 보정. 적응형 임계값 학습", 필요숙련도: 4, 비고: "Process Variation 대응", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Big Data Analytics Platform", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Data Platform", 설명: "빅데이터 분석 플랫폼. SPC, Cpk 연계 전체 라인 최적화", 필요숙련도: 4, 비고: "전체 라인 공정 연계", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Digital Twin / Virtual Metrology", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Data Platform", 설명: "디지털 트윈 / 가상 계측. 실측 없이 품질 예측", 필요숙련도: 3, 비고: "예측 검사", 적용제품: "HBM3E, HBM4, SOCAMM, 2.5D CoWoS, 3D SoIC, Panel (PLP), Power" },
  { 기술명: "FPGA Real-time Signal Processing", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "FPGA", 설명: "FPGA 기반 실시간 신호 처리. 고속 센서 데이터 인터페이스", 필요숙련도: 4, 비고: "센서 인터페이스", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  { 기술명: "Sub-μm Precision Motion Stage", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Stage", 설명: "서브마이크론 정밀 모션 스테이지. 반복정밀도 <±0.1μm", 필요숙련도: 5, 비고: "웨이퍼/다이 검사 필수", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO)" },
  { 기술명: "Active Vibration Isolation", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Vibration", 설명: "능동 진동 절연 시스템. 진동 <0.5μm p-p", 필요숙련도: 5, 비고: "반도체급 정밀도 확보", 적용제품: "HBM3E, HBM4, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Optic (CPO)" },
  { 기술명: "Temperature-controlled Environment", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Thermal", 설명: "온도 제어 환경. ±0.1°C 안정성", 필요숙련도: 4, 비고: "정밀 계측 필수", 적용제품: "HBM3E, HBM4, 3D SoIC, Optic (CPO)" },
  { 기술명: "Thin Wafer Handling (<50μm)", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Handling", 설명: "50μm 미만 박형 웨이퍼 핸들링. 파손 방지", 필요숙련도: 5, 비고: "HBM 박형 웨이퍼", 적용제품: "HBM3E, HBM4, Thin Wafer, 2.5D CoWoS, 3D SoIC" },
  { 기술명: "Panel-level Handling (600×600mm+)", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Handling", 설명: "600mm 이상 대면적 패널 핸들링", 필요숙련도: 4, 비고: "Panel-level Packaging", 적용제품: "HBM3E, HBM4, LPDDR6, 2.5D CoWoS, Panel (PLP), Substrate" },
  { 기술명: "Multi-head Parallel Inspection", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Throughput", 설명: "멀티헤드 병렬 검사. 전수 검사 생산성 확보", 필요숙련도: 5, 비고: "양산 대응 필수", 적용제품: "HBM3E, HBM4, SOCAMM, LPDDR5, LPDDR5X, LPDDR6, ASIC/GPU Wafer, 2.5D CoWoS, 3D SoIC, Thin Wafer, Substrate, Optic (CPO), Panel (PLP), Power, Cooling" },
  // 신규 기술 4개
  { 기술명: "Hybrid Bonding Surface Metrology", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "Cu-Cu 하이브리드 본딩면 거칠기(Ra <0.5nm) 및 Cu 패드 Dishing/Protrusion 정밀 측정. AFM/WLI급 정밀도", 필요숙련도: 5, 비고: "SoIC/Hybrid Bonding 핵심", 적용제품: "3D SoIC" },
  { 기술명: "Wafer Warpage Measurement", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "극박 웨이퍼 워피지/보우 전면 측정. Shadow Moiré 또는 Fizeau 간섭계 기반. 전면 3D 형상 맵핑", 필요숙련도: 5, 비고: "Thin Wafer 핵심 계측", 적용제품: "Thin Wafer, ASIC/GPU Wafer, 2.5D CoWoS, Substrate, Panel (PLP)" },
  { 기술명: "Large-area Stitching Inspection", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Image Processing", 설명: "대면적(reticle 이상) 패턴을 고속 이미지 스티칭으로 전수 검사. CoWoS 인터포저(65×79mm) 대응", 필요숙련도: 5, 비고: "CoWoS 대면적 검사 핵심", 적용제품: "2.5D CoWoS, ASIC/GPU Wafer, Panel (PLP), Substrate" },
  { 기술명: "Ultra-thin Die Handling (<30μm)", 카테고리: "HARDWARE_MECHANICS", 서브카테고리: "Handling", 설명: "30μm 미만 극박 다이/웨이퍼 전용 비접촉 핸들링. Bernoulli 척, 정전척, 에어베어링 기반", 필요숙련도: 5, 비고: "극박 다이 핸들링 전용", 적용제품: "Thin Wafer, 3D SoIC" },
  // 신규 기술 5개 (Substrate, CPO, PLP, Power, Cooling)
  { 기술명: "Fiber Optical Alignment Metrology", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "광섬유-PIC 결합 정렬 정밀 계측. 능동 정렬(Active Alignment) 기반 Sub-μm 위치 제어. 결합 손실(IL) <1dB 보장", 필요숙련도: 5, 비고: "CPO 핵심 계측. 완전 신규 모달리티", 적용제품: "Optic (CPO)" },
  { 기술명: "Photonic IC Waveguide Inspection", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "2D 영상", 설명: "실리콘 포토닉스 도파관 결함/산란 검사. NIR(근적외선) 영상 기반 도파관 손실 맵핑", 필요숙련도: 5, 비고: "PIC 전용 NIR 검사", 적용제품: "Optic (CPO)" },
  { 기술명: "Large Panel Flatness Mapping (>600mm)", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "600mm+ 대면적 사각 패널 전면 평탄도/워피지 고속 측정. Shadow Moiré 확장 또는 구조광 기반", 필요숙련도: 5, 비고: "PLP 대면적 워피지 핵심", 적용제품: "Panel (PLP), Substrate" },
  { 기술명: "Sintered Joint Porosity Analysis", 카테고리: "SOFTWARE_ALGORITHM", 서브카테고리: "Image Processing", 설명: "소결(Sinter) 접합부 X-ray/SAT 영상 포로시티(기공률) 자동 정량 분석. 보이드 면적비/분포 자동 판정", 필요숙련도: 4, 비고: "파워 반도체 소결 검사 핵심", 적용제품: "Power" },
  { 기술명: "Thermal Interface Void Detection", 카테고리: "OPTICAL_SENSOR", 서브카테고리: "3D 측정", 설명: "TIM(열전도 소재) 층 보이드 비파괴 검출. SAT/IR/3D 광학 복합 기법. SPI 기술 응용 가능", 필요숙련도: 4, 비고: "Cooling TIM 보이드 검출 핵심", 적용제품: "Cooling" },
];

// ===== KY PRODUCTS =====
const kyProducts = [
  { 제품명: "KY8030-3 SPI", 시리즈: "KY8030", 카테고리: "SPI", 설명: "Moiré 기반 True 3D SPI. 솔더 페이스트 체적/높이/면적 정밀 측정. 3D SPI 시장 점유율 1위", 주요사양: "Moiré Phase Shifting, Shadow-free, 고속 전수 검사", 주검사유형: "SPI", 현재제품: true },
  { 제품명: "KY8080 SPI", 시리즈: "KY8080", 카테고리: "SPI", 설명: "고속 3D SPI. KY8030 대비 처리량 향상", 주요사양: "고속 Moiré, 대면적 기판 대응", 주검사유형: "SPI", 현재제품: true },
  { 제품명: "Zenith 2 AOI", 시리즈: "Zenith", 카테고리: "AOI", 설명: "Shadow-free 3D AOI. AI 기반 불량 분류. Post-reflow 검사 특화", 주요사양: "Shadow-free 3D, AI Classification, True 3D", 주검사유형: "POST_REFLOW_AOI", 현재제품: true },
  { 제품명: "Zenith Alpha AOI", 시리즈: "Zenith", 카테고리: "AOI", 설명: "Advanced 3D AOI. Zenith 2 대비 확장 기능", 주요사양: "Shadow-free 3D, Multi-angle, 확장 검사 영역", 주검사유형: "POST_REFLOW_AOI", 현재제품: true },
  { 제품명: "Meister S", 시리즈: "Meister", 카테고리: "Semiconductor", 설명: "반도체 패키징 검사. Bump/Ball/Die 검사 대응", 주요사양: "3D 측정, 반도체 패키지 전용, Bump coplanarity", 주검사유형: "BUMP_INSPECTION", 현재제품: true },
  { 제품명: "Meister D", 시리즈: "Meister", 카테고리: "Semiconductor", 설명: "Die-level 검사. Wire Bond, Die Attach 검사", 주요사양: "Die placement, Wire loop height, Bond 검사", 주검사유형: "DIE_ATTACH_INSPECTION", 현재제품: true },
  { 제품명: "KSMART Platform", 시리즈: "KSMART", 카테고리: "Software", 설명: "공정 최적화 빅데이터 플랫폼. SPC 연계, 공장 전체 데이터 분석", 주요사양: "Big Data Analytics, AI, Connected Factory, SPC", 주검사유형: "", 현재제품: true },
];

// ===== KY CAPABILITIES =====
const kyCapabilities = [
  { 기술명: "Moiré Interferometry", 현재수준: 5, 필요수준: 5, Gap수준: "NONE", Gap설명: "시장 1위 기술. SMT/반도체 후공정 모두 대응", 개선계획: "현 수준 유지 및 지속 혁신" },
  { 기술명: "Phase-Shifting Profilometry (PSP)", 현재수준: 5, 필요수준: 5, Gap수준: "NONE", Gap설명: "Zenith/Meister 시리즈에 적용. Shadow-free 독자 기술", 개선계획: "반도체 미세 피치 대응 고도화" },
  { 기술명: "Confocal Microscopy", 현재수준: 1, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. TSV 검사 핵심 기술이나 완전 새로운 광학 아키텍처 필요", 개선계획: "신규 개발 또는 기술 제휴. 24-36개월 소요 예상" },
  { 기술명: "White Light Interferometry (WLI)", 현재수준: 2, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "기초 기술 보유하나 nm급 분해능 미달", 개선계획: "광학계 정밀도 향상. 12-18개월" },
  { 기술명: "High-resolution Imaging (>25MP)", 현재수준: 4, 필요수준: 5, Gap수준: "SMALL", Gap설명: "고해상도 카메라 시스템 보유. 반도체급 확장 필요", 개선계획: "센서 업그레이드 및 광학계 최적화. 6-12개월" },
  { 기술명: "Multi-wavelength Illumination", 현재수준: 4, 필요수준: 4, Gap수준: "NONE", Gap설명: "다파장 조명 기술 보유", 개선계획: "현 수준 유지" },
  { 기술명: "IR Transmission Imaging", 현재수준: 1, 필요수준: 4, Gap수준: "LARGE", Gap설명: "미보유. Si 투과 TSV/적층 검사에 필수이나 새로운 센서 개발 필요", 개선계획: "IR 센서/광원 개발 필요. 24-36개월" },
  { 기술명: "Telecentric Optics Design", 현재수준: 5, 필요수준: 5, Gap수준: "NONE", Gap설명: "핵심 역량. 전 제품 라인에 적용", 개선계획: "현 수준 유지" },
  { 기술명: "High-NA Objective Lens", 현재수준: 3, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "SMT급 광학계 보유. HBM4 ~9μm pitch 대응 위한 고NA 렌즈 필요", 개선계획: "광학 설계 고도화. 12-24개월" },
  { 기술명: "Micro-focus X-ray Source", 현재수준: 0, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. 전혀 다른 물리적 원리. 자체 개발 비현실적", 개선계획: "M&A 또는 장기 전략적 파트너십 필요" },
  { 기술명: "CT Reconstruction Algorithm", 현재수준: 0, 필요수준: 4, Gap수준: "LARGE", Gap설명: "미보유. X-ray 소스와 함께 확보 필요", 개선계획: "X-ray 기술 확보 시 함께 개발" },
  { 기술명: "Scanning Acoustic Tomography (SAT)", 현재수준: 0, 필요수준: 4, Gap수준: "LARGE", Gap설명: "미보유. 비광학 모달리티로 별도 사업 영역", 개선계획: "M&A 우선 검토. 자체 개발 시 36-48개월" },
  { 기술명: "GPU-accelerated Real-time Processing", 현재수준: 4, 필요수준: 5, Gap수준: "SMALL", Gap설명: "GPU 처리 기술 보유. 반도체급 throughput 확장 필요", 개선계획: "처리 엔진 최적화. 6-12개월" },
  { 기술명: "Sub-pixel Edge Detection", 현재수준: 4, 필요수준: 5, Gap수준: "SMALL", Gap설명: "기본 알고리즘 보유. 반도체 nm급 정밀도 보강 필요", 개선계획: "알고리즘 고도화. 6-12개월" },
  { 기술명: "3D Point Cloud Reconstruction", 현재수준: 5, 필요수준: 5, Gap수준: "NONE", Gap설명: "핵심 역량. 실시간 3D 재구성 기술 보유", 개선계획: "현 수준 유지" },
  { 기술명: "Deep Learning Defect Classification", 현재수준: 4, 필요수준: 5, Gap수준: "SMALL", Gap설명: "KSMART 플랫폼 AI 분류 기능 보유. 반도체 특화 학습 데이터 보강 필요", 개선계획: "반도체 학습 데이터 확보 및 모델 고도화. 6-12개월" },
  { 기술명: "Anomaly Detection (Unsupervised)", 현재수준: 3, 필요수준: 4, Gap수준: "SMALL", Gap설명: "기본 이상 탐지 기능 보유. 반도체 환경 특화 필요", 개선계획: "비지도 학습 모델 개선. 6-12개월" },
  { 기술명: "Adaptive Threshold Learning", 현재수준: 3, 필요수준: 4, Gap수준: "SMALL", Gap설명: "기본 적응형 로직 보유", 개선계획: "반도체 공정 변동 대응 고도화" },
  { 기술명: "Big Data Analytics Platform", 현재수준: 4, 필요수준: 4, Gap수준: "NONE", Gap설명: "KSMART 플랫폼으로 대응. 반도체 Fab 환경 확장 필요", 개선계획: "Fab 환경 인터페이스 확장" },
  { 기술명: "Digital Twin / Virtual Metrology", 현재수준: 2, 필요수준: 3, Gap수준: "SMALL", Gap설명: "초기 연구 단계", 개선계획: "KSMART 연계 가상 계측 기능 개발. 12-18개월" },
  { 기술명: "FPGA Real-time Signal Processing", 현재수준: 4, 필요수준: 4, Gap수준: "NONE", Gap설명: "FPGA 신호 처리 기술 보유", 개선계획: "현 수준 유지" },
  { 기술명: "Sub-μm Precision Motion Stage", 현재수준: 3, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "SMT급 스테이지 보유. 반도체급 <±0.1μm 미달", 개선계획: "정밀 스테이지 개발/외부 조달. 12-18개월" },
  { 기술명: "Active Vibration Isolation", 현재수준: 3, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "기본 제진 시스템 보유. 반도체급 능동 제진 필요", 개선계획: "능동 제진 시스템 도입. 12-18개월" },
  { 기술명: "Temperature-controlled Environment", 현재수준: 2, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "기본 온도 관리. ±0.1°C 정밀 제어 미달", 개선계획: "정밀 온도 제어 챔버 설계. 12-18개월" },
  { 기술명: "Thin Wafer Handling (<50μm)", 현재수준: 2, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "제한적 핸들링 경험. 반도체 전용 시스템 필요", 개선계획: "전용 핸들링 시스템 개발 또는 외부 핸들러 협력. 12-18개월" },
  { 기술명: "Panel-level Handling (600×600mm+)", 현재수준: 1, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "미보유. Stage 및 광학계 확장 설계 필요", 개선계획: "대면적 스테이지/광학계 설계. 12-18개월" },
  { 기술명: "Multi-head Parallel Inspection", 현재수준: 3, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "듀얼헤드 경험 보유. 반도체급 고속 멀티헤드 필요", 개선계획: "멀티헤드 아키텍처 확장. 12-24개월" },
  { 기술명: "Hybrid Bonding Surface Metrology", 현재수준: 1, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. nm급 표면 거칠기 측정은 AFM/WLI 기반 완전 신규 역량. 하이브리드 본딩 성패 좌우", 개선계획: "신규 계측 모듈 개발 또는 기술 제휴. 24-36개월" },
  { 기술명: "Wafer Warpage Measurement", 현재수준: 2, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "기초 형상 측정 보유. 전면 고속 워피지 맵핑 미달. Moiré 기술 활용 가능성 있음", 개선계획: "Shadow Moiré 기반 전면 측정 모듈 개발. 12-18개월" },
  { 기술명: "Large-area Stitching Inspection", 현재수준: 3, 필요수준: 5, Gap수준: "MEDIUM", Gap설명: "AOI 스티칭 기본 보유. 대면적(>50mm) 고속 정밀 미달. CoWoS 인터포저 대응 필요", 개선계획: "멀티카메라 동시 촬영 + 스티칭 알고리즘 고도화. 12-18개월" },
  { 기술명: "Ultra-thin Die Handling (<30μm)", 현재수준: 1, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. 비접촉 핸들링은 전혀 새로운 기구 설계. Bernoulli/정전척 기반", 개선계획: "비접촉 척 개발 또는 외부 핸들러 업체 협력. 18-24개월" },
  // 신규 5개 (Substrate, CPO, PLP, Power, Cooling)
  { 기술명: "Fiber Optical Alignment Metrology", 현재수준: 0, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. 광섬유 결합 정렬은 완전 신규 모달리티. 능동 정렬 기반 Sub-μm 위치 제어 기술 필요", 개선계획: "포토닉스 기업 기술 제휴 또는 전문 인력 영입. 24-36개월" },
  { 기술명: "Photonic IC Waveguide Inspection", 현재수준: 0, 필요수준: 5, Gap수준: "LARGE", Gap설명: "미보유. PIC 전용 NIR 검사 기술이 완전히 새로운 영역. 도파관 손실 맵핑 역량 부재", 개선계획: "포토닉스 검사 기업 협력 또는 NIR 이미징 모듈 선행 개발. 24-36개월" },
  { 기술명: "Large Panel Flatness Mapping (>600mm)", 현재수준: 2, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "Moiré 기초 기술 보유하나 600mm+ 대면적 고속 측정 미달. Shadow Moiré 확장 설계 필요", 개선계획: "Moiré 기술 확장 대면적 모듈 개발. 12-18개월" },
  { 기술명: "Sintered Joint Porosity Analysis", 현재수준: 1, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "기본 영상 분석 역량 보유하나 소결 접합 특화 포로시티 분석 알고리즘 미보유", 개선계획: "X-ray/SAT 영상 확보 후 소결 전용 알고리즘 개발. 12-24개월" },
  { 기술명: "Thermal Interface Void Detection", 현재수준: 2, 필요수준: 4, Gap수준: "MEDIUM", Gap설명: "SPI 기술로 TIM 도포 패턴 검사 가능하나 경화 후 보이드 비파괴 검출은 SAT 의존", 개선계획: "SPI 기술 응용 단기 대응(TIM 도포 검사) + SAT 연계 중장기 확보. 6-18개월" },
];

// ===== DEVELOPMENT PROJECTS =====
const devProjects = [
  { 프로젝트명: "HBM Micro-Bump 고해상도 3D (<10μm pitch)", 설명: "Meister 플랫폼 확장. 신규 고NA 광학 모듈 개발. HBM4 ~9μm pitch 대응", 난이도: 5, 최소기간: 18, 최대기간: 30, 시간구분: "MID_TERM", 최소투자: 20000, 최대투자: 50000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "고NA 광학계 설계, 신규 센서 개발" },
  { 프로젝트명: "TSV Inspection (Confocal/IR)", 설명: "완전 신규 제품 라인. Confocal/IR 기반 TSV 깊이/Void 검사 기술", 난이도: 5, 최소기간: 24, 최대기간: 36, 시간구분: "LONG_TERM", 최소투자: 30000, 최대투자: 50000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "IR 광원/센서 개발, Confocal 광학계 설계" },
  { 프로젝트명: "Die Stacking Alignment 고정밀화", 설명: "Meister 플랫폼 활용. Sub-0.5μm 정렬 정밀도 확보", 난이도: 4, 최소기간: 12, 최대기간: 24, 시간구분: "MID_TERM", 최소투자: 10000, 최대투자: 20000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "Stage 정밀화, 알고리즘 개선" },
  { 프로젝트명: "Panel-level 대면적 검사 대응", 설명: "600mm 이상 패널 대응. 대면적 Stage 및 Multi-head 아키텍처", 난이도: 4, 최소기간: 12, 최대기간: 18, 시간구분: "MID_TERM", 최소투자: 10000, 최대투자: 20000, 우선순위: "MEDIUM", 상태: "PLANNED", 대상제품군: "HBM, LPDDR", 선행조건: "대면적 Stage, Multi-head 설계" },
  { 프로젝트명: "AI 반도체 특화 불량 분류 고도화", 설명: "KSMART 플랫폼 확장. 반도체 학습 데이터 확보 및 Vision Transformer 적용", 난이도: 3, 최소기간: 6, 최대기간: 12, 시간구분: "SHORT_TERM", 최소투자: 3000, 최대투자: 8000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "HBM, SOCAMM, LPDDR", 선행조건: "반도체 학습 데이터 확보 (파트너 협력)" },
  { 프로젝트명: "X-ray / AXI 기술 확보", 설명: "자체 개발 비현실적. M&A 또는 JV(Joint Venture) 권고. X-ray 소스, 디텍터, CT 알고리즘 필요", 난이도: 5, 최소기간: 6, 최대기간: 12, 시간구분: "MID_TERM", 최소투자: 50000, 최대투자: 100000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "HBM, SOCAMM", 선행조건: "M&A 대상 기업 발굴, Due Diligence" },
  { 프로젝트명: "SAT (초음파) 기술 확보", 설명: "비광학 모달리티. M&A 우선 검토. 초음파 트랜스듀서, 영상 처리 기술 필요", 난이도: 5, 최소기간: 6, 최대기간: 12, 시간구분: "MID_TERM", 최소투자: 30000, 최대투자: 50000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "M&A 대상 기업 발굴" },
  { 프로젝트명: "Thin Wafer Handling 시스템", 설명: "50μm 미만 박형 웨이퍼 전용 핸들링 시스템. 정전척/진공척 기반", 난이도: 3, 최소기간: 12, 최대기간: 18, 시간구분: "MID_TERM", 최소투자: 5000, 최대투자: 10000, 우선순위: "MEDIUM", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "기구 설계, 외부 핸들러 업체 협력" },
  { 프로젝트명: "HBM 전용 통합 검사 솔루션", 설명: "복수 모달리티(3D Optical + X-ray + SAT) 통합 플랫폼. End-to-end HBM 검사 라인 제공", 난이도: 5, 최소기간: 24, 최대기간: 36, 시간구분: "LONG_TERM", 최소투자: 30000, 최대투자: 50000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "HBM", 선행조건: "X-ray, SAT 기술 확보 후 통합" },
  { 프로젝트명: "SOCAMM 라인 표준 장비화", 설명: "SOCAMM 모듈 조립 라인에 KY SPI+AOI를 표준 검사 장비로 채택 확대", 난이도: 2, 최소기간: 3, 최대기간: 12, 시간구분: "SHORT_TERM", 최소투자: 2000, 최대투자: 5000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "SOCAMM", 선행조건: "SOCAMM 고객사 접점 확보, 데모/평가" },
  { 프로젝트명: "CoWoS 대면적 인터포저 검사 솔루션", 설명: "65×79mm급 대면적 실리콘 인터포저 전수 검사. 대면적 스티칭 + μBump 3D + TC 본딩 정렬 검증 통합 솔루션", 난이도: 5, 최소기간: 18, 최대기간: 30, 시간구분: "MID_TERM", 최소투자: 20000, 최대투자: 40000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "CoWoS", 선행조건: "대면적 스티칭 알고리즘, 고속 Stage, Multi-head 아키텍처" },
  { 프로젝트명: "Hybrid Bonding 표면 계측 모듈", 설명: "Cu-Cu 하이브리드 본딩용 표면 거칠기(Ra <0.5nm) 및 Cu 패드 Dishing/Protrusion nm급 정밀 계측. SoIC/V-Cache 대응", 난이도: 5, 최소기간: 24, 최대기간: 36, 시간구분: "LONG_TERM", 최소투자: 25000, 최대투자: 50000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "SoIC", 선행조건: "WLI/AFM급 광학 모듈 개발, nm급 측정 알고리즘" },
  { 프로젝트명: "GPU Wafer RDL/Bump 고해상도 검사", 설명: "ASIC/GPU 웨이퍼 RDL CD/Overlay + Cu Pillar 전수 3D 검사. Meister/Neptune 플랫폼 확장", 난이도: 4, 최소기간: 12, 최대기간: 18, 시간구분: "MID_TERM", 최소투자: 10000, 최대투자: 20000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "GPU/ASIC", 선행조건: "고해상도 광학 모듈, 대면적 고속 스캔" },
  { 프로젝트명: "Thin Wafer 전용 검사/핸들링 플랫폼", 설명: "극박 웨이퍼(<50μm) 전용 검사 + 핸들링 통합 플랫폼. TTV/워피지 측정 + 비접촉 핸들링 + 크랙 검출", 난이도: 4, 최소기간: 18, 최대기간: 24, 시간구분: "MID_TERM", 최소투자: 15000, 최대투자: 25000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "Wafer Process", 선행조건: "비접촉 척 개발, 워피지 측정 모듈, 정밀 핸들러 협력" },
  { 프로젝트명: "SoIC Die-to-Wafer 정밀 정렬 검사", 설명: "하이브리드 본딩용 Die-to-Wafer 오버레이 정밀 측정. <0.2μm overlay 검증 + 본딩 후 인터페이스 검사", 난이도: 5, 최소기간: 18, 최대기간: 30, 시간구분: "MID_TERM", 최소투자: 15000, 최대투자: 30000, 우선순위: "CRITICAL", 상태: "PLANNED", 대상제품군: "SoIC", 선행조건: "Sub-0.2μm 정밀 측정 광학계, SAT/IR 복합 검사 기술" },
  // 신규 6개 (Substrate, CPO, PLP, Power, Cooling)
  { 프로젝트명: "Substrate Bump/Coplanarity 검사 솔루션", 설명: "Meister 플랫폼 확장. C4/C2 솔더 범프 3D 검사 + 대형 기판 동일평면도 전수 측정. ABF/Glass Core 기판 대응", 난이도: 3, 최소기간: 12, 최대기간: 18, 시간구분: "MID_TERM", 최소투자: 10000, 최대투자: 20000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "Substrate", 선행조건: "Meister 광학 모듈 대형 기판 대응 확장, 워피지 측정 연동" },
  { 프로젝트명: "Glass Core Substrate 비아(TGV) 검사 기술", 설명: "Glass Core 기판 Through Glass Via(TGV) 충전/결함 검사. IR 투과 또는 X-ray 기반 비파괴 검사", 난이도: 4, 최소기간: 18, 최대기간: 24, 시간구분: "MID_TERM", 최소투자: 15000, 최대투자: 25000, 우선순위: "MEDIUM", 상태: "PLANNED", 대상제품군: "Substrate", 선행조건: "Glass 투과 광학계 또는 X-ray 소스 확보" },
  { 프로젝트명: "CPO 광학 정렬 검사 모듈", 설명: "TSMC COUPE 기반 PIC-EIC 통합 패키지용 광학 축 정렬 검사. FAU 배치 정밀도 + 삽입 손실(IL) 인라인 측정", 난이도: 5, 최소기간: 18, 최대기간: 30, 시간구분: "LONG_TERM", 최소투자: 20000, 최대투자: 40000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "CPO", 선행조건: "포토닉스 기업 기술 제휴, NIR 이미징 모듈 개발, 능동 정렬 장비 연동" },
  { 프로젝트명: "PLP 워피지 관리 & 인라인 검사 시스템", 설명: "600×600mm+ 사각 패널 전면 워피지/평탄도 인라인 고속 측정. Moiré 기반 대면적 확장 + 패널 RDL 패턴 검사", 난이도: 4, 최소기간: 12, 최대기간: 24, 시간구분: "MID_TERM", 최소투자: 10000, 최대투자: 25000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "PLP", 선행조건: "대면적 Moiré 모듈 설계, 패널 핸들러 협력, 대면적 스티칭 알고리즘" },
  { 프로젝트명: "Power Device 소결 조인트 검사 기술", 설명: "SiC/GaN 파워 모듈 소결(Sinter) 접합부 보이드/포로시티 자동 검사. X-ray/SAT 영상 + AI 자동 판정", 난이도: 3, 최소기간: 12, 최대기간: 18, 시간구분: "MID_TERM", 최소투자: 8000, 최대투자: 15000, 우선순위: "MEDIUM", 상태: "PLANNED", 대상제품군: "Power", 선행조건: "X-ray/SAT 장비 확보 (자체 또는 협력), 소결 전용 AI 알고리즘" },
  { 프로젝트명: "TIM 보이드/도포 검사 모듈", 설명: "AI GPU/HBM용 TIM 도포 패턴/체적 검사 + 경화 후 보이드 검출. SPI 기술 응용 단기 상용화 + SAT 연계 중기 확장", 난이도: 3, 최소기간: 6, 최대기간: 12, 시간구분: "SHORT_TERM", 최소투자: 5000, 최대투자: 10000, 우선순위: "HIGH", 상태: "PLANNED", 대상제품군: "Cooling", 선행조건: "KY SPI 엔진 TIM 응용 레시피, SAT 연계 인터페이스" },
];

// ===== STRATEGIC ACTIONS =====
const strategicActions = [
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "SHORT_TERM", 액션: "SOCAMM 3D SPI/AOI 적극 수주", 설명: "기존 KY8030/Zenith 라인업으로 SOCAMM 모듈 조립 라인 즉시 대응 가능. 시장 선점 필요", 우선순위: "CRITICAL" },
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "MID_TERM", 액션: "SOCAMM 라인 표준 장비화", 설명: "NVIDIA 및 SOCAMM 고객사와 파트너십 통해 표준 검사 장비 지위 확보", 우선순위: "HIGH" },
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "LONG_TERM", 액션: "SMT-to-Semiconductor 브릿지 포지셔닝", 설명: "SMT 강점을 반도체 패키징까지 자연 확장하는 포지셔닝 전략", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "SHORT_TERM", 액션: "AI 반도체 특화 학습 + LPDDR Ball/Wire Bond 검사 강화", 설명: "KSMART AI 고도화 및 Meister 시리즈 LPDDR 대응력 강화", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "MID_TERM", 액션: "HBM Micro-Bump 고해상도 3D + Die Stacking Alignment", 설명: "Meister 플랫폼 기반 HBM 전용 검사 모듈 개발", 우선순위: "CRITICAL" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "LONG_TERM", 액션: "HBM 전용 통합 검사 솔루션 출시", 설명: "복수 모달리티 통합 플랫폼으로 HBM 검사 End-to-End 제공", 우선순위: "CRITICAL" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "SHORT_TERM", 액션: "X-ray 파트너십 탐색", 설명: "X-ray/CT 기술 보유 기업 탐색 및 MOU 체결", 우선순위: "HIGH" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "MID_TERM", 액션: "X-ray/CT 기술 확보 (M&A)", 설명: "X-ray 검사 기업 인수 또는 합작법인 설립", 우선순위: "CRITICAL" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "LONG_TERM", 액션: "Multi-modal 통합 플랫폼 (3D Optical + X-ray + SAT)", 설명: "광학+X-ray+초음파 통합 검사 플랫폼 구축", 우선순위: "CRITICAL" },
  { 영역: "비추천 (진입 장벽 과다)", 시간구분: "LONG_TERM", 액션: "Wafer-level Front-end 검사 (KLA 독점) — 비추천", 설명: "KLA 독점 영역. 진입 장벽 극히 높아 전략적 투자 비효율", 우선순위: "LOW" },
  // 신규 7개 (Substrate, CPO, PLP, Power, Cooling)
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "SHORT_TERM", 액션: "기존 Meister로 Substrate Bump/Coplanarity PoC 확보", 설명: "Meister S 플랫폼으로 ABF 기판 C4/C2 범프 3D + 동일평면도 검사 데모. 기존 역량 즉시 투입 가능 영역 선점", 우선순위: "HIGH" },
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "SHORT_TERM", 액션: "TIM 도포 검사 SPI 기술 응용 조기 상용화", 설명: "KY SPI 엔진을 TIM 디스펜싱 검사에 응용. 체적/패턴/커버리지 측정 레시피 개발. 단기 매출 기여 가능", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "MID_TERM", 액션: "PLP 대면적 워피지/패턴 인라인 검사 OSAT 파트너십", 설명: "600mm+ 패널 전면 워피지 + RDL 패턴 검사 인라인 시스템. OSAT 파트너사와 공동 개발/평가", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "MID_TERM", 액션: "Power Device 소결/클립 본드 검사 → 전력반도체 시장 진입", 설명: "SiC/GaN 파워 모듈 소결 접합 보이드 + Cu 클립 본딩 3D 검사. EV/산업용 전력 변환 시장 신규 진입", 우선순위: "MEDIUM" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "MID_TERM", 액션: "CPO 광학 정렬 검사 기술 선행 개발 + 포토닉스 기업 제휴", 설명: "TSMC COUPE 기반 CPO 패키지 광학 축 정렬 검사 모듈 선행 개발. 포토닉스 전문기업 기술 제휴 또는 인력 영입", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "LONG_TERM", 액션: "Glass Core Substrate 검사 솔루션 (차세대 기판 대응)", 설명: "차세대 Glass Core 기판 TGV 충전 검사 + 대형 기판 워피지/동일평면도 통합 솔루션. ABF 이후 기판 시장 대비", 우선순위: "MEDIUM" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "LONG_TERM", 액션: "CPO 통합 검사 솔루션 (PIC+EIC+Fiber 전수 검사)", 설명: "PIC 도파관 검사 + PIC-EIC 본딩 정렬 + FAU/Fiber 정렬 + 삽입 손실 측정 통합. 데이터센터 CPO End-to-End 검사 라인 구축", 우선순위: "CRITICAL" },
  { 영역: "즉시 대응 (강점 활용)", 시간구분: "SHORT_TERM", 액션: "기존 Meister/Neptune으로 GPU Wafer Bump 검사 PoC 확보", 설명: "ASIC/GPU 웨이퍼 Cu Pillar/RDL 검사 데모 및 고객 PoC. Meister S/Neptune 즉시 투입 가능 영역 선점", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "SHORT_TERM", 액션: "GPU Wafer Bump/RDL 검사 Meister 시리즈 대응 강화", 설명: "Meister 플랫폼 광학 모듈 업그레이드. GPU/ASIC 웨이퍼 RDL CD 측정 + Cu Pillar 3D 전수 검사 대응", 우선순위: "HIGH" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "MID_TERM", 액션: "CoWoS 인터포저 대면적 검사 + TC 본딩 정렬 검증 솔루션", 설명: "대면적(65×79mm) 인터포저 μBump 전수 3D + TC 본딩 정렬 검증. 이미지 스티칭 + Multi-head 병렬 검사", 우선순위: "CRITICAL" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "MID_TERM", 액션: "Hybrid Bonding 표면 계측 기술 확보 (자체 개발 + 제휴)", 설명: "SoIC/V-Cache용 nm급 표면 거칠기 + Cu Dishing 계측. WLI 기반 자체 개발 또는 AFM 기업 기술 제휴", 우선순위: "CRITICAL" },
  { 영역: "점진적 확장 (기술 고도화)", 시간구분: "MID_TERM", 액션: "Thin Wafer 검사/핸들링 통합 모듈 상품화", 설명: "극박 웨이퍼 TTV/워피지 측정 + 비접촉 핸들링 모듈. HBM/CoWoS/SoIC 공통 요소기술로 cross-sell", 우선순위: "HIGH" },
  { 영역: "신규 진입 (M&A/JV)", 시간구분: "LONG_TERM", 액션: "SoIC/V-Cache 전용 검사 통합 솔루션", 설명: "Hybrid Bonding 표면계측 + Die-to-Wafer 정렬 + Post-Bond SAT/IR 통합. 3D 적층 End-to-End 검사 라인 제공", 우선순위: "CRITICAL" },
];

// ===== INSPECTION-EQUIPMENT MAPPING =====
// Maps inspection points to specific equipment models via inspection type matching
const inspEquipTypeMap: Record<string, { 장비제조사: string; 장비모델: string; 적합도: string; 비고: string }[]> = {
  WAFER_INSPECTION: [
    { 장비제조사: "KLA", 장비모델: "ICOS T7", 적합도: "PRIMARY", 비고: "Wafer-level 3D 검사 업계 표준. KLA IR 자료 기반" },
    { 장비제조사: "Camtek", 장비모델: "Phoenix AP", 적합도: "PRIMARY", 비고: "Post-dicing AOI 및 wafer 표면 검사. Camtek 공식 스펙" },
    { 장비제조사: "Koh Young", 장비모델: "Neptune", 적합도: "SECONDARY", 비고: "Meister 플랫폼 확장. Wafer-level 대응 개발 중" },
  ],
  TSV_INSPECTION: [
    { 장비제조사: "KLA", 장비모델: "ICOS T7", 적합도: "SECONDARY", 비고: "TSV 상부 검사 가능. 깊이 측정은 Confocal/IR 별도 필요" },
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "SECONDARY", 비고: "Sub-surface defect 검사 기능 보유 (SEMI 발표 자료)" },
  ],
  THICKNESS_METROLOGY: [
    { 장비제조사: "Onto Innovation", 장비모델: "ChromaSpec", 적합도: "PRIMARY", 비고: "Film 두께 계측 전문. Onto 제품 라인업" },
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "SECONDARY", 비고: "LT-200 dual-head 3D metrology (SEMI 발표)" },
  ],
  SURFACE_INSPECTION: [
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "PRIMARY", 비고: "BF 0.5μm, DF 0.3μm defect sensitivity. 범용 생산형 (Camtek 공식)" },
    { 장비제조사: "Camtek", 장비모델: "HAWK", 적합도: "PRIMARY", 비고: "0.1μm sensitivity, Eagle 대비 2배 TPT (Camtek 공식)" },
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "PRIMARY", 비고: "Sub-μm 2D defect detection, Clearfind 모드 (SEMI 발표)" },
    { 장비제조사: "Camtek", 장비모델: "Condor ILI", 적합도: "SECONDARY", 비고: "인라인 표면 검사 (Camtek 공식)" },
    { 장비제조사: "Koh Young", 장비모델: "Neptune", 적합도: "ALTERNATIVE", 비고: "Wafer 표면 검사 확장 대응. 개발 중" },
  ],
  CD_METROLOGY: [
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "PRIMARY", 비고: "RDL L/S 1.4μm 대응 (Camtek 공식 스펙)" },
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "PRIMARY", 비고: "Sub-μm RDL 검사, BF/DF/Clearfind (SEMI)" },
    { 장비제조사: "Camtek", 장비모델: "HAWK", 적합도: "PRIMARY", 비고: "<1μm L/S 대응, IR Gen2 (Camtek 공식)" },
  ],
  BUMP_INSPECTION: [
    { 장비제조사: "KLA", 장비모델: "ICOS T7", 적합도: "PRIMARY", 비고: "Wafer-level bump 3D 검사 업계 표준 (KLA 공식)" },
    { 장비제조사: "KLA", 장비모델: "ICOS F5", 적합도: "PRIMARY", 비고: "Flip-chip bump 검사 전문 (KLA 공식)" },
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "PRIMARY", 비고: "Bump 2D/3D 검사 겸용 (Camtek 공식)" },
    { 장비제조사: "Camtek", 장비모델: "HAWK", 적합도: "PRIMARY", 비고: "Sub-10μm pitch, 500M bumps/wafer 대응 (Camtek 공식)" },
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "SQ3000+", 적합도: "SECONDARY", 비고: "MRS 센서 기반 3D bump 검사 (Nordson 공식)" },
    { 장비제조사: "Koh Young", 장비모델: "Meister S", 적합도: "SECONDARY", 비고: "Moiré 기반 bump 3D 측정. SMT→반도체 확장 중" },
    { 장비제조사: "Koh Young", 장비모델: "Neptune", 적합도: "ALTERNATIVE", 비고: "Bump 검사 대응 개발 중" },
  ],
  ALIGNMENT_INSPECTION: [
    { 장비제조사: "KLA", 장비모델: "ICOS T7", 적합도: "PRIMARY", 비고: "Die stack alignment 검사 (KLA 공식)" },
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "SECONDARY", 비고: "Overlay 측정 기능 보유" },
    { 장비제조사: "Koh Young", 장비모델: "Meister S", 적합도: "SECONDARY", 비고: "Die attach 정렬 검사 대응" },
  ],
  SAT_INSPECTION: [
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "PRIMARY", 비고: "SAT+X-ray 복합 검사 (Nordson DAGE 공식)" },
    { 장비제조사: "Nordson DAGE", 장비모델: "XD7800", 적합도: "SECONDARY", 비고: "X-ray/CT + SAT 겸용 (Nordson DAGE 공식)" },
  ],
  BALL_ATTACH_INSPECTION: [
    { 장비제조사: "KLA", 장비모델: "ICOS F5", 적합도: "PRIMARY", 비고: "BGA ball attach 3D 검사 (KLA 공식)" },
    { 장비제조사: "Koh Young", 장비모델: "Meister D", 적합도: "PRIMARY", 비고: "Ball attach 검사 대응 (고영 공식)" },
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "SQ3000+", 적합도: "SECONDARY", 비고: "MRS 기반 ball 3D 검사" },
  ],
  MARKING_INSPECTION: [
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "SECONDARY", 비고: "마킹 검사 부가 기능" },
    { 장비제조사: "Koh Young", 장비모델: "Zenith Alpha", 적합도: "SECONDARY", 비고: "AOI 마킹/OCR 검사 기능" },
  ],
  SPI: [
    { 장비제조사: "Koh Young", 장비모델: "KY8030-3", 적합도: "PRIMARY", 비고: "3D SPI 시장 점유율 1위. Moiré 기반 (고영 공식)" },
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "SQ3000+", 적합도: "PRIMARY", 비고: "MRS 기반 SPI (Nordson 공식)" },
    { 장비제조사: "Mirtec", 장비모델: "MI-15", 적합도: "SECONDARY", 비고: "SPI 검사 대응 (Mirtec 공식)" },
    { 장비제조사: "Viscom", 장비모델: "S3088 SPI", 적합도: "SECONDARY", 비고: "SPI 검사 (Viscom 공식)" },
  ],
  PRE_REFLOW_AOI: [
    { 장비제조사: "Koh Young", 장비모델: "Zenith Alpha", 적합도: "PRIMARY", 비고: "3D AOI Pre-reflow 검사 (고영 공식)" },
    { 장비제조사: "Mirtec", 장비모델: "MV-6 OMNI", 적합도: "PRIMARY", 비고: "Pre-reflow AOI (Mirtec 공식)" },
  ],
  POST_REFLOW_AOI: [
    { 장비제조사: "Koh Young", 장비모델: "Zenith 2", 적합도: "PRIMARY", 비고: "Shadow-free 3D AOI. 시장 선두 (고영 공식)" },
    { 장비제조사: "Koh Young", 장비모델: "Zenith Alpha", 적합도: "PRIMARY", 비고: "Advanced 3D AOI (고영 공식)" },
    { 장비제조사: "Mirtec", 장비모델: "MV-6 OMNI", 적합도: "SECONDARY", 비고: "Post-reflow AOI (Mirtec 공식)" },
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "SQ3000+", 적합도: "SECONDARY", 비고: "CMM-level AOI (Nordson 공식)" },
    { 장비제조사: "Viscom", 장비모델: "X7056-II", 적합도: "SECONDARY", 비고: "X-ray+AOI 복합 (Viscom 공식)" },
  ],
  UNDERFILL_INSPECTION: [
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "PRIMARY", 비고: "Underfill void SAT 검사" },
    { 장비제조사: "Koh Young", 장비모델: "Zenith 2", 적합도: "SECONDARY", 비고: "Underfill 외관 검사 가능" },
  ],
  XRAY_2D: [
    { 장비제조사: "Nordson DAGE", 장비모델: "XD7800", 적합도: "PRIMARY", 비고: "<1μm focal spot X-ray (Nordson DAGE 공식)" },
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "PRIMARY", 비고: "SAT+X-ray 복합 (Nordson DAGE 공식)" },
    { 장비제조사: "Viscom", 장비모델: "X7056-II", 적합도: "SECONDARY", 비고: "X-ray AOI (Viscom 공식)" },
  ],
  XRAY_3D: [
    { 장비제조사: "Nordson DAGE", 장비모델: "XD7800", 적합도: "PRIMARY", 비고: "CT 기능 포함 (Nordson DAGE 공식)" },
    { 장비제조사: "YXLON (Comet)", 장비모델: "Cheetah EVO", 적합도: "PRIMARY", 비고: "인라인 X-ray CT (YXLON 공식)" },
    { 장비제조사: "Nikon", 장비모델: "XT V 160", 적합도: "SECONDARY", 비고: "고분해능 CT. Offline (Nikon 공식)" },
  ],
  WARPAGE_MEASUREMENT: [
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "WX3000", 적합도: "PRIMARY", 비고: "Shadow Moiré warpage 측정 (Nordson 공식)" },
  ],
  DIE_ATTACH_INSPECTION: [
    { 장비제조사: "Koh Young", 장비모델: "Meister D", 적합도: "PRIMARY", 비고: "Die attach 검사 전문 (고영 공식)" },
    { 장비제조사: "Koh Young", 장비모델: "Meister S", 적합도: "SECONDARY", 비고: "Die placement 정밀 검사" },
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "SECONDARY", 비고: "Die attach AOI 기능" },
  ],
  WIRE_BOND_INSPECTION: [
    { 장비제조사: "Koh Young", 장비모델: "Meister D", 적합도: "PRIMARY", 비고: "Wire loop height 3D 검사 (고영 공식)" },
    { 장비제조사: "Nordson DAGE", 장비모델: "XD7800", 적합도: "SECONDARY", 비고: "Wire bond X-ray 검사" },
  ],
  FLATNESS_MEASUREMENT: [
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "WX3000", 적합도: "PRIMARY", 비고: "Flatness/warpage 측정 (Nordson 공식)" },
    { 장비제조사: "Onto Innovation", 장비모델: "ChromaSpec", 적합도: "SECONDARY", 비고: "Film/flatness 측정" },
  ],
  OVERLAY_METROLOGY: [
    { 장비제조사: "Camtek", 장비모델: "Eagle G5", 적합도: "PRIMARY", 비고: "Overlay 측정 기능" },
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "PRIMARY", 비고: "Overlay metrology (SEMI 발표)" },
  ],
  OPTICAL_ALIGNMENT: [
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "SECONDARY", 비고: "Sub-μm alignment 측정. CPO 대응 제한적" },
  ],
  WAVEGUIDE_INSPECTION: [
    { 장비제조사: "Onto Innovation", 장비모델: "Dragonfly G3", 적합도: "SECONDARY", 비고: "Clearfind 모드 응용 가능성. CPO 전용 장비는 시장 미성숙" },
  ],
  TIM_INSPECTION: [
    { 장비제조사: "Koh Young", 장비모델: "KY8030-3", 적합도: "PRIMARY", 비고: "SPI 기술 응용 TIM 도포 검사 (WLP 기획서 근거)" },
    { 장비제조사: "CyberOptics (Nordson)", 장비모델: "SQ3000+", 적합도: "SECONDARY", 비고: "MRS 기반 TIM 도포 검사 가능" },
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "SECONDARY", 비고: "TIM void SAT 검사" },
  ],
  THERMAL_INSPECTION: [
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "PRIMARY", 비고: "SAT 열 인터페이스 검사" },
  ],
  POROSITY_ANALYSIS: [
    { 장비제조사: "Nordson DAGE", 장비모델: "XD7800", 적합도: "PRIMARY", 비고: "X-ray CT 기반 porosity 분석" },
    { 장비제조사: "Nordson DAGE", 장비모델: "Quadra 7", 적합도: "SECONDARY", 비고: "SAT 기반 void 분석" },
  ],
};

const inspectionEquipmentMapping: { 제품명: string; 검사포인트: string; 장비제조사: string; 장비모델: string; 적합도: string; 비고: string }[] = [];
for (const ip of inspectionPointsWithSpecs) {
  const types = ip.검사유형.split(",").map((s: string) => s.trim());
  for (const t of types) {
    const equips = inspEquipTypeMap[t] ?? [];
    for (const eq of equips) {
      inspectionEquipmentMapping.push({ 제품명: ip.제품명, 검사포인트: ip.검사포인트, ...eq });
    }
  }
}

// ===== EQUIPMENT-TECHNOLOGY MAPPING =====
const equipmentTechMapping = [
  // KLA
  { 장비모델: "ICOS T7", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "Telecentric Optics Design", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "Sub-pixel Edge Detection", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "Deep Learning Defect Classification", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "Sub-μm Precision Motion Stage", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS T7", 기술명: "High-NA Objective Lens", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS F5", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS F5", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS F5", 기술명: "Telecentric Optics Design", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ICOS F5", 기술명: "Sub-pixel Edge Detection", 활용수준: "SUPPORTING", 비고: "" },
  // Camtek
  { 장비모델: "Eagle G5", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "BF 0.5μm, DF 0.3μm (공식 스펙)" },
  { 장비모델: "Eagle G5", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "BF/DF + CLIP 조명" },
  { 장비모델: "Eagle G5", 기술명: "Sub-pixel Edge Detection", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Eagle G5", 기술명: "Deep Learning Defect Classification", 활용수준: "SUPPORTING", 비고: "Feature classification" },
  { 장비모델: "Eagle G5", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Eagle G5", 기술명: "Large-area Stitching Inspection", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "HAWK", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "0.1μm sensitivity" },
  { 장비모델: "HAWK", 기술명: "IR Transmission Imaging", 활용수준: "CORE", 비고: "IR Gen2" },
  { 장비모델: "HAWK", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "BF/DF + IR Gen2" },
  { 장비모델: "HAWK", 기술명: "Deep Learning Defect Classification", 활용수준: "CORE", 비고: "Real-time ML (공식)" },
  { 장비모델: "HAWK", 기술명: "High-NA Objective Lens", 활용수준: "CORE", 비고: "Sub-10μm pitch 대응" },
  { 장비모델: "HAWK", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Phoenix AP", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Phoenix AP", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Condor ILI", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Condor ILI", 기술명: "Sub-pixel Edge Detection", 활용수준: "SUPPORTING", 비고: "" },
  // Onto Innovation
  { 장비모델: "Dragonfly G3", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "Sub-μm 2D defect (SEMI)" },
  { 장비모델: "Dragonfly G3", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "BF/DF/Clearfind" },
  { 장비모델: "Dragonfly G3", 기술명: "White Light Interferometry (WLI)", 활용수준: "SUPPORTING", 비고: "3Di 기능" },
  { 장비모델: "Dragonfly G3", 기술명: "Sub-pixel Edge Detection", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Dragonfly G3", 기술명: "Deep Learning Defect Classification", 활용수준: "CORE", 비고: "ADC/analytics (공식)" },
  { 장비모델: "Dragonfly G3", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Firefly G3", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "TDI + multi-spectrum" },
  { 장비모델: "Firefly G3", 기술명: "Panel-level Handling (600×600mm+)", 활용수준: "CORE", 비고: "Panel 특화" },
  { 장비모델: "Firefly G3", 기술명: "Large-area Stitching Inspection", 활용수준: "CORE", 비고: "" },
  { 장비모델: "ChromaSpec", 기술명: "White Light Interferometry (WLI)", 활용수준: "CORE", 비고: "Film 두께 측정 전문" },
  { 장비모델: "ChromaSpec", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "" },
  // CyberOptics (Nordson)
  { 장비모델: "SQ3000+", 기술명: "Moiré Interferometry", 활용수준: "SUPPORTING", 비고: "MRS(Multi-Reflection Suppression) 센서" },
  { 장비모델: "SQ3000+", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "SQ3000+", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "WX3000", 기술명: "Moiré Interferometry", 활용수준: "CORE", 비고: "Shadow Moiré 기반" },
  { 장비모델: "WX3000", 기술명: "Wafer Warpage Measurement", 활용수준: "CORE", 비고: "" },
  // Koh Young
  { 장비모델: "KY8030-3", 기술명: "Moiré Interferometry", 활용수준: "CORE", 비고: "핵심 기술" },
  { 장비모델: "KY8030-3", 기술명: "Phase-Shifting Profilometry (PSP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "KY8030-3", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "KY8030-3", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "CORE", 비고: "" },
  { 장비모델: "KY8030-3", 기술명: "Telecentric Optics Design", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Zenith 2", 기술명: "Moiré Interferometry", 활용수준: "CORE", 비고: "Shadow-free 3D" },
  { 장비모델: "Zenith 2", 기술명: "Phase-Shifting Profilometry (PSP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Zenith 2", 기술명: "Deep Learning Defect Classification", 활용수준: "CORE", 비고: "AI 불량 분류" },
  { 장비모델: "Zenith 2", 기술명: "Multi-wavelength Illumination", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Zenith Alpha", 기술명: "Moiré Interferometry", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Zenith Alpha", 기술명: "Phase-Shifting Profilometry (PSP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Zenith Alpha", 기술명: "Deep Learning Defect Classification", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Zenith Alpha", 기술명: "Multi-head Parallel Inspection", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Meister S", 기술명: "Phase-Shifting Profilometry (PSP)", 활용수준: "CORE", 비고: "Bump coplanarity" },
  { 장비모델: "Meister S", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Meister S", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Meister S", 기술명: "Sub-pixel Edge Detection", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Meister D", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "Wire loop height" },
  { 장비모델: "Meister D", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Neptune", 기술명: "High-resolution Imaging (>25MP)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Neptune", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Neptune", 기술명: "GPU-accelerated Real-time Processing", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Neptune", 기술명: "Sub-μm Precision Motion Stage", 활용수준: "SUPPORTING", 비고: "" },
  // Mirtec
  { 장비모델: "MV-6 OMNI", 기술명: "Multi-wavelength Illumination", 활용수준: "CORE", 비고: "" },
  { 장비모델: "MV-6 OMNI", 기술명: "Deep Learning Defect Classification", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "MI-15", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  // Viscom
  { 장비모델: "X7056-II", 기술명: "Micro-focus X-ray Source", 활용수준: "CORE", 비고: "" },
  { 장비모델: "X7056-II", 기술명: "CT Reconstruction Algorithm", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "S3088 SPI", 기술명: "3D Point Cloud Reconstruction", 활용수준: "CORE", 비고: "" },
  // Nordson DAGE
  { 장비모델: "XD7800", 기술명: "Micro-focus X-ray Source", 활용수준: "CORE", 비고: "<1μm focal spot" },
  { 장비모델: "XD7800", 기술명: "CT Reconstruction Algorithm", 활용수준: "CORE", 비고: "CT 기능 포함" },
  { 장비모델: "XD7800", 기술명: "Scanning Acoustic Tomography (SAT)", 활용수준: "SUPPORTING", 비고: "" },
  { 장비모델: "Quadra 7", 기술명: "Scanning Acoustic Tomography (SAT)", 활용수준: "CORE", 비고: "" },
  { 장비모델: "Quadra 7", 기술명: "Micro-focus X-ray Source", 활용수준: "SUPPORTING", 비고: "" },
  // YXLON
  { 장비모델: "Cheetah EVO", 기술명: "Micro-focus X-ray Source", 활용수준: "CORE", 비고: "인라인 대응" },
  { 장비모델: "Cheetah EVO", 기술명: "CT Reconstruction Algorithm", 활용수준: "CORE", 비고: "" },
  // Nikon
  { 장비모델: "XT V 160", 기술명: "Micro-focus X-ray Source", 활용수준: "CORE", 비고: "고분해능" },
  { 장비모델: "XT V 160", 기술명: "CT Reconstruction Algorithm", 활용수준: "CORE", 비고: "Sub-μm CT" },
];

// ===== EQUIPMENT PRICING =====
// 가격 출처: WLP 기획서(KY 내부 분석), SEMI Market Reports, 업계 공개 IR, 업계 견적 추정
// 모든 가격은 추정치이며, 구성/사양에 따라 실제 가격은 크게 다를 수 있음
const equipmentPricing = [
  { 장비모델: "ICOS T7", 시장가격USD: 2500000, 가격범위하한USD: 2000000, 가격범위상한USD: 3500000, KY목표가격USD: 1800000, KY목표근거: "Meister 플랫폼 확장 + Moiré 3D 기반으로 광학계 비용 절감. Stage 외주 + 3D optical 자체 개발", 가격출처: "SEMI Market Report 추정, KLA IR 참고", 추정여부: true },
  { 장비모델: "ICOS F5", 시장가격USD: 1800000, 가격범위하한USD: 1500000, 가격범위상한USD: 2500000, KY목표가격USD: 1200000, KY목표근거: "Meister D 확장. Ball attach 3D 검사에 특화된 광학계로 원가 절감", 가격출처: "KLA IR 참고, 업계 견적 추정", 추정여부: true },
  { 장비모델: "Eagle G5", 시장가격USD: 1000000, 가격범위하한USD: 780000, 가격범위상한USD: 1500000, KY목표가격USD: 920000, KY목표근거: "WLP 기획서 기준 Standard 12억원(≈$920K). 2D/3D 통합 + AI 분석으로 Eagle 대체 포지셔닝", 가격출처: "WLP 기획서 v2(Camtek 300mm 장비 7.8~19억원), SEMI 추정", 추정여부: true },
  { 장비모델: "HAWK", 시장가격USD: 2000000, 가격범위하한USD: 1500000, 가격범위상한USD: 2500000, KY목표가격USD: 0, KY목표근거: "HAWK 급 ultra-high-end는 직접 경쟁 회피. WLP 기획서 전략: Eagle 대체 우선", 가격출처: "WLP 기획서 분석(Eagle 대비 2배급 추정), 업계 추정", 추정여부: true },
  { 장비모델: "Phoenix AP", 시장가격USD: 700000, 가격범위하한USD: 500000, 가격범위상한USD: 900000, KY목표가격USD: 540000, KY목표근거: "WLP 기획서 Lite 7억원(≈$540K). Post-dicing AOI 영역", 가격출처: "Camtek IR 참고, 업계 추정", 추정여부: true },
  { 장비모델: "Condor ILI", 시장가격USD: 600000, 가격범위하한USD: 400000, 가격범위상한USD: 800000, KY목표가격USD: 540000, KY목표근거: "인라인 검사 Lite 모델로 대응", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "Dragonfly G3", 시장가격USD: 1500000, 가격범위하한USD: 1200000, 가격범위상한USD: 2000000, KY목표가격USD: 920000, KY목표근거: "WLP 기획서: Dragonfly 일부 application 대체. Standard 12억원으로 정밀 계측 일부 커버", 가격출처: "WLP 기획서 분석, SEMI 추정", 추정여부: true },
  { 장비모델: "Firefly G3", 시장가격USD: 1200000, 가격범위하한USD: 800000, 가격범위상한USD: 1500000, KY목표가격USD: 920000, KY목표근거: "Panel-level 검사 대응. 300mm+panel 공용 플랫폼", 가격출처: "Onto IR 참고, 업계 추정", 추정여부: true },
  { 장비모델: "ChromaSpec", 시장가격USD: 800000, 가격범위하한USD: 600000, 가격범위상한USD: 1000000, KY목표가격USD: 0, KY목표근거: "Film thickness metrology는 KY 핵심 영역 외. 직접 경쟁 비대상", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "SQ3000+", 시장가격USD: 350000, 가격범위하한USD: 250000, 가격범위상한USD: 500000, KY목표가격USD: 300000, KY목표근거: "KY8030/Zenith와 직접 경쟁 중인 SMT-level 장비. 가격 경쟁력 확보 필요", 가격출처: "Nordson IR, 업계 견적 추정", 추정여부: true },
  { 장비모델: "WX3000", 시장가격USD: 400000, 가격범위하한USD: 300000, 가격범위상한USD: 600000, KY목표가격USD: 350000, KY목표근거: "Moiré 기반 warpage 측정은 KY 핵심 기술. Koh Young Moiré 활용 원가 절감", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "KY8030-3", 시장가격USD: 300000, 가격범위하한USD: 200000, 가격범위상한USD: 400000, KY목표가격USD: 300000, KY목표근거: "자사 제품. 시장 판가 기준", 가격출처: "고영 공식 가격 범위", 추정여부: false },
  { 장비모델: "Zenith 2", 시장가격USD: 250000, 가격범위하한USD: 180000, 가격범위상한USD: 350000, KY목표가격USD: 250000, KY목표근거: "자사 제품. 시장 판가 기준", 가격출처: "고영 공식 가격 범위", 추정여부: false },
  { 장비모델: "Zenith Alpha", 시장가격USD: 280000, 가격범위하한USD: 200000, 가격범위상한USD: 380000, KY목표가격USD: 280000, KY목표근거: "자사 제품. 시장 판가 기준", 가격출처: "고영 공식 가격 범위", 추정여부: false },
  { 장비모델: "Meister S", 시장가격USD: 600000, 가격범위하한USD: 400000, 가격범위상한USD: 800000, KY목표가격USD: 600000, KY목표근거: "자사 제품. 반도체 패키징 검사 시장 판가 기준", 가격출처: "고영 공식 가격 범위", 추정여부: false },
  { 장비모델: "Meister D", 시장가격USD: 500000, 가격범위하한USD: 350000, 가격범위상한USD: 700000, KY목표가격USD: 500000, KY목표근거: "자사 제품. Die-level 검사 시장 판가 기준", 가격출처: "고영 공식 가격 범위", 추정여부: false },
  { 장비모델: "Neptune", 시장가격USD: 900000, 가격범위하한USD: 700000, 가격범위상한USD: 1200000, KY목표가격USD: 920000, KY목표근거: "WLP 기획서 Standard ASP 12억원(≈$920K). 차세대 wafer-level 검사기", 가격출처: "WLP 기획서 v2", 추정여부: true },
  { 장비모델: "MV-6 OMNI", 시장가격USD: 180000, 가격범위하한USD: 130000, 가격범위상한USD: 250000, KY목표가격USD: 250000, KY목표근거: "Zenith 시리즈로 대응. 가격보다 성능 차별화", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "MI-15", 시장가격USD: 200000, 가격범위하한USD: 150000, 가격범위상한USD: 280000, KY목표가격USD: 300000, KY목표근거: "KY8030으로 대응. 3D SPI 기술 우위로 프리미엄 전략", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "X7056-II", 시장가격USD: 500000, 가격범위하한USD: 350000, 가격범위상한USD: 700000, KY목표가격USD: 0, KY목표근거: "X-ray 영역은 M&A/JV 전략. 자체 개발 비대상", 가격출처: "Viscom IR 참고, 업계 추정", 추정여부: true },
  { 장비모델: "S3088 SPI", 시장가격USD: 200000, 가격범위하한USD: 150000, 가격범위상한USD: 300000, KY목표가격USD: 300000, KY목표근거: "KY8030으로 대응. 시장 1위 기술로 프리미엄", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "XD7800", 시장가격USD: 1200000, 가격범위하한USD: 800000, 가격범위상한USD: 1500000, KY목표가격USD: 0, KY목표근거: "X-ray/SAT 영역. M&A/JV 전략 대상. 자체 경쟁 장비 없음", 가격출처: "Nordson IR, 업계 추정", 추정여부: true },
  { 장비모델: "Quadra 7", 시장가격USD: 800000, 가격범위하한USD: 600000, 가격범위상한USD: 1200000, KY목표가격USD: 0, KY목표근거: "SAT 영역. M&A/JV 전략 대상", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "Cheetah EVO", 시장가격USD: 1000000, 가격범위하한USD: 700000, 가격범위상한USD: 1300000, KY목표가격USD: 0, KY목표근거: "인라인 X-ray CT. M&A/JV 전략 대상", 가격출처: "업계 추정", 추정여부: true },
  { 장비모델: "XT V 160", 시장가격USD: 1500000, 가격범위하한USD: 1000000, 가격범위상한USD: 2000000, KY목표가격USD: 0, KY목표근거: "고분해능 CT. Offline 분석용. KY 경쟁 대상 외", 가격출처: "Nikon IR 참고, 업계 추정", 추정여부: true },
];

// ===== KY PROPOSAL SPECS =====
// 기존 검사포인트 스펙 + KY역량분석 + WLP기획서 데이터를 결합하여 생성
type ProposalRow = { 제품명: string; 공정단계: string; 검사포인트: string; 스펙항목: string; 시장요구스펙: string; KY현재스펙: string; KY목표스펙: string; 달성전략: string; 달성시기: string; 근거: string };
const kyProposalSpecs: ProposalRow[] = [];

const kySpecMap: Record<string, { current: string; target: string; strategy: string; timeline: string; source: string }> = {
  "해상도:BUMP_INSPECTION": { current: "~2μm (Meister S 기준)", target: "≤1μm (wafer-level)", strategy: "고NA 광학계 개발 + PSP 기반 3D 측정 고도화", timeline: "12-18개월", source: "WLP 기획서: 0.5~1.0μm/pixel 목표. KY역량분석 High-NA 갭" },
  "정밀도:BUMP_INSPECTION": { current: "±1μm (Meister S)", target: "±0.5μm", strategy: "Phase-Shifting 알고리즘 고도화 + 능동 제진", timeline: "12-18개월", source: "WLP 기획서: ±1μm repeatability 목표. KY역량분석 Active Vibration 갭" },
  "속도:BUMP_INSPECTION": { current: "~20 UPH", target: "≥40 UPH (wafer)", strategy: "GPU 가속 + Multi-head 병렬 검사 + Selective 3D", timeline: "12-24개월", source: "WLP 기획서: 40~60 WPH 목표. 생산성 확보 핵심" },
  "해상도:SURFACE_INSPECTION": { current: "~5μm (Zenith 기준)", target: "0.3~0.5μm", strategy: "고해상도 카메라 + BF/DF multi-angle 조명 시스템 개발", timeline: "12-18개월", source: "WLP 기획서: 0.3~0.5μm defect sensitivity 목표" },
  "정밀도:SURFACE_INSPECTION": { current: "~2μm", target: "≤0.5μm", strategy: "Sub-pixel edge detection 고도화 + 텔레센트릭 광학 확장", timeline: "12-18개월", source: "WLP 기획서: Sub-μm 2D defect 검출 목표" },
  "속도:SURFACE_INSPECTION": { current: "~30 UPH", target: "40~60 WPH", strategy: "TDI line scan 또는 고속 area scan + turret lens", timeline: "12-24개월", source: "WLP 기획서: 고속 2D/3D 통합 검사 플랫폼" },
  "해상도:CD_METROLOGY": { current: "~5μm", target: "≤1.5μm L/S", strategy: "고해상도 광학 + CSI-like layer separation 개발", timeline: "12-18개월", source: "WLP 기획서: 1.5/1.5μm RDL 단계 목표, 장기 1/1μm" },
  "정밀도:CD_METROLOGY": { current: "~3μm", target: "≤1μm", strategy: "CAD 기반 검사 + AI false call filtering", timeline: "12-24개월", source: "WLP 기획서: CAD overlay error ≤1 pixel 목표" },
  "해상도:SPI": { current: "≤15μm (KY8030)", target: "≤15μm", strategy: "현 수준 유지. Moiré 기반 3D SPI 시장 1위", timeline: "유지", source: "시장 1위 기술. 현 수준 충분" },
  "정밀도:SPI": { current: "3σ ≤0.5μm", target: "3σ ≤0.5μm", strategy: "현 수준 유지 및 TIM 검사 레시피 확장", timeline: "유지", source: "SPI 시장 1위 유지" },
  "속도:SPI": { current: "≥60 panel/hr", target: "≥60 panel/hr", strategy: "현 수준 유지", timeline: "유지", source: "생산성 충분" },
  "해상도:POST_REFLOW_AOI": { current: "≤10μm (Zenith)", target: "≤5μm", strategy: "고해상도 카메라 업그레이드 + 다파장 조명 확장", timeline: "6-12개월", source: "반도체 패키지 대응 해상도 향상" },
  "정밀도:POST_REFLOW_AOI": { current: "3σ ≤1μm", target: "3σ ≤0.5μm", strategy: "Shadow-free 3D 알고리즘 고도화", timeline: "6-12개월", source: "Zenith 플랫폼 고도화" },
  "해상도:ALIGNMENT_INSPECTION": { current: "~2μm", target: "≤0.5μm", strategy: "고NA 광학 + Sub-pixel alignment 알고리즘", timeline: "12-24개월", source: "Die stacking ±0.5μm 정렬 요구" },
  "정밀도:ALIGNMENT_INSPECTION": { current: "±1μm", target: "±0.2μm", strategy: "정밀 Stage + 알고리즘 보강", timeline: "18-24개월", source: "KY역량분석: Sub-μm Stage 갭 MEDIUM" },
  "해상도:XRAY_2D": { current: "미보유", target: "M&A/JV 통해 확보", strategy: "X-ray 기술 기업 인수 또는 합작법인. 자체 개발 비현실적", timeline: "6-12개월(M&A)", source: "KY역량분석: X-ray 갭 LARGE. WLP 기획서: 장기 optical+X-ray 연계" },
  "해상도:SAT_INSPECTION": { current: "미보유", target: "M&A/JV 통해 확보", strategy: "SAT 전문 기업 협력 또는 인수", timeline: "6-12개월(M&A)", source: "KY역량분석: SAT 갭 LARGE" },
  "해상도:TSV_INSPECTION": { current: "미보유", target: "Confocal/IR 모듈 개발", strategy: "신규 Confocal 광학 모듈 개발. IR 센서 내재화", timeline: "24-36개월", source: "KY역량분석: Confocal 갭 LARGE, IR 갭 LARGE" },
  "해상도:WARPAGE_MEASUREMENT": { current: "기초 보유 (Moiré)", target: "전면 고속 측정", strategy: "Shadow Moiré 기반 전면 warpage 모듈 개발", timeline: "12-18개월", source: "KY역량분석: Warpage 갭 MEDIUM. Moiré 핵심 기술 활용" },
  "해상도:THICKNESS_METROLOGY": { current: "미보유(WLI 기초)", target: "nm급 film 계측", strategy: "WLI 광학계 정밀도 향상", timeline: "12-18개월", source: "KY역량분석: WLI 갭 MEDIUM" },
  "해상도:DIE_ATTACH_INSPECTION": { current: "~5μm (Meister D)", target: "≤2μm", strategy: "Meister D 광학계 업그레이드", timeline: "6-12개월", source: "기존 Meister 플랫폼 확장" },
  "해상도:WIRE_BOND_INSPECTION": { current: "~5μm (Meister D)", target: "≤2μm", strategy: "Wire loop 3D 고도화", timeline: "6-12개월", source: "기존 Meister 플랫폼" },
  "해상도:TIM_INSPECTION": { current: "≤15μm (SPI 응용)", target: "≤15μm", strategy: "KY SPI 엔진 TIM 응용 레시피 개발", timeline: "3-6개월", source: "WLP 기획서: SPI 기술 응용 조기 상용화" },
  "해상도:BALL_ATTACH_INSPECTION": { current: "~10μm (Meister D)", target: "≤5μm", strategy: "Meister D 광학 모듈 고도화", timeline: "6-12개월", source: "기존 Meister 플랫폼" },
};

for (const ip of inspectionPointsWithSpecs) {
  const specEntries: { item: string; req: string | null }[] = [
    { item: "해상도", req: ip.해상도요구 },
    { item: "정밀도", req: ip.정밀도요구 },
    { item: "속도", req: ip.속도요구 },
  ];
  for (const { item, req } of specEntries) {
    if (!req) continue;
    const key = `${item}:${ip.검사유형}`;
    const ky = kySpecMap[key];
    if (ky) {
      kyProposalSpecs.push({
        제품명: ip.제품명,
        공정단계: ip.공정단계,
        검사포인트: ip.검사포인트,
        스펙항목: item,
        시장요구스펙: req,
        KY현재스펙: ky.current,
        KY목표스펙: ky.target,
        달성전략: ky.strategy,
        달성시기: ky.timeline,
        근거: ky.source,
      });
    }
  }
}

// ===== BUILD WORKBOOK =====
function autoWidth(data: object[]): XLSX.ColInfo[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String((row as Record<string, unknown>)[key] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 60) };
  });
}

function createSheet(data: object[]): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = autoWidth(data);
  return ws;
}

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, createSheet(products), "제품");
XLSX.utils.book_append_sheet(wb, createSheet(processSteps), "공정단계");
XLSX.utils.book_append_sheet(wb, createSheet(inspectionPointsWithSpecs), "검사포인트");
XLSX.utils.book_append_sheet(wb, createSheet(equipmentMakers), "장비제조사");
XLSX.utils.book_append_sheet(wb, createSheet(equipmentModels), "장비모델");
XLSX.utils.book_append_sheet(wb, createSheet(technologies), "기술스택");
XLSX.utils.book_append_sheet(wb, createSheet(kyProducts), "KY제품");
XLSX.utils.book_append_sheet(wb, createSheet(kyCapabilities), "KY역량분석");
XLSX.utils.book_append_sheet(wb, createSheet(devProjects), "개발로드맵");
XLSX.utils.book_append_sheet(wb, createSheet(strategicActions), "전략액션");
XLSX.utils.book_append_sheet(wb, createSheet(techRelations), "기술상관관계");
XLSX.utils.book_append_sheet(wb, createSheet(techSpecs), "기술스펙");
XLSX.utils.book_append_sheet(wb, createSheet(inspectionEquipmentMapping), "검사장비매핑");
XLSX.utils.book_append_sheet(wb, createSheet(equipmentTechMapping), "장비기술매핑");
XLSX.utils.book_append_sheet(wb, createSheet(equipmentPricing), "장비가격");
XLSX.utils.book_append_sheet(wb, createSheet(kyProposalSpecs), "KY제안스펙");

XLSX.writeFile(wb, OUTPUT_PATH);
process.stdout.write(`XLSX generated: ${OUTPUT_PATH}\n`);
