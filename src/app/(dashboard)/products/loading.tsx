import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 animate-pulse rounded bg-muted mb-3" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
