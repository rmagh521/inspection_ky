"use client";

import { cn } from "@/lib/utils";

interface ProcessStep {
  stepOrder: number;
  name: string;
  requiresInspection: boolean;
  inspectionPoints: { name: string }[];
}

interface ProcessFlowDiagramProps {
  steps: ProcessStep[];
}

export function ProcessFlowDiagram({ steps }: ProcessFlowDiagramProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={`${step.stepOrder}-${step.name}`} className="flex items-center shrink-0">
          <div
            className={cn(
              "relative flex flex-col items-center rounded-lg border px-3 py-2 text-center min-w-[100px]",
              step.requiresInspection
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 bg-muted/50"
            )}
          >
            <span className="text-[10px] font-bold text-muted-foreground">
              #{step.stepOrder}
            </span>
            <span className="text-xs font-medium mt-0.5 leading-tight">
              {step.name}
            </span>
            {step.inspectionPoints.length > 0 && (
              <span className="mt-1 text-[10px] text-primary font-medium">
                검사 {step.inspectionPoints.length}건
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-muted-foreground/40">
              <path d="M4 10 L16 10 M12 6 L16 10 L12 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
