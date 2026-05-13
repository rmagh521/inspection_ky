import {
  getProducts,
  getInspectionPoints,
  getProcessSteps,
  getDashboardStats,
  getKYCapabilities,
  getDevelopmentProjects,
} from "@/lib/xlsx-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  inspectionTypeLabel,
  gapLevelToColor,
  priorityToColor,
  formatInvestmentRange,
} from "@/lib/utils";
import { PrintButton } from "./print-button";

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const products = await getProducts();
  const steps = await getProcessSteps();
  const inspPoints = await getInspectionPoints();
  const capabilities = await getKYCapabilities();
  const projects = await getDevelopmentProjects();

  const stepCounts: Record<string, number> = {};
  const pointCounts: Record<string, number> = {};
  for (const s of steps) stepCounts[s.productName] = (stepCounts[s.productName] ?? 0) + 1;
  for (const ip of inspPoints) pointCounts[ip.productName] = (pointCounts[ip.productName] ?? 0) + 1;

  const totalMinInvestment = projects.reduce((s, p) => s + p.investmentMinMKRW, 0);
  const totalMaxInvestment = projects.reduce((s, p) => s + p.investmentMaxMKRW, 0);

  const gapSorted = [...capabilities].sort(
    (a, b) => (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel)
  );

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">통합 보고서</h2>
        <PrintButton />
      </div>

      {/* KPI Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">1. KPI 요약</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 print:grid-cols-6">
          {Object.entries(stats.kpis).map(([key, value]) => {
            const labels: Record<string, string> = {
              products: "제품군",
              inspectionPoints: "검사 포인트",
              equipmentModels: "장비 모델",
              technologies: "핵심 기술",
              developmentProjects: "개발 프로젝트",
              kyProducts: "KY 제품",
            };
            return (
              <Card key={key} className="print:border print:shadow-none">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{labels[key]}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Product Coverage */}
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          2. 제품별 검사 커버리지
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">제품명</th>
                <th className="text-left py-2 px-3 font-medium">제품군</th>
                <th className="text-center py-2 px-3 font-medium">공정단계</th>
                <th className="text-center py-2 px-3 font-medium">검사포인트</th>
                <th className="text-center py-2 px-3 font-medium">세대</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.name} className="border-b">
                  <td className="py-2 px-3 font-medium">{p.name}</td>
                  <td className="py-2 px-3">{p.family}</td>
                  <td className="py-2 px-3 text-center">{stepCounts[p.name] ?? 0}</td>
                  <td className="py-2 px-3 text-center">{pointCounts[p.name] ?? 0}</td>
                  <td className="py-2 px-3 text-center">{p.generation ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gap Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          3. KY 기술 Gap 요약
        </h3>
        <div className="grid gap-2 md:grid-cols-4 print:grid-cols-4 mb-4">
          {stats.gapDistribution.map((g) => {
            const labels: Record<string, string> = {
              NONE: "Gap 없음", SMALL: "소규모", MEDIUM: "중규모", LARGE: "대규모",
            };
            return (
              <Card key={g.level} className="print:border print:shadow-none">
                <CardContent className="pt-4 text-center">
                  <Badge className={gapLevelToColor(g.level)} variant="secondary">
                    {labels[g.level] ?? g.level}
                  </Badge>
                  <div className="text-xl font-bold mt-1">{g.count}개</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">기술명</th>
                <th className="text-center py-2 px-3 font-medium">현재</th>
                <th className="text-center py-2 px-3 font-medium">필요</th>
                <th className="text-center py-2 px-3 font-medium">Gap</th>
                <th className="text-left py-2 px-3 font-medium">Gap 수준</th>
              </tr>
            </thead>
            <tbody>
              {gapSorted.map((c) => (
                <tr key={c.technologyName} className="border-b">
                  <td className="py-2 px-3 font-medium">{c.technologyName}</td>
                  <td className="py-2 px-3 text-center">{c.currentLevel}</td>
                  <td className="py-2 px-3 text-center">{c.requiredLevel}</td>
                  <td className="py-2 px-3 text-center">
                    {c.requiredLevel - c.currentLevel}
                  </td>
                  <td className="py-2 px-3">
                    <Badge className={gapLevelToColor(c.gapLevel)} variant="secondary">
                      {c.gapLevel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Roadmap Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          4. 로드맵 / 투자 요약
        </h3>
        <div className="grid gap-3 md:grid-cols-3 print:grid-cols-3 mb-4">
          <Card className="print:border print:shadow-none">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{projects.length}개</div>
              <div className="text-xs text-muted-foreground">총 프로젝트</div>
            </CardContent>
          </Card>
          <Card className="print:border print:shadow-none">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{totalMinInvestment.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">최소 투자 (백만원)</div>
            </CardContent>
          </Card>
          <Card className="print:border print:shadow-none">
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{totalMaxInvestment.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">최대 투자 (백만원)</div>
            </CardContent>
          </Card>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">프로젝트명</th>
                <th className="text-center py-2 px-3 font-medium">우선순위</th>
                <th className="text-center py-2 px-3 font-medium">상태</th>
                <th className="text-center py-2 px-3 font-medium">기간</th>
                <th className="text-right py-2 px-3 font-medium">투자금</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.name} className="border-b">
                  <td className="py-2 px-3 font-medium">{p.name}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge className={priorityToColor(p.priority)} variant="secondary">
                      {p.priority}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant="outline">{p.status}</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {p.timelineMinMonths}-{p.timelineMaxMonths}개월
                  </td>
                  <td className="py-2 px-3 text-right">
                    {formatInvestmentRange(p.investmentMinMKRW, p.investmentMaxMKRW)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inspection Type Distribution */}
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          5. 검사 유형 분포
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">검사 유형</th>
                <th className="text-center py-2 px-3 font-medium">코드</th>
                <th className="text-center py-2 px-3 font-medium">포인트 수</th>
              </tr>
            </thead>
            <tbody>
              {stats.inspectionTypeDistribution.map((d) => (
                <tr key={d.type} className="border-b">
                  <td className="py-2 px-3">{d.label}</td>
                  <td className="py-2 px-3 text-center font-mono text-xs">{d.type}</td>
                  <td className="py-2 px-3 text-center font-bold">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

