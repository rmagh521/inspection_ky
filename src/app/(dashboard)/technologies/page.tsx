import { getTechnologies } from "@/lib/xlsx-data";
import { TechnologiesClient } from "./technologies-client";

export default async function TechnologiesPage() {
  const technologies = await getTechnologies();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">핵심 기술 목록</h2>
      <TechnologiesClient technologies={technologies} />
    </div>
  );
}
