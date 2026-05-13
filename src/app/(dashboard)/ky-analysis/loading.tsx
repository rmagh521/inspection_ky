export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="h-10 w-72 animate-pulse rounded bg-muted" />
      <div className="h-[400px] animate-pulse rounded bg-muted" />
    </div>
  );
}
