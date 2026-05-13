export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="h-6 w-64 bg-muted animate-pulse rounded" />
      <div className="h-48 w-full bg-muted animate-pulse rounded" />
    </div>
  );
}
