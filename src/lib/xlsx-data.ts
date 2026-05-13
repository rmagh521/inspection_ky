import * as XLSX from "xlsx";
import { inspectionTypeLabel } from "./utils";
import type {
  Product,
  ProcessStep,
  InspectionPoint,
  EquipmentMaker,
  EquipmentModel,
  InspectionEquipmentMap,
  EquipmentTechMap,
  EquipmentPricing,
  KYProposalSpec,
  Technology,
  TechRelation,
  TechSpec,
  KYProduct,
  KYCapability,
  DevelopmentProject,
  StrategicAction,
  DashboardStats,
  ProductDetail,
} from "@/types/data";

let cachedWorkbook: XLSX.WorkBook | null = null;
let cachedMtime: number = 0;

async function loadWorkbook(): Promise<XLSX.WorkBook> {
  const fs = require("node:fs") as typeof import("fs");
  const path = require("node:path") as typeof import("path");
  const xlsxPath = path.join(process.cwd(), "data", "inspection-data.xlsx");
  const stat = fs.statSync(xlsxPath);
  if (cachedWorkbook && cachedMtime === stat.mtimeMs) {
    return cachedWorkbook;
  }
  cachedMtime = stat.mtimeMs;
  const buf = fs.readFileSync(xlsxPath);
  cachedWorkbook = XLSX.read(buf, { type: "buffer" });
  return cachedWorkbook;
}

async function readSheet<T>(sheetName: string): Promise<T[]> {
  const wb = await loadWorkbook();
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<T>(ws);
}

// ===== PRODUCTS =====

interface RawProduct {
  제품명: string;
  제품군: string;
  세대: string;
  설명: string;
  활성: boolean;
  정렬순서: number;
}

export async function getProducts(): Promise<Product[]> {
  const rows = await readSheet<RawProduct>("제품");
  return rows
    .sort((a, b) => a.정렬순서 - b.정렬순서)
    .map((r) => ({
      name: r.제품명,
      family: r.제품군,
      generation: r.세대 || null,
      description: r.설명,
      isActive: r.활성 !== false,
      sortOrder: r.정렬순서,
    }));
}

// ===== PROCESS STEPS =====

interface RawStep {
  제품명: string;
  단계순서: number;
  단계명: string;
  설명: string;
  검사필요: boolean;
}

export async function getProcessSteps(productName?: string): Promise<ProcessStep[]> {
  const rows = await readSheet<RawStep>("공정단계");
  const filtered = productName
    ? rows.filter((r) => r.제품명 === productName)
    : rows;
  return filtered
    .sort((a, b) => a.제품명.localeCompare(b.제품명) || a.단계순서 - b.단계순서)
    .map((r) => ({
      productName: r.제품명,
      stepOrder: r.단계순서,
      name: r.단계명,
      description: r.설명,
      requiresInspection: r.검사필요 !== false,
    }));
}

// ===== INSPECTION POINTS =====

interface RawInspPoint {
  제품명: string;
  공정단계: string;
  검사포인트: string;
  목적: string;
  검사유형: string;
  난이도: number;
  불량영향: string;
  중요도메모: string;
  해상도요구: string;
  정밀도요구: string;
  속도요구: string;
  FOV요구: string;
  핵심장비유형: string;
}

function difficultyStr(level: number): string {
  return `LEVEL_${level}`;
}

export async function getInspectionPoints(productName?: string): Promise<InspectionPoint[]> {
  const rows = await readSheet<RawInspPoint>("검사포인트");
  const steps = await getProcessSteps();
  const stepOrderMap: Record<string, number> = {};
  for (const s of steps) {
    stepOrderMap[`${s.productName}::${s.name}`] = s.stepOrder;
  }

  const filtered = productName
    ? rows.filter((r) => r.제품명 === productName)
    : rows;

  return filtered.map((r) => ({
    productName: r.제품명,
    processStepName: r.공정단계,
    processStepOrder: stepOrderMap[`${r.제품명}::${r.공정단계}`] ?? 0,
    name: r.검사포인트,
    purpose: r.목적 || null,
    inspectionType: r.검사유형,
    difficulty: difficultyStr(r.난이도),
    failureImpact: r.불량영향,
    criticalityNote: r.중요도메모 || null,
    resolutionSpec: r.해상도요구 || null,
    precisionSpec: r.정밀도요구 || null,
    speedSpec: r.속도요구 || null,
    fovSpec: r.FOV요구 || null,
    keyEquipmentType: r.핵심장비유형 || null,
  }));
}

// ===== EQUIPMENT =====

interface RawMaker {
  제조사명: string;
  국가: string;
  웹사이트: string;
  설명: string;
}

interface RawModel {
  제조사명: string;
  모델명: string;
  시리즈: string;
  주요사양: string;
  검사유형: string;
}

export async function getEquipmentMakers(): Promise<EquipmentMaker[]> {
  const makers = await readSheet<RawMaker>("장비제조사");
  const models = await getEquipmentModels();
  return makers
    .sort((a, b) => a.제조사명.localeCompare(b.제조사명))
    .map((m) => ({
      name: m.제조사명,
      country: m.국가,
      website: m.웹사이트,
      description: m.설명,
      models: models.filter((mod) => mod.makerName === m.제조사명),
    }));
}

export async function getEquipmentModels(): Promise<EquipmentModel[]> {
  const rows = await readSheet<RawModel>("장비모델");
  const pricing = await getEquipmentPricing();
  const techMaps = await getEquipmentTechMaps();
  const pricingMap = new Map(pricing.map((p) => [p.modelName, p]));

  return rows
    .sort((a, b) => a.제조사명.localeCompare(b.제조사명) || a.모델명.localeCompare(b.모델명))
    .map((r) => ({
      makerName: r.제조사명,
      name: r.모델명,
      series: r.시리즈 || null,
      keySpecs: r.주요사양,
      inspectionTypes: r.검사유형.split(",").map((s) => s.trim()).filter(Boolean),
      pricing: pricingMap.get(r.모델명) ?? null,
      technologies: techMaps.filter((t) => t.modelName === r.모델명),
    }));
}

// ===== INSPECTION-EQUIPMENT MAPPING =====

interface RawInspEquipMap {
  제품명: string;
  검사포인트: string;
  장비제조사: string;
  장비모델: string;
  적합도: string;
  비고: string;
}

export async function getInspectionEquipmentMaps(productName?: string): Promise<InspectionEquipmentMap[]> {
  const rows = await readSheet<RawInspEquipMap>("검사장비매핑");
  const filtered = productName ? rows.filter((r) => r.제품명 === productName) : rows;
  return filtered.map((r) => ({
    productName: r.제품명,
    inspectionPointName: r.검사포인트,
    makerName: r.장비제조사,
    modelName: r.장비모델,
    suitability: r.적합도,
    notes: r.비고 || null,
  }));
}

// ===== EQUIPMENT-TECH MAPPING =====

interface RawEquipTechMap {
  장비모델: string;
  기술명: string;
  활용수준: string;
  비고: string;
}

export async function getEquipmentTechMaps(): Promise<EquipmentTechMap[]> {
  const rows = await readSheet<RawEquipTechMap>("장비기술매핑");
  return rows.map((r) => ({
    modelName: r.장비모델,
    technologyName: r.기술명,
    utilizationLevel: r.활용수준,
    notes: r.비고 || null,
  }));
}

// ===== EQUIPMENT PRICING =====

interface RawEquipPricing {
  장비모델: string;
  시장가격USD: number;
  가격범위하한USD: number;
  가격범위상한USD: number;
  KY목표가격USD: number;
  KY목표근거: string;
  가격출처: string;
  추정여부: boolean;
}

export async function getEquipmentPricing(): Promise<EquipmentPricing[]> {
  const rows = await readSheet<RawEquipPricing>("장비가격");
  return rows.map((r) => ({
    modelName: r.장비모델,
    marketPriceUSD: r.시장가격USD,
    priceLowUSD: r.가격범위하한USD,
    priceHighUSD: r.가격범위상한USD,
    kyTargetPriceUSD: r.KY목표가격USD,
    kyTargetRationale: r.KY목표근거,
    priceSource: r.가격출처,
    isEstimated: r.추정여부 !== false,
  }));
}

// ===== KY PROPOSAL SPECS =====

interface RawKYProposalSpec {
  제품명: string;
  공정단계: string;
  검사포인트: string;
  스펙항목: string;
  시장요구스펙: string;
  KY현재스펙: string;
  KY목표스펙: string;
  달성전략: string;
  달성시기: string;
  근거: string;
}

export async function getKYProposalSpecs(productName?: string): Promise<KYProposalSpec[]> {
  const rows = await readSheet<RawKYProposalSpec>("KY제안스펙");
  const filtered = productName ? rows.filter((r) => r.제품명 === productName) : rows;
  return filtered.map((r) => ({
    productName: r.제품명,
    processStepName: r.공정단계,
    inspectionPointName: r.검사포인트,
    specItem: r.스펙항목,
    marketRequiredSpec: r.시장요구스펙,
    kyCurrentSpec: r.KY현재스펙,
    kyTargetSpec: r.KY목표스펙,
    achievementStrategy: r.달성전략,
    timeline: r.달성시기,
    rationale: r.근거,
  }));
}

// ===== TECHNOLOGIES =====

interface RawTech {
  기술명: string;
  카테고리: string;
  서브카테고리: string;
  설명: string;
  필요숙련도: number;
  비고: string;
  적용제품: string;
}

export async function getTechnologies(): Promise<Technology[]> {
  const rows = await readSheet<RawTech>("기술스택");
  const caps = await getKYCapabilities();
  const capMap = new Map(caps.map((c) => [c.technologyName, c]));
  const relations = await getTechRelations();
  const specs = await getTechSpecs();

  return rows
    .sort((a, b) => a.카테고리.localeCompare(b.카테고리) || a.기술명.localeCompare(b.기술명))
    .map((r) => ({
      name: r.기술명,
      category: r.카테고리,
      subcategory: r.서브카테고리,
      description: r.설명,
      requiredProficiency: difficultyStr(r.필요숙련도),
      notes: r.비고,
      applicableProducts: r.적용제품.split(",").map((s) => s.trim()).filter(Boolean),
      kyCapability: capMap.get(r.기술명) ?? null,
      relations: relations.filter((rel) => rel.technologyName === r.기술명 || rel.relatedTechnology === r.기술명),
      specs: specs.filter((s) => s.technologyName === r.기술명),
    }));
}

// ===== TECH RELATIONS =====

interface RawTechRelation {
  기술명: string;
  선행기술: string;
  관계유형: string;
  설명: string;
}

export async function getTechRelations(): Promise<TechRelation[]> {
  const rows = await readSheet<RawTechRelation>("기술상관관계");
  return rows.map((r) => ({
    technologyName: r.기술명,
    relatedTechnology: r.선행기술,
    relationType: r.관계유형,
    description: r.설명,
  }));
}

// ===== TECH SPECS =====

interface RawTechSpec {
  기술명: string;
  스펙항목: string;
  현재스펙: string;
  요구스펙: string;
  단위: string;
  충족여부: boolean;
}

export async function getTechSpecs(): Promise<TechSpec[]> {
  const rows = await readSheet<RawTechSpec>("기술스펙");
  return rows.map((r) => ({
    technologyName: r.기술명,
    specItem: r.스펙항목,
    currentSpec: r.현재스펙,
    requiredSpec: r.요구스펙,
    unit: r.단위,
    isMet: r.충족여부 !== false,
  }));
}

// ===== KY PRODUCTS =====

interface RawKYProduct {
  제품명: string;
  시리즈: string;
  카테고리: string;
  설명: string;
  주요사양: string;
  주검사유형: string;
  현재제품: boolean;
}

export async function getKYProducts(): Promise<KYProduct[]> {
  const rows = await readSheet<RawKYProduct>("KY제품");
  return rows
    .sort((a, b) => a.제품명.localeCompare(b.제품명))
    .map((r) => ({
      name: r.제품명,
      series: r.시리즈,
      category: r.카테고리,
      description: r.설명,
      keySpecs: r.주요사양,
      primaryInspectionType: r.주검사유형 || null,
      isCurrentProduct: r.현재제품 !== false,
    }));
}

// ===== KY CAPABILITIES =====

interface RawKYCap {
  기술명: string;
  현재수준: number;
  필요수준: number;
  Gap수준: string;
  Gap설명: string;
  개선계획: string;
}

export async function getKYCapabilities(): Promise<KYCapability[]> {
  const rows = await readSheet<RawKYCap>("KY역량분석");
  return rows.map((r) => ({
    technologyName: r.기술명,
    currentLevel: r.현재수준,
    requiredLevel: r.필요수준,
    gapLevel: r.Gap수준,
    gapDescription: r.Gap설명,
    improvementPlan: r.개선계획,
  }));
}

// ===== DEVELOPMENT PROJECTS =====

interface RawProject {
  프로젝트명: string;
  설명: string;
  난이도: number;
  최소기간: number;
  최대기간: number;
  시간구분: string;
  최소투자: number;
  최대투자: number;
  우선순위: string;
  상태: string;
  대상제품군: string;
  선행조건: string;
}

export async function getDevelopmentProjects(): Promise<DevelopmentProject[]> {
  const rows = await readSheet<RawProject>("개발로드맵");
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
  };
  return rows
    .sort((a, b) => (priorityOrder[a.우선순위] ?? 9) - (priorityOrder[b.우선순위] ?? 9))
    .map((r) => ({
      name: r.프로젝트명,
      description: r.설명,
      difficulty: difficultyStr(r.난이도),
      timelineMinMonths: r.최소기간,
      timelineMaxMonths: r.최대기간,
      timelineCategory: r.시간구분,
      investmentMinMKRW: r.최소투자,
      investmentMaxMKRW: r.최대투자,
      priority: r.우선순위,
      status: r.상태 || "PLANNED",
      targetFamilies: r.대상제품군.split(",").map((s) => s.trim()).filter(Boolean),
      prerequisites: r.선행조건,
    }));
}

// ===== STRATEGIC ACTIONS =====

interface RawAction {
  영역: string;
  시간구분: string;
  액션: string;
  설명: string;
  우선순위: string;
}

export async function getStrategicActions(): Promise<StrategicAction[]> {
  const rows = await readSheet<RawAction>("전략액션");
  const catOrder: Record<string, number> = {
    SHORT_TERM: 0, MID_TERM: 1, LONG_TERM: 2,
  };
  return rows
    .sort((a, b) => (catOrder[a.시간구분] ?? 9) - (catOrder[b.시간구분] ?? 9))
    .map((r) => ({
      area: r.영역,
      timelineCategory: r.시간구분,
      action: r.액션,
      description: r.설명,
      priority: r.우선순위,
    }));
}

// ===== DASHBOARD STATS =====

export async function getDashboardStats(): Promise<DashboardStats> {
  const products = await getProducts();
  const inspPoints = await getInspectionPoints();
  const models = await getEquipmentModels();
  const techs = await getTechnologies();
  const projects = await getDevelopmentProjects();
  const kyProducts = await getKYProducts();
  const caps = await getKYCapabilities();

  const typeCounts: Record<string, number> = {};
  for (const ip of inspPoints) {
    typeCounts[ip.inspectionType] = (typeCounts[ip.inspectionType] ?? 0) + 1;
  }
  const inspectionTypeDistribution = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, label: inspectionTypeLabel(type), count }))
    .sort((a, b) => b.count - a.count);

  const gapCounts: Record<string, number> = {};
  for (const c of caps) {
    gapCounts[c.gapLevel] = (gapCounts[c.gapLevel] ?? 0) + 1;
  }
  const gapDistribution = Object.entries(gapCounts).map(([level, count]) => ({
    level,
    count,
  }));

  const priCounts: Record<string, number> = {};
  for (const p of projects) {
    priCounts[p.priority] = (priCounts[p.priority] ?? 0) + 1;
  }
  const projectsByPriority = Object.entries(priCounts).map(
    ([priority, count]) => ({ priority, count })
  );

  const steps = await getProcessSteps();
  const stepsByProduct: Record<string, number> = {};
  const pointsByProduct: Record<string, number> = {};
  for (const s of steps) {
    stepsByProduct[s.productName] = (stepsByProduct[s.productName] ?? 0) + 1;
  }
  for (const ip of inspPoints) {
    pointsByProduct[ip.productName] = (pointsByProduct[ip.productName] ?? 0) + 1;
  }
  const coverageByProduct = products.map((p) => ({
    product: p.name,
    inspectionPointCount: pointsByProduct[p.name] ?? 0,
    processStepCount: stepsByProduct[p.name] ?? 0,
  }));

  return {
    kpis: {
      products: products.length,
      inspectionPoints: inspPoints.length,
      equipmentModels: models.length,
      technologies: techs.length,
      developmentProjects: projects.length,
      kyProducts: kyProducts.length,
    },
    inspectionTypeDistribution,
    gapDistribution,
    projectsByPriority,
    coverageByProduct,
    recentProjects: projects.slice(0, 5).map((p) => ({
      name: p.name,
      priority: p.priority,
      status: p.status,
      timelineCategory: p.timelineCategory,
    })),
  };
}

// ===== XLSX METADATA =====

const REQUIRED_SHEETS = [
  "제품", "공정단계", "검사포인트", "장비제조사", "장비모델",
  "기술스택", "KY제품", "KY역량분석", "개발로드맵", "전략액션",
  "기술상관관계", "기술스펙", "검사장비매핑", "장비기술매핑",
  "장비가격", "KY제안스펙",
];

export function invalidateCache(): void {
  cachedWorkbook = null;
  cachedMtime = 0;
}

export function validateXlsx(buffer: Buffer | ArrayBuffer): { valid: boolean; missing: string[] } {
  const wb = XLSX.read(buffer, { type: "array" });
  const missing = REQUIRED_SHEETS.filter((s) => !wb.SheetNames.includes(s));
  return { valid: missing.length === 0, missing };
}

export async function getXlsxMetadata(): Promise<{
  exists: boolean;
  sizeKB: number;
  lastModified: string;
  sheets: { name: string; rows: number }[];
}> {
  const fs = require("node:fs") as typeof import("fs");
  const path = require("node:path") as typeof import("path");
  const xlsxPath = path.join(process.cwd(), "data", "inspection-data.xlsx");

  if (!fs.existsSync(xlsxPath)) {
    return { exists: false, sizeKB: 0, lastModified: "", sheets: [] };
  }

  const stat = fs.statSync(xlsxPath);
  const wb = await loadWorkbook();
  const sheets = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws);
    return { name, rows: data.length };
  });

  return {
    exists: true,
    sizeKB: Math.round(stat.size / 1024),
    lastModified: stat.mtime.toISOString(),
    sheets,
  };
}

// ===== PRODUCT DETAIL =====

export async function getProductDetail(productName: string): Promise<ProductDetail | null> {
  const products = await getProducts();
  const product = products.find((p) => p.name === productName);
  if (!product) return null;

  const steps = await getProcessSteps(productName);
  const points = await getInspectionPoints(productName);
  const equipMaps = await getInspectionEquipmentMaps(productName);
  const proposalSpecs = await getKYProposalSpecs(productName);

  const stepsWithPoints = steps.map((step) => ({
    ...step,
    inspectionPoints: points
      .filter((ip) => ip.processStepName === step.name && ip.productName === productName)
      .map((ip) => ({
        ...ip,
        equipmentModels: equipMaps.filter((em) => em.inspectionPointName === ip.name),
        proposalSpecs: proposalSpecs.filter((ps) => ps.inspectionPointName === ip.name && ps.processStepName === step.name),
      })),
  }));

  return {
    ...product,
    processSteps: stepsWithPoints,
  };
}
