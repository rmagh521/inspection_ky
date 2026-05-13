export interface Product {
  name: string;
  family: string;
  generation: string | null;
  description: string;
  isActive: boolean;
  sortOrder: number;
  processStepCount?: number;
}

export interface ProcessStep {
  productName: string;
  stepOrder: number;
  name: string;
  description: string;
  requiresInspection: boolean;
  inspectionPoints?: InspectionPoint[];
}

export interface InspectionPoint {
  productName: string;
  processStepName: string;
  processStepOrder: number;
  name: string;
  purpose: string | null;
  inspectionType: string;
  difficulty: string;
  failureImpact: string;
  criticalityNote: string | null;
  resolutionSpec: string | null;
  precisionSpec: string | null;
  speedSpec: string | null;
  fovSpec: string | null;
  keyEquipmentType: string | null;
}

export interface EquipmentMaker {
  name: string;
  country: string;
  website: string;
  description: string;
  models?: EquipmentModel[];
}

export interface EquipmentModel {
  makerName: string;
  name: string;
  series: string | null;
  keySpecs: string;
  inspectionTypes: string[];
}

export interface TechRelation {
  technologyName: string;
  relatedTechnology: string;
  relationType: string;
  description: string;
}

export interface TechSpec {
  technologyName: string;
  specItem: string;
  currentSpec: string;
  requiredSpec: string;
  unit: string;
  isMet: boolean;
}

export interface Technology {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  requiredProficiency: string;
  notes: string;
  applicableProducts: string[];
  kyCapability?: KYCapability | null;
  relations?: TechRelation[];
  specs?: TechSpec[];
}

export interface KYProduct {
  name: string;
  series: string;
  category: string;
  description: string;
  keySpecs: string;
  primaryInspectionType: string | null;
  isCurrentProduct: boolean;
}

export interface KYCapability {
  technologyName: string;
  currentLevel: number;
  requiredLevel: number;
  gapLevel: string;
  gapDescription: string;
  improvementPlan: string;
}

export interface DevelopmentProject {
  name: string;
  description: string;
  difficulty: string;
  timelineMinMonths: number;
  timelineMaxMonths: number;
  timelineCategory: string;
  investmentMinMKRW: number;
  investmentMaxMKRW: number;
  priority: string;
  status: string;
  targetFamilies: string[];
  prerequisites: string;
  dependencies?: string[];
}

export interface StrategicAction {
  area: string;
  timelineCategory: string;
  action: string;
  description: string;
  priority: string;
  relatedProjectName?: string | null;
}

export interface DashboardStats {
  kpis: {
    products: number;
    inspectionPoints: number;
    equipmentModels: number;
    technologies: number;
    developmentProjects: number;
    kyProducts: number;
  };
  inspectionTypeDistribution: { type: string; label: string; count: number }[];
  gapDistribution: { level: string; count: number }[];
  projectsByPriority: { priority: string; count: number }[];
  coverageByProduct: { product: string; inspectionPointCount: number; processStepCount: number }[];
  recentProjects: {
    name: string;
    priority: string;
    status: string;
    timelineCategory: string;
  }[];
}

export interface ProductDetail extends Product {
  processSteps: (ProcessStep & { inspectionPoints: InspectionPoint[] })[];
}
