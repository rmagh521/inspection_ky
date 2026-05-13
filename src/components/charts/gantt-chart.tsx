"use client";

import { useState } from "react";
import { cn, formatInvestmentRange, difficultyToStars } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { priorityToColor } from "@/lib/utils";
import type { DevelopmentProject } from "@/types/data";

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

const MAX_MONTHS = 36;

export function GanttChart({ projects }: { projects: DevelopmentProject[] }) {
  const [selectedProject, setSelectedProject] = useState<DevelopmentProject | null>(null);
  const months = Array.from({ length: MAX_MONTHS }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {Object.entries(PRIORITY_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1">
            <span className={cn("h-2.5 w-2.5 rounded-sm", color)} />
            {level}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex border-b pb-1 mb-2">
            <div className="w-48 shrink-0 text-xs font-medium text-muted-foreground">
              프로젝트
            </div>
            <div className="flex-1 flex">
              {months.map((m) => (
                <div
                  key={m}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {m % 6 === 0 ? `${m}M` : ""}
                </div>
              ))}
            </div>
          </div>

          {projects.map((project) => (
            <div
              key={project.name}
              className="flex items-center py-1.5 cursor-pointer hover:bg-accent/50 rounded-sm transition-colors"
              onClick={() => setSelectedProject(project)}
            >
              <div className="w-48 shrink-0 text-xs truncate pr-2">
                {project.name}
              </div>
              <div className="flex-1 flex items-center relative h-5">
                {months.map((m) => (
                  <div
                    key={m}
                    className={cn(
                      "flex-1 h-full border-l",
                      m % 6 === 0
                        ? "border-muted-foreground/20"
                        : "border-transparent"
                    )}
                  />
                ))}
                <div
                  className={cn(
                    "absolute h-4 rounded-sm opacity-80 hover:opacity-100 transition-opacity",
                    PRIORITY_COLORS[project.priority] ?? "bg-gray-400"
                  )}
                  style={{
                    left: `${((project.timelineMinMonths - 1) / MAX_MONTHS) * 100}%`,
                    width: `${((project.timelineMaxMonths - project.timelineMinMonths + 1) / MAX_MONTHS) * 100}%`,
                  }}
                  title={`${project.name}: ${project.timelineMinMonths}-${project.timelineMaxMonths}개월`}
                />
              </div>
            </div>
          ))}

          <div className="flex border-t mt-2 pt-1">
            <div className="w-48 shrink-0" />
            <div className="flex-1 flex">
              {["단기 (0-12M)", "중기 (12-24M)", "장기 (24-36M)"].map(
                (label) => (
                  <div
                    key={label}
                    className="flex-1 text-center text-[10px] text-muted-foreground border-l border-muted-foreground/20 first:border-l-0"
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
              <DialogDescription>{selectedProject.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={priorityToColor(selectedProject.priority)} variant="secondary">
                  {selectedProject.priority}
                </Badge>
                <Badge variant="outline">{selectedProject.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">기간:</span>{" "}
                  {selectedProject.timelineMinMonths}-{selectedProject.timelineMaxMonths}개월
                </div>
                <div>
                  <span className="text-muted-foreground">구분:</span>{" "}
                  {selectedProject.timelineCategory}
                </div>
                <div>
                  <span className="text-muted-foreground">투자:</span>{" "}
                  {formatInvestmentRange(
                    selectedProject.investmentMinMKRW,
                    selectedProject.investmentMaxMKRW
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">난이도:</span>{" "}
                  {"★".repeat(difficultyToStars(selectedProject.difficulty))}
                  {"☆".repeat(5 - difficultyToStars(selectedProject.difficulty))}
                </div>
              </div>
              {selectedProject.targetFamilies.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">대상 제품군:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProject.targetFamilies.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedProject.prerequisites && (
                <div>
                  <span className="text-sm text-muted-foreground">선행조건:</span>
                  <p className="text-sm mt-1">{selectedProject.prerequisites}</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
