import { getEquipmentMakers } from "@/lib/xlsx-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MakersPage() {
  const makers = await getEquipmentMakers();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">장비 메이커</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {makers.map((maker) => (
          <Card key={maker.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{maker.name}</CardTitle>
                <Badge variant="outline">{maker.country}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {maker.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {maker.description}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                등록 모델: {(maker.models ?? []).length}개
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
