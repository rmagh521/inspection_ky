import { getInspectionPoints, getProducts } from "@/lib/xlsx-data";
import { Badge } from "@/components/ui/badge";
import { inspectionTypeLabel, difficultyToStars } from "@/lib/utils";
import { InspectionPointsTable } from "./inspection-points-table";

export default async function InspectionPointsPage() {
  const inspectionPoints = await getInspectionPoints();
  const products = await getProducts();
  const familyMap: Record<string, string> = {};
  for (const p of products) {
    familyMap[p.name] = p.family;
  }

  const tableData = inspectionPoints.map((ip) => ({
    id: `${ip.productName}::${ip.name}`,
    name: ip.name,
    purpose: ip.purpose,
    inspectionType: ip.inspectionType,
    inspectionTypeLabel: inspectionTypeLabel(ip.inspectionType),
    difficulty: ip.difficulty,
    difficultyStars: difficultyToStars(ip.difficulty),
    failureImpact: ip.failureImpact,
    productName: ip.productName,
    productFamily: familyMap[ip.productName] ?? "",
    processStepName: ip.processStepName,
    processStepOrder: ip.processStepOrder,
    resolutionSpec: ip.resolutionSpec,
    precisionSpec: ip.precisionSpec,
    speedSpec: ip.speedSpec,
    fovSpec: ip.fovSpec,
    keyEquipmentType: ip.keyEquipmentType,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">검사 포인트</h2>
        <Badge variant="secondary">{inspectionPoints.length}개</Badge>
      </div>
      <InspectionPointsTable data={tableData} />
    </div>
  );
}
