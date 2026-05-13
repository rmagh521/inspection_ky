import { getProductDetail } from "@/lib/xlsx-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { difficultyToStars, inspectionTypeLabel } from "@/lib/utils";
import { ProcessFlowDiagram } from "@/components/charts/process-flow-diagram";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const productName = decodeURIComponent(name);
  const product = await getProductDetail(productName);

  if (!product) notFound();

  const totalInspectionPoints = product.processSteps.reduce(
    (sum, step) => sum + step.inspectionPoints.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <Badge variant="outline">{product.family}</Badge>
        {product.generation && (
          <Badge variant="secondary">{product.generation}</Badge>
        )}
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground max-w-2xl">
          {product.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{product.processSteps.length}</div>
            <p className="text-xs text-muted-foreground">공정 단계</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalInspectionPoints}</div>
            <p className="text-xs text-muted-foreground">검사 포인트</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {product.processSteps.filter((s) => s.requiresInspection).length}
            </div>
            <p className="text-xs text-muted-foreground">검사 필요 공정</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">공정 흐름도</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessFlowDiagram steps={product.processSteps} />
        </CardContent>
      </Card>

      <Separator />

      <h3 className="text-lg font-semibold">공정 단계 상세</h3>
      <div className="space-y-4">
        {product.processSteps.map((step) => (
          <Card key={`${step.stepOrder}-${step.name}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {step.stepOrder}
                </span>
                <CardTitle className="text-sm">{step.name}</CardTitle>
                {step.requiresInspection && (
                  <Badge variant="default" className="text-xs">검사 필요</Badge>
                )}
              </div>
            </CardHeader>
            {step.inspectionPoints.length > 0 && (
              <CardContent>
                <div className="space-y-3">
                  {step.inspectionPoints.map((ip) => (
                    <div key={ip.name} className="rounded-md border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{ip.name}</span>
                        <div className="flex items-center gap-2">
                          {ip.keyEquipmentType && (
                            <Badge variant="secondary" className="text-[10px]">
                              {ip.keyEquipmentType}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {inspectionTypeLabel(ip.inspectionType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            난이도: {"★".repeat(difficultyToStars(ip.difficulty))}
                            {"☆".repeat(5 - difficultyToStars(ip.difficulty))}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{ip.purpose}</p>
                      {(ip.resolutionSpec || ip.precisionSpec || ip.speedSpec || ip.fovSpec) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t">
                          {ip.resolutionSpec && (
                            <span className="text-[11px]">
                              <span className="text-muted-foreground">해상도:</span> {ip.resolutionSpec}
                            </span>
                          )}
                          {ip.precisionSpec && (
                            <span className="text-[11px]">
                              <span className="text-muted-foreground">정밀도:</span> {ip.precisionSpec}
                            </span>
                          )}
                          {ip.speedSpec && (
                            <span className="text-[11px]">
                              <span className="text-muted-foreground">속도:</span> {ip.speedSpec}
                            </span>
                          )}
                          {ip.fovSpec && (
                            <span className="text-[11px]">
                              <span className="text-muted-foreground">FOV:</span> {ip.fovSpec}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
