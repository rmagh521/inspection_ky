import { getDevelopmentProjects, getStrategicActions } from "@/lib/xlsx-data";
import { RoadmapClient } from "./roadmap-client";

export default async function RoadmapPage() {
  const projects = await getDevelopmentProjects();
  const strategicActions = await getStrategicActions();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">개발 로드맵</h2>
      <RoadmapClient projects={projects} strategicActions={strategicActions} />
    </div>
  );
}
