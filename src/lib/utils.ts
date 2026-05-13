import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountMillions: number): string {
  if (amountMillions >= 10000) {
    return `${new Intl.NumberFormat("ko-KR").format(amountMillions / 10000)}조원`;
  }
  return `${new Intl.NumberFormat("ko-KR").format(amountMillions)}백만원`;
}

export function formatInvestmentRange(minMKRW: number | null, maxMKRW: number | null): string {
  if (!minMKRW && !maxMKRW) return "-";
  const fmt = (v: number) => `₩${new Intl.NumberFormat("ko-KR").format(v * 100)}만`;
  if (minMKRW && maxMKRW) return `${fmt(minMKRW)} ~ ${fmt(maxMKRW)}`;
  return fmt(minMKRW ?? maxMKRW!);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function difficultyToStars(level: string): number {
  const map: Record<string, number> = {
    LEVEL_1: 1, LEVEL_2: 2, LEVEL_3: 3, LEVEL_4: 4, LEVEL_5: 5,
  };
  return map[level] ?? 0;
}

export function gapLevelToColor(level: string): string {
  const map: Record<string, string> = {
    NONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    SMALL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    MEDIUM: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    LARGE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return map[level] ?? "bg-gray-100 text-gray-800";
}

export function strategicPositionLabel(position: string): string {
  const map: Record<string, string> = {
    MARKET_LEADER: "시장 선도", STRONG_CONTENDER: "강력 경쟁", DEVELOPING: "개발 중",
    NOT_PRESENT: "미진입", GAP: "Gap",
  };
  return map[position] ?? position;
}

export function priorityToColor(priority: string): string {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  return map[priority] ?? "bg-gray-100 text-gray-800";
}

export function inspectionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    SPI: "3D SPI", PRE_REFLOW_AOI: "Pre-Reflow AOI", POST_REFLOW_AOI: "Post-Reflow AOI",
    XRAY_2D: "X-ray 2D", XRAY_3D: "X-ray 3D/CT", WAFER_INSPECTION: "Wafer Inspection",
    CD_METROLOGY: "CD Metrology", OVERLAY_METROLOGY: "Overlay Metrology",
    TSV_INSPECTION: "TSV Inspection", BUMP_INSPECTION: "Bump Inspection",
    DIE_ATTACH_INSPECTION: "Die Attach", WIRE_BOND_INSPECTION: "Wire Bond",
    UNDERFILL_INSPECTION: "Underfill", MOLD_INSPECTION: "Mold Inspection",
    BALL_ATTACH_INSPECTION: "Ball Attach", SURFACE_INSPECTION: "Surface Inspection",
    MARKING_INSPECTION: "Marking", ALIGNMENT_INSPECTION: "Alignment",
    THICKNESS_METROLOGY: "Thickness Metrology", SAT_INSPECTION: "SAT (Acoustic)",
    SURFACE_ROUGHNESS_METROLOGY: "Surface Roughness", CONTINUITY_TEST: "Electrical Continuity",
    BOND_QUALITY_INSPECTION: "Bond Quality", WARPAGE_METROLOGY: "Warpage Metrology",
    OPTICAL_ALIGNMENT_INSPECTION: "Optical Alignment", TIM_INSPECTION: "TIM Inspection",
    SINTER_JOINT_INSPECTION: "Sinter Joint",
    OTHER: "Other",
  };
  return map[type] ?? type;
}
